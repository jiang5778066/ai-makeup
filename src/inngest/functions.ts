import { eq } from "drizzle-orm";
import { generations } from "@/db/schema";
import { generateMakeup } from "@/lib/ai/fal";
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

async function fetchToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch_result_failed:${response.status}`);
  const ab = await response.arrayBuffer();
  return Buffer.from(ab);
}

async function uploadResultToR2(generationId: string, sourceUrl: string): Promise<string> {
  const bytes = await fetchToBuffer(sourceUrl);
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

function errorMessage(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "generation_failed";
}

export const makeupGenerate = inngest.createFunction(
  {
    id: "makeup-generate",
    retries: 2,
    triggers: [{ event: "makeup/generate.requested" }],
    onFailure: async ({ event, step }) => {
      const original = event.data.event as { data?: { generationId?: string } };
      const generationId = original.data?.generationId;
      if (!generationId) return { status: "missing_generation_id" };
      const failure = event.data.error as { message?: string } | undefined;
      return step.run("refund-terminal-failure", () =>
        failAndRefundGeneration(generationId, failure?.message ?? "generation_failed")
      );
    }
  },
  async ({ event, step }) => {
    const { generationId } = event.data as { generationId: string };

    const gen = await step.run("load-generation", async () => {
      const { db } = await import("@/db/client");
      const [row] = await db.select().from(generations).where(eq(generations.id, generationId));
      if (!row) throw new Error("generation_missing");
      return row;
    });

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
          .set({ status: "done", resultKey, updatedAt: new Date() })
          .where(eq(generations.id, generationId));
      });
      return { status: "done", resultKey };
    }

    const budgetReserved = await step.run("reserve-ai-budget", () => reserveDailyAiSpend());
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

    const locale = toLocale(gen.locale);
    const styles = getStyleLibrary(locale);
    const style = styles.find((s) => s.id === gen.styleId) ?? styles[0];

    const aiResult = await step.run("ai-generate", async () => {
      try {
        return await generateMakeup({
          uploadKey: gen.uploadKey,
          styleId: gen.styleId,
          intensity: gen.intensity,
          styleName: style.name,
          styleDescription: style.description
        });
      } catch (error) {
        throw new Error(`ai_generate:${errorMessage(error)}`);
      }
    });

    const resultKey = await step.run("upload-result", () =>
      uploadResultToR2(generationId, aiResult.resultImageUrl)
    );

    await step.run("finalize", async () => {
      const { db } = await import("@/db/client");
      await db
        .update(generations)
        .set({ status: "done", resultKey, updatedAt: new Date() })
        .where(eq(generations.id, generationId));
    });

    return { status: "done", resultKey };
  }
);

export const functions = [makeupGenerate];
