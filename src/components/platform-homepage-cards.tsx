import { ArrowRight, ArrowUpRight, Video, Clapperboard, ImageIcon, Music2, ImagePlus, Type, Repeat2, Mic, Smartphone } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { HomepageCard } from "@/lib/platform-homepage-data";
import { homepageEntry } from "@/lib/platform-homepage";
import { PlatformLink } from "./platform-link";
import { HomepageVideo } from "./platform-homepage-media";
import { homepagePreviews } from "@/lib/platform-homepage-previews";

export function HomepageCardImage({ src, alt = "", eager = false }: { src: string; alt?: string; eager?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />;
}

export function HomepagePreview({ src, locale, trigger = "visible", enabled = true }: { src: string; locale: Locale; trigger?: "visible" | "hover"; enabled?: boolean }) {
  return enabled && homepagePreviews[src] ? <HomepageVideo poster={src} src={homepagePreviews[src]} locale={locale} trigger={trigger} /> : <HomepageCardImage src={src} />;
}

export function HomepageModelCard({ card, locale, compact = false }: { card: HomepageCard; locale: Locale; compact?: boolean }) {
  const imageModel = ["image-generator", "gpt-image", "nano-banana"].includes(card.id);
  const entry = homepageEntry(card.id, card.id === "image-generator" ? { model: "seedream-5-0-pro", hash: "generator" } : {});
  return <div data-preview-card className={`platform-home-model ${compact ? "platform-home-model-compact" : ""}`}>
    <PlatformLink entry={entry} locale={locale} className="platform-home-card-link"><span className="platform-home-sr-only">{card.label[locale]}</span></PlatformLink>
    <HomepagePreview src={card.image} locale={locale} trigger="visible" />
    <span className="platform-home-card-arrow"><ArrowUpRight size={18} /></span>
    {compact && <p className="platform-home-model-category">{imageModel ? <ImageIcon size={14}/> : <Clapperboard size={14}/>} {locale === "zh-CN" ? (imageModel ? "图片模型" : "视频模型") : (imageModel ? "Image model" : "Video model")}</p>}
    <div className="platform-home-model-copy">
      {!compact && <p>{imageModel ? <ImageIcon size={14} /> : <Clapperboard size={14} />}{locale === "zh-CN" ? (imageModel ? "图片模型" : "视频模型") : (imageModel ? "Image model" : "Video model")}</p>}
      <div>{card.icon && !compact && <HomepageCardImage src={card.icon} />}<h3>{card.label[locale]}</h3></div>
      {compact && <p className="platform-home-model-description">{card.description[locale] || (locale === "zh-CN" ? "探索电影感画面与动态创作的公开示例。" : "Explore public examples of cinematic visuals and motion.")}</p>}
      {!compact && <small className="platform-home-unavailable">{locale === "zh-CN" ? "展示入口 · 尚不可用" : "Showcase · Unavailable"}</small>}
    </div>
    {compact && <small className="platform-home-unavailable">{locale === "zh-CN" ? "展示入口 · 尚不可用" : "Showcase · Unavailable"}</small>}
  </div>;
}

export function HomepageToolCard({ card, locale, detailed = false, fresh = false }: { card: HomepageCard; locale: Locale; detailed?: boolean; fresh?: boolean }) {
  const Icon = ({ dance: Music2, "image-to-video": ImagePlus, "text-to-video": Type, "video-styler": Repeat2, "lip-sync": Mic, "landscape-to-portrait": Smartphone } as const)[card.id as "dance"] ?? Clapperboard;
  return <div data-preview-card className={`platform-home-tool ${detailed ? "platform-home-tool-detailed" : ""}`}><PlatformLink entry={homepageEntry(card.id)} locale={locale} className="platform-home-card-link"><span className="platform-home-sr-only">{card.label[locale]}</span></PlatformLink>
    {detailed && <div className="platform-home-tool-copy"><div><Icon size={18} /><ArrowUpRight size={18} /></div><h3>{card.label[locale]}</h3><p>{card.description[locale]}</p></div>}
    <div className="platform-home-tool-media"><HomepagePreview src={card.image} locale={locale} trigger="visible" enabled={!(detailed && card.id === "lip-sync")} />{fresh && <span className="platform-home-fresh">{locale === "zh-CN" ? "新品" : "New"}</span>}</div>{!detailed && <div className="platform-home-tool-label"><h3>{card.label[locale]}</h3><ArrowUpRight size={16} /></div>}
  </div>;
}

export function HomepageCta({ id, locale, children, secondary = false, mediaIcon, arrow = true, gradient = false }: { id: string; locale: Locale; children: React.ReactNode; secondary?: boolean; mediaIcon?: "video" | "image"; arrow?: boolean; gradient?: boolean }) {
  return <PlatformLink entry={homepageEntry(id)} locale={locale} className={`platform-home-cta ${secondary ? "platform-home-cta-secondary" : ""} ${gradient ? "platform-home-cta-gradient" : ""}`}>{gradient ? <span className="platform-home-cta-inner">{children}{arrow && <ArrowRight size={16}/>}</span> : <>{mediaIcon === "video" ? <Video size={16} strokeWidth={1.75}/> : mediaIcon === "image" ? <ImageIcon size={16} strokeWidth={1.75}/> : null}{children}{arrow && <ArrowRight size={15} className="platform-home-cta-arrow"/>}</>}</PlatformLink>;
}
