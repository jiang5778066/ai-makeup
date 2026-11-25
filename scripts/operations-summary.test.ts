import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const entry = "scripts/operations-summary.ts";
const task = (suffix: number) => `10000000-0000-4000-8000-${String(suffix).padStart(12, "0")}`;
const cli = (args: string[], url?: string) => spawnSync(
  process.execPath, ["--import", "tsx", entry, ...args], {
    encoding: "utf8", timeout: 8000,
    env: {
      PATH: process.env.PATH, NODE_ENV: "test", TZ: "Pacific/Honolulu",
      PGAPPNAME: "f7-operations-summary-test", DAILY_AI_SPEND_CAP_CENTS: "90",
      ...(url ? { DATABASE_URL: url } : {}),
    },
  },
);

function result(args: string[], url: string) {
  const run = cli(args, url);
  expect(run.stderr).toBe("");
  expect(run.status).toBe(0);
  expect(run.stdout).not.toMatch(/OPS_SECRET|signed\.invalid|20000000-0000-4000-8000|providerOrderId|userId|prompt/i);
  return JSON.parse(run.stdout);
}

describe("运营查询入口", () => {
  it("无连接也能查看帮助，且参数错误只返回固定文本", () => {
    expect(cli(["--help"]).stdout).toContain("--section");
    for (const args of [
      ["--section", "legacy", "--write"], ["--section", "legacy", "--limit", "101"],
      ["--section", "legacy", "--limit", "0"], ["--section", "legacy", "--limit", "1e1"],
      ["--section", "budget", "--date", "2026-02-30"], ["--section", "legacy", "--date", "2026-11-25"],
      ["--section", "legacy", "--section", "media"], ["--section", "budget", "--limit", "1"],
      ["--section", "legacy", "--before", "OPS_SECRET"],
    ]) {
      const run = cli(args);
      expect(run.status).toBe(2);
      expect(run.stdout).toBe("");
      expect(run.stderr).toBe("operations_summary_invalid_args\n");
    }
    const missing = cli(["--section", "budget"]);
    expect(missing.status).toBe(1);
    expect(missing.stderr).toBe("operations_summary_unavailable\n");
  }, 30000);
});

const oldUrl = process.env.OPERATIONS_SUMMARY_TEST_OLD_URL;
const newUrl = process.env.OPERATIONS_SUMMARY_TEST_NEW_URL;
const deniedUrl = process.env.OPERATIONS_SUMMARY_TEST_DENIED_URL;

describe.skipIf(!oldUrl || !newUrl || !deniedUrl)("隔离 PostgreSQL 运营查询", () => {
  it("旧版仍可查询，未安装媒体结构时显式报告不可用", () => {
    expect(result(["--section", "legacy", "--limit", "1"], oldUrl!).items[0].id).toBe(task(3));
    expect(result(["--section", "media"], oldUrl!)).toEqual({
      section: "media", status: "unavailable", reason: "media_schema_missing",
    });
    expect(result(["--section", "refunds"], oldUrl!).items[0].id).toBe(task(21));
  });

  it("按微秒创建时间和 UUID 翻页，并区分终态、明确待核对和超时", () => {
    const first = result(["--section", "legacy", "--limit", "2"], newUrl!);
    expect(first.items.map((item: { id: string }) => item.id)).toEqual([task(3), task(2)]);
    expect(first.items[0]).toMatchObject({ status: "running", category: "reconcile", code: "creative_submission_pending", debitedCredits: "1" });
    expect(first.items[1]).toMatchObject({ status: "failed", category: "terminal_failure", code: "other" });
    expect(first.nextBefore).toContain(".123456Z");
    const second = result(["--section", "legacy", "--limit", "2", "--before", first.nextBefore], newUrl!);
    expect(second.items.map((item: { id: string }) => item.id)).toEqual([task(1), task(4)]);
    expect(second.items[0]).toMatchObject({ status: "refunded", code: "moderation:minor", refundedCredits: "1" });
    expect(second.items[1]).toMatchObject({ status: "queued", category: "stale" });
    const third = result(["--section", "legacy", "--limit", "2", "--before", second.nextBefore], newUrl!);
    expect(third.items.map((item: { id: string }) => item.id)).toEqual([task(8)]);
    expect(third.nextBefore).toBeNull();
    expect(result(["--section", "legacy", "--limit", "100"], newUrl!).items).toHaveLength(5);
    expect(cli(["--section", "media", "--before", first.nextBefore], newUrl!).status).toBe(2);
  }, 15000);

  it("媒体任务保留内部定位、账务状态、恢复阶段和是否有供应商 ID", () => {
    const page = result(["--section", "media"], newUrl!);
    expect(page.items.map((item: { id: string }) => item.id)).toEqual([task(16), task(13), task(12), task(11)]);
    expect(page.items[0]).toMatchObject({ status: "refunded", creditState: "refunded", category: "terminal_failure" });
    expect(page.items[1]).toMatchObject({ status: "reconciling", category: "reconcile", reconcileStage: "query", code: "provider_unknown", hasProviderId: true });
    expect(page.items[2]).toMatchObject({ status: "failed", code: "other", hasProviderId: false });
    expect(page.items[3]).toMatchObject({ status: "waiting", category: "stale" });
  });

  it("只按数据库已记录的审核信号返回受控结果", () => {
    const page = result(["--section", "moderation"], newUrl!);
    expect(page.items.map((item: { id: string; outcome: string }) => [item.id, item.outcome])).toEqual([
      [task(1), "rejected"], [task(8), "unavailable"], [task(7), "in_progress"],
    ]);
    expect(page.items[0].code).toBe("moderation:minor");
    expect(page.coverage).toEqual({ legacyApproval: "not_recorded", mediaModeration: "not_recorded" });
  });

  it("用上海业务日查询预算和账务，区分预留、订单金额与真实供应商费用", () => {
    expect(result(["--section", "budget", "--date", "2026-11-25"], newUrl!)).toMatchObject({
      date: "2026-11-25", timezone: "Asia/Shanghai", reservedCents: 37, legacyConfiguredCapCents: 90,
      providerActual: { status: "unavailable", cents: null },
    });
    expect(result(["--section", "budget", "--date", "2026-11-26"], newUrl!).reservedCents).toBeNull();
    const shanghaiToday = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai" }).format(new Date());
    expect(result(["--section", "budget"], newUrl!).date).toBe(shanghaiToday);
    expect(result(["--section", "billing", "--date", "2026-11-25"], newUrl!)).toMatchObject({
      orders: { currency: "USD", bookedCents: "9007199254740995", refundReviewCount: "1", refundedCents: "223", unrecognizedCount: "2" },
      credits: { purchased: "100", consumed: "3", taskRefunded: "1", orderReclaimed: "50" },
    });
    expect(result(["--section", "billing", "--date", "2026-11-24"], newUrl!)).toMatchObject({
      orders: { bookedCents: "223", refundedCents: "0" }, credits: { purchased: "50" },
    });
  }, 15000);

  it("人工核对列表含订单和积分定位，已退款或完成的订单不入列", () => {
    const page = result(["--section", "refunds"], newUrl!);
    expect(page.items).toEqual([{
      id: task(21), createdAt: "2026-11-24T16:00:00.000000Z", status: "refund_review",
      currency: "USD", orderAmountCents: "9007199254740995", creditsAwarded: 100,
      purchaseLotRemaining: 99, purchasedCredits: "100", reclaimedCredits: "0",
    }]);
    expect(page.nextBefore).toBeNull();
  });

  it("无法读取完整数据的角色得到固定错误且无部分结果", () => {
    const run = cli(["--section", "legacy"], deniedUrl);
    expect(run.status).toBe(1);
    expect(run.stdout).toBe("");
    expect(run.stderr).toBe("operations_summary_unavailable\n");
  });
});
