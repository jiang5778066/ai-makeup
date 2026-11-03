// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageSubmission } from "@/lib/ai/creative-center";
import type { ImageJobResume, ImageJobSteps } from "@/lib/ai/image-job";

type Context = {
  event: { data: { generationId: string; imageResume?: ImageJobResume } };
  step: ImageJobSteps & { sendEvent: ReturnType<typeof vi.fn> };
};
type FailureContext = {
  event: { data: { event: { data: { generationId: string } }; error: { message: string } } };
  step: Context["step"];
};
const mocks = vi.hoisted(() => ({
  handler: undefined as ((context: Context) => Promise<unknown>) | undefined,
  failure: undefined as ((context: FailureContext) => Promise<unknown>) | undefined,
  select: vi.fn(), claim: vi.fn(), set: vi.fn(),
  prepare: vi.fn(), reference: vi.fn(), moderate: vi.fn(), reserve: vi.fn(),
  upload: vi.fn(), submit: vi.fn(), query: vi.fn(), recover: vi.fn(), refund: vi.fn()
}));
vi.mock("./client", () => ({ inngest: {
  createFunction: (options: { onFailure: typeof mocks.failure }, handler: typeof mocks.handler) => {
    mocks.handler = handler;
    mocks.failure = options.onFailure;
    return {};
  }
} }));
vi.mock("@/db/client", () => ({ db: {
  select: () => ({ from: () => ({ where: mocks.select }) }),
  update: () => ({ set: (values: unknown) => {
    mocks.set(values);
    return { where: () => Object.assign(Promise.resolve([]), { returning: mocks.claim }) };
  } })
} }));
vi.mock("@/lib/ai/makeup", () => ({ prepareMakeup: mocks.prepare, makeupReferenceUrl: mocks.reference }));
vi.mock("@/lib/moderation", () => ({ moderateImage: mocks.moderate }));
vi.mock("@/lib/ai-budget", () => ({ reserveDailyAiSpend: mocks.reserve }));
vi.mock("@/lib/generation-failure", () => ({ failAndRefundGeneration: mocks.refund }));
vi.mock("@/lib/ai/creative-center", () => ({ submitImageTask: mocks.submit, queryImageTask: mocks.query, recoverImageTask: mocks.recover }));
vi.mock("@aws-sdk/client-s3", async (original) => ({
  ...await original<typeof import("@aws-sdk/client-s3")>(),
  S3Client: class { send = mocks.upload; }
}));
import "./functions";

const submission: ImageSubmission = { requestId: "gen-1", model: "gpt-image-2", quality: "1k", size: "2:3", costCents: 5, prompt: "仅编辑妆容", baselineIds: [] };
const generation = { id: "gen-1", status: "queued", mode: "full_face", locale: "zh", uploadKey: "source.webp", intensity: 55, error: null };
function context(imageResume?: ImageJobResume): Context {
  return {
    event: { data: { generationId: "gen-1", ...(imageResume ? { imageResume } : {}) } },
    step: { run: async (_name, callback) => callback(), sleep: vi.fn().mockResolvedValue(undefined), sendEvent: vi.fn().mockResolvedValue({}) }
  };
}
beforeEach(() => {
  for (const value of Object.values(mocks)) if (vi.isMockFunction(value)) value.mockReset();
  mocks.select.mockResolvedValue([{ ...generation }]);
  mocks.claim.mockResolvedValue([{ id: "gen-1" }]);
  mocks.prepare.mockResolvedValue(submission);
  mocks.reference.mockResolvedValue("https://r2.test/source.webp");
  mocks.moderate.mockResolvedValue({ ok: true });
  mocks.reserve.mockResolvedValue(true);
  mocks.submit.mockResolvedValue({ status: "submitted", taskId: "img_task_1" });
  mocks.query.mockResolvedValue({ status: "pending" });
  mocks.recover.mockResolvedValue(null);
});

afterEach(() => vi.unstubAllGlobals());

describe("创作中心队列接线", () => {
  it("按动态价格预留预算，只提交一次并交接原任务继续查询", async () => {
    const ctx = context();
    await expect(mocks.handler!(ctx)).resolves.toMatchObject({ status: "awaiting_provider", taskId: "img_task_1" });
    expect(mocks.reserve).toHaveBeenCalledWith(5);
    expect(mocks.submit).toHaveBeenCalledOnce();
    expect(mocks.query).toHaveBeenCalledTimes(60);
    expect(ctx.step.sendEvent).toHaveBeenCalledWith("continue-image-task", { name: "makeup/generate.requested", data: { generationId: "gen-1", imageResume: { submission, taskId: "img_task_1" } } });
  });
  it("恢复事件只查原任务，避免重复审核、预算预留与付费提交", async () => {
    await mocks.handler!(context({ submission, taskId: "img_task_1" }));
    expect(mocks.submit).not.toHaveBeenCalled();
    expect(mocks.reserve).not.toHaveBeenCalled();
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(mocks.moderate).not.toHaveBeenCalled();
    expect(mocks.reference).not.toHaveBeenCalled();
  });
  it("提交标记已经存在时禁止重发，改为恢复历史", async () => {
    mocks.claim.mockResolvedValue([]);
    await mocks.handler!(context());
    expect(mocks.submit).not.toHaveBeenCalled();
    expect(mocks.recover).toHaveBeenCalled();
    expect(mocks.refund).not.toHaveBeenCalled();
  });
  it("明确失败才结算退款", async () => {
    mocks.query.mockResolvedValue({ status: "failed", error: "creative_task_failed" });
    await expect(mocks.handler!(context())).resolves.toMatchObject({ status: "refunded" });
    expect(mocks.refund).toHaveBeenCalledWith("gen-1", "creative_task_failed");
  });
  it("队列终止但供应商任务仍不确定时保留额度待核对", async () => {
    mocks.select.mockResolvedValue([{ ...generation, error: "creative_submission_pending" }]);
    await expect(mocks.failure!({ event: { data: { event: { data: { generationId: "gen-1" } }, error: { message: "network_timeout" } } }, step: context().step })).resolves.toMatchObject({ status: "awaiting_provider_reconciliation" });
    expect(mocks.refund).not.toHaveBeenCalled();
  });
  it("完成后按真实图片格式存入 R2 并结束任务", async () => {
    mocks.query.mockResolvedValue({ status: "completed", resultImageUrl: "https://cdn.test/result.jpg" });
    mocks.upload.mockResolvedValue({});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Uint8Array([255, 216, 255]), { headers: { "Content-Type": "image/jpeg" } })));
    await expect(mocks.handler!(context())).resolves.toEqual({ status: "done", resultKey: "gen-1.jpg" });
    expect(mocks.upload.mock.calls[0][0].input).toMatchObject({ Key: "gen-1.jpg", ContentType: "image/jpeg" });
    expect(mocks.set).toHaveBeenLastCalledWith(expect.objectContaining({ status: "done", resultKey: "gen-1.jpg", error: null }));
    expect(mocks.refund).not.toHaveBeenCalled();
  });

  it("供应商已出图但存储失败时保留原结果，禁止自动退款重生", async () => {
    mocks.select.mockResolvedValue([{ ...generation, error: "creative_result_pending" }]);
    await expect(mocks.failure!({ event: { data: { event: { data: { generationId: "gen-1" } }, error: { message: "fetch_result_failed:503" } } }, step: context().step })).resolves.toMatchObject({ status: "awaiting_result_storage" });
    expect(mocks.refund).not.toHaveBeenCalled();
  });

  it("重复外部事件遇到已有提交时不覆盖原快照或重新预检", async () => {
    mocks.select.mockResolvedValue([{ ...generation, status: "running", error: "creative_submission_pending" }]);
    await expect(mocks.handler!(context())).resolves.toMatchObject({ status: "awaiting_original_execution" });
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(mocks.submit).not.toHaveBeenCalled();
    expect(mocks.refund).not.toHaveBeenCalled();
  });

});
