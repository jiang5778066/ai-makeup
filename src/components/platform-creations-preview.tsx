/* eslint-disable @next/next/no-img-element -- 私有短期签名媒体使用原生元素。 */
"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { CreationDTO } from "@/lib/platform-creations-types";
import type { Locale } from "@/lib/i18n";
import styles from "./platform-creations-styles.module.css";
export function PlatformCreationsPreview({ item, locale, onClose, onRefresh }: { item: CreationDTO; locale: Locale; onClose: () => void; onRefresh: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onClose });
  useEffect(() => { callbacks.current = { onClose }; }, [onClose]);
  useLayoutEffect(() => {
    const root = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root?.querySelector<HTMLButtonElement>("button")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); callbacks.current.onClose(); }
      if (event.key !== "Tab" || !root?.contains(document.activeElement)) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],video[controls]')).filter(node => !node.hidden);
      const index = nodes.indexOf(document.activeElement as HTMLElement);
      if ((!event.shiftKey && index === nodes.length - 1) || (event.shiftKey && index === 0)) { event.preventDefault(); nodes[event.shiftKey ? nodes.length - 1 : 0]?.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); if (root?.contains(document.activeElement) && trigger?.isConnected) trigger.focus(); };
  }, []);
  const zh = locale === "zh-CN";
  return <div className={styles.backdrop} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={ref} className={styles.dialog} role="dialog" aria-modal="true" aria-label={zh ? "作品预览" : "Creation preview"}>
      <div className={styles.dialogHead}><h2>{zh ? "作品预览" : "Creation preview"}</h2><button type="button" onClick={onClose} aria-label={zh ? "关闭预览" : "Close preview"}>×</button></div>
      {item.result && item.result.mimeType.startsWith(`${item.mediaType}/`) ? item.mediaType === "video" ? <video controls playsInline key={item.result.url}><source src={item.result.url} type={item.result.mimeType}/></video> : <img src={item.result.url} alt={zh ? "已保存的美妆结果" : "Saved makeup result"} /> : <p>{zh ? "结果链接暂不可用。" : "Result link is unavailable."}</p>}
      <p>{zh ? "链接过期或加载失败时可刷新原作品结果。" : "Refresh the original result if the link expires or fails to load."}</p>
      <button type="button" onClick={onRefresh}>{zh ? "刷新结果链接" : "Refresh result link"}</button>
    </div>
  </div>;
}
