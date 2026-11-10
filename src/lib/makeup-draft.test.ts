import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveMakeupDraft, readMakeupDraft, consumeMakeupDraft, type MakeupDraft } from "./makeup-draft";

// 该替身只实现 IndexedDB 事件/事务边界；测试调用真实适配器，照片为明确的合成数据。
function databaseFixture() {
  const data = new Map<string, unknown>();
  let fail = false;
  let failOpen = false;
  const close = vi.fn();
  const database = {
    objectStoreNames: { contains: () => true }, close,
    transaction: vi.fn(() => {
      const tx = { error: new Error("transaction failure"), oncomplete: null as (() => void) | null, onerror: null as (() => void) | null, onabort: null as (() => void) | null,
        objectStore: () => ({
          get(key: string) { const request = { result: undefined as unknown, onsuccess: null as (() => void) | null, onerror: null as (() => void) | null }; queueMicrotask(() => { request.result = data.get(key); request.onsuccess?.(); }); return request; },
          put(value: unknown, key: string) { if (!fail) data.set(key, value); },
          delete(key: string) { if (!fail) data.delete(key); }
        }) };
      setTimeout(() => { if (fail) tx.onabort?.(); else tx.oncomplete?.(); }, 0);
      return tx;
    })
  };
  vi.stubGlobal("indexedDB", { open: vi.fn(() => {
    const request = { result: database, error: new Error("open failure"), onsuccess: null as (() => void) | null, onerror: null as (() => void) | null };
    queueMicrotask(() => { if (failOpen) request.onerror?.(); else request.onsuccess?.(); }); return request;
  }) });
  return { data, close, abort: () => { fail = true; }, failOpen: () => { failOpen = true; } };
}
const photo = () => new Blob(["isolated synthetic photo"], { type: "image/png" });
const draft = (): Extract<MakeupDraft, { tool: "full_face" }> => ({ version: 1, id: "draft-1", tool: "full_face", path: "/zh-CN/ai-makeup#try", at: Date.now(), source: photo(), styleId: "natural", intensity: 70 });
let db: ReturnType<typeof databaseFixture>;
beforeEach(() => { db = databaseFixture(); });
afterEach(() => { vi.unstubAllGlobals(); });
describe("共用草稿 IndexedDB 适配器", () => {
  it("跨标签读取不消费；按工具/路径隔离；恢复后才显式消费", async () => {
    const original = draft(); await saveMakeupDraft(original);
    expect((await readMakeupDraft(original.tool, original.path)).kind).toBe("ready");
    expect((await readMakeupDraft(original.tool, original.path)).kind).toBe("ready");
    expect((await readMakeupDraft("virtual_try_on", original.path)).kind).toBe("none");
    expect((await readMakeupDraft(original.tool, "/ai-makeup#try")).kind).toBe("none");
    await consumeMakeupDraft(original); expect((await readMakeupDraft(original.tool, original.path)).kind).toBe("none");
    expect(db.close).toHaveBeenCalled();
  });
  it("30分钟过期有明确结果；损坏类型拒绝保存", async () => {
    const original = { ...draft(), at: Date.now() - 1800001 }; await saveMakeupDraft(original);
    expect((await readMakeupDraft(original.tool, original.path)).kind).toBe("expired");
    await expect(saveMakeupDraft({ ...draft(), source: new Blob(["bad"], { type: "image/gif" }) })).rejects.toThrow();
    await expect(saveMakeupDraft({ ...draft(), intensity: NaN })).rejects.toThrow();
  });
  it("旧实时草稿兼容读取，不让全脸工具消费", async () => {
    db.data.set("pending", { source: photo(), config: { lipstick: { enabled: true, presetId: "rosewood", color: "#9d4b55", intensity: 77 } }, at: Date.now() });
    expect((await readMakeupDraft("full_face", "/ai-makeup#try")).kind).toBe("none");
    const restored = await readMakeupDraft("virtual_try_on", "/ai-lipstick-try-on#try");
    expect(restored.kind).toBe("ready"); expect(db.data.has("pending")).toBe(true);
    if (restored.kind === "ready") await consumeMakeupDraft(restored.draft);
    expect(db.data.has("pending")).toBe(false);
  });
  it("重复恢复的旧消费不会删除新草稿", async () => {
    const original = draft(); await saveMakeupDraft(original);
    await saveMakeupDraft({ ...original, id: "draft-2" });
    await consumeMakeupDraft(original);
    const read = await readMakeupDraft(original.tool, original.path);
    expect(read.kind === "ready" && read.draft.id).toBe("draft-2");
  });
  it("不可用、打开失败、事务中止和删除失败均传播错误", async () => {
    const original = draft(); await saveMakeupDraft(original); db.abort();
    await expect(consumeMakeupDraft(original)).rejects.toThrow(); expect(db.data.size).toBe(1);
    await expect(saveMakeupDraft(original)).rejects.toThrow();
    db = databaseFixture(); db.failOpen(); await expect(readMakeupDraft(original.tool, original.path)).rejects.toThrow();
    vi.stubGlobal("indexedDB", undefined); await expect(saveMakeupDraft(original)).rejects.toThrow();
  });
});
