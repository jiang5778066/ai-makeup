// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { runImageJob, type ImageJobSteps } from "./image-job";
import type { ImageSubmission } from "./creative-center";

const submit = vi.fn();
const query = vi.fn();
const recover = vi.fn();
vi.mock("./creative-center", () => ({
  submitImageTask: (...args: unknown[]) => submit(...args),
  queryImageTask: (...args: unknown[]) => query(...args),
  recoverImageTask: (...args: unknown[]) => recover(...args)
}));

const submission: ImageSubmission = {
  requestId: "generation-1", model: "gpt-image-2", quality: "1k", size: "2:3",
  prompt: "仅编辑妆容。", costCents: 5, baselineIds: []
};

function durableSteps() {
  const results = new Map<string, unknown>();
  const sleeps: string[] = [];
  const steps: ImageJobSteps = {
    async run<T>(name: string, callback: () => Promise<T>): Promise<T> {
      if (results.has(name)) return results.get(name) as T;
      const result = await callback();
      results.set(name, result);
      return result;
    },
    async sleep(name: string) { sleeps.push(name); }
  };
  return { steps, sleeps };
}

afterEach(() => vi.resetAllMocks());

describe("图片任务的持久化编排", () => {
  it("等待原任务完成；重放已保存步骤时不会再次提交", async () => {
    const { steps, sleeps } = durableSteps();
    submit.mockResolvedValue({ status: "submitted", taskId: "img_task_1" });
    query.mockResolvedValueOnce({ status: "pending" }).mockResolvedValueOnce({ status: "completed", resultImageUrl: "https://cdn.test/result.png" });
    expect(await runImageJob(steps, submission, "https://r2.test/input.jpg")).toBe("https://cdn.test/result.png");
    expect(await runImageJob(steps, submission, "https://r2.test/input.jpg")).toBe("https://cdn.test/result.png");
    expect(submit).toHaveBeenCalledOnce();
    expect(query.mock.calls).toEqual([["img_task_1"], ["img_task_1"]]);
    expect(sleeps.length).toBeGreaterThan(0);
  });

  it("提交不确定时通过历史恢复，后续只查询恢复到的任务", async () => {
    const { steps } = durableSteps();
    submit.mockResolvedValue({ status: "submission_unknown" });
    recover.mockResolvedValueOnce(null).mockResolvedValueOnce("img_task_recovered");
    query.mockResolvedValue({ status: "completed", resultImageUrl: "https://cdn.test/recovered.png" });
    expect(await runImageJob(steps, submission, "https://r2.test/input.jpg")).toBe("https://cdn.test/recovered.png");
    expect(submit).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledWith("img_task_recovered");
  });

  it("生成明确失败时抛出业务错误", async () => {
    const { steps } = durableSteps();
    submit.mockResolvedValue({ status: "submitted", taskId: "img_task_1" });
    query.mockResolvedValue({ status: "failed", error: "creative_task_failed" });
    await expect(runImageJob(steps, submission, "https://r2.test/input.jpg")).rejects.toThrow("creative_task_failed");
    expect(submit).toHaveBeenCalledOnce();
  });
  it("单轮查询达到上限后交接原任务，续查不再提交", async () => {
    submit.mockResolvedValue({ status: "submitted", taskId: "img_task_1" });
    query.mockResolvedValue({ status: "pending" });
    const resume = await runImageJob(durableSteps().steps, submission, "https://r2.test/input.jpg");
    expect(resume).toEqual({ submission, taskId: "img_task_1" });
    expect(query).toHaveBeenCalledTimes(60);
    if (typeof resume === "string") throw new Error("预期获得恢复状态");
    query.mockResolvedValue({ status: "completed", resultImageUrl: "https://cdn.test/result.png" });
    expect(await runImageJob(durableSteps().steps, submission, "", { resume })).toBe("https://cdn.test/result.png");
    expect(submit).toHaveBeenCalledOnce();
  });

  it("历史查询持续异常时保留待核对状态，绝不补发", async () => {
    submit.mockResolvedValue({ status: "submission_unknown" });
    recover.mockRejectedValue(new Error("network failed"));
    expect(await runImageJob(durableSteps().steps, submission, "https://r2.test/input.jpg")).toEqual({ submission });
    expect(submit).toHaveBeenCalledOnce();
    expect(query).not.toHaveBeenCalled();
  });

});
