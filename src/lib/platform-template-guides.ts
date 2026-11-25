import type { Locale } from "./i18n";

type Copy = Readonly<{ title: string; summary: string; framing: string; prompt: string }>;
type Guide = Readonly<Record<Locale, Copy>>;

export const platformTemplateGuides: Readonly<Record<string, Guide>> = {
  "1200": {
    en: {
      title: "Christmas(Heart)",
      summary: "Plan a warm holiday portrait with one clear heart-shaped light reveal.",
      framing: "Use a well-lit portrait with the face centered and uncluttered space around the shoulders. Keep the subject steady and leave room for a soft heart-shaped glow to appear behind them. Describe a gentle light reveal, warm red and gold accents, and a fixed camera.",
      prompt: "Starting from the portrait, keep the person centered and still as a soft red heart-shaped glow gradually appears behind them, with subtle warm gold holiday lights. Preserve the original face, clothing, and background. Gentle light motion, steady camera, no cuts, no text."
    },
    "zh-CN": {
      title: "圣诞爱心",
      summary: "为温暖的节日人像安排一次清晰的爱心光效呈现。",
      framing: "选择光线充足的人像，让脸部居中，并在肩膀周围留出简洁空间。人物保持稳定，让柔和的爱心形光晕从身后显现。描述缓慢的光效变化、暖红与金色点缀，并保持镜头固定。",
      prompt: "从这张人像开始，人物保持居中和静止，身后逐渐浮现柔和的红色爱心光晕，并点缀温暖细腻的金色节日灯光。保留原有五官、衣着和背景。光效轻柔变化，镜头稳定，不切镜，不加文字。"
    }
  },
  "508": {
    en: {
      title: "AI Angel Halo",
      summary: "Frame a calm portrait so a glowing halo appears clearly above the subject.",
      framing: "Choose a clear head-and-shoulders portrait with visible space above the head. Keep the face and pose steady, and describe one small halo forming in place with a soft glow. Avoid extra wings or large camera moves so the halo remains the focus.",
      prompt: "Keep the person in the opening portrait still and recognizable. A small, soft golden halo gradually appears above the head and glows gently. Preserve the original face, hairstyle, clothing, and background. Subtle light shimmer, steady camera, no wings, no cuts, no text."
    },
    "zh-CN": {
      title: "AI 天使光环",
      summary: "为人像留出头顶空间，让发光的光环清晰呈现。",
      framing: "选择清晰的肩部以上人像，并在头顶留出可见空间。人物面部和姿态保持稳定，只描述一个小型光环在原位缓缓显现并柔和发光。避免额外添加翅膀或大幅运镜，让光环成为画面重点。",
      prompt: "保持首帧人物静止且清晰可辨。一个小巧柔和的金色光环在头顶逐渐显现，并轻轻发光。保留原有五官、发型、衣着和背景。光线微微闪烁，镜头稳定，不添加翅膀，不切镜，不加文字。"
    }
  }
};

export function templateGuide(templateId: string, locale: Locale) {
  return platformTemplateGuides[templateId]?.[locale] ?? null;
}
