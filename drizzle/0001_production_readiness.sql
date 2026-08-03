CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE cascade,
  "name" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX "projects_user_idx" ON "projects" ("user_id");

CREATE TABLE "generations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE cascade,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE set null,
  "upload_key" text NOT NULL,
  "rendered_upload_key" text,
  "result_key" text,
  "style_id" text NOT NULL,
  "mode" text NOT NULL DEFAULT 'full_face',
  "source_mode" text NOT NULL DEFAULT 'upload',
  "makeup_config" jsonb,
  "intensity" integer NOT NULL DEFAULT 62,
  "locale" text NOT NULL DEFAULT 'en',
  "status" text NOT NULL DEFAULT 'queued',
  "error" text,
  "credits_refunded_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "generations_mode_check" CHECK ("mode" IN ('full_face', 'virtual_try_on')),
  CONSTRAINT "generations_source_mode_check" CHECK ("source_mode" IN ('upload', 'camera')),
  CONSTRAINT "generations_intensity_check" CHECK ("intensity" BETWEEN 20 AND 100),
  CONSTRAINT "generations_locale_check" CHECK ("locale" IN ('en', 'zh-CN')),
  CONSTRAINT "generations_status_check" CHECK (
    "status" IN ('queued', 'moderating', 'running', 'done', 'failed', 'refunded')
  )
);
CREATE INDEX "generations_user_idx" ON "generations" ("user_id");
CREATE INDEX "generations_status_idx" ON "generations" ("status");

CREATE TABLE "credit_balances" (
  "user_id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE cascade,
  "balance" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "credit_balances_nonnegative" CHECK ("balance" >= 0)
);

CREATE TABLE "credits_ledger" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE cascade,
  "delta" integer NOT NULL,
  "reason" text NOT NULL,
  "ref_type" text,
  "ref_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "credits_ledger_delta_nonzero" CHECK ("delta" <> 0)
);
CREATE INDEX "credits_ledger_user_idx" ON "credits_ledger" ("user_id");
CREATE UNIQUE INDEX "credits_ledger_reference_uq"
  ON "credits_ledger" ("user_id", "reason", "ref_type", "ref_id");

CREATE TABLE "credit_grants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE cascade,
  "source_type" text NOT NULL,
  "source_id" text NOT NULL,
  "initial_amount" integer NOT NULL,
  "remaining" integer NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "credit_grants_amount_check" CHECK (
    "initial_amount" > 0 AND "remaining" BETWEEN 0 AND "initial_amount"
  )
);
CREATE UNIQUE INDEX "credit_grants_source_uq" ON "credit_grants" ("source_type", "source_id");
CREATE INDEX "credit_grants_user_idx" ON "credit_grants" ("user_id", "created_at");

CREATE TABLE "credit_consumptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE cascade,
  "grant_id" uuid NOT NULL REFERENCES "credit_grants"("id") ON DELETE cascade,
  "amount" integer NOT NULL,
  "ref_type" text NOT NULL,
  "ref_id" text NOT NULL,
  "refunded_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "credit_consumptions_amount_check" CHECK ("amount" > 0)
);
CREATE INDEX "credit_consumptions_reference_idx"
  ON "credit_consumptions" ("user_id", "ref_type", "ref_id");
CREATE INDEX "credit_consumptions_grant_idx" ON "credit_consumptions" ("grant_id");

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE cascade,
  "provider" text NOT NULL,
  "provider_order_id" text NOT NULL,
  "provider_transaction_id" text,
  "plan_id" text NOT NULL,
  "amount_cents" bigint NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "credits_awarded" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL,
  "refunded_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "orders_provider_check" CHECK ("provider" = 'creem'),
  CONSTRAINT "orders_amount_check" CHECK ("amount_cents" >= 0),
  CONSTRAINT "orders_credits_check" CHECK ("credits_awarded" >= 0)
);
CREATE UNIQUE INDEX "orders_provider_order_uq" ON "orders" ("provider", "provider_order_id");
CREATE UNIQUE INDEX "orders_provider_transaction_uq"
  ON "orders" ("provider", "provider_transaction_id")
  WHERE "provider_transaction_id" IS NOT NULL;
CREATE INDEX "orders_user_idx" ON "orders" ("user_id");

CREATE TABLE "webhook_events" (
  "provider" text NOT NULL,
  "event_id" text NOT NULL,
  "received_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("provider", "event_id"),
  CONSTRAINT "webhook_events_provider_check" CHECK ("provider" = 'creem')
);

CREATE TABLE "ai_daily_usage" (
  "usage_date" date PRIMARY KEY,
  "reserved_cents" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ai_daily_usage_nonnegative" CHECK ("reserved_cents" >= 0)
);

ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "generations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credit_balances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credits_ledger" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credit_grants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credit_consumptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_daily_usage" ENABLE ROW LEVEL SECURITY;
