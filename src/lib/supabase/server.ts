import { cookies } from "next/headers";
import { authFailure, createRequestSession, createSupabaseClient, verifyAccountSession } from "./request-session";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createSupabaseClient({
    getAll: () => cookieStore.getAll(),
    setAll(toSet) {
      try {
        toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      } catch {
        // RSC contexts cannot mutate cookies; safe to ignore — middleware refreshes the session.
      }
    }
  });
}

export async function getSupabaseAccountClient() {
  const cookieStore = await cookies();
  const { client, cookieWrites } = createRequestSession(cookieStore.getAll());
  return {
    client,
    commitCookies(temporaryFailure: boolean) {
      for (const { name, value, options } of cookieWrites(temporaryFailure)) cookieStore.set(name, value, options);
    },
  };
}

export async function getCurrentAccountSession() {
  const { client, commitCookies } = await getSupabaseAccountClient();
  const session = await verifyAccountSession(client);
  commitCookies(session.status === "unavailable");
  return session;
}

export async function getCurrentUser() {
  const { client, commitCookies } = await getSupabaseAccountClient();
  let temporaryFailure = true;
  try {
    const { data: { user }, error } = await client.auth.getUser();
    temporaryFailure = Boolean(error && authFailure(error).status === "unavailable");
    return user;
  } catch (error) {
    temporaryFailure = authFailure(error).status === "unavailable";
    throw error;
  } finally {
    commitCookies(temporaryFailure);
  }
}
