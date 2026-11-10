import { getCurrentUser, getSupabaseServerClient } from "@/lib/supabase/server";
import { accountConfigured, privateJson, sameOrigin } from "@/lib/platform-account-http";
export const dynamic = "force-dynamic";
export const POST = async (request: Request) => {
  try {
    if (!accountConfigured()) return privateJson({ code: "account_unavailable" }, 503);
    const user = await getCurrentUser();
    if (!user) return privateJson({ code: "unauthorized" }, 401);
    if (!sameOrigin(request)) return privateJson({ code: "origin_rejected" }, 403);
    const client = await getSupabaseServerClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    return error ? privateJson({ code: "logout_failed" }, 503) : privateJson({ signedOut: true });
  } catch { return privateJson({ code: "logout_failed" }, 503); }
};
