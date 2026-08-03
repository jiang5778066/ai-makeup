export type PlanId = "credits_100";

export type Plan = {
  id: PlanId;
  label: string;
  credits: number;
  priceUsd: number;
  oneTime: boolean;
  creemProductId?: string;
};

const PLANS: Record<PlanId, Plan> = {
  credits_100: {
    id: "credits_100",
    label: "100 credits pack",
    credits: 100,
    priceUsd: 8,
    oneTime: true,
    creemProductId: process.env.CREEM_PRODUCT_CREDITS_100
  }
};

export function getPlan(planId: string): Plan | null {
  return (PLANS as Record<string, Plan>)[planId] ?? null;
}

export function planByCreemProductId(productId: string): Plan | null {
  return Object.values(PLANS).find((p) => p.creemProductId === productId) ?? null;
}

export const ALL_PLANS = PLANS;
