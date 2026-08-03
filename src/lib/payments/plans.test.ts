import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  process.env.CREEM_PRODUCT_CREDITS_100 = "prod_credits_100";
});

describe("paid beta plans", () => {
  it("exposes only the $8 one-time 100 credit pack", async () => {
    const { ALL_PLANS, getPlan } = await import("./plans");

    expect(Object.keys(ALL_PLANS)).toEqual(["credits_100"]);
    expect(getPlan("credits_100")).toEqual(
      expect.objectContaining({ credits: 100, priceUsd: 8, oneTime: true })
    );
    expect(getPlan("creator_monthly")).toBeNull();
    expect(getPlan("studio_monthly")).toBeNull();
  });
});
