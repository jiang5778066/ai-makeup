import { withAccountSession } from "@/lib/supabase/account-session";
import { accountConfigured, privateJson, sameOrigin } from "@/lib/platform-account-http";
export const dynamic = "force-dynamic";
export const POST = async (request: Request) => {
  if (!accountConfigured()) return privateJson({ code: "account_unavailable" }, 503);
  if (!sameOrigin(request)) return privateJson({ code: "origin_rejected" }, 403);
  const expectedAccount = request.headers.get("X-Expected-Account");
  if (!expectedAccount) return privateJson({ code: "logout_account_required" }, 400);

  return withAccountSession(async (user, client) => {
    if (user.id !== expectedAccount) return privateJson({ code: "logout_account_mismatch" }, 409);
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      return error ? privateJson({ code: "logout_failed" }, 503) : privateJson({ signedOut: true });
    } catch { return privateJson({ code: "logout_failed" }, 503); }
  });
};
