import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.resetModules();
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
  process.env.CREEM_API_KEY = "creem_test_key";
  process.env.CREEM_PRODUCT_CREDITS_100 = "prod_credits_100";
  delete process.env.CREEM_API_BASE;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createCreemCheckout", () => {
  it("creates an official Creem checkout with a stable request_id", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ checkout_url: "https://checkout.creem.io/test" })
    });

    const { createCreemCheckout } = await import("./creem-checkout");
    const { getPlan } = await import("./plans");

    const url = await createCreemCheckout({
      plan: getPlan("credits_100")!,
      userId: "user_1",
      email: "buyer@example.com",
      siteUrl: "https://makeup.example"
    });

    expect(url).toBe("https://checkout.creem.io/test");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.creem.io/v1/checkouts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          product_id: "prod_credits_100",
          request_id: "checkout-user_1-credits_100",
          customer: { email: "buyer@example.com" },
          success_url: "https://makeup.example/dashboard?paid=creem",
          metadata: { userId: "user_1", planId: "credits_100" }
        })
      })
    );
  });
});
