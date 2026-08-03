import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEventReturning = vi.fn();
const mockSelectForUpdate = vi.fn();
const mockInsertValues = vi.fn();
const mockUpdateSet = vi.fn();
const mockDeleteWhere = vi.fn();

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
        update: () => ({
          set: (values: unknown) => {
            mockUpdateSet(values);
            return { where: () => undefined };
          }
        }),
        delete: () => ({ where: (...args: unknown[]) => mockDeleteWhere(...args) })
      })
  }
}));

beforeEach(() => {
  mockEventReturning.mockReset();
  mockSelectForUpdate.mockReset();
  mockInsertValues.mockReset();
  mockUpdateSet.mockReset();
  mockDeleteWhere.mockReset();
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

  it("sends an anonymized order to refund review without writing a user ledger row", async () => {
    mockEventReturning.mockResolvedValueOnce([{ provider: "creem" }]);
    mockSelectForUpdate.mockResolvedValueOnce([{
      id: "order_db_1",
      userId: null,
      creditsAwarded: 100
    }]);
    const { reverseCreditsForRefund } = await import("./handlers");

    const result = await reverseCreditsForRefund({
      provider: "creem",
      eventId: "evt_refund_2",
      providerTransactionId: "transaction_2"
    });

    expect(result).toBe("not_refundable");
    expect(mockUpdateSet).toHaveBeenCalledWith({ status: "refund_review" });
    expect(mockInsertValues).not.toHaveBeenCalledWith(
      expect.objectContaining({ reason: "refund" })
    );
  });

  it("sends a partial refund to review without loading or reversing the credit lot", async () => {
    mockEventReturning.mockResolvedValueOnce([{ provider: "creem" }]);
    mockSelectForUpdate.mockResolvedValueOnce([{
      id: "order_db_1",
      userId: "user_1",
      creditsAwarded: 100
    }]);
    const { reverseCreditsForRefund } = await import("./handlers");

    const result = await reverseCreditsForRefund({
      provider: "creem",
      eventId: "evt_refund_partial",
      providerTransactionId: "transaction_1",
      fullReversal: false
    });

    expect(result).toBe("not_refundable");
    expect(mockUpdateSet).toHaveBeenCalledWith({ status: "refund_review" });
    expect(mockSelectForUpdate).toHaveBeenCalledOnce();
  });

  it("does not permanently deduplicate a refund that arrives before its order", async () => {
    mockEventReturning.mockResolvedValueOnce([{ provider: "creem" }]);
    mockSelectForUpdate.mockResolvedValueOnce([]);
    const { reverseCreditsForRefund } = await import("./handlers");

    const result = await reverseCreditsForRefund({
      provider: "creem",
      eventId: "evt_refund_early",
      providerTransactionId: "transaction_early"
    });

    expect(result).toBe("not_found");
    expect(mockDeleteWhere).toHaveBeenCalledOnce();
  });
});
