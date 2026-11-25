import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { generations } from "@/db/schema";
import { lockAccountData } from "@/lib/account-data-lock";
import { refundGenerationCreditsInTransaction } from "@/lib/credits";

export async function failAndRefundGeneration(
  generationId: string,
  reason: string,
  failure?: { initialRunId?: string }
): Promise<"refunded" | "failed" | "already_settled" | "not_found" | "awaiting_provider_reconciliation" | "awaiting_result_storage"> {
  return db.transaction(async (tx) => {
    const [owner] = await tx.select({ userId: generations.userId }).from(generations)
      .where(eq(generations.id, generationId));
    if (!owner) return "not_found";
    await lockAccountData(tx, owner.userId);
    const [generation] = await tx.select({
      status: generations.status, error: generations.error,
      initialRunId: generations.initialRunId, dispatchDueAt: generations.dispatchDueAt
    }).from(generations).where(and(
      eq(generations.id, generationId),
      eq(generations.userId, owner.userId),
      sql`to_jsonb(${generations})->>'deleted_at' IS NULL`
    )).for("update");
    if (!generation) return "not_found";
    if (["done", "failed", "refunded"].includes(generation.status)) return "already_settled";
    if (failure) {
      // 终止回调只能结算自己的运行。未取得运行权的首次事件仍可补投。
      if (failure.initialRunId &&
          (generation.dispatchDueAt || (generation.initialRunId && generation.initialRunId !== failure.initialRunId))) {
        return "already_settled";
      }
      if (generation.error === "creative_submission_pending") return "awaiting_provider_reconciliation";
      if (generation.error === "creative_result_pending") return "awaiting_result_storage";
    }

    // 与任务终态同事务提交。旧任务只退回原消费所引用的批次。
    const refunded = await refundGenerationCreditsInTransaction(tx, owner.userId, generationId) === "refunded";
    const status = refunded ? "refunded" : "failed";
    await tx.update(generations).set({
      status, error: reason.slice(0, 500), dispatchDueAt: null,
      creditsRefundedAt: refunded ? new Date() : null,
      updatedAt: new Date()
    }).where(eq(generations.id, generationId));
    return status;
  });
}
