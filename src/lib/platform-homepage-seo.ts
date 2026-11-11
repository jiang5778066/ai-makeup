import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { alternateLanguagesForPath, localizePath } from "./i18n";
import { homepageFaqs } from "./platform-homepage-copy";
import { brand, brandShareImage, siteUrl } from "./brand";

export function platformHomepageMetadata(locale: Locale, workspace = false): Metadata {
  const zh = locale === "zh-CN";
  const path = workspace ? "/home" : "/";
  const title = workspace ? (zh ? "创作工作台" : "Creative workspace") : (zh ? "AI 图片与视频创作" : "AI Image & Video Creation");
  const description = zh
    ? "在 PictoWink 浏览 AI 图片和视频工具，了解提示词、参考图与镜头设置。生成尚未开放；你可以先浏览示例和预览本地文件。"
    : "Explore AI image and video tools on PictoWink. Browse examples, plan a prompt, and preview local files. Generation is not open yet.";
  const url = `${siteUrl}${localizePath(path, locale)}`;
  return {
    title, description,
    ...(workspace ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: url, languages: { ...Object.fromEntries(Object.entries(alternateLanguagesForPath(path)).map(([key, value]) => [key, `${siteUrl}${value}`])), "x-default": `${siteUrl}${path}` } },
    openGraph: { title: `${title} | ${brand.name}`, description, url, siteName: brand.name, images: [brandShareImage], locale: zh ? "zh_CN" : "en_US", type: "website" },
    twitter: { card: "summary_large_image", images: [brandShareImage.url], title: `${title} | ${brand.name}`, description }
  };
}
export function platformHomepageSchemas(locale: Locale) {
  return [
    { "@context": "https://schema.org", "@type": "WebSite", name: brand.name, inLanguage: locale, url: `${siteUrl}${localizePath("/", locale)}`, description: platformHomepageMetadata(locale).description },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: homepageFaqs[locale].map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }
  ];
}
