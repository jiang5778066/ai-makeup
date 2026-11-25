import { pathToFileURL } from "node:url";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { connectDatabase } from "../src/db/connection";
import { mediaUuid } from "../src/lib/media-contracts";
import { billingSummary, budgetSummary, refundSummary } from "./operations-summary/billing";
import { legacySummary, mediaSummary, moderationSummary } from "./operations-summary/tasks";
import { type PageOptions, businessDay } from "./operations-summary/query";

const lists = { legacy: legacySummary, media: mediaSummary, moderation: moderationSummary, refunds: refundSummary };
const daily = { budget: budgetSummary, billing: billingSummary };
const help = [
  "只读运营查询（使用 DATABASE_URL）",
  "--section legacy|media|moderation|refunds [--limit 1..100] [--before NEXT_BEFORE]",
  "--section budget|billing [--date YYYY-MM-DD]（默认上海当天）",
].join("\n");

type ListSection = keyof typeof lists;
type DailySection = keyof typeof daily;
type Options = ({ section: ListSection } & PageOptions) | { section: DailySection; date?: string };

function validDate(value: string) {
  if (!/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseArgs(args: string[]): Options | null {
  const values = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const [name, value] = [args[i], args[i + 1]];
    if (!["--section", "--date", "--limit", "--before"].includes(name) || !value || values.has(name)) return null;
    values.set(name, value);
  }
  const section = values.get("--section") ?? "";
  const date = values.get("--date");
  const limit = values.get("--limit");
  const before = values.get("--before");
  if (Object.hasOwn(daily, section)) {
    if (limit || before || (date && !validDate(date))) return null;
    return { section: section as DailySection, date };
  }
  if (!Object.hasOwn(lists, section) || date || (limit && !/^(?:[1-9][0-9]?|100)$/.test(limit))) return null;
  const page = { section: section as ListSection, limit: Number(limit ?? 25) };
  if (!before) return page;
  const [cursorSection, timestamp, id, extra] = before.split("|");
  if (cursorSection !== section || extra !== undefined || !mediaUuid.test(id ?? "") ||
    !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{6}Z$/.test(timestamp ?? "") ||
    !validDate(timestamp.slice(0, 10))) return null;
  return { ...page, before: { timestamp, id } };
}

async function query(options: Options) {
  // 丢弃数据库通知，标准输出只保留固定结构的查询结果。
  const client = connectDatabase({ onnotice: () => {} });
  const db = drizzle(client);
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL statement_timeout = '5s'`);
      // 角色若只可看到部分数据，直接失败，避免把 RLS 过滤后的行数当成运营汇总。
      await tx.execute(sql`SET LOCAL row_security = off`);
      if ("limit" in options) return lists[options.section](tx, options);
      return daily[options.section](tx, await businessDay(tx, options.date));
    }, { isolationLevel: "repeatable read", accessMode: "read only" });
  } finally {
    await client.end();
  }
}

async function main(args: string[]) {
  if (args.length === 1 && args[0] === "--help") {
    process.stdout.write(`${help}\n`);
    return;
  }
  const options = parseArgs(args);
  if (!options) {
    process.stderr.write("operations_summary_invalid_args\n");
    process.exitCode = 2;
    return;
  }
  try {
    process.stdout.write(`${JSON.stringify(await query(options))}\n`);
  } catch {
    process.stderr.write("operations_summary_unavailable\n");
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main(process.argv.slice(2));
}
