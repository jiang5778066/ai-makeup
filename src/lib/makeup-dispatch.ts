import { and, eq, isNull, or, sql } from "drizzle-orm";
import { generations } from "@/db/schema";
import { inngest, type GenerateRequestedEvent } from "@/inngest/client";

export async function scheduleInitialMakeupDispatch(tx: Pick<typeof import("@/db/client").db, "execute">, generationId: string) {
  await tx.execute(sql`
    UPDATE generations SET dispatch_due_at = now() + interval '2 minutes'
    WHERE id = ${generationId} AND to_jsonb(generations)->>'deleted_at' IS NULL
  `);
}

type MakeupDispatch = { generationId: string; attempt?: string };

export async function sendInitialMakeupEvents(dispatches: MakeupDispatch[]) {
  if (!dispatches.length) return;
  const events: GenerateRequestedEvent[] = dispatches.map(({ generationId, attempt }) => ({
    id: attempt ? `makeup-initial-${generationId}-${attempt}` : `makeup-initial-${generationId}`,
    name: "makeup/generate.requested",
    data: { generationId }
  }));

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    // 回执丢失时仍可能送达。数据库保留待投递记录，直到原任务实际取得运行权。
    await Promise.race([
      inngest.send(events.length === 1 ? events[0] : events),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("makeup_dispatch_timeout")), 3_000);
      })
    ]);
  } catch {
    console.warn("旧美妆首次投递尚未确认", { generationIds: dispatches.map(({ generationId }) => generationId) });
  } finally {
    clearTimeout(timeout);
  }
}

export async function claimDueMakeupDispatches(): Promise<MakeupDispatch[]> {
  const { db } = await import("@/db/client");
  // 每轮保留原任务 ID，并获得新的投递尝试 ID，避免上次收件后未启动的事件压住补投。
  const rows = await db.execute<{ generationId: string; attempt: string }>(sql`
    WITH due AS (
      SELECT id FROM generations
      WHERE status = 'queued' AND dispatch_due_at <= now() AND initial_run_id IS NULL
        AND to_jsonb(generations)->>'deleted_at' IS NULL
      ORDER BY dispatch_due_at, id
      LIMIT 50 FOR UPDATE SKIP LOCKED
    )
    UPDATE generations AS g SET dispatch_due_at = now() + interval '2 minutes'
    FROM due WHERE g.id = due.id
    RETURNING g.id AS "generationId", (extract(epoch FROM g.dispatch_due_at) * 1000000)::bigint::text AS attempt
  `);
  return [...rows];
}

export async function claimInitialMakeupRun(generationId: string, runId: string) {
  const { db } = await import("@/db/client");
  const [row] = await db.update(generations).set({
    initialRunId: runId,
    dispatchDueAt: null,
    status: sql`CASE WHEN ${generations.status} = 'queued' THEN 'moderating' ELSE ${generations.status} END`,
    updatedAt: new Date()
  }).where(and(
    eq(generations.id, generationId),
    sql`${generations.status} IN ('queued', 'moderating', 'running')`,
    sql`to_jsonb(${generations})->>'deleted_at' IS NULL`,
    or(
      eq(generations.initialRunId, runId),
      isNull(generations.initialRunId)
    )
  )).returning({ id: generations.id });
  return Boolean(row);
}
