// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import postgres from "postgres";
import { migrationOnClient } from "./migration";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
const url = process.env.TEST_DATABASE_URL;
if (url) {
  const fixture = new URL(url);
  if (!["127.0.0.1", "localhost"].includes(fixture.hostname) || fixture.username !== "postgres" || fixture.password !== "fixture_only" || fixture.pathname !== "/postgres") throw new Error("集成测试只允许本机专用 fixture 数据库");
}
// fixture适配只在测试文件中存在，不修改生产URL验证或TLS。
const operate = async (input: string, mode: "status" | "migrate", folder?: string, approved?: string[]) => {
  const client = postgres(input, { max: 1, prepare: false, onnotice: () => {} });
  try { return await migrationOnClient(client, mode, folder, approved); } finally { await client.end(); }
};
const migrateDatabase = (input: string, folder?: string, approved?: string[]) => operate(input, "migrate", folder, approved);
const databaseStatus = (input: string) => operate(input, "status");
describe.skipIf(!url)("隔离 Postgres17 原生 Drizzle 迁移", () => {
  const db = postgres(url!, { max: 1, prepare: false, onnotice: () => {} });
  beforeEach(async () => {
    await db.unsafe('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA IF NOT EXISTS auth; CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY);');
  });
  afterAll(async () => { await db.end(); });
  it("二次执行保留数据且不重建托管表", async () => {
    const before = await db`select oid from pg_class where oid='auth.users'::regclass`;
    const first = await migrateDatabase(url!);
    await db`insert into auth.users(id) values ('11111111-1111-4111-8111-111111111111') on conflict do nothing`;
    await db`insert into public.projects(user_id,name) values ('11111111-1111-4111-8111-111111111111', '保留数据')`;
    const second = await migrateDatabase(url!);
    expect(first.applied).toHaveLength(1); expect(second.applied).toHaveLength(1); expect(second.pending).toEqual([]);
    expect((await db`select name from public.projects`)[0].name).toBe("保留数据");
    expect(await db`select oid from pg_class where oid='auth.users'::regclass`).toEqual(before);
    expect((await db`select count(*) from drizzle.__drizzle_migrations`)[0].count).toBe("1");
    expect((await db`select count(*) from pg_constraint where connamespace='public'::regnamespace and contype='c'`)[0].count).toBe("14");
    expect((await db`select count(*) from pg_class where relnamespace='public'::regnamespace and relkind='r' and relrowsecurity`)[0].count).toBe("9");
  });
  it("已有未跟踪业务表在写历史前阻塞", async () => {
    await db`create table public.existing_data(id int)`;
    await expect(migrateDatabase(url!)).rejects.toThrow("未跟踪");
    expect((await db`select to_regclass('drizzle.__drizzle_migrations') as name`)[0].name).toBeNull();
  });
  it("SQL 中断事务不标记成功且无部分建表", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-db-failure-"));
    try {
      mkdirSync(join(root, "meta"));
      const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
      writeFileSync(join(root, "meta/_journal.json"), JSON.stringify(journal));
      const sql = readFileSync("drizzle/0001_production_readiness.sql", "utf8") + '\nSELECT 1/0;';
      writeFileSync(join(root, "0001_production_readiness.sql"), sql);
      const approved = [createHash("sha256").update(sql).digest("hex")];
      await expect(migrateDatabase(url!, root, approved)).rejects.toThrow();
      expect((await db`select to_regclass('drizzle.__drizzle_migrations') as name`)[0].name).toBeNull();
      expect((await db`select to_regclass('public.projects') as name`)[0].name).toBeNull();
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it("历史哈希被改或未来破坏式迁移未审核时阻塞", async () => {
    await migrateDatabase(url!); await db`update drizzle.__drizzle_migrations set hash='tampered'`;
    await expect(databaseStatus(url!)).rejects.toThrow("历史");
    await expect(migrateDatabase(url!, "drizzle", [])).rejects.toThrow("兼容性");
  });
  it("已有历史也不能接管额外未跟踪表", async () => {
    await migrateDatabase(url!); await db`create table public.untracked_data(id int)`;
    await expect(databaseStatus(url!)).rejects.toThrow("未跟踪");
  });
  it.each([
    'DROP TABLE public.ai_daily_usage',
    'ALTER TABLE public.generations DROP COLUMN error',
    'ALTER TABLE public.generations DROP CONSTRAINT generations_status_check',
    'DROP INDEX public.orders_provider_transaction_uq',
    'ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY',
    'ALTER TABLE public.generations ALTER COLUMN intensity SET DEFAULT 99',
    'ALTER TABLE public.projects ALTER COLUMN name DROP NOT NULL',
    'ALTER TABLE public.orders ALTER COLUMN amount_cents TYPE numeric',
    'ALTER TABLE public.projects DROP CONSTRAINT projects_user_id_fkey',
    'CREATE POLICY unexpected ON public.projects USING (true)',
    'ALTER TABLE public.ai_daily_usage DROP CONSTRAINT ai_daily_usage_pkey',
    'ALTER TABLE public.credit_grants DROP CONSTRAINT credit_grants_amount_check, ADD CONSTRAINT credit_grants_amount_check CHECK (remaining >= 0)',
    'ALTER TABLE public.projects FORCE ROW LEVEL SECURITY'
  ])("合法历史但结构漂移阻塞：%s", async sql => {
    await migrateDatabase(url!); await db.unsafe(sql);
    await expect(databaseStatus(url!)).rejects.toThrow("结构");
    expect((await db`select count(*) from drizzle.__drizzle_migrations`)[0].count).toBe("1");
  });
  it("并发迁移锁阻止第二个执行者", async () => {
    await db`select pg_advisory_lock(784520261105)`;
    try { await expect(migrateDatabase(url!)).rejects.toThrow("已有迁移"); }
    finally { await db`select pg_advisory_unlock(784520261105)`; }
  });
  it.each(["before-ddl", "during-ddl"])("%s会话终止后回滚全部结构且不重连继续", async point => {
    const client = postgres(url!, { max: 1, prepare: false, onnotice: () => {}, connection: { application_name: `release-disconnect-${point}` } });
    const root = mkdtempSync(join(tmpdir(), "release-db-disconnect-"));
    try {
      mkdirSync(join(root, "meta"));
      writeFileSync(join(root, "meta/_journal.json"), readFileSync("drizzle/meta/_journal.json"));
      const original = readFileSync("drizzle/0001_production_readiness.sql", "utf8");
      const sql = point === "before-ddl" ? "SELECT pg_sleep(20);\n" + original : original.replace('CREATE INDEX "projects_user_idx"', 'SELECT pg_sleep(20);\nCREATE INDEX "projects_user_idx"');
      writeFileSync(join(root, "0001_production_readiness.sql"), sql);
      const pending = migrationOnClient(client, "migrate", root, [createHash("sha256").update(sql).digest("hex")]);
      const rejected = expect(pending).rejects.toThrow();
      let pid: number | undefined;
      for (let attempt = 0; attempt < 100; attempt++) {
        const rows = await db`select pid from pg_stat_activity where application_name=${`release-disconnect-${point}`} and wait_event='PgSleep'`;
        if (rows.length) { pid = rows[0].pid; break; }
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      expect(pid).toBeDefined();
      await db`select pg_terminate_backend(${pid!})`;
      await rejected;
      expect((await db`select to_regclass('public.projects') as name`)[0].name).toBeNull();
      expect((await db`select to_regclass('drizzle.__drizzle_migrations') as name`)[0].name).toBeNull();
      expect((await migrateDatabase(url!)).applied).toHaveLength(1);
    } finally { await client.end({ timeout: 1 }); rmSync(root, { recursive: true, force: true }); }
  });
  it("缺少托管依赖不创建 auth.users", async () => {
    await db`drop table auth.users`;
    await expect(migrateDatabase(url!)).rejects.toThrow("托管依赖");
    expect((await db`select to_regclass('auth.users') as name`)[0].name).toBeNull();
  });
});
