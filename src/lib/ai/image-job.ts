import { queryImageTask, recoverImageTask, submitImageTask, type ImageSubmission, type SubmitResult } from "./creative-center";

export interface ImageJobSteps {
  run<T>(name: string, callback: () => Promise<T>): Promise<T>;
  sleep(name: string, duration: "5s" | "30s"): Promise<unknown>;
}
export type ImageJobResume = { submission: ImageSubmission; taskId?: string };
export type ImageJobOptions = {
  resume?: ImageJobResume;
  submit?: () => Promise<SubmitResult>;
};

export async function runImageJob(
  steps: ImageJobSteps,
  submission: ImageSubmission,
  referenceImageUrl: string,
  options: ImageJobOptions = {}
): Promise<string | ImageJobResume> {
  const submitted = options.resume
    ? options.resume.taskId ? { status: "submitted" as const, taskId: options.resume.taskId } : { status: "submission_unknown" as const }
    : await steps.run("submit-image", options.submit ?? (() => submitImageTask(submission, referenceImageUrl)));
  if (submitted.status === "failed") throw new Error(submitted.error);
  let taskId = submitted.status === "submitted" ? submitted.taskId : undefined;
  // 每次调用有界轮询，未完成则用新事件继续，避免耗尽 Inngest 的步骤数。
  for (let attempt = 0; attempt < 60; attempt++) {
    if (!taskId) {
      taskId = await steps.run(`recover-image-${attempt}`, async () => {
        try { return await recoverImageTask(submission); } catch { return null; }
      }) ?? undefined;
    }
    if (taskId) {
      const result = await steps.run(`query-image-${attempt}`, () => queryImageTask(taskId!));
      if (result.status === "completed") return result.resultImageUrl;
      if (result.status === "failed") throw new Error(result.error);
    }
    await steps.sleep(`wait-image-${attempt}`, taskId ? "5s" : "30s");
  }
  return { submission, ...(taskId ? { taskId } : {}) };
}
