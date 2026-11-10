import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { billingCheckoutAttempts } from "@/db/schema";
import { ensureBillingPersistence } from "./platform-billing-persistence";
import { createCreemCheckout } from "./payments/creem-checkout";
import type { Plan } from "./payments/plans";
import { trustedCheckoutUrl } from "./platform-billing-security";

type Attempt = typeof billingCheckoutAttempts.$inferSelect;
export function publicBillingAttempt(row: Attempt) {
  return { id: row.id, status: row.status,
    ...(row.status === "ready" && trustedCheckoutUrl(row.checkoutUrl) ? { checkoutUrl: row.checkoutUrl } : {}) };
}
export async function readOwnBillingAttempt(userId: string, id?: string) {
  await ensureBillingPersistence();
  const [row] = await db.select().from(billingCheckoutAttempts)
    .where(and(eq(billingCheckoutAttempts.userId, userId), eq(billingCheckoutAttempts.provider, "creem"), id ? eq(billingCheckoutAttempts.id, id) : undefined))
    .orderBy(desc(billingCheckoutAttempts.createdAt)).limit(1);
  return row ?? null;
}
export async function startBillingAttempt(args: { userId: string; email: string; plan: Plan; siteUrl: string; locale: string; attemptId?: string }) {
  await ensureBillingPersistence();
  if (args.attemptId) {
    const row = await readOwnBillingAttempt(args.userId, args.attemptId);
    if (!row) throw new Error("attempt_not_found");
    return publicBillingAttempt(row);
  }
  const id = randomUUID();
  const [inserted] = await db.insert(billingCheckoutAttempts).values({
    id, userId: args.userId, planId: args.plan.id, provider: "creem", status: "submitting", requestId: `checkout-${id}`
  }).onConflictDoNothing().returning();
  if (!inserted) {
    // 唯一索引竞争失败后只恢复，不再次投递；完成恰好早到时也返回已完成行。
    const [existing] = await db.select().from(billingCheckoutAttempts)
      .where(and(eq(billingCheckoutAttempts.userId, args.userId), eq(billingCheckoutAttempts.provider, "creem"),
        inArray(billingCheckoutAttempts.status, ["submitting", "ready", "unknown"]))).limit(1);
    const row = existing ?? await readOwnBillingAttempt(args.userId);
    if (!row) throw new Error("attempt_reconciliation_required");
    return publicBillingAttempt(row);
  }
  let checkoutUrl: string | null = null;
  try {
    checkoutUrl = await createCreemCheckout({ ...args, requestId: inserted.requestId, attemptId: inserted.id });
    if (!trustedCheckoutUrl(checkoutUrl)) throw new Error("invalid_checkout_url");
  } catch { checkoutUrl = null; }
  // webhook 可能先完成；旧成功/失败仅能从 submitting 转移，绝不降级 completed。
  const [updated] = await db.update(billingCheckoutAttempts).set({ status: checkoutUrl ? "ready" : "unknown", checkoutUrl, updatedAt: new Date() })
    .where(and(eq(billingCheckoutAttempts.id, id), eq(billingCheckoutAttempts.status, "submitting"))).returning();
  const row = updated ?? await readOwnBillingAttempt(args.userId, id);
  if (!row) throw new Error("attempt_reconciliation_required");
  return publicBillingAttempt(row);
}
