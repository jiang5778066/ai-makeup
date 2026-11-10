import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
const session = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock("@/lib/supabase/middleware", () => ({ updateSession: session.update }));
import { proxy } from "@/proxy";
beforeEach(() => { session.update.mockReset().mockResolvedValue({ user: null, response: NextResponse.next() }); });
afterEach(() => vi.restoreAllMocks());
it.each(["/api/billing/checkout", "/api/credits/balance", "/api/billing/checkout?plan=credits_100", "/api/credits/balance?fresh=1"])("访客精确路径%s保密且禁止缓存", async path => {
  const response = await proxy(new NextRequest(`https://makeup.example${path}`));
  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({ code: "unauthorized", message: "Sign in required." });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("vary")).toBe("Cookie");
});
it.each(["Accept-Encoding", "Accept-Encoding, cookie"])("保留既有Vary %s且不重复Cookie", async vary => {
  const original = NextResponse.json.bind(NextResponse);
  vi.spyOn(NextResponse, "json").mockImplementation((body, init) => { const response = original(body, init); response.headers.set("Vary", vary); return response; });
  const response = await proxy(new NextRequest("https://makeup.example/api/billing/checkout"));
  expect(response.headers.get("vary")?.split(",").map(value => value.trim().toLowerCase())).toEqual(["accept-encoding", "cookie"]);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});
it.each(["/api/account/session", "/api/account/logout?source=header"])("D1既有精确路径%s继续保密", async path => {
  const response = await proxy(new NextRequest(`https://makeup.example${path}`));
  expect(response.status).toBe(401); expect(response.headers.get("cache-control")).toBe("private, no-store"); expect(response.headers.get("vary")).toBe("Cookie");
});
it.each(["/api/billing/checkout/child", "/api/credits/balance/child", "/api/credits/balances", "/api/account/session/child", "/api/projects"])("近似受保护路径%s不扩大补头", async path => {
  const response = await proxy(new NextRequest(`https://makeup.example${path}`));
  expect(response.status).toBe(401); expect(response.headers.get("cache-control")).toBeNull(); expect(response.headers.get("vary")).toBeNull();
});
it.each(["/api/billing/status?attempt=synthetic", "/api/billing/checkouts"])("未受proxy保护的%s继续由handler处理", async path => {
  const original = NextResponse.next(); session.update.mockResolvedValue({ user: null, response: original });
  expect(await proxy(new NextRequest(`https://makeup.example${path}`))).toBe(original);
});
it("已登录响应和locale请求头保持原样", async () => {
  const response = NextResponse.next({ headers: { Vary: "Accept-Encoding", "Cache-Control": "original" } });
  session.update.mockResolvedValue({ user: { id: "synthetic" }, response });
  for (const path of ["/api/billing/checkout", "/api/credits/balance", "/api/account/session", "/zh-CN/my-creations"]) expect(await proxy(new NextRequest(`https://makeup.example${path}`))).toBe(response);
  expect(response.headers.get("vary")).toBe("Accept-Encoding"); expect(response.headers.get("cache-control")).toBe("original");
  expect(session.update.mock.calls.at(-1)?.[1].get("x-page-locale")).toBe("zh-CN");
});
it("既有dashboard登录跳转仍保留完整查询", async () => {
  const response = await proxy(new NextRequest("https://makeup.example/dashboard?tag=a&tag=b"));
  const location = new URL(response.headers.get("location")!); expect(location.pathname).toBe("/login"); expect(location.searchParams.get("next")).toBe("/dashboard?tag=a&tag=b");
});
