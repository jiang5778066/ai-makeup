import type { MetadataRoute } from "next";
import { landingSlugs } from "@/lib/content";
import { locales, localizePath } from "@/lib/i18n";
import { siteUrl } from "@/lib/brand";
import { imageEditPaths } from "@/lib/platform-image-edit-data";
import { localVideoEditorPath } from "@/lib/platform-local-video-editor-data";
import { paperCollagePath } from "@/lib/platform-paper-collage";
import { videoReframePath } from "@/lib/platform-video-reframe-data";
import { isVideoModeToolPath, videoModeTools } from "@/lib/platform-video-mode-tools";
import { videoGuides } from "@/lib/platform-video-guides";

const videoEffectGuides = new Set(["/video-effects/earth-zoom-out", "/video-effects/ai-angel-video-generator"]);

export default function sitemap(): MetadataRoute.Sitemap {
  // 工作台、参数变体与不可用空壳不进入索引清单；没有准确更新时间时不伪造lastModified。
  const paths = [...new Set([
    "/", "/about", "/refund", "/content-moderation-policy", "/pricing", "/explore", "/ai-image-generator", "/ai-video-generator", "/tools/image-to-image-ai",
    localVideoEditorPath,
    videoReframePath,
    ...videoEffectGuides,
    ...Object.keys(videoGuides),
    ...imageEditPaths,
    paperCollagePath,
    ...Object.keys(videoModeTools),
    ...landingSlugs.filter(slug => !["home", "ai-makeup/generator", "ai-makeup/filter"].includes(slug)).map(slug => `/${slug}`)
  ])];
  return paths.flatMap(path => locales.map(locale => ({
    url: `${siteUrl}${localizePath(path, locale)}`,
    alternates: {
      languages: {
        ...Object.fromEntries(locales.map(language => [language, `${siteUrl}${localizePath(path, language)}`])),
        ...(videoEffectGuides.has(path) || path === videoReframePath || isVideoModeToolPath(path) || Object.hasOwn(videoGuides, path) ? { "x-default": `${siteUrl}${path}` } : {}),
      },
    },
  })));
}
