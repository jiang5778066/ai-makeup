import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  creditBalances,
  creditGrants,
  creditsLedger,
  orders,
  webhookEvents
} from "@/db/schema";
import { isCreditLotFullyUnused } from "@/lib/credit-lots";

export type Provider = "creem";

export type CheckoutGrant = {
  provider: Provider;
  eventId: string;
  providerOrderId: string;
  providerTransactionId?: string;
  userId: string;
  planId: string;
  credits: number;
  amountCents: number;
  currency: string;
};

export async function grantPurchaseCredits(
  grant: CheckoutGrant
): Promise<"granted" | "duplicate" | "already_recorded"> {
  return db.transaction(async (tx) => {
    const eventRows = await tx
      .insert(webhookEvents)
      .values({ provider: grant.provider, eventId: grant.eventId })
      .onConflictDoNothing()
      .returning({ provider: webhookEvents.provider, eventId: webhookEvents.eventId });
    if (eventRows.length === 0) return "duplicate";

    const orderRows = await tx
      .insert(orders)
      .values({
        userId: grant.userId,
        provider: grant.provider,
        providerOrderId: grant.providerOrderId,
        providerTransactionId: grant.providerTransactionId,
        planId: grant.planId,
        amountCents: grant.amountCents,
        currency: grant.currency,
        creditsAwarded: grant.credits,
        status: "completed"
      })
      .onConflictDoNothing()
      .returning({ id: orders.id });
    const order = orderRows[0];
    if (!order) return "already_recorded";

    await tx.execute(sql`
      INSERT INTO credit_balances (user_id, balance, updated_at)
      VALUES (${grant.userId}, ${grant.credits}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET balance = credit_balances.balance + ${grant.credits}, updated_at = NOW()
    `);
    await tx.insert(creditsLedger).values({
      userId: grant.userId,
      delta: grant.credits,
      reason: "purchase",
      refType: "order",
      refId: order.id
    });
    await tx.insert(creditGrants).values({
      userId: grant.userId,
      sourceType: "purchase",
      sourceId: order.id,
      initialAmount: grant.credits,
      remaining: grant.credits
    });

    return "granted";
  });
}

export type RefundRecord = {
  provider: Provider;
  eventId: string;
  providerOrderId?: string;
  providerTransactionId?: string;
  fullReversal?: boolean;
};

export async function reverseCreditsForRefund(
  refund: RefundRecord
): Promise<"reversed" | "duplicate" | "not_found" | "not_refundable"> {
  return db.transaction(async (tx) => {
    const eventRows = await tx
      .insert(webhookEvents)
      .values({ provider: refund.provider, eventId: refund.eventId })
      .onConflictDoNothing()
      .returning({ provider: webhookEvents.provider });
    if (eventRows.length === 0) return "duplicate";

    const providerIdentity = [
      refund.providerOrderId ? eq(orders.providerOrderId, refund.providerOrderId) : null,
      refund.providerTransactionId ? eq(orders.providerTransactionId, refund.providerTransactionId) : null
    ].filter((condition): condition is ReturnType<typeof eq> => condition !== null);
    if (providerIdentity.length === 0) {
      await tx
        .delete(webhookEvents)
        .where(
          and(
            eq(webhookEvents.provider, refund.provider),
            eq(webhookEvents.eventId, refund.eventId)
          )
        );
      return "not_found";
    }

    const [order] = await tx
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.provider, refund.provider),
          or(...providerIdentity)
        )
      )
      .for("update");
    if (!order) {
      await tx
        .delete(webhookEvents)
        .where(
          and(
            eq(webhookEvents.provider, refund.provider),
            eq(webhookEvents.eventId, refund.eventId)
          )
        );
      return "not_found";
    }
    if (!order.userId) {
      await tx.update(orders).set({ status: "refund_review" }).where(eq(orders.id, order.id));
      return "not_refundable";
    }
    if (refund.fullReversal === false) {
      await tx.update(orders).set({ status: "refund_review" }).where(eq(orders.id, order.id));
      return "not_refundable";
    }

    const [lot] = await tx
      .select()
      .from(creditGrants)
      .where(
        and(eq(creditGrants.sourceType, "purchase"), eq(creditGrants.sourceId, order.id))
      )
      .for("update");
    if (!lot || !isCreditLotFullyUnused(lot)) {
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
        balance: sql`GREATEST(0, ${creditBalances.balance} - ${order.creditsAwarded})`,
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
