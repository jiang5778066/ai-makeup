import { writeFile, appendFile, rm, rename } from "node:fs/promises";
import { resolve } from "node:path";
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
const writeResult = async (result: ReleaseResult) => {
  await prepareResultDirectory();
  const temp = resolve(REPOSITORY_ROOT, "release-result/result.json.tmp");
  await writeFile(temp, JSON.stringify(result, null, 2) + "\n", { mode: 0o600 });
  await rename(temp, resolve(REPOSITORY_ROOT, "release-result/result.json"));
};
const main = async () => {
  const c: ReleaseConfig = { sha: process.env.RELEASE_SHA ?? "", repository: process.env.GITHUB_REPOSITORY ?? "", ref: process.env.GITHUB_REF ?? "", workflowRef: process.env.GITHUB_WORKFLOW_REF ?? "", project: process.env.VERCEL_PROJECT_ID ?? "", team: process.env.VERCEL_ORG_ID ?? "", domain: process.env.RELEASE_DOMAIN ?? "", supabaseRef: process.env.SUPABASE_PROJECT_REF ?? "", token: process.env.VERCEL_TOKEN ?? "", migrationUrl: process.env.MIGRATION_DATABASE_URL ?? "", bypass: process.env.VERCEL_AUTOMATION_BYPASS_SECRET, bootstrap: process.env.RELEASE_BOOTSTRAP === "true" };
  const vercel = new Vercel(c);
  const result = await finishRelease(() => release(c, {
    trust: () => trustSource(c.sha), audit: () => auditDependencies(),
    inspect: async () => { const previous = await vercel.inspect(); await databaseStatus(c.migrationUrl); return previous; },
    validate: async () => { for (const script of ["test", "typecheck", "lint"]) await command("npm", ["run", script], { ...buildEnvironment(), NODE_ENV: "test" }); },
    build: () => vercel.build(), candidate: () => vercel.candidate(),
    migrate: async () => (await migrateDatabase(c.migrationUrl)).applied,
    health: async (deployment, production) => {
      const actual = await vercel.deployment(deployment.id, c.sha);
      if (actual.url !== deployment.url) throw new Error("候选身份发生变化");
      await checkHealth(production ? TARGET.domain : actual.url, { sha: c.sha, project: TARGET.project, deployment: actual.url }, fetch, c.bypass);
    },
    promote: deployment => vercel.promote(deployment)
  }, writeResult), {
    write: writeResult,
    summary: async result => {
      const auditSummary = result.audit ? result.audit.scopes.map(scope => `${scope.scope}: high=${scope.counts.high} critical=${scope.counts.critical} (${scope.status})`).join("；") : "未完成";
      const summary = `依赖审计采用告警策略，漏洞未修复时按用户决定继续；${auditSummary}。\n发布${result.ok ? "成功" : "失败"}；提交 ${result.sha}；阶段 ${result.stage}；promote 已尝试：${result.promotionAttempted}；已确认切换：${result.promoted}。\n候选：${result.candidate?.url ?? "未取得"}；上一部署：${result.previous?.url ?? "无可用回退目标/未确认"}；首次无回退：${result.rollbackUnavailable ?? false}；迁移：${result.migrations?.join(", ") ?? "未确认"}。\n`;
      if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
      console.log(summary);
    },
    cleanup: () => rm(resolve(REPOSITORY_ROOT, ".vercel"), { recursive: true, force: true })
  });
  if (result.reportErrors?.length) console.error(`发布证据或清理异常：${result.reportErrors.join(", ")}；需核对实际发布状态。`);
  if (!result.ok) process.exitCode = 1;
};
main().catch(() => { console.error("发布入口失败；禁止据此假设生产未变，请先核对域名与发布证据。"); process.exitCode = 1; });
