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

it("移除和下载各自记录结果，列表成功重试只清除列表错误", async () => {
  const completed = {
    ...task,
    status: "done",
    removable: true,
    result: { url: "/fixture.png", mimeType: "image/png", expiresAt: null },
  };
  const other = { ...completed, id: "makeup:other" };
  const fetcher = vi.fn()
    .mockResolvedValueOnce(json({ items: [completed, other], nextCursor: null }))
    .mockResolvedValueOnce(json({}, 503))
    .mockResolvedValueOnce(json(completed))
    .mockResolvedValueOnce(json({}, 503))
    .mockResolvedValueOnce(json({}, 503))
    .mockResolvedValueOnce(json({ removed: true }))
    .mockResolvedValueOnce(json({ items: [completed], nextCursor: null }));
  vi.stubGlobal("fetch", fetcher);
  const { result } = renderHook(() => usePlatformCreations("all"));
  await act(() => vi.advanceTimersByTimeAsync(1));
  await act(() => result.current.load());
  await act(() => result.current.download(task.id));
  await act(() => result.current.remove(other.id));
  expect(result.current.listError).toBe(true);
  expect(result.current.operationErrors).toMatchObject({ [task.id]: { download: true }, [other.id]: { remove: true } });
  expect(result.current.items).toHaveLength(2);

  await act(() => result.current.remove(other.id));
  expect(result.current.listError).toBe(true);
  expect(result.current.operationErrors[other.id]?.remove).toBeFalsy();
  expect(result.current.operationErrors[task.id]?.download).toBe(true);
  expect(result.current.operationNotice).toBe("removed");
  expect(result.current.items.map(item => item.id)).toEqual([task.id]);
  await act(() => result.current.load());
  expect(result.current.listError).toBe(false);
  expect(result.current.operationErrors[task.id]?.download).toBe(true);
  expect(result.current.operationNotice).toBe("removed");
  expect(fetcher).toHaveBeenNthCalledWith(4, "/fixture.png", expect.objectContaining({ credentials: "omit" }));
});

it("同一条作品连续刷新时，旧请求的迟到失败不覆盖新结果", async () => {
  const completed = { ...task, status: "done" };
  const updated = { ...completed, title: "已刷新作品" };
  let resolveOld!: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(json({ items: [completed], nextCursor: null }))
    .mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
    .mockResolvedValueOnce(json(updated)));
  const { result } = renderHook(() => usePlatformCreations("all"));
  await act(() => vi.advanceTimersByTimeAsync(1));
  let oldRefresh!: Promise<void>;
  act(() => { oldRefresh = result.current.refresh(task.id); });
  await act(() => result.current.refresh(task.id));
  await act(async () => { resolveOld(json({}, 503)); await oldRefresh; });
  expect(result.current.items[0].title).toBe(updated.title);
  expect(result.current.operationErrors[task.id]?.refresh).toBeFalsy();
});
