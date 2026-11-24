export const brand = {
  name: "FrameKoi",
  tagline: { en: "Your ideas. A wink away.", "zh-CN": "灵感，眨眼成画。" },
  proposedDomain: "framekoi.com"
} as const;

// 正式域名已绑定，部署环境可显式指定站点地址。
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.framekoi.com").replace(/\/$/, "");

export const brandShareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "FrameKoi — Your ideas. A wink away."
};
