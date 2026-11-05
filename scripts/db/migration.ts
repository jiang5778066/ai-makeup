import { type Sql } from "postgres";
import { productionDatabase } from "./connection";
import { catalog, stable } from "./catalog";
import structure from "./structure-contract.json";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import compatibility from "./compatibility.json";
export const APPROVED_FOLDER = fileURLToPath(new URL("../../drizzle/", import.meta.url));
const migrationConfig = (folder: string) => ({ migrationsFolder: folder, migrationsSchema: "drizzle", migrationsTable: "__drizzle_migrations" });
const inspect = async (db: Sql, folder: string, approved: string[]) => {
  const migrations = readMigrationFiles(migrationConfig(folder));
  if (!migrations.length || migrations.some((m, i) => !approved.includes(m.hash) || (i > 0 && m.folderMillis <= migrations[i - 1].folderMillis))) throw new Error("迁移兼容性未经审核或版本无序");
  const journal = JSON.parse(readFileSync(`${folder}/meta/_journal.json`, "utf8")) as { entries: { tag: string }[] };
  const managed = await db`select to_regclass('auth.users') as name`;
  if (!managed[0].name) throw new Error("缺少托管依赖 auth.users");
  const exists = await db`select to_regclass('drizzle.__drizzle_migrations') as name`;
  const rows = exists[0].name ? await db`select hash, created_at from drizzle.__drizzle_migrations order by created_at, id` : [];
  if (rows.length > migrations.length || rows.some((row, i) => row.hash !== migrations[i].hash || Number(row.created_at) !== migrations[i].folderMillis)) throw new Error("迁移历史与仓库不一致");
  const actual = await catalog(db);
  if (!rows.length) {
    if (actual.length) throw new Error("发现未跟踪业务结构，必须人工核实并建立基线");
  } else {
    const hashes = rows.map(row => row.hash);
    const expected = structure.prefixes.find(prefix => stable(prefix.hashes) === stable(hashes));
    if (!expected || stable(expected.tables) !== stable(actual)) throw new Error("业务结构与迁移契约不一致，停止且不自动修复；可能存在未跟踪或删除的结构");
  }
  return { applied: journal.entries.slice(0, rows.length).map((m) => m.tag), pending: journal.entries.slice(rows.length).map((m) => m.tag) };
};
// 核心只接收已建立客户端；生产入口不接受fixture URL、任意迁移目录或审核哈希覆盖。
export const migrationOnClient = async (db: Sql, mode: "status" | "migrate", folder = APPROVED_FOLDER, approved = compatibility.approvedHashes) => {
  const status = () => db.begin("read only", async tx => {
    await tx`set local search_path=pg_catalog,public`;
    return inspect(tx as unknown as Sql, folder, approved);
  });
  if (mode === "status") return status();
  const reserved = await db.reserve();
  let active = true, closed = false, begun = false;
  const previousClose = db.options.onclose;
  db.options.onclose = id => { closed = true; previousClose?.(id); };
  // reserve固定物理连接；原生Drizzle的事务回调复用外围事务，不经过可重连连接池。
  const assertActive = () => { if (!active || closed) throw new Error("迁移事务连接已结束"); };
  const bound = new Proxy(reserved, {
    apply(target, receiver, args) { assertActive(); return Reflect.apply(target, receiver, args); },
    get(target, key, receiver) {
      if (key === "options") return db.options;
      if (key === "begin") return async (fn: (sql: typeof reserved) => Promise<unknown>) => { assertActive(); return fn(bound); };
      if (key === "unsafe") return (...args: Parameters<typeof reserved.unsafe>) => { assertActive(); return reserved.unsafe(...args); };
      return Reflect.get(target, key, receiver);
    }
  });
  const sql = bound as unknown as Sql;
  try {
    await sql`begin`; begun = true;
    const [row] = await sql`select pg_try_advisory_xact_lock(784520261105) as locked`;
    if (!row.locked) throw new Error("已有迁移进行中");
    await sql`set local search_path=pg_catalog,public`;
    await sql`set local lock_timeout='10s'`; await sql`set local statement_timeout='120s'`;
    const before = await inspect(sql, folder, approved);
    if (before.pending.length) {
      // 未限定名称的原始SQL须在public建表，避免把扩展安装进pg_catalog。
      await sql`set local search_path=public`;
      await migrate(drizzle(sql), migrationConfig(folder));
      await sql`set local search_path=pg_catalog,public`;
    }
    const after = await inspect(sql, folder, approved);
    await sql`commit`; begun = false;
    return after;
  } catch (error) {
    let cause: unknown = error;
    while (cause && typeof cause === "object") {
      const value = cause as { code?: string; cause?: unknown };
      if (value.code && /^(57P0[123]|CONNECTION_|ECONNRESET|EPIPE)/.test(value.code)) closed = true;
      cause = value.cause;
    }
    if (begun && !closed) { try { await sql`rollback`; } catch { /* 保留原始失败；断线事务由服务端回滚。 */ } }
    throw error;
  } finally {
    active = false;
    db.options.onclose = previousClose;
    if (!closed) reserved.release();
  }
};
const operate = async (url: string, mode: "status" | "migrate") => {
  const db = productionDatabase(url, "migration");
  try { return await migrationOnClient(db, mode); } finally { await db.end(); }
};
export const databaseStatus = (url: string) => operate(url, "status");
export const migrateDatabase = (url: string) => operate(url, "migrate");
