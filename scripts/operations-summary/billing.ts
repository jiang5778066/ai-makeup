import { sql } from "drizzle-orm";
import { dailySpendCapCents } from "../../src/lib/launch-flags";
import { createdAt, page, selectPage, timezone, type PageOptions, type PageRow, type SummaryExecutor } from "./query";

export async function budgetSummary(tx: SummaryExecutor, date: string) {
  const [row] = await tx.execute(sql`SELECT reserved_cents FROM public.ai_daily_usage WHERE usage_date = ${date}::date`);
  return {
    section: "budget", status: "available", date, timezone,
    reservedCents: row?.reserved_cents ?? null,
    legacyConfiguredCapCents: dailySpendCapCents(),
    providerActual: { status: "unavailable", cents: null },
  };
}

export async function billingSummary(tx: SummaryExecutor, date: string) {
  const from = sql`(${date}::date::timestamp AT TIME ZONE ${timezone})`;
  const until = sql`((${date}::date + 1)::timestamp AT TIME ZONE ${timezone})`;
  const [booked] = await tx.execute(sql`
    SELECT COUNT(*) FILTER (WHERE status IN ('completed', 'refund_review', 'refunded') AND currency = 'USD')::text AS "bookedCount",
      COALESCE(SUM(amount_cents) FILTER (WHERE status IN ('completed', 'refund_review', 'refunded') AND currency = 'USD'), 0)::text AS "bookedCents",
      COUNT(*) FILTER (WHERE status = 'refund_review')::text AS "refundReviewCount",
      COUNT(*) FILTER (WHERE currency <> 'USD' OR status NOT IN ('completed', 'refund_review', 'refunded'))::text AS "unrecognizedCount"
    FROM public.orders WHERE created_at >= ${from} AND created_at < ${until}
  `);
  const [refunds] = await tx.execute(sql`
    SELECT COUNT(*)::text AS "refundedCount", COALESCE(SUM(amount_cents), 0)::text AS "refundedCents"
    FROM public.orders WHERE refunded_at >= ${from} AND refunded_at < ${until} AND status = 'refunded' AND currency = 'USD'
  `);
  const [credits] = await tx.execute(sql`
    SELECT COALESCE(SUM(delta) FILTER (WHERE reason = 'purchase' AND ref_type = 'order' AND delta > 0), 0)::text AS purchased,
      COALESCE(SUM(-delta::bigint) FILTER (WHERE reason = 'generation' AND ref_type IN ('generation', 'media_task') AND delta < 0), 0)::text AS consumed,
      COALESCE(SUM(delta) FILTER (WHERE reason = 'refund' AND ref_type IN ('generation', 'media_task') AND delta > 0), 0)::text AS "taskRefunded",
      COALESCE(SUM(-delta::bigint) FILTER (WHERE reason = 'refund' AND ref_type = 'order' AND delta < 0), 0)::text AS "orderReclaimed"
    FROM public.credits_ledger WHERE created_at >= ${from} AND created_at < ${until}
  `);
  return {
    section: "billing", status: "available", date, timezone,
    orders: { currency: "USD", ...booked, ...refunds }, credits,
    reconciliation: { providerSettlement: "unavailable", refundDisputeType: "not_recorded" },
  };
}

export async function refundSummary(tx: SummaryExecutor, options: PageOptions) {
  const rows = await tx.execute<PageRow>(sql`
    WITH selected AS (
      SELECT t.id, t.user_id, t.created_at, t.status, t.currency, t.amount_cents, t.credits_awarded
      FROM public.orders t WHERE t.status = 'refund_review' ${selectPage(options)}
    )
    SELECT p.id, ${createdAt}, p.status, CASE WHEN p.currency = 'USD' THEN 'USD' END AS currency,
      CASE WHEN p.currency = 'USD' THEN p.amount_cents::text END AS "orderAmountCents",
      p.credits_awarded AS "creditsAwarded", lot.remaining AS "purchaseLotRemaining",
      ledger.purchased AS "purchasedCredits", ledger.reclaimed AS "reclaimedCredits"
    FROM selected p
    LEFT JOIN public.credit_grants lot ON lot.source_type = 'purchase' AND lot.source_id = p.id::text AND lot.user_id = p.user_id
    CROSS JOIN LATERAL (
      SELECT COALESCE(SUM(delta) FILTER (WHERE reason = 'purchase' AND delta > 0), 0)::text AS purchased,
        COALESCE(SUM(-delta::bigint) FILTER (WHERE reason = 'refund' AND delta < 0), 0)::text AS reclaimed
      FROM public.credits_ledger l
      WHERE l.user_id = p.user_id AND l.ref_type = 'order' AND l.ref_id = p.id::text AND l.reason IN ('purchase', 'refund')
    ) ledger
    ORDER BY p.created_at DESC, p.id DESC
  `);
  return { ...page("refunds", options, rows), refundDisputeType: "not_recorded" };
}
