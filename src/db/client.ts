import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import supabaseCa from "./supabase-ca.json";
import { checkServerIdentity } from "node:tls";

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
    max: 1,
    connect_timeout: 10,
    ...(process.env.NODE_ENV === "production" ? {
      ssl: { ca: supabaseCa.certificate, rejectUnauthorized: true, servername: new URL(getConnectionString()).hostname, checkServerIdentity }
    } : {})
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
