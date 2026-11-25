import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { BroadcastChannel as NativeBroadcastChannel } from "node:worker_threads";
import { afterEach, expect, it, vi } from "vitest";
import { expirePlatformAccount, logoutPlatformAccount, refreshPlatformAccount, usePlatformAccount } from "./platform-account-session";
import { browserMediaRecoveryStorage, mediaRecoveryKey } from "./media-recovery-storage";
const { subscribeAuth } = vi.hoisted(() => ({ subscribeAuth: vi.fn() }));
vi.mock("./supabase/client", () => ({ getSupabaseBrowserClient: () => ({ auth: { onAuthStateChange: subscribeAuth } }) }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it("退出立即清私有身份，下一用户核验期间不保留旧账户；旧会话响应无法覆盖", async () => {
  let user = "alice"; let settle!: (r: Response) => void; let pending = false;
  const fetcher = vi.fn().mockImplementation(async (url: string) => { if (url.endsWith("logout")) { user = "bob"; return new Response('{}'); } if (pending) return new Promise(r => { settle = r; }); return new Response(JSON.stringify({ user: { id: user, email: `${user}@test.invalid` } })); });
  vi.stubGlobal("fetch", fetcher); vi.stubGlobal("BroadcastChannel", undefined);
  const { result } = renderHook(() => usePlatformAccount()); await waitFor(() => expect(result.current.user?.id).toBe("alice"));
  await act(async () => { await logoutPlatformAccount(); }); expect(result.current.user).toBeNull(); expect(result.current.status).toBe("signed_out");
  pending = true; let old!: Promise<void>; act(() => { old = refreshPlatformAccount(); }); expect(result.current.user).toBeNull(); pending = false; await act(async () => { await refreshPlatformAccount(); }); expect(result.current.user?.id).toBe("bob");
  await act(async () => { settle(new Response(JSON.stringify({ user: { id: "alice", email: "alice@test.invalid" } }))); await old; }); expect(result.current.user?.id).toBe("bob"); expect(fetcher.mock.calls.find(call => call[0].endsWith("logout"))?.[1].method).toBe("POST");
});

const accountResponse = (id: string) => Response.json({ user: { id } });
const recovery = (userId = "alice") => JSON.stringify({
  version: 1, userId, savedAt: Date.now(), taskId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
});

it.each([200, 401])("全局退出收到 %s 后清除不可写的标签页恢复记录", async status => {
  vi.stubGlobal("BroadcastChannel", undefined);
  vi.stubGlobal("fetch", vi.fn(async (url: string) =>
    url.endsWith("/logout") ? new Response(null, { status }) : accountResponse("alice")
  ));
  const persisted = recovery();
  sessionStorage.setItem(mediaRecoveryKey, persisted);
  const { result } = renderHook(usePlatformAccount);
  await waitFor(() => expect(result.current.user?.id).toBe("alice"));
  const disabled = vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => {
    throw new DOMException("关闭浏览器存储", "SecurityError");
  });
  try {
    browserMediaRecoveryStorage.setItem(mediaRecoveryKey, recovery());
    expect(browserMediaRecoveryStorage.getItem(mediaRecoveryKey)).not.toBeNull();
    await act(async () => { expect(await logoutPlatformAccount()).toMatchObject({ status: "signed_out" }); });
    expect(browserMediaRecoveryStorage.getItem(mediaRecoveryKey)).toBeNull();
  } finally {
    disabled.mockRestore();
  }
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(persisted);
  await act(refreshPlatformAccount);
  expect(result.current.user?.id).toBe("alice");
  expect(browserMediaRecoveryStorage.getItem(mediaRecoveryKey)).toBeNull();
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBeNull();
});

it("取消退出、退出失败和账户暂时不可用保留原记录，确认切换或 401 后清除", async () => {
  vi.stubGlobal("BroadcastChannel", undefined);
  let account = accountResponse("alice");
  let finishLogout!: (response: Response) => void;
  let cancelTest = true;
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.endsWith("/session")) return account.clone();
    if (cancelTest) return new Promise<Response>(resolve => { finishLogout = resolve; });
    return new Response(null, { status: 503 });
  }));
  const { result } = renderHook(usePlatformAccount);
  await waitFor(() => expect(result.current.user?.id).toBe("alice"));
  const original = recovery();
  browserMediaRecoveryStorage.setItem(mediaRecoveryKey, original);
  const signal = new AbortController();
  await act(async () => {
    const logout = logoutPlatformAccount(signal.signal);
    signal.abort();
    expect(await logout).toEqual({ status: "cancelled" });
    finishLogout(new Response(null, { status: 200 }));
  });
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(original);
  cancelTest = false;
  await act(async () => { await expect(logoutPlatformAccount()).rejects.toThrow("logout_failed"); });
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(original);
  account = new Response(null, { status: 503 });
  await act(refreshPlatformAccount);
  expect(result.current.status).toBe("error");
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(original);
  account = accountResponse("alice");
  await act(refreshPlatformAccount);
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(original);
  account = accountResponse("bob");
  await act(refreshPlatformAccount);
  expect(result.current.user?.id).toBe("bob");
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBeNull();
  browserMediaRecoveryStorage.setItem(mediaRecoveryKey, recovery("bob"));
  account = new Response(null, { status: 401 });
  await act(refreshPlatformAccount);
  expect(result.current.status).toBe("signed_out");
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBeNull();
});

it("跨标签通知触发核验，服务端确认退出后清理并拒绝迟到的会话成功", async () => {
  let incoming: ((event: MessageEvent) => void) | null = null;
  vi.stubGlobal("BroadcastChannel", class {
    set onmessage(listener: (event: MessageEvent) => void) { incoming = listener; }
    close() {}
  });
  const requests: Array<{ signal: AbortSignal | null | undefined; resolve: (response: Response) => void }> = [];
  let hold = false;
  vi.stubGlobal("fetch", vi.fn(async (_url: string, options?: RequestInit) => {
    if (!hold) return accountResponse("alice");
    return new Promise<Response>(resolve => requests.push({ signal: options?.signal, resolve }));
  }));
  const { result } = renderHook(usePlatformAccount);
  await waitFor(() => expect(result.current.user?.id).toBe("alice"));
  const original = recovery();
  browserMediaRecoveryStorage.setItem(mediaRecoveryKey, original);
  hold = true;
  let refreshing!: Promise<void>;
  act(() => { refreshing = refreshPlatformAccount(); });
  expect(result.current.status).toBe("loading");
  expect(result.current.user).toBeNull();
  act(() => {
    expect(incoming).toBeTypeOf("function");
    incoming?.(new MessageEvent("message", { data: "signed_out" }));
  });
  expect(result.current.status).toBe("loading");
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(original);
  expect(requests).toHaveLength(2);
  expect(requests[0].signal?.aborted).toBe(true);
  await act(async () => { requests[1].resolve(new Response(null, { status: 401 })); });
  await act(async () => { requests[0].resolve(accountResponse("alice")); await refreshing; });
  expect(result.current.status).toBe("signed_out");
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBeNull();
  hold = false;
  await act(refreshPlatformAccount);
  expect(result.current.user?.id).toBe("alice");
  expect(browserMediaRecoveryStorage.getItem(mediaRecoveryKey)).toBeNull();
});

it.each(["alice", "bob"])("延迟和重复退出提示按实际会话保留 %s 的任务", async owner => {
  let incoming: ((event: MessageEvent) => void) | null = null;
  vi.stubGlobal("BroadcastChannel", class {
    set onmessage(listener: (event: MessageEvent) => void) { incoming = listener; }
    close() {}
  });
  const requests: Array<(response: Response) => void> = [];
  let hold = false;
  vi.stubGlobal("fetch", vi.fn(async () => {
    if (!hold) return accountResponse(owner);
    return new Promise<Response>(resolve => requests.push(resolve));
  }));
  const { result } = renderHook(usePlatformAccount);
  await waitFor(() => expect(result.current.user?.id).toBe(owner));
  const current = recovery(owner);
  browserMediaRecoveryStorage.setItem(mediaRecoveryKey, current);
  hold = true;
  const deliver = (data: unknown) => act(() => incoming?.(new MessageEvent("message", { data })));
  deliver({ type: "signed_out" });
  deliver("signed_out");
  deliver({ type: "signed_out" });
  expect(result.current.status).toBe("loading");
  expect(result.current.user).toBeNull();
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(current);
  expect(requests).toHaveLength(3);
  await act(async () => { requests[2](accountResponse(owner)); });
  await act(async () => {
    requests[1](new Response(null, { status: 401 }));
    requests[0](accountResponse("old-account"));
  });
  expect(result.current.user?.id).toBe(owner);
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(current);
});

it("退出广播可经原生 BroadcastChannel 传递，新格式可触发旧标签的通用核验", async () => {
  vi.stubGlobal("BroadcastChannel", NativeBroadcastChannel);
  let signedIn = true;
  const fetcher = vi.fn(async (url: string) => {
    if (url.endsWith("/logout")) {
      signedIn = false;
      return new Response(null, { status: 200 });
    }
    return signedIn ? accountResponse("alice") : new Response(null, { status: 401 });
  });
  vi.stubGlobal("fetch", fetcher);
  const sender = new NativeBroadcastChannel("platform-account");
  try {
    const { result } = renderHook(usePlatformAccount);
    await waitFor(() => expect(result.current.user?.id).toBe("alice"));
    browserMediaRecoveryStorage.setItem(mediaRecoveryKey, recovery());
    const sent = vi.fn();
    sender.onmessage = event => sent(event.data);
    await act(logoutPlatformAccount);
    await waitFor(() => expect(sent).toHaveBeenCalledExactlyOnceWith({ type: "signed_out" }));
    expect(result.current.status).toBe("signed_out");
    expect(sessionStorage.getItem(mediaRecoveryKey)).toBeNull();

    signedIn = true;
    await act(refreshPlatformAccount);
    browserMediaRecoveryStorage.setItem(mediaRecoveryKey, recovery());
    signedIn = false;
    sender.postMessage({ type: "signed_out" });
    await waitFor(() => expect(result.current.status).toBe("signed_out"));
    expect(sessionStorage.getItem(mediaRecoveryKey)).toBeNull();
    expect(fetcher.mock.calls.filter(([url]) => url.endsWith("/logout"))).toHaveLength(1);
  } finally {
    sender.close();
  }
});

it.each([200, 401, 503, "网络错误", "取消", "另标签退出"] as const)("主动退出 %s 合并广播、可见性和 auth-state 核验", async outcome => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fixture.invalid");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "fixture");
  let authEvent!: (event: string, session: null) => void;
  subscribeAuth.mockImplementation(listener => {
    authEvent = listener;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  let message!: (event: MessageEvent) => void;
  const transmit = vi.fn();
  vi.stubGlobal("BroadcastChannel", class {
    set onmessage(listener: typeof message) { message = listener; }
    postMessage = transmit;
    close() {}
  });
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  let finish!: (response: Response) => void;
  let fail!: (error: Error) => void;
  let postSignal: AbortSignal | null | undefined;
  let signedIn = true;
  const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
    if (!url.endsWith("/logout")) return signedIn ? accountResponse("alice") : new Response(null, { status: 401 });
    postSignal = init?.signal;
    return new Promise<Response>((resolve, reject) => { finish = resolve; fail = reject; });
  });
  vi.stubGlobal("fetch", fetcher);
  const { result } = renderHook(usePlatformAccount);
  await waitFor(() => expect(result.current.user?.id).toBe("alice"));
  const original = recovery();
  browserMediaRecoveryStorage.setItem(mediaRecoveryKey, original);
  const caller = new AbortController();
  let logout!: ReturnType<typeof logoutPlatformAccount>;
  act(() => { logout = logoutPlatformAccount(caller.signal); });
  const epoch = result.current.epoch;
  act(() => {
    message(new MessageEvent("message", { data: "signed_out" }));
    message(new MessageEvent("message", { data: { type: "signed_out" } }));
    document.dispatchEvent(new Event("visibilitychange"));
    authEvent("SIGNED_OUT", null);
    authEvent("TOKEN_REFRESHED", null);
    expirePlatformAccount(epoch - 1);
    expirePlatformAccount(epoch);
  });
  expect(result.current).toMatchObject({ status: "loading", epoch, user: null });
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(original);
  expect(postSignal?.aborted).toBe(false);
  expect(fetcher.mock.calls.map(([path]) => path)).toEqual(["/api/account/session", "/api/account/logout"]);
  if (outcome === 503 || outcome === "网络错误" || outcome === "取消" || outcome === "另标签退出") {
    await act(async () => {
      if (outcome === "网络错误") fail(new Error("替身断网"));
      else if (outcome === "取消") caller.abort();
      else {
        if (outcome === "另标签退出") signedIn = false;
        finish(new Response(null, { status: 503 }));
      }
      if (outcome === "取消") expect(await logout).toMatchObject({ status: "cancelled" });
      else await expect(logout).rejects.toThrow(outcome === "网络错误" ? "替身断网" : "logout_failed");
    });
    const expectedStatus = signedIn ? "signed_in" : "signed_out";
    await waitFor(() => expect(result.current.status).toBe(expectedStatus));
    if (outcome === "取消") finish(new Response(null, { status: 200 }));
    expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(signedIn ? original : null);
    expect(transmit).not.toHaveBeenCalled();
    expect(fetcher.mock.calls.filter(([path]) => path.endsWith("/session"))).toHaveLength(2);
  } else {
    await act(async () => {
      finish(new Response(null, { status: outcome }));
      expect(await logout).toMatchObject({ status: "signed_out" });
    });
    expect(result.current.status).toBe("signed_out");
    expect(sessionStorage.getItem(mediaRecoveryKey)).toBeNull();
    expect(transmit.mock.calls).toEqual(outcome === 200 ? [[{ type: "signed_out" }]] : []);
    expect(fetcher.mock.calls.filter(([path]) => path.endsWith("/session"))).toHaveLength(1);
  }
});

it("SDK 报告另一账号时由服务端确认，旧退出成功不得覆盖后来的身份", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fixture.invalid");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "fixture");
  vi.stubGlobal("BroadcastChannel", undefined);
  let authEvent!: (event: string, session: { user: { id: string } } | null) => void;
  subscribeAuth.mockImplementation(listener => {
    authEvent = listener;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  let owner = "alice";
  let checks = 0;
  let finish!: (response: Response) => void;
  let signal: AbortSignal | null | undefined;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    if (!url.endsWith("/logout")) { checks++; return accountResponse(owner); }
    signal = init?.signal;
    return new Promise<Response>(resolve => { finish = resolve; });
  }));
  const { result } = renderHook(usePlatformAccount);
  await waitFor(() => expect(result.current.user?.id).toBe("alice"));
  browserMediaRecoveryStorage.setItem(mediaRecoveryKey, recovery("alice"));
  let logout!: ReturnType<typeof logoutPlatformAccount>;
  act(() => { logout = logoutPlatformAccount(); });
  act(() => authEvent("SIGNED_IN", { user: { id: "bob" } }));
  await waitFor(() => expect(checks).toBe(2));
  expect(result.current.status).toBe("loading");
  expect(signal?.aborted).toBe(false);
  owner = "bob";
  act(() => authEvent("SIGNED_IN", { user: { id: "bob" } }));
  await waitFor(() => expect(result.current.user?.id).toBe("bob"));
  expect(signal?.aborted).toBe(true);
  expect(await logout).toEqual({ status: "stale" });
  const newerRecord = recovery("bob");
  browserMediaRecoveryStorage.setItem(mediaRecoveryKey, newerRecord);
  await act(async () => { finish(new Response(null, { status: 200 })); });
  expect(result.current.user?.id).toBe("bob");
  expect(sessionStorage.getItem(mediaRecoveryKey)).toBe(newerRecord);
});
