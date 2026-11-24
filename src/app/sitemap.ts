import type { MetadataRoute } from "next";
import { landingSlugs } from "@/lib/content";
import { locales, localizePath } from "@/lib/i18n";
import { siteUrl } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  // 工作台、参数变体与不可用空壳不进入索引清单；没有准确更新时间时不伪造lastModified。
  const paths = [...new Set([
    "/", "/about", "/refund", "/content-moderation-policy", "/pricing", "/ai-image-generator", "/ai-video-generator", "/tools/image-to-image-ai",
    ...landingSlugs.filter(slug => !["home", "ai-makeup/generator", "ai-makeup/filter"].includes(slug)).map(slug => `/${slug}`)
  ])];
  return paths.flatMap(path => locales.map(locale => ({
    url: `${siteUrl}${localizePath(path, locale)}`,
    alternates: { languages: Object.fromEntries(locales.map(language => [language, `${siteUrl}${localizePath(path, language)}`])) }
  })));
}
