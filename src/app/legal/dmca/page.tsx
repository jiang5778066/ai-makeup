import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "DMCA Notice",
  description: "How to report content on AI Makeup Studio that infringes your copyright.",
  robots: { index: true, follow: true }
};

const LAST_UPDATED = "2026-05-25";
const DESIGNATED_AGENT_EMAIL = process.env.DMCA_EMAIL ?? "dmca@yourdomain.com";

export default function DmcaPage() {
  return (
    <LegalShell title="DMCA Notice" lastUpdated={LAST_UPDATED} currentPath="/legal/dmca">
      <p>
        AI Makeup Studio respects intellectual property rights. If you believe a user has uploaded
        or generated content that infringes your copyright, follow the takedown process below.
      </p>

      <h2>1. Designated agent</h2>
      <p>
        Send notices to our designated agent:{" "}
        <a href={`mailto:${DESIGNATED_AGENT_EMAIL}`}>{DESIGNATED_AGENT_EMAIL}</a>.
      </p>

      <h2>2. What to include</h2>
      <p>A complete DMCA notice must include:</p>
      <ul>
        <li>An electronic or physical signature of the rights owner or authorized representative.</li>
        <li>Identification of the copyrighted work claimed to be infringed.</li>
        <li>The URL or other location where the allegedly infringing material can be found.</li>
        <li>Your contact information (address, telephone, email).</li>
        <li>
          A statement that you have a good-faith belief that the use is not authorized by the
          rights owner, its agent, or the law.
        </li>
        <li>
          A statement, made under penalty of perjury, that the information in the notice is
          accurate and that you are authorized to act on behalf of the rights owner.
        </li>
      </ul>

      <h2>3. Counter-notice</h2>
      <p>
        If your content was removed and you believe it was a mistake or misidentification, you may
        submit a counter-notice with the same six elements above, plus your consent to jurisdiction.
      </p>

      <h2>4. Repeat infringers</h2>
      <p>We terminate accounts of users who are determined to be repeat infringers.</p>

      <p>
        Related: <Link href="/legal/terms">Terms of Service</Link>,{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    </LegalShell>
  );
}
