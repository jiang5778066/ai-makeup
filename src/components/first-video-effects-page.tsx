import type { Metadata } from "next";
import { ArrowRight, CircleAlert } from "lucide-react";
import { FirstVideoEffectsCopyButton } from "@/components/first-video-effects-copy-button";
import { SiteShell } from "@/components/site-shell";
import styles from "@/components/first-video-effects-page.module.css";
import { siteUrl } from "@/lib/brand";
import { localizePath, type Locale } from "@/lib/i18n";

type EffectId = "earth-zoom-out" | "ai-angel-video-generator";
type EffectContent = {
  title: string;
  description: string;
  storyboard: readonly [string, string];
  guidanceTitle: string;
  guidance: string[];
  promptTitle: string;
  prompt: string;
  statusTitle: string;
  status: string;
  imageLink: string;
  directoryLink: string;
};

const effects: Record<EffectId, Record<Locale, EffectContent>> = {
  "earth-zoom-out": {
    en: {
      title: "Earth Zoom Out",
      description: "Plan a single, readable pullback: begin with a place or person in the foreground, then let the camera rise and widen until the landscape becomes the reveal.",
      storyboard: ["Traveler on a ridge", "Ridge and valley from above"],
      guidanceTitle: "Prepare the opening frame",
      guidance: [
        "Choose a sharp photo with one clear foreground subject and a horizon or landscape that can carry the reveal.",
        "Keep the subject near the center and leave visible space around it so the pullback has room to breathe.",
        "Describe one continuous upward and backward camera move. A dramatic jump from ground level to outer space may not fit a very short clip."
      ],
      promptTitle: "Sample image-to-video prompt",
      prompt: "Begin with the traveler centered on the ridge in the opening photo. Lift and pull the camera back in one smooth move so more of the valley and horizon come into view. Keep the traveler and sunlight consistent. No cuts or text.",
      statusTitle: "Service status",
      status: "This dedicated Earth Zoom Out effect has not been verified with a generation service. The general image-to-video entry can be tried separately. Its current Grok mode is limited to 1 second at 480p, so the full ground-to-orbit move may not resolve in one clip.",
      imageLink: "Try the general image-to-video entry",
      directoryLink: "Browse video effects"
    },
    "zh-CN": {
      title: "地球拉远",
      description: "先规划一个清晰连贯的拉远镜头：从前景中的人物或地点开始，让镜头逐渐升高、后退，再揭示远处景观。",
      storyboard: ["山脊上的旅人", "从上方俯看山脊与山谷"],
      guidanceTitle: "准备首帧",
      guidance: [
        "选择清晰的照片，画面有明确的前景主体，并带有可用于揭示空间感的地平线或景观。",
        "主体尽量靠近画面中心，周围留出空间，让镜头后退时有足够的画面余量。",
        "提示词描述一个连续向上、向后的镜头运动。很短的视频可能无法完成从地面瞬间拉到外太空的巨大尺度变化。"
      ],
      promptTitle: "图生视频示例提示词",
      prompt: "从首帧开始，旅人站在山脊上，位于画面中央。镜头沿同一方向平稳升高并后退，带出更多山谷景观和地平线。保持人物和光线一致，不切镜，不加文字。",
      statusTitle: "服务状态",
      status: "地球拉远专用特效尚未经过生成服务验证。你可以单独尝试通用图生视频入口。当前 Grok 模式仅支持 1 秒、480p，未必能在单条短片中完成从地面到轨道的完整镜头。",
      imageLink: "尝试通用图生视频入口",
      directoryLink: "浏览视频特效"
    }
  },
  "ai-angel-video-generator": {
    en: {
      title: "AI Angel Wings",
      description: "Shape a portrait around one clear action: a pair of feathered wings opening behind the subject while the person and camera remain steady.",
      storyboard: ["Portrait with room behind the shoulders", "Wings opening behind the subject"],
      guidanceTitle: "Prepare the opening frame",
      guidance: [
        "Use a well-lit portrait with the shoulders and space behind them visible. A three-quarter or rear view gives the wings room to unfold.",
        "Keep hair, clothing and background separated around the shoulders. Avoid a tight crop or crossed arms that hide the wing roots.",
        "Ask for one symmetrical wing movement and a steady camera. Keep feathers, expression and clothing consistent through the shot."
      ],
      promptTitle: "Sample image-to-video prompt",
      prompt: "A calm portrait from behind as a pair of large white feathered wings slowly unfurl from the person's shoulders, feathers opening evenly on both sides. The person remains still, soft natural backlight, gentle feather motion, steady camera, preserve the original clothing and background, no cuts, no text.",
      statusTitle: "Service status",
      status: "The dedicated angel-wings effect has not been verified with a generation service. The general image-to-video entry can be tried separately. Its current Grok mode is limited to 1 second at 480p, which may not show a complete wing opening.",
      imageLink: "Try the general image-to-video entry",
      directoryLink: "Browse video effects"
    },
    "zh-CN": {
      title: "AI 天使翅膀",
      description: "围绕一个明确动作安排人像：人物保持稳定，一对白羽翅膀从身后缓缓展开。",
      storyboard: ["肩后留有空间的人像", "翅膀从人物身后展开"],
      guidanceTitle: "准备首帧",
      guidance: [
        "使用光线充足的人像照片，露出肩部和身后空间。三分之四侧面或背面视角更适合展开翅膀。",
        "让头发、衣物和背景在肩部周围有所区分。避免过紧裁切或交叉双臂遮住翅膀根部。",
        "只描述一次对称展开的翅膀动作，并保持镜头稳定。让羽毛、表情和衣物在过程中保持一致。"
      ],
      promptTitle: "图生视频示例提示词",
      prompt: "一个平静的背面人像镜头，一对白色大羽翼从人物肩后缓缓展开，羽毛向两侧均匀舒展。人物保持静止，柔和的自然逆光，羽毛轻轻运动，镜头稳定，保留原有衣物和背景，不切镜，不加文字。",
      statusTitle: "服务状态",
      status: "天使翅膀专用特效尚未经过生成服务验证。你可以单独尝试通用图生视频入口。当前 Grok 模式仅支持 1 秒、480p，可能无法展示完整的翅膀展开过程。",
      imageLink: "尝试通用图生视频入口",
      directoryLink: "浏览视频特效"
    }
  }
};

export function firstVideoEffectMetadata(id: EffectId, locale: Locale): Metadata {
  const content = effects[id][locale];
  const path = `/video-effects/${id}`;
  const englishPath = localizePath(path, "en");
  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: `${siteUrl}${localizePath(path, locale)}`,
      languages: {
        en: `${siteUrl}${englishPath}`,
        "zh-CN": `${siteUrl}${localizePath(path, "zh-CN")}`,
        "x-default": `${siteUrl}${englishPath}`
      }
    },
    robots: { index: true, follow: true }
  };
}

export function FirstVideoEffectPage({ id, locale }: { id: EffectId; locale: Locale }) {
  const content = effects[id][locale];
  const zh = locale === "zh-CN";
  const generatorHref = `${localizePath("/ai-video-generator", locale)}?mode=image-to-video&model=grok-imagine`;
  return <SiteShell locale={locale} currentPath={`/video-effects/${id}`} variant="marketing">
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="first-effects-title">
        <div className={styles.intro}>
          <a className={styles.back} href={localizePath("/video-effects", locale)}>{content.directoryLink}</a>
          <h1 id="first-effects-title">{content.title}</h1>
          <p className={styles.description}>{content.description}</p>
          <div className={styles.status}><CircleAlert size={18} aria-hidden="true"/><div><strong>{content.statusTitle}</strong><p>{content.status}</p></div></div>
          <a className={styles.primaryCta} href={generatorHref}>{content.imageLink}<ArrowRight size={17} aria-hidden="true"/></a>
        </div>
        <figure className={styles.storyboard} data-effect={id}>
          <figcaption>{zh ? "镜头构图示意" : "Shot framing sketch"}</figcaption>
          <div className={styles.frames}>
            <div>
              <div className={styles.frame} aria-hidden="true"><span /></div>
              <p><strong>{zh ? "起始画面" : "Start"}</strong>{content.storyboard[0]}</p>
            </div>
            <div>
              <div className={styles.frame} aria-hidden="true"><span /></div>
              <p><strong>{zh ? "动作目标" : "Target motion"}</strong>{content.storyboard[1]}</p>
            </div>
          </div>
        </figure>
      </section>
      <section className={styles.workflow}>
        <h2>{content.guidanceTitle}</h2>
        <ol>{content.guidance.map(line => <li key={line}>{line}</li>)}</ol>
      </section>
      <section className={styles.prompt} aria-labelledby="first-effects-prompt-title">
        <h2 id="first-effects-prompt-title">{content.promptTitle}</h2>
        <blockquote>{content.prompt}</blockquote>
        <FirstVideoEffectsCopyButton prompt={content.prompt} locale={locale}/>
      </section>
    </main>
  </SiteShell>;
}
