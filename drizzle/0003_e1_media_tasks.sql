-- 显式顺序：0001 → 0002_d1 → 0002_d2 → 本文件；回退应用保留任务和账务审计。
CREATE TABLE media_inputs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE cascade,
 staging_key text NOT NULL, sealed_key text, status text NOT NULL DEFAULT 'uploading',
 expected_mime text NOT NULL, expected_bytes integer NOT NULL, expected_sha256 text NOT NULL,
 verified_mime text, verified_bytes integer, verified_sha256 text,
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, sealed_at timestamptz,
 CONSTRAINT media_inputs_status_check CHECK(status IN ('uploading','ready','rejected','expired')),
 CONSTRAINT media_inputs_content_check CHECK(expected_mime IN ('image/png','image/jpeg','image/webp') AND expected_bytes BETWEEN 1 AND 8388608 AND expected_sha256 ~ '^[0-9a-f]{64}$'),
 CONSTRAINT media_inputs_sealed_check CHECK(status <> 'ready' OR (sealed_key IS NOT NULL AND verified_mime IS NOT NULL AND verified_bytes IS NOT NULL AND verified_sha256 IS NOT NULL AND verified_mime=expected_mime AND verified_bytes=expected_bytes AND verified_sha256=expected_sha256 AND sealed_at IS NOT NULL))
);
CREATE UNIQUE INDEX media_inputs_owner_uq ON media_inputs(user_id,id);
CREATE UNIQUE INDEX media_inputs_staging_uq ON media_inputs(staging_key);
CREATE UNIQUE INDEX media_inputs_sealed_uq ON media_inputs(sealed_key);
CREATE INDEX media_inputs_expiry_idx ON media_inputs(expires_at) WHERE status='uploading';
CREATE TABLE media_tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE cascade,
 media_type text NOT NULL,provider text NOT NULL DEFAULT 'router_creative',provider_account_ref text NOT NULL,model text NOT NULL,mode text NOT NULL,capability_version text NOT NULL DEFAULT 'media-v1',
 request jsonb NOT NULL, request_hash text NOT NULL,client_intent_id uuid NOT NULL,client_idempotency_key text NOT NULL,input_id uuid,
 quote jsonb NOT NULL,credits_quoted integer NOT NULL,provider_upper_cents integer NOT NULL,budget_usage_date date,budget_reserved_at timestamptz,
 status text NOT NULL DEFAULT 'preparing',credit_state text NOT NULL DEFAULT 'none',state_version integer NOT NULL DEFAULT 0,error_code text,reconcile_stage text,
 submission_id uuid,submission jsonb,submission_intent_at timestamptz,provider_task_id text,result_locator text,provider_completed_at timestamptz,
 result_key text,result_mime text,result_bytes bigint,result_sha256 text,
 credits_reserved_at timestamptz,credits_settled_at timestamptz,credits_refunded_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),next_action_at timestamptz DEFAULT now(),query_round integer NOT NULL DEFAULT 0,lease_token uuid,lease_expires_at timestamptz,deleted_at timestamptz,
 FOREIGN KEY(user_id,input_id) REFERENCES media_inputs(user_id,id),
 CONSTRAINT media_tasks_mode_check CHECK(provider='router_creative' AND ((media_type='image' AND model='gpt-image-2' AND mode IN ('text_to_image','image_to_image')) OR (media_type='video' AND model='grok-imagine-video-1.5' AND mode IN ('text_to_video','image_to_video')))),
 CONSTRAINT media_tasks_input_check CHECK((mode LIKE 'image_to_%')=(input_id IS NOT NULL)),
 CONSTRAINT media_tasks_value_check CHECK(credits_quoted>0 AND provider_upper_cents>0 AND state_version>=0 AND request_hash ~ '^[0-9a-f]{64}$'),
 CONSTRAINT media_tasks_status_check CHECK(status IN ('preparing','reserved','submitting','waiting','storing','reconciling','done','failed','refunded') AND credit_state IN ('none','reserved','settled','refunded') AND (reconcile_stage IS NULL OR reconcile_stage IN ('submission','query','storage','accounting'))),
 CONSTRAINT media_tasks_settlement_check CHECK((status<>'done' OR (credit_state='settled' AND result_key IS NOT NULL AND result_mime IS NOT NULL AND result_bytes IS NOT NULL AND result_bytes>0 AND result_sha256 IS NOT NULL AND result_sha256 ~ '^[0-9a-f]{64}$')) AND (status<>'refunded' OR credit_state='refunded') AND (status<>'failed' OR credit_state='none') AND (status NOT IN ('reserved','submitting','waiting','storing','reconciling') OR credit_state='reserved')),
 CONSTRAINT media_tasks_mime_check CHECK(result_mime IS NULL OR (media_type='image' AND result_mime IN ('image/png','image/jpeg','image/webp')) OR (media_type='video' AND result_mime IN ('video/mp4','video/webm')))
);
CREATE UNIQUE INDEX media_tasks_owner_uq ON media_tasks(user_id,id);
CREATE UNIQUE INDEX media_tasks_key_uq ON media_tasks(user_id,client_idempotency_key);
CREATE UNIQUE INDEX media_tasks_intent_uq ON media_tasks(user_id,client_intent_id);
CREATE UNIQUE INDEX media_tasks_submission_uq ON media_tasks(submission_id);
CREATE UNIQUE INDEX media_tasks_provider_task_uq ON media_tasks(provider,provider_account_ref,provider_task_id) WHERE provider_task_id IS NOT NULL;
CREATE INDEX media_tasks_visible_idx ON media_tasks(user_id,created_at DESC,id DESC) WHERE deleted_at IS NULL;
CREATE INDEX media_tasks_recovery_idx ON media_tasks(next_action_at,id) WHERE status IN ('reserved','submitting','waiting','storing','reconciling');
CREATE TABLE media_task_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),task_id uuid NOT NULL,user_id uuid NOT NULL,operation_id uuid NOT NULL,event_type text NOT NULL,state_version integer NOT NULL,
 actor_kind text NOT NULL DEFAULT 'system',actor_id text,evidence_ref text,payload_identity text NOT NULL,details jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(user_id,task_id) REFERENCES media_tasks(user_id,id), CONSTRAINT media_events_actor_check CHECK(actor_kind IN ('system','operator'))
);
CREATE UNIQUE INDEX media_events_operation_uq ON media_task_events(task_id,operation_id);
CREATE INDEX media_events_task_idx ON media_task_events(task_id,created_at,id);
ALTER TABLE media_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_task_events ENABLE ROW LEVEL SECURITY;
