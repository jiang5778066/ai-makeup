"use client";

import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { templateGuide } from "@/lib/platform-template-guides";
import { FirstVideoEffectsCopyButton } from "./first-video-effects-copy-button";
import { SiteShell } from "./site-shell";
import styles from "./first-video-effects-page.module.css";

export function PlatformTemplateGuide({ templateId, locale }: { templateId: string; locale: Locale }) {
  const guide = templateGuide(templateId, locale);
  if (!guide) return null;
  const zh = locale === "zh-CN";
  const generator = `${zh ? "/zh-CN" : ""}/ai-video-generator?mode=image-to-video&model=grok-imagine`;
  return <SiteShell locale={locale} currentPath="/video-effects/lab" variant="marketing">
    <main className={styles.page}>
      <section className={styles.workflow}>
        <a className={styles.back} href={zh ? "/zh-CN/video-effects" : "/video-effects"}>{zh ? "视频特效" : "Video effects"}</a>
        <h1>{guide.title}</h1>
        <p className={styles.description}>{guide.summary}</p>
        <div className={styles.status}><p>{zh ? "此页提供构图指南与提示词参考。对应模板的专用生成服务尚未开放，通用图生视频入口不代表该模板已接入。" : "This page provides framing guidance and a prompt example. The dedicated service for this template is not available yet. The general image-to-video entry does not indicate template support."}</p></div>
        <a className={styles.primaryCta} href={generator}>{zh ? "打开通用图生视频" : "Open general image to video"}<ArrowRight size={17} aria-hidden="true"/></a>
      </section>
      <section className={styles.workflow}>
        <h2>{zh ? "构图指导" : "Framing guidance"}</h2>
        <p>{guide.framing}</p>
      </section>
      <section className={styles.prompt} id="generator" aria-labelledby="template-guide-prompt">
        <h2 id="template-guide-prompt">{zh ? "示例提示词" : "Sample prompt"}</h2>
        <blockquote>{guide.prompt}</blockquote>
        <FirstVideoEffectsCopyButton prompt={guide.prompt} locale={locale}/>
      </section>
    </main>
  </SiteShell>;
}
