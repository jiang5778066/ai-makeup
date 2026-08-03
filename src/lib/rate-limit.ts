import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const rows = await db.execute(sql`
    INSERT INTO rate_limit_buckets (key, count, reset_at, updated_at)
    VALUES (${key}, 1, NOW() + (${windowMs} * INTERVAL '1 millisecond'), NOW())
    ON CONFLICT (key)
    DO UPDATE SET
      count = CASE
        WHEN rate_limit_buckets.reset_at <= NOW() THEN 1
        ELSE rate_limit_buckets.count + 1
      END,
      reset_at = CASE
        WHEN rate_limit_buckets.reset_at <= NOW()
          THEN NOW() + (${windowMs} * INTERVAL '1 millisecond')
        ELSE rate_limit_buckets.reset_at
      END,
      updated_at = NOW()
    RETURNING count, reset_at
  `);
  const row = rows[0] as { count: number; reset_at: Date | string };
  const count = Number(row.count);
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: new Date(row.reset_at).getTime()
  };
}

export function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
