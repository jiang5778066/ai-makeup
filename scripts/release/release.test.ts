// @vitest-environment node
import { describe, expect, it } from "vitest";
import { preflight, TARGET, type ReleaseConfig } from "./preflight";
import { release, type Operations } from "./pipeline";
import { auditDependencies } from "./audit";
import { checkHealth } from "./health";
const sha = "a".repeat(40);
const config: ReleaseConfig = { sha, repository: TARGET.repository, ref: "refs/heads/main", workflowRef: `${TARGET.repository}/.github/workflows/release.yml@refs/heads/main`, project: TARGET.project, team: TARGET.team, domain: TARGET.domain, supabaseRef: TARGET.supabaseRef, token: "fake", migrationUrl: `postgresql://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full` };
const fixture = (fail = "") => {
  const calls: string[] = [];
  const step = async (name: string) => { calls.push(name); if (fail === name) throw new Error("包含凭据的原始错误必须丢弃"); };
  const ops: Operations = {
    trust: async () => step("trust"), audit: async () => step("audit"), inspect: async () => { await step("inspect"); return { id: "dpl_old", url: "old.vercel.app", sha }; },
    validate: async () => step("validate"), build: async () => step("build"),
    candidate: async () => { await step("candidate"); return { id: "dpl_fixture", url: "candidate.vercel.app" }; },
    migrate: async () => { await step("migrate"); return ["version-1"]; },
    health: async (_deployment, production) => step(production ? "productionHealth" : "candidateHealth"),
    promote: async () => step("promote"),
  };
  return { calls, ops };
};
describe("发布前拒绝", () => {
  it.each([{ sha: "main" }, { token: "" }, { project: "other" }, { team: "other" }, { domain: "evil.test" }, { ref: "refs/heads/evil" }, { workflowRef: "evil" }, { migrationUrl: "postgresql://u:p@evil.test/db" }])("任何操作前拒绝 %j", async (patch) => {
    const { ops, calls } = fixture();
    const result = await release({ ...config, ...patch }, ops);
    expect(result.ok).toBe(false); expect(calls).toEqual([]);
  });
  it("拒绝非祖先提交", async () => { const { ops, calls } = fixture("trust"); expect((await release(config, ops)).ok).toBe(false); expect(calls).toEqual(["trust"]); });
  it("接受完整受信配置", () => expect(() => preflight(config)).not.toThrow());
});
describe("阶段顺序及真实失败边界", () => {
  it("正常顺序", async () => {
    const { ops, calls } = fixture(); const result = await release(config, ops);
    expect(calls).toEqual(["trust", "audit", "inspect", "validate", "build", "candidate", "migrate", "candidateHealth", "promote", "productionHealth"]);
    expect(result).toMatchObject({ ok: true, promoted: true, migrations: ["version-1"], previous: { id: "dpl_old", url: "old.vercel.app", sha } });
  });
  it("双范围高危告警保留在成功发布事实中，其他阶段正常执行", async () => {
    const { ops, calls } = fixture();
    ops.audit = async () => {
      calls.push("audit");
      return auditDependencies(async () => ({ stdout: JSON.stringify({ auditReportVersion: 2, vulnerabilities: { highpkg: { severity: "high" }, criticalpkg: { severity: "critical" } }, metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 1, total: 2 } } }), exitCode: 1 }));
    };
    const result = await release(config, ops);
    expect(result).toMatchObject({ ok: true, promoted: true, audit: { policy: "warn", scopes: [{ status: "warning" }, { status: "warning" }] } });
    expect(calls).toEqual(["trust", "audit", "inspect", "validate", "build", "candidate", "migrate", "candidateHealth", "promote", "productionHealth"]);
  });
  it.each(["audit", "inspect", "validate", "build", "migrate", "candidateHealth"])("%s 失败不切换", async (fail) => {
    const { ops, calls } = fixture(fail); const result = await release(config, ops);
    expect(result.ok).toBe(false); expect(calls).not.toContain("promote"); expect(JSON.stringify(result)).not.toContain("凭据");
  });
  it("审计无法完成在读取生产配置前停止", async () => {
    const { ops, calls } = fixture("audit");
    const result = await release(config, ops);
    expect(result).toMatchObject({ ok: false, stage: "audit" });
    expect(calls).toEqual(["trust", "audit"]);
  });
  it("正式验收失败明确已切换", async () => { const { ops } = fixture("productionHealth"); expect(await release(config, ops)).toMatchObject({ ok: false, promoted: true, promotionAttempted: true, stage: "production-health" }); });
  it("promote 响应丢失明确可能已切换", async () => { const { ops } = fixture("promote"); expect(await release(config, ops)).toMatchObject({ ok: false, promoted: false, promotionAttempted: true, stage: "promote" }); });
});
describe("严格健康验收", () => {
  const identity = { sha, project: TARGET.project, deployment: "candidate.vercel.app" };
  const fetcher = (body: unknown, status = 200, contentType = "application/json") => async () => new Response(JSON.stringify(body), { status, headers: { "content-type": contentType } });
  it("接受预期身份", async () => { await expect(checkHealth("candidate.vercel.app", identity, fetcher({ status: "ready", ...identity }))).resolves.toBeUndefined(); });
  it.each(["evil.test", "candidate.vercel.app.evil.test", "https://candidate.vercel.app/path", "user@candidate.vercel.app"])("请求前拒绝不可信 URL %s", async (host) => { let called = false; await expect(checkHealth(host, identity, async () => { called = true; return new Response(); })).rejects.toThrow(); expect(called).toBe(false); });
  it.each([[{}, 302, "application/json"], [{}, 200, "text/html"], [{ status: "ready", ...identity, sha: "b".repeat(40) }, 200, "application/json"], [{ status: "ready", ...identity, deployment: "other.vercel.app" }, 200, "application/json"]] as const)("拒绝登录页/重定向/错误身份", async (body, status, type) => { await expect(checkHealth("candidate.vercel.app", identity, fetcher(body, status, type))).rejects.toThrow(); });
});

it("显式原生来源继续执行同一pipeline及全部检查点，前置失败不部署",async()=>{
 const native={...config,authMode:"native-cli" as const,source:"local" as const,workflowRef:"",token:"",migrationSource:"vercel-production" as const,migrationUrl:""};
 const normal=fixture();const checkpoints: string[]=[];
 const result=await release(native,normal.ops,async r=>{checkpoints.push(r.stage);expect(JSON.stringify(r)).not.toContain("fixture-secret");});
 expect(result.ok).toBe(true);expect(normal.calls).toEqual(["trust","audit","inspect","validate","build","candidate","migrate","candidateHealth","promote","productionHealth"]);
 expect(checkpoints).toContain("migrate");expect(checkpoints).toContain("production-health");
 for(const failure of ["trust","audit","inspect","validate","build"]){const f=fixture(failure);const r=await release(native,f.ops);expect(r.ok).toBe(false);expect(f.calls).not.toContain("candidate");expect(f.calls).not.toContain("promote");}
});
