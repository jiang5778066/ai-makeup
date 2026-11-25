import type { Metadata } from "next";
import { alternateLanguagesForPath, localizePath, type Locale } from "@/lib/i18n";

export const videoReframePath = "/tools/landscape-to-portrait-video-converter-ai";

export const videoReframeCopy = {
  en: {
    title: "Landscape to portrait preview",
    description: "Open a video, choose a portrait frame, and adjust the crop while you preview a section.",
    scope: "Framing is previewed in your browser. The original file stays intact.",
    frame: "Preview aspect ratio",
    horizontal: "Horizontal framing",
    vertical: "Vertical framing",
    playback: "Preview a playback range"
  },
  "zh-CN": {
    title: "横屏转竖屏预览",
    description: "打开一段视频，选择竖屏比例，调整构图后回放指定片段。",
    scope: "构图仅在浏览器中预览，原文件保持原样。",
    frame: "预览比例",
    horizontal: "左右构图",
    vertical: "上下构图",
    playback: "回放指定片段"
  }
};

export function videoReframeMetadata(locale: Locale): Metadata {
  const { title, description } = videoReframeCopy[locale];
  return {
    title,
    description,
    alternates: {
      canonical: localizePath(videoReframePath, locale),
      languages: { ...alternateLanguagesForPath(videoReframePath), "x-default": videoReframePath }
    }
  };
}
