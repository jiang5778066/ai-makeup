"use client";

import { LoaderCircle, ShieldAlert, Trash2, X } from "lucide-react";
import { useState } from "react";
import { redirectAfterAccountDeletion } from "@/lib/client-navigation";

export function AccountSettings() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/delete-data", { method: "POST" });
      if (!response.ok) throw new Error("delete_failed");
      redirectAfterAccountDeletion();
    } catch {
      setBusy(false);
      setError("Could not delete your account. Try again or contact privacy support.");
    }
  }

  return (
    <section className="account-settings" id="settings" aria-labelledby="account-settings-title">
      <div>
        <span className="eyebrow"><ShieldAlert size={16} aria-hidden="true" /> Account settings</span>
        <h2 id="account-settings-title">Delete your account and stored images</h2>
        <p>
          This removes your Supabase account, generation history, credit balance, original uploads,
          rendered previews, and saved results. Billing records are retained without your user ID.
        </p>
      </div>
      <div className="account-settings-action" aria-live="polite">
        {confirming ? (
          <>
            <strong>This cannot be undone.</strong>
            <p>Permanently delete the account and all stored makeup images?</p>
            <div className="account-settings-buttons">
              <button className="danger-button" type="button" disabled={busy} onClick={() => void deleteAccount()}>
                {busy ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
                {busy ? "Deleting..." : "Permanently delete account"}
              </button>
              <button className="ghost-button" type="button" disabled={busy} onClick={() => setConfirming(false)}>
                <X size={16} aria-hidden="true" /> Cancel
              </button>
            </div>
          </>
        ) : (
          <button className="danger-button" type="button" onClick={() => setConfirming(true)}>
            <Trash2 size={16} aria-hidden="true" /> Delete account
          </button>
        )}
        {error ? <p className="tool-error">{error}</p> : null}
      </div>
    </section>
  );
}
