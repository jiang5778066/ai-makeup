import { randomUUID } from "node:crypto";
import { and, asc, eq, gt, gte, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  creditBalances,
  creditConsumptions,
  creditGrants,
  creditsLedger
} from "@/db/schema";
import { allocateCreditLots } from "./credit-lots";

export const SIGNUP_GRANT_CREDITS = 3;

export type CreditReason =
  | "signup_grant"
  | "purchase"
  | "generation"
  | "refund"
  | "admin_adjust";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("insufficient_credits");
    this.name = "InsufficientCreditsError";
  }
}

export async function getBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ balance: creditBalances.balance })
    .from(creditBalances)
    .where(eq(creditBalances.userId, userId));
  return row?.balance ?? 0;
}

export async function addCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  ref?: { type: string; id: string }
) {
  if (amount <= 0) throw new Error("addCredits requires positive amount");

  await db.transaction(async (tx) => {
    await tx.execute(sql`
      INSERT INTO credit_balances (user_id, balance, updated_at)
      VALUES (${userId}, ${amount}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET balance = credit_balances.balance + ${amount}, updated_at = NOW()
    `);

    await tx.insert(creditsLedger).values({
      userId,
      delta: amount,
      reason,
      refType: ref?.type,
      refId: ref?.id
    });
    await tx.insert(creditGrants).values({
      userId,
      sourceType: reason,
      sourceId: ref?.id ?? randomUUID(),
      initialAmount: amount,
      remaining: amount
    });
  });
}

/**
 * Deducts credits atomically. Uses a row-level lock + serializable balance check
 * to prevent two concurrent generations from spending the last credit twice.
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  ref?: { type: string; id: string }
) {
  if (amount <= 0) throw new Error("deductCredits requires positive amount");

  await db.transaction(async (tx) => {
    const updated = await tx
      .update(creditBalances)
      .set({ balance: sql`${creditBalances.balance} - ${amount}`, updatedAt: new Date() })
      .where(and(eq(creditBalances.userId, userId), gte(creditBalances.balance, amount)))
      .returning({ balance: creditBalances.balance });

    if (updated.length === 0) {
      throw new InsufficientCreditsError();
    }

    const lots = await tx
      .select({ id: creditGrants.id, remaining: creditGrants.remaining })
      .from(creditGrants)
      .where(and(eq(creditGrants.userId, userId), gt(creditGrants.remaining, 0)))
      .orderBy(asc(creditGrants.createdAt))
      .for("update");
    const allocations = allocateCreditLots(lots, amount);
    if (!allocations) throw new Error("credit_lots_out_of_sync");

    const consumptionRef = ref ?? { type: "credit", id: randomUUID() };
    for (const allocation of allocations) {
      const consumed = await tx
        .update(creditGrants)
        .set({ remaining: sql`${creditGrants.remaining} - ${allocation.amount}` })
        .where(
          and(
            eq(creditGrants.id, allocation.lotId),
            gte(creditGrants.remaining, allocation.amount)
          )
        )
        .returning({ id: creditGrants.id });
      if (consumed.length === 0) throw new Error("credit_lot_conflict");
      await tx.insert(creditConsumptions).values({
        userId,
        grantId: allocation.lotId,
        amount: allocation.amount,
        refType: consumptionRef.type,
        refId: consumptionRef.id
      });
    }

    await tx.insert(creditsLedger).values({
      userId,
      delta: -amount,
      reason,
      refType: ref?.type,
      refId: ref?.id
    });
  });
}

export async function refundGenerationCredits(
  userId: string,
  generationId: string
): Promise<"refunded" | "duplicate"> {
  return db.transaction(async (tx) => {
    const consumptions = await tx
      .select({
        id: creditConsumptions.id,
        grantId: creditConsumptions.grantId,
        amount: creditConsumptions.amount
      })
      .from(creditConsumptions)
      .where(
        and(
          eq(creditConsumptions.userId, userId),
          eq(creditConsumptions.refType, "generation"),
          eq(creditConsumptions.refId, generationId),
          isNull(creditConsumptions.refundedAt)
        )
      )
      .for("update");

    if (consumptions.length === 0) return "duplicate";
    const refundedAt = new Date();
    let amount = 0;
    for (const consumption of consumptions) {
      amount += consumption.amount;
      await tx
        .update(creditGrants)
        .set({ remaining: sql`${creditGrants.remaining} + ${consumption.amount}` })
        .where(eq(creditGrants.id, consumption.grantId));
      await tx
        .update(creditConsumptions)
        .set({ refundedAt })
        .where(eq(creditConsumptions.id, consumption.id));
    }

    await tx.execute(sql`
      INSERT INTO credit_balances (user_id, balance, updated_at)
      VALUES (${userId}, ${amount}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET balance = credit_balances.balance + ${amount}, updated_at = NOW()
    `);
    await tx.insert(creditsLedger).values({
      userId,
      delta: amount,
      reason: "refund",
      refType: "generation",
      refId: generationId
    });
    return "refunded";
  });
}

/**
 * Idempotent signup grant. The unique ledger reference is inserted first in
 * the same transaction, so concurrent auth callbacks cannot both add balance.
 */
export async function grantSignupCreditsIfNew(userId: string) {
  await db.transaction(async (tx) => {
    const ledgerRows = await tx
      .insert(creditsLedger)
      .values({
        userId,
        delta: SIGNUP_GRANT_CREDITS,
        reason: "signup_grant",
        refType: "user",
        refId: userId
      })
      .onConflictDoNothing()
      .returning({ id: creditsLedger.id });

    if (ledgerRows.length === 0) return;

    await tx.execute(sql`
      INSERT INTO credit_balances (user_id, balance, updated_at)
      VALUES (${userId}, ${SIGNUP_GRANT_CREDITS}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET balance = credit_balances.balance + ${SIGNUP_GRANT_CREDITS}, updated_at = NOW()
    `);
    await tx.insert(creditGrants).values({
      userId,
      sourceType: "signup_grant",
      sourceId: userId,
      initialAmount: SIGNUP_GRANT_CREDITS,
      remaining: SIGNUP_GRANT_CREDITS
    });
  });
}
