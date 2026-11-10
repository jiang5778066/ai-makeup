import postgres from "postgres";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { catalog } from "./catalog";
// 仅用于本任务隔离fixture生成参考，不是生产基线入口；不接受URL或环境开关。
const main = async () => {
const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("需要隔离fixture本机端口");
const db = postgres({ host: "127.0.0.1", port, user: "postgres", password: "fixture_only", database: "postgres", ssl: false, max: 1, onnotice: () => {} });
try {
  const [version] = await db`select current_setting('server_version_num')::int as version`;
  if (version.version < 170000 || version.version >= 180000) throw new Error("参考仅支持Postgres17");
  const [existing] = await db`select count(*)::int as count from pg_tables where schemaname in ('public','drizzle')`;
  if (existing.count !== 0) throw new Error("生成参考要求全新隔离数据库");
  // fixture的auth.users只模拟托管外部依赖，原SQL及生产自动化均不创建该表。
  await db`create schema if not exists auth`; await db`create table if not exists auth.users(id uuid primary key)`;
  const journal = JSON.parse(await readFile("drizzle/meta/_journal.json", "utf8")) as { entries: { tag: string }[] };
  const hashes: string[] = [], prefixes = [];
  for (const { tag } of journal.entries) {
    const sql = await readFile(`drizzle/${tag}.sql`, "utf8");
    await db.unsafe(sql);
    hashes.push(createHash("sha256").update(sql).digest("hex"));
    const tables = await db.begin("read only", async tx => { await tx`set local search_path=pg_catalog,public`; return catalog(tx as unknown as typeof db); });
    prefixes.push({ hashes: [...hashes], tables });
  }
  await writeFile("scripts/db/structure-contract.json", JSON.stringify({ postgresMajor: 17, prefixes }, null, 2) + "\n");
} finally { await db.end(); }

};
main().catch(() => { console.error("fixture参考生成失败"); process.exitCode = 1; });
