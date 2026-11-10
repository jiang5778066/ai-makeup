import { getTableColumns, sql } from "drizzle-orm";
import { generations, type NewGeneration } from "@/db/schema";

// 旧字段直接派生自同一schema，不复制列类型或注册第二张迁移表。
export const legacyGenerationFields = Object.fromEntries(Object.entries(getTableColumns(generations)).filter(([key]) => key !== "deletedAt")) as Omit<ReturnType<typeof getTableColumns<typeof generations>>, "deletedAt">;
type Executor = Pick<typeof import("@/db/client").db, "execute">;
export const insertLegacyGeneration = async (db: Executor, values: Omit<NewGeneration, "deletedAt">) => {
  const entries = Object.entries(values).filter(([key, value]) => value !== undefined && Object.hasOwn(legacyGenerationFields, key));
  const columns = entries.map(([key]) => legacyGenerationFields[key as keyof typeof legacyGenerationFields]);
  const names = sql.join(columns.map(column => sql.identifier(column.name)), sql`, `);
  const params = sql.join(entries.map(([, value], i) => sql`${sql.param(value, columns[i])}`), sql`, `);
  return db.execute<{ id: string }>(sql`insert into ${generations} (${names}) values (${params}) returning ${generations.id}`);
};
