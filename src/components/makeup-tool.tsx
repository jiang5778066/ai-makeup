"use client";

import { Download, ImagePlus, RefreshCw, ShieldCheck, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { MakeupStyle } from "@/lib/content";
import { BeforeAfterSlider } from "./before-after-slider";

type Status = "idle" | "uploading" | "queued" | "running" | "done" | "failed";

type GenerationStatus = {
  id: string;
  status: "queued" | "moderating" | "running" | "done" | "failed" | "refunded";
  resultUrl: string | null;
  beforeUrl: string | null;
  fitNotes: string[];
  styleName: string;
  error: string | null;
};

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

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationStatus | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedStyle = useMemo(
    () => styles.find((style) => style.id === styleId) ?? styles[0],
    [styleId, styles]
  );

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  function pickFile(next: File | null) {
    setErrorMessage(null);
    setResult(null);
    if (!next) {
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    if (!ALLOWED_MIME.includes(next.type)) {
      setErrorMessage(t(locale, "Use a JPG, PNG, or WebP image.", "请使用 JPG、PNG 或 WebP 格式。"));
      return;
    }
    if (next.size > MAX_BYTES) {
      setErrorMessage(t(locale, "Image must be 12MB or smaller.", "图片需小于 12MB。"));
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
  }

  function clearFile() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    pickFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function uploadOriginal(currentFile: File): Promise<string> {
    const signResponse = await fetch("/api/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: currentFile.type,
        contentLength: currentFile.size,
        filename: currentFile.name
      })
    });

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
      headers: { "Content-Type": currentFile.type },
      body: currentFile
    });
    if (!putResponse.ok) throw new Error("upload_failed");

    return uploadKey;
  }

  function startPolling(generationId: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const response = await fetch(`/api/generations/${generationId}`);
      if (!response.ok) return;
      const payload = (await response.json()) as GenerationStatus;
      if (payload.status === "done") {
        setStatus("done");
        setResult(payload);
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (payload.status === "failed") {
        setStatus("failed");
        setErrorMessage(
          payload.error ?? t(locale, "Generation failed. Please try again.", "生成失败，请重试。")
        );
        if (pollRef.current) clearInterval(pollRef.current);
      } else {
        setStatus(payload.status === "moderating" || payload.status === "refunded" ? "running" : payload.status);
      }
    }, 2000);
  }

  async function generate() {
    if (!file) {
      setErrorMessage(t(locale, "Upload a selfie first.", "请先上传一张自拍。"));
      return;
    }
    if (!consent) {
      setErrorMessage(
        t(
          locale,
          "Please agree to the processing notice to continue.",
          "请勾选同意以继续。"
        )
      );
      return;
    }

    setErrorMessage(null);
    setResult(null);
    setStatus("uploading");

    try {
      const uploadKey = await uploadOriginal(file);

      const response = await fetch("/api/makeup/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styleId, intensity, locale, uploadKey, consent })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setStatus("failed");
        setErrorMessage(
          payload.message ??
            t(locale, "Could not start generation.", "生成请求未能启动，请稍后再试。")
        );
        return;
      }

      const { generationId } = (await response.json()) as { generationId: string };
      setStatus("queued");
      startPolling(generationId);
    } catch (error) {
      setStatus("failed");
      setErrorMessage(
        error instanceof Error ? error.message : t(locale, "Upload failed.", "上传失败。")
      );
    }
  }

  const isBusy = status === "uploading" || status === "queued" || status === "running";
  const buttonLabel =
    status === "uploading"
      ? t(locale, "Uploading...", "上传中...")
      : status === "queued" || status === "running"
        ? t(locale, "Generating...", "生成中...")
        : cta;

  return (
    <div className="tool-card" id="try">
      <div
        className="upload-zone"
        aria-label={t(locale, "Selfie upload area", "上传自拍区域")}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
        }}
      >
        {previewUrl ? (
          <div style={{ position: "relative", width: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={t(locale, "Selected selfie preview", "已选择的自拍预览")}
              style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 6 }}
            />
            <button
              type="button"
              className="ghost-button"
              onClick={(event) => {
                event.stopPropagation();
                clearFile();
              }}
              style={{ position: "absolute", top: 8, right: 8 }}
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
          accept={ALLOWED_MIME.join(",")}
          style={{ display: "none" }}
          onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
        />
      </div>

      <div className="chips" aria-label={t(locale, "Makeup styles", "妆容风格")}>
        {styles.slice(0, 8).map((style) => (
          <button
            className={style.id === styleId ? "chip active" : "chip"}
            key={style.id}
            type="button"
            onClick={() => setStyleId(style.id)}
            disabled={isBusy}
          >
            {style.name}
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

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          fontSize: "0.9rem",
          color: "var(--charcoal)",
          margin: "8px 0 4px"
        }}
      >
        <input
          type="checkbox"
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
        className="button"
        type="button"
        onClick={generate}
        disabled={isBusy || !file || !consent}
      >
        {isBusy ? <RefreshCw size={17} aria-hidden="true" /> : <WandSparkles size={17} aria-hidden="true" />}
        {buttonLabel}
      </button>

      <p className="tool-note">
        <ShieldCheck size={16} aria-hidden="true" style={{ verticalAlign: "-3px", marginRight: 6 }} />
        {t(
          locale,
          "Privacy note: photos are only used for this result and can be configured to expire after processing.",
          "隐私提示：图片仅用于生成当前结果，可配置为处理后自动删除。"
        )}
      </p>

      {errorMessage ? (
        <p style={{ color: "var(--cherry)", marginTop: 8 }}>{errorMessage}</p>
      ) : null}

      {result ? (
        <div className="result-card">
          <h3>{result.styleName}</h3>
          <p>{selectedStyle?.description}</p>
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
          <ul>
            {result.fitNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          {result.resultUrl ? (
            <a
              className="ghost-button"
              href={result.resultUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={16} aria-hidden="true" />
              {t(locale, "Download preview", "下载预览图")}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
