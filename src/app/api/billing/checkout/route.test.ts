import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockCreateCreemCheckout = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getCurrentUser: () => mockGetCurrentUser()
}));

vi.mock("@/lib/payments/creem-checkout", () => ({
  createCreemCheckout: (...args: unknown[]) => mockCreateCreemCheckout(...args)
}));

function jsonRequest(body: unknown, origin: string | null = "https://makeup.example") {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (origin) headers.set("Origin", origin);

  return new Request("https://makeup.example/api/billing/checkout", {
    method: "POST",
    headers,
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
});

describe("POST /api/billing/checkout", () => {
  it.each([
    ["missing", null],
    ["cross-origin", "https://evil.example"]
  ])("rejects %s Origin before checkout work", async (_label, origin) => {
    const { POST } = await import("./route");

    const response = await POST(jsonRequest({ planId: "credits_100" }, origin));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ code: "invalid_origin" });
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
    expect(mockCreateCreemCheckout).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON without creating a checkout", async () => {
    const { POST } = await import("./route");
    const request = new Request("https://makeup.example/api/billing/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://makeup.example"
      },
      body: "{"
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ code: "invalid_json" });
    expect(mockCreateCreemCheckout).not.toHaveBeenCalled();
  });

  it("rejects a null JSON body without creating a checkout", async () => {
    const { POST } = await import("./route");

    const response = await POST(jsonRequest(null));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ code: "invalid_json" });
    expect(mockCreateCreemCheckout).not.toHaveBeenCalled();
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

  it("returns a stable generic response when Creem fails", async () => {
    mockCreateCreemCheckout.mockRejectedValue(
      new Error("provider secret response: checkout_session_123")
    );
    const { POST } = await import("./route");

    const response = await POST(jsonRequest({ planId: "credits_100", provider: "creem" }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ code: "checkout_failed" });
  });
});
