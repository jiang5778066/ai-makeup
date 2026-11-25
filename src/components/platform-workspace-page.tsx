import { ArrowRight, ImageIcon, Video, WandSparkles, MoonStar } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { workspaceImageTools, workspaceModels, workspaceVideoTools, type HomepageCard } from "@/lib/platform-homepage-data";
import { publicPlatformEntry } from "@/lib/platform-navigation";
import { HomepageCarousel } from "./platform-homepage-carousel";
import { HomepageModelCard, HomepageToolCard } from "./platform-homepage-cards";
import { PlatformLink } from "./platform-link";
import { HomepageCommunity } from "./platform-homepage-community";
import { SiteShell } from "./site-shell";

export function PlatformWorkspacePage({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  const zh = locale === "zh-CN";
  const primary = [
    { id: "video-generator", title: zh ? "AI视频生成" : "AI video generation", description: zh ? "图生视频 & 文生视频" : "Image to video & text to video", icon: Video },
    { id: "image-generator", title: zh ? "AI图像生成" : "AI image generation", description: zh ? "将任意灵感变成吸睛 AI 图片" : "Turn your ideas into images", icon: ImageIcon },
    { id: "video-effects", title: zh ? "视频特效" : "Video effects", description: zh ? "浏览视频特效及预览示例" : "Browse video effects and previews", icon: MoonStar },
    { id: "image-effects", title: zh ? "图片特效" : "Image effects", description: zh ? "浏览图片特效及可用工具" : "Browse image effects and available tools", icon: WandSparkles }
  ];
  return <SiteShell locale={locale} currentPath={currentPath} variant="workspace"><main className="platform-workspace-page"><h1 className="platform-home-sr-only">{zh ? "FrameKoi 创作工作台" : "FrameKoi creative workspace"}</h1><div className="platform-home-container">
    <HomepageCarousel title="" locale={locale} className="platform-workspace-models" loop>{workspaceModels.map(card => <HomepageModelCard key={card.id} card={card} locale={locale} compact />)}</HomepageCarousel>
    <section className="platform-workspace-primary"><h2 className="platform-home-sr-only">{zh ? "主要功能" : "Main features"}</h2><div>{primary.map(item => {
      const entry = publicPlatformEntry(item.id);
      return entry && <PlatformLink key={item.id} entry={entry} locale={locale}><span><strong>{item.title}</strong><small>{item.description}</small></span><i><item.icon size={24}/></i><span className="platform-workspace-experience">{zh ? "查看入口" : "Explore"}<ArrowRight size={14}/></span></PlatformLink>;
    })}</div></section>
    <WorkspaceToolSection title={zh ? "视频特效资料" : "Video effect guides"} cards={workspaceVideoTools} locale={locale}/>
    <WorkspaceToolSection title={zh ? "AI 图片工具" : "AI image tools"} cards={workspaceImageTools} locale={locale}/>
    <section className="platform-workspace-community"><div className="platform-home-section-title"><div><h2>{zh ? "创作参考" : "Creative references"}</h2></div></div><p>{zh ? "浏览公开素材，参考不同画面的构图、色彩与风格。" : "Browse public examples of composition, colour and style."}</p><HomepageCommunity locale={locale}/></section>
  </div></main></SiteShell>;
}
function WorkspaceToolSection({ title, cards, locale }: { title: string; cards: HomepageCard[]; locale: Locale }) {
  const entries = cards.filter((card) => publicPlatformEntry(card.id));
  if (!entries.length) return null;
  return <section className="platform-workspace-tools"><HomepageCarousel title={title} locale={locale}>{entries.map(card => <HomepageToolCard key={card.id} card={card} locale={locale} fresh={["ai-kissing-video-generator", "character-animation", "nano-banana", "change-eye-color"].includes(card.id)}/>)}</HomepageCarousel></section>;
}
