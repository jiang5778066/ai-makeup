import postgres from "postgres";
import { checkServerIdentity } from "node:tls";
import supabaseCa from "../../src/db/supabase-ca.json";
export const SUPABASE_REF = "svlhstoiirtsutmmanrn";
export type DatabasePurpose = "migration" | "runtime";
export const normalizeDatabase = (input: string, purpose: DatabasePurpose) => {
  const fail = () => { throw new Error("数据库连接必须属于目标项目、使用批准角色/端口及严格TLS，且不得包含覆盖参数"); };
  let url: URL;
  try { url = new URL(input); } catch { return fail(); }
  if (input !== input.trim() || url.hash || input.includes("#") || !["postgres:", "postgresql:"].includes(url.protocol)) return fail();
  const entries = [...url.searchParams];
  if (entries.length !== 1 || entries[0][0] !== "sslmode" || entries[0][1] !== "verify-full") return fail();
  let user: string, password: string;
  try { user = decodeURIComponent(url.username); password = decodeURIComponent(url.password); } catch { return fail(); }
  if (!password || /[\x00-\x1f\x7f]/.test(user + password) || url.pathname !== "/postgres") return fail();
  const direct = url.hostname === `db.${SUPABASE_REF}.supabase.co` && user === "postgres" && url.port === "5432";
  const pool = /^[a-z0-9-]+\.pooler\.supabase\.com$/.test(url.hostname) && user === `postgres.${SUPABASE_REF}` && (url.port === "5432" || (purpose === "runtime" && url.port === "6543"));
  if (!(direct || pool)) return fail();
  return { host: url.hostname, port: Number(url.port), user, password, database: "postgres", canonicalUrl: url.href };
};
export const productionDatabase = (input: string, purpose: DatabasePurpose) => {
  const { canonicalUrl: _url, ...core } = normalizeDatabase(input, purpose);
  // 不把URL查询交给驱动二次解析；显式options优先于PG环境变量，并固定证书与SNI主机名校验。
  return postgres({ ...core, ssl: { ca: supabaseCa.certificate, rejectUnauthorized: true, servername: core.host, checkServerIdentity }, max: 1, prepare: false, connect_timeout: 10, idle_timeout: 0, max_lifetime: 0, target_session_attrs: "read-write", connection: { application_name: "ai-makeup-release" }, onnotice: () => {} });
};
export const probeOnClient = async (db: ReturnType<typeof postgres>) => {
  await db.begin("read only", async sql => {
    const [row] = await sql`select current_database() as database, current_user as role, current_setting('transaction_read_only') as read_only, 1 as ready`;
    if (row.database !== "postgres" || row.ready !== 1 || row.role !== "postgres" || row.read_only !== "on") throw new Error("运行数据库身份或只读探测不匹配");
  });
};
export const probeRuntimeDatabase = async (input: string) => {
  const db = productionDatabase(input, "runtime");
  try { await probeOnClient(db); } finally { await db.end(); }
};
