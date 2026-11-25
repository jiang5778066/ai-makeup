import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSelectWhere = vi.fn();
const mockUpdateSet = vi.fn();
const mockRefund = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    transaction: (callback: (tx: unknown) => unknown) => callback({
      select: () => ({ from: () => ({ where: () => Object.assign(Promise.resolve([{ userId: "user_1" }]), { for: () => mockSelectWhere() }) }) }),
      update: () => ({ set: (values: unknown) => { mockUpdateSet(values); return { where: vi.fn() }; } })
    })
  }
}));

vi.mock("@/lib/account-data-lock", () => ({ lockAccountData: vi.fn() }));
vi.mock("@/lib/credits", () => ({
  refundGenerationCreditsInTransaction: (...args: unknown[]) => mockRefund(...args)
}));

beforeEach(() => {
  vi.resetModules();
  mockSelectWhere.mockReset();
  mockUpdateSet.mockReset();
  mockRefund.mockReset();
});

describe("failed generation settlement", () => {
  it("refunds the original lot and marks the generation refunded", async () => {
    mockSelectWhere.mockResolvedValue([{ userId: "user_1", status: "running", error: null, initialRunId: null, dispatchDueAt: null }]);
    mockRefund.mockResolvedValue("refunded");
    const { failAndRefundGeneration } = await import("./generation-failure");

    const result = await failAndRefundGeneration("gen_1", "fal_timeout");

    expect(result).toBe("refunded");
    expect(mockRefund).toHaveBeenCalledWith(expect.anything(), "user_1", "gen_1");
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "refunded", error: "fal_timeout" })
    );
  });
});
