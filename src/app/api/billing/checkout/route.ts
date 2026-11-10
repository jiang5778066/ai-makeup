import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { getPlan } from "@/lib/payments/plans";
import { isCheckoutEnabled } from "@/lib/launch-flags";
import { boundedBody, trustedCheckoutUrl } from "@/lib/platform-billing-security";
import { billingConfiguration } from "@/lib/platform-billing-config";

const reply = (code: string, status: number) => NextResponse.json({ code }, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (!isCheckoutEnabled()) return reply("checkout_disabled", 503);
  const config = billingConfiguration();
  if (!config) return reply("checkout_unconfigured", 503);
  const { siteUrl } = config;
  const origin = request.headers.get("origin"), referer = request.headers.get("referer");
  let source: string | null = origin;
  try { if (!source && referer) source = new URL(referer).origin; } catch { return reply("forbidden_origin", 403); }
  if (source !== siteUrl || request.headers.get("sec-fetch-site") === "cross-site") return reply("forbidden_origin", 403);
  try {
    const user = await getCurrentUser();
    if (!user) return reply("unauthorized", 401);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return reply("invalid_json", 400);
    let body: unknown;
    try { body = JSON.parse(await boundedBody(request, 4096)); }
    catch (error) { return reply(error instanceof Error && error.message === "body_too_large" ? "body_too_large" : "invalid_json", error instanceof Error && error.message === "body_too_large" ? 413 : 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply("invalid_json", 400);
    const input = body as Record<string, unknown>;
    const plan = typeof input.planId === "string" ? getPlan(input.planId) : null;
    if (!plan) return reply("unknown_plan", 400);
    if ((input.provider ?? "creem") !== "creem") return reply("creem_only", 400);
    if (input.attemptId !== undefined && (typeof input.attemptId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.attemptId))) return reply("invalid_attempt", 400);
    const { startBillingAttempt } = await import("@/lib/platform-billing-attempts");
    const attempt = await startBillingAttempt({ plan, userId: user.id, email: user.email ?? "", siteUrl,
      locale: input.locale === "zh-CN" ? "zh-CN" : "en", attemptId: input.attemptId as string | undefined });
    if (attempt.checkoutUrl && !trustedCheckoutUrl(attempt.checkoutUrl)) return reply("billing_unavailable", 503);
    return NextResponse.json({ attempt, ...(attempt.checkoutUrl ? { checkoutUrl: attempt.checkoutUrl } : {}), provider: "creem", planId: plan.id },
      { status: ["unknown", "submitting"].includes(attempt.status) ? 202 : 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "attempt_not_found") return reply("not_found", 404);
    return reply(code === "billing_migration_required" ? code : "billing_unavailable", 503);
  }
}
