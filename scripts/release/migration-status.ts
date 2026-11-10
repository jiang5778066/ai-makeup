import { normalizeDatabase, productionDatabase, probeOnClient } from "../db/connection";
import { migrationOnClient } from "../db/migration";
import { NativeGateFailure } from "./native-auth";
export const migrationStatus = async (url: string) => {
  normalizeDatabase(url, "migration");
  const db = productionDatabase(url, "migration");
  try {
    await probeOnClient(db);
    return await migrationOnClient(db, "status");
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
    const allowed = ["ENOTFOUND", "ENETUNREACH", "ECONNREFUSED", "CONNECT_TIMEOUT", "CERT_HAS_EXPIRED", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "SELF_SIGNED_CERT_IN_CHAIN", "ERR_TLS_CERT_ALTNAME_INVALID", "42501", "28000", "28P01"];
    throw new NativeGateFailure("migration-status", `migration只读status未通过，安全错误类别：${allowed.includes(code) ? code : "unknown"}；需要同项目TLS连接、批准角色和catalog/历史只读权限，未执行迁移且未证明DDL权限`);
  } finally { await db.end(); }
};
