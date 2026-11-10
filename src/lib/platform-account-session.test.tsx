import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { logoutPlatformAccount, refreshPlatformAccount, usePlatformAccount } from "./platform-account-session";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("退出立即清私有身份，下一用户核验期间不保留旧账户；旧会话响应无法覆盖", async () => {
  let user = "alice"; let settle!: (r: Response) => void; let pending = false;
  const fetcher = vi.fn().mockImplementation(async (url: string) => { if (url.endsWith("logout")) { user = "bob"; return new Response('{}'); } if (pending) return new Promise(r => { settle = r; }); return new Response(JSON.stringify({ user: { id: user, email: `${user}@test.invalid` } })); });
  vi.stubGlobal("fetch", fetcher); vi.stubGlobal("BroadcastChannel", undefined);
  const { result } = renderHook(() => usePlatformAccount()); await waitFor(() => expect(result.current.user?.id).toBe("alice"));
  await act(async () => { await logoutPlatformAccount(); }); expect(result.current.user).toBeNull(); expect(result.current.status).toBe("signed_out");
  pending = true; let old!: Promise<void>; act(() => { old = refreshPlatformAccount(); }); expect(result.current.user).toBeNull(); pending = false; await act(async () => { await refreshPlatformAccount(); }); expect(result.current.user?.id).toBe("bob");
  await act(async () => { settle(new Response(JSON.stringify({ user: { id: "alice", email: "alice@test.invalid" } }))); await old; }); expect(result.current.user?.id).toBe("bob"); expect(fetcher.mock.calls.find(call => call[0].endsWith("logout"))?.[1].method).toBe("POST");
});
