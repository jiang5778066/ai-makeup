# Production Readiness

## Environments

Preview, staging, and production must define the same required variable names, with provider sandbox keys in staging and live keys only in production.

Required for production:

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FAL_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_ORIGINALS`
- `R2_BUCKET_RESULTS`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `INNGEST_EVENT_KEY`
- `INNGEST_SIGNING_KEY`
- `CREEM_API_KEY`
- `CREEM_WEBHOOK_SECRET`
- `CREEM_PRODUCT_CREDITS_100`
- `DAILY_AI_SPEND_CAP_CENTS` (start the paid beta at `2000`, USD $20/day)
- `AI_GENERATION_ESTIMATE_CENTS` (start at `10` until real provider cost data replaces the estimate)
- `SUPPORT_EMAIL`
- `PRIVACY_EMAIL`
- `DMCA_EMAIL`

Optional:

- `R2_PUBLIC_BASE_URL` when result files are exposed through a dedicated public CDN.
- `CREEM_API_BASE` only for a Creem test endpoint; omit it in production.
- `RESEND_API_KEY` and `EMAIL_FROM` when transactional email is enabled.

## Kill Switches

- `DISABLE_CHECKOUT=1` returns `checkout_disabled` from checkout.
- `DISABLE_GENERATION=1` returns `generation_disabled` from generation.
- `DAILY_AI_SPEND_CAP_CENTS` is enforced atomically before a generation job starts.
- `AI_GENERATION_ESTIMATE_CENTS` is the amount reserved against that daily cap for each generation.

## Storage Retention

Configure Cloudflare R2 lifecycle rules outside the app:

- Originals bucket: expire objects after 1 day.
- Results bucket: expire objects after 30 days for beta unless the user exports or deletes earlier.

## Launch Gates

- Apply `drizzle/0001_production_readiness.sql` before enabling checkout.
- Create exactly one Creem product: USD $8 one-time payment for 100 credits, then set `CREEM_PRODUCT_CREDITS_100`.
- Verify Creem test checkout success grants the correct 100-credit lot exactly once, including duplicate webhook delivery.
- Verify a Creem refund or dispute locates the original order and reverses it only while the complete purchased lot remains unused.
- Verify failed AI jobs refund one credit.
- Send a test Inngest failure alert before public traffic.
- Confirm the database daily AI spend cap rejects work after the configured limit.
- Configure the production domain in Supabase redirect URLs and set `NEXT_PUBLIC_SITE_URL` to the same HTTPS origin.
- Confirm support/privacy/DMCA inboxes receive mail.
