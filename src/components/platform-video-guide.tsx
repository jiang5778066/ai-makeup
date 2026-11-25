import { ArrowRight } from "lucide-react";
import { SiteShell } from "./site-shell";
import { FirstVideoEffectsCopyButton } from "./first-video-effects-copy-button";
import { guideTranslation, videoGuides, type VideoGuidePath } from "@/lib/platform-video-guides";
import { localizePath, type Locale } from "@/lib/i18n";
import styles from "./first-video-effects-page.module.css";

const targets = {
  image: {
    path: "/ai-video-generator",
    query: "?mode=image-to-video&model=grok-imagine",
    label: ["Open general image to video", "打开通用图生视频"] as const
  },
  text: {
    path: "/ai-video-generator",
    query: "?mode=text-to-video&model=grok-imagine",
    label: ["Open general text to video", "打开通用文生视频"] as const
  },
  editor: {
    path: "/ai-video-editor",
    query: "",
    label: ["Preview a local video segment", "在本机预览视频片段"] as const
  }
};

export function PlatformVideoGuide({ path, locale }: { path: VideoGuidePath; locale: Locale }) {
  const guide = videoGuides[path];
  const zh = locale === "zh-CN";
  const target = targets[guide.next];
  const prompt = guideTranslation(guide.prompt, locale);
  const effectsDirectory = path.startsWith("/video-effects/");
  return (
    <SiteShell locale={locale} currentPath={path} variant="marketing">
      <main className={styles.page}>
        <section className={styles.workflow}>
          <a className={styles.back} href={localizePath(effectsDirectory ? "/video-effects" : "/tools", locale)}>
            {effectsDirectory ? (zh ? "视频特效" : "Video effects") : (zh ? "全部工具" : "All tools")}
          </a>
          <h1>{guideTranslation(guide.title, locale)}</h1>
          <p>{guideTranslation(guide.summary, locale)}</p>
          <div className={styles.status}>
            <p>{guide.next === "editor"
              ? (zh ? "当前提供工作流参考与本机回放。此页的专用转制服务待开放。" : "Use this workflow guide and local playback to prepare your footage. Dedicated conversion is currently unavailable.")
              : (zh ? "当前提供工作流参考和通用生成入口。可用的视频参数与报价以生成面板为准。" : "Use this workflow guide with the general generator. Check the generation panel for available video settings and quotes.")}</p>
          </div>
          <a className={styles.primaryCta} href={localizePath(target.path, locale) + target.query}>
            {guideTranslation(target.label, locale)}<ArrowRight size={17} aria-hidden="true" />
          </a>
        </section>
        <section className={styles.workflow}>
          <h2>{zh ? "准备素材" : "Prepare your material"}</h2>
          <ol>
            <li>{guideTranslation(guide.preparation, locale)}</li>
            <li>{guideTranslation(guide.check, locale)}</li>
          </ol>
        </section>
        <section className={styles.prompt} id="generator" aria-labelledby="video-guide-prompt">
          <h2 id="video-guide-prompt">{zh ? "示例提示词" : "Sample prompt"}</h2>
          <blockquote>{prompt}</blockquote>
          <FirstVideoEffectsCopyButton prompt={prompt} locale={locale} />
        </section>
      </main>
    </SiteShell>
  );
}
