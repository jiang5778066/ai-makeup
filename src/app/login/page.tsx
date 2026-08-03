"use client";

import { WandSparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { safeNextPath } from "@/lib/auth-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;

    setStatus("sending");
    setErrorMessage(null);

    const supabase = getSupabaseBrowserClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const next = safeNextPath(searchParams.get("next"));
    const callbackUrl = new URL("/auth/callback", siteUrl);
    callbackUrl.searchParams.set("next", next);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString()
      }
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="container">
      <section className="tool-card form-card">
        <span className="brand-mark">M</span>
        <h1 style={{ fontSize: "2.4rem", lineHeight: 1.05, marginTop: 18 }}>Log in to AI Makeup Studio</h1>
        <p className="lead" style={{ fontSize: "1rem" }}>
          Save projects, track credits, and unlock HD no-watermark exports.
        </p>

        {status === "sent" ? (
          <div className="result-card" role="status">
            <h3>Check your inbox</h3>
            <p>
              We just sent a magic link to <strong>{email}</strong>. Click it to finish signing in. The link works for the next 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                className="input"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                disabled={status === "sending"}
              />
            </label>
            <button className="button" type="submit" style={{ width: "100%" }} disabled={status === "sending"}>
              <WandSparkles size={17} aria-hidden="true" />
              {status === "sending" ? "Sending magic link..." : "Continue with email"}
            </button>
            {status === "error" && errorMessage ? (
              <p style={{ color: "var(--cherry)", marginTop: 12, fontSize: "0.95rem" }}>{errorMessage}</p>
            ) : null}
          </form>
        )}

        <Link className="ghost-button" href="/" style={{ width: "100%", marginTop: 12 }}>
          Back to studio
        </Link>
      </section>
    </main>
  );
}
