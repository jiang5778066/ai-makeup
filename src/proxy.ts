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

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-page-locale", pathname === "/zh/ai-makeup" || pathname === "/zh-CN" || pathname.startsWith("/zh-CN/") ? "zh-CN" : "en");
  const { response, user } = await updateSession(request, requestHeaders);

  if (!user && isProtected(pathname, PROTECTED_PAGE_PREFIXES)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!user && isProtected(pathname, PROTECTED_API_PREFIXES)) {
    const denied = NextResponse.json({ code: "unauthorized", message: "Sign in required." }, { status: 401 });
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
