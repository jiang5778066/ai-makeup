import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { connectDatabase } from "./connection";

declare global {
  var __pgClient: ReturnType<typeof connectDatabase> | undefined;
}

const client = global.__pgClient ?? connectDatabase();

if (process.env.NODE_ENV !== "production") {
  global.__pgClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
