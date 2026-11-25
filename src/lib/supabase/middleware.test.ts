import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AuthApiError, AuthSessionMissingError } from "@supabase/supabase-js";
import type { CookieMethodsServer } from "@supabase/ssr";
import { proxy } from "@/proxy";
import { updateSession } from "./middleware";

const mockCreateServerClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args)
}));

beforeEach(() => {
  mockCreateServerClient.mockReset();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:9");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "fixture");
});
afterEach(() => vi.unstubAllEnvs());

describe("public middleware without Supabase", () => {
  it("keeps public pages renderable instead of initializing an invalid client", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    const request = new NextRequest("https://makeup.example/ai-makeup");

    const { user } = await updateSession(request);

    expect(user).toBeNull();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });
});

const key = "sb-fixture-auth-token";
const cookie = `${key}.0=original-a; ${key}.1=original-b; locale=zh-CN`;
const authRequest = (path: string) => new NextRequest("https://studio.test" + path, { headers: { Cookie: cookie } });

function authFixture(result: (adapter: CookieMethodsServer) => unknown) {
  mockCreateServerClient.mockImplementation((_url, _key, { cookies }) => ({
    auth: { getUser: () => result(cookies) },
  }));
}

async function deleteChunks(adapter: CookieMethodsServer) {
  await adapter.setAll!([0, 1].map(index => ({
    name: `${key}.${index}`, value: "", options: { path: "/", maxAge: 0 },
  })), {});
}

it.each([
  new AuthApiError("limited", 429, "over_request_rate_limit"),
  new AuthApiError("unavailable", 503, undefined),
  new TypeError("offline"),
])("临时认证错误 %# 保留原 Cookie 和请求语言", async error => {
  authFixture(async adapter => {
    await deleteChunks(adapter);
    if (error instanceof TypeError) throw error;
    return { data: { user: null }, error };
  });
  const request = authRequest("/zh-CN/ai-image-generator");
  const response = await proxy(request);
  expect(response.headers.getSetCookie()).toEqual([]);
  expect(response.headers.get("x-middleware-request-cookie")).toBe(cookie);
  expect(response.headers.get("x-middleware-request-x-page-locale")).toBe("zh-CN");
  expect(request.headers.get("cookie")).toBe(cookie);
});

it.each([false, true])("成功刷新后把多片替换为新值并转发 %#", async temporary => {
  authFixture(async adapter => {
    await deleteChunks(adapter);
    await adapter.setAll!([{ name: key, value: "rotated", options: { path: "/", maxAge: 3600 } }], {});
    return temporary
      ? { data: { user: null }, error: new AuthApiError("unavailable", 503, undefined) }
      : { data: { user: { id: "bob" } }, error: null };
  });
  const response = await proxy(authRequest("/zh-CN/ai-image-generator"));
  expect(response.headers.get("x-middleware-request-cookie")).toBe(`locale=zh-CN; ${key}=rotated`);
  expect(response.cookies.getAll().map(({ name, value }) => [name, value]))
    .toEqual([[`${key}.0`, ""], [`${key}.1`, ""], [key, "rotated"]]);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.headers.get("vary")).toBe("Cookie");
});

it.each([["/robots.txt", 200], ["/api/projects", 401], ["/dashboard", 307]])(
  "确认会话失效时 %s 保留认证 Cookie 删除指令", async (path, status) => {
    authFixture(async adapter => {
      await deleteChunks(adapter);
      return { data: { user: null }, error: new AuthSessionMissingError() };
    });
    const response = await proxy(authRequest(path));
    expect(response.status).toBe(status);
    expect(response.headers.getSetCookie())
      .toEqual([0, 1].map(index => `${key}.${index}=; Path=/; Max-Age=0`));
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("vary")).toBe("Cookie");
    if (path === "/robots.txt") expect(response.headers.get("x-middleware-request-cookie")).toBe("locale=zh-CN");
    else expect(response.headers.get("x-middleware-next")).toBeNull();
  },
);

it("临时失败的并发受保护请求继续阻挡 downstream 且没有删除指令", async () => {
  authFixture(async adapter => {
    await deleteChunks(adapter);
    return { data: { user: null }, error: new AuthApiError("limited", 429, "over_request_rate_limit") };
  });
  const [page, api] = await Promise.all([proxy(authRequest("/robots.txt")), proxy(authRequest("/api/projects"))]);
  expect(page.status).toBe(200);
  expect(api.status).toBe(401);
  expect(api.headers.get("x-middleware-next")).toBeNull();
  expect(page.headers.getSetCookie()).toEqual([]);
  expect(api.headers.getSetCookie()).toEqual([]);
});
