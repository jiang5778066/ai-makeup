import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecute = vi.fn();
const mockInsertValues = vi.fn();
const mockInsertReturning = vi.fn();
const mockUpdateReturning = vi.fn();
const mockSelectWhere = vi.fn();
const mockTxForUpdate = vi.fn();
const mockLockedTable = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    execute: (...args: unknown[]) => mockExecute(...args),
    insert: () => ({
      values: (...args: unknown[]) => {
        mockInsertValues(...args);
        return { onConflictDoNothing: () => ({ returning: () => mockInsertReturning() }) };
      }
    }),
    select: () => ({
      from: () => ({
        where: (...args: unknown[]) => ({ limit: () => mockSelectWhere(...args) })
      })
    }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => mockUpdateReturning() }) }) }),
    transaction: async (callback: (tx: unknown) => unknown) =>
      callback({
        execute: (...args: unknown[]) => mockExecute(...args),
        insert: () => ({
          values: (...args: unknown[]) => {
            mockInsertValues(...args);
            return { onConflictDoNothing: () => ({ returning: () => mockInsertReturning() }) };
          }
        }),
        select: () => ({
          from: (table: unknown) => ({
            where: () => ({
              orderBy: () => ({ for: () => { mockLockedTable(table); return mockTxForUpdate(); } }),
              for: () => { mockLockedTable(table); return mockTxForUpdate(); }
            })
          })
        }),
        update: () => ({
          set: () => ({
            where: () => ({ returning: () => mockUpdateReturning() })
          })
        })
      })
  }
}));

beforeEach(() => {
  mockExecute.mockReset();
  mockInsertValues.mockReset();
  mockInsertReturning.mockReset();
  mockInsertReturning.mockResolvedValue([{ id: "ledger_1" }]);
  mockUpdateReturning.mockReset();
  mockSelectWhere.mockReset();
  mockSelectWhere.mockResolvedValue([]);
  mockLockedTable.mockReset();
  mockTxForUpdate.mockReset();
  mockTxForUpdate.mockResolvedValue([{ id: "lot_1", remaining: 5 }]);
});

describe("credits balance ledger", () => {
  it("grants exactly three signup credits in the paid beta", async () => {
    const { SIGNUP_GRANT_CREDITS } = await import("./credits");

    expect(SIGNUP_GRANT_CREDITS).toBe(3);
  });

  it("uses the user id as the idempotent signup grant reference", async () => {
    const { grantSignupCreditsIfNew } = await import("./credits");

    await grantSignupCreditsIfNew("user_1");

    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        delta: 3,
        reason: "signup_grant",
        refType: "user",
        refId: "user_1"
      })
    );
  });

  it("updates the balance row and ledger when credits are added", async () => {
    const { addCredits } = await import("./credits");

    await addCredits("user_1", 10, "signup_grant");

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_1", delta: 10, reason: "signup_grant" })
    );
  });

  it("deducts from credit_balances without allowing overdrafts", async () => {
    mockUpdateReturning.mockResolvedValue([]);
    const { InsufficientCreditsError, deductCredits } = await import("./credits");

    await expect(deductCredits("user_1", 1, "generation")).rejects.toBeInstanceOf(
      InsufficientCreditsError
    );

    expect(mockInsertValues).not.toHaveBeenCalled();
  });

  it("writes a negative ledger row after a successful balance deduction", async () => {
    mockUpdateReturning.mockResolvedValue([{ balance: 4 }]);
    const { deductCredits } = await import("./credits");

    await deductCredits("user_1", 1, "generation", { type: "generation", id: "gen_1" });

    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        delta: -1,
        reason: "generation",
        refType: "generation",
        refId: "gen_1"
      })
    );
  });

  it("restores the consumed credit lot when a generation is refunded", async () => {
    mockTxForUpdate.mockResolvedValue([
      { id: "consumption_1", grantId: "lot_1", amount: 1 }
    ]);
    const { refundGenerationCredits } = await import("./credits");

    const result = await refundGenerationCredits("user_1", "gen_1");

    expect(result).toBe("refunded");
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        delta: 1,
        reason: "refund",
        refType: "generation",
        refId: "gen_1"
      })
    );
  });
});

it("生成失败退款先锁本人余额再锁消费，空消费仍保持一次退款语义",async()=>{
 mockTxForUpdate.mockResolvedValueOnce([{userId:"user_1"}]).mockResolvedValueOnce([]);
 const {refundGenerationCredits}=await import("./credits");const {creditBalances,creditConsumptions}=await import("@/db/schema");
 expect(await refundGenerationCredits("user_1","empty_generation")).toBe("duplicate");
 expect(mockLockedTable.mock.calls.map(c=>c[0])).toEqual([creditBalances,creditConsumptions]);expect(mockInsertValues).not.toHaveBeenCalled();
});
