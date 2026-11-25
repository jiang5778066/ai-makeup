import type { User } from "@supabase/supabase-js";
import { privateJson } from "@/lib/platform-account-http";
import { getSupabaseAccountClient } from "./server";
import { verifyAccountSession } from "./request-session";

type AccountClient = Awaited<ReturnType<typeof getSupabaseAccountClient>>["client"];
export async function withAccountSession(handle: (user: User, client: AccountClient) => Response | Promise<Response>) {
  try {
    const { client, commitCookies } = await getSupabaseAccountClient();
    const session = await verifyAccountSession(client);
    const response = session.status === "signed_in"
      ? await handle(session.user, client)
      : session.status === "signed_out"
        ? privateJson({ code: "unauthorized" }, 401)
        : privateJson({ code: "account_unavailable" }, 503);
    commitCookies(response.status === 503);
    return response;
  } catch {
    return privateJson({ code: "account_unavailable" }, 503);
  }
}
