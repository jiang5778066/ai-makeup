import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { prepareImageSubmission, queryImageTask, recoverImageTask, submitImageTask, type ImageSubmission } from "../src/lib/ai/creative-center";
import { buildMakeupPrompt } from "../src/lib/ai/makeup";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const directory = path.resolve("output/imagegen/smoke");
const statePath = path.join(directory, "state.json");
const lockPath = path.join(directory, "run.lock");
type State = {
  submission: ImageSubmission;
  status: "submission_intent" | "submitted" | "submission_unknown" | "completed" | "failed";
  createdAt: string;
  sourcePath: string;
  sourceSha256: string;
  taskId?: string;
  resultImageUrl?: string;
  outputPath?: string;
  error?: string;
};
async function save(state: State) {
  const temp = `${statePath}.tmp`;
  await writeFile(temp, JSON.stringify(state, null, 2) + "\n", { mode: 0o600 });
  await rename(temp, statePath);
}

async function main() {
  await mkdir(directory, { recursive: true });
  const lock = await open(lockPath, "wx", 0o600).catch(() => { throw new Error("验收脚本已加锁；确认原进程停止后才可删除 output/imagegen/smoke/run.lock。已有状态只能恢复原任务。"); });
  try {
    await lock.writeFile(String(process.pid));
    let state: State;
    if (existsSync(statePath)) {
      state = JSON.parse(await readFile(statePath, "utf8")) as State;
      console.log(`恢复已有记录：${state.submission.requestId}，不会重新提交。`);
    } else {
      if (!process.argv.includes("--submit")) throw new Error("没有已有任务。首次单图验收请加 --submit；提交后不要删除状态文件。");
      const sourcePath = "public/images/makeup-demo/natural.webp";
      const source = await readFile(sourcePath);
      if (source.length > 8 * 1024 * 1024) throw new Error("参考图超过内联限制");
      const submission = await prepareImageSubmission({
        requestId: `makeup-smoke-${randomUUID()}`,
        prompt: buildMakeupPrompt({ styleName: "玫瑰日常妆", styleDescription: "自然玫瑰粉色唇妆、柔和粉色腮红与细致棕色眼妆，保持真实皮肤质感。", intensity: 55 })
      });
      state = { submission, status: "submission_intent", createdAt: new Date().toISOString(), sourcePath, sourceSha256: createHash("sha256").update(source).digest("hex") };
      // 先独占保存提交意图；任何后续启动均只能恢复原任务。
      await writeFile(statePath, JSON.stringify(state, null, 2) + "\n", { flag: "wx", mode: 0o600 });
      console.log(`提交一张参考图编辑：${submission.model} / ${submission.quality}，接口报价 ${submission.costCents} 美分。`);
      const result = await submitImageTask(submission, `data:image/webp;base64,${source.toString("base64")}`);
      state.status = result.status;
      if (result.status === "submitted") state.taskId = result.taskId;
      if (result.status === "failed") state.error = result.error;
      await save(state);
    }
    if (state.status === "failed") throw new Error(`原任务明确失败：${state.error}，未重试。`);
    for (let attempt = 0; attempt < 120 && state.status !== "completed"; attempt++) {
      if (!state.taskId) {
        try { state.taskId = await recoverImageTask(state.submission) ?? undefined; }
        catch { console.log("历史查询暂时异常，继续核对原提交。"); }
        await save(state);
      }
      if (state.taskId) {
        const result = await queryImageTask(state.taskId);
        if (result.status === "failed") {
          state.status = "failed";
          state.error = result.error;
          await save(state);
          throw new Error(`原任务失败：${result.error}，未重试。`);
        }
        if (result.status === "completed") {
          state.status = "completed";
          state.resultImageUrl = result.resultImageUrl;
          await save(state);
          break;
        }
      }
      if (attempt % 6 === 0) console.log(`等待原任务：${state.taskId ?? "提交结果核对中"}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    if (state.status !== "completed" || !state.resultImageUrl) {
      console.log(`本轮等待结束，状态已保存。运行 npm run check:image 继续查询原任务。`);
      return;
    }
    if (!state.outputPath || !existsSync(state.outputPath)) {
      // 结果 CDN 不携带创作中心凭证，下载失败只重试下载。
      const response = await fetch(state.resultImageUrl, { signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`图片下载失败：${response.status}；原任务已完成，可再次运行脚本下载。`);
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) throw new Error("结果不是图片，保留原任务待核对。");
      const ext = contentType.includes("jpeg") ? "jpg" : contentType.includes("webp") ? "webp" : "png";
      state.outputPath = path.join(directory, `result.${ext}`);
      await writeFile(state.outputPath, Buffer.from(await response.arrayBuffer()));
      await save(state);
    }
    console.log(`生成完成：${state.taskId}\n模型：${state.submission.model}\n图片：${state.outputPath}`);
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}
main().catch((error: unknown) => {
  // 不输出供应商原始响应或请求头，避免凭证进入日志。
  console.error(error instanceof Error ? error.message : "验收失败，检查已保存状态。");
  process.exitCode = 1;
});
