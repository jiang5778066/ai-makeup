import { StrictMode } from "react";
import { readMakeupDraft, saveMakeupDraft, consumeMakeupDraft } from "@/lib/makeup-draft";
import { navigateToLogin } from "@/lib/auth-return";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStyleLibrary } from "@/lib/content";
import { MakeupTool } from "./makeup-tool";

vi.mock("@/lib/makeup-draft", async (original) => ({ ...await original<object>(), readMakeupDraft: vi.fn().mockResolvedValue({ kind: "none" }), saveMakeupDraft: vi.fn().mockResolvedValue(undefined), consumeMakeupDraft: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/auth-return", async (original) => ({ ...await original<object>(), navigateToLogin: vi.fn() }));
const styles = getStyleLibrary("en");
let generationStatus: "running" | "failed" | "done";
let pollFails: boolean;
let downloadResponse: { ok: boolean; blob: () => Promise<Blob> };
let clickDownload: ReturnType<typeof vi.spyOn>;

async function mount() {
  const view = render(<MakeupTool locale="en" styles={styles} cta="Generate makeup" />);
  await act(async () => {});
  const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(["local fixture"], "selfie.png", { type: "image/png" });
  fireEvent.change(input, { target: { files: [file] } });
  fireEvent.click(screen.getByRole("checkbox"));
  return { ...view, input };
}

async function generate() {
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Generate makeup|Generate new result/ })); });
}

async function poll() {
  await act(async () => {});
  await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  window.history.replaceState({}, "", "/ai-makeup");
  vi.mocked(readMakeupDraft).mockReset().mockResolvedValue({ kind: "none" });
  vi.mocked(saveMakeupDraft).mockReset().mockResolvedValue(undefined);
  vi.mocked(consumeMakeupDraft).mockReset().mockResolvedValue(undefined);
  vi.mocked(navigateToLogin).mockClear();
  generationStatus = "running";
  pollFails = false;
  downloadResponse = { ok: true, blob: async () => new Blob(["local fixture"], { type: "image/png" }) };
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = vi.fn(() => "blob:local-fixture");
    static revokeObjectURL = vi.fn();
  });
  clickDownload = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url === "/api/credits/balance") return { ok: true, json: async () => ({ balance: 3 }) };
    if (url === "/api/uploads/sign") return { ok: true, json: async () => ({ uploadUrl: "/local-upload", uploadKey: "local-only" }) };
    if (url === "/local-upload") return { ok: true };
    if (url === "/api/makeup/generate") return { ok: true, json: async () => ({ generationId: "local-only" }) };
    if (url.startsWith("/api/generations/")) {
      if (pollFails) throw new Error("Local status failure");
      return { ok: true, json: async () => ({
        id: "local-only", status: generationStatus, resultUrl: "/local-result.png", beforeUrl: "/local-before.png",
        fitNotes: [], styleName: "Local mock — not a makeup result", error: generationStatus === "failed" ? "Local generation failure" : null
      }) };
    }
    if (url === "/local-result.png") return downloadResponse;
    throw new Error(`Unexpected request: ${url}`);
  }));
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MakeupTool local UI regressions (no real generation)", () => {
  it("游客保存照片、风格、强度和完整中文地址后再登录，绝不上传", async () => {
    window.history.replaceState({}, "", "/zh-CN/ai-makeup?source=test#try");
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);
    await mount();
    fireEvent.click(screen.getByRole("button", { name: /Soft Glam/ }));
    fireEvent.change(screen.getByRole("slider", { name: /intensity/i }), { target: { value: "81" } });
    await generate();
    expect(saveMakeupDraft).toHaveBeenCalledWith(expect.objectContaining({ tool: "full_face", path: "/zh-CN/ai-makeup?source=test#try", source: expect.any(File), styleId: "soft-glam", intensity: 81 }));
    expect(navigateToLogin).toHaveBeenCalledWith("/zh-CN/ai-makeup?source=test#try");
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(["/api/credits/balance"]);
  });
  it("保存失败保留照片并提示，不静默跳走", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);
    vi.mocked(saveMakeupDraft).mockRejectedValue(new Error("quota"));
    await mount(); await generate();
    expect(navigateToLogin).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save your photo draft");
    expect(screen.getByAltText("Selected selfie preview")).toBeInTheDocument();
  });
  it("旧草稿读取晚到失败不覆盖新照片、设置和同意，可继续手动生成", async () => {
    let failRead!: (reason: Error) => void;
    vi.mocked(readMakeupDraft).mockReturnValue(new Promise((_resolve, reject) => { failRead = reject; }));
    const { input } = await mount();
    const selected = input.files![0];
    fireEvent.click(screen.getByRole("button", { name: /Soft Glam/ }));
    fireEvent.change(screen.getByRole("slider", { name: /intensity/i }), { target: { value: "81" } });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); failRead(new Error("draft_read_timeout")); });
    expect(screen.getByRole("button", { name: "Generate makeup" })).toBeEnabled();
    expect(screen.getByAltText("Selected selfie preview")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /intensity/i })).toHaveValue("81");
    expect(screen.getByRole("button", { name: /Soft Glam/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.queryByText(/Could not read the photo draft/)).not.toBeInTheDocument();
    expect(consumeMakeupDraft).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);
    await generate();
    expect(saveMakeupDraft).toHaveBeenCalledWith(expect.objectContaining({ source: selected, styleId: "soft-glam", intensity: 81 }));
  });
  it("旧草稿删除晚到失败不通知已重选照片的界面", async () => {
    let failConsume!: (reason: Error) => void;
    vi.mocked(consumeMakeupDraft).mockReturnValue(new Promise((_resolve, reject) => { failConsume = reject; }));
    vi.mocked(readMakeupDraft).mockResolvedValue({ kind: "ready", draft: { version: 1, id: "draft", tool: "full_face", path: "/ai-makeup#try", source: new Blob(["old"], { type: "image/png" }), at: Date.now(), styleId: "soft-glam", intensity: 83 } });
    const view = render(<MakeupTool locale="en" styles={styles} cta="Generate makeup" />); await act(async () => {});
    fireEvent.load(screen.getByAltText("Selected selfie preview"));
    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
    fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(["new"], "new.png", { type: "image/png" })] } });
    fireEvent.click(screen.getByRole("checkbox"));
    await act(async () => { failConsume(new Error("delete_failed")); });
    expect(screen.queryByText(/saved copy could not be removed/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate makeup" })).toBeEnabled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("StrictMode新标签恢复照片设置，不自动同意或生成，加载后才消费", async () => {
    vi.mocked(readMakeupDraft).mockResolvedValue({ kind: "ready", draft: { version: 1, id: "draft", tool: "full_face", path: "/ai-makeup#try", source: new Blob(["synthetic"], { type: "image/png" }), at: Date.now(), styleId: "soft-glam", intensity: 83 } });
    render(<StrictMode><MakeupTool locale="en" styles={styles} cta="Generate makeup" /></StrictMode>);
    await act(async () => {});
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByRole("slider", { name: /intensity/i })).toHaveValue("83");
    expect(screen.getByRole("button", { name: /Soft Glam/ })).toHaveAttribute("aria-pressed", "true");
    expect(fetch).not.toHaveBeenCalled(); expect(consumeMakeupDraft).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("button", { name: "Generate makeup" })).toBeDisabled();
    await act(async () => { fireEvent.load(screen.getByAltText("Selected selfie preview")); });
    expect(consumeMakeupDraft).toHaveBeenCalledOnce(); expect(fetch).not.toHaveBeenCalled();
  });
  it("恢复照片加载失败保留草稿，允许显式重试", async () => {
    vi.mocked(readMakeupDraft).mockResolvedValue({ kind: "ready", draft: { version: 1, id: "draft", tool: "full_face", path: "/ai-makeup#try", source: new Blob(["synthetic"], { type: "image/png" }), at: Date.now(), styleId: "natural", intensity: 70 } });
    render(<MakeupTool locale="en" styles={styles} cta="Generate makeup" />); await act(async () => {});
    fireEvent.error(screen.getByAltText("Selected selfie preview"));
    expect(consumeMakeupDraft).not.toHaveBeenCalled(); expect(screen.getByRole("button", { name: "Retry draft restoration" })).toBeEnabled();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Retry draft restoration" })); });
    await act(async () => { fireEvent.load(screen.getByAltText("Selected selfie preview")); });
    expect(consumeMakeupDraft).toHaveBeenCalledOnce();
  });
  it("上传签名和生成阶段401均可保存草稿后续接登录", async () => {
    for (const target of ["/api/uploads/sign", "/api/makeup/generate"]) {
      const original = vi.mocked(fetch).getMockImplementation()!;
      vi.mocked(fetch).mockImplementation((url, init) => url === target ? Promise.resolve({ ok: false, status: 401 } as Response) : original(url, init));
      const view = await mount(); await generate(); expect(navigateToLogin).toHaveBeenCalled();
      view.unmount(); vi.mocked(navigateToLogin).mockClear(); vi.mocked(fetch).mockImplementation(original);
    }
  });
  it("提交响应丢失提示先查历史，计时及实际重挂载后均不自动重复POST", async () => {
    const original = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((url, init) => url === "/api/makeup/generate" ? Promise.reject(new Error("response lost")) : original(url, init));
    const view = await mount(); await generate(); await poll();
    expect(screen.getByRole("alert")).toHaveTextContent("submission response was lost");
    expect(screen.getByRole("link", { name: "Check history" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("button", { name: "Generate makeup" })).toBeDisabled();
    expect(vi.mocked(fetch).mock.calls.filter(([url]) => url === "/api/makeup/generate")).toHaveLength(1);
    const requests = vi.mocked(fetch).mock.calls.length;
    view.unmount();
    render(<MakeupTool locale="en" styles={styles} cta="Generate makeup" />);
    await poll();
    expect(fetch).toHaveBeenCalledTimes(requests);
    expect(screen.getByRole("button", { name: "Generate makeup" })).toBeDisabled();
  });
  it("生成前先检查登录，余额请求失败时不上传", async () => {
    vi.mocked(fetch).mockImplementation(async () => ({ ok: false, status: 503, json: async () => ({}) } as Response));
    await mount(); await generate();
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(["/api/credits/balance"]);
  });
  it("重挂载后仅查询已保存任务", async () => {
    const view = await mount(); await generate();
    view.unmount(); vi.mocked(fetch).mockClear();
    render(<MakeupTool locale="en" styles={styles} cta="Generate makeup" />);
    await poll();
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(["/api/generations/local-only"]);
    expect(screen.queryByRole("checkbox")).not.toBeChecked();
  });
  it("preserves a valid upload on cancellation and invalid/oversize replacement", async () => {
    const { input } = await mount();
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.getByAltText("Selected selfie preview")).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [new File(["bad"], "bad.gif", { type: "image/gif" })] } });
    expect(screen.getByRole("alert")).toHaveTextContent("Use a JPG");
    const tooLarge = new File(["fixture"], "large.png", { type: "image/png" });
    Object.defineProperty(tooLarge, "size", { value: 13 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [tooLarge] } });
    expect(screen.getByRole("alert")).toHaveTextContent("12MB");
    expect(screen.getByAltText("Selected selfie preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate makeup" })).toBeEnabled();
  });

  it("does not open the picker when keyboard events bubble from remove", async () => {
    const { input } = await mount();
    const picker = vi.spyOn(input, "click");
    const remove = screen.getByRole("button", { name: "Remove image" });
    fireEvent.keyDown(remove, { key: "Enter" });
    fireEvent.click(remove);
    expect(picker).not.toHaveBeenCalled();
    expect(screen.queryByAltText("Selected selfie preview")).not.toBeInTheDocument();
  });

  it("locks inputs while generating, retries failure, and preserves the result style", async () => {
    const { container } = await mount();
    await generate();
    expect(screen.getByRole("status")).toHaveTextContent("Generating");
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove image" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Natural/ })).toBeDisabled();
    await poll();
    generationStatus = "failed";
    await poll();
    expect(screen.getByRole("alert")).toHaveTextContent("server reports generation failed");
    await generate();
    generationStatus = "done";
    await poll();
    const range = screen.getByRole("slider", { name: "Before and after comparison" });
    fireEvent.change(range, { target: { value: "75" } });
    expect(container.querySelector(".comparison-before")).toHaveStyle({ clipPath: "inset(0 25% 0 0)" });
    fireEvent.click(screen.getByRole("button", { name: /Soft Glam/ }));
    expect(container.querySelector(".result-card > p")).toHaveTextContent(styles[0].description);
    expect(screen.getByRole("button", { name: "Download preview" })).toBeEnabled();
  });

  it("recovers a failed status request instead of remaining busy", async () => {
    await mount();
    await generate();
    pollFails = true;
    await poll(); await poll(); await poll();
    expect(screen.getByRole("alert")).toHaveTextContent("Status checks paused");
    pollFails = false;
    const posts = vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "POST").length;
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Continue checking original task" })); });
    await poll();
    expect(vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(posts);
    expect(vi.mocked(fetch).mock.calls.at(-1)?.[0]).toBe("/api/generations/local-only");
  });

  it("recovers HTTP and invalid-image download failures without losing the result", async () => {
    await mount();
    await generate();
    generationStatus = "done";
    await poll();
    const download = screen.getByRole("button", { name: "Download preview" });
    for (const response of [
      { ok: false, blob: async () => new Blob() },
      { ok: true, blob: async () => new Blob(["not an image"], { type: "text/html" }) },
      { ok: true, blob: async () => new Blob([], { type: "image/png" }) }
    ]) {
      downloadResponse = response;
      await act(async () => { fireEvent.click(download); });
      expect(screen.getByRole("alert")).toHaveTextContent("Could not download");
      expect(download).toBeEnabled();
    }
    downloadResponse = { ok: true, blob: async () => new Blob(["fixture"], { type: "image/png" }) };
    await act(async () => { fireEvent.click(download); });
    expect(clickDownload).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Before and after comparison" })).toBeInTheDocument();
  });
});
