import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockCreateCreemCheckout = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getCurrentUser: () => mockGetCurrentUser()
}));

vi.mock("@/lib/payments/creem-checkout", () => ({
  createCreemCheckout: (...args: unknown[]) => mockCreateCreemCheckout(...args)
}));

function jsonRequest(body: unknown) {
  return new Request("https://makeup.example/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  vi.resetModules();
  mockGetCurrentUser.mockReset();
  mockCreateCreemCheckout.mockReset();
  mockGetCurrentUser.mockResolvedValue({ id: "user_1", email: "buyer@example.com" });
  mockCreateCreemCheckout.mockResolvedValue("https://checkout.creem.io/test");
  process.env.CREEM_PRODUCT_CREDITS_100 = "prod_credits_100";
  vi.stubEnv("ENABLE_CHECKOUT", "1");
});

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/billing/checkout", () => {
  it.each([undefined, "0"])("disables checkout when ENABLE_CHECKOUT is %s", async (flag) => {
    vi.stubEnv("ENABLE_CHECKOUT", flag);
    const { POST } = await import("./route");

    const response = await POST(jsonRequest({ planId: "credits_100", provider: "creem" }));

    expect(response.status).toBe(503);
    expect(mockCreateCreemCheckout).not.toHaveBeenCalled();
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });
  it("always creates the one-time Creem credit pack", async () => {
    const { POST } = await import("./route");

    const response = await POST(jsonRequest({ planId: "credits_100", provider: "creem" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      checkoutUrl: "https://checkout.creem.io/test",
      provider: "creem",
      planId: "credits_100"
    });
    expect(mockCreateCreemCheckout).toHaveBeenCalledOnce();
  });

  it("rejects legacy Stripe or PayPal checkout requests", async () => {
    const { POST } = await import("./route");

    const response = await POST(jsonRequest({ planId: "credits_100", provider: "stripe" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("creem_only");
    expect(mockCreateCreemCheckout).not.toHaveBeenCalled();
  });
});
