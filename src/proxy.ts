import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PAGE_PREFIXES = ["/dashboard"];

const PROTECTED_API_PREFIXES = [
  "/api/makeup/generate",
  "/api/makeup/advice",
  "/api/makeup/transfer",
  "/api/projects",
  "/api/credits",
  "/api/billing/checkout",
  "/api/uploads",
  "/api/account"
];

function isProtected(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function withSessionCookies(response: NextResponse, sessionResponse: NextResponse) {
  const cookies = sessionResponse.headers.getSetCookie();
  if (cookies.length) {
    for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.append("Vary", "Cookie");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-page-locale", pathname === "/zh/ai-makeup" || pathname === "/zh-CN" || pathname.startsWith("/zh-CN/") ? "zh-CN" : "en");
  // 固定服务路由自行校验专用凭据，避免用户cookie刷新引入外部认证请求。
  if (pathname === "/api/internal/media/step") return NextResponse.next({ request: { headers: requestHeaders } });
  // 两个账户接口在路由内核验会话，并区分会话失效与认证服务故障。
  if (
    (pathname === "/api/account/session" && (request.method === "GET" || request.method === "HEAD")) ||
    (pathname === "/api/account/logout" && request.method === "POST")
  ) return NextResponse.next({ request: { headers: requestHeaders } });
  const { response, user } = await updateSession(request, requestHeaders);

  if (!user && isProtected(pathname, PROTECTED_PAGE_PREFIXES)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return withSessionCookies(NextResponse.redirect(loginUrl), response);
  }

  if (!user && isProtected(pathname, PROTECTED_API_PREFIXES)) {
    const denied = withSessionCookies(NextResponse.json({ code: "unauthorized", message: "Sign in required." }, { status: 401 }), response);
    if (pathname === "/api/account/session" || pathname === "/api/account/logout" || pathname === "/api/billing/checkout" || pathname === "/api/credits/balance") {
      denied.headers.set("Cache-Control", "private, no-store");
      const vary = (denied.headers.get("Vary") ?? "").split(",").map(value => value.trim()).filter(Boolean);
      if (!vary.some(value => value.toLowerCase() === "cookie")) vary.push("Cookie");
      denied.headers.set("Vary", vary.join(", "));
    }
    return denied;
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next internals + static files but still touch every page/API route so the Supabase
    // session cookie is refreshed on each navigation.
    "/((?!_next/static|_next/image|favicon.ico|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
