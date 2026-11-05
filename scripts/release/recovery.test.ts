// @vitest-environment node
import { expect, it } from "vitest";
import { finishRelease } from "./recovery";
import { release, type ReleaseResult, type Operations } from "./pipeline";
import { TARGET, type ReleaseConfig } from "./preflight";
const c: ReleaseConfig = { sha: "a".repeat(40), repository: TARGET.repository, ref: "refs/heads/main", workflowRef: `${TARGET.repository}/.github/workflows/release.yml@refs/heads/main`, project: TARGET.project, team: TARGET.team, domain: TARGET.domain, supabaseRef: TARGET.supabaseRef, token: "fixture", migrationUrl: `postgres://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full`, bootstrap: true };
const result = (): ReleaseResult => ({ ok: false, sha: c.sha, stage: "production-health", completed: [], promotionAttempted: true, promoted: true });
it.each(["write", "summary"])("%s失败仍finally清理且保留发布事实", async fail => {
  const calls: string[] = [];
  const r = await finishRelease(async () => result(), { write: async () => { calls.push("write"); if (fail === "write") throw Error("secret"); }, summary: async () => { calls.push("summary"); if (fail === "summary") throw Error("secret"); }, cleanup: async () => { calls.push("cleanup"); } });
  expect(calls).toContain("cleanup"); expect(r.promoted).toBe(true); expect(r.reportErrors).toContain(fail); expect(JSON.stringify(r)).not.toContain("secret");
});
it("清理失败不掩盖已切换事实，非预期异常也执行清理", async () => {
  const r = await finishRelease(async () => result(), { write: async () => {}, summary: async () => {}, cleanup: async () => { throw Error("secret"); } });
  expect(r).toMatchObject({ promoted: true, reportErrors: ["cleanup"] });
  let cleaned = false; await expect(finishRelease(async () => { throw Error("run"); }, { write: async () => {}, summary: async () => {}, cleanup: async () => { cleaned = true; throw Error("cleanup"); } })).rejects.toThrow("run"); expect(cleaned).toBe(true);
});
const fixture = () => {
  const calls: string[] = [];
  const op = async (name: string) => { calls.push(name); };
  const ops: Operations = { trust: async () => op("trust"), audit: async () => op("audit"), inspect: async () => null, validate: async () => {}, build: async () => {}, candidate: async () => { await op("candidate"); return { id: "dpl_new", url: "new.vercel.app" }; }, migrate: async () => [], health: async () => {}, promote: async () => op("promote") };
  return { calls, ops };
};
it("候选前检查点写失败阻断远端动作", async () => {
  const { calls, ops } = fixture(); const r = await release(c, ops, async r => { if (r.stage === "candidate") throw Error("disk"); });
  expect(r.ok).toBe(false); expect(calls).not.toContain("candidate");
});
it("promote后检查点失败仍明确已切换", async () => {
  const { calls, ops } = fixture(); const r = await release(c, ops, async r => { if (r.promoted) throw Error("disk"); });
  expect(calls).toContain("promote"); expect(r).toMatchObject({ ok: false, promoted: true, promotionAttempted: true });
});
it("首次无上一READY在结果标明无法回退", async () => { const { ops } = fixture(); expect(await release(c, ops)).toMatchObject({ previous: null, rollbackUnavailable: true }); });

it.each(["cleanup", "write"])("最终%s失败时摘要必须报告失败", async fail => {
  const summaries: boolean[] = [];
  const r = await finishRelease(async () => ({ ...result(), ok: true }), {
    write: async () => { if (fail === "write") throw Error("写入失败"); },
    cleanup: async () => { if (fail === "cleanup") throw Error("清理失败"); },
    summary: async value => { summaries.push(value.ok); }
  });
  expect(r.ok).toBe(false); expect(summaries.at(-1)).toBe(false); expect(r.promoted).toBe(true);
});
