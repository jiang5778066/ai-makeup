import type { Metadata } from "next";
import { alternateLanguagesForPath, localizePath, type Locale } from "@/lib/i18n";

export const videoReframePath = "/tools/landscape-to-portrait-video-converter-ai";

export const videoReframeCopy = {
  en: {
    title: "Preview Landscape Video in 9:16 or 4:5",
    description: "See how a landscape video fits a 9:16 or 4:5 frame. Move the crop and play a selected section in your browser.",
    guideTitle: "How to preview a vertical crop",
    steps: [
      "Choose a landscape video or try the six-second sample.",
      "Select 9:16 for a taller frame or 4:5 for a wider portrait frame. Move the framing slider to keep the subject in view.",
      "Set the start and end times and select Play selection. Check whether the subject stays in frame as it moves."
    ],
    comparisonTitle: "Compare crops from the same frame",
    comparisonDescription: "A centered 9:16 crop retains less of the path than 4:5.",
    original: "Original 16:9",
    frameDescription: "A cyclist on a path beside a river",
    scope: "Browser preview only. Video export is unavailable.",
    frame: "Preview aspect ratio",
    horizontal: "Horizontal framing",
    vertical: "Vertical framing",
    playback: "Preview a playback range"
  },
  "zh-CN": {
    title: "横屏转竖屏预览（9:16 和 4:5）",
    description: "查看横屏视频在 9:16 或 4:5 画框中的效果。可调整构图，在浏览器中回放指定片段。",
    guideTitle: "如何预览竖屏构图",
    steps: [
      "选择横屏视频，或试用这段 6 秒样片。",
      "选择较高的 9:16 或较宽的 4:5 画框，再用构图滑块把主体移入画面。",
      "设置播放起止时间，点击「播放选区」，检查移动中的主体是否一直在画框内。"
    ],
    comparisonTitle: "比较同一帧的构图",
    comparisonDescription: "居中构图时，9:16 画框保留的路面比 4:5 少。",
    original: "原画面 16:9",
    frameDescription: "骑行者沿着河边小径行进",
    scope: "构图仅在浏览器中预览，暂不支持导出。",
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
