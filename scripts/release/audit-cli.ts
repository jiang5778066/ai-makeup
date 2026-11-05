import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { auditDependencies, type AuditScope } from "./audit";
import { REPOSITORY_ROOT } from "./paths";
const main = async () => {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "application" && args[0] !== "tools")) throw new Error("无效审计范围");
  const report = await auditDependencies(undefined, process.env, args.length ? [args[0] as AuditScope] : undefined);
  const directory = resolve(REPOSITORY_ROOT, "release-result");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  for (const scope of report.scopes) {
    await writeFile(resolve(directory, `audit-${scope.scope}.json`), JSON.stringify({ policy: report.policy, ...scope }, null, 2) + "\n", { mode: 0o600 });
    const message = `${scope.scope} 依赖审计：high=${scope.counts.high}、critical=${scope.counts.critical}；${scope.status === "warning" ? "存在漏洞，按用户已批准的告警策略继续，漏洞尚未修复" : "未发现达到 high 阈值的漏洞"}。\n`;
    console.log(message.trim());
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, message);
  }
};
main().catch(() => {
  console.error("依赖审计无法完成或证据写入失败；停止发布，不输出原始异常。"); process.exitCode = 1;
});
