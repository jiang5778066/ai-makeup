// @vitest-environment node
import { afterEach, expect, it } from "vitest";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { Vercel } from "./vercel";
import { TARGET, runtimeRequired, type ReleaseConfig } from "./preflight";
const roots: string[] = [];
afterEach(async () => { for (const r of roots.splice(0)) await rm(r, { recursive: true, force: true }); });
const fixture = async (wrongLink = false) => {
  const root = await mkdtemp(resolve(tmpdir(), "release-runtime-")); roots.push(root);
  const sha = "a".repeat(40);
  const env = { ...Object.fromEntries(runtimeRequired.map(k => [k, "fixture"])), DATABASE_URL: `postgres://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full`, NEXT_PUBLIC_SUPABASE_URL: `https://${TARGET.supabaseRef}.supabase.co`, NEXT_PUBLIC_SITE_URL: `https://${TARGET.domain}`, SPECIAL: 'quote"\\slash\n$dollar' };
  const calls: { args: string[]; env: NodeJS.ProcessEnv }[] = [];
  let promoted = false;
  class Adapter extends Vercel {
    cloud = { ...env }; dbFailure = false; databaseChecks = 0;
    projectId = TARGET.project as string;
    async api<T>(path: string): Promise<T> {
      if (path.startsWith("/v9/projects/")) return { id: this.projectId, accountId: TARGET.team, nodeVersion: "24.x" } as T;
      if (path.startsWith("/v3/env/pull/")) return { env: this.cloud } as T;
      if (path.startsWith("/v4/aliases/")) return { alias: TARGET.domain, projectId: TARGET.project, deploymentId: promoted ? "dpl_new" : "dpl_old" } as T;
      const old = path.endsWith("dpl_old");
      return { id: old ? "dpl_old" : "dpl_new", url: old ? "old.vercel.app" : "new.vercel.app", projectId: TARGET.project, ownerId: TARGET.team, target: "production", readyState: "READY", meta: { releaseSha: old ? "b".repeat(40) : sha } } as T;
    }
    async databaseReady() { this.databaseChecks++; if (this.dbFailure) throw Error("unavailable"); }
  }
  const adapter = new Adapter({ sha, token: "fixture" } as ReleaseConfig, async (_binary, args, childEnv) => {
    calls.push({ args, env: childEnv });
    if (args.includes("pull")) { await writeFile(resolve(root, ".vercel/.env.production.local"), 'SPECIAL="wrong\\nvalue"'); await writeFile(resolve(root, ".vercel/project.json"), JSON.stringify({ projectId: wrongLink ? "other" : TARGET.project, orgId: TARGET.team })); }
    if (args.includes("promote")) promoted = true;
    return "https://new.vercel.app";
  }, root);
  return { root, adapter, calls, env };
};
it("实际inspect固定JSON快照用于build和candidate，清空dotenv且不将秘密放入argv", async () => {
  const { root, adapter, calls, env } = await fixture();
  expect(await adapter.inspect()).toMatchObject({ id: "dpl_old", sha: "b".repeat(40) });
  await adapter.build(); await adapter.candidate();
  expect(await readFile(resolve(root, ".vercel/.env.production.local"), "utf8")).toBe("");
  const config = JSON.parse(await readFile(resolve(root, ".vercel/release-runtime.json"), "utf8"));
  expect(config.env.SPECIAL).toBe(env.SPECIAL); expect(config.env).toEqual(config.build.env);
  for (const call of calls.filter(c => c.args.includes("build") || c.args.includes("deploy"))) {
    expect(call.env.SPECIAL).toBe(env.SPECIAL); expect(call.args).toContain("--local-config"); expect(call.args.join(" ")).not.toContain(env.SPECIAL);
  }
});
it("环境变化、数据库探测失败均在candidate部署前阻断", async () => {
  const { adapter, calls } = await fixture(); await adapter.inspect(); adapter.cloud.SPECIAL = "changed";
  await expect(adapter.candidate()).rejects.toThrow("变化"); expect(calls.some(c => c.args.includes("deploy"))).toBe(false);
  adapter.cloud.SPECIAL = 'quote"\\slash\n$dollar'; adapter.dbFailure = true;
  await expect(adapter.candidate()).rejects.toThrow("unavailable"); expect(calls.some(c => c.args.includes("deploy"))).toBe(false);
  await expect(adapter.promote({ id: "dpl_new", url: "new.vercel.app" })).rejects.toThrow("unavailable"); expect(calls.some(c => c.args.includes("promote"))).toBe(false);
});
it("错误项目在pull读取环境前停止", async () => { const { adapter, calls } = await fixture(); adapter.projectId = "other"; await expect(adapter.inspect()).rejects.toThrow(); expect(calls).toEqual([]); });

it("本地pull链接也必须属于固定项目", async () => { const { adapter } = await fixture(true); await expect(adapter.inspect()).rejects.toThrow("链接"); });
