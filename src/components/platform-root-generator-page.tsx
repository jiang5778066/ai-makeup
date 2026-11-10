"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";
import { localizePath, type Locale } from "@/lib/i18n";
import { rootGeneratorPages, type RootGeneratorPage, type RootGeneratorPath, type RootVisual } from "@/lib/platform-root-generator-data";
import { rootGeneratorAsset } from "@/lib/platform-root-generator-media";
import { HomepageVideo } from "./platform-homepage-media";
import { PlatformNavigationLink } from "./platform-navigation-link";
import { SiteShell } from "./site-shell";

function SourceNote({ page, locale }: { page: RootGeneratorPage; locale: Locale }) {
  return <p className="platform-root-generator-source">{locale === "zh-CN" ? "据 " : "According to "}<a href={page.sourceUrl} target="_blank" rel="noreferrer">Lanta AI</a>{locale === "zh-CN" ? " 原页描述，未独立验证；不代表本站的性能、许可、费用或数据安全承诺。" : ": claims have not been independently verified and are not this project's performance, licensing, pricing or data-security promises."}</p>;
}

function RootMedia({ media, locale, label }: { media: RootVisual; locale: Locale; label: string }) {
  const asset = rootGeneratorAsset(media.source);
  const poster = media.poster ? rootGeneratorAsset(media.poster) : undefined;
  const available = asset?.local && (asset.kind !== "video" || poster?.local);
  return <div className="platform-root-generator-media" data-preview-card data-source={media.source} style={{ "--root-media-ratio": media.displayRatio } as CSSProperties}>
    {!available ? <p className="platform-root-generator-media-unavailable">{locale === "zh-CN" ? "此公开示例的本地素材尚不完整。" : "This public example is not fully available locally."}</p> : asset.kind === "video"
      ? <HomepageVideo src={asset.local!} poster={poster!.local!} locale={locale}/>
      // 此处保留原步骤图完整比例；只使用已完整解码的本地原件。
      // eslint-disable-next-line @next/next/no-img-element
      : <img src={asset.local!} alt={label} width={media.width} height={media.height} loading="lazy"/>}
  </div>;
}

function RootFaq({ page, locale }: { page: RootGeneratorPage; locale: Locale }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  return <section className="platform-root-generator-faq" aria-labelledby={`${page.key}-faq-title`}>
    <h2 id={`${page.key}-faq-title`}>{locale === "zh-CN" ? "常见问题" : "Frequently Asked Questions"}</h2>
    <div>{page.faq.map((faq, index) => {
      const id = `${page.key}-faq-${index}`, expanded = open.has(index);
      return <div className="platform-root-generator-faq-item" key={id}>
        <h3><button id={`${id}-question`} type="button" aria-expanded={expanded} aria-controls={`${id}-answer`} onClick={() => setOpen(previous => {
          const next = new Set(previous); if (next.has(index)) next.delete(index); else next.add(index); return next;
        })}>{faq.question[locale]}<ChevronDown size={20} aria-hidden="true"/></button></h3>
        <div id={`${id}-answer`} role="region" aria-labelledby={`${id}-question`} hidden={!expanded}><p>{faq.answer[locale]}</p><SourceNote page={page} locale={locale}/></div>
      </div>;
    })}</div>
  </section>;
}

export function PlatformRootGeneratorPage({ path, locale }: { path: RootGeneratorPath; locale: Locale }) {
  const page: RootGeneratorPage = rootGeneratorPages[path];
  const zh = locale === "zh-CN";
  const names: Record<string, string> = { cog: "CogVideoX", hunyuan: "Hunyuan Video", mochi: "Mochi 1" };
  const name = names[page.key];
  const title = page.title[locale];
  const cta = <PlatformNavigationLink className="platform-root-generator-cta" href={localizePath(page.cta.href, locale)}>{page.cta.label[locale]}</PlatformNavigationLink>;
  const loraNotice = zh ? "样例展示，未自动应用该 LoRA。" : "Sample showcase; this LoRA is not automatically applied.";
  return <SiteShell locale={locale} currentPath={path}><main className={`platform-root-generator-page platform-root-generator-${page.key}`} data-root-generator-path={path} data-generation-availability="unavailable">
    {page.cards ? <>
      <header className="platform-root-generator-library-heading"><h1>{title}</h1><span className="platform-root-generator-new">{zh ? "新" : "NEW"}</span><p>{page.subtitle?.[locale]}</p>{cta}<p className="platform-root-generator-notice">{loraNotice} {zh ? "生成服务尚未开放。" : "Generation is not available yet."}</p></header>
      <section className="platform-root-generator-library" aria-label={zh ? "LoRA 风格样例" : "LoRA style showcases"}>{page.cards.map((card, index) => <article key={card.title.en}>
        <div className="platform-root-generator-card-visual"><RootMedia media={card.media} locale={locale} label={card.title[locale]}/><h2>{card.title[locale]}</h2></div>
        <div className="platform-root-generator-card-copy"><p>{card.text[locale]}</p><PlatformNavigationLink className="platform-root-generator-card-cta" href={localizePath(page.cta.href, locale)} data-lora-card={index}>{zh ? "使用此 LoRA 创作" : "Create with LoRA"}</PlatformNavigationLink><small>{loraNotice}</small></div>
      </article>)}</section>
      <SourceNote page={page} locale={locale}/>
    </> : <>
      <header className="platform-root-generator-hero"><div className="platform-root-generator-hero-copy"><h1>{name && title.startsWith(name) ? <><span>{name}</span>{title.slice(name.length)}</> : title}</h1><ul>{page.bullets?.map(bullet => <li key={bullet.en}>{bullet[locale]}</li>)}</ul>{cta}</div>{page.hero && <RootMedia media={page.hero} locale={locale} label={title}/>}</header>
      <SourceNote page={page} locale={locale}/>
      <p className="platform-root-generator-notice">{page.key === "mochi" ? (zh ? "入口保留原模型编号102；该型号尚未登记，不会自动替换成其它模型。" : "The original model ID 102 is preserved. It is not registered and will not be silently replaced.") : (zh ? "公开模型介绍与示例；进入通用生成器后请核对当前型号。" : "Public model information and examples. Check the current model in the general generator.")} {zh ? "生成服务尚未开放。" : "Generation is not available yet."}</p>
    </>}
    {page.steps && <section className="platform-root-generator-steps"><h2>{page.stepsTitle?.[locale]}</h2><div>{page.steps.map(step => <article key={step.title.en}><RootMedia media={step.media} locale={locale} label={step.title[locale]}/><h3>{step.title[locale]}</h3><p>{step.text[locale]}</p></article>)}</div><SourceNote page={page} locale={locale}/></section>}
    {page.features && <section className="platform-root-generator-features"><h2>{page.featuresTitle?.[locale]}</h2><div className="platform-root-generator-feature-list">{page.features.map(feature => <article key={feature.title.en}><div className="platform-root-generator-feature-copy"><h3>{feature.title[locale]}</h3><p>{feature.text[locale]}</p><SourceNote page={page} locale={locale}/></div><RootMedia media={feature.media} locale={locale} label={feature.title[locale]}/></article>)}</div><SourceNote page={page} locale={locale}/></section>}
    {page.faq.length > 0 && <RootFaq key={path} page={page} locale={locale}/>}
    {page.meet && <section className="platform-root-generator-meet"><h2>{page.meet.title[locale]}</h2>{page.meet.paragraphs.map(paragraph => <p key={paragraph.en}>{paragraph[locale]}</p>)}<SourceNote page={page} locale={locale}/></section>}
  </main></SiteShell>;
}
