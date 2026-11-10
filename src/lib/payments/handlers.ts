import { createHash } from "node:crypto";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  billingCheckoutAttempts,
  creditBalances,
  creditGrants,
  creditsLedger,
  orders,
  webhookEvents
} from "@/db/schema";
import { ensureBillingPersistence } from "@/lib/platform-billing-persistence";
import { isCreditLotFullyUnused } from "@/lib/credit-lots";

export type Provider = "creem";

export type CheckoutGrant = {
  provider: Provider;
  eventId: string;
  providerOrderId: string;
  providerTransactionId?: string;
  attemptId?: string;
  productId?: string;
  userId: string;
  planId: string;
  credits: number;
  amountCents: number;
  currency: string;
};

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
function identity(value: unknown) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
async function recordEvent(tx: Transaction, provider: Provider, eventId: string, payloadIdentity: string) {
  const inserted = await tx.insert(webhookEvents).values({ provider, eventId, payloadIdentity })
    .onConflictDoNothing().returning({ eventId: webhookEvents.eventId });
  if (inserted.length) return true;
  const [prior] = await tx.select({ payloadIdentity: webhookEvents.payloadIdentity }).from(webhookEvents)
    .where(and(eq(webhookEvents.provider, provider), eq(webhookEvents.eventId, eventId))).limit(1);
  if (!prior?.payloadIdentity) throw new Error("legacy_event_review_required");
  if (prior.payloadIdentity !== payloadIdentity) throw new Error("event_identity_conflict");
  return false;
}
export async function grantPurchaseCredits(
  grant: CheckoutGrant
): Promise<"granted" | "duplicate" | "already_recorded"> {
  if (!grant.providerTransactionId || grant.providerTransactionId.length > 255 || /[\x00-\x20]/.test(grant.providerTransactionId)) throw new Error("transaction_required");
  await ensureBillingPersistence();
  const payloadIdentity = identity(["checkout.completed", grant.provider, grant.userId, grant.planId,
    grant.providerOrderId, grant.providerTransactionId, grant.amountCents, grant.currency, grant.credits, grant.attemptId ?? null, grant.productId ?? null]);
  return db.transaction(async (tx) => {
    const freshEvent = await recordEvent(tx, grant.provider, grant.eventId, payloadIdentity);
    if (grant.attemptId) {
      const [attempt] = await tx.select().from(billingCheckoutAttempts).where(eq(billingCheckoutAttempts.id, grant.attemptId)).for("update");
      if (!attempt || attempt.userId !== grant.userId || attempt.provider !== grant.provider || attempt.planId !== grant.planId ||
          attempt.status === "failed" || (attempt.providerOrderId !== null && attempt.providerOrderId !== grant.providerOrderId)) throw new Error("attempt_identity_conflict");
    }
    const [order] = await tx.insert(orders).values({
      userId: grant.userId, provider: grant.provider, providerOrderId: grant.providerOrderId,
      providerTransactionId: grant.providerTransactionId, planId: grant.planId, amountCents: grant.amountCents,
      currency: grant.currency, creditsAwarded: grant.credits, status: "completed"
    }).onConflictDoNothing().returning({ id: orders.id });
    if (!order) {
      const prior = await tx.select().from(orders).where(and(eq(orders.provider, grant.provider),
        or(eq(orders.providerOrderId, grant.providerOrderId), eq(orders.providerTransactionId, grant.providerTransactionId!))));
      if (prior.length !== 1 || prior[0].userId !== grant.userId || prior[0].providerOrderId !== grant.providerOrderId ||
          prior[0].providerTransactionId !== grant.providerTransactionId || prior[0].planId !== grant.planId ||
          prior[0].amountCents !== grant.amountCents || prior[0].currency !== grant.currency || prior[0].creditsAwarded !== grant.credits) throw new Error("order_identity_conflict");
      const [binding] = await tx.select({ id: billingCheckoutAttempts.id }).from(billingCheckoutAttempts)
        .where(and(eq(billingCheckoutAttempts.provider, grant.provider), eq(billingCheckoutAttempts.providerOrderId, grant.providerOrderId))).limit(1);
      if ((binding?.id ?? null) !== (grant.attemptId ?? null)) throw new Error("attempt_identity_conflict");
      return freshEvent ? "already_recorded" : "duplicate";
    }
    if (!freshEvent) throw new Error("event_order_missing");
    await tx.execute(sql`
      INSERT INTO credit_balances (user_id, balance, updated_at)
      VALUES (${grant.userId}, ${grant.credits}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET balance = credit_balances.balance + ${grant.credits}, updated_at = NOW()
    `);
    await tx.insert(creditsLedger).values({ userId: grant.userId, delta: grant.credits, reason: "purchase", refType: "order", refId: order.id });
    await tx.insert(creditGrants).values({ userId: grant.userId, sourceType: "purchase", sourceId: order.id, initialAmount: grant.credits, remaining: grant.credits });
    if (grant.attemptId) await tx.update(billingCheckoutAttempts).set({ status: "completed", providerOrderId: grant.providerOrderId, checkoutUrl: null, updatedAt: new Date() })
      .where(eq(billingCheckoutAttempts.id, grant.attemptId));
    return "granted";
  });
}

export type RefundRecord = {
  provider: Provider;
  eventId: string;
  providerOrderId?: string;
  providerTransactionId?: string;
  amountCents?: number;
  currency?: string;
  reviewOnly?: boolean;
  eventType?: "refund.created" | "dispute.created";
};

export async function reverseCreditsForRefund(
  refund: RefundRecord
): Promise<"reversed" | "duplicate" | "not_found" | "not_refundable"> {
  await ensureBillingPersistence();
  return db.transaction(async (tx) => {
    const providerIdentity = [
      refund.providerOrderId ? eq(orders.providerOrderId, refund.providerOrderId) : null,
      refund.providerTransactionId ? eq(orders.providerTransactionId, refund.providerTransactionId) : null
    ].filter((condition): condition is ReturnType<typeof eq> => condition !== null);
    if (providerIdentity.length === 0) throw new Error("refund_order_pending");

    const [candidate] = await tx
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.provider, refund.provider),
          and(...providerIdentity)
        )
      )
      .limit(1);
    if (!candidate) throw new Error("refund_order_pending");
    const [binding] = await tx.select({ id: billingCheckoutAttempts.id }).from(billingCheckoutAttempts)
      .where(and(eq(billingCheckoutAttempts.provider, refund.provider), eq(billingCheckoutAttempts.providerOrderId, candidate.providerOrderId))).limit(1);
    // 状态会改变，订单及交易身份不随退款/争议变化；事件先于现有订单锁，避免反向锁序。
    const canonical = (row: typeof candidate) => [refund.eventType ?? "refund.created", refund.provider, row.userId, row.planId,
      row.providerOrderId, row.providerTransactionId, row.amountCents, row.currency, row.creditsAwarded, binding?.id ?? null,
      refund.providerOrderId ?? null, refund.providerTransactionId ?? null, refund.amountCents ?? null, refund.currency ?? null, refund.reviewOnly === true];
    const payloadIdentity = identity(canonical(candidate));
    const freshEvent = await recordEvent(tx, refund.provider, refund.eventId, payloadIdentity);
    const [order] = await tx.select().from(orders).where(eq(orders.id, candidate.id)).for("update");
    if (!order || identity(canonical(order)) !== payloadIdentity) throw new Error("refund_identity_conflict");
    if (!freshEvent) return "duplicate";
    if (order.status === "refunded") return "duplicate";
    if (order.status === "refund_review") return "not_refundable";

    if (refund.reviewOnly) {
      await tx.update(orders).set({ status: "refund_review" }).where(eq(orders.id, order.id));
      return "not_refundable";
    }
    // 与生成扣费及失败退款保持余额先于批次的加锁顺序。
    const [balance] = await tx.select().from(creditBalances)
      .where(eq(creditBalances.userId, order.userId)).for("update");

    const [lot] = await tx
      .select()
      .from(creditGrants)
      .where(
        and(eq(creditGrants.sourceType, "purchase"), eq(creditGrants.sourceId, order.id))
      )
      .for("update");
    if (refund.amountCents !== order.amountCents || refund.currency !== order.currency ||
      !balance || balance.balance < order.creditsAwarded || !lot || !isCreditLotFullyUnused(lot)) {
      await tx.update(orders).set({ status: "refund_review" }).where(eq(orders.id, order.id));
      return "not_refundable";
    }

    const refundedAt = new Date();
    await tx
      .update(creditGrants)
      .set({ remaining: 0 })
      .where(eq(creditGrants.id, lot.id));
    await tx
      .update(orders)
      .set({ status: "refunded", refundedAt })
      .where(eq(orders.id, order.id));
    await tx
      .update(creditBalances)
      .set({
        balance: sql`${creditBalances.balance} - ${order.creditsAwarded}`,
        updatedAt: refundedAt
      })
      .where(eq(creditBalances.userId, order.userId));
    await tx.insert(creditsLedger).values({
      userId: order.userId,
      delta: -order.creditsAwarded,
      reason: "refund",
      refType: "order",
      refId: order.id
    });

    return "reversed";
  });
}
