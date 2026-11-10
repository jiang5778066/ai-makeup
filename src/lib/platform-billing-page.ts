import type { Metadata } from "next";
import { alternateLanguagesForPath, localizePath, type Locale } from "@/lib/i18n";
import { billingConfiguration } from "@/lib/platform-billing-config";
export function billingMetadata(locale: Locale, path = "/pricing"): Metadata {
  const zh = locale === "zh-CN", returning = path === "/billing/return";
  return { title: returning ? (zh ? "付款确认" : "Payment confirmation") : (zh ? "价格与积分" : "Pricing & credits"),
    description: zh ? "100 积分，8 美元一次性购买；新账户一次性赠送 3 积分。" : "100 credits for $8, one time. New accounts receive 3 signup credits once.",
    alternates: { canonical: localizePath(path, locale), languages: alternateLanguagesForPath(path) },
    ...(returning ? { robots: { index: false, follow: true } } : {}) };
}
export function billingAvailable() { return billingConfiguration() !== null; }
