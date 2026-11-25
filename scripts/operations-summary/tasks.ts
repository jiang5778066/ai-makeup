import { sql } from "drizzle-orm";
import { allowedCode, createdAt, listed, page, selectPage, type PageOptions, type PageRow, type SummaryExecutor } from "./query";

const moderationRejections = ["moderation:nsfw", "moderation:minor", "moderation:no_face", "moderation:multiple_faces"];
const moderationErrors = ["moderation_unconfigured", "storage_get_failed"];
const legacyPending = ["creative_submission_pending", "creative_result_pending"];
const legacyCodes = [
  ...moderationRejections, ...moderationErrors, ...legacyPending,
  "insufficient_credits", "daily_ai_spend_cap_reached", "generation_failed",
  "invalid_result_content_type", "rendered_upload_missing", "generation_missing",
];
const mediaCodes = [
  "media_manual_review_required", "provider_unknown", "provider_response_invalid", "provider_status_conflict",
  "provider_identity_conflict", "storage_unavailable", "media_download_expired", "operator_confirmed_failure",
  "provider_failed", "provider_rejected",
];
const staleAt = sql`transaction_timestamp() - interval '30 minutes'`;

export async function legacySummary(tx: SummaryExecutor, options: PageOptions) {
  const rows = await tx.execute<PageRow>(sql`
    WITH selected AS (
      SELECT t.id, t.user_id, t.created_at, t.status, t.error
      FROM public.generations t
      WHERE (t.status IN ('failed', 'refunded') OR (
        t.status IN ('queued', 'moderating', 'running') AND
        (${listed(sql`t.error`, legacyPending)} OR t.updated_at <= ${staleAt})
      )) ${selectPage(options)}
    )
    SELECT p.id, ${createdAt}, p.status,
      CASE WHEN p.status IN ('failed', 'refunded') THEN 'terminal_failure'
        WHEN ${listed(sql`p.error`, legacyPending)} THEN 'reconcile' ELSE 'stale' END AS category,
      ${allowedCode(sql`p.error`, legacyCodes)} AS code,
      ledger.debited AS "debitedCredits", ledger.refunded AS "refundedCredits"
    FROM selected p CROSS JOIN LATERAL (
      SELECT COALESCE(SUM(-l.delta::bigint) FILTER (WHERE l.reason = 'generation' AND l.delta < 0), 0)::text AS debited,
        COALESCE(SUM(l.delta) FILTER (WHERE l.reason = 'refund' AND l.delta > 0), 0)::text AS refunded
      FROM public.credits_ledger l
      WHERE l.user_id = p.user_id AND l.ref_type = 'generation' AND l.ref_id = p.id::text
        AND l.reason IN ('generation', 'refund')
    ) ledger
    ORDER BY p.created_at DESC, p.id DESC
  `);
  return page("legacy", options, rows);
}

export async function mediaSummary(tx: SummaryExecutor, options: PageOptions) {
  const [schema] = await tx.execute(sql`SELECT to_regclass('public.media_tasks') IS NOT NULL AS installed`);
  if (!schema.installed) return { section: "media", status: "unavailable", reason: "media_schema_missing" };

  const rows = await tx.execute<PageRow>(sql`
    WITH selected AS (
      SELECT t.id, t.created_at, t.status, t.credit_state, t.state_version, t.reconcile_stage, t.error_code,
        t.provider_task_id IS NOT NULL AS has_provider_id
      FROM public.media_tasks t
      WHERE (t.status IN ('failed', 'refunded', 'reconciling') OR (
        t.status IN ('preparing', 'reserved', 'submitting', 'waiting', 'storing') AND
        (t.lease_expires_at IS NULL OR t.lease_expires_at <= transaction_timestamp()) AND
        t.updated_at <= ${staleAt} AND (t.next_action_at IS NULL OR t.next_action_at <= ${staleAt})
      )) ${selectPage(options)}
    )
    SELECT p.id, ${createdAt}, p.status, p.state_version AS "expectedVersion", p.has_provider_id AS "hasProviderId",
      ${allowedCode(sql`p.credit_state`, ["none", "reserved", "settled", "refunded"])} AS "creditState",
      ${allowedCode(sql`p.reconcile_stage`, ["submission", "query", "storage", "accounting"])} AS "reconcileStage",
      CASE WHEN p.status IN ('failed', 'refunded') THEN 'terminal_failure'
        WHEN p.status = 'reconciling' THEN 'reconcile' ELSE 'stale' END AS category,
      ${allowedCode(sql`p.error_code`, mediaCodes)} AS code
    FROM selected p ORDER BY p.created_at DESC, p.id DESC
  `);
  return page("media", options, rows);
}

export async function moderationSummary(tx: SummaryExecutor, options: PageOptions) {
  const known = [...moderationRejections, ...moderationErrors];
  const rows = await tx.execute<PageRow>(sql`
    WITH selected AS (
      SELECT t.id, t.created_at, t.error
      FROM public.generations t
      WHERE (t.status = 'moderating' OR (
        t.status IN ('failed', 'refunded') AND ${listed(sql`t.error`, known)}
      )) ${selectPage(options)}
    )
    SELECT p.id, ${createdAt}, CASE
      WHEN ${listed(sql`p.error`, moderationRejections)} THEN 'rejected'
      WHEN ${listed(sql`p.error`, moderationErrors)} THEN 'unavailable'
      ELSE 'in_progress' END AS outcome,
      CASE WHEN ${listed(sql`p.error`, known)} THEN p.error END AS code
    FROM selected p ORDER BY p.created_at DESC, p.id DESC
  `);
  return {
    ...page("moderation", options, rows),
    coverage: { legacyApproval: "not_recorded", mediaModeration: "not_recorded" },
  };
}
