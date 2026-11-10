"use client";

import { useId, useRef, useState } from "react";
import { ArrowRight, Plus, Minus, ImageIcon, Video, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { homepageFaqs } from "@/lib/platform-homepage-copy";
import { homepageScenes, imageEffects, videoEffects } from "@/lib/platform-homepage-data";
import { homepageEntry } from "@/lib/platform-homepage";
import { HomepageCardImage, HomepageCta, HomepageToolCard } from "./platform-homepage-cards";
import { PlatformLink } from "./platform-link";

export function HomepageEffects({ locale }: { locale: Locale }) {
  const [tab, setTab] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const labels = locale === "zh-CN" ? ["视频特效", "图片特效"] : ["Video effects", "Image effects"];
  return <section className="platform-home-section platform-home-effects" data-home-section="effects"><div className="platform-home-container">
    <div className="platform-home-effects-heading"><h2>{locale === "zh-CN" ? "热门 AI 特效" : "Popular AI effects"}</h2>
      <div role="tablist" aria-label={locale === "zh-CN" ? "热门 AI 特效" : "Popular AI effects"}>{labels.map((label, i) => <button key={label} ref={(el) => { buttons.current[i] = el; }} type="button" role="tab" id={`${uid}-tab-${i}`} aria-controls={`${uid}-panel`} aria-selected={tab === i} tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)} onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - i; setTab(next); buttons.current[next]?.focus();
      }}>{i === 0 ? <Video size={16} /> : <ImageIcon size={16} />}{label}</button>)}</div>
    </div>
    <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab}`}><div className="platform-home-effects-grid">{(tab === 0 ? videoEffects : imageEffects).map(card => <HomepageToolCard key={card.id} card={card} locale={locale} />)}</div>
      <div className="platform-home-align-end"><HomepageCta id={tab === 0 ? "video-effects" : "image-effects"} locale={locale} secondary>{locale === "zh-CN" ? `查看全部${labels[tab]}` : `View all ${labels[tab]}`}</HomepageCta></div>
    </div>
  </div></section>;
}

export function HomepageScenes({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState(0);
  const scene = homepageScenes[selected];
  const actions = locale === "zh-CN" ? ["创建社交视频", "创建产品视频", "创建广告视频", "创作故事视频", "创建教育视频"] : ["Create social videos", "Create product videos", "Create ad videos", "Create story videos", "Create educational videos"];
  return <section className="platform-home-scenes" data-home-section="scenes"><div className="platform-home-container"><h2>{locale === "zh-CN" ? "为每一种场景生成 AI 视频" : "AI video for every use case"}</h2>
    <div className="platform-home-scene-buttons" role="group" aria-label={locale === "zh-CN" ? "使用场景" : "Use cases"}>{homepageScenes.map((item, i) => <button key={item.label.en} type="button" aria-pressed={i === selected} onClick={() => setSelected(i)}>{item.label[locale]}</button>)}</div>
    <div className="platform-home-scene-content"><div><h3>{scene.title[locale]}</h3><p>{scene.description[locale]}</p><PlatformLink entry={homepageEntry("video-generator", { mode: "image-to-video" })} locale={locale} className="platform-home-cta">{actions[selected]}<ArrowRight size={16} /></PlatformLink></div>
      <figure key={selected}><HomepageCardImage src={scene.image} alt={scene.caption[locale]} /><figcaption><p>{scene.caption[locale]}</p><span aria-hidden="true"><Sparkles size={56}/></span></figcaption></figure>
    </div>
  </div></section>;
}

export function HomepageFaq({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set());
  const uid = useId();
  return <section className="platform-home-faq" data-home-section="faq"><div className="platform-home-container"><h2>{locale === "zh-CN" ? "关于 Makeup AI 创作平台的常见问题" : "Frequently asked questions about Makeup AI"}</h2>
    <div className="platform-home-faq-list">{homepageFaqs[locale].map((faq, i) => <article key={faq.question}>
      <h3><button type="button" id={`${uid}-question-${i}`} aria-expanded={open.has(i)} aria-controls={`${uid}-answer-${i}`} onClick={() => setOpen(previous => { const next = new Set(previous); if (next.has(i)) next.delete(i); else next.add(i); return next; })}>{faq.question}<span>{open.has(i) ? <Minus size={16}/> : <Plus size={16}/>}</span></button></h3>
      <div id={`${uid}-answer-${i}`} role="region" aria-labelledby={`${uid}-question-${i}`} hidden={!open.has(i)}><p>{faq.answer}</p></div>
    </article>)}</div>
  </div></section>;
}
