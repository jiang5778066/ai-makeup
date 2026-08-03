import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AI Makeup Studio collects, uses, stores, and deletes your data.",
  robots: { index: true, follow: true }
};

const LAST_UPDATED = "2026-08-03";
const CONTACT = process.env.PRIVACY_EMAIL ?? "privacy@yourdomain.com";

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" lastUpdated={LAST_UPDATED} currentPath="/legal/privacy">
      <p>
        This Privacy Policy explains how AI Makeup Studio (&ldquo;we&rdquo;, &ldquo;us&rdquo;)
        processes personal information when you use our website and AI makeup tools.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> email address you provide to sign in via magic link.
        </li>
        <li>
          <strong>Uploaded photos:</strong> selfies you upload to generate makeup looks. We treat
          these as sensitive personal data.
        </li>
        <li>
          <strong>Generated outputs:</strong> AI-rendered images we produce from your uploads.
        </li>
        <li>
          <strong>Usage data:</strong> credits ledger, generation history, and limited request
          metadata used for security and reliability. We do not run behavioral analytics in Beta.
        </li>
        <li>
          <strong>Payment data:</strong> we never store full payment card numbers. Our payment
          provider Creem handles that and shares order and refund status with us.
        </li>
      </ul>

      <h2>2. Biometric notice (Illinois BIPA, Texas CUBI, and similar laws)</h2>
      <p>
        Live try-on face landmarks are calculated locally in your browser and are not stored. When
        you request an HD result, the uploaded photo may contain facial geometry. We process it only to
        produce your requested result. We do <strong>not</strong> use it to identify you
        against any database, sell them, or share them with advertisers. By uploading a photo and
        checking the consent box, you provide written release for this processing.
      </p>
      <p>
        Retention: original photos are configured to expire within 24 hours; generated results
        within 30 days during paid beta. You may delete account generation data earlier from your
        dashboard or by emailing{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>3. How we use your data</h2>
      <ul>
        <li>Operate the AI generation workflow (upload, moderation, render, deliver).</li>
        <li>Maintain accounts, credits, and order history.</li>
        <li>Prevent fraud, abuse, and underage use.</li>
        <li>Improve performance and reliability (we do not train models on your uploads).</li>
      </ul>

      <h2>4. Sharing</h2>
      <p>We share data only with vendors that help us run the service:</p>
      <ul>
        <li>Supabase (authentication and database hosting).</li>
        <li>Cloudflare R2 (object storage for uploads and results).</li>
        <li>fal.ai (AI inference).</li>
        <li>AWS Rekognition (content safety screening).</li>
        <li>Inngest (background job queue).</li>
        <li>Creem (checkout, order, dispute, and refund processing).</li>
      </ul>
      <p>We do not sell personal information.</p>

      <h2>5. Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete, port, restrict,
        or object to processing of your personal information; to opt out of targeted advertising
        and sale (we do not do either); and to lodge a complaint with a supervisory authority. To
        exercise these rights email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> from the email
        attached to your account. We respond within 30 days.
      </p>

      <h2>6. International transfers</h2>
      <p>
        We operate from outside the EU. When data flows from the EEA / UK to our infrastructure we
        rely on Standard Contractual Clauses with each processor.
      </p>

      <h2>7. Children</h2>
      <p>
        The service is for users 18 and older. We use automated age estimation on uploads. If we
        discover an account belongs to a minor we will delete it and any associated data.
      </p>

      <h2>8. Changes</h2>
      <p>
        We will post material changes at least 30 days before they take effect and notify
        registered users by email.
      </p>

      <h2>9. Contact</h2>
      <p>
        Privacy questions: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. See also our{" "}
        <Link href="/legal/terms">Terms of Service</Link>,{" "}
        <Link href="/legal/cookies">Cookie Policy</Link>, and{" "}
        <Link href="/legal/dmca">DMCA Notice</Link>.
      </p>
    </LegalShell>
  );
}
