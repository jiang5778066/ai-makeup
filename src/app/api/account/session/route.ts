import { getCurrentUser } from "@/lib/supabase/server";
import { accountConfigured, privateJson } from "@/lib/platform-account-http";
export const dynamic = "force-dynamic";
export const GET = async () => {
  if (!accountConfigured()) return privateJson({ code: "account_unavailable" }, 503);
  try {
    const user = await getCurrentUser();
    return user ? privateJson({ user: { id: user.id, email: user.email ?? null } }) : privateJson({ code: "unauthorized" }, 401);
  } catch { return privateJson({ code: "account_unavailable" }, 503); }
};
