import { withAccountSession } from "@/lib/supabase/account-session";
import { accountConfigured, privateJson } from "@/lib/platform-account-http";
export const dynamic = "force-dynamic";
export const GET = async () => {
  if (!accountConfigured()) return privateJson({ code: "account_unavailable" }, 503);
  return withAccountSession(({ id, email }) => privateJson({ user: { id, email: email ?? null } }));
};
