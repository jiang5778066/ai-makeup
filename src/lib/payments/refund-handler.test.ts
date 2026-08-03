import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEventReturning = vi.fn();
const mockSelectForUpdate = vi.fn();
const mockInsertValues = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    transaction: (callback: (tx: unknown) => unknown) =>
      callback({
        insert: () => ({
          values: (values: unknown) => {
            mockInsertValues(values);
            return {
              onConflictDoNothing: () => ({ returning: () => mockEventReturning() })
            };
          }
        }),
        select: () => ({
          from: () => ({
            where: () => ({ for: () => mockSelectForUpdate() })
          })
        }),
        update: () => ({ set: () => ({ where: () => undefined }) })
      })
  }
}));

beforeEach(() => {
  mockEventReturning.mockReset();
  mockSelectForUpdate.mockReset();
  mockInsertValues.mockReset();
});

describe("Creem refund handler", () => {
  it("reverses an unused purchase found by provider transaction id", async () => {
    mockEventReturning.mockResolvedValueOnce([{ provider: "creem" }]);
    mockSelectForUpdate
      .mockResolvedValueOnce([{
        id: "order_db_1",
        userId: "user_1",
        creditsAwarded: 100
      }])
      .mockResolvedValueOnce([{
        id: "grant_1",
        initialAmount: 100,
        remaining: 100
      }]);
    const { reverseCreditsForRefund } = await import("./handlers");

    const result = await reverseCreditsForRefund({
      provider: "creem",
      eventId: "evt_refund_1",
      providerTransactionId: "transaction_1"
    });

    expect(result).toBe("reversed");
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        delta: -100,
        reason: "refund",
        refType: "order",
        refId: "order_db_1"
      })
    );
  });
});
