import type { Metadata } from "next";
import { alternateLanguagesForPath, localizePath, type Locale } from "./i18n";

const videoGenerator = { kind: "video", family: "video", defaultModel: "grok-imagine" } as const;

export const videoModeTools = {
  "/tools/ai-image-to-video": {
    ...videoGenerator,
    mode: "image",
    title: { en: "AI Image to Video", "zh-CN": "AI 图生视频" },
    modeLabel: { en: "Image to Video", "zh-CN": "图生视频" },
    description: {
      en: "Use a photo or illustration as the first frame. Describe how the subject or camera should move to make a short product shot or animate a still scene.",
      "zh-CN": "用照片或插画作为首帧，描述主体动作或镜头运动，制作产品短镜头或让静态画面动起来。"
    },
    otherTool: "/tools/ai-text-to-video"
  },
  "/tools/ai-text-to-video": {
    ...videoGenerator,
    mode: "text",
    title: { en: "AI Text to Video", "zh-CN": "AI 文生视频" },
    modeLabel: { en: "Text to Video", "zh-CN": "文生视频" },
    description: {
      en: "Describe a subject, an action and a camera angle in a prompt to turn a storyboard idea into a short video draft.",
      "zh-CN": "在提示词中描述主体、动作和镜头角度，把分镜构想做成一段视频草稿。"
    },
    otherTool: "/tools/ai-image-to-video"
  }
} as const;

export type VideoModeToolPath = keyof typeof videoModeTools;

export function isVideoModeToolPath(path: string): path is VideoModeToolPath {
  return Object.hasOwn(videoModeTools, path);
}

export function videoModeToolMetadata(path: VideoModeToolPath, locale: Locale): Metadata {
  const { title, description } = videoModeTools[path];
  return {
    title: title[locale],
    description: description[locale],
    alternates: {
      canonical: localizePath(path, locale),
      languages: { ...alternateLanguagesForPath(path), "x-default": path }
    }
  };
}
