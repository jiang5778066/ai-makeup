// @vitest-environment node
import { expect, it } from "vitest";
import postgres from "postgres";
import { normalizeDatabase, productionDatabase, probeOnClient, SUPABASE_REF } from "./connection";
import { databaseStatus, migrateDatabase } from "./migration";
const url = `postgres://postgres:percent%40pass@db.${SUPABASE_REF}.supabase.co:5432/postgres?sslmode=verify-full`;
it("驱动实际options不受PG环境冲突覆盖，TLS证书与主机名校验显式开启", async () => {
  const before = { PGHOST: process.env.PGHOST, PGPORT: process.env.PGPORT, PGSSLMODE: process.env.PGSSLMODE, PGSSL: process.env.PGSSL, PGDATABASE: process.env.PGDATABASE, PGUSER: process.env.PGUSER };
  Object.assign(process.env, { PGHOST: "evil.test", PGPORT: "1", PGSSLMODE: "disable", PGSSL: "false", PGDATABASE: "other", PGUSER: "evil" });
  const db = productionDatabase(url, "migration");
  try {
    expect(db.options).toMatchObject({ host: [`db.${SUPABASE_REF}.supabase.co`], port: [5432], database: "postgres", user: "postgres", pass: "percent@pass", ssl: { rejectUnauthorized: true, servername: `db.${SUPABASE_REF}.supabase.co` } });
    const ssl = db.options.ssl as import("node:tls").ConnectionOptions;
    expect(typeof ssl.checkServerIdentity).toBe("function");
    expect(ssl.checkServerIdentity!("wrong.test", { subjectaltname: "DNS:correct.test" } as import("node:tls").PeerCertificate)).toBeInstanceOf(Error);
  } finally { await db.end(); for (const [key, value] of Object.entries(before)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
});
it.each(["?sslmode=verify-full&sslrootcert=system", "?sslmode=verify-full&application_name=x", "?sslmode=verify-full&sslmode=verify-full", "?SSLMode=verify-full", "?sslmode=verify-full#", "?sslmode=verify-full&database=other"])("独立数据库入口也拒绝覆盖%s", async suffix => {
  const bad = url.split("?")[0] + suffix;
  expect(() => normalizeDatabase(bad, "migration")).toThrow();
  await expect(databaseStatus(bad)).rejects.toThrow(); await expect(migrateDatabase(bad)).rejects.toThrow();
});
it("生产入口不能通过本机fixture开关绕过TLS", async () => { await expect(migrateDatabase("postgres://postgres:fixture_only@127.0.0.1:5432/postgres")).rejects.toThrow(); });
it.skipIf(!process.env.TEST_DATABASE_URL)("隔离fixture运行只读探测不改业务结构或数据", async () => {
  const input = new URL(process.env.TEST_DATABASE_URL!);
  if (input.hostname !== "127.0.0.1" || input.password !== "fixture_only") throw Error("仅允许专用fixture");
  const db = postgres(input.href, { max: 1, ssl: false });
  try { const before = await db`select count(*) from pg_class where relnamespace='public'::regnamespace`; await probeOnClient(db); expect(await db`select count(*) from pg_class where relnamespace='public'::regnamespace`).toEqual(before); }
  finally { await db.end(); }
});
