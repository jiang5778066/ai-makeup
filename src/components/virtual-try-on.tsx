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
import { useEffect, useMemo, useRef, useState } from "react";
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

type ExportStatus = "idle" | "uploading" | "queued" | "running" | "done" | "failed";

type GenerationResult = {
  id: string;
  status: "queued" | "moderating" | "running" | "done" | "failed" | "refunded";
  resultUrl: string | null;
  beforeUrl: string | null;
  error: string | null;
};

type PendingDraft = {
  source: Blob;
  config: MakeupConfig;
  at: number;
};

function openDraftDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("makeup-ai", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("drafts")) {
        request.result.createObjectStore("drafts");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePendingDraft(draft: PendingDraft) {
  const database = await openDraftDatabase();
  if (!database) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("drafts", "readwrite");
    transaction.objectStore("drafts").put(draft, "pending");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function takePendingDraft(): Promise<PendingDraft | null> {
  const database = await openDraftDatabase();
  if (!database) return null;
  const draft = await new Promise<PendingDraft | null>((resolve, reject) => {
    const transaction = database.transaction("drafts", "readwrite");
    const store = transaction.objectStore("drafts");
    const request = store.get("pending");
    request.onsuccess = () => {
      store.delete("pending");
      resolve((request.result as PendingDraft | undefined) ?? null);
    };
    request.onerror = () => reject(request.error);
  });
  database.close();
  return draft && Date.now() - draft.at <= 30 * 60 * 1000 ? draft : null;
}

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

async function uploadBlob(blob: Blob, filename: string): Promise<string> {
  const sign = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: blob.type || "image/png",
      contentLength: blob.size,
      filename
    })
  });
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
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);

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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          landmarkerRef.current = landmarker;
          setModelState("ready");
          return landmarker;
        })
        .catch((modelError) => {
          setModelState("failed");
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

  async function loadPhoto(file: File) {
    stopCamera();
    setSourceMode("upload");
    setError(null);
    setResult(null);
    setExportStatus("idle");
    sourceFileRef.current = file;
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = async () => {
      try {
        const maxDimension = 2048;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        imageRef.current = image;
        const landmarker = await setRunningMode("IMAGE");
        const detection = landmarker.detect(image);
        setDetectedFaces(detection.faceLandmarks as FaceLandmark[][]);
        drawStill();
      } catch {
        setError(translated(locale, "Face detection could not start.", "人脸识别未能启动。"));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError(translated(locale, "Could not read this image.", "无法读取这张图片。"));
    };
    image.src = objectUrl;
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
    setResult(null);
    setExportStatus("idle");
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

  function pollGeneration(generationId: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const response = await fetch(`/api/generations/${generationId}`);
      if (!response.ok) return;
      const payload = (await response.json()) as GenerationResult;
      setResult(payload);
      if (payload.status === "done") {
        setExportStatus("done");
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (payload.status === "failed" || payload.status === "refunded") {
        setExportStatus("failed");
        setError(
          payload.error ?? translated(locale, "Export failed and your credit was returned.", "生成失败，credit 已退回。")
        );
        if (pollRef.current) clearInterval(pollRef.current);
      } else {
        setExportStatus("running");
      }
    }, 2000);
  }

  async function exportLook() {
    const canvas = canvasRef.current;
    if (!canvas || faceState !== "ready") {
      setError(translated(locale, "Add one clear front-facing face first.", "请先使用一张清晰单人正脸照片。"));
      return;
    }
    if (!Object.values(config).some((layer) => layer?.enabled)) {
      setError(translated(locale, "Enable at least one makeup effect.", "请至少开启一个妆效。"));
      return;
    }
    if (!consent) {
      setError(translated(locale, "Confirm the photo processing notice first.", "请先确认照片处理说明。"));
      return;
    }
    setError(null);
    setExportStatus("uploading");
    try {
      const sourceBlob = await sourceBlobForExport();
      const balanceResponse = await fetch("/api/credits/balance");
      if (balanceResponse.status === 401) {
        await savePendingDraft({ source: sourceBlob, config, at: Date.now() }).catch(() => undefined);
        sessionStorage.setItem("makeup-pending-config", JSON.stringify({ config, at: Date.now() }));
        window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}#try`);
        return;
      }
      if (!balanceResponse.ok) throw new Error("balance_unavailable");
      const { balance } = (await balanceResponse.json()) as { balance: number };
      if (balance < 1) throw new Error(translated(locale, "No credits left. Buy the $8 pack to continue.", "credits 已用完，请购买 $8 额度包。"));

      const renderedBlob = await canvasBlob(canvas);
      const [uploadKey, renderedUploadKey] = await Promise.all([
        uploadBlob(sourceBlob, sourceMode === "camera" ? "camera-source.png" : sourceFileRef.current?.name ?? "source.png"),
        uploadBlob(renderedBlob, "virtual-try-on.png")
      ]);
      const response = await fetch("/api/makeup/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadKey,
          renderedUploadKey,
          consent: true,
          mode: "virtual_try_on",
          sourceMode,
          makeupConfig: config,
          locale
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? payload.code ?? "generation_failed");
      }
      const { generationId } = (await response.json()) as { generationId: string };
      setExportStatus("queued");
      pollGeneration(generationId);
    } catch (exportError) {
      setExportStatus("failed");
      setError(exportError instanceof Error ? exportError.message : "export_failed");
    }
  }

  // Restoring a draft must run once; loadPhoto intentionally reads the initial locale/model lifecycle.
  useEffect(() => {
    void getLandmarker().then(async () => {
      const draft = await takePendingDraft().catch(() => null);
      if (!draft) return;
      setConfig(draft.config);
      await loadPhoto(new File([draft.source], "restored-try-on.png", { type: draft.source.type || "image/png" }));
    });
    return () => {
      stopCamera();
      if (pollRef.current) clearInterval(pollRef.current);
      landmarkerRef.current?.close();
    };
    // The model is initialized once and refs own its lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sourceMode === "upload") drawStill();
    // drawStill reads the latest refs and should rerun only for visual settings.
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
          <button className={sourceMode === "upload" ? "source-button active" : "source-button"} type="button" onClick={() => fileInputRef.current?.click()}>
            <ImagePlus size={17} aria-hidden="true" /> {translated(locale, "Upload photo", "上传照片")}
          </button>
          <button className={sourceMode === "camera" ? "source-button active" : "source-button"} type="button" onClick={() => void startCamera()}>
            <Camera size={17} aria-hidden="true" /> {translated(locale, "Live camera", "实时摄像头")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void loadPhoto(file);
            }}
          />
        </div>

        <div className="tryon-canvas-wrap">
          <video ref={videoRef} muted playsInline hidden />
          <canvas ref={canvasRef} className="tryon-canvas" width={960} height={720} />
          {faceState === "empty" ? (
            <button className="mirror-empty" type="button" onClick={() => fileInputRef.current?.click()}>
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

        <button className="generate-look-button" type="button" disabled={exportStatus === "uploading" || exportStatus === "queued" || exportStatus === "running"} onClick={() => void exportLook()}>
          {exportStatus === "uploading" || exportStatus === "queued" || exportStatus === "running" ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
          {exportStatus === "uploading"
            ? translated(locale, "Uploading…", "上传中…")
            : exportStatus === "queued" || exportStatus === "running"
              ? translated(locale, "Creating HD result…", "正在生成高清结果…")
              : translated(locale, "Create HD result · 1 credit", "生成高清结果 · 1 credit")}
        </button>

        {result?.status === "done" && result.resultUrl ? (
          <div className="tryon-result">
            {result.beforeUrl ? (
              <BeforeAfterSlider
                beforeUrl={result.beforeUrl}
                afterUrl={result.resultUrl}
                beforeLabel={translated(locale, "Before", "妆前")}
                afterLabel={translated(locale, "After", "妆后")}
              />
            ) : null}
            <a className="download-result" href={result.resultUrl} target="_blank" rel="noopener noreferrer">
              <Download size={17} aria-hidden="true" /> {translated(locale, "Download HD result", "下载高清结果")}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
