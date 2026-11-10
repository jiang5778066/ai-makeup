import { StrictMode, type ReactNode } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveGenerationSession, readGenerationSession, type GenerationSession } from "@/lib/generation-session";
import { useGenerationStatus } from "./use-generation-status";
const session: GenerationSession = { version: 1, generationId: "task-fixture", tool: "full_face", path: "/ai-makeup#try", createdAt: Date.now(), style: { id: "natural", name: "Natural", description: "Generic" } };
const payload = (status = "running") => ({ id: session.generationId, status, resultUrl: status === "done" ? "/fixture.png" : null, beforeUrl: null, fitNotes: [], styleName: "Natural", error: null });
function response(status = 200, state = "running", retry?: string) { return { ok: status === 200, status, headers: new Headers(retry ? { "Retry-After": retry } : {}), json: async () => payload(state) } as Response; }
async function advance(ms = 2000) { await act(async () => {}); await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); }
function mount() { return renderHook(() => useGenerationStatus("full_face", session.path)); }
beforeEach(() => { vi.useFakeTimers(); localStorage.clear(); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response())); saveGenerationSession({ ...session, createdAt: Date.now() }); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe("共用任务查询状态机（受控响应）", () => {
  it("严格模式恢复只调用 GET，慢响应不重叠，卸载取消", async () => {
    let signal: AbortSignal | undefined;
    vi.mocked(fetch).mockImplementation((_url, init) => { signal = init?.signal as AbortSignal; return new Promise(() => {}); });
    const { unmount } = renderHook(() => useGenerationStatus("full_face", session.path), { wrapper: ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode> });
    await advance(8000);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/generations/task-fixture");
    expect(vi.mocked(fetch).mock.calls[0][1]?.method).toBe("GET");
    unmount(); expect(signal?.aborted).toBe(true);
    await advance(30000); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("连续三次网络错误暂停，续查保留 id", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    const { result } = mount(); await advance(6000);
    expect(result.current.phase).toBe("paused"); expect(fetch).toHaveBeenCalledTimes(3);
    vi.mocked(fetch).mockResolvedValue(response(200, "done"));
    act(() => { result.current.resume(); }); await advance();
    expect(result.current.phase).toBe("done");
    expect(vi.mocked(fetch).mock.calls.every(([url]) => url === "/api/generations/task-fixture")).toBe(true);
  });
  it.each(["done", "failed", "refunded"])("服务端终态 %s 停止查询", async (state) => {
    vi.mocked(fetch).mockResolvedValue(response(200, state));
    const { result } = mount(); await advance(10000);
    expect(result.current.phase).toBe(state); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("401保留记录要求登录，404清除无效记录", async () => {
    vi.mocked(fetch).mockResolvedValue(response(401)); const first = mount(); await advance();
    expect(first.result.current.phase).toBe("auth"); expect(readGenerationSession("full_face", session.path)).not.toBeNull(); first.unmount();
    vi.mocked(fetch).mockResolvedValue(response(404)); const second = mount(); await advance();
    expect(second.result.current.phase).toBe("not_found"); expect(readGenerationSession("full_face", session.path)).toBeNull();
  });
  it("429按Retry-After秒数等待", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response(429, "running", "12")).mockResolvedValue(response(200, "done"));
    const { result } = mount(); await advance(2000); await advance(11999);
    expect(fetch).toHaveBeenCalledTimes(1); await advance(1); expect(result.current.phase).toBe("done");
  });
  it("429按Retry-After的HTTP日期等待", async () => {
    vi.setSystemTime(new Date("2026-11-03T10:00:00Z"));
    saveGenerationSession({ ...session, createdAt: Date.now() });
    vi.mocked(fetch).mockResolvedValueOnce(response(429, "running", "Tue, 03 Nov 2026 10:00:14 GMT")).mockResolvedValue(response(200, "done"));
    const { result } = mount(); await advance(2000); await advance(11999);
    expect(fetch).toHaveBeenCalledTimes(1); await advance(1);
    expect(result.current.phase).toBe("done"); expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("连续429的无效或过期Retry-After依次退避5、10、20秒", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response(429, "running", "invalid"))
      .mockResolvedValueOnce(response(429, "running", "0"))
      .mockResolvedValueOnce(response(429, "running", "Tue, 01 Jan 2019 00:00:00 GMT"))
      .mockResolvedValue(response(200, "done"));
    const { result } = mount(); await advance(2000);
    for (const [index, delay] of [5000, 10000, 20000].entries()) {
      await advance(delay - 1); expect(fetch).toHaveBeenCalledTimes(index + 1);
      await advance(1); expect(fetch).toHaveBeenCalledTimes(index + 2);
    }
    expect(result.current.phase).toBe("done");
    expect(vi.mocked(fetch).mock.calls.every(([url, init]) => url === "/api/generations/task-fixture" && init?.method === "GET")).toBe(true);
  });
  it("单次请求超时被取消，三次超时后暂停", async () => {
    const signals: AbortSignal[] = [];
    vi.mocked(fetch).mockImplementation((_url, init) => { signals.push(init?.signal as AbortSignal); return new Promise(() => {}); });
    const { result } = mount(); await advance(60000);
    expect(result.current.phase).toBe("paused"); expect(signals).toHaveLength(3); expect(signals.every((signal) => signal.aborted)).toBe(true);
  });
  it("等待十分钟后暂停；续查开始新的等待窗口", async () => {
    const { result } = mount(); await advance(602000); expect(result.current.phase).toBe("paused");
    const before = vi.mocked(fetch).mock.calls.length; await advance(20000); expect(fetch).toHaveBeenCalledTimes(before);
    act(() => { result.current.resume(); }); await advance(2000); expect(result.current.phase).toBe("querying");
  });
  it("保存新 id 失败时保留内存身份并暂停，不触发查询或POST", async () => {
    localStorage.clear(); const { result } = mount(); await advance();
    const fail = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    act(() => { result.current.start(session); }); await advance();
    expect(result.current.phase).toBe("paused"); expect(result.current.session?.generationId).toBe(session.generationId); expect(fetch).not.toHaveBeenCalled();
    fail.mockRestore(); act(() => { result.current.resume(); }); await advance(); expect(fetch).toHaveBeenCalledTimes(1);
  });
});
