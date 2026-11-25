import postgres from "postgres";
import { checkServerIdentity } from "node:tls";
import supabaseCa from "./supabase-ca.json";

export function connectDatabase(overrides: Pick<postgres.Options<Record<string, never>>, "onnotice"> = {}) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  return postgres(url, {
    prepare: false,
    max: 1,
    connect_timeout: 10,
    ...(process.env.NODE_ENV === "production" ? {
      ssl: { ca: supabaseCa.certificate, rejectUnauthorized: true, servername: new URL(url).hostname, checkServerIdentity },
    } : {}),
    ...overrides,
  });
}
