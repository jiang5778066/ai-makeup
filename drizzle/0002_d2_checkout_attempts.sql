-- 先关闭收费并应用迁移，再部署新支付代码；回退保留表和事件身份数据。
CREATE TABLE billing_checkout_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE cascade,
  plan_id text NOT NULL,
  provider text NOT NULL CONSTRAINT billing_attempts_provider_check CHECK (provider = 'creem'),
  status text NOT NULL CONSTRAINT billing_attempts_status_check CHECK (status IN ('submitting','ready','unknown','failed','completed')),
  request_id text NOT NULL,
  checkout_url text,
  provider_order_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX billing_attempts_request_uq ON billing_checkout_attempts(request_id);
CREATE UNIQUE INDEX billing_attempts_active_uq ON billing_checkout_attempts(user_id,provider) WHERE status IN ('submitting','ready','unknown');
CREATE UNIQUE INDEX billing_attempts_order_uq ON billing_checkout_attempts(provider,provider_order_id) WHERE provider_order_id IS NOT NULL;
ALTER TABLE billing_checkout_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ADD COLUMN payload_identity text;
