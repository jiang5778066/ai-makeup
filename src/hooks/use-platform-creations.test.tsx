import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { usePlatformCreations } from "./use-platform-creations";
const { expire } = vi.hoisted(() => ({ expire: vi.fn() }));
vi.mock("@/lib/platform-account-session", async importOriginal => ({ ...await importOriginal<typeof import("@/lib/platform-account-session")>(), expirePlatformAccount: expire }));
const task = { version: 1, id: "makeup:original", kind: "makeup", mediaType: "image", status: "running", title: "妆容", createdAt: "2026-11-09T00:00:00Z", updatedAt: "2026-11-09T00:00:00Z", removable: false, result: null };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
beforeEach(() => { vi.useFakeTimers(); expire.mockReset(); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it("超时暂停后恢复只GET原ID，401停止且清私有状态，404不提交", async () => {
  let detailMode = "timeout";
  const fetcher = vi.fn().mockImplementation((url: string) => {
    if (url.startsWith("/api/creations?")) return Promise.resolve(json({ items: [task], nextCursor: null }));
    return detailMode === "timeout" ? new Promise(() => {}) : Promise.resolve(json({}, Number(detailMode)));
  }); vi.stubGlobal("fetch", fetcher);
  const { result } = renderHook(() => usePlatformCreations("all"));
  await act(() => vi.advanceTimersByTimeAsync(1));
  await act(() => vi.advanceTimersByTimeAsync(100000));
  expect(result.current.notice).toBe("paused"); expect(fetcher.mock.calls.slice(1).every(call => call[0] === "/api/creations/makeup%3Aoriginal" && call[1].method === "GET")).toBe(true);
  detailMode = "404"; act(() => result.current.resume()); await act(() => vi.advanceTimersByTimeAsync(2001)); expect(result.current.notice).toBe("not_found");
  detailMode = "401"; act(() => result.current.resume()); await act(() => vi.advanceTimersByTimeAsync(2001)); expect(expire).toHaveBeenCalledOnce(); const count = fetcher.mock.calls.length; await act(() => vi.advanceTimersByTimeAsync(60000)); expect(fetcher).toHaveBeenCalledTimes(count);
});
it("卸载取消在途；旧移除晚响应不写新实例", async () => {
  let settle!: (r: Response) => void;
  const fetcher = vi.fn().mockImplementation((url: string, options) => options.method === "DELETE" ? new Promise(r => { settle = r; }) : Promise.resolve(json({ items: [task], nextCursor: null }))); vi.stubGlobal("fetch", fetcher);
  const first = renderHook(() => usePlatformCreations("all")); await act(() => vi.advanceTimersByTimeAsync(1)); act(() => { void first.result.current.remove(task.id); });
  const signal = fetcher.mock.calls.at(-1)![1].signal; first.unmount(); expect(signal.aborted).toBe(true);
  const second = renderHook(() => usePlatformCreations("all")); await act(() => vi.advanceTimersByTimeAsync(1)); await act(async () => { settle(json({ removed: true })); }); expect(second.result.current.items).toHaveLength(1);
});
