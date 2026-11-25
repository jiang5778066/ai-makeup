ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS dispatch_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS initial_run_id text;

CREATE INDEX IF NOT EXISTS generations_initial_dispatch_due_idx
  ON generations (dispatch_due_at, id)
  WHERE status = 'queued' AND dispatch_due_at IS NOT NULL;

-- 仍在排队的历史预付任务沿用原身份。已开始或尚无原消费证据的历史记录继续走原运行。
UPDATE generations AS g
SET dispatch_due_at = clock_timestamp()
WHERE g.status = 'queued' AND g.error IS NULL AND g.dispatch_due_at IS NULL AND g.initial_run_id IS NULL
  AND to_jsonb(g)->>'deleted_at' IS NULL
  AND EXISTS (
    SELECT 1 FROM credit_consumptions AS c
    WHERE c.user_id = g.user_id AND c.ref_type = 'generation'
      AND c.ref_id = g.id::text AND c.refunded_at IS NULL
  );
