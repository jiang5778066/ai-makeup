import { beforeEach, describe, expect, it, vi } from "vitest";
import { readGenerationSession, saveGenerationSession, clearGenerationSession, type GenerationSession } from "./generation-session";
const session: GenerationSession = { version: 1, generationId: "fixture-1", tool: "full_face", path: "/zh-CN/ai-makeup#try", createdAt: Date.now(), style: { id: "natural", name: "自然", description: "通用风格" } };
beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
describe("任务恢复记录", () => {
  it("跨标签共享，仅保存任务身份和风格，不保存图片 URL", () => {
    saveGenerationSession({ ...session, resultUrl: "https://signed.test/result" } as GenerationSession);
    expect(readGenerationSession(session.tool, session.path)).toEqual(session);
    expect(Object.values(localStorage).join()).not.toContain("https://signed");
    expect(readGenerationSession("virtual_try_on", session.path)).toBeNull();
    expect(readGenerationSession(session.tool, "/ai-makeup#try")).toBeNull();
  });
  it("每工具路径仅保留一个记录，24小时后清理", () => {
    saveGenerationSession(session); saveGenerationSession({ ...session, generationId: "fixture-2", createdAt: Date.now() - 86400001 });
    expect(readGenerationSession(session.tool, session.path)).toBeNull();
    expect(localStorage.length).toBe(0);
  });
  it("清除旧任务不会删除后来保存的任务", () => {
    saveGenerationSession({ ...session, generationId: "fixture-2" });
    clearGenerationSession(session);
    expect(readGenerationSession(session.tool, session.path)?.generationId).toBe("fixture-2");
  });
  it("存储失败可被调用者发现", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    expect(() => saveGenerationSession(session)).toThrow();
  });
  it("损坏记录不会作为恢复任务使用", () => {
    saveGenerationSession(session);
    localStorage.setItem(localStorage.key(0)!, "{bad json");
    expect(readGenerationSession(session.tool, session.path)).toBeNull();
  });
});
