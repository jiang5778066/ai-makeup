import type { Locale } from "./i18n";
import { localizePath } from "./i18n";
import { referenceEntries } from "./platform-catalog";

export type PlatformMode = "image-to-video" | "text-to-video" | "image-to-image" | "text-to-image";
export type PlatformEntry = Readonly<{
  id: string;
  referencePath?: string;
  pathname: string;
  label: Readonly<Record<Locale, string>>;
  status: "ready" | "scaffold" | "pending";
  localized?: boolean;
  query?: Readonly<Record<string, string>>;
  hash?: string;
  mode?: PlatformMode;
  model?: string;
  templateId?: string;
  aliases?: readonly string[];
}>;

const makeupParts = [
  ["ai-lipstick-try-on", "口红", "Lipstick"], ["ai-foundation-makeup", "粉底", "Foundation"],
  ["ai-blush-makeup", "腮红", "Blush"], ["ai-eyeshadow", "眼影", "Eyeshadow"],
  ["ai-eyeliner", "眼线", "Eyeliner"], ["ai-mascara", "睫毛", "Mascara"],
  ["ai-eyebrow", "眉毛", "Brows"], ["ai-contour-makeup", "修容", "Contour"],
  ["ai-highlighter-makeup", "高光", "Highlight"]
] as const;

export const compatibilityEntries: readonly PlatformEntry[] = [
  { id: "live-try-on", pathname: "/virtual-makeup-try-on", label: { en: "Live Try-On", "zh-CN": "实时试妆" }, status: "ready" },
  ...makeupParts.map(([id, zh, en]): PlatformEntry => ({ id, pathname: `/${id}`, label: { en, "zh-CN": zh }, status: "ready" }))
];
export const platformEntries: readonly PlatformEntry[] = [...referenceEntries, ...compatibilityEntries];
const entriesById = new Map(platformEntries.map((entry) => [entry.id, entry]));
export function platformEntry(id: string): PlatformEntry {
  const entry = entriesById.get(id);
  if (!entry) throw new Error(`未知平台入口：${id}`);
  return entry;
}

export function entryHref(entry: PlatformEntry, locale: Locale): string {
  const pathname = entry.localized === false ? entry.pathname : localizePath(entry.pathname, locale);
  const query = new URLSearchParams(entry.query).toString();
  return `${pathname}${query ? `?${query}` : ""}${entry.hash ? `#${entry.hash}` : ""}`;
}

function parsePath(path: string): URL {
  return new URL(path, "https://platform.invalid");
}
function unlocalizedPath(pathname: string): string {
  return pathname.replace(/^\/(?:zh-CN|zh|en)(?=\/|$)/, "").replace(/\/$/, "") || "/";
}
export function switchPlatformLocale(path: string, locale: Locale): string {
  const url = parsePath(path);
  const pathname = unlocalizedPath(url.pathname);
  const localized = /^\/(?:login|dashboard|auth|legal)(?:\/|$)/.test(pathname) ? pathname : localizePath(pathname, locale);
  return `${localized}${url.search}${url.hash}`;
}
export function isEntryActive(entry: PlatformEntry, currentPath: string): boolean {
  const url = parsePath(currentPath);
  const pathname = unlocalizedPath(url.pathname);
  if (![entry.pathname, ...(entry.aliases ?? [])].includes(pathname)) return false;
  return Object.entries(entry.query ?? {}).every(([key, value]) => url.searchParams.get(key) === value);
}

export const primaryEntryIds = ["home", "community", "creations"] as const;
export const sidebarGroups = [
  { label: { en: "AI Video", "zh-CN": "AI 视频" }, ids: ["video-generator", "video-effects", "dance"] },
  { label: { en: "AI Image", "zh-CN": "AI 图片" }, ids: ["image-generator", "image-effects"] },
  { label: { en: "Featured", "zh-CN": "精选功能" }, ids: ["happy-horse", "seedance", "gpt-image", "makeup", "image-styler", "lip-sync", "age"] }
] as const;
export const featureGroups = [
  { label: { en: "Video", "zh-CN": "视频" }, ids: ["video-styler", "video-generator", "lip-sync", "character-animation", "video-editor"] },
  { label: { en: "Image", "zh-CN": "图片" }, ids: ["nano-banana", "gpt-image", "image-editor", "image-styler", "makeup"] }
] as const;
export const featureDescriptions: Record<string, Record<Locale, string>> = {
  "video-styler": { en: "Transform videos into different styles", "zh-CN": "将视频转换成不同风格" },
  "video-generator": { en: "Image to video & text to video", "zh-CN": "图生视频 & 文生视频" },
  "lip-sync": { en: "Create realistic talking characters", "zh-CN": "创建逼真的会说话人物" },
  "character-animation": { en: "Turn images into character animations", "zh-CN": "将图像转化为角色动画" },
  "video-editor": { en: "Prompt-driven AI video editor", "zh-CN": "提示词驱动的 AI 视频编辑器" },
  "nano-banana": { en: "AI image generator and photo editor", "zh-CN": "AI图片生成器和照片编辑器" },
  "gpt-image": { en: "Clearer AI image generation and editing", "zh-CN": "更清晰的 AI 图像生成与编辑" },
  "image-editor": { en: "Edit images with a prompt", "zh-CN": "用提示词编辑图像" },
  "image-styler": { en: "Transform images into different styles", "zh-CN": "将图片转换成不同风格" },
  makeup: { en: "Transform your look with AI makeup", "zh-CN": "用 AI 美妆改变妆容" }
};

export type FooterItem = Readonly<{ id: string; label?: Readonly<Record<Locale, string>> }>;
export const footerCandidateEntries: readonly PlatformEntry[] = [
  { id: "guides", pathname: "/guides", label: { en: "AI Creation Guides", "zh-CN": "AI 创作指南" }, status: "pending" },
  { id: "image-video-guide", pathname: "/guides/ai-image-to-video", label: { en: "AI Image to Video Guide", "zh-CN": "AI 图像转视频指南" }, status: "pending" },
  { id: "image-guide", pathname: "/guides/ai-image-creation", label: { en: "AI Image Creation Guide", "zh-CN": "AI 图像创作指南" }, status: "pending" },
  { id: "blog", pathname: "/blog", label: { en: "Blog", "zh-CN": "博客" }, status: "pending" },
  { id: "about", pathname: "/about", label: { en: "About Makeup AI", "zh-CN": "关于 Makeup AI" }, status: "pending" },
  { id: "refund", pathname: "/refund", label: { en: "Refund Policy", "zh-CN": "退款政策" }, status: "pending" },
  { id: "moderation-policy", pathname: "/content-moderation-policy", label: { en: "Content Moderation Policy", "zh-CN": "内容审核政策" }, status: "pending" }
];
export const footerGroups: readonly { label: Record<Locale, string>; items: readonly FooterItem[] }[] = [
  { label: { en: "Features", "zh-CN": "功能" }, items: [
    { id: "video-generator", label: { en: "AI Video Generator", "zh-CN": "AI视频生成" } }, { id: "dance" },
    { id: "image-generator", label: { en: "AI Image Generator", "zh-CN": "AI图像生成" } }, { id: "tools" }, { id: "image-to-video" }, { id: "text-to-video" },
    { id: "video-styler" }, { id: "makeup", label: { en: "AI Makeup", "zh-CN": "AI 美妆" } }, { id: "lip-sync" },
    { id: "video-to-ghibli-style", label: { en: "Video to Ghibli Style", "zh-CN": "视频转吉卜力风格" } },
    { id: "image-to-ghibli-style", label: { en: "Image to Ghibli Style", "zh-CN": "图片转吉卜力风格" } }, { id: "image-effects" }, { id: "video-effects" }
  ] },
  { label: { en: "Video Effects", "zh-CN": "视频特效" }, items: [
    { id: "ai-kissing-video-generator", label: { en: "AI Kissing Video Generator", "zh-CN": "AI接吻视频生成器" } },
    { id: "ai-french-kiss-video-generator", label: { en: "AI French Kiss Video Generator", "zh-CN": "AI法式接吻视频生成器" } },
    { id: "ai-hug-video-generator", label: { en: "AI Hug Video Generator", "zh-CN": "AI拥抱视频" } },
    { id: "ai-muscle-video", label: { en: "AI Muscle Video", "zh-CN": "AI肌肉视频" } },
    { id: "earth-zoom-out", label: { en: "Earth Zoom Out", "zh-CN": "地球缩放效果" } }
  ] },
  { label: { en: "AI Guides & Learning", "zh-CN": "AI 指南与学习" }, items: ["guides", "image-video-guide", "image-guide", "blog"].map((id) => ({ id })) },
  { label: { en: "Models", "zh-CN": "模型" }, items: [
    { id: "video-models" }, { id: "image-models" }, { id: "seedance" }, { id: "happy-horse", label: { en: "Happy Horse 1.0", "zh-CN": "Happy Horse 1.0" } },
    ...[["kling-3-0", "Kling 3.0"], ["kling-ai", "Kling AI"], ["grok-imagine", "Grok Imagine"], ["sora-2", "Sora 2"], ["wan-2-2", "Wan 2.2"], ["veo-3", "Veo 3"]].map(([id, name]) => ({ id, label: { en: name, "zh-CN": name } })),
    { id: "gpt-image", label: { en: "GPT Image 2", "zh-CN": "GPT Image 2" } }, { id: "nano-banana" }
  ] }
];
