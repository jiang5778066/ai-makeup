import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReturning = vi.fn();
const mockValues = vi.fn();
const mockExecute = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    transaction: (callback: (tx: unknown) => unknown) =>
      callback({
        execute: (...args: unknown[]) => mockExecute(...args),
        insert: () => ({
          values: (values: unknown) => {
            mockValues(values);
            return {
              onConflictDoNothing: () => ({ returning: () => mockReturning() })
            };
          }
        })
      })
  }
}));

beforeEach(() => {
  mockReturning.mockReset();
  mockValues.mockReset();
  mockExecute.mockReset();
});

describe("signup credit grant", () => {
  it("uses the unique ledger insert as the concurrency gate", async () => {
    mockReturning.mockResolvedValueOnce([{ id: "ledger_1" }]);
    const { grantSignupCreditsIfNew } = await import("./credits");

    await grantSignupCreditsIfNew("user_1");

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        delta: 3,
        reason: "signup_grant",
        refType: "user",
        refId: "user_1"
      })
    );
    expect(mockExecute).toHaveBeenCalledOnce();
    expect(mockValues).toHaveBeenCalledTimes(2);
  });
});
