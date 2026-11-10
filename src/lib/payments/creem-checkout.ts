import { billingConfiguration } from "@/lib/platform-billing-config";
import type { Plan } from "./plans";
import { trustedCheckoutUrl } from "@/lib/platform-billing-security";

export async function createCreemCheckout(args: {
  plan: Plan;
  userId: string;
  email: string;
  siteUrl: string;
  locale?: string;
  requestId: string;
  attemptId: string;
}): Promise<string> {
  const config = billingConfiguration();
  if (!config || args.siteUrl !== config.siteUrl || args.plan.id !== config.plan.id || args.plan.creemProductId !== config.plan.creemProductId) throw new Error("creem_unconfigured");
  if (!args.requestId || !args.attemptId) throw new Error("creem_attempt_missing");
  const { apiKey, apiBase } = config;
  const site = new URL(config.siteUrl);
  const response = await fetch(`${apiBase}/v1/checkouts`, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: args.plan.creemProductId,
      request_id: args.requestId,
      customer: { email: args.email },
      success_url: `${site.origin}${args.locale === "zh-CN" ? "/zh-CN" : ""}/billing/return`,
      metadata: { userId: args.userId, planId: args.plan.id, attemptId: args.attemptId }
    })
  });
  if (!response.ok) throw new Error("creem_checkout_failed");
  const data: unknown = await response.json();
  const url = data && typeof data === "object" && "checkout_url" in data ? data.checkout_url : null;
  if (!trustedCheckoutUrl(url)) throw new Error("creem_invalid_checkout_url");
  return url;
}
