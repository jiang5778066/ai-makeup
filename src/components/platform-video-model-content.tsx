"use client";

import {isAdditionalVideoModelPath} from "@/lib/platform-video-model-additional-data";
import type {CoreVideoModelPath} from "@/lib/platform-generator-data";
import {AdditionalVideoModelBody} from "./platform-video-model-additional-content";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { VideoModelPage } from "@/lib/platform-video-model-data";
import { VideoModelReferenceBody } from "./platform-video-model-sections";

export function PlatformVideoModelContent({ page, locale }: { page: VideoModelPage; locale: Locale }) {
  const [open, setOpen] = useState<number[]>([]);
  const zh = locale === "zh-CN";
  const toggle = (index: number) => setOpen((current) => page.faqBehavior === "multiple"
    ? current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    : current.includes(index) ? [] : [index]);
  if(isAdditionalVideoModelPath(page.path))return <AdditionalVideoModelBody path={page.path} locale={locale}/>;
  return <div className={`platform-video-model-content platform-video-model-content-${page.catalogId}`}>
    <VideoModelReferenceBody path={page.path as CoreVideoModelPath} locale={locale}/>
    <section className="platform-video-model-faq" aria-labelledby={`${page.catalogId}-faq-title`}>
      <h2 id={`${page.catalogId}-faq-title`}>{zh ? "常见问题" : `${page.title.en.split(":")[0]} FAQ`}</h2>
      <div>{page.faq.map((item, index) => {
        const expanded = open.includes(index);
        const id = `${page.catalogId}-faq-answer-${index + 1}`;
        return <article key={item.question.en}>
          <h3><button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => toggle(index)}>
            <span>{item.question[locale]}</span><ChevronDown size={18} aria-hidden="true"/>
          </button></h3>
          {expanded && <p id={id}>{item.answer[locale]}</p>}
        </article>;
      })}</div>
    </section>
    <VideoModelReferenceBody path={page.path as CoreVideoModelPath} locale={locale} footer/>
  </div>;
}

