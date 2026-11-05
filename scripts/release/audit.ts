import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { REPOSITORY_ROOT, TOOL_DIRECTORY } from "./paths";
import { runtimeRequired } from "./preflight";
export type AuditRunner = (binary: string, args: string[], env: NodeJS.ProcessEnv, cwd: string) => Promise<{ stdout: string; exitCode: number | null }>;
export type AuditScope = "application" | "tools";
const severities = ["info", "low", "moderate", "high", "critical", "total"] as const;
type Counts = Record<typeof severities[number], number>;
export type AuditReport = { policy: "warn"; scopes: { scope: AuditScope; lockSha256: string; exitCode: number; status: "warning" | "clear"; counts: Counts; findings: { name: string; severity: string; isDirect: boolean; fixAvailable: boolean }[] }[] };
// 独立采集退出码，避免把 npm 的漏洞 exit1 与启动/网络失败混为一谈。
export const auditCommand: AuditRunner = (binary, args, env, cwd) => new Promise((resolve, reject) => {
  const child = spawn(binary, args, { env, cwd, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let exceeded = false;
  child.stdout.on("data", chunk => { stdout += chunk.toString(); if (stdout.length > 10_000_000) { exceeded = true; child.kill(); } });
  child.stderr.resume();
  child.on("error", () => reject(new Error("审计子命令启动失败")));
  child.on("close", exitCode => exceeded ? reject(new Error("审计结果过大")) : resolve({ stdout, exitCode }));
});
export const auditDependencies = async (run: AuditRunner = auditCommand, environment = process.env, scopes: AuditScope[] = ["application", "tools"]): Promise<AuditReport> => {
  // 审计无需生产凭据；只输出经过校验的计数、包信息和锁摘要，不输出原始子进程日志。
  const excluded = new Set<string>([...runtimeRequired, "VERCEL_TOKEN", "MIGRATION_DATABASE_URL", "VERCEL_AUTOMATION_BYPASS_SECRET", "SUPABASE_SERVICE_ROLE_KEY", "AWS_SESSION_TOKEN", "RESEND_API_KEY"]);
  const env = { ...environment };
  for (const key of excluded) delete env[key];
  const results = await Promise.allSettled(scopes.map(async scope => {
    const cwd = scope === "application" ? REPOSITORY_ROOT : TOOL_DIRECTORY;
    const lockSha256 = createHash("sha256").update(await readFile(resolve(cwd, "package-lock.json"))).digest("hex");
    const { stdout, exitCode } = await run("npm", ["audit", "--audit-level=high", "--include=dev", "--registry=https://registry.npmjs.org", "--json"], env, cwd);
    const parsed = JSON.parse(stdout);
    const counts = parsed.metadata?.vulnerabilities;
    if (parsed.error || parsed.auditReportVersion !== 2 || !parsed.vulnerabilities || typeof parsed.vulnerabilities !== "object" || Array.isArray(parsed.vulnerabilities) || !counts || severities.some(key => !Number.isSafeInteger(counts[key]) || counts[key] < 0)) throw new Error("审计响应无效");
    if (counts.total !== counts.info + counts.low + counts.moderate + counts.high + counts.critical) throw new Error("审计计数不一致");
    const warning = counts.high + counts.critical > 0;
    if (exitCode !== (warning ? 1 : 0)) throw new Error("审计退出码与报告不一致");
    const findings = Object.entries(parsed.vulnerabilities).map(([name, value]) => {
      const item = value as { severity: string; isDirect?: boolean; fixAvailable?: unknown };
      if (!/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name) || !severities.slice(0, 5).includes(item.severity as typeof severities[number])) throw new Error("审计包信息无效");
      return { name, severity: item.severity, isDirect: item.isDirect === true, fixAvailable: Boolean(item.fixAvailable) };
    });
    if (findings.length !== counts.total || severities.slice(0, 5).some(severity => findings.filter(item => item.severity === severity).length !== counts[severity])) throw new Error("审计条目与计数不一致");
    return { scope, lockSha256, exitCode: exitCode as number, status: warning ? "warning" as const : "clear" as const, counts: Object.fromEntries(severities.map(key => [key, counts[key]])) as Counts, findings };
  }));
  if (results.some(result => result.status === "rejected")) throw new Error("应用或发布工具依赖审计无法完成；尚未取得有效报告");
  return { policy: "warn", scopes: results.map(result => (result as PromiseFulfilledResult<AuditReport["scopes"][number]>).value) };
};
