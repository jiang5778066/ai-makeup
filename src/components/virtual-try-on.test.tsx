import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { consumeMakeupDraft, readMakeupDraft, saveMakeupDraft } from "@/lib/makeup-draft";
import { navigateToLogin } from "@/lib/auth-return";
import { saveGenerationSession } from "@/lib/generation-session";
const { detect, createModel } = vi.hoisted(() => ({ detect: vi.fn((_image: unknown) => ({ faceLandmarks: [[{ x: 0.5, y: 0.5, z: 0 }]] })), createModel: vi.fn() }));
vi.mock("@mediapipe/tasks-vision", () => ({ FilesetResolver: { forVisionTasks: vi.fn().mockResolvedValue({}) }, FaceLandmarker: { createFromOptions: createModel } }));
vi.mock("@/lib/virtual-renderer", () => ({ renderMakeup: vi.fn() }));
vi.mock("@/lib/makeup-draft", async (original) => ({ ...await original<object>(), readMakeupDraft: vi.fn(), saveMakeupDraft: vi.fn(), consumeMakeupDraft: vi.fn() }));
vi.mock("@/lib/auth-return", async (original) => ({ ...await original<object>(), navigateToLogin: vi.fn() }));
import { VirtualTryOn } from "./virtual-try-on";
let autoImageLoad: boolean;
let images: { onload: (() => void) | null; onerror: (() => void) | null }[];
const config = { lipstick: { enabled: true, presetId: "rosewood", color: "#9d4b55", intensity: 77 } };
async function flush() { await act(async () => {}); }
async function advance(ms = 2000) { await flush(); await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); }
async function mountPhoto() {
  const view = render(<VirtualTryOn locale="en" focusedPart="lipstick" />); await flush();
  await act(async () => { fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(["synthetic image"], "source.png", { type: "image/png" })] } }); });
  fireEvent.click(screen.getByRole("checkbox", { name: /I am 18/ })); return view;
}
async function generate() { await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Create HD result|Generate new result/ })); }); }
beforeEach(() => {
  vi.useFakeTimers(); localStorage.clear(); window.history.replaceState({}, "", "/virtual-makeup-try-on#try");
  autoImageLoad = true; images = [];
  createModel.mockReset().mockResolvedValue({ close: vi.fn(), setOptions: vi.fn(), detect, detectForVideo: detect });
  detect.mockClear();
  vi.mocked(readMakeupDraft).mockReset().mockResolvedValue({ kind: "none" });
  vi.mocked(saveMakeupDraft).mockReset().mockResolvedValue(undefined);
  vi.mocked(consumeMakeupDraft).mockReset().mockResolvedValue(undefined); vi.mocked(navigateToLogin).mockClear();
  vi.stubGlobal("Image", class { onload = null; onerror = null; naturalWidth = 320; naturalHeight = 240; constructor() { images.push(this); } set src(_value: string) { if (autoImageLoad) Promise.resolve().then(() => { images.at(-1)?.onload?.(); }); } });
  vi.stubGlobal("URL", class extends URL { static createObjectURL = vi.fn(() => "blob:synthetic"); static revokeObjectURL = vi.fn(); });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ clearRect: vi.fn(), drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(new Blob(["synthetic rendered"], { type: "image/png" })));
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: vi.fn() } });
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url === "/api/credits/balance") return { ok: true, json: async () => ({ balance: 3 }) };
    if (url === "/api/uploads/sign") return { ok: true, json: async () => ({ uploadUrl: "/local-put", uploadKey: "fixture-key" }) };
    if (url === "/local-put") return { ok: true };
    if (url === "/api/makeup/generate") return { ok: true, json: async () => ({ generationId: "virtual-task" }) };
    if (url.startsWith("/api/generations/")) return { ok: true, status: 200, json: async () => ({ id: "virtual-task", status: "done", resultUrl: "/local-result.png", beforeUrl: "/local-before.png", fitNotes: [], styleName: "virtual-custom", error: null }) };
    if (url === "/local-result.png") return { ok: false };
    throw new Error(`Unexpected request: ${url}`);
  }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); window.history.replaceState({}, "", "/"); });
describe("实时试妆（存储/模型/网络均为受控替身）", () => {
  it("保留上传、摄像头和九个部位控件", async () => {
    render(<VirtualTryOn locale="en" focusedPart="lipstick" />); await flush();
    expect(screen.getByRole("button", { name: "Upload photo" })).toBeInTheDocument(); expect(screen.getByRole("button", { name: "Live camera" })).toBeInTheDocument(); expect(screen.getAllByRole("tab")).toHaveLength(9);
  });
  it("401保存原照片与局部设置，完整next不丢查询和锚点", async () => {
    window.history.replaceState({}, "", "/zh-CN/ai-lipstick-try-on?source=test#try");
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);
    await mountPhoto(); fireEvent.change(screen.getByRole("slider"), { target: { value: "79" } }); await generate();
    expect(saveMakeupDraft).toHaveBeenCalledWith(expect.objectContaining({ tool: "virtual_try_on", source: expect.any(File), path: "/zh-CN/ai-lipstick-try-on?source=test#try", config: expect.objectContaining({ lipstick: expect.objectContaining({ intensity: 79 }) }) }));
    expect(navigateToLogin).toHaveBeenCalledWith("/zh-CN/ai-lipstick-try-on?source=test#try"); expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(["/api/credits/balance"]);
  });
  it("草稿保存失败不跳登录", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response); vi.mocked(saveMakeupDraft).mockRejectedValue(new Error("quota"));
    await mountPhoto(); await generate(); expect(navigateToLogin).not.toHaveBeenCalled(); expect(screen.getByRole("alert")).toHaveTextContent("Could not save your photo draft");
  });
  it("StrictMode恢复设置不自动同意、开摄像头或导出，照片加载后才消费", async () => {
    autoImageLoad = false;
    vi.mocked(readMakeupDraft).mockResolvedValue({ kind: "ready", draft: { version: 1, id: "draft", tool: "virtual_try_on", path: "/virtual-makeup-try-on#try", at: Date.now(), source: new Blob(["synthetic"], { type: "image/png" }), config } });
    render(<StrictMode><VirtualTryOn locale="en" /></StrictMode>); await flush();
    expect(screen.getByRole("slider")).toHaveValue("77"); expect(screen.getByRole("checkbox", { name: /I am 18/ })).not.toBeChecked(); expect(consumeMakeupDraft).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: /I am 18/ }));
    expect(screen.getByRole("button", { name: "Create HD result · 1 credit" })).toBeDisabled();
    await act(async () => { images.at(-1)?.onload?.(); });
    expect(consumeMakeupDraft).toHaveBeenCalledOnce(); expect(fetch).not.toHaveBeenCalled(); expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled(); expect(createModel).toHaveBeenCalledTimes(1);
  });
  it.each(["图片加载", "模型等待成功", "模型等待失败", "模型等待超时"])("旧恢复%s被新选图替代后不回写失败或消费，可手动生成新图", async (stage) => {
    autoImageLoad = false;
    let resolveModel!: (value: unknown) => void;
    let rejectModel!: (reason: Error) => void;
    const model = { close: vi.fn(), setOptions: vi.fn(), detect, detectForVideo: detect };
    if (stage !== "图片加载") {
      createModel.mockImplementationOnce(() => new Promise((resolve, reject) => { resolveModel = resolve; rejectModel = reject; }));
      if (stage === "模型等待失败") createModel.mockRejectedValueOnce(new Error("fallback_failed"));
    }
    vi.mocked(readMakeupDraft).mockResolvedValue({ kind: "ready", draft: { version: 1, id: "draft", tool: "virtual_try_on", path: "/virtual-makeup-try-on#try", at: Date.now(), source: new Blob(["old synthetic"], { type: "image/png" }), config } });
    const view = render(<VirtualTryOn locale="en" />); await flush();
    const oldImage = images[0];
    if (stage !== "图片加载") await act(async () => { oldImage.onload?.(); });
    if (stage === "模型等待超时") await advance(9000);
    const selected = new File(["new synthetic"], "new-photo.png", { type: "image/png" });
    await act(async () => { fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [selected] } }); });
    fireEvent.change(screen.getByRole("slider"), { target: { value: "89" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /I am 18/ }));
    if (stage === "模型等待失败") await act(async () => { rejectModel(new Error("gpu_failed")); });
    else if (stage !== "图片加载") {
      if (stage === "模型等待超时") await advance(1000);
      await act(async () => { resolveModel(model); });
    }
    await act(async () => { images.at(-1)?.onload?.(); });
    expect(screen.getByRole("button", { name: "Create HD result · 1 credit" })).toBeEnabled();
    expect(screen.getByRole("slider")).toHaveValue("89");
    expect(screen.getByRole("checkbox", { name: /I am 18/ })).toBeChecked();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText(/Saved photo could not load|Photo and settings restored/)).not.toBeInTheDocument();
    expect(consumeMakeupDraft).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
    expect(model.detect).toHaveBeenLastCalledWith(images.at(-1));
    expect(model.detect.mock.calls.some(([image]) => image === oldImage)).toBe(false);
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);
    await generate();
    expect(saveMakeupDraft).toHaveBeenCalledWith(expect.objectContaining({ source: selected, config: expect.objectContaining({ lipstick: expect.objectContaining({ intensity: 89 }) }) }));
  });
  it("照片加载失败仍保留唯一草稿，重试后恢复", async () => {
    autoImageLoad = false;
    vi.mocked(readMakeupDraft).mockResolvedValue({ kind: "ready", draft: { version: 1, id: "draft", tool: "virtual_try_on", path: "/virtual-makeup-try-on#try", at: Date.now(), source: new Blob(["synthetic"], { type: "image/png" }), config } });
    render(<VirtualTryOn locale="en" />); await flush();
    await act(async () => { images.at(-1)?.onerror?.(); });
    expect(consumeMakeupDraft).not.toHaveBeenCalled();
    autoImageLoad = true; await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Retry draft restoration" })); });
    expect(consumeMakeupDraft).toHaveBeenCalledOnce();
  });
  it("切换摄像头后旧草稿取消不覆盖当前权限提示或消费草稿", async () => {
    autoImageLoad = false;
    vi.mocked(readMakeupDraft).mockResolvedValue({ kind: "ready", draft: { version: 1, id: "draft", tool: "virtual_try_on", path: "/virtual-makeup-try-on#try", at: Date.now(), source: new Blob(["synthetic"], { type: "image/png" }), config } });
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(new Error("denied"));
    render(<VirtualTryOn locale="en" />); await flush();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Live camera" })); });
    await advance(10000);
    expect(screen.getByRole("alert")).toHaveTextContent("Camera permission was denied");
    expect(screen.queryByText(/Saved photo could not load|Photo loading timed out/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry draft restoration" })).not.toBeInTheDocument();
    expect(consumeMakeupDraft).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Create HD result · 1 credit" })).toBeEnabled();
  });
  it("GPU及回退模型加载失败保留草稿，显式重试后恢复", async () => {
    createModel.mockRejectedValueOnce(new Error("gpu_failed")).mockRejectedValueOnce(new Error("cpu_failed"));
    vi.mocked(readMakeupDraft).mockResolvedValue({ kind: "ready", draft: { version: 1, id: "draft", tool: "virtual_try_on", path: "/virtual-makeup-try-on#try", at: Date.now(), source: new Blob(["synthetic"], { type: "image/png" }), config } });
    render(<VirtualTryOn locale="en" />); await flush();
    expect(createModel).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Face model failed to load.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Face detection could not start");
    expect(consumeMakeupDraft).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Create HD result · 1 credit" })).toBeDisabled();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Retry draft restoration" })); });
    expect(createModel).toHaveBeenCalledTimes(3); expect(consumeMakeupDraft).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /I am 18/ })).not.toBeChecked();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("旧草稿删除晚到失败不覆盖重选照片后的通知", async () => {
    let failConsume!: (reason: Error) => void;
    vi.mocked(consumeMakeupDraft).mockReturnValue(new Promise((_resolve, reject) => { failConsume = reject; }));
    vi.mocked(readMakeupDraft).mockResolvedValue({ kind: "ready", draft: { version: 1, id: "draft", tool: "virtual_try_on", path: "/virtual-makeup-try-on#try", at: Date.now(), source: new Blob(["synthetic"], { type: "image/png" }), config } });
    const view = render(<VirtualTryOn locale="en" />); await flush();
    expect(consumeMakeupDraft).toHaveBeenCalledOnce();
    await act(async () => { fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(["new"], "new.png", { type: "image/png" })] } }); });
    await act(async () => { failConsume(new Error("delete_failed")); });
    expect(screen.queryByText(/saved copy could not be removed/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create HD result · 1 credit" })).toBeEnabled();
    expect(consumeMakeupDraft).toHaveBeenCalledOnce(); expect(fetch).not.toHaveBeenCalled();
  });
  it("已知id重挂载仅GET，未认证不展示旧结果", async () => {
    saveGenerationSession({ version: 1, generationId: "virtual-task", tool: "virtual_try_on", path: "/virtual-makeup-try-on#try", createdAt: Date.now(), style: { id: "virtual-custom", name: "Custom makeup", description: "Lipstick 60%" } });
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response); render(<VirtualTryOn locale="en" />); await advance();
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(["/api/generations/virtual-task"]); expect(screen.queryByRole("button", { name: "Download HD result" })).not.toBeInTheDocument(); expect(screen.getByRole("button", { name: "Sign in to continue" })).toBeEnabled();
  });
  it("下载失败仅重试下载，切换设置仍显示原妆效", async () => {
    const view = await mountPhoto(); await generate(); await advance();
    const posts = vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "POST").length;
    fireEvent.change(screen.getByRole("slider", { name: /Intensity/ }), { target: { value: "92" } });
    const download = screen.getByRole("button", { name: "Download HD result" });
    await act(async () => { fireEvent.click(download); }); await act(async () => { fireEvent.click(download); });
    expect(vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(posts);
    expect(view.container.querySelector(".tryon-result > p")).toHaveTextContent("Lipstick 60%"); expect(screen.getByRole("alert")).toHaveTextContent("Retry download");
  });
  it("响应丢失进入不确定状态，不自动再次生成", async () => {
    const original = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((url, init) => url === "/api/makeup/generate" ? Promise.reject(new Error("response lost")) : original(url, init));
    await mountPhoto(); await generate(); await advance(10000);
    expect(screen.getByRole("alert")).toHaveTextContent("submission response was lost"); expect(screen.getByRole("link", { name: "Check history" })).toBeInTheDocument();
    expect(vi.mocked(fetch).mock.calls.filter(([url]) => url === "/api/makeup/generate")).toHaveLength(1);
  });
});
