"use client";

import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import {
  Camera,
  Check,
  Download,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";
import {
  MAKEUP_PARTS,
  MAKEUP_PRESETS,
  type MakeupConfig,
  type MakeupLayer,
  type MakeupPart,
  type SourceMode
} from "@/lib/makeup";
import { renderMakeup, type FaceLandmark } from "@/lib/virtual-renderer";
import { currentToolPath, navigateToLogin, subscribeToLocation } from "@/lib/auth-return";
import { consumeMakeupDraft, readMakeupDraft, saveMakeupDraft, validDraftPhoto } from "@/lib/makeup-draft";
import { generationMessage } from "@/lib/generation-session";
import { useGenerationStatus } from "@/hooks/use-generation-status";
import { BeforeAfterSlider } from "./before-after-slider";

const PART_NAMES: Record<MakeupPart, { en: string; "zh-CN": string }> = {
  lipstick: { en: "Lipstick", "zh-CN": "口红" },
  foundation: { en: "Foundation", "zh-CN": "粉底" },
  blush: { en: "Blush", "zh-CN": "腮红" },
  eyeshadow: { en: "Eyeshadow", "zh-CN": "眼影" },
  eyeliner: { en: "Eyeliner", "zh-CN": "眼线" },
  mascara: { en: "Mascara", "zh-CN": "睫毛" },
  brows: { en: "Brows", "zh-CN": "眉毛" },
  contour: { en: "Contour", "zh-CN": "修容" },
  highlight: { en: "Highlight", "zh-CN": "高光" }
};

function translated(locale: Locale, en: string, zh: string) {
  return locale === "zh-CN" ? zh : en;
}

function defaultLayer(part: MakeupPart, enabled: boolean): MakeupLayer {
  const preset = MAKEUP_PRESETS[part][0];
  return { enabled, presetId: preset.id, color: preset.color, intensity: 60 };
}

function initialConfig(focusedPart: MakeupPart): MakeupConfig {
  return Object.fromEntries(
    MAKEUP_PARTS.map((part) => [part, defaultLayer(part, part === focusedPart)])
  ) as MakeupConfig;
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("canvas_export_failed"))), "image/png", 0.95);
  });
}

async function uploadBlob(blob: Blob, filename: string, signal: AbortSignal): Promise<string> {
  const sign = await fetch("/api/uploads/sign", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: blob.type || "image/png",
      contentLength: blob.size,
      filename
    })
  });
  if (sign.status === 401) throw new Error("auth_required");
  if (!sign.ok) {
    const payload = await sign.json().catch(() => ({}));
    throw new Error(payload.code ?? "upload_sign_failed");
  }
  const { uploadUrl, uploadKey } = (await sign.json()) as {
    uploadUrl: string;
    uploadKey: string;
  };
  const uploaded = await fetch(uploadUrl, {
    method: "PUT",
    signal,
    headers: { "Content-Type": blob.type || "image/png" },
    body: blob
  });
  if (!uploaded.ok) throw new Error("upload_failed");
  return uploadKey;
}

export function VirtualTryOn({
  locale,
  focusedPart = "lipstick"
}: Readonly<{ locale: Locale; focusedPart?: MakeupPart }>) {
  const [activePart, setActivePart] = useState<MakeupPart>(focusedPart);
  const [config, setConfig] = useState<MakeupConfig>(() => initialConfig(focusedPart));
  const [sourceMode, setSourceMode] = useState<SourceMode>("upload");
  const [modelState, setModelState] = useState<"loading" | "ready" | "failed">("loading");
  const [faceState, setFaceState] = useState<"empty" | "ready" | "none" | "multiple">("empty");
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const path = useSyncExternalStore(subscribeToLocation, currentToolPath, () => "");
  const query = useGenerationStatus("virtual_try_on", path);
  const [uploading, setUploading] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const result = query.phase === "done" ? query.result : null;
  const isBusy = uploading || query.phase === "loading" || query.phase === "querying";
  const hasPending = query.phase === "paused" || query.phase === "auth";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const sourceFileRef = useRef<File | null>(null);
  const landmarksRef = useRef<FaceLandmark[] | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const landmarkerPromiseRef = useRef<Promise<FaceLandmarker> | null>(null);
  const runningModeRef = useRef<"IMAGE" | "VIDEO">("IMAGE");
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastDetectionRef = useRef(0);
  const configRef = useRef(config);
  const aliveRef = useRef(true);
  const photoRevisionRef = useRef(0);
  const pendingImageRef = useRef<{ image: HTMLImageElement; url: string; cancel: () => void } | null>(null);
  const submitControllerRef = useRef<AbortController | null>(null);
  const submittingRef = useRef(false);

  configRef.current = config;
  const activeLayer = config[activePart] ?? defaultLayer(activePart, false);
  const isChinese = locale === "zh-CN";

  async function getLandmarker() {
    if (landmarkerRef.current) return landmarkerRef.current;
    if (!landmarkerPromiseRef.current) {
      landmarkerPromiseRef.current = import("@mediapipe/tasks-vision")
        .then(async ({ FaceLandmarker, FilesetResolver }) => {
          const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
          try {
            return await FaceLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: "/mediapipe/models/face_landmarker.task",
                delegate: "GPU"
              },
              runningMode: "IMAGE",
              numFaces: 2,
              minFaceDetectionConfidence: 0.6,
              minFacePresenceConfidence: 0.6,
              minTrackingConfidence: 0.55
            });
          } catch {
            return FaceLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetPath: "/mediapipe/models/face_landmarker.task" },
              runningMode: "IMAGE",
              numFaces: 2
            });
          }
        })
        .then((landmarker) => {
          if (!aliveRef.current) { landmarker.close(); throw new Error("model_unmounted"); }
          landmarkerRef.current = landmarker;
          setModelState("ready");
          return landmarker;
        })
        .catch((modelError) => {
          landmarkerPromiseRef.current = null;
          if (aliveRef.current) setModelState("failed");
          throw modelError;
        });
    }
    return landmarkerPromiseRef.current;
  }

  async function setRunningMode(mode: "IMAGE" | "VIDEO") {
    const landmarker = await getLandmarker();
    if (runningModeRef.current !== mode) {
      await landmarker.setOptions({ runningMode: mode });
      runningModeRef.current = mode;
    }
    return landmarker;
  }

  function setDetectedFaces(faces: FaceLandmark[][]) {
    if (faces.length === 1) {
      landmarksRef.current = faces[0];
      setFaceState("ready");
    } else {
      landmarksRef.current = null;
      setFaceState(faces.length > 1 ? "multiple" : "none");
    }
  }

  function drawStill() {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    if (landmarksRef.current) {
      renderMakeup(context, landmarksRef.current, configRef.current, canvas.width, canvas.height);
    }
  }

  async function loadPhoto(file: File): Promise<boolean> {
    if (!validDraftPhoto(file)) { setError(translated(locale, "Use a JPG, PNG or WebP photo up to 12MB.", "请使用不超过 12MB 的 JPG、PNG 或 WebP 照片。")); return false; }
    const revision = ++photoRevisionRef.current;
    pendingImageRef.current?.cancel();
    setPhotoLoading(true); setFaceState("empty");
    stopCamera(); setSourceMode("upload"); setError(null); sourceFileRef.current = file;
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    return new Promise<boolean>((resolve) => {
      let settled = false;
      const isCurrent = () => !settled && aliveRef.current && photoRevisionRef.current === revision;
      const timeout = setTimeout(() => { if (isCurrent()) setError(translated(locale, "Photo loading timed out. Please try again.", "照片加载超时，请重试。")); finish(false); }, 10000);
      const finish = (loaded: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        image.onload = null; image.onerror = null; URL.revokeObjectURL(objectUrl);
        if (aliveRef.current && photoRevisionRef.current === revision) setPhotoLoading(false);
        if (pendingImageRef.current?.image === image) pendingImageRef.current = null;
        resolve(loaded);
      };
      pendingImageRef.current = { image, url: objectUrl, cancel: () => finish(false) };
      image.onload = async () => {
        if (!isCurrent()) { finish(false); return; }
        try {
          const maxDimension = 2048;
          const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = canvasRef.current;
          if (!canvas) { finish(false); return; }
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const landmarker = await setRunningMode("IMAGE");
          if (!isCurrent()) { finish(false); return; }
          imageRef.current = image;
          setDetectedFaces(landmarker.detect(image).faceLandmarks as FaceLandmark[][]);
          drawStill(); finish(true);
        } catch {
          if (isCurrent()) setError(translated(locale, "Face detection could not start. Retry restoration or select a photo again.", "人脸识别未能启动，可重试恢复或重新选图。"));
          finish(false);
        }
      };
      image.onerror = () => {
        if (isCurrent()) setError(translated(locale, "Could not read this image.", "无法读取这张图片。"));
        finish(false);
      };
      image.src = objectUrl;
    });
  }

  function stopCamera() {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function startCamera() {
    setError(null);
    if (isBusy) return;
    photoRevisionRef.current++;
    pendingImageRef.current?.cancel();
    setPhotoLoading(false); setRestoreFailed(false); setDraftNotice(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(translated(locale, "Camera is unavailable. Upload a photo instead.", "当前浏览器不支持摄像头，请上传照片。"));
      return;
    }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      if (!aliveRef.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      streamRef.current = stream;
      setSourceMode("camera");
      sourceFileRef.current = null;
      imageRef.current = null;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      await setRunningMode("VIDEO");
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const renderFrame = () => {
        const context = canvas.getContext("2d");
        if (!context || video.readyState < 2) {
          animationRef.current = requestAnimationFrame(renderFrame);
          return;
        }
        context.save();
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.restore();

        const now = performance.now();
        if (now - lastDetectionRef.current >= 66 && landmarkerRef.current) {
          lastDetectionRef.current = now;
          const detection = landmarkerRef.current.detectForVideo(video, now);
          const mirrored = (detection.faceLandmarks as FaceLandmark[][]).map((face) =>
            face.map((landmark) => ({ ...landmark, x: 1 - landmark.x }))
          );
          setDetectedFaces(mirrored);
        }
        if (landmarksRef.current) {
          renderMakeup(context, landmarksRef.current, configRef.current, canvas.width, canvas.height);
        }
        animationRef.current = requestAnimationFrame(renderFrame);
      };
      renderFrame();
    } catch {
      stopCamera();
      setSourceMode("upload");
      setError(translated(locale, "Camera permission was denied. Upload a photo instead.", "摄像头权限未开启，请改为上传照片。"));
    }
  }

  function updateLayer(update: Partial<MakeupLayer>) {
    setConfig((current) => ({
      ...current,
      [activePart]: { ...(current[activePart] ?? defaultLayer(activePart, false)), ...update }
    }));
  }

  async function sourceBlobForExport(): Promise<Blob> {
    if (sourceMode === "upload" && sourceFileRef.current) return sourceFileRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) throw new Error("camera_frame_missing");
    const raw = document.createElement("canvas");
    raw.width = canvas.width;
    raw.height = canvas.height;
    const context = raw.getContext("2d");
    if (!context) throw new Error("canvas_unavailable");
    context.translate(raw.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, raw.width, raw.height);
    return canvasBlob(raw);
  }

  async function loginWithDraft(source?: Blob) {
    try {
      const photo = source ?? (sourceFileRef.current || (faceState === "ready" ? await sourceBlobForExport() : null));
      if (photo) await saveMakeupDraft({ version: 1, id: crypto.randomUUID(), tool: "virtual_try_on", path: path || currentToolPath(), at: Date.now(), source: photo, config: configRef.current });
      stopCamera();
      navigateToLogin(path || currentToolPath());
    } catch {
      setError(translated(locale, "Could not save your photo draft. Stay here and retry sign-in; your preview is still on this page.", "照片草稿保存失败，请留在此页重试登录；当前预览仍在页面中。"));
    }
  }

  async function exportLook() {
    if (submittingRef.current || isBusy || photoLoading || hasPending || uncertain) return;
    const canvas = canvasRef.current;
    if (!canvas || faceState !== "ready") { setError(translated(locale, "Add one clear front-facing face first.", "请先使用一张清晰单人正脸照片。")); return; }
    if (!Object.values(config).some((layer) => layer?.enabled)) { setError(translated(locale, "Enable at least one makeup effect.", "请至少开启一个妆效。")); return; }
    if (!consent) { setError(translated(locale, "Confirm the photo processing notice first.", "请先确认照片处理说明。")); return; }
    submittingRef.current = true; setError(null); setDownloadError(null); setUploading(true);
    const controller = new AbortController(); submitControllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 60000);
    let submitted = false;
    let source: Blob | undefined;
    try {
      source = await sourceBlobForExport();
      const balanceResponse = await fetch("/api/credits/balance", { signal: controller.signal, cache: "no-store" });
      if (balanceResponse.status === 401) { await loginWithDraft(source); return; }
      if (!balanceResponse.ok) throw new Error("balance_unavailable");
      const { balance } = await balanceResponse.json();
      if (typeof balance !== "number" || balance < 1) { setError(translated(locale, "Not enough credits. Check your balance before generating.", "额度不足，请先查看余额并补充额度。")); return; }
      const renderedBlob = await canvasBlob(canvas);
      const [uploadKey, renderedUploadKey] = await Promise.all([
        uploadBlob(source, sourceMode === "camera" ? "camera-source.png" : sourceFileRef.current?.name ?? "source.png", controller.signal),
        uploadBlob(renderedBlob, "virtual-try-on.png", controller.signal)
      ]);
      submitted = true;
      const response = await fetch("/api/makeup/generate", {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadKey, renderedUploadKey, consent: true, mode: "virtual_try_on", sourceMode, makeupConfig: config, locale })
      });
      if (response.status === 401) { submitted = false; await loginWithDraft(source); return; }
      if (!response.ok) {
        if (response.status >= 500) throw new Error("uncertain_submission");
        submitted = false;
        setError(translated(locale, "Could not start generation. Check your credits before trying a new request.", "生成请求未能启动，请检查额度后手动发起新请求。")); return;
      }
      const { generationId } = await response.json();
      if (typeof generationId !== "string" || !/^[\w-]{1,128}$/.test(generationId)) throw new Error("missing_generation_id");
      const description = MAKEUP_PARTS.filter((part) => config[part]?.enabled).map((part) => `${PART_NAMES[part][locale]} ${config[part]!.intensity}%`).join(" · ");
      query.start({ version: 1, generationId, tool: "virtual_try_on", path, createdAt: Date.now(), style: { id: "virtual-custom", name: translated(locale, "Custom makeup", "自定义妆容"), description } });
    } catch (exportError) {
      if (submitted) setUncertain(true);
      else if (exportError instanceof Error && exportError.message === "auth_required") await loginWithDraft(source);
      else setError(translated(locale, "Could not check your balance or upload the photo. Please try again.", "余额检查或照片上传失败，请稍后重试。"));
    } finally { clearTimeout(timeout); submittingRef.current = false; setUploading(false); }
  }

  async function downloadResult() {
    if (!result?.resultUrl || downloading) return;
    setDownloading(true); setDownloadError(null);
    let objectUrl: string | null = null;
    try {
      const response = await fetch(result.resultUrl);
      if (!response.ok) throw new Error("download_failed");
      const blob = await response.blob();
      const extension = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[blob.type];
      if (!extension || blob.size === 0) throw new Error("invalid_image");
      objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = objectUrl; link.download = `virtual-makeup-result.${extension}`;
      document.body.appendChild(link); link.click(); link.remove();
    } catch { setDownloadError(translated(locale, "Could not download the image. Retry download without generating again.", "图片下载失败，请重试下载，无需重新生成。")); }
    finally { if (objectUrl) { const url = objectUrl; setTimeout(() => URL.revokeObjectURL(url), 1000); } setDownloading(false); }
  }

  function cancelPhotoLoad() { photoRevisionRef.current++; pendingImageRef.current?.cancel(); }

  useEffect(() => {
    aliveRef.current = true;
    void getLandmarker().catch(() => { /* 状态区展示模型加载失败，保留草稿供重试。 */ });
    return () => {
      aliveRef.current = false; cancelPhotoLoad(); stopCamera();
      submitControllerRef.current?.abort();
      if (landmarkerRef.current) { landmarkerRef.current.close(); landmarkerRef.current = null; landmarkerPromiseRef.current = null; }
    };
    // 模型由当前组件的 ref 管理，只在挂载和卸载时初始化与释放。
  }, []);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    cancelPhotoLoad();
    let revision = photoRevisionRef.current;
    const isCurrent = () => !cancelled && aliveRef.current && revision === photoRevisionRef.current;
    void (async () => {
      try {
        const read = await readMakeupDraft("virtual_try_on", path);
        if (!isCurrent()) return;
        if (read.kind === "none") return;
        if (read.kind !== "ready" || read.draft.tool !== "virtual_try_on") { setDraftNotice(translated(locale, "The photo draft expired or is invalid. Please select your photo again.", "照片草稿已过期或损坏，请重新选图。")); return; }
        const draft = read.draft;
        setConsent(false); setConfig(draft.config); configRef.current = draft.config;
        const loading = loadPhoto(new File([draft.source], "restored-try-on", { type: draft.source.type }));
        revision = photoRevisionRef.current;
        const loaded = await loading;
        if (!isCurrent()) return;
        if (!loaded) { setRestoreFailed(true); setDraftNotice(translated(locale, "Saved photo could not load. The draft was kept; retry restoration or choose a new photo.", "保存的照片加载失败，草稿仍保留；可重试恢复或重新选图。")); return; }
        setRestoreFailed(false); setDraftNotice(translated(locale, "Photo and settings restored. Review consent before creating an HD result.", "照片与局部设置已恢复，生成高清结果前请重新确认同意。"));
        try { await consumeMakeupDraft(draft); }
        catch { if (isCurrent()) setDraftNotice(translated(locale, "Photo restored, but the saved copy could not be removed. It may reappear on refresh.", "照片已恢复，但保存的副本未能删除，刷新后可能再次恢复。")); }
      } catch {
        if (isCurrent()) { setRestoreFailed(true); setDraftNotice(translated(locale, "Could not read the photo draft. Retry restoration or choose a photo again.", "无法读取照片草稿，可重试恢复或重新选图。")); }
      }
    })();
    return () => { if (isCurrent()) cancelPhotoLoad(); cancelled = true; };
    // 恢复只由路径和用户重试触发，不随局部妆效变化重新执行。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, restoreAttempt, locale]);

  useEffect(() => {
    if (sourceMode === "upload") drawStill();
    // 绘制读取最新 ref，只有视觉设置或照片来源变化时重绘。
  }, [config, sourceMode]);

  const faceMessage = useMemo(() => {
    if (faceState === "ready") return translated(locale, "One face detected — ready to try on.", "已识别单人正脸，可以开始试妆。" );
    if (faceState === "multiple") return translated(locale, "Use a photo with one person only.", "请使用只有一人的照片。" );
    if (faceState === "none") return translated(locale, "No clear front-facing face detected.", "未识别到清晰正脸。" );
    return translated(locale, "Your preview stays on this device until HD export.", "高清生成前，预览仅在本机处理。" );
  }, [faceState, locale]);

  return (
    <section className="tryon-studio" id="try" aria-label={translated(locale, "Virtual makeup studio", "实时虚拟试妆台")}>
      <div className="tryon-mirror">
        <div className="tryon-source-switch" aria-label={translated(locale, "Choose photo source", "选择照片来源")}>
          <button className={sourceMode === "upload" ? "source-button active" : "source-button"} type="button" disabled={isBusy} onClick={() => fileInputRef.current?.click()}>
            <ImagePlus size={17} aria-hidden="true" /> {translated(locale, "Upload photo", "上传照片")}
          </button>
          <button className={sourceMode === "camera" ? "source-button active" : "source-button"} type="button" disabled={isBusy} onClick={() => void startCamera()}>
            <Camera size={17} aria-hidden="true" /> {translated(locale, "Live camera", "实时摄像头")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file && !isBusy) { setRestoreFailed(false); setDraftNotice(null); void loadPhoto(file); }
            }}
          />
        </div>

        <div className="tryon-canvas-wrap">
          <video ref={videoRef} muted playsInline hidden />
          <canvas ref={canvasRef} className="tryon-canvas" width={960} height={720} />
          {faceState === "empty" ? (
            <button className="mirror-empty" type="button" disabled={isBusy} onClick={() => fileInputRef.current?.click()}>
              <span className="mirror-number">01</span>
              <ImagePlus size={36} aria-hidden="true" />
              <strong>{translated(locale, "Place a clear selfie at the counter", "放入一张清晰正脸自拍")}</strong>
              <span>{translated(locale, "Upload JPG, PNG or WebP — or open the camera", "上传 JPG、PNG、WebP，或打开摄像头")}</span>
            </button>
          ) : null}
        </div>
        <div className={`face-status ${faceState === "ready" ? "ready" : ""}`}>
          {modelState === "loading" ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : modelState === "ready" && faceState === "ready" ? <Check size={16} aria-hidden="true" /> : null}
          {modelState === "failed" ? translated(locale, "Face model failed to load.", "人脸模型加载失败。") : faceMessage}
        </div>
      </div>

      <div className="tryon-counter">
        <div className="counter-heading">
          <span>02 / {translated(locale, "Build the look", "搭配妆效")}</span>
          <button type="button" className="text-button" onClick={() => setConfig(initialConfig(focusedPart))}>
            <RotateCcw size={15} aria-hidden="true" /> {translated(locale, "Reset all", "全部重置")}
          </button>
        </div>

        <div className="part-tabs" role="tablist" aria-label={translated(locale, "Makeup parts", "妆容部位")}>
          {MAKEUP_PARTS.map((part) => (
            <button
              key={part}
              type="button"
              role="tab"
              aria-selected={activePart === part}
              className={activePart === part ? "part-tab active" : "part-tab"}
              onClick={() => setActivePart(part)}
            >
              <span className="part-dot" style={{ background: config[part]?.color ?? MAKEUP_PRESETS[part][0].color }} />
              {PART_NAMES[part][locale]}
              {config[part]?.enabled ? <Check size={13} aria-hidden="true" /> : null}
            </button>
          ))}
        </div>

        <div className="shade-tray">
          <div className="shade-title">
            <div>
              <span>{PART_NAMES[activePart][locale]}</span>
              <strong>{translated(locale, "Choose a finish", "选择效果")}</strong>
            </div>
            <label className="effect-toggle">
              <input type="checkbox" checked={activeLayer.enabled} onChange={(event) => updateLayer({ enabled: event.target.checked })} />
              {translated(locale, "Enabled", "已开启")}
            </label>
          </div>
          <div className="swatch-row">
            {MAKEUP_PRESETS[activePart].map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={activeLayer.presetId === preset.id ? "swatch active" : "swatch"}
                aria-label={preset.name[locale]}
                onClick={() => updateLayer({ enabled: true, presetId: preset.id, color: preset.color })}
              >
                <span style={{ background: preset.color }} />
                <small>{preset.name[locale]}</small>
              </button>
            ))}
          </div>
          <label className="intensity-control">
            <span>{translated(locale, "Intensity", "妆效强度")} <strong>{activeLayer.intensity}%</strong></span>
            <input type="range" min="0" max="100" value={activeLayer.intensity} onChange={(event) => updateLayer({ intensity: Number(event.target.value), enabled: true })} />
          </label>
        </div>

        <label className="privacy-consent">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>{translated(locale, "I am 18+ and agree to upload this frame only when creating the HD result.", "我已年满 18 岁，并同意仅在生成高清结果时上传当前画面。")}</span>
        </label>

        {error ? <p className="tool-error" role="alert">{error}</p> : null}
        {generationMessage(locale, query.phase, query.reason) ? <p className="tool-error" role="alert">{generationMessage(locale, query.phase, query.reason)}</p> : null}
        {query.session ? <p className="tool-note">{translated(locale, "Original task", "原任务")}：{query.session.generationId}</p> : null}
        {query.storageWarning && query.reason !== "storage" ? <p className="tool-note" role="status">{translated(locale, "Task recovery storage is unavailable. Check history before resubmitting after refresh.", "任务恢复存储不可用，刷新后请先查看历史记录再决定是否提交新任务。")}</p> : null}
        {hasPending ? <div className="generation-actions">
          {query.phase === "auth" ? <button className="ghost-button" type="button" onClick={() => void loginWithDraft()}>{translated(locale, "Sign in to continue", "登录继续")}</button> : <button className="ghost-button" type="button" onClick={query.resume}>{translated(locale, "Continue checking original task", "继续查询原任务")}</button>}
          <button className="text-button" type="button" onClick={() => query.reset()}>{translated(locale, "Choose a new generation · credit rules apply", "选择新生成 · 沿用额度规则")}</button>
        </div> : null}
        {uncertain ? <div className="generation-notice" role="alert">
          <p>{translated(locale, "The submission response was lost. A task may already exist. Check history before starting another generation; this page will not resubmit automatically.", "提交响应丢失，任务可能已经创建。请先查看历史记录再决定是否新生成；页面不会自动重复提交。")}</p>
          <Link className="ghost-button" href="/dashboard">{translated(locale, "Check history", "查看历史记录")}</Link>
          <button className="text-button" type="button" onClick={() => setUncertain(false)}>{translated(locale, "Choose a new generation · credit rules apply", "选择新生成 · 沿用额度规则")}</button>
        </div> : null}
        {draftNotice ? <p className="tool-note" role="status">{draftNotice}</p> : null}
        {restoreFailed ? <button className="ghost-button" type="button" onClick={() => { cancelPhotoLoad(); setRestoreAttempt((value) => value + 1); }}>{translated(locale, "Retry draft restoration", "重试恢复草稿")}</button> : null}

        <p className="tool-note">{translated(locale, "Local live preview is free. HD generation requires sign-in and uses 1 account credit.", "本地实时预览免费，高清生成需登录并使用 1 个账户额度。")}</p>
        <button className="generate-look-button" type="button" disabled={isBusy || photoLoading || hasPending || uncertain || restoreFailed} onClick={() => { if (!query.session || query.reset()) void exportLook(); }}>
          {isBusy ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
          {uploading ? translated(locale, "Uploading…", "上传中…") : query.phase === "querying" ? translated(locale, "Creating HD result…", "正在生成高清结果…") : query.session ? translated(locale, "Generate new result · 1 credit", "生成新结果 · 1 credit") : translated(locale, "Create HD result · 1 credit", "生成高清结果 · 1 credit")}
        </button>

        {result?.status === "done" && result.resultUrl ? (
          <div className="tryon-result">
            <h3>{query.session?.style.name}</h3>
            <p>{query.session?.style.description}</p>
            {result.beforeUrl ? (
              <BeforeAfterSlider
                beforeUrl={result.beforeUrl}
                afterUrl={result.resultUrl}
                beforeLabel={translated(locale, "Before", "妆前")}
                afterLabel={translated(locale, "After", "妆后")}
              />
            ) : null}
            {downloadError ? <p className="tool-error" role="alert">{downloadError}</p> : null}
            <button className="download-result" type="button" disabled={downloading} onClick={() => void downloadResult()}>
              <Download size={17} aria-hidden="true" /> {downloading ? translated(locale, "Downloading…", "下载中…") : translated(locale, "Download HD result", "下载高清结果")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
