"use client";

import { Download, ImagePlus, RefreshCw, ShieldCheck, WandSparkles, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";
import type { MakeupStyle } from "@/lib/content";
import { currentToolPath, navigateToLogin, subscribeToLocation } from "@/lib/auth-return";
import { consumeMakeupDraft, readMakeupDraft, saveMakeupDraft, type MakeupDraft } from "@/lib/makeup-draft";
import { generationMessage } from "@/lib/generation-session";
import { useGenerationStatus } from "@/hooks/use-generation-status";
import { BeforeAfterSlider } from "./before-after-slider";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

function t(locale: Locale, en: string, zh: string) {
  return locale === "zh-CN" ? zh : en;
}

export function MakeupTool({
  locale,
  styles,
  cta
}: Readonly<{ locale: Locale; styles: MakeupStyle[]; cta: string }>) {
  const [styleId, setStyleId] = useState(styles[0]?.id ?? "natural");
  const [intensity, setIntensity] = useState(62);
  const [consent, setConsent] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const path = useSyncExternalStore(subscribeToLocation, currentToolPath, () => "");
  const query = useGenerationStatus("full_face", path);
  const [uploading, setUploading] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDraftRef = useRef<MakeupDraft | null>(null);
  const editingRef = useRef(0);
  const submittingRef = useRef(false);
  const submitControllerRef = useRef<AbortController | null>(null);
  const result = query.phase === "done" ? query.result : null;
  const resultStyleId = query.session?.style.id;
  const isBusy = uploading || query.phase === "loading" || query.phase === "querying";
  const hasPending = query.phase === "paused" || query.phase === "auth";

  useEffect(() => () => { editingRef.current++; submitControllerRef.current?.abort(); }, []);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    const revision = ++editingRef.current;
    const isCurrent = () => !cancelled && editingRef.current === revision;
    void readMakeupDraft("full_face", path).then((read) => {
      if (!isCurrent()) return;
      if (read.kind === "none") return;
      if (read.kind !== "ready" || read.draft.tool !== "full_face" || !styles.some((style) => style.id === (read.draft as Extract<MakeupDraft, { tool: "full_face" }>).styleId)) {
        setDraftNotice(t(locale, "The photo draft expired or is invalid. Please select your photo again.", "照片草稿已过期或损坏，请重新选图。")); return;
      }
      const draft = read.draft;
      pendingDraftRef.current = draft; setRestoring(true);
      setStyleId(draft.styleId); setIntensity(draft.intensity); setConsent(false);
      setFile(new File([draft.source], "restored-selfie", { type: draft.source.type }));
      setPreviewUrl(URL.createObjectURL(draft.source));
      setRestoreFailed(false);
      setDraftNotice(t(locale, "Loading your saved photo. Review consent before generating.", "正在加载已保存的照片，生成前请重新确认同意。"));
    }).catch(() => {
      if (!isCurrent()) return;
      setRestoreFailed(true);
      setDraftNotice(t(locale, "Could not read the photo draft. Retry restoration or select a photo again.", "无法读取照片草稿，可重试恢复或重新选图。"));
    });
    return () => { cancelled = true; };
  }, [path, restoreAttempt, locale, styles]);

  async function photoLoaded() {
    const draft = pendingDraftRef.current;
    if (!draft) return;
    const revision = editingRef.current;
    pendingDraftRef.current = null; setRestoring(false);
    setDraftNotice(t(locale, "Photo and settings restored. Review consent and generate when ready.", "照片与设置已恢复，请重新确认同意后手动生成。"));
    try { await consumeMakeupDraft(draft); }
    catch { if (editingRef.current === revision) setDraftNotice(t(locale, "Photo restored, but the saved copy could not be removed. It may reappear on refresh.", "照片已恢复，但保存的副本未能删除，刷新后可能再次恢复。")); }
  }

  const photoLoadFailed = useCallback(() => {
    if (!pendingDraftRef.current) return;
    setRestoring(false); setRestoreFailed(true); setConsent(false); setFile(null); setPreviewUrl(null);
    setDraftNotice(t(locale, "Could not load the saved photo. The draft was kept; retry restoration or choose a new image.", "保存的照片加载失败，草稿仍保留；可重试恢复或重新选图。"));
  }, [locale]);
  useEffect(() => {
    if (!restoring) return;
    const timeout = setTimeout(photoLoadFailed, 10000);
    return () => clearTimeout(timeout);
  }, [restoring, previewUrl, photoLoadFailed]);

  function pickFile(next: File | null) {
    if (isBusy || !next) return;
    if (!ALLOWED_MIME.includes(next.type) || next.size === 0) { setErrorMessage(t(locale, "Use a JPG, PNG, or WebP image.", "请使用 JPG、PNG 或 WebP 格式。")); return; }
    if (next.size > MAX_BYTES) { setErrorMessage(t(locale, "Image must be 12MB or smaller.", "图片需小于 12MB。")); return; }
    editingRef.current++; pendingDraftRef.current = null; setRestoring(false);
    setErrorMessage(null); setDraftNotice(null); setRestoreFailed(false); setDownloadError(null);
    setFile(next); setPreviewUrl(URL.createObjectURL(next));
  }

  function clearFile() {
    if (isBusy) return;
    editingRef.current++; pendingDraftRef.current = null; setRestoring(false);
    setErrorMessage(null); setDownloadError(null); setDraftNotice(null);
    setFile(null); setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function loginWithDraft() {
    if (file) {
      try {
        await saveMakeupDraft({ version: 1, id: crypto.randomUUID(), tool: "full_face", path: path || currentToolPath(), at: Date.now(), source: file, styleId, intensity });
      } catch {
        setErrorMessage(t(locale, "Could not save your photo draft. Stay here and retry sign-in; your photo is still on this page.", "照片草稿保存失败，请留在此页重试登录；当前照片仍在页面中。")); return;
      }
    }
    navigateToLogin(path || currentToolPath());
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    pickFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function uploadOriginal(currentFile: File, signal: AbortSignal): Promise<string> {
    const signResponse = await fetch("/api/uploads/sign", {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: currentFile.type,
        contentLength: currentFile.size,
        filename: currentFile.name
      })
    });

    if (signResponse.status === 401) throw new Error("auth_required");
    if (!signResponse.ok) {
      const payload = await signResponse.json().catch(() => ({}));
      throw new Error(payload.code ?? "sign_failed");
    }

    const { uploadUrl, uploadKey } = (await signResponse.json()) as {
      uploadUrl: string;
      uploadKey: string;
    };

    const putResponse = await fetch(uploadUrl, {
      method: "PUT",
      signal,
      headers: { "Content-Type": currentFile.type },
      body: currentFile
    });
    if (!putResponse.ok) throw new Error("upload_failed");

    return uploadKey;
  }

  async function generate() {
    if (submittingRef.current || isBusy || restoring || hasPending || uncertain || !file || !consent) return;
    submittingRef.current = true;
    setErrorMessage(null); setDownloadError(null); setUploading(true);
    const controller = new AbortController(); submitControllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 60000);
    let submitted = false;
    try {
      const balance = await fetch("/api/credits/balance", { signal: controller.signal, cache: "no-store" });
      if (balance.status === 401) { await loginWithDraft(); return; }
      if (!balance.ok) throw new Error("balance_unavailable");
      const credits = (await balance.json()).balance;
      if (typeof credits !== "number" || credits < 1) { setErrorMessage(t(locale, "Not enough credits. Check your balance before generating.", "额度不足，请先查看余额并补充额度。")); return; }
      const uploadKey = await uploadOriginal(file, controller.signal);
      submitted = true;
      const response = await fetch("/api/makeup/generate", {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styleId, intensity, locale, uploadKey, consent })
      });
      if (response.status === 401) { submitted = false; await loginWithDraft(); return; }
      if (!response.ok) {
        if (response.status >= 500) throw new Error("uncertain_submission");
        submitted = false;
        setErrorMessage(t(locale, "Could not start generation. Check your credits and try a new request when ready.", "生成请求未能启动，请检查额度后手动发起新请求。")); return;
      }
      const { generationId } = await response.json();
      if (typeof generationId !== "string" || !/^[\w-]{1,128}$/.test(generationId)) throw new Error("missing_generation_id");
      const selected = styles.find((style) => style.id === styleId) ?? styles[0];
      query.start({ version: 1, generationId, tool: "full_face", path, createdAt: Date.now(), style: { id: selected.id, name: selected.name, description: selected.description } });
    } catch (error) {
      if (submitted) setUncertain(true);
      else if (error instanceof Error && error.message === "auth_required") await loginWithDraft();
      else if (!controller.signal.aborted) setErrorMessage(t(locale, "Could not check your balance or upload the photo. Please try again.", "余额检查或照片上传失败，请稍后重试。"));
      else setErrorMessage(t(locale, "The request was cancelled or timed out. Please try again.", "请求已取消或超时，请稍后重试。"));
    } finally { clearTimeout(timeout); submittingRef.current = false; setUploading(false); }
  }

  async function downloadResult() {
    if (!result?.resultUrl || isDownloading) return;
    setIsDownloading(true);
    setDownloadError(null);
    let objectUrl: string | null = null;
    try {
      const response = await fetch(result.resultUrl);
      if (!response.ok) throw new Error("download_failed");
      const blob = await response.blob();
      const extension = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[blob.type];
      if (!extension || blob.size === 0) throw new Error("invalid_image");
      objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `ai-makeup-result.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setDownloadError(t(locale, "Could not download the image. Please try again.", "图片下载失败，请重试。"));
    } finally {
      if (objectUrl) {
        const completedUrl = objectUrl;
        setTimeout(() => URL.revokeObjectURL(completedUrl), 1000);
      }
      setIsDownloading(false);
    }
  }

  const buttonLabel = uploading ? t(locale, "Uploading...", "上传中...")
    : query.phase === "querying" ? t(locale, "Generating...", "生成中...")
    : query.session ? t(locale, "Generate new result · 1 credit", "生成新结果 · 1 credit") : cta;
  const queryMessage = generationMessage(locale, query.phase, query.reason);

  return (
    <div className="tool-card" id="try">
      <div className="makeup-controls">
        <h2 className="tool-section-title">{t(locale, "Upload photo", "上传图片")}</h2>
        <div
          className="upload-zone"
          aria-label={t(locale, "Selfie upload area", "上传自拍区域")}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onClick={() => { if (!isBusy) fileInputRef.current?.click(); }}
          role="button"
          aria-disabled={isBusy}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (!isBusy && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          {previewUrl ? (
            <div style={{ position: "relative", width: "100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                onLoad={() => void photoLoaded()}
                onError={photoLoadFailed}
                alt={t(locale, "Selected selfie preview", "已选择的自拍预览")}
                style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 6 }}
              />
              <button
                type="button"
                className="ghost-button"
                onClick={(event) => {
                  if (isBusy) return;
                  event.stopPropagation();
                  clearFile();
                }}
                style={{ position: "absolute", top: 8, right: 8 }}
                disabled={isBusy}
                aria-label={t(locale, "Remove image", "移除图片")}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div>
              <ImagePlus size={34} aria-hidden="true" />
              <strong>{t(locale, "Upload a clear front-facing selfie", "上传一张清晰正脸自拍")}</strong>
              <span>{t(locale, "JPG, PNG, or WebP up to 12MB", "JPG、PNG 或 WebP，最多 12MB")}</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            disabled={isBusy}
            accept={ALLOWED_MIME.join(",")}
            style={{ display: "none" }}
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <h2 className="tool-section-title">{t(locale, "Choose a style", "选择风格")}</h2>
        <p className="template-asset-note">{t(locale, "AI-generated style illustrations, not actual try-on results.", "AI 虚拟人物妆容示意，非真实试妆效果。")}</p>
        <div className="chips" aria-label={t(locale, "Makeup styles", "妆容风格")}>
          {styles.map((style) => (
            <button
              className={style.id === styleId ? "chip active" : "chip"}
              key={style.id}
              type="button"
              title={`${style.name} · ${style.description}`}
              aria-pressed={style.id === styleId}
              onClick={() => setStyleId(style.id)}
              disabled={isBusy}
            >
              <Image className="style-portrait" src={`/images/makeup-demo/${style.id}.webp`} alt={t(locale, `${style.name} style illustration`, `${style.name}妆容示意`)} width={192} height={288} sizes="(max-width: 800px) 22vw, 84px" />
              <span>{style.name}</span>
            </button>
          ))}
        </div>

        <label className="slider-row">
          <span>
            {t(locale, "Makeup intensity", "妆容强度")} · {intensity}%
          </span>
          <input
            min="20"
            max="100"
            value={intensity}
            type="range"
            onChange={(event) => setIntensity(Number(event.target.value))}
            disabled={isBusy}
          />
        </label>

        <label className="privacy-consent">
          <input
            type="checkbox"
            disabled={isBusy}
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            style={{ marginTop: 4 }}
          />
          <span>
            {t(
              locale,
              "I agree to processing of my photo for makeup generation, and confirm I am 18 or older.",
              "我同意上传照片用于妆容生成，并确认本人已年满 18 岁。"
            )}
          </span>
        </label>

        <button
          className="button generate-button"
          type="button"
          onClick={() => { if (!query.session || query.reset()) void generate(); }}
          disabled={isBusy || restoring || hasPending || uncertain || !file || !consent || restoreFailed || restoring}
        >
          {isBusy ? <RefreshCw size={17} aria-hidden="true" /> : <WandSparkles size={17} aria-hidden="true" />}
          {buttonLabel}
        </button>

        {hasPending ? <div className="generation-actions">
          {query.phase === "auth" ? <button className="ghost-button" type="button" onClick={() => void loginWithDraft()}>{t(locale, "Sign in to continue", "登录继续")}</button>
            : <button className="ghost-button" type="button" onClick={query.resume}>{t(locale, "Continue checking original task", "继续查询原任务")}</button>}
          <button className="text-button" type="button" onClick={() => { if (query.reset()) setErrorMessage(null); }}>{t(locale, "Choose a new generation · credit rules apply", "选择新生成 · 沿用额度规则")}</button>
        </div> : null}
        {queryMessage ? <p className="tool-error" role="alert">{queryMessage}</p> : null}
        {query.session ? <p className="tool-note">{t(locale, "Original task", "原任务")}：{query.session.generationId}</p> : null}
        {query.storageWarning && query.reason !== "storage" ? <p className="tool-note" role="status">{t(locale, "Task recovery storage is unavailable. Check history before submitting again after a refresh.", "任务恢复存储不可用，刷新后请先查看历史记录再决定是否提交新任务。")}</p> : null}
        {uncertain ? <div className="generation-notice" role="alert">
          <p>{t(locale, "The submission response was lost. A task may already exist. Check history before starting another generation; this page will not resubmit automatically.", "提交响应丢失，任务可能已经创建。请先查看历史记录再决定是否新生成；页面不会自动重复提交。")}</p>
          <Link className="ghost-button" href="/dashboard">{t(locale, "Check history", "查看历史记录")}</Link>
          <button className="text-button" type="button" onClick={() => setUncertain(false)}>{t(locale, "Choose a new generation · credit rules apply", "选择新生成 · 沿用额度规则")}</button>
        </div> : null}
        {draftNotice ? <p className="tool-note" role="status">{draftNotice}</p> : null}
        {restoreFailed ? <button className="ghost-button" type="button" onClick={() => { editingRef.current++; setRestoreAttempt((value) => value + 1); }}>{t(locale, "Retry draft restoration", "重试恢复草稿")}</button> : null}
        <p className="tool-note">
          <ShieldCheck size={16} aria-hidden="true" style={{ verticalAlign: "-3px", marginRight: 6 }} />
          {t(
            locale,
            "Privacy note: photos are only used for this result and can be configured to expire after processing.",
            "隐私提示：图片仅用于生成当前结果，可配置为处理后自动删除。"
          )}
        </p>

        {errorMessage ? (
          <p className="tool-error" role="alert">{errorMessage}</p>
        ) : null}

        {isBusy ? <p role="status">{buttonLabel}</p> : null}

      </div>
      <div className="makeup-result-panel" aria-label={t(locale, "Makeup result", "妆容结果")}>
        {result ? (
          <div className="result-card">
            <h3>{result.styleName}</h3>
            <p>{query.session?.style.description ?? styles.find((style) => style.id === resultStyleId)?.description}</p>
            {result.resultUrl && result.beforeUrl ? (
              <BeforeAfterSlider
                beforeUrl={result.beforeUrl}
                afterUrl={result.resultUrl}
                beforeLabel={t(locale, "Before", "妆前")}
                afterLabel={t(locale, "After", "妆后")}
              />
            ) : result.resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.resultUrl}
                alt={t(locale, "Generated makeup result", "生成的妆容结果")}
                style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 6, marginBottom: 12 }}
              />
            ) : null}
            <p className="tool-note">{t(locale, "General style reference, not an analysis of your face shape or skin tone.", "以下为通用风格参考，并非根据照片识别脸型或肤色的分析。")}</p>
            <ul>
              {result.fitNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            {downloadError ? <p className="tool-error" role="alert">{downloadError}</p> : null}
            {result.resultUrl ? (
              <button
                className="ghost-button"
                type="button"
                onClick={downloadResult}
                disabled={isDownloading}
              >
                <Download size={16} aria-hidden="true" />
                {isDownloading ? t(locale, "Downloading...", "下载中...") : t(locale, "Download preview", "下载预览图")}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="makeup-result-empty">
            <h2>{t(locale, "Your makeup result", "你的妆容结果")}</h2>
            <p>{isBusy ? buttonLabel : t(locale, "Upload a selfie and choose a style to begin. Your comparison will appear here.", "上传自拍并选择妆容后开始生成，前后对比将在这里显示。")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
