import { useId } from "react";
import { ArrowRight, ArrowUpRight, Video, Clapperboard, ImageIcon, Music2, ImagePlus, Type, Repeat2, Mic, Smartphone } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { HomepageCard } from "@/lib/platform-homepage-data";
import { homepageEntry } from "@/lib/platform-homepage";
import { publicPlatformEntry } from "@/lib/platform-navigation";
import { guideTranslation, isVideoGuidePath, videoGuides } from "@/lib/platform-video-guides";
import { PlatformLink } from "./platform-link";
import { HomepageVideo } from "./platform-homepage-media";
import { homepagePreviews } from "@/lib/platform-homepage-previews";

export function HomepageCardImage({ src, alt = "", eager = false }: { src: string; alt?: string; eager?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />;
}

export function HomepagePreview({ src, locale, trigger = "visible", enabled = true, previewTitle }: { src: string; locale: Locale; trigger?: "visible" | "hover"; enabled?: boolean; previewTitle?: string }) {
  return enabled && homepagePreviews[src] ? <HomepageVideo poster={src} src={homepagePreviews[src]} locale={locale} trigger={trigger} previewTitle={previewTitle} /> : <HomepageCardImage src={src} />;
}

export function HomepageModelCard({ card, locale, compact = false }: { card: HomepageCard; locale: Locale; compact?: boolean }) {
  if (!publicPlatformEntry(card.id)) return null;
  const imageModel = ["image-generator", "gpt-image", "nano-banana"].includes(card.id);
  const seedreamPreview = card.id === "image-generator";
  const availableModes = ["gpt-image", "grok-imagine", "video-generator"].includes(card.id);
  const status = availableModes
    ? (locale === "zh-CN" ? "查看可用模式" : "View available modes")
    : seedreamPreview
      ? (locale === "zh-CN" ? "参数预览 · 生成暂未开放" : "Settings preview · Generation unavailable")
      : (locale === "zh-CN" ? "模型介绍 · 生成暂未开放" : "Model overview · Generation unavailable");
  const entry = homepageEntry(card.id, seedreamPreview ? { model: "seedream-5-0-pro", hash: "generator" } : {});
  return <div data-preview-card className={`platform-home-model ${compact ? "platform-home-model-compact" : ""}`}>
    <PlatformLink entry={entry} locale={locale} className="platform-home-card-link"><span className="platform-home-sr-only">{card.label[locale]}</span></PlatformLink>
    <HomepagePreview src={card.image} locale={locale} trigger="visible" />
    <span className="platform-home-card-arrow"><ArrowUpRight size={18} /></span>
    {compact && <p className="platform-home-model-category">{imageModel ? <ImageIcon size={14}/> : <Clapperboard size={14}/>} {locale === "zh-CN" ? (imageModel ? "图片模型" : "视频模型") : (imageModel ? "Image model" : "Video model")}</p>}
    <div className="platform-home-model-copy">
      {!compact && <p>{imageModel ? <ImageIcon size={14} /> : <Clapperboard size={14} />}{locale === "zh-CN" ? (imageModel ? "图片模型" : "视频模型") : (imageModel ? "Image model" : "Video model")}</p>}
      <div>{card.icon && !compact && <HomepageCardImage src={card.icon} />}<h3>{card.label[locale]}</h3></div>
      {compact && <p className="platform-home-model-description">{card.description[locale] || (locale === "zh-CN" ? "探索电影感画面与动态创作的公开示例。" : "Explore public examples of cinematic visuals and motion.")}</p>}
      {!compact && <small className="platform-home-unavailable">{status}</small>}
    </div>
    {compact && <small className="platform-home-unavailable">{status}</small>}
  </div>;
}

export function HomepageToolCard({ card, locale, detailed = false, fresh = false, showcase = false }: { card: HomepageCard; locale: Locale; detailed?: boolean; fresh?: boolean; showcase?: boolean }) {
  const descriptionId = useId();
  const entry = card.videoMode && publicPlatformEntry("video-generator")
    ? homepageEntry("video-generator", { mode: card.videoMode })
    : publicPlatformEntry(card.id);
  if (!entry && !showcase) return null;
  if (entry && isVideoGuidePath(entry.pathname)) {
    const guide = videoGuides[entry.pathname];
    return <div className="platform-home-guide-card">
      <PlatformLink entry={entry} locale={locale}>
        <h3>{guideTranslation(guide.title, locale)}</h3>
        <p>{guideTranslation(guide.summary, locale)}</p>
        <span>{locale === "zh-CN" ? "查看指南" : "Read guide"} <ArrowUpRight size={16} aria-hidden="true"/></span>
      </PlatformLink>
    </div>;
  }
  const Icon = ({ dance: Music2, "image-to-video": ImagePlus, "text-to-video": Type, "video-styler": Repeat2, "lip-sync": Mic, "landscape-to-portrait-video-converter-ai": Smartphone } as const)[card.id as "dance"] ?? Clapperboard;
  return <div data-preview-card className={`platform-home-tool ${detailed ? "platform-home-tool-detailed" : ""} ${card.referenceGuide ? "platform-home-reference-guide" : ""}`}>
    {entry && <PlatformLink entry={entry} locale={locale} className="platform-home-card-link" aria-describedby={card.referenceGuide ? descriptionId : undefined}><span className="platform-home-sr-only">{card.label[locale]}</span></PlatformLink>}
    {detailed && <div className="platform-home-tool-copy"><div><Icon size={18} />{entry && <ArrowUpRight size={18} />}</div><h3>{card.label[locale]}</h3><p id={card.referenceGuide ? descriptionId : undefined}>{card.description[locale]}</p></div>}
    <div className="platform-home-tool-media">
      {card.image ? <HomepagePreview src={card.image} locale={locale} trigger="visible" previewTitle={showcase ? card.label[locale] : undefined} />
        : <div className="platform-tool-icon-preview"><Icon size={36} aria-hidden="true"/></div>}
      {card.illustration ? <span className="platform-home-fresh platform-tool-illustration-label">{locale === "zh-CN" ? "FrameKoi 示意图" : "FrameKoi illustration"}</span>
        : fresh && entry && <span className="platform-home-fresh">{locale === "zh-CN" ? "新品" : "New"}</span>}
    </div>
    {!detailed && <div className="platform-home-tool-label"><h3>{card.label[locale]}</h3>{entry && <ArrowUpRight size={16} />}</div>}
    {!detailed && card.referenceGuide && <p id={descriptionId} className="platform-home-reference-guide-description">{card.description[locale]}</p>}
  </div>;
}

export function HomepageCta({ id, locale, children, secondary = false, mediaIcon, arrow = true, gradient = false }: { id: string; locale: Locale; children: React.ReactNode; secondary?: boolean; mediaIcon?: "video" | "image"; arrow?: boolean; gradient?: boolean }) {
  const entry = publicPlatformEntry(id);
  if (!entry) return null;
  return <PlatformLink entry={entry} locale={locale} className={`platform-home-cta ${secondary ? "platform-home-cta-secondary" : ""} ${gradient ? "platform-home-cta-gradient" : ""}`}>{gradient ? <span className="platform-home-cta-inner">{children}{arrow && <ArrowRight size={16}/>}</span> : <>{mediaIcon === "video" ? <Video size={16} strokeWidth={1.75}/> : mediaIcon === "image" ? <ImageIcon size={16} strokeWidth={1.75}/> : null}{children}{arrow && <ArrowRight size={15} className="platform-home-cta-arrow"/>}</>}</PlatformLink>;
}
