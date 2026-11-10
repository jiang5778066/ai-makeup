"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n";
import { PlatformBrand } from "./platform-brand";
import { PlatformSidebar } from "./platform-sidebar";

export function PlatformDrawer({ locale, currentPath, onClose }: Readonly<{ locale: Locale; currentPath: string; onClose: () => void }>) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = [...document.querySelectorAll<HTMLElement>("[data-platform-background]")];
    const previous = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    close.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...(panel.current?.querySelectorAll<HTMLElement>('a[href],button,summary,[tabindex="0"]') ?? [])].filter((element) => !element.closest("details:not([open])") || element.tagName === "SUMMARY");
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || !panel.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.current?.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", key);
    const media = window.matchMedia?.("(min-width: 1280px)");
    const resized = () => { if (media?.matches) onClose(); };
    media?.addEventListener("change", resized);
    return () => {
      document.body.style.overflow = overflow; background.forEach((element, index) => { element.inert = previous[index]; });
      document.removeEventListener("keydown", key); media?.removeEventListener("change", resized); opener?.focus();
    };
  }, [onClose]);
  return <div className="platform-drawer-layer">
    <button type="button" className="platform-drawer-backdrop" aria-label={locale === "zh-CN" ? "关闭导航遮罩" : "Close navigation backdrop"} tabIndex={-1} onClick={onClose} />
    <div ref={panel} id="platform-drawer" className="platform-drawer" role="dialog" aria-modal="true" aria-label={locale === "zh-CN" ? "导航菜单" : "Navigation menu"}>
      <div className="platform-drawer-head"><button ref={close} type="button" onClick={onClose} aria-label={locale === "zh-CN" ? "关闭导航" : "Close navigation"}><X size={22} /></button><PlatformBrand locale={locale} /></div>
      <PlatformSidebar locale={locale} currentPath={currentPath} onNavigate={onClose} drawer />
    </div>
  </div>;
}
