import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

function getConnectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  return url;
}

const client =
  global.__pgClient ??
  postgres(getConnectionString(), {
    prepare: false,
    max: 10,
    connect_timeout: 1
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
