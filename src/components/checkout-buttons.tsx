"use client";

import { CreditCard, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function CheckoutButtons({
  planId,
  cta
}: Readonly<{ planId: string | null; cta: string }>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!planId) return null;

  async function start() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, provider: "creem" })
    });
    if (response.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
      return;
    }
    const payload = (await response.json().catch(() => ({}))) as {
      checkoutUrl?: string;
      message?: string;
    };
    if (response.ok && payload.checkoutUrl) {
      window.location.href = payload.checkoutUrl;
      return;
    }
    setBusy(false);
    setError(payload.message ?? "Could not start Creem checkout. Please try again.");
  }

  return (
    <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
      <button className="button" type="button" onClick={() => void start()} disabled={busy}>
        {busy ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <CreditCard size={16} aria-hidden="true" />}
        {busy ? "Redirecting to Creem…" : cta}
      </button>
      {error ? <p className="tool-error">{error}</p> : null}
    </div>
  );
}
