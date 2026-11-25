import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuthApiError, AuthSessionMissingError } from "@supabase/supabase-js";
import { POST } from "./route";

const { getClient, getUser, signOut } = vi.hoisted(() => ({
  getClient: vi.fn(), getUser: vi.fn(), signOut: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAccountClient: async () => ({ client: await getClient(), commitCookies: vi.fn() }),
}));

const origin = "https://studio.test";
function logoutRequest(expectedAccount?: string, requestOrigin = origin, fetchSite = "same-origin") {
  const headers = new Headers({ origin: requestOrigin, "sec-fetch-site": fetchSite });
  if (expectedAccount !== undefined) headers.set("X-Expected-Account", expectedAccount);
  return new Request(origin + "/api/account/logout", { method: "POST", headers });
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:9");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "not-a-key");
  getUser.mockReset().mockResolvedValue({ data: { user: { id: "alice" } }, error: null });
  signOut.mockReset().mockResolvedValue({ error: null });
  getClient.mockReset().mockResolvedValue({ auth: { getUser, signOut } });
});
afterEach(() => vi.unstubAllEnvs());

it("同源发起账号匹配时，一个服务端客户端完成查验与本会话退出", async () => {
  const unrelatedSignOut = vi.fn();
  getClient.mockResolvedValueOnce({ auth: { getUser, signOut } })
    .mockResolvedValue({ auth: { signOut: unrelatedSignOut } });
  const response = await POST(logoutRequest("alice"));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ signedOut: true });
  expect(getClient).toHaveBeenCalledTimes(1);
  expect(getUser).toHaveBeenCalledExactlyOnceWith();
  expect(signOut).toHaveBeenCalledExactlyOnceWith({ scope: "local" });
  expect(getUser.mock.invocationCallOrder[0]).toBeLessThan(signOut.mock.invocationCallOrder[0]);
  expect(unrelatedSignOut).not.toHaveBeenCalled();
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.headers.get("vary")).toBe("Cookie");
});

it.each([
  [undefined, origin, "same-origin", 400, "logout_account_required"],
  ["  ", origin, "same-origin", 400, "logout_account_required"],
  ["alice", "https://evil.test", "cross-site", 403, "origin_rejected"],
  ["alice", origin, "same-site", 403, "origin_rejected"],
] as const)("拒绝无账号和非同源请求 %#，无需开启会话客户端", async (expected, requestOrigin, fetchSite, status, code) => {
  const response = await POST(logoutRequest(expected, requestOrigin, fetchSite));
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({ code });
  expect(getClient).not.toHaveBeenCalled();
  expect(signOut).not.toHaveBeenCalled();
});

it("预期账号与已查验的当前会话不匹配时返回通用 409", async () => {
  getUser.mockResolvedValue({ data: { user: { id: "bob" } }, error: null });
  const response = await POST(logoutRequest("alice"));
  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({ code: "logout_account_mismatch" });
  expect(signOut).not.toHaveBeenCalled();
  expect(response.headers.get("cache-control")).toContain("no-store");
});

it.each([
  [null, 401, "unauthorized"],
  [new AuthSessionMissingError(), 401, "unauthorized"],
  [{ status: 401 }, 401, "unauthorized"],
  [new AuthApiError("expired", 403, "session_expired"), 401, "unauthorized"],
  [{ status: 429 }, 503, "account_unavailable"],
  [{ status: 503 }, 503, "account_unavailable"],
] as const)("查验返回空用户时区分失效会话和服务故障 %#", async (error, status, code) => {
  getUser.mockResolvedValue({ data: { user: null }, error });
  const response = await POST(logoutRequest("alice"));
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({ code });
  expect(signOut).not.toHaveBeenCalled();
  expect(response.headers.get("cache-control")).toMatch(/private.*no-store/);
  expect(response.headers.get("vary")).toBe("Cookie");
});

it("认证传输抛错返回私有 503，保留退出动作", async () => {
  getUser.mockRejectedValue(new TypeError("network"));
  const response = await POST(logoutRequest("alice"));
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ code: "account_unavailable" });
  expect(response.headers.get("cache-control")).toMatch(/private.*no-store/);
  expect(response.headers.get("vary")).toBe("Cookie");
  expect(signOut).not.toHaveBeenCalled();
});

it("已查验的会话退出失败时返回 503", async () => {
  signOut.mockResolvedValue({ error: { status: 503 } });
  const response = await POST(logoutRequest("alice"));
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ code: "logout_failed" });
});
