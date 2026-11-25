"use client";

import { ChevronDown, Globe, Menu } from "lucide-react";
import { PlatformNavigationLink as Link } from "./platform-navigation-link";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { portraitImageEditPaths } from "@/lib/platform-image-edit-data";
import { PlatformAccountEntry } from "./platform-account-entry";
import { isEntryActive, publicPlatformEntries, switchPlatformLocale } from "@/lib/platform-navigation";
import { PlatformBrand } from "./platform-brand";
import { PlatformFeatureMenu } from "./platform-feature-menu";
import { PlatformLink } from "./platform-link";
import { usePlatformUrl } from "./use-platform-url";
import { PlatformDrawer } from "./platform-drawer";

type HeaderProps = Readonly<{ locale: Locale; currentPath: string; variant: "marketing" | "workspace" }>;
function ObserveHeaderUrl({ serverPath, onLocation }: { serverPath: string; onLocation: (path: string) => void }) {
  const locationPath = usePlatformUrl(serverPath);
  useLayoutEffect(() => { onLocation(locationPath); }, [locationPath, onLocation]);
  return null;
}

export function PlatformHeader({ locale, currentPath, variant }: HeaderProps) {
  const zh = locale === "zh-CN";
  const serverPath = localizePath(currentPath, locale);
  const [locationPath, setLocationPath] = useState(serverPath);
  const [open, setOpen] = useState<"features" | "language" | "drawer" | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const featureTrigger = useRef<HTMLButtonElement>(null);
  const languageTrigger = useRef<HTMLButtonElement>(null);
  const drawerTrigger = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHover = () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); };
  const close = (restore = true) => {
    setOpen(null);
    if (restore) ({ features: featureTrigger, language: languageTrigger, drawer: drawerTrigger }[open ?? "features"]).current?.focus();
  };
  useEffect(() => {
    if (!open || open === "drawer") return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(null); (open === "features" ? featureTrigger : languageTrigger).current?.focus(); }
    };
    const pointer = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) setOpen(null); };
    const focus = (event: FocusEvent) => { if (!headerRef.current?.contains(event.target as Node)) setOpen(null); };
    document.addEventListener("keydown", key); document.addEventListener("pointerdown", pointer); document.addEventListener("focusin", focus);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", pointer); document.removeEventListener("focusin", focus); };
  }, [open]);
  const openByKeyboard = (event: React.KeyboardEvent, type: "features" | "language") => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault(); setOpen(type);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(type === "features" ? "#platform-feature-menu a" : "#platform-language-menu a")?.focus());
  };
  return <>
    {/* 地址订阅恢复时仅更新链接，保留已获得焦点的页头控件。 */}
    <Suspense fallback={null}><ObserveHeaderUrl serverPath={serverPath} onLocation={setLocationPath}/></Suspense>
    <header data-platform-background className={`platform-header platform-header-${variant}`} ref={headerRef} onMouseLeave={() => { cancelHover(); if (open === "features") setOpen(null); }}>
      <div className="platform-header-brand">
        <button className="platform-drawer-trigger" ref={drawerTrigger} type="button" aria-label={zh ? "切换侧边栏" : "Toggle sidebar"} aria-expanded={open === "drawer"} aria-controls="platform-drawer" onClick={() => setOpen("drawer")}><Menu size={20} /></button>
        <PlatformBrand locale={locale} />
      </div>
      {variant === "marketing" && <nav className="platform-top-nav" aria-label={zh ? "主导航" : "Primary navigation"}>
        {publicPlatformEntries(["home", "community"]).map((entry) => <PlatformLink key={entry.id} entry={entry} locale={locale} active={isEntryActive(entry, currentPath)} />)}
        <button className={open === "features" ? "is-open" : ""} ref={featureTrigger} type="button" aria-expanded={open === "features"} aria-controls="platform-feature-menu"
          onClick={() => { cancelHover(); setOpen(open === "features" ? null : "features"); }} onKeyDown={(event) => openByKeyboard(event, "features")}
          onMouseEnter={() => { cancelHover(); hoverTimer.current = setTimeout(() => setOpen("features"), 150); }}>{zh ? "功能" : "Features"}<ChevronDown size={12} aria-hidden="true" /></button>
        {publicPlatformEntries(["tools", "video-effects", "price"]).map((entry) => <PlatformLink key={entry.id} entry={entry} locale={locale} active={isEntryActive(entry, currentPath)} />)}
      </nav>}
      <div className="platform-header-actions">
        <div className="platform-language">
          <button className="platform-language-trigger" ref={languageTrigger} type="button" aria-label={zh ? "切换语言，当前为 简体中文" : "Switch language, current English"} aria-expanded={open === "language"} aria-haspopup="menu" aria-controls="platform-language-menu" onClick={() => setOpen(open === "language" ? null : "language")} onKeyDown={(event) => openByKeyboard(event, "language")}><Globe size={16} /><span>{zh ? "简体中文" : "English"}</span><ChevronDown size={12} /></button>
          {open === "language" && <div id="platform-language-menu" role="menu" aria-label={zh ? "语言" : "Language"} className="platform-language-menu" onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
            event.preventDefault(); const links = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>("a")]; const index = links.indexOf(document.activeElement as HTMLAnchorElement);
            const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
            links[next]?.focus();
          }}>{(["en", "zh-CN"] as const).map(value => {
            const href = switchPlatformLocale(locationPath, value);
            const label = value === "en" ? "English" : "简体中文";
            const current = locale === value ? "true" : undefined;
            // 人像深链交给浏览器处理首屏锚点与历史位置。
            if (portraitImageEditPaths.some(path => path === currentPath)) {
              return <a role="menuitem" aria-current={current} href={href} key={value}
                onClick={() => close(false)}>{label}{current && <span aria-hidden="true">✓</span>}</a>;
            }
            return <Link role="menuitem" aria-current={current} href={href} key={value}
              onClick={() => close(false)}>{label}{current && <span aria-hidden="true">✓</span>}</Link>;
          })}</div>}
        </div>
        <PlatformAccountEntry locale={locale} returnPath={locationPath} />
      </div>
      {open === "features" && <PlatformFeatureMenu locale={locale} onNavigate={() => close(false)} />}
    </header>
    {open === "drawer" && <PlatformDrawer locale={locale} currentPath={currentPath} onClose={() => close()} />}
  </>;
}
