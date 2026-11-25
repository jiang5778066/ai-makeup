import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuthApiError } from "@supabase/supabase-js";
import type { CookieMethodsServer, SetAllCookies } from "@supabase/ssr";
import { GET } from "@/app/api/account/session/route";
import { POST } from "@/app/api/account/logout/route";
import { getCurrentUser } from "./server";

const { cookies, createServerClient } = vi.hoisted(() => ({
  cookies: vi.fn(),
  createServerClient: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies }));
vi.mock("@supabase/ssr", () => ({ createServerClient }));

const first = "sb-fixture-auth-token.0";
const second = "sb-fixture-auth-token.1";
const replacement = "sb-fixture-auth-token";
const expired = { path: "/", maxAge: 0 };
const fresh = { path: "/", maxAge: 3600 };
const user = { id: "bob" };
const origin = "https://studio.test";

function logoutRequest(expectedAccount: string, requestOrigin = origin) {
  return new Request(origin + "/api/account/logout", {
    method: "POST",
    headers: { Origin: requestOrigin, "X-Expected-Account": expectedAccount },
  });
}

function fixture() {
  const original = [
    { name: first, value: "original-a" }, { name: second, value: "original-b" },
    { name: "locale", value: "zh-CN" },
  ];
  const persist = vi.fn();
  let adapter!: CookieMethodsServer;
  const getUser = vi.fn(async () => ({ data: { user }, error: null }) as { data: { user: { id: string } | null }; error: AuthApiError | null });
  const signOut = vi.fn(async () => ({ error: null }) as { error: AuthApiError | null });
  cookies.mockResolvedValue({ getAll: () => original, set: persist });
  createServerClient.mockImplementation((_url, _key, options) => {
    adapter = options.cookies;
    return { auth: { getUser, signOut } };
  });
  function write(...items: Parameters<SetAllCookies>[0]) {
    return adapter.setAll!(items, {});
  }
  const removeOriginal = () => write(
    { name: first, value: "", options: expired }, { name: second, value: "", options: expired },
  );
  const rotate = () => write(
    { name: first, value: "", options: expired }, { name: second, value: "", options: expired },
    { name: replacement, value: "rotated", options: fresh },
  );
  return { getUser, signOut, persist, removeOriginal, rotate, write, read: () => adapter.getAll() };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:9");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "not-a-key");
});
afterEach(() => vi.unstubAllEnvs());

it.each([429, 503])("临时认证错误 %i 丢弃 SDK 请求删除的多片 Cookie", async status => {
  const env = fixture();
  env.getUser.mockImplementation(async () => {
    await env.removeOriginal();
    return { data: { user: null }, error: new AuthApiError("temporarily unavailable", status, undefined) };
  });
  expect((await GET()).status).toBe(503);
  expect(env.persist).not.toHaveBeenCalled();
});

it("代理放行后读取当前用户时，临时认证错误也不删除 Cookie", async () => {
  const env = fixture();
  env.getUser.mockImplementation(async () => {
    await env.removeOriginal();
    return { data: { user: null }, error: new AuthApiError("limited", 429, "over_request_rate_limit") };
  });
  expect(await getCurrentUser()).toBeNull();
  expect(env.persist).not.toHaveBeenCalled();
});

it("已明确撤销时提交多片删除，SDK 签出前可以读取暂存的完整状态", async () => {
  const env = fixture();
  env.getUser.mockImplementation(async () => {
    await env.removeOriginal();
    expect(await env.read()).toEqual([{ name: "locale", value: "zh-CN" }]);
    expect(env.persist).not.toHaveBeenCalled();
    return { data: { user: null }, error: new AuthApiError("revoked", 403, "session_not_found") };
  });
  expect((await GET()).status).toBe(401);
  expect(env.persist.mock.calls).toEqual([[first, "", expired], [second, "", expired]]);
});

it.each(["temporary", "mismatch", "success"] as const)("先刷新后退出时按最终结果提交 Cookie %s", async result => {
  const env = fixture();
  env.getUser.mockImplementation(async () => {
    await env.rotate();
    return { data: { user }, error: null };
  });
  env.signOut.mockImplementation(async () => {
    expect(await env.read()).toEqual([{ name: "locale", value: "zh-CN" }, { name: replacement, value: "rotated" }]);
    expect(env.persist).not.toHaveBeenCalled();
    await env.write({ name: replacement, value: "", options: expired });
    return { error: result === "temporary" ? new AuthApiError("logout failed", 503, undefined) : null };
  });
  const response = await POST(logoutRequest(result === "mismatch" ? "alice" : "bob"));
  expect(response.status).toBe({ temporary: 503, mismatch: 409, success: 200 }[result]);
  expect(env.signOut).toHaveBeenCalledTimes(result === "mismatch" ? 0 : 1);
  expect(env.persist.mock.calls).toEqual([
    [first, "", expired], [second, "", expired],
    result === "success" ? [replacement, "", expired] : [replacement, "rotated", fresh],
  ]);
});

it("刷新成功后核验接口断开时保留已轮换的 Cookie", async () => {
  const env = fixture();
  env.getUser.mockImplementation(async () => {
    await env.rotate();
    throw new TypeError("offline");
  });
  expect((await GET()).status).toBe(503);
  expect(env.persist.mock.calls).toEqual([[first, "", expired], [second, "", expired], [replacement, "rotated", fresh]]);
});

it("非同源退出不会初始化 Cookie 适配器", async () => {
  const env = fixture();
  expect((await POST(logoutRequest("bob", "https://other.invalid"))).status).toBe(403);
  expect(cookies).not.toHaveBeenCalled();
  expect(env.persist).not.toHaveBeenCalled();
});
