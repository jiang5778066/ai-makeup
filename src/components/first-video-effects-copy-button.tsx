"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./first-video-effects-page.module.css";

export function FirstVideoEffectsCopyButton({ prompt, locale }: { prompt: string; locale: Locale }) {
  return <CopyPrompt key={JSON.stringify([locale, prompt])} prompt={prompt} locale={locale}/>;
}

function CopyPrompt({ prompt, locale }: { prompt: string; locale: Locale }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const zh = locale === "zh-CN";

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return <div className={styles.copyAction}>
    <button type="button" className={styles.copyButton} onClick={copyPrompt}>
      {zh ? "复制示例提示词" : "Copy sample prompt"}
    </button>
    <span className={styles.copyStatus} role="status">
      {status === "copied" && (zh ? "已复制提示词。" : "Prompt copied.")}
      {status === "failed" && (zh ? "复制失败，请手动选择并复制提示词。" : "Copy failed. Select and copy the prompt manually.")}
    </span>
  </div>;
}
