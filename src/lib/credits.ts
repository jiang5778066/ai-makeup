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
    // 所有额度变更先锁本人余额，再锁消费及批次，避免与购买回收形成锁环。
    await tx.select({ userId: creditBalances.userId }).from(creditBalances)
      .where(eq(creditBalances.userId, userId)).for("update");
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

// 媒体复用同一账本；调用者必须在同一事务中先锁余额，再操作任务和消费批次。
export async function lockMediaBalance(tx: import('./media-contracts').MediaExecutor, userId: string) {
  await tx.execute(sql`INSERT INTO credit_balances(user_id,balance) VALUES(${userId},0) ON CONFLICT(user_id) DO NOTHING RETURNING user_id`);
  const [row] = await tx.execute(sql`SELECT balance FROM credit_balances WHERE user_id=${userId} FOR UPDATE`);
  return Number(row.balance);
}
export async function reserveMediaCredits(tx: import('./media-contracts').MediaExecutor, userId:string, taskId:string, amount:number) {
  if (!Number.isSafeInteger(amount) || amount<=0) throw new Error('invalid_media_credits');
  const updated=await tx.execute(sql`UPDATE credit_balances SET balance=balance-${amount},updated_at=now() WHERE user_id=${userId} AND balance>=${amount} RETURNING balance`);
  if(!updated.length)throw new InsufficientCreditsError();
  const lots=await tx.execute(sql`SELECT id,remaining FROM credit_grants WHERE user_id=${userId} AND remaining>0 ORDER BY created_at,id FOR UPDATE`);
  const allocations=allocateCreditLots(lots.map(r=>({id:String(r.id),remaining:Number(r.remaining)})),amount);
  if(!allocations)throw new Error('credit_lots_out_of_sync');
  for(const a of allocations){
    await tx.execute(sql`UPDATE credit_grants SET remaining=remaining-${a.amount} WHERE id=${a.lotId} RETURNING id`);
    await tx.execute(sql`INSERT INTO credit_consumptions(user_id,grant_id,amount,ref_type,ref_id) VALUES(${userId},${a.lotId},${a.amount},'media_task',${taskId}) RETURNING id`);
  }
  await tx.execute(sql`INSERT INTO credits_ledger(user_id,delta,reason,ref_type,ref_id) VALUES(${userId},${-amount},'generation','media_task',${taskId}) RETURNING id`);
}
export async function refundMediaCredits(tx: import('./media-contracts').MediaExecutor,userId:string,taskId:string) {
  const consumed=await tx.execute(sql`SELECT id,grant_id,amount FROM credit_consumptions WHERE user_id=${userId} AND ref_type='media_task' AND ref_id=${taskId} AND refunded_at IS NULL ORDER BY grant_id,id FOR UPDATE`);
  let total=0;
  for(const c of consumed){
    await tx.execute(sql`UPDATE credit_grants SET remaining=remaining+${Number(c.amount)} WHERE id=${String(c.grant_id)} RETURNING id`);
    await tx.execute(sql`UPDATE credit_consumptions SET refunded_at=now() WHERE id=${String(c.id)} RETURNING id`);
    total+=Number(c.amount);
  }
  if(total){
    await tx.execute(sql`UPDATE credit_balances SET balance=balance+${total},updated_at=now() WHERE user_id=${userId} RETURNING user_id`);
    await tx.execute(sql`INSERT INTO credits_ledger(user_id,delta,reason,ref_type,ref_id) VALUES(${userId},${total},'refund','media_task',${taskId}) RETURNING id`);
  }
  return total;
}
