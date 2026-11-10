import { ArrowRight, ImageIcon, Video, RefreshCw, MoonStar } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { workspaceImageTools, workspaceModels, workspaceVideoTools, type HomepageCard } from "@/lib/platform-homepage-data";
import { homepageEntry } from "@/lib/platform-homepage";
import { HomepageCarousel } from "./platform-homepage-carousel";
import { HomepageCta, HomepageModelCard, HomepageToolCard } from "./platform-homepage-cards";
import { PlatformLink } from "./platform-link";
import { HomepageCommunity } from "./platform-homepage-community";
import { SiteShell } from "./site-shell";

export function PlatformWorkspacePage({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  const zh = locale === "zh-CN";
  const primary = [
    { id: "video-generator", title: zh ? "AI视频生成" : "AI video generation", description: zh ? "图生视频 & 文生视频" : "Image to video & text to video", icon: Video },
    { id: "image-generator", title: zh ? "AI图像生成" : "AI image generation", description: zh ? "将任意灵感变成吸睛 AI 图片" : "Turn your ideas into images", icon: ImageIcon },
    { id: "video-effects", title: zh ? "视频特效" : "Video effects", description: zh ? "将图片转换为惊艳的视频特效" : "Transform images with video effects", icon: MoonStar },
    { id: "video-styler", title: zh ? "视频转视频" : "Video to video", description: zh ? "将视频转换成不同风格" : "Explore different video styles", icon: RefreshCw }
  ];
  return <SiteShell locale={locale} currentPath={currentPath} variant="workspace"><main className="platform-workspace-page"><h1 className="platform-home-sr-only">{zh ? "Makeup AI 创作工作台" : "Makeup AI creative workspace"}</h1><div className="platform-home-container">
    <HomepageCarousel title="" locale={locale} className="platform-workspace-models" loop>{workspaceModels.map(card => <HomepageModelCard key={card.id} card={card} locale={locale} compact />)}</HomepageCarousel>
    <section className="platform-workspace-primary"><h2 className="platform-home-sr-only">{zh ? "主要功能" : "Main features"}</h2><div>{primary.map(item => <PlatformLink key={item.id} entry={homepageEntry(item.id)} locale={locale}><span><strong>{item.title}</strong><small>{item.description}</small></span><i><item.icon size={24}/></i><span className="platform-workspace-experience">{zh ? "查看入口" : "Explore tool"}<ArrowRight size={14}/></span></PlatformLink>)}</div></section>
    <WorkspaceToolSection title={zh ? "AI 视频工具" : "AI video tools"} cards={workspaceVideoTools} locale={locale}/>
    <WorkspaceToolSection title={zh ? "AI 图片工具" : "AI image tools"} cards={workspaceImageTools} locale={locale}/>
    <section className="platform-workspace-community"><div className="platform-home-section-title"><div><h2>{zh ? "社区作品" : "Community showcase"}</h2></div></div><p>{zh ? "公开参照展示，非本项目用户作品。图片与视频生成入口当前不可用。" : "Public reference examples, not project user creations. Image and video generation are currently unavailable."}</p><HomepageCommunity locale={locale}/><HomepageCta id="community" locale={locale} secondary>{zh ? "查看更多" : "View more"}</HomepageCta></section>
  </div></main></SiteShell>;
}
function WorkspaceToolSection({ title, cards, locale }: { title: string; cards: HomepageCard[]; locale: Locale }) {
  return <section className="platform-workspace-tools"><HomepageCarousel title={title} locale={locale}>{cards.map(card => <HomepageToolCard key={card.id} card={card} locale={locale} fresh={["ai-kissing-video-generator", "character-animation", "nano-banana", "change-eye-color"].includes(card.id)}/>)}</HomepageCarousel></section>;
}
