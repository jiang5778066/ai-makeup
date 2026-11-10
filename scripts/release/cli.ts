import { writeFile, appendFile, rm, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { lstat } from "node:fs/promises";
import { command } from "./command";
import { auditDependencies } from "./audit";
import { release, type ReleaseResult } from "./pipeline";
import { TARGET, type ReleaseConfig } from "./preflight";
import { Vercel, prepareResultDirectory } from "./vercel";
import { checkHealth } from "./health";
import { databaseStatus, migrateDatabase } from "../db/migration";
import { trustSource } from "./trust";
import { finishRelease } from "./recovery";
import { REPOSITORY_ROOT } from "./paths";
import { buildEnvironment } from "./snapshot";
import { preflight } from "./preflight";
import { trustLocal, type ApprovalFiles, type LocalGuard } from "./local-trust";
import { withProductionLock } from "./local-lock";
import { NativeGateFailure } from "./native-auth";
import { migrationStatus } from "./migration-status";
const writeResult = async (result: ReleaseResult) => {
  await prepareResultDirectory();
  const temp = resolve(REPOSITORY_ROOT, "release-result/result.json.tmp");
  await writeFile(temp, JSON.stringify(result, null, 2) + "\n", { mode: 0o600 });
  await rename(temp, resolve(REPOSITORY_ROOT, "release-result/result.json"));
};
export const readReleaseConfig = (env: Record<string, string | undefined>, native: boolean): ReleaseConfig => {
  if (native) {
    if (Object.keys(env).some(key => key.startsWith("GITHUB_") && env[key]) || env.VERCEL_TOKEN || (env.RELEASE_AUTH_MODE && env.RELEASE_AUTH_MODE !== "native-cli")) throw new Error("本地入口拒绝CI来源变量或混合认证");
    if (!["environment", "vercel-production", "vercel-production-session"].includes(env.RELEASE_MIGRATION_SOURCE ?? "")) throw new Error("原生入口必须显式选择迁移配置来源");
    if (["vercel-production", "vercel-production-session"].includes(env.RELEASE_MIGRATION_SOURCE ?? "") && env.MIGRATION_DATABASE_URL) throw new Error("迁移来源混合");
    if (env.VERCEL_AUTOMATION_BYPASS_SECRET) throw new Error("原生旁路配置应通过同项目API读取，禁止混合来源");
    for (const [key, value] of [["VERCEL_PROJECT_ID", TARGET.project], ["VERCEL_ORG_ID", TARGET.team], ["RELEASE_DOMAIN", TARGET.domain], ["SUPABASE_PROJECT_REF", TARGET.supabaseRef]]) if (env[key] && env[key] !== value) throw new Error("原生入口目标配置不匹配");
  } else {
    if (env.RELEASE_AUTH_MODE && env.RELEASE_AUTH_MODE !== "token") throw new Error("CI入口仅允许token认证");
    if (env.RELEASE_MIGRATION_SOURCE && env.RELEASE_MIGRATION_SOURCE !== "environment") throw new Error("CI入口仅允许既有显式迁移secret");
  }
  return {
    sha: env.RELEASE_SHA ?? "", repository: native ? TARGET.repository : env.GITHUB_REPOSITORY ?? "", ref: native ? "refs/heads/main" : env.GITHUB_REF ?? "", workflowRef: native ? "" : env.GITHUB_WORKFLOW_REF ?? "",
    project: native ? TARGET.project : env.VERCEL_PROJECT_ID ?? "", team: native ? TARGET.team : env.VERCEL_ORG_ID ?? "", domain: native ? TARGET.domain : env.RELEASE_DOMAIN ?? "", supabaseRef: native ? TARGET.supabaseRef : env.SUPABASE_PROJECT_REF ?? "",
    authMode: native ? "native-cli" : "token", source: native ? "local" : "ci", token: env.VERCEL_TOKEN ?? "", migrationSource: native ? env.RELEASE_MIGRATION_SOURCE as ReleaseConfig["migrationSource"] : "environment", migrationUrl: env.MIGRATION_DATABASE_URL ?? "", bypass: native ? undefined : env.VERCEL_AUTOMATION_BYPASS_SECRET, bootstrap: env.RELEASE_BOOTSTRAP === "true"
  };
};
const approvals = (): ApprovalFiles => ({
  review: { path: process.env.RELEASE_REVIEW_RECORD ?? "", sha256: process.env.RELEASE_REVIEW_SHA256 ?? "" },
  acceptance: { path: process.env.RELEASE_ACCEPTANCE_RECORD ?? "", sha256: process.env.RELEASE_ACCEPTANCE_SHA256 ?? "" }
});
const execute = async (c: ReleaseConfig) => {
  let guard: LocalGuard | undefined;
  let buildCompleted = false;
  const recheck = async () => {
    if (guard) {
      if (!buildCompleted) throw new Error("来源构建后重核尚未完成validate/build");
      await guard("after-build");
    }
  };
  let ownsVercelDirectory = c.authMode !== "native-cli";
  const vercel = new Vercel(c);
  const result = await finishRelease(() => release(c, {
    trust: async () => {
      if (c.authMode === "native-cli") {
        guard = await trustLocal(c.sha, approvals());
        try { await lstat(resolve(REPOSITORY_ROOT, ".vercel")); throw new Error("原生入口拒绝已有.vercel目录，避免清理其它任务产物"); }
        catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
        ownsVercelDirectory = true;
      } else await trustSource(c.sha);
    }, audit: () => auditDependencies(),
    inspect: async () => {
      if (c.authMode === "native-cli") {
        c.migrationUrl = await vercel.migrationConfiguration();
        await migrationStatus(c.migrationUrl);
        c.bypass = await vercel.productionValue("VERCEL_AUTOMATION_BYPASS_SECRET", true);
      } else await databaseStatus(c.migrationUrl);
      const previous = await vercel.inspect();
      if (c.migrationSource === "vercel-production" || c.migrationSource === "vercel-production-session") await vercel.assertMigrationSnapshot(c.migrationUrl);
      return previous;
    },
    validate: async () => { for (const script of ["test", "typecheck", "lint"]) await command("npm", ["run", script], { ...buildEnvironment(), NODE_ENV: "test" }); },
    build: async () => { await vercel.build(); buildCompleted = true; }, candidate: async () => { await recheck(); await vercel.assertBypassSnapshot(); return vercel.candidate(); },
    migrate: async () => (await migrateDatabase(c.migrationUrl)).applied,
    health: async (deployment, production) => {
      const actual = await vercel.deployment(deployment.id, c.sha);
      if (actual.url !== deployment.url) throw new Error("候选身份发生变化");
      await checkHealth(production ? TARGET.domain : actual.url, { sha: c.sha, project: TARGET.project, deployment: actual.url }, fetch, c.bypass);
    },
    promote: async deployment => { await recheck(); await vercel.assertBypassSnapshot(); await vercel.promote(deployment); }
  }, writeResult), {
    write: writeResult,
    summary: async result => {
      const auditSummary = result.audit ? result.audit.scopes.map(scope => `${scope.scope}: high=${scope.counts.high} critical=${scope.counts.critical} (${scope.status})`).join("；") : "未完成";
      const summary = `依赖审计采用告警策略，漏洞未修复时按用户决定继续；${auditSummary}。\n发布${result.ok ? "成功" : "失败"}；提交 ${result.sha}；阶段 ${result.stage}；promote 已尝试：${result.promotionAttempted}；已确认切换：${result.promoted}。\n候选：${result.candidate?.url ?? "未取得"}；上一部署：${result.previous?.url ?? "无可用回退目标/未确认"}；首次无回退：${result.rollbackUnavailable ?? false}；迁移：${result.migrations?.join(", ") ?? "未确认"}。\n`;
      if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
      console.log(summary);
    },
    cleanup: async () => { if (ownsVercelDirectory) await rm(resolve(REPOSITORY_ROOT, ".vercel"), { recursive: true, force: true }); }
  });
  if (result.reportErrors?.length) console.error(`发布证据或清理异常：${result.reportErrors.join(", ")}；需核对实际发布状态。`);
  if (!result.ok) process.exitCode = 1;
};
const main = async () => {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && !["--native-local", "--native-status"].includes(args[0]))) throw new Error("发布入口参数无效");
  const native = args.length === 1;
  const c = readReleaseConfig(process.env, native);
  const work = async () => {
    if (args[0] === "--native-status") {
      // 显式只读诊断不声称通过正式来源门禁；既不调用迁移写模式，也不部署。
      preflight(c);
      const url = await new Vercel(c).migrationConfiguration();
      const state = await migrationStatus(url);
      console.log(JSON.stringify({ mode: "readonly", purpose: "migration", tls: "verify-full", project: TARGET.project, supabaseRef: TARGET.supabaseRef, state, migrationWritePermissionVerified: false }, null, 2));
    } else await execute(c);
  };
  if (native) await withProductionLock(work); else await work();
};
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { if (error instanceof NativeGateFailure) console.error(`原生只读门禁 ${error.code}：${error.message}`); console.error("发布入口失败；原始认证与数据库异常已隐藏，需核对来源、同项目解密权限及5432迁移连接的严格TLS/角色。禁止据此假设生产未变，请先核对域名与发布证据。"); process.exitCode = 1; });
