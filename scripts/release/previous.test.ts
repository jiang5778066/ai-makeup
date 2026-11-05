// @vitest-environment node
import { expect, it } from "vitest";
import { previousProduction, ApiFailure } from "./previous";
import { TARGET } from "./preflight";
const ready = { id: "dpl_old", url: "old.vercel.app", projectId: TARGET.project, ownerId: TARGET.team, target: "production", readyState: "READY", meta: { releaseSha: "a".repeat(40) } };
const fixture = (alias: unknown, deployment = ready, records: unknown[] = [], next: number | null = null) => async <T>(path: string): Promise<T> => {
  if (path.includes("/aliases/")) { if (alias instanceof Error) throw alias; return alias as T; }
  if (path.startsWith("/v6/")) return { deployments: records, pagination: { next } } as T;
  return deployment as T;
};
const alias = { alias: TARGET.domain, projectId: TARGET.project, deploymentId: "dpl_old" };
it("bootstrap不能跳过READY，记录可审核上一提交", async () => { expect(await previousProduction(fixture(alias), true)).toEqual({ id: ready.id, url: ready.url, sha: ready.meta.releaseSha }); });
it("明确404且完整历史无READY才允许首次无回退", async () => { expect(await previousProduction(fixture(new ApiFailure(404)), true)).toBeNull(); });
it("已核归属ERROR且无READY可bootstrap", async () => { expect(await previousProduction(fixture(alias, { ...ready, readyState: "ERROR" }), true)).toBeNull(); });
it("缺少显式bootstrap仍停止", async () => { await expect(previousProduction(fixture(new ApiFailure(404)), false)).rejects.toThrow(); });
it.each([new ApiFailure(403), new Error("network"), {}, { ...alias, projectId: "other" }])("未知和错误归属停止", async value => { await expect(previousProduction(fixture(value), true)).rejects.toThrow(); });
it("历史仍有READY时不把404当空项目", async () => { await expect(previousProduction(fixture(new ApiFailure(404), ready, [{ uid: ready.id, state: "READY" }]), true)).rejects.toThrow(); });
it("非终态部署、分页不完整、旧版本身份缺失停止", async () => {
  await expect(previousProduction(fixture(alias, { ...ready, readyState: "BUILDING" }), true)).rejects.toThrow();
  await expect(previousProduction(fixture(new ApiFailure(404), ready, [], 1), true)).rejects.toThrow();
  await expect(previousProduction(fixture(alias, { ...ready, meta: { releaseSha: "" } }), false)).rejects.toThrow();
});
