import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHash } from "node:crypto";
const mockSelect = vi.fn();
vi.mock("@/lib/platform-billing-persistence", () => ({ensureBillingPersistence:vi.fn()}));
const mockReturning = vi.fn();
const mockValues = vi.fn();
const mockExecute = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    transaction: (callback: (tx: unknown) => unknown) => {
      mockTransaction();
      return callback({
        insert: (table: unknown) => ({
          values: (values: unknown) => {
            mockValues(table, values);
            return {
              onConflictDoNothing: () => ({ returning: () => mockReturning() }),
              returning: () => mockReturning()
            };
          }
        }),
        select: () => ({ from: () => ({ where: () => { const p = mockSelect(); return Object.assign(p, {limit:()=>p,for:()=>p}); } }) }),
        execute: (...args: unknown[]) => mockExecute(...args)
      });
    }
  }
}));

beforeEach(() => {
  mockSelect.mockReset();
  mockReturning.mockReset();
  mockValues.mockReset();
  mockExecute.mockReset();
  mockTransaction.mockReset();
});

describe("Creem payment handlers", () => {
  it("records the webhook, order and credit grant in one transaction", async () => {
    mockReturning
      .mockResolvedValueOnce([{ provider: "creem", eventId: "evt_1" }])
      .mockResolvedValueOnce([{ id: "order_db_1" }]);
    const { grantPurchaseCredits } = await import("./handlers");

    const result = await grantPurchaseCredits({
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

    expect(result).toBe("granted");
    expect(mockTransaction).toHaveBeenCalledOnce();
    expect(mockValues).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ provider: "creem", eventId: "evt_1" })
    );
    expect(mockValues).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        sourceType: "purchase",
        sourceId: "order_db_1",
        initialAmount: 100,
        remaining: 100
      })
    );
  });

  it("does not grant credits for a duplicate webhook event", async () => {
    mockReturning.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const hash = createHash("sha256").update(JSON.stringify(["checkout.completed","creem","user_1","credits_100","order_1","transaction_1",800,"USD",100,null,null])).digest("hex");
    mockSelect.mockResolvedValueOnce([{payloadIdentity:hash}]).mockResolvedValueOnce([{userId:"user_1",providerOrderId:"order_1",providerTransactionId:"transaction_1",planId:"credits_100",amountCents:800,currency:"USD",creditsAwarded:100}]).mockResolvedValueOnce([]);
    const { grantPurchaseCredits } = await import("./handlers");

    const result = await grantPurchaseCredits({
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

    expect(result).toBe("duplicate");
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
