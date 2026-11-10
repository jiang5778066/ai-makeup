import type { CreationStatus } from "@/lib/platform-creations-types";
import type { Locale } from "@/lib/i18n";
export const creationStatusText = (status: CreationStatus, locale: Locale) => ({
  queued: ["Queued", "排队中"], moderating: ["Reviewing", "审核中"], running: ["Processing", "处理中"], failed: ["Failed · check your balance for any credit return", "生成失败 · 额度退回情况请核对实际余额"], refunded: ["Failed · credit returned", "失败 · 额度已退回"], done: ["Ready", "已完成"], reconciling: ["Awaiting reconciliation", "待核对"]
}[status]?.[locale === "zh-CN" ? 1 : 0] ?? (locale === "zh-CN" ? "待核对" : "Awaiting reconciliation"));
export const creationFilterText = (filter: string, locale: Locale) => ({ all: ["All", "全部"], image: ["Images", "图片"], video: ["Videos", "视频"], full_face: ["Full face", "全脸美妆"], lipstick: ["Lipstick", "口红"], foundation: ["Foundation", "粉底"], blush: ["Blush", "腮红"], eyeshadow: ["Eyeshadow", "眼影"], eyeliner: ["Eyeliner", "眼线"], mascara: ["Mascara", "睫毛"], brows: ["Brows", "眉妆"], contour: ["Contour", "修容"], highlight: ["Highlight", "高光"] } as Record<string, string[]>)[filter]?.[locale === "zh-CN" ? 1 : 0] ?? filter;
