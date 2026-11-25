import { createServerClient, type CookieMethodsServer, type SetAllCookies } from "@supabase/ssr";
import { isAuthSessionMissingError, type User } from "@supabase/supabase-js";

export function createSupabaseClient(cookieAdapter: CookieMethodsServer) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter },
  );
}

type CookieWrite = Parameters<SetAllCookies>[0][number];
export const isExpiredCookie = ({ options }: CookieWrite) => options.maxAge !== undefined
  ? options.maxAge <= 0
  : options.expires !== undefined && options.expires.getTime() <= Date.now();

export function createRequestSession(cookies: { name: string; value: string }[]) {
  const visible = new Map(cookies.map(({ name, value }) => [name, value]));
  const pending = new Map<string, CookieWrite>();
  let refreshed: CookieWrite[] = [];
  const client = createSupabaseClient({
    getAll: () => Array.from(visible, ([name, value]) => ({ name, value })),
    setAll(toSet) {
      for (const write of toSet) {
        const { name, value } = write;
        pending.set(name, write);
        if (isExpiredCookie(write)) visible.delete(name);
        else visible.set(name, value);
      }
      // 刷新产生的新值与同批旧分片清理必须一起提交。
      if (toSet.some(write => write.value && !isExpiredCookie(write))) refreshed = Array.from(pending.values());
    },
  });
  return {
    client,
    cookieWrites: (temporaryFailure: boolean) => temporaryFailure ? refreshed : Array.from(pending.values()),
  };
}

type AccountSession =
  | { status: "signed_in"; user: User }
  | { status: "signed_out" }
  | { status: "unavailable" };

const invalidSessionCodes = new Set([
  "bad_jwt",
  "session_not_found",
  "session_expired",
  "refresh_token_not_found",
  "refresh_token_already_used",
]);

export function authFailure(error: unknown): Exclude<AccountSession, { status: "signed_in" }> {
  if (isAuthSessionMissingError(error)) return { status: "signed_out" };
  if (typeof error === "object" && error !== null) {
    const status = "status" in error ? error.status : undefined;
    if (status === 401) return { status: "signed_out" };
    if (typeof status === "number" && status >= 400 && status < 500 && status !== 429 &&
        "code" in error && typeof error.code === "string" && invalidSessionCodes.has(error.code)) {
      return { status: "signed_out" };
    }
  }
  return { status: "unavailable" };
}

export async function verifyAccountSession(client: ReturnType<typeof createSupabaseClient>): Promise<AccountSession> {
  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) return authFailure(error);
    return user?.id ? { status: "signed_in", user } : { status: "signed_out" };
  } catch (error) {
    return authFailure(error);
  }
}
