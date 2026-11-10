// @vitest-environment node
import { describe, expect, it } from "vitest";
import { auditCommand, auditDependencies, type AuditRunner } from "./audit";
import { REPOSITORY_ROOT, TOOL_DIRECTORY, VERCEL_ENTRY } from "./paths";
import { Vercel } from "./vercel";
import { release, type Operations } from "./pipeline";
import { TARGET, type ReleaseConfig } from "./preflight";
import { isAbsolute, resolve } from "node:path";
import { readFileSync } from "node:fs";
const report = (high = 0, critical = 0) => JSON.stringify({ auditReportVersion: 2, vulnerabilities: Object.fromEntries([...Array.from({ length: high }, (_, i) => [`high-${i}`, { severity: "high" }]), ...Array.from({ length: critical }, (_, i) => [`critical-${i}`, { severity: "critical" }])]), metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high, critical, total: high + critical } } });
describe("应用与发布工具分别审计", () => {
  it("有效高危和严重漏洞报告作为告警返回，不阻断后续读取配置", async () => {
    const result = await auditDependencies(async () => ({ stdout: report(2, 1), exitCode: 1 }));
    expect(result).toMatchObject({ policy: "warn", scopes: [{ scope: "application", status: "warning", counts: { high: 2, critical: 1 } }, { scope: "tools", status: "warning" }] });
    expect(result.scopes.every(scope => /^[a-f0-9]{64}$/.test(scope.lockSha256))).toBe(true);
  });
  it.each([
    { stdout: "not-json", exitCode: 1 },
    { stdout: JSON.stringify({ error: { code: "ENETWORK" } }), exitCode: 1 },
    { stdout: report(), exitCode: 1 },
    { stdout: report(1), exitCode: 2 },
    { stdout: report(1), exitCode: 0 }
  ])("无法完成或结果不一致仍拒绝：%j", async output => {
    await expect(auditDependencies(async () => output)).rejects.toThrow("依赖审计无法完成");
  });
  it.each([REPOSITORY_ROOT, TOOL_DIRECTORY])("%s 失败仍审计两个范围并阻断", async (failed) => {
    const calls: { args: string[]; cwd: string; env: NodeJS.ProcessEnv }[] = [];
    await expect(auditDependencies(async (_binary, args, env, cwd) => {
      calls.push({ args, cwd, env }); if (cwd === failed) throw new Error("启动失败"); return { stdout: report(), exitCode: 0 };
    })).rejects.toThrow("依赖审计无法完成");
    expect(calls.map((c) => c.cwd).sort()).toEqual([REPOSITORY_ROOT, TOOL_DIRECTORY].sort());
    expect(calls.every((c) => c.args.includes("--audit-level=high") && c.args.includes("--include=dev") && !c.args.some((a) => /omit|production|audit-level=(moderate|critical)/.test(a)))).toBe(true);
  });
  it("审计进程不接收生产秘密", async () => {
    let checked = 0;
    const result = await auditDependencies(async (_binary, _args, env) => {
      expect(env.VERCEL_TOKEN).toBeUndefined(); expect(env.MIGRATION_DATABASE_URL).toBeUndefined(); checked++; return { stdout: report(), exitCode: 0 };
    }, { ...process.env, VERCEL_TOKEN: "fixture-token", MIGRATION_DATABASE_URL: "fixture-migration" });
    expect(checked).toBe(2);
    expect(result.scopes.map(scope => scope.status)).toEqual(["clear", "clear"]);
  });
});
it("Vercel 使用独立工具的绝对入口，明确应用工作目录", async () => {
  let invocation: { binary: string; args: string[]; cwd: string } | undefined;
  const config = { token: "fixture", project: TARGET.project, team: TARGET.team } as ReleaseConfig;
  const vercel = new Vercel(config, async (binary, args, env, cwd) => { expect(env.VERCEL_CLI_USE_NATIVE_BINARY).toBe("0"); expect(env.NO_UPDATE_NOTIFIER).toBe("1"); invocation = { binary, args, cwd }; return "fixture"; });
  await vercel.cli(["build", "--prod"]);
  expect(invocation?.binary).toBe(process.execPath);
  expect(invocation?.args[0]).toBe(VERCEL_ENTRY); expect(isAbsolute(VERCEL_ENTRY)).toBe(true);
  expect(VERCEL_ENTRY).toContain("/scripts/release/tools/node_modules/vercel/");
  const lock = JSON.parse(readFileSync(resolve(TOOL_DIRECTORY, "package-lock.json"), "utf8"));
  expect(lock.packages["node_modules/vercel"].version).toBe("65.11.0");
  expect(VERCEL_ENTRY).toBe(resolve(TOOL_DIRECTORY, "node_modules/vercel/dist/index.js"));
  expect(invocation?.cwd).toBe(REPOSITORY_ROOT);
  expect(invocation?.args).toEqual(expect.arrayContaining(["--cwd", REPOSITORY_ROOT]));
});

it.each([REPOSITORY_ROOT, TOOL_DIRECTORY])("实际双范围审计在 %s 失败时不读取生产配置", async (failed) => {
  const calls: string[] = [];
  const config: ReleaseConfig = { sha: "a".repeat(40), repository: TARGET.repository, ref: "refs/heads/main", workflowRef: `${TARGET.repository}/.github/workflows/release.yml@refs/heads/main`, project: TARGET.project, team: TARGET.team, domain: TARGET.domain, supabaseRef: TARGET.supabaseRef, token: "fixture", migrationUrl: `postgresql://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full` };
  const unexpected = async () => { calls.push("不应发生的后续动作"); throw new Error("不应发生"); };
  const operations: Operations = {
    trust: async () => { calls.push("trust"); },
    audit: () => auditDependencies(async (_binary, _args, _env, cwd) => { calls.push(cwd); if (cwd === failed) throw new Error("审计失败"); return { stdout: report(), exitCode: 0 }; }),
    inspect: unexpected, validate: unexpected, build: unexpected, candidate: unexpected, migrate: unexpected, health: unexpected, promote: unexpected
  };
  const result = await release(config, operations);
  expect(result).toMatchObject({ ok: false, stage: "audit", promotionAttempted: false });
  expect(calls[0]).toBe("trust");
  expect(calls.slice(1).sort()).toEqual([REPOSITORY_ROOT, TOOL_DIRECTORY].sort());
});

it("真实双范围漏洞告警写入发布事实并继续到配置阶段", async () => {
  const config = { sha: "a".repeat(40), repository: TARGET.repository, ref: "refs/heads/main", workflowRef: `${TARGET.repository}/.github/workflows/release.yml@refs/heads/main`, project: TARGET.project, team: TARGET.team, domain: TARGET.domain, supabaseRef: TARGET.supabaseRef, token: "fixture", migrationUrl: `postgresql://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full` } as ReleaseConfig;
  let inspected = false;
  const unexpected = async () => { throw Error("不应发生"); };
  const run: AuditRunner = async () => ({ stdout: report(1), exitCode: 1 });
  const ops: Operations = { trust: async () => {}, audit: () => auditDependencies(run), inspect: async () => { inspected = true; throw Error("到达配置检查"); }, validate: unexpected, build: unexpected, candidate: unexpected, migrate: unexpected, health: unexpected, promote: unexpected };
  const result = await release(config, ops);
  expect(inspected).toBe(true);
  expect(result).toMatchObject({ ok: false, stage: "inspect", audit: { policy: "warn", scopes: [{ status: "warning" }, { status: "warning" }] }, promotionAttempted: false });
});

it("真实子进程保留漏洞退出码和stdout，丢弃stderr", async () => {
  const response = await auditCommand(process.execPath, ["-e", 'process.stdout.write("audit-output"); process.stderr.write("不应回显"); process.exitCode = 1'], process.env, REPOSITORY_ROOT);
  expect(response).toEqual({ stdout: "audit-output", exitCode: 1 });
});
it("真实子进程无法启动时拒绝", async () => {
  await expect(auditCommand("/nonexistent-release-audit-binary", [], { NODE_ENV: "test" }, REPOSITORY_ROOT)).rejects.toThrow("启动失败");
});

it.each([
  { vulnerabilities: {}, high: 1, critical: 0 },
  { vulnerabilities: { pkg: { severity: "high" } }, high: 0, critical: 0 },
  { vulnerabilities: { pkg: { severity: "critical" } }, high: 1, critical: 0 }
])("漏洞条目与计数不一致时拒绝：%j", async ({ vulnerabilities, high, critical }) => {
  const parsed = JSON.parse(report(high, critical)); parsed.vulnerabilities = vulnerabilities;
  await expect(auditDependencies(async () => ({ stdout: JSON.stringify(parsed), exitCode: high + critical ? 1 : 0 }))).rejects.toThrow("依赖审计无法完成");
});
