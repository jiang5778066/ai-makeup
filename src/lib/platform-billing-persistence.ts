import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export class BillingMigrationRequired extends Error {
  constructor() { super("billing_migration_required"); }
}
export async function ensureBillingPersistence() {
  // 不把连接/权限等故障当成缺迁移；也不缓存跨部署的就绪结果。
  const rows = await db.execute(sql`SELECT
    to_regclass('public.billing_checkout_attempts') IS NOT NULL
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='webhook_events' AND column_name='payload_identity')
    AND to_regclass('public.billing_attempts_active_uq') IS NOT NULL
    AND to_regclass('public.billing_attempts_request_uq') IS NOT NULL
    AND to_regclass('public.billing_attempts_order_uq') IS NOT NULL AS ready`);
  if (rows[0]?.ready !== true) throw new BillingMigrationRequired();
}
