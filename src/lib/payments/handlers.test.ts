import { beforeEach, describe, expect, it, vi } from "vitest";

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
        execute: (...args: unknown[]) => mockExecute(...args)
      });
    }
  }
}));

beforeEach(() => {
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
    mockReturning.mockResolvedValueOnce([]);
    const { grantPurchaseCredits } = await import("./handlers");

    const result = await grantPurchaseCredits({
      provider: "creem",
      eventId: "evt_1",
      providerOrderId: "order_1",
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
