import { sql } from "drizzle-orm";

type Executor = Pick<typeof import("@/db/client").db, "execute">;

export async function lockAccountData(tx: Executor, userId: string) {
  await tx.execute(sql`SET LOCAL lock_timeout = '5s'`);
  // 先取账户事务锁，再访问身份或业务行。旧生成无需读取托管身份表。
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended('framekoi.account-data:' || ${userId}::uuid::text, 0))`);
}
