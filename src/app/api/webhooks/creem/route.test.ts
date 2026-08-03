import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGrantPurchaseCredits = vi.fn();
const mockReverseCreditsForRefund = vi.fn();

vi.mock("@/lib/payments/handlers", () => ({
  grantPurchaseCredits: (...args: unknown[]) => mockGrantPurchaseCredits(...args),
  reverseCreditsForRefund: (...args: unknown[]) => mockReverseCreditsForRefund(...args)
}));

function signedRequest(body: unknown) {
  const payload = JSON.stringify(body);
  const signature = crypto.createHmac("sha256", "webhook_secret").update(payload).digest("hex");
  return new Request("http://localhost/api/webhooks/creem", {
    method: "POST",
    body: payload,
    headers: { "creem-signature": signature }
  });
}

beforeEach(() => {
  vi.resetModules();
  mockGrantPurchaseCredits.mockReset();
  mockReverseCreditsForRefund.mockReset();
  process.env.CREEM_WEBHOOK_SECRET = "webhook_secret";
  process.env.CREEM_PRODUCT_CREDITS_100 = "prod_credits_100";
});

describe("POST /api/webhooks/creem", () => {
  it("processes the official eventType + object checkout payload", async () => {
    mockGrantPurchaseCredits.mockResolvedValue("granted");
    const { POST } = await import("./route");

    const response = await POST(
      signedRequest({
        id: "evt_1",
        eventType: "checkout.completed",
        object: {
          id: "checkout_1",
          product: { id: "prod_credits_100" },
          order: {
            id: "order_1",
            transaction: "transaction_1",
            amount: 800,
            currency: "USD"
          },
          metadata: { userId: "user_1", planId: "credits_100" }
        }
      })
    );

    expect(response.status).toBe(200);
    expect(mockGrantPurchaseCredits).toHaveBeenCalledWith({
      provider: "creem",
      eventId: "evt_1",
      providerOrderId: "order_1",
      providerTransactionId: "transaction_1",
      userId: "user_1",
      planId: "credits_100",
      credits: 100,
      amountCents: 800,
      currency: "USD"
    });
  });

  it.each([
    ["wrong product", "prod_other", 800, "USD"],
    ["wrong amount", "prod_credits_100", 100, "USD"],
    ["wrong currency", "prod_credits_100", 800, "EUR"]
  ])("rejects checkout events with %s", async (_label, productId, amount, currency) => {
    const { POST } = await import("./route");

    const response = await POST(
      signedRequest({
        id: `evt_${_label}`,
        eventType: "checkout.completed",
        object: {
          id: "checkout_invalid",
          product: { id: productId },
          order: {
            id: "order_invalid",
            amount,
            currency
          },
          metadata: { userId: "user_1", planId: "credits_100" }
        }
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ code: "payment_mismatch" });
    expect(mockGrantPurchaseCredits).not.toHaveBeenCalled();
  });

  it("locates refunds by the official transaction_id when no order id is included", async () => {
    mockReverseCreditsForRefund.mockResolvedValue("reversed");
    const { POST } = await import("./route");

    const response = await POST(
      signedRequest({
        id: "evt_refund_1",
        eventType: "refund.created",
        object: {
          refund_amount: 800,
          transaction: { id: "transaction_1", amount_paid: 800 }
        }
      })
    );

    expect(response.status).toBe(200);
    expect(mockReverseCreditsForRefund).toHaveBeenCalledWith({
      provider: "creem",
      eventId: "evt_refund_1",
      providerTransactionId: "transaction_1",
      fullReversal: true
    });
  });

  it("marks a partial refund for review instead of treating it as a full reversal", async () => {
    mockReverseCreditsForRefund.mockResolvedValue("not_refundable");
    const { POST } = await import("./route");

    const response = await POST(
      signedRequest({
        id: "evt_refund_partial",
        eventType: "refund.created",
        object: {
          refund_amount: 200,
          transaction: {
            id: "transaction_1",
            amount_paid: 800,
            order: "order_1"
          }
        }
      })
    );

    expect(response.status).toBe(200);
    expect(mockReverseCreditsForRefund).toHaveBeenCalledWith({
      provider: "creem",
      eventId: "evt_refund_partial",
      providerOrderId: "order_1",
      providerTransactionId: "transaction_1",
      fullReversal: false
    });
  });

  it("asks Creem to retry when a refund arrives before the matching order", async () => {
    mockReverseCreditsForRefund.mockResolvedValue("not_found");
    const { POST } = await import("./route");

    const response = await POST(
      signedRequest({
        id: "evt_refund_early",
        eventType: "refund.created",
        object: { transaction_id: "transaction_early" }
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ code: "order_not_ready" });
    expect(mockReverseCreditsForRefund).toHaveBeenCalledWith({
      provider: "creem",
      eventId: "evt_refund_early",
      providerTransactionId: "transaction_early",
      fullReversal: false
    });
  });
});
