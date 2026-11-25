import { getTableColumns, sql } from "drizzle-orm";
import { generations, type NewGeneration } from "@/db/schema";

// 旧库读取只投影原字段。新受理可显式写入首次投递时间。
const { deletedAt: _deletedAt, dispatchDueAt: _dispatchDueAt, initialRunId: _initialRunId, ...legacyGenerationFields } = getTableColumns(generations);
export { legacyGenerationFields };
type Executor = Pick<typeof import("@/db/client").db, "execute">;
export const insertLegacyGeneration = async (db: Executor, values: Omit<NewGeneration, "deletedAt" | "dispatchDueAt" | "initialRunId">) => {
  const entries = Object.entries(values).filter(([key, value]) => value !== undefined && Object.hasOwn(legacyGenerationFields, key));
  const columns = entries.map(([key]) => legacyGenerationFields[key as keyof typeof legacyGenerationFields]);
  const names = sql.join(columns.map(column => sql.identifier(column.name)), sql`, `);
  const params = sql.join(entries.map(([, value], i) => sql`${sql.param(value, columns[i])}`), sql`, `);
  return db.execute<{ id: string }>(sql`insert into ${generations} (${names}) values (${params}) returning ${generations.id}`);
};
