import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { alternateLanguagesForPath, localizePath } from "./i18n";
import { homepageFaqs } from "./platform-homepage-copy";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export function platformHomepageMetadata(locale: Locale, workspace = false): Metadata {
  const zh = locale === "zh-CN";
  const path = workspace ? "/home" : "/";
  const title = workspace ? (zh ? "创作工作台" : "Creative workspace") : (zh ? "图片与视频创作平台" : "Image and video creative platform");
  const description = zh ? "探索图片、视频、模型与特效展示，使用已开放的 AI 美妆和实时试妆。通用图片与视频生成尚未开放；新账户有 3 次美妆生成额度。" : "Explore image, video, model and effect showcases, plus available AI makeup and live try-on. General image and video generation is not available; new accounts receive 3 makeup results.";
  return { title, description, alternates: { canonical: `${siteUrl}${localizePath(path, locale)}`, languages: { ...Object.fromEntries(Object.entries(alternateLanguagesForPath(path)).map(([key, value]) => [key, `${siteUrl}${value}`])), "x-default": `${siteUrl}${path}` } }, openGraph: { title, description, url: `${siteUrl}${localizePath(path, locale)}`, siteName: "Makeup AI", locale, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}
export function platformHomepageSchemas(locale: Locale) {
  return [{ "@context": "https://schema.org", "@type": "WebSite", name: "Makeup AI", inLanguage: locale, url: `${siteUrl}${localizePath("/", locale)}`, description: platformHomepageMetadata(locale).description }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: homepageFaqs[locale].map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }];
}
