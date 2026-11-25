import { sql, type SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export type SummaryExecutor = Pick<PostgresJsDatabase, "execute">;
export type PageOptions = { limit: number; before?: { timestamp: string; id: string } };
export type PageRow = { id: string; createdAt: string };

export const timezone = "Asia/Shanghai";
export const createdAt = sql`to_char(p.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"`;

export function listed(value: SQL, allowed: readonly string[]) {
  return sql`${value} IN (${sql.join(allowed.map(code => sql`${code}`), sql`, `)})`;
}

export function allowedCode(value: SQL, allowed: readonly string[]) {
  return sql`CASE WHEN ${listed(value, allowed)} THEN ${value} WHEN ${value} IS NOT NULL THEN 'other' END`;
}

export function selectPage(options: PageOptions) {
  const { before, limit } = options;
  return sql`${before ? sql`AND (t.created_at, t.id) < (${before.timestamp}::timestamptz, ${before.id}::uuid)` : sql.empty()}
    ORDER BY t.created_at DESC, t.id DESC LIMIT ${limit + 1}`;
}

export function page<T extends PageRow>(section: string, options: PageOptions, rows: T[]) {
  const items = rows.slice(0, options.limit);
  const last = items.at(-1);
  return {
    section, status: "available", items,
    nextBefore: rows.length > options.limit && last ? `${section}|${last.createdAt}|${last.id}` : null,
  };
}

export async function businessDay(tx: SummaryExecutor, date?: string) {
  if (date) return date;
  const [row] = await tx.execute(sql`SELECT (transaction_timestamp() AT TIME ZONE ${timezone})::date::text AS day`);
  return String(row.day);
}
