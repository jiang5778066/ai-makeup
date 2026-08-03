import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "The essential cookies and local browser storage used by Makeup AI.",
  robots: { index: true, follow: true }
};

const LAST_UPDATED = "2026-08-03";

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" lastUpdated={LAST_UPDATED} currentPath="/legal/cookies">
      <p>
        Paid Beta uses only storage required to sign you in, keep the service secure, and restore a
        try-on you chose to continue after login. We do not use analytics or advertising cookies,
        so there is no optional-cookie banner in this version.
      </p>

      <h2>1. Authentication cookies</h2>
      <p>
        Supabase Auth sets strictly necessary session cookies to keep you signed in and refresh your
        session. Blocking them prevents account, credit, checkout, and creation-history features.
      </p>

      <h2>2. Local try-on draft</h2>
      <p>
        If a guest asks to save an HD result, the browser can temporarily store the selected frame
        and makeup settings in IndexedDB so the preview can be restored after login. The draft is
        read once and expires after 30 minutes. It is not an analytics identifier.
      </p>

      <h2>3. Session state</h2>
      <p>
        Session storage may retain the current makeup configuration during a same-tab login flow.
        Browsers normally remove it when the tab or session ends.
      </p>

      <h2>4. Payment provider</h2>
      <p>
        Selecting the paid pack redirects you to Creem. Creem applies its own cookie and privacy
        policies on its checkout domain. Makeup AI does not receive full card details.
      </p>

      <h2>5. Browser controls</h2>
      <p>
        You may clear site data in browser settings. Doing so signs you out and removes any pending
        local try-on draft. See also the <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
        <Link href="/legal/terms">Terms</Link>.
      </p>
    </LegalShell>
  );
}
