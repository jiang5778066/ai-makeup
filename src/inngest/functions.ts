import { and, eq, isNull } from "drizzle-orm";
import { generations } from "@/db/schema";
import { prepareMakeup, makeupReferenceUrl } from "@/lib/ai/makeup";
import { submitImageTask } from "@/lib/ai/creative-center";
import { runImageJob, type ImageJobSteps, type ImageJobResume } from "@/lib/ai/image-job";
import { moderateImage } from "@/lib/moderation";
import { getStyleLibrary } from "@/lib/content";
import { toLocale } from "@/lib/i18n";
import { inngest } from "./client";
import { R2_BUCKET_RESULTS } from "@/lib/storage";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { R2_BUCKET_ORIGINALS } from "@/lib/storage";
import { reserveDailyAiSpend } from "@/lib/ai-budget";
import { failAndRefundGeneration } from "@/lib/generation-failure";

declare global {
  var __r2UploadClient: S3Client | undefined;
}

function getR2Upload() {
  if (global.__r2UploadClient) return global.__r2UploadClient;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
    }
  });
  if (process.env.NODE_ENV !== "production") global.__r2UploadClient = client;
  return client;
}

async function uploadResultToR2(generationId: string, sourceUrl: string): Promise<string> {
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`fetch_result_failed:${response.status}`);
  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  const extensions: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
  const extension = contentType && extensions[contentType];
  if (!extension) throw new Error("invalid_result_content_type");
  const bytes = Buffer.from(await response.arrayBuffer());
  const key = `${generationId}.${extension}`;
  await getR2Upload().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_RESULTS,
      Key: key,
      Body: bytes,
      ContentType: contentType
    })
  );
  return key;
}

async function copyRenderedUploadToResults(
  generationId: string,
  renderedUploadKey: string
): Promise<string> {
  const response = await getR2Upload().send(
    new GetObjectCommand({ Bucket: R2_BUCKET_ORIGINALS, Key: renderedUploadKey })
  );
  if (!response.Body) throw new Error("rendered_upload_missing");
  const bytes = await response.Body.transformToByteArray();
  const key = `${generationId}.png`;
  await getR2Upload().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_RESULTS,
      Key: key,
      Body: bytes,
      ContentType: "image/png"
    })
  );
  return key;
}

export const makeupGenerate = inngest.createFunction(
  {
    id: "makeup-generate",
    retries: 2,
    concurrency: { limit: 1, key: "event.data.generationId" },
    triggers: [{ event: "makeup/generate.requested" }],
    onFailure: async ({ event, step }) => {
      const original = event.data.event as { data?: { generationId?: string } };
      const generationId = original.data?.generationId;
      if (!generationId) return { status: "missing_generation_id" };
      const { db } = await import("@/db/client");
      const [generation] = await db.select().from(generations).where(eq(generations.id, generationId));
      // 提交结果未知时保留额度，等待原任务核对，不能退款后再次生成。
      if (generation?.error === "creative_submission_pending") return { status: "awaiting_provider_reconciliation" };
      if (generation?.error === "creative_result_pending") return { status: "awaiting_result_storage" };
      const failure = event.data.error as { message?: string } | undefined;
      return step.run("refund-terminal-failure", () =>
        failAndRefundGeneration(generationId, failure?.message ?? "generation_failed")
      );
    }
  },
  async ({ event, step }) => {
    const { generationId, imageResume } = event.data as { generationId: string; imageResume?: ImageJobResume };

    const gen = await step.run("load-generation", async () => {
      const { db } = await import("@/db/client");
      const [row] = await db.select().from(generations).where(eq(generations.id, generationId));
      if (!row) throw new Error("generation_missing");
      return row;
    });

    if (["done", "failed", "refunded"].includes(gen.status)) return { status: gen.status };
    // 新到的重复事件不能创建新快照，已有任务应恢复原执行或其继续事件。
    if (!imageResume && ["creative_submission_pending", "creative_result_pending"].includes(gen.error ?? "")) {
      return { status: "awaiting_original_execution" };
    }

    if (!imageResume) {
      await step.run("mark-moderating", async () => {
        const { db } = await import("@/db/client");
        await db
          .update(generations)
          .set({ status: "moderating", updatedAt: new Date() })
          .where(eq(generations.id, generationId));
      });

      const moderation = await step.run("moderate", () => moderateImage(gen.uploadKey));
      if (!moderation.ok) {
        await step.run("mark-rejected", async () => {
          await failAndRefundGeneration(generationId, `moderation:${moderation.reason}`);
        });
        return { status: "refunded", reason: moderation.reason };
      }
    }

    if (gen.mode === "virtual_try_on") {
      if (!gen.renderedUploadKey) throw new Error("rendered_upload_missing");
      const renderedModeration = await step.run("moderate-rendered", () =>
        moderateImage(gen.renderedUploadKey!)
      );
      if (!renderedModeration.ok) {
        await step.run("refund-rendered-rejection", () =>
          failAndRefundGeneration(
            generationId,
            `moderation:${renderedModeration.reason}`
          )
        );
        return { status: "refunded", reason: renderedModeration.reason };
      }
      await step.run("mark-running", async () => {
        const { db } = await import("@/db/client");
        await db
          .update(generations)
          .set({ status: "running", updatedAt: new Date() })
          .where(eq(generations.id, generationId));
      });
      const resultKey = await step.run("store-virtual-result", () =>
        copyRenderedUploadToResults(generationId, gen.renderedUploadKey!)
      );
      await step.run("finalize-virtual", async () => {
        const { db } = await import("@/db/client");
        await db
          .update(generations)
          .set({ status: "done", resultKey, error: null, updatedAt: new Date() })
          .where(eq(generations.id, generationId));
      });
      return { status: "done", resultKey };
    }

    const locale = toLocale(gen.locale);
    const styles = getStyleLibrary(locale);
    const style = styles.find((s) => s.id === gen.styleId) ?? styles[0];
    const submission = imageResume?.submission ?? await step.run("prepare-image", () => prepareMakeup({
      requestId: generationId,
      uploadKey: gen.uploadKey,
      styleName: style.name,
      styleDescription: style.description,
      intensity: gen.intensity
    }));
    const budgetAlreadyReserved = Boolean(imageResume);
    const budgetReserved = budgetAlreadyReserved
      ? true
      : await step.run("reserve-ai-budget", () => reserveDailyAiSpend(submission.costCents));
    if (!budgetReserved) {
      await step.run("refund-budget-cap", () =>
        failAndRefundGeneration(generationId, "daily_ai_spend_cap_reached")
      );
      return { status: "refunded", reason: "daily_ai_spend_cap_reached" };
    }

    await step.run("mark-running", async () => {
      const { db } = await import("@/db/client");
      await db
        .update(generations)
        .set({ status: "running", updatedAt: new Date() })
        .where(eq(generations.id, generationId));
    });

    const referenceUrl = imageResume ? "" : await step.run("reference-image-url", () => makeupReferenceUrl(gen.uploadKey));
    let aiResult: string | ImageJobResume;
    try {
      const imageSteps: ImageJobSteps = {
        // 此编排步骤只返回 JSON 数据，可安全使用 Inngest 的持久化序列化结果。
        run: async <T>(name: string, callback: () => Promise<T>) => await step.run(name, callback) as T,
        sleep: (name, duration) => step.sleep(name, duration)
      };
      aiResult = await runImageJob(imageSteps, submission, referenceUrl, {
        resume: imageResume,
        submit: async () => {
          const { db } = await import("@/db/client");
          // 先原子登记提交意图：步骤重放或并发事件均不能重复提交付费请求。
          const claimed = await db.update(generations)
            .set({ error: "creative_submission_pending", updatedAt: new Date() })
            .where(and(eq(generations.id, generationId), isNull(generations.error)))
            .returning({ id: generations.id });
          if (!claimed.length) return { status: "submission_unknown" };
          return submitImageTask(submission, referenceUrl);
        }
      });
    } catch (error) {
      if (error instanceof Error && /^(creative_task_failed|creative_http_4\d\d)$/.test(error.message)) {
        await step.run("refund-provider-failure", () => failAndRefundGeneration(generationId, error.message));
        return { status: "refunded", reason: error.message };
      }
      throw error;
    }
    if (typeof aiResult !== "string") {
      await step.sendEvent("continue-image-task", {
        name: "makeup/generate.requested",
        data: { generationId, imageResume: aiResult }
      });
      return { status: "awaiting_provider", taskId: aiResult.taskId };
    }
    await step.run("mark-provider-completed", async () => {
      const { db } = await import("@/db/client");
      await db.update(generations).set({ error: "creative_result_pending", updatedAt: new Date() }).where(eq(generations.id, generationId));
    });

    const resultImageUrl = aiResult;
    const resultKey = await step.run("upload-result", () =>
      uploadResultToR2(generationId, resultImageUrl)
    );

    await step.run("finalize", async () => {
      const { db } = await import("@/db/client");
      await db
        .update(generations)
        .set({ status: "done", resultKey, error: null, updatedAt: new Date() })
        .where(eq(generations.id, generationId));
    });

    return { status: "done", resultKey };
  }
);

export const functions = [makeupGenerate];
