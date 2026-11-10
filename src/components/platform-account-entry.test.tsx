import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PlatformAccountEntry } from "./platform-account-entry";
import { refreshPlatformAccount } from "@/lib/platform-account-session";
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
  expect(screen.getByRole("alert")).toHaveTextContent("退出失败"); expect(navigate).not.toHaveBeenCalled();
  status = 200; await act(async () => { fireEvent.click(screen.getByRole("button", { name: "重试退出" })); });
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/zh-CN/home"); expect(fetcher.mock.calls.filter(call => call[0] === "/api/account/logout")).toHaveLength(2);
});
it("退出超时后不导航，错误可重试且保留未知服务端结果", async () => {
  let settle!: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn((url: string) => url === "/api/account/logout" ? new Promise<Response>(resolve => { settle = resolve; }) : Promise.resolve(json({ user: { id: "alice" } }))));
  render(<PlatformAccountEntry locale="en" returnPath="/my-creations"/>); await act(() => vi.advanceTimersByTimeAsync(1));
  fireEvent.click(screen.getByRole("button", { name: "Sign out" })); await act(() => vi.advanceTimersByTimeAsync(15001));
  expect(screen.getByRole("alert")).toHaveTextContent("Sign out failed"); await act(async () => { settle(json({})); }); expect(navigate).not.toHaveBeenCalled();
});

it("访客中文按积分说明且英文本意与完整安全next不变", async () => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(json({}, 401))));
  const path = "/zh-CN/my-creations?tag=a&tag=b#作品";
  const expectedNext = "/zh-CN/my-creations?tag=a&tag=b#%E4%BD%9C%E5%93%81";
  const view = render(<PlatformAccountEntry locale="zh-CN" returnPath={path}/>);
  await act(async () => { await refreshPlatformAccount(); });
  expect(screen.getByRole("link", { name: "登录即可获得3积分" })).toHaveAttribute("href", `/login?next=${encodeURIComponent(expectedNext)}`);
  view.rerender(<PlatformAccountEntry locale="en" returnPath={path}/>);
  expect(screen.getByRole("link", { name: "Login to get 3 credits" })).toHaveAttribute("href", `/login?next=${encodeURIComponent(expectedNext)}`);
});
