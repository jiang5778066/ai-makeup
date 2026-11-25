import { Video, ImageIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { featureDescriptions, featureGroups, publicPlatformEntries } from "@/lib/platform-navigation";
import { PlatformLink } from "./platform-link";

export function PlatformFeatureMenu({ locale, onNavigate }: Readonly<{ locale: Locale; onNavigate: () => void }>) {
  return <section id="platform-feature-menu" className="platform-feature-menu" role="region" aria-label={locale === "zh-CN" ? "功能" : "Features"}>
    <div className="platform-feature-grid">
      <div className="platform-feature-preview"><video src="/videos/platform/video-style-preview.mp4" poster="/images/platform/video-style-preview.jpg" autoPlay muted loop playsInline preload="metadata" aria-label={locale === "zh-CN" ? "视频风格转换示例" : "Video style example"} /><div><h2>{locale === "zh-CN" ? "视频风格示例" : "Video style example"}</h2><p>{locale === "zh-CN" ? "观察同一段动作在不同画面风格下的效果。" : "See how the same movement looks in different visual styles."}</p></div></div>
      {featureGroups.map(({ label, ids }, index) => {
        const entries = publicPlatformEntries(ids);
        return entries.length ? <div className="platform-feature-column" key={label.en}>
          <h2>{index === 0 ? <Video size={20} /> : <ImageIcon size={20} />}{label[locale]}</h2>
          {entries.map((entry) => {
            const { id } = entry;
            return <PlatformLink key={id} entry={entry} locale={locale} className="platform-feature-link" onNavigate={onNavigate}>
              <div><strong>{id === "makeup" && locale === "zh-CN" ? "AI 美妆" : id === "gpt-image" ? "GPT Image 2" : id === "video-generator" && locale === "zh-CN" ? "AI视频生成" : id === "image-styler" && locale === "zh-CN" ? "图片风格转换" : entry.label[locale]}{["video-generator", "nano-banana"].includes(id) && <small className={id === "video-generator" ? "platform-feature-badge hot" : "platform-feature-badge"}>{locale === "zh-CN" ? (id === "video-generator" ? "热门" : "新品") : (id === "video-generator" ? "Hot" : "New")}</small>}</strong><p>{featureDescriptions[id][locale]}</p></div>
            </PlatformLink>;
          })}
        </div> : null;
      })}
    </div>
  </section>;
}
