import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecute = vi.fn();

vi.mock("@/db/client", () => ({
  db: { execute: (...args: unknown[]) => mockExecute(...args) }
}));

beforeEach(() => {
  vi.resetModules();
  mockExecute.mockReset();
  delete process.env.DAILY_AI_SPEND_CAP_CENTS;
  delete process.env.AI_GENERATION_ESTIMATE_CENTS;
});

describe("daily AI budget", () => {
  it("defaults to the agreed $20 cap and ten-cent reservation", async () => {
    const { aiGenerationEstimateCents, dailySpendCapCents } = await import("./launch-flags");

    expect(dailySpendCapCents()).toBe(2000);
    expect(aiGenerationEstimateCents()).toBe(10);
  });

  it("reports whether the database accepted an atomic reservation", async () => {
    mockExecute.mockResolvedValueOnce([{ usage_date: "2026-08-03" }]).mockResolvedValueOnce([]);
    const { reserveDailyAiSpend } = await import("./ai-budget");

    await expect(reserveDailyAiSpend()).resolves.toBe(true);
    await expect(reserveDailyAiSpend()).resolves.toBe(false);
  });
});
