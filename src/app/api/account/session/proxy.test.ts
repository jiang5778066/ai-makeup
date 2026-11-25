import { NextRequest, NextResponse } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
const { updateSession } = vi.hoisted(() => ({ updateSession: vi.fn() }));
vi.mock("@/lib/supabase/middleware", () => ({ updateSession }));
import { proxy } from "@/proxy";

beforeEach(() => {
  updateSession.mockReset().mockResolvedValue({ response: NextResponse.next(), user: null });
});

it.each([["GET", "/api/account/session"], ["HEAD", "/api/account/session"], ["POST", "/api/account/logout?source=header"]])(
  "%s %s 由账户路由执行请求级核验", async (method, path) => {
    const response = await proxy(new NextRequest(`https://studio.test${path}`, {
      method, headers: { Cookie: "fixture=client-cookie" },
    }));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-middleware-request-cookie")).toBe("fixture=client-cookie");
    expect(updateSession).not.toHaveBeenCalled();
  },
);

it("相邻受保护路径仍由代理核验，其他方法保留原缓存策略", async () => {
  for (const path of ["/api/account/session/child", "/api/account/session-other", "/api/account/delete-data", "/api/projects"]) {
    const response = await proxy(new NextRequest(`https://studio.test${path}`));
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBeNull();
  }
  const response = await proxy(new NextRequest("https://studio.test/api/account/logout"));
  expect(response.status).toBe(401);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("vary")).toBe("Cookie");
  expect(updateSession).toHaveBeenCalledTimes(5);
});

it("相邻路径沿用中间件返回的刷新 Cookie 和语言", async () => {
  const refreshed = NextResponse.next();
  refreshed.cookies.set("fixture", "refreshed");
  updateSession.mockResolvedValue({ response: refreshed, user: { id: "alice" } });
  const request = new NextRequest("https://studio.test/zh-CN/my-creations", { headers: { Cookie: "fixture=old" } });
  expect(await proxy(request)).toBe(refreshed);
  expect(refreshed.cookies.get("fixture")?.value).toBe("refreshed");
  const requestHeaders = updateSession.mock.calls[0][1];
  expect(requestHeaders.get("cookie")).toBe("fixture=old");
  expect(requestHeaders.get("x-page-locale")).toBe("zh-CN");
});
