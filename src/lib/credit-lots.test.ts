import { describe, expect, it } from "vitest";
import { allocateCreditLots, isCreditLotFullyUnused } from "./credit-lots";

describe("credit lot allocation", () => {
  it("consumes the oldest available lots first", () => {
    expect(
      allocateCreditLots(
        [
          { id: "signup", remaining: 2 },
          { id: "order_1", remaining: 100 }
        ],
        3
      )
    ).toEqual([
      { lotId: "signup", amount: 2 },
      { lotId: "order_1", amount: 1 }
    ]);
  });

  it("returns null instead of partially spending when the balance is insufficient", () => {
    expect(allocateCreditLots([{ id: "signup", remaining: 2 }], 3)).toBeNull();
  });

  it("allows a cash refund only when the complete purchased lot remains", () => {
    expect(isCreditLotFullyUnused({ initialAmount: 100, remaining: 100 })).toBe(true);
    expect(isCreditLotFullyUnused({ initialAmount: 100, remaining: 99 })).toBe(false);
  });
});
