export function isCheckoutEnabled() {
  return process.env.DISABLE_CHECKOUT !== "1";
}

export function isGenerationEnabled() {
  return process.env.DISABLE_GENERATION !== "1";
}

export function dailySpendCapCents(): number | null {
  const raw = process.env.DAILY_AI_SPEND_CAP_CENTS;
  if (!raw) return 2000;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function aiGenerationEstimateCents(): number {
  const value = Number(process.env.AI_GENERATION_ESTIMATE_CENTS ?? "7");
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 7;
}
