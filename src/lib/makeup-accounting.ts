import { and, asc, eq, sql } from "drizzle-orm";
import { creditConsumptions, generations } from "@/db/schema";
import { lockAccountData } from "@/lib/account-data-lock";
import { deductCreditsInTransaction } from "@/lib/credits";

export const MAKEUP_GENERATION_COST = 1;

export async function reserveApprovedMakeup(generationId: string, userId: string) {
  const { db } = await import("@/db/client");
  return db.transaction(async (tx) => {
    // 与清理共享账户锁。任务行锁保护状态转换，额度函数再按余额、消费批次的顺序加锁。
    await lockAccountData(tx, userId);
    const [generation] = await tx.select({ status: generations.status })
      .from(generations).where(and(
        eq(generations.id, generationId),
        eq(generations.userId, userId),
        sql`to_jsonb(${generations})->>'deleted_at' IS NULL`
      )).for("update");
    if (!generation || !["moderating", "running"].includes(generation.status)) return "already_settled";

    const [original] = await tx.select({ refundedAt: creditConsumptions.refundedAt }).from(creditConsumptions).where(and(
      eq(creditConsumptions.userId, userId),
      eq(creditConsumptions.refType, "generation"),
      eq(creditConsumptions.refId, generationId)
    )).orderBy(sql`${creditConsumptions.refundedAt} ASC NULLS FIRST`, asc(creditConsumptions.id)).limit(1);
    // 兼容旧版退分已提交、任务终态写入未完成的记录。
    if (original?.refundedAt) {
      await tx.update(generations).set({
        status: "refunded", creditsRefundedAt: original.refundedAt, updatedAt: new Date()
      }).where(eq(generations.id, generationId));
      return "refunded";
    }
    const reserved = original || await deductCreditsInTransaction(
      tx, userId, MAKEUP_GENERATION_COST, "generation", { type: "generation", id: generationId }
    );
    const status = reserved ? "running" : "failed";
    await tx.update(generations).set({
      status, error: reserved ? undefined : "insufficient_credits", updatedAt: new Date()
    }).where(eq(generations.id, generationId));
    return status;
  });
}
