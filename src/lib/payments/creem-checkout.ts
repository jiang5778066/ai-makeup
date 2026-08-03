import { randomUUID } from "node:crypto";
import type { Plan } from "./plans";

const CREEM_API_BASE = process.env.CREEM_API_BASE ?? "https://api.creem.io";

export async function createCreemCheckout(args: {
  plan: Plan;
  userId: string;
  email: string;
  siteUrl: string;
}): Promise<string> {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) throw new Error("creem_unconfigured");
  if (!args.plan.creemProductId) throw new Error("creem_product_missing");

  const response = await fetch(`${CREEM_API_BASE}/v1/checkouts`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      product_id: args.plan.creemProductId,
      request_id: `checkout-${args.userId}-${args.plan.id}-${randomUUID()}`,
      customer: { email: args.email },
      success_url: `${args.siteUrl}/dashboard?paid=creem`,
      metadata: {
        userId: args.userId,
        planId: args.plan.id
      }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`creem_checkout_failed:${response.status}:${text}`);
  }

  const data = (await response.json()) as { checkout_url?: string; url?: string };
  const url = data.checkout_url ?? data.url;
  if (!url) throw new Error("creem_no_checkout_url");
  return url;
}
