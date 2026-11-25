import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuthApiError, AuthRetryableFetchError, AuthSessionMissingError } from "@supabase/supabase-js";
import { GET } from "./route";

const { getClient, getUser } = vi.hoisted(() => ({ getClient: vi.fn(), getUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAccountClient: async () => ({ client: await getClient(), commitCookies: vi.fn() }),
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:9");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "not-a-key");
  getUser.mockReset();
  getClient.mockReset().mockResolvedValue({ auth: { getUser } });
});
afterEach(() => vi.unstubAllEnvs());

function expectPrivate(response: Response) {
  expect(response.headers.get("cache-control")).toMatch(/private.*no-store/);
  expect(response.headers.get("vary")).toBe("Cookie");
}

it("单次会话核验只返回本人 id 与 email", async () => {
  getUser.mockResolvedValue({ data: { user: { id: "alice", email: "alice@test.invalid", metadata: { private: true } } }, error: null });
  const response = await GET();
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ user: { id: "alice", email: "alice@test.invalid" } });
  expect(getClient).toHaveBeenCalledTimes(1);
  expect(getUser).toHaveBeenCalledTimes(1);
  expectPrivate(response);
});

it.each([
  [null, 401],
  [new AuthSessionMissingError(), 401],
  [new AuthApiError("expired", 403, "session_expired"), 401],
  [new AuthApiError("expired JWT", 403, "bad_jwt"), 401],
  [new AuthApiError("invalid refresh", 400, "refresh_token_not_found"), 401],
  [new AuthApiError("unauthorized", 401, undefined), 401],
  [new AuthApiError("forbidden", 403, undefined), 503],
  [new AuthApiError("limited", 429, undefined), 503],
  [new AuthRetryableFetchError("offline", 0), 503],
  [new AuthRetryableFetchError("unavailable", 503), 503],
] as const)("按认证结果映射会话状态 %#", async (error, status) => {
  getUser.mockResolvedValue({ data: { user: null }, error });
  const response = await GET();
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({ code: status === 401 ? "unauthorized" : "account_unavailable" });
  expectPrivate(response);
});

it.each([[new TypeError("network"), 503], [new AuthSessionMissingError(), 401]] as const)(
  "抛出的认证错误沿用相同映射 %#", async (error, status) => {
    getUser.mockRejectedValue(error);
    const response = await GET();
    expect(response.status).toBe(status);
    expectPrivate(response);
  },
);

it("缺少配置时以 503 响应且不创建客户端", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
  const response = await GET();
  expect(response.status).toBe(503);
  expectPrivate(response);
  expect(getClient).not.toHaveBeenCalled();
});
