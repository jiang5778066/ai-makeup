import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { alternateLanguagesForPath, localizePath } from "./i18n";
import { homepageFaqs } from "./platform-homepage-copy";
import { brand, brandShareImage, siteUrl } from "./brand";

const homepageDescriptions: Record<Locale, string> = {
  en: "Explore AI image and video tools on FrameKoi. Browse public examples, plan a prompt, and check each tool’s generation panel for available modes.",
  "zh-CN": "在 FrameKoi 浏览 AI 图片与视频工具和公开示例，构思提示词，并在各生成面板查看当前可用模式。"
};
const workspaceDescriptions: Record<Locale, string> = {
  en: "Open image and video tools in the FrameKoi workspace. Explore model settings, preview local files, and check the generation panel for available modes.",
  "zh-CN": "在 FrameKoi 创作工作台打开图片与视频工具，了解模型参数、预览本地文件，并在生成面板查看当前可用模式。"
};

export function platformHomepageMetadata(locale: Locale, workspace = false): Metadata {
  const zh = locale === "zh-CN";
  const path = workspace ? "/home" : "/";
  const title = workspace ? (zh ? "创作工作台" : "Creative workspace") : (zh ? "AI 图片与视频创作" : "AI Image & Video Creation");
  const description = (workspace ? workspaceDescriptions : homepageDescriptions)[locale];
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
