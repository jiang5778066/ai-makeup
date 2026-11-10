import { isCheckoutEnabled } from "@/lib/launch-flags";
import { getPlan } from "@/lib/payments/plans";

// 仅服务端消费者调用；配置值不进入页面属性或错误响应。
export function billingConfiguration() {
  if (!isCheckoutEnabled()) return null;
  const plan = getPlan("credits_100");
  const apiKey = process.env.CREEM_API_KEY;
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  const apiBase = process.env.CREEM_API_BASE ?? "https://api.creem.io";
  if (!plan?.creemProductId || !process.env.CREEM_PRODUCT_CREDITS_100?.trim() || plan.creemProductId !== process.env.CREEM_PRODUCT_CREDITS_100 || !apiKey?.trim() || !webhookSecret?.trim() ||
      !["https://api.creem.io", "https://test-api.creem.io"].includes(apiBase)) return null;
  try {
    const site = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "");
    if (site.username || site.password || site.href !== `${site.origin}/` ||
        !(site.protocol === "https:" || (site.protocol === "http:" && ["localhost", "127.0.0.1"].includes(site.hostname)))) return null;
    return { plan, apiKey, webhookSecret, apiBase, siteUrl: site.origin };
  } catch { return null; }
}
