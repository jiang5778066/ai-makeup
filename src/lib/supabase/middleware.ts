import { NextResponse, type NextRequest } from "next/server";
import { accountConfigured } from "@/lib/platform-account-http";
import { createRequestSession, isExpiredCookie, verifyAccountSession } from "./request-session";

export async function updateSession(request: NextRequest, requestHeaders = request.headers) {
  if (!accountConfigured()) {
    return { response: NextResponse.next({ request: { headers: requestHeaders } }), user: null };
  }

  const { client, cookieWrites } = createRequestSession(request.cookies.getAll());
  const session = await verifyAccountSession(client);
  const writes = cookieWrites(session.status === "unavailable");
  const forwarded = new Headers(requestHeaders);
  if (writes.length) {
    for (const write of writes) {
      if (isExpiredCookie(write)) request.cookies.delete(write.name);
      else request.cookies.set(write.name, write.value);
    }
    const cookie = request.headers.get("cookie");
    if (cookie) forwarded.set("cookie", cookie);
    else forwarded.delete("cookie");
  }

  const response = NextResponse.next({ request: { headers: forwarded } });
  for (const { name, value, options } of writes) response.cookies.set(name, value, options);
  if (writes.length) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.append("Vary", "Cookie");
  }
  return { response, user: session.status === "signed_in" ? session.user : null };
}
