import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { billingAvailable } from "@/lib/platform-billing-page";
export const dynamic = "force-dynamic";
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(request: Request) {
  const available = billingAvailable();
  const attemptId = new URL(request.url).searchParams.get("attempt_id");
  if (attemptId && attemptId !== "current" && !/^[0-9a-f-]{36}$/i.test(attemptId)) return reply({ code: "invalid_attempt" }, 400);
  const orderId = new URL(request.url).searchParams.get("order_id");
  if (orderId !== null && (!orderId || orderId.length > 255 || /[\x00-\x20]/.test(orderId))) return reply({ code: "invalid_order" }, 400);
  try {
    const user = await getCurrentUser();
    if (!user) return (orderId || attemptId) ? reply({ code: "unauthorized" }, 401) : reply({ available, userId: null, status: "pending", balance: null });
    if (attemptId) {
      const { readOwnBillingAttempt, publicBillingAttempt } = await import("@/lib/platform-billing-attempts");
      const row = await readOwnBillingAttempt(user.id, attemptId === "current" ? undefined : attemptId);
      if (!row && attemptId !== "current") return reply({ code: "not_found" }, 404);
      return reply({ available, userId: user.id, attempt: row ? publicBillingAttempt(row) : null });
    }
    const { readOwnBillingOrder } = await import("@/lib/platform-billing-status");
    const { getBalance } = await import("@/lib/credits");
    const order = orderId ? await readOwnBillingOrder(user.id, orderId) : null;
    if (orderId && !order) return reply({ code: "not_found" }, 404);
    return reply({ available, userId: user.id, status: order?.status ?? "pending", credits: order?.credits ?? null, balance: await getBalance(user.id) });
  } catch (error) { return reply({ code: error instanceof Error && error.message === "billing_migration_required" ? "billing_migration_required" : "billing_unavailable" }, 503); }
}
