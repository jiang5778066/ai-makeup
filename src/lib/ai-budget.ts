import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { aiGenerationEstimateCents, dailySpendCapCents } from "./launch-flags";

export async function reserveDailyAiSpend(providerCostCents = 0): Promise<boolean> {
  const cap = dailySpendCapCents();
  if (!Number.isFinite(providerCostCents) || providerCostCents < 0) return false;
  const estimate = Math.max(aiGenerationEstimateCents(), Math.ceil(providerCostCents));
  if (cap === null || cap < estimate) return false;

  const rows = await db.execute(sql`
    INSERT INTO ai_daily_usage (usage_date, reserved_cents, updated_at)
    VALUES ((timezone('Asia/Shanghai', NOW()))::date, ${estimate}, NOW())
    ON CONFLICT (usage_date)
    DO UPDATE SET
      reserved_cents = ai_daily_usage.reserved_cents + ${estimate},
      updated_at = NOW()
    WHERE ai_daily_usage.reserved_cents + ${estimate} <= ${cap}
    RETURNING usage_date
  `);
  return rows.length > 0;
}

// 已批准的供应商上界预算与用户积分价独立，未知结果不释放预算。
export async function reserveMediaBudget(tx: import('./media-contracts').MediaExecutor, costCents:number, capCents:number) {
  if(!Number.isSafeInteger(costCents)||!Number.isSafeInteger(capCents)||costCents<=0||capCents<costCents)return null;
  const [row]=await tx.execute(sql`INSERT INTO ai_daily_usage(usage_date,reserved_cents,updated_at) VALUES((timezone('Asia/Shanghai',now()))::date,${costCents},now()) ON CONFLICT(usage_date) DO UPDATE SET reserved_cents=ai_daily_usage.reserved_cents+${costCents},updated_at=now() WHERE ai_daily_usage.reserved_cents+${costCents}<=${capCents} RETURNING usage_date`);
  return row?String(row.usage_date):null;
}
