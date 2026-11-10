"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { directoryContent, directoryEntry, type DirectoryPath, type DirectoryCard } from "@/lib/platform-directory-data";
import { directoryMedia } from "@/lib/platform-directory-media";
import { platformEntry } from "@/lib/platform-navigation";
import { HomepageVideo } from "./platform-homepage-media";
import { PlatformLink } from "./platform-link";
import { SiteShell } from "./site-shell";

function DirectoryTile({ card, locale, path }: { card: DirectoryCard; locale: Locale; path: DirectoryPath }) {
  const media = directoryMedia[card.mediaKey];
  const model = path === "/ai-video-models" || path === "/ai-image-models";
  const Heading = path === "/ai-video-models" ? "h3" : "h2";
  const zh = locale === "zh-CN";
  return <li><article className="platform-directory-card" data-preview-card data-directory-card={card.entryId}>
    <div className="platform-directory-media">
      {media.src ? <HomepageVideo poster={media.poster} src={media.src} locale={locale} trigger={path === "/ai-video-models" ? "hover" : "visible"}/> : <img src={media.poster} alt="" loading="lazy" draggable={false}/> /* eslint-disable-line @next/next/no-img-element */}
      {card.badge && <span className={`platform-directory-badge platform-directory-badge-${card.badge}`}>{card.badge === "hot" ? (zh ? "热门" : "Hot") : (zh ? "新品" : "New")}</span>}
    </div>
    {/* 链接覆盖卡片；媒体控件与链接并列，键盘和触屏均能独立播放。 */}
    <PlatformLink entry={directoryEntry(card)} locale={locale} className="platform-directory-card-link">
      <Heading>{card.title[locale]}</Heading>
      {card.description && <p>{card.description[locale]}</p>}
      {model && <span className="platform-directory-unavailable">{["dreamface-ai", "gpt-image", "nano-banana", "wan-2-2", "wan-2-5", "wan-2-6", "wan-3-0", "wan-fusionX", "kling-ai", "kling-3-0", "seedance", "happy-horse"].includes(card.entryId) ? (zh ? "生成暂不可用" : "Generation not available yet") : (zh ? "当前不可用" : "Currently unavailable")}</span>}
      {model && <span className="platform-directory-model-cta">{card.cta?.[locale]}{path === "/ai-video-models" && <ArrowRight size={16}/>}</span>}
      {path === "/tools" && <span className="platform-directory-try"><Sparkles size={16}/>{zh ? "立即尝试" : "Try Now"}</span>}
    </PlatformLink>
  </article></li>;
}

function DirectoryTitle({ path, locale }: { path: DirectoryPath; locale: Locale }) {
  const zh = locale === "zh-CN";
  if (path === "/tools") return <>{zh ? "探索我们的" : "Discover Our"} <span>{zh ? "AI驱动" : "AI-Powered"}</span> {zh ? "工具" : "Tools"}</>;
  if (path === "/ai-video-models") return <>{zh ? "探索我们的" : "Discover Our"} <span>{zh ? "AI 驱动" : "AI-Powered"}</span> {zh ? "视频模型" : "Video Models"}</>;
  if (path === "/video-effects" || path === "/image-effects") return <span className="platform-directory-effect-title">{directoryContent[path].title[locale]}</span>;
  return <>{directoryContent[path].title[locale]}</>;
}

export function PlatformDirectoryPage({ path, locale }: { path: DirectoryPath; locale: Locale }) {
  const page = directoryContent[path];
  const zh = locale === "zh-CN";
  return <SiteShell locale={locale} currentPath={path}><main className={`platform-directory platform-directory-${page.layout}`}>
    <nav className="platform-directory-breadcrumb" aria-label={zh ? "面包屑导航" : "Breadcrumb"}>
      <PlatformLink entry={platformEntry("landing")} locale={locale}>{zh ? "首页" : "Home"}</PlatformLink><span aria-hidden="true">›</span><span aria-current="page">{page.breadcrumb[locale]}</span>
    </nav>
    <div className="platform-directory-body">
      <header className="platform-directory-heading">
        {page.eyebrow && <span className="platform-directory-eyebrow">{page.eyebrow[locale]}</span>}
        <h1><DirectoryTitle path={path} locale={locale}/></h1><p>{page.description[locale]}</p>
      </header>
      {page.sections ? <>
        <nav className="platform-directory-jumps" aria-label={zh ? "模型分类" : "Model categories"}>{page.sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title[locale]}</a>)}</nav>
        <div className="platform-directory-sections">{page.sections.map(section => <section className="platform-directory-section" id={section.id} aria-labelledby={`${section.id}-title`} key={section.id}>
          <h2 id={`${section.id}-title`}>{section.title[locale]}</h2><p>{section.description[locale]}</p>
          <ul className="platform-directory-model-grid">{section.cards.map(card => <DirectoryTile key={card.entryId} card={card} locale={locale} path={path}/>)}</ul>
        </section>)}</div>
      </> : <ul className="platform-directory-grid">{page.cards.map(card => <DirectoryTile key={card.entryId} card={card} locale={locale} path={path}/>)}</ul>}
      <p className="platform-directory-disclosure">{zh ? "媒体为公开参照展示，并非本项目生成或用户作品。模型介绍用于浏览，模型与专用工具生成暂未开放；AI 美妆继续使用现有功能与账户额度。" : "Media are public reference showcases, not project generations or user creations. Model descriptions are for browsing; model and dedicated tool generation are not available yet. AI Makeup retains its existing features and account credits."}</p>
    </div>
  </main></SiteShell>;
}
