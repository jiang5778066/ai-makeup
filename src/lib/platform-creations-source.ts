import { and, desc, eq, inArray, isNull, notInArray, or, sql } from "drizzle-orm";
import { generations } from "@/db/schema";
import { legacyGenerationFields } from "./platform-creations-legacy-schema";
import { encodeCreationCursor, makeupCreationId } from "./platform-creations-query";
import { mapMakeupCreation } from "./platform-creations-mapping";
import { makeupResultLink } from "./platform-creations-results";
import type { CreationQuery, CreationSource } from "./platform-creations-types";
type Database = typeof import("@/db/client").db;
export const creationListCondition = (userId: string, query: CreationQuery) => {
  const filter = query.filter;
  const media = filter === "video" ? sql`false` : filter === "full_face" ? eq(generations.mode, "full_face") : !["all", "image"].includes(filter) ? and(eq(generations.mode, "virtual_try_on"), sql`${generations.makeupConfig}->${filter}->'enabled' = 'true'::jsonb`) : undefined;
  const cursor = query.cursor ? sql`(${generations.createdAt}, ${generations.id}) < (${query.cursor.at}::timestamptz, ${query.cursor.id}::uuid)` : undefined;
  return and(eq(generations.userId, userId), isNull(generations.deletedAt), media, cursor);
};
export const createMakeupSource = (database: () => Promise<Database>, sign = makeupResultLink): CreationSource => ({
  validateCursor: async (userId, cursor) => {
    const db = await database();
    // 归属边界包含已移除行；时间直接与数据库比较，保留原微秒精度。
    const [row] = await db.select({ id: generations.id }).from(generations).where(and(eq(generations.userId, userId), eq(generations.id, cursor.id), sql`${generations.createdAt} = ${cursor.at}::timestamptz`)).limit(1);
    return Boolean(row);
  },
  list: async (userId, query) => {
    const db = await database();
    const rows = await db.select({ ...legacyGenerationFields, cursorAt: sql<string>`to_char(${generations.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')` }).from(generations).where(creationListCondition(userId, query)).orderBy(desc(generations.createdAt), desc(generations.id)).limit(query.limit + 1);
    const visible = rows.slice(0, query.limit);
    const last = visible.at(-1);
    return { items: await Promise.all(visible.map(row => mapMakeupCreation(row, sign))), nextCursor: rows.length > query.limit && last ? encodeCreationCursor(query.filter, last.cursorAt, last.id) : null };
  },
  read: async (userId, opaqueId) => {
    const id = makeupCreationId(opaqueId);
    if (!id) return null;
    const db = await database();
    const [row] = await db.select(legacyGenerationFields).from(generations).where(and(eq(generations.id, id), eq(generations.userId, userId), isNull(generations.deletedAt))).limit(1);
    return row ? mapMakeupCreation(row, sign) : null;
  },
  remove: async (userId, opaqueId) => {
    const id = makeupCreationId(opaqueId);
    if (!id) return "not_found";
    const db = await database();
    const [updated] = await db.update(generations).set({ deletedAt: new Date() }).where(and(eq(generations.id, id), eq(generations.userId, userId), isNull(generations.deletedAt), inArray(generations.status, ["done", "failed", "refunded"]), or(eq(generations.status, "done"), isNull(generations.error), notInArray(generations.error, ["creative_submission_pending", "creative_result_pending"])))).returning({ id: generations.id });
    if (updated) return "removed";
    const [row] = await db.select({ deletedAt: generations.deletedAt }).from(generations).where(and(eq(generations.id, id), eq(generations.userId, userId))).limit(1);
    return !row ? "not_found" : row.deletedAt ? "removed" : "in_progress";
  }
});
