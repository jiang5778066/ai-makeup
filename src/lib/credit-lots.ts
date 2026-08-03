export type CreditLot = { id: string; remaining: number };
export type CreditAllocation = { lotId: string; amount: number };

export function allocateCreditLots(
  lots: CreditLot[],
  amount: number
): CreditAllocation[] | null {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  let needed = amount;
  const allocations: CreditAllocation[] = [];

  for (const lot of lots) {
    if (needed === 0) break;
    const available = Math.max(0, lot.remaining);
    if (available === 0) continue;
    const consumed = Math.min(available, needed);
    allocations.push({ lotId: lot.id, amount: consumed });
    needed -= consumed;
  }

  return needed === 0 ? allocations : null;
}

export function isCreditLotFullyUnused(lot: {
  initialAmount: number;
  remaining: number;
}): boolean {
  return lot.initialAmount > 0 && lot.remaining === lot.initialAmount;
}
