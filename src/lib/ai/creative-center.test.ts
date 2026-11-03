// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  prepareImageSubmission,
  queryImageTask,
  recoverImageTask,
  submitImageTask
} from "./creative-center";

const request = vi.fn<typeof fetch>();
const config = {
  imagePricing: {
    "gpt-image-2": { supportedQualities: ["1k", "2k"], qualityPrices: { "1k": 0.05, "2k": 0.05 } },
    "grok-imagine-image-2.0": { supportedQualities: ["1k"], qualityPrices: { "1k": 0.15 } }
  }
};
const input = { prompt: "仅编辑妆容，保留人物身份。", requestId: "generation-1" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

beforeEach(() => {
  vi.stubEnv("ROUTER_CREATIVE_API_KEY", "test-only-key");
  vi.stubEnv("AI_IMAGE_MODEL", "gpt-image-2");
  vi.stubEnv("AI_IMAGE_QUALITY", "1k");
  vi.stubEnv("ROUTER_CREATIVE_BASE_URL", "https://api.router.team/api/public/creative-center");
  vi.stubGlobal("fetch", request);
  request.mockReset();
});

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

async function prepare() {
  request.mockResolvedValueOnce(json(config)).mockResolvedValueOnce(json({ records: [{ id: 7 }] }));
  return prepareImageSubmission(input);
}

describe("创作中心图片接口", () => {
  it("未配置凭证时阻止生成", async () => {
    vi.stubEnv("ROUTER_CREATIVE_API_KEY", "");
    await expect(prepareImageSubmission(input)).rejects.toThrow("ai_unconfigured");
    expect(request).not.toHaveBeenCalled();
  });

  it("读取当前模型价格，并保存提交前快照", async () => {
    const submission = await prepare();
    expect(submission).toMatchObject({ model: "gpt-image-2", quality: "1k", costCents: 5, baselineIds: [7] });
    expect(submission.prompt).toContain(input.prompt);
    expect(submission.prompt).toContain(input.requestId);
    expect(request.mock.calls.map(([url]) => String(url))).toEqual([
      "https://api.router.team/api/public/creative-center/config",
      "https://api.router.team/api/public/creative-center/history?type=IMAGE&size=50"
    ]);
  });

  it("可显式选择 Grok 并使用对应价格", async () => {
    vi.stubEnv("AI_IMAGE_MODEL", "grok-imagine-image-2.0");
    expect(await prepare()).toMatchObject({ model: "grok-imagine-image-2.0", costCents: 15 });
  });

  it("模型或清晰度不可用时不创建付费任务", async () => {
    request.mockResolvedValueOnce(json({ imagePricing: {} }));
    await expect(prepareImageSubmission(input)).rejects.toThrow("ai_model_unavailable");
    vi.stubEnv("AI_IMAGE_QUALITY", "4k");
    request.mockResolvedValueOnce(json(config));
    await expect(prepareImageSubmission(input)).rejects.toThrow("ai_quality_unavailable");
    expect(request.mock.calls.every(([, options]) => !options?.method || options.method === "GET")).toBe(true);
  });

  it("按单张参考图协议提交一次并读取任务编号", async () => {
    const submission = await prepare();
    request.mockResolvedValueOnce(json({ task_id: "img_task_1", status: "submitted" }, 202));
    expect(await submitImageTask(submission, "https://r2.test/original.webp")).toEqual({ status: "submitted", taskId: "img_task_1" });
    const [url, options] = request.mock.calls[2];
    expect(url).toBe("https://api.router.team/api/public/creative-center/images");
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual({
      model: "gpt-image-2", prompt: submission.prompt, quality: "1k", size: "2:3", n: 1,
      image_urls: ["https://r2.test/original.webp"]
    });
  });

  it.each(["network", "server", "missing-id"])("提交结果不确定时保留状态且不重试：%s", async (kind) => {
    const submission = await prepare();
    if (kind === "network") request.mockRejectedValueOnce(new Error("request timed out"));
    else request.mockResolvedValueOnce(json({}, kind === "server" ? 503 : 202));
    expect(await submitImageTask(submission, "https://r2.test/source.jpg")).toMatchObject({ status: "submission_unknown" });
    expect(request.mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(1);
  });

  it("确定拒绝的提交返回失败", async () => {
    const submission = await prepare();
    request.mockResolvedValueOnce(json({}, 403));
    expect(await submitImageTask(submission, "https://r2.test/source.jpg")).toMatchObject({ status: "failed", error: "creative_http_403" });
  });

  it("恢复时只读取新增且提示词、模型相符的原任务", async () => {
    const submission = await prepare();
    request.mockResolvedValueOnce(json({ records: [{ id: 7 }, { id: 8 }, { id: 9, model: "another-model" }] }));
    request.mockResolvedValueOnce(json({ model: submission.model, prompt: submission.prompt, taskId: "img_task_recovered" }));
    expect(await recoverImageTask(submission)).toBe("img_task_recovered");
    expect(request.mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(0);
  });

  it.each([
    { data: [{ url: "https://cdn.test/result.png" }] },
    { result_urls: ["https://cdn.test/result.png"] },
    { cover_url: "https://cdn.test/result.png" }
  ])("任务完成后读取图片地址：%j", async (output) => {
    request.mockResolvedValueOnce(json({ status: "completed", ...output }));
    expect(await queryImageTask("img_task_1")).toEqual({ status: "completed", resultImageUrl: "https://cdn.test/result.png" });
  });

  it("查询异常与未返回图片均保持等待，明确失败才返回失败", async () => {
    request.mockRejectedValueOnce(new Error("connection failed"));
    expect(await queryImageTask("img_task_1")).toMatchObject({ status: "pending" });
    request.mockResolvedValueOnce(json({ status: "completed", data: [] }));
    expect(await queryImageTask("img_task_1")).toMatchObject({ status: "pending" });
    request.mockResolvedValueOnce(json({ status: "failed", error_message: "provider failed" }));
    expect(await queryImageTask("img_task_1")).toMatchObject({ status: "failed" });
  });
  it("历史存在多个相同请求时不猜测任务编号", async () => {
    const submission = await prepare();
    request.mockResolvedValueOnce(json({ records: [{ id: 8 }, { id: 9 }] }));
    request.mockResolvedValueOnce(json({ model: submission.model, prompt: submission.prompt, taskId: "first" }));
    request.mockResolvedValueOnce(json({ model: submission.model, prompt: submission.prompt, taskId: "second" }));
    expect(await recoverImageTask(submission)).toBeNull();
  });

  it("历史恢复检查分页并精确匹配完整提示词", async () => {
    const submission = await prepare();
    request.mockResolvedValueOnce(json({ records: [{ id: 8 }], pages: 2 }));
    request.mockResolvedValueOnce(json({ model: submission.model, prompt: "其他提示词", taskId: "other" }));
    request.mockResolvedValueOnce(json({ records: [{ id: 9 }], pages: 2 }));
    request.mockResolvedValueOnce(json({ model: submission.model, prompt: submission.prompt, taskId: "original" }));
    expect(await recoverImageTask(submission)).toBe("original");
    expect(request.mock.calls.some(([url]) => String(url).includes("&page=2"))).toBe(true);
  });

});
