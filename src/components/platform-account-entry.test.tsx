import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PlatformAccountEntry } from "./platform-account-entry";
import { refreshPlatformAccount } from "@/lib/platform-account-session";
import { browserMediaRecoveryStorage, mediaRecoveryKey, readMediaRecoveryRecord } from "@/lib/media-recovery-storage";
vi.mock("./platform-navigation-link", () => ({ PlatformNavigationLink: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a> }));
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const navigate = vi.fn();
beforeEach(() => {
  vi.useFakeTimers(); vi.stubGlobal("BroadcastChannel", undefined);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ""); vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  const browserWindow = Object.create(window);
  Object.defineProperty(browserWindow, "location", { value: { assign: navigate } });
  vi.stubGlobal("window", browserWindow); navigate.mockReset();
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
for (const status of [200, 503]) it(`旧退出${status}不能导航已核验新账户，也不显示其失败`, async () => {
  let user = "alice"; let settle!: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn((url: string) => url === "/api/account/logout" ? new Promise<Response>(resolve => { settle = resolve; }) : Promise.resolve(json({ user: { id: user } }))));
  render(<PlatformAccountEntry locale="zh-CN" returnPath="/zh-CN/my-creations"/>);
  await act(() => vi.advanceTimersByTimeAsync(1)); fireEvent.click(screen.getByRole("button", { name: "退出" }));
  user = "bob"; await act(async () => { await refreshPlatformAccount(); });
  await act(async () => { settle(json({}, status)); });
  expect(navigate).not.toHaveBeenCalled(); expect(screen.queryByRole("alert")).toBeNull(); expect(screen.getByRole("button", { name: "退出" })).toBeEnabled();
});
it("卸载取消退出，晚成功不导航", async () => {
  let settle!: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn((url: string) => url === "/api/account/logout" ? new Promise<Response>(resolve => { settle = resolve; }) : Promise.resolve(json({ user: { id: "alice" } }))));
  const view = render(<PlatformAccountEntry locale="en" returnPath="/my-creations"/>);
  await act(() => vi.advanceTimersByTimeAsync(1)); fireEvent.click(screen.getByRole("button", { name: "Sign out" })); view.unmount();
  await act(async () => { settle(json({})); }); expect(navigate).not.toHaveBeenCalled();
});
it("当前失败可见且可重试；当前成功才导航安全本站路径", async () => {
  let status = 503;
  const fetcher = vi.fn((url: string) => Promise.resolve(url === "/api/account/logout" ? json({}, status) : json({ user: { id: "alice" } })));
  vi.stubGlobal("fetch", fetcher); render(<PlatformAccountEntry locale="zh-CN" returnPath="/zh-CN/my-creations"/>);
  await act(() => vi.advanceTimersByTimeAsync(1)); await act(async () => { fireEvent.click(screen.getByRole("button", { name: "退出" })); });
  expect(screen.queryByRole("button", { name: "重试退出" })).toBeNull();
  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(screen.getByRole("alert")).toHaveTextContent("退出失败"); expect(navigate).not.toHaveBeenCalled();
  status = 200; await act(async () => { fireEvent.click(screen.getByRole("button", { name: "重试退出" })); });
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/zh-CN/home"); expect(fetcher.mock.calls.filter(call => call[0] === "/api/account/logout")).toHaveLength(2);
});
it("退出超时后核验同账号才允许重试，晚到成功不导航", async () => {
  let settle!: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn((url: string) => url === "/api/account/logout" ? new Promise<Response>(resolve => { settle = resolve; }) : Promise.resolve(json({ user: { id: "alice" } }))));
  render(<PlatformAccountEntry locale="en" returnPath="/my-creations"/>); await act(() => vi.advanceTimersByTimeAsync(1));
  fireEvent.click(screen.getByRole("button", { name: "Sign out" })); await act(() => vi.advanceTimersByTimeAsync(15001));
  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(screen.getByRole("alert")).toHaveTextContent("Sign out failed"); await act(async () => { settle(json({})); }); expect(navigate).not.toHaveBeenCalled();
});

it.each(["同账号", "核验503", "换号", "会话401"] as const)("退出断网后检查 %s，旧事件不能跳过核验", async outcome => {
  let session: Response | undefined = json({ user: { id: "alice" } });
  let finishCheck!: (response: Response) => void;
  const postedOwners: string[] = [];
  let serverOwner = "alice";
  const fetcher = vi.fn(async (url: string) => {
    if (url.endsWith("/session")) {
      if (session) return session.clone();
      return new Promise<Response>(resolve => { finishCheck = resolve; });
    }
    postedOwners.push(serverOwner);
    if (postedOwners.length === 1) throw new TypeError("替身断网");
    return json({ signedOut: true });
  });
  vi.stubGlobal("fetch", fetcher);
  render(<PlatformAccountEntry locale="en" returnPath="/my-creations"/>);
  await act(() => vi.advanceTimersByTimeAsync(1));
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Sign out" })); });
  await act(() => vi.advanceTimersByTimeAsync(1));
  const oldRetry = screen.getByRole("button", { name: "Retry sign out" });
  session = undefined;
  let checking!: Promise<void>;
  act(() => {
    checking = refreshPlatformAccount();
    fireEvent.click(oldRetry);
  });
  expect(postedOwners).toEqual(["alice"]);
  expect(screen.queryByRole("button", { name: "Retry sign out" })).toBeNull();
  serverOwner = outcome === "换号" ? "bob" : "alice";
  await act(async () => {
    const status = outcome === "会话401" ? 401 : outcome === "核验503" ? 503 : 200;
    finishCheck(json({ user: { id: serverOwner } }, status));
    await checking;
  });
  if (outcome === "会话401") {
    expect(screen.queryByRole("alert")).toBeNull();
    session = json({ user: { id: "alice" } });
    await act(refreshPlatformAccount);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(postedOwners).toEqual(["alice"]);
    return;
  }
  if (outcome === "核验503") {
    expect(screen.queryByRole("alert")).toBeNull();
    session = json({ user: { id: "alice" } });
    await act(refreshPlatformAccount);
  }
  if (outcome === "换号") {
    expect(screen.queryByRole("alert")).toBeNull();
    session = json({ user: { id: "alice" } });
    await act(refreshPlatformAccount);
    expect(screen.queryByRole("alert")).toBeNull();
    session = json({ user: { id: "bob" } });
    await act(refreshPlatformAccount);
  }
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: outcome === "换号" ? "Sign out" : "Retry sign out" }));
  });
  expect(postedOwners).toEqual(["alice", serverOwner]);
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/home");
});

it("两个账号入口共存时，只有发起入口显示失败且同时退出只发一条请求", async () => {
  let finish!: (response: Response) => void;
  const fetcher = vi.fn(async (url: string) => url.endsWith("/session")
    ? json({ user: { id: "alice" } })
    : new Promise<Response>(resolve => { finish = resolve; })
  );
  vi.stubGlobal("fetch", fetcher);
  render(<>
    <div aria-label="入口甲" role="region"><PlatformAccountEntry locale="en" returnPath="/home"/></div>
    <div aria-label="入口乙" role="region"><PlatformAccountEntry locale="zh-CN" returnPath="/zh-CN/home"/></div>
  </>);
  await act(() => vi.advanceTimersByTimeAsync(1));
  const first = within(screen.getByRole("region", { name: "入口甲" }));
  const second = within(screen.getByRole("region", { name: "入口乙" }));
  const firstExit = first.getByRole("button", { name: "Sign out" });
  const secondExit = second.getByRole("button", { name: "退出" });
  act(() => { fireEvent.click(firstExit); fireEvent.click(secondExit); });
  expect(fetcher.mock.calls.filter(([url]) => url.endsWith("/logout"))).toHaveLength(1);
  await act(async () => { finish(new Response(null, { status: 503 })); });
  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(first.getByRole("button", { name: "Retry sign out" })).toBeEnabled();
  expect(second.queryByRole("alert")).toBeNull();
  fireEvent.click(second.getByRole("button", { name: "退出" }));
  await act(async () => { finish(new Response(null, { status: 401 })); });
  expect(first.queryByRole("alert")).toBeNull();
  expect(fetcher.mock.calls.filter(([url]) => url.endsWith("/logout"))).toHaveLength(2);
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/zh-CN/home");
});

it("重试收到账号不匹配时重新核验，移除旧提示及恢复记录且不广播退出", async () => {
  let owner = "alice";
  let status = 503;
  const postMessage = vi.fn();
  vi.stubGlobal("BroadcastChannel", class { postMessage = postMessage; close() {} });
  const fetcher = vi.fn(async (url: string, init?: RequestInit) => url.endsWith("/session")
    ? json({ user: { id: owner } })
    : json({}, status));
  vi.stubGlobal("fetch", fetcher);
  browserMediaRecoveryStorage.setItem(mediaRecoveryKey, JSON.stringify({
    version: 1, userId: owner, taskId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", savedAt: Date.now(),
  }));
  try {
    render(<PlatformAccountEntry locale="en" returnPath="/my-creations"/>);
    await act(() => vi.advanceTimersByTimeAsync(1));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Sign out" })); });
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(readMediaRecoveryRecord(browserMediaRecoveryStorage)?.userId).toBe("alice");
    owner = "bob";
    status = 409;
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Retry sign out" })); });
    expect(readMediaRecoveryRecord(browserMediaRecoveryStorage)?.userId).toBe("alice");
    expect(screen.queryByRole("button", { name: "Retry sign out" })).toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
    expect(readMediaRecoveryRecord(browserMediaRecoveryStorage)).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
    expect(postMessage).not.toHaveBeenCalled();

    owner = "alice";
    await act(refreshPlatformAccount);
    expect(screen.queryByRole("alert")).toBeNull();
    owner = "bob";
    await act(refreshPlatformAccount);
    status = 200;
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Sign out" })); });
    const posts = fetcher.mock.calls.filter(([url]) => url.endsWith("/logout"));
    expect(posts.map(([, init]) => new Headers(init?.headers).get("X-Expected-Account")))
      .toEqual(["alice", "alice", "bob"]);
    expect(postMessage).toHaveBeenCalledExactlyOnceWith({ type: "signed_out" });
    expect(navigate).toHaveBeenCalledExactlyOnceWith("/home");
  } finally {
    browserMediaRecoveryStorage.removeItem(mediaRecoveryKey);
  }
});

it("访客双语登录入口保留完整安全next且不承诺未开放生成", async () => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(json({}, 401))));
  const path = "/zh-CN/my-creations?tag=a&tag=b#作品";
  const expectedNext = "/zh-CN/my-creations?tag=a&tag=b#%E4%BD%9C%E5%93%81";
  const view = render(<PlatformAccountEntry locale="zh-CN" returnPath={path}/>);
  await act(async () => { await refreshPlatformAccount(); });
  expect(screen.getByRole("link", { name: "登录" })).toHaveAttribute("href", `/login?next=${encodeURIComponent(expectedNext)}`);
  view.rerender(<PlatformAccountEntry locale="en" returnPath={path}/>);
  expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", `/login?next=${encodeURIComponent(expectedNext)}`);
});
