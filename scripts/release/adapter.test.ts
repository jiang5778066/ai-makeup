// @vitest-environment node
import { describe, expect, it } from "vitest";
import { snapshotRuntime } from "./snapshot";
import { Vercel, type DeploymentDetails } from "./vercel";
import { TARGET, runtimeRequired, validateRuntime, type ReleaseConfig } from "./preflight";
const sha = "a".repeat(40);
const detail: DeploymentDetails = { id: "dpl_fixture", url: "candidate.vercel.app", projectId: TARGET.project, ownerId: TARGET.team, target: "production", readyState: "READY", meta: { releaseSha: sha } };
const config = { sha } as ReleaseConfig;
class FixtureVercel extends Vercel {
  protected runtime = snapshotRuntime({ ...Object.fromEntries(runtimeRequired.map(k => [k, "fixture"])), DATABASE_URL: `postgres://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full`, NEXT_PUBLIC_SITE_URL: `https://${TARGET.domain}`, NEXT_PUBLIC_SUPABASE_URL: `https://${TARGET.supabaseRef}.supabase.co` }, sha);
  protected async readRuntime() { return this.runtime; }
  async databaseReady() {}
  calls: string[][] = [];
  value: DeploymentDetails = { ...detail };
  alias = "dpl_fixture";
  async api<T>(path: string): Promise<T> { return (path.includes("/aliases/") ? { deploymentId: this.alias } : this.value) as T; }
  async cli(args: string[]) { this.calls.push(args); return "https://candidate.vercel.app"; }
}
describe("Vercel 适配器边界", () => {
  it("使用生产候选且禁止自动域名分配", async () => {
    const v = new FixtureVercel(config); expect(await v.candidate()).toEqual({ id: "dpl_fixture", url: "candidate.vercel.app" });
    expect(v.calls[0]).toEqual(expect.arrayContaining(["deploy", "--prod", "--prebuilt", "--skip-domain", "--meta", `releaseSha=${sha}`]));
  });
  it.each([{ projectId: "other" }, { ownerId: "other" }, { target: "preview" }, { readyState: "ERROR" }, { meta: { releaseSha: "other" } }, { url: "evil.test" }])("拒绝 API 错误身份 %j", async (patch) => { const v = new FixtureVercel(config); v.value = { ...detail, ...patch }; await expect(v.candidate()).rejects.toThrow(); expect(v.calls).toHaveLength(1); });
  it("切换前重查身份，切换后确认正式 alias", async () => { const v = new FixtureVercel(config); v.alias = "dpl_other"; await expect(v.promote({ id: detail.id, url: detail.url })).rejects.toThrow(); expect(v.calls[0][0]).toBe("promote"); });
  it("身份不匹配时不调用 promote", async () => { const v = new FixtureVercel(config); v.value = { ...detail, projectId: "other" }; await expect(v.promote({ id: detail.id, url: detail.url })).rejects.toThrow(); expect(v.calls).toEqual([]); });
});
describe("生产运行配置", () => {
  const env = () => ({ ...Object.fromEntries(runtimeRequired.map((k) => [k, "fixture"])), DATABASE_URL: `postgresql://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full`, NEXT_PUBLIC_SITE_URL: `https://${TARGET.domain}`, NEXT_PUBLIC_SUPABASE_URL: `https://${TARGET.supabaseRef}.supabase.co` });
  it("完整配置通过结构核验", () => expect(() => validateRuntime(env())).not.toThrow());
  it.each(runtimeRequired)("缺少 %s 阻塞", (key) => { const values = env() as Record<string, string>; delete values[key]; expect(() => validateRuntime(values)).toThrow(); });
  it("错误数据库目标阻塞", () => expect(() => validateRuntime({ ...env(), DATABASE_URL: "postgresql://u:p@evil.test/db" })).toThrow());
});
