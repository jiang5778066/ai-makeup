"use client";

import { ChevronDown, Globe, Menu } from "lucide-react";
import { PlatformNavigationLink as Link } from "./platform-navigation-link";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { PlatformAccountEntry } from "./platform-account-entry";
import { isEntryActive, platformEntry, switchPlatformLocale } from "@/lib/platform-navigation";
import { PlatformBrand } from "./platform-brand";
import { PlatformFeatureMenu } from "./platform-feature-menu";
import { PlatformLink } from "./platform-link";
import { usePlatformUrl } from "./use-platform-url";
import { PlatformDrawer } from "./platform-drawer";

type HeaderProps = Readonly<{ locale: Locale; currentPath: string; variant: "marketing" | "workspace" }>;
export function PlatformHeader(props: HeaderProps) {
  return <Suspense fallback={<HeaderContent {...props} locationPath={localizePath(props.currentPath, props.locale)}/>}><ReactiveHeader {...props}/></Suspense>;
}
function ReactiveHeader(props: HeaderProps) {
  const locationPath = usePlatformUrl(localizePath(props.currentPath, props.locale));
  return <HeaderContent {...props} locationPath={locationPath}/>;
}
function HeaderContent({ locale, currentPath, variant, locationPath }: HeaderProps & { locationPath: string }) {
  const zh = locale === "zh-CN";
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
    <header data-platform-background className={`platform-header platform-header-${variant}`} ref={headerRef} onMouseLeave={() => { cancelHover(); if (open === "features") setOpen(null); }}>
      <div className="platform-header-brand">
        <button className="platform-drawer-trigger" ref={drawerTrigger} type="button" aria-label={zh ? "切换侧边栏" : "Toggle sidebar"} aria-expanded={open === "drawer"} aria-controls="platform-drawer" onClick={() => setOpen("drawer")}><Menu size={20} /></button>
        <PlatformBrand locale={locale} />
      </div>
      {variant === "marketing" && <nav className="platform-top-nav" aria-label={zh ? "主导航" : "Primary navigation"}>
        {["home", "community"].map((id) => <PlatformLink key={id} entry={platformEntry(id)} locale={locale} active={isEntryActive(platformEntry(id), currentPath)} />)}
        <button className={open === "features" ? "is-open" : ""} ref={featureTrigger} type="button" aria-expanded={open === "features"} aria-controls="platform-feature-menu"
          onClick={() => { cancelHover(); setOpen(open === "features" ? null : "features"); }} onKeyDown={(event) => openByKeyboard(event, "features")}
          onMouseEnter={() => { cancelHover(); hoverTimer.current = setTimeout(() => setOpen("features"), 150); }}>{zh ? "功能" : "Features"}<ChevronDown size={12} aria-hidden="true" /></button>
        {["tools", "video-effects", "price"].map((id) => <PlatformLink key={id} entry={platformEntry(id)} locale={locale} active={isEntryActive(platformEntry(id), currentPath)} />)}
      </nav>}
      <div className="platform-header-actions">
        <div className="platform-language">
          <button className="platform-language-trigger" ref={languageTrigger} type="button" aria-label={zh ? "切换语言，当前为 简体中文" : "Switch language, current English"} aria-expanded={open === "language"} aria-haspopup="menu" aria-controls="platform-language-menu" onClick={() => setOpen(open === "language" ? null : "language")} onKeyDown={(event) => openByKeyboard(event, "language")}><Globe size={16} /><span>{zh ? "简体中文" : "English"}</span><ChevronDown size={12} /></button>
          {open === "language" && <div id="platform-language-menu" role="menu" aria-label={zh ? "语言" : "Language"} className="platform-language-menu" onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
            event.preventDefault(); const links = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>("a")]; const index = links.indexOf(document.activeElement as HTMLAnchorElement);
            const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
            links[next]?.focus();
          }}>{(["en", "zh-CN"] as const).map((value) => <Link role="menuitem" aria-current={locale === value ? "true" : undefined} href={switchPlatformLocale(locationPath, value)} key={value} onClick={() => close(false)}>{value === "en" ? "English" : "简体中文"}{locale === value && <span aria-hidden="true">✓</span>}</Link>)}</div>}
        </div>
        <PlatformAccountEntry locale={locale} returnPath={locationPath} />
      </div>
      {open === "features" && <PlatformFeatureMenu locale={locale} onNavigate={() => close(false)} />}
    </header>
    {open === "drawer" && <PlatformDrawer locale={locale} currentPath={currentPath} onClose={() => close()} />}
  </>;
}
