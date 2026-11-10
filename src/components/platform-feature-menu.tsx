import { Video, ImageIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { featureDescriptions, featureGroups, platformEntry } from "@/lib/platform-navigation";
import { PlatformLink } from "./platform-link";

export function PlatformFeatureMenu({ locale, onNavigate }: Readonly<{ locale: Locale; onNavigate: () => void }>) {
  return <section id="platform-feature-menu" className="platform-feature-menu" role="region" aria-label={locale === "zh-CN" ? "功能" : "Features"}>
    <div className="platform-feature-grid">
      <div className="platform-feature-preview"><video src="/videos/platform/video-style-preview.mp4" poster="/images/platform/video-style-preview.jpg" autoPlay muted loop playsInline preload="metadata" aria-label={locale === "zh-CN" ? "视频风格转换演示" : "Video style conversion preview"} /><div><h2>{locale === "zh-CN" ? "视频转视频" : "Video to Video"}</h2><p>{featureDescriptions["video-styler"][locale]}</p></div></div>
      {featureGroups.map((group, index) => <div className="platform-feature-column" key={group.label.en}>
        <h2>{index === 0 ? <Video size={20} /> : <ImageIcon size={20} />}{group.label[locale]}</h2>
        {group.ids.map((id) => {
          const entry = platformEntry(id);
          return <PlatformLink key={id} entry={entry} locale={locale} className="platform-feature-link" onNavigate={onNavigate}>
            <div><strong>{id === "makeup" && locale === "zh-CN" ? "AI 美妆" : id === "gpt-image" ? "GPT Image 2" : id === "video-generator" && locale === "zh-CN" ? "AI视频生成" : id === "image-styler" && locale === "zh-CN" ? "图片风格转换" : entry.label[locale]}{["video-generator", "lip-sync", "character-animation", "nano-banana"].includes(id) && <small className={id === "video-generator" ? "platform-feature-badge hot" : "platform-feature-badge"}>{locale === "zh-CN" ? (id === "video-generator" ? "热门" : "新品") : (id === "video-generator" ? "Hot" : "New")}</small>}</strong><p>{featureDescriptions[id][locale]}</p></div>
          </PlatformLink>;
        })}
      </div>)}
    </div>
  </section>;
}
