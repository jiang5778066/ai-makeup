export const brand = {
  name: "PictoWink",
  tagline: { en: "Your ideas. A wink away.", "zh-CN": "灵感，眨眼成画。" },
  proposedDomain: "pictowink.com"
} as const;

// 暂定域名在完成绑定前不能成为规范地址；部署环境可显式指定正式主域。
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ai-makeup-rosy.vercel.app").replace(/\/$/, "");

export const brandShareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "PictoWink — Your ideas. A wink away."
};
