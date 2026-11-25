import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { alternateLanguagesForPath, localizePath } from "./i18n";
import { brand, brandShareImage } from "./brand";

type CoreToolPath = "/ai-image-generator" | "/ai-video-generator" | "/tools/image-to-image-ai";
const copy: Record<CoreToolPath, Record<Locale, { title: string; description: string }>> = {
  "/ai-image-generator": {
    en: { title: "AI Image Generator: Text & Reference Images", description: "Plan an image from a text prompt or reference photo. Preview local files on FrameKoi and check the generation panel for available modes." },
    "zh-CN": { title: "AI 图片生成器：文字与参考图", description: "在 FrameKoi 用提示词或参考照片构思图片，预览本地文件，并在生成面板查看当前可用模式。" }
  },
  "/ai-video-generator": {
    en: { title: "AI Video Generator: Text & Image to Video", description: "Plan an AI video with a prompt or first-frame image on FrameKoi. Explore text-to-video and image-to-video settings and check the panel for available modes." },
    "zh-CN": { title: "AI 视频生成器：文生视频与图生视频", description: "在 FrameKoi 用提示词或首帧图片构思视频，了解文生视频和图生视频参数，并在生成面板查看当前可用模式。" }
  },
  "/tools/image-to-image-ai": {
    en: { title: "Image to Image AI: Reference Photos & Prompts", description: "Choose a reference photo and describe what you want to change. Explore image-to-image settings on FrameKoi. Generation is not open yet." },
    "zh-CN": { title: "AI 图生图：参考照片与提示词", description: "选择参考照片，描述需要保留或改变的部分，了解 FrameKoi 图生图设置。生成尚未开放。" }
  }
};
export function coreToolMetadata(path: CoreToolPath, locale: Locale): Metadata {
  const { title, description } = copy[path][locale];
  return {
    title, description,
    alternates: { canonical: localizePath(path, locale), languages: { ...alternateLanguagesForPath(path), "x-default": path } },
    openGraph: { title: `${title} | ${brand.name}`, description, siteName: brand.name, images: [brandShareImage], url: localizePath(path, locale), type: "website", locale: locale === "zh-CN" ? "zh_CN" : "en_US" },
    twitter: { card: "summary_large_image", images: [brandShareImage.url], title: `${title} | ${brand.name}`, description }
  };
}
