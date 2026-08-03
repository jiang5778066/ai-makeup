import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { aiGenerationEstimateCents, dailySpendCapCents } from "./launch-flags";

export async function reserveDailyAiSpend(): Promise<boolean> {
  const cap = dailySpendCapCents();
  const estimate = aiGenerationEstimateCents();
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
