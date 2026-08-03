import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using AI Makeup Studio, including credits, refunds, and acceptable use.",
  robots: { index: true, follow: true }
};

const LAST_UPDATED = "2026-08-03";
const CONTACT = process.env.SUPPORT_EMAIL ?? "support@yourdomain.com";

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" lastUpdated={LAST_UPDATED} currentPath="/legal/terms">
      <p>
        These Terms govern your use of AI Makeup Studio. By creating an account or using any part
        of the service you agree to them.
      </p>

      <h2>1. The service</h2>
      <p>
        We provide AI-generated previews of makeup looks applied to selfies you upload. Outputs are
        creative previews, not promises that any product or look will match in real life.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old to use the service. You may only upload photos of
        yourself or images for which you have explicit permission from the person depicted.
      </p>

      <h2>3. Credits and refunds</h2>
      <ul>
        <li>New accounts receive 3 free credits on first sign-in.</li>
        <li>Live preview is free. Each successfully saved HD result consumes 1 credit.</li>
        <li>Failed HD generations return the consumed credit automatically.</li>
        <li>We sell one one-time pack through Creem: USD $8 for 100 credits. There is no subscription.</li>
        <li>
          A 100-credit pack may receive a full cash refund only while all 100 credits in that exact
          pack remain unused. We do not issue partial cash refunds. Contact support before asking
          Creem to process a refund.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Upload photos of minors or anyone who has not consented.</li>
        <li>Upload sexual, hateful, harassing, or violent imagery.</li>
        <li>Use the service to impersonate, defame, or deceive others.</li>
        <li>Scrape, resell, or repackage the service.</li>
        <li>Bypass rate limits, payment, or content safety filters.</li>
      </ul>

      <h2>5. Content ownership</h2>
      <p>
        You own the images you upload. You grant us a limited license to process those images
        solely to generate and deliver the requested outputs and to perform mandatory safety
        screening. We claim no rights to generated outputs beyond the right to display them inside
        your account.
      </p>

      <h2>6. AI disclaimer</h2>
      <p>
        AI outputs may include artifacts, inaccuracies, or unintended likenesses. We do not
        guarantee they are suitable for commercial use. Verify any output before publishing.
      </p>

      <h2>7. Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these Terms, fail to pay, or cause harm.
        On termination we delete account data within 30 days, except where retention is legally
        required.
      </p>

      <h2>8. Disclaimers and liability</h2>
      <p>
        The service is provided &ldquo;as is&rdquo; without warranties. To the maximum extent
        permitted by law, our aggregate liability for any claim is limited to the amount you paid
        us in the 12 months preceding the claim.
      </p>

      <h2>9. Changes</h2>
      <p>
        We will post material changes here and email registered users at least 14 days before they
        take effect.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. See also the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    </LegalShell>
  );
}
