import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { generations } from "@/db/schema";
import { getStyleLibrary } from "@/lib/content";
import { toLocale, type Locale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";
import { isGenerationEnabled } from "@/lib/launch-flags";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import {
  normalizeMakeupConfig,
  type MakeupConfig,
  type MakeupMode,
  type SourceMode
} from "@/lib/makeup";

type GenerateRequest = {
  styleId?: string;
  intensity?: number;
  locale?: Locale;
  uploadKey?: string;
  renderedUploadKey?: string;
  consent?: boolean;
  mode?: MakeupMode;
  sourceMode?: SourceMode;
  makeupConfig?: MakeupConfig;
};

const GENERATION_COST = 1;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isGenerationEnabled()) {
    return NextResponse.json({ code: "generation_disabled" }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`generation:${user.id}:${requestIp(request)}`, 30, 24 * 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ code: "rate_limited" }, { status: 429 });
  }

  const body = (await request.json()) as GenerateRequest;
  const locale = toLocale(body.locale);

  if (!body.uploadKey) {
    return NextResponse.json(
      {
        code: "missing_upload",
        message: locale === "zh-CN" ? "请先上传一张清晰自拍。" : "Please upload a clear selfie first."
      },
      { status: 400 }
    );
  }
  if (!body.uploadKey.startsWith(`${user.id}/`)) {
    return NextResponse.json({ code: "invalid_upload" }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json(
      {
        code: "consent_required",
        message:
          locale === "zh-CN"
            ? "请勾选同意我们处理你的照片，并确认你已年满 18 岁。"
            : "Please confirm you agree to photo processing and are 18+."
      },
      { status: 400 }
    );
  }

  const styles = getStyleLibrary(locale);
  const mode: MakeupMode = body.mode === "virtual_try_on" ? "virtual_try_on" : "full_face";
  const sourceMode: SourceMode = body.sourceMode === "camera" ? "camera" : "upload";
  const makeupConfig = mode === "virtual_try_on" ? normalizeMakeupConfig(body.makeupConfig) : undefined;
  if (mode === "virtual_try_on" && !body.renderedUploadKey) {
    return NextResponse.json({ code: "missing_rendered_upload" }, { status: 400 });
  }
  if (
    mode === "virtual_try_on" &&
    !body.renderedUploadKey?.startsWith(`${user.id}/`)
  ) {
    return NextResponse.json({ code: "invalid_rendered_upload" }, { status: 400 });
  }
  if (
    mode === "virtual_try_on" &&
    !Object.values(makeupConfig ?? {}).some((layer) => layer.enabled)
  ) {
    return NextResponse.json({ code: "empty_makeup_config" }, { status: 400 });
  }
  const style = styles.find((item) => item.id === body.styleId) ?? styles[0];
  const intensity = Math.max(20, Math.min(100, body.intensity ?? 62));
  const { db } = await import("@/db/client");

  const [{ id: generationId }] = await db
    .insert(generations)
    .values({
      userId: user.id,
      uploadKey: body.uploadKey,
      renderedUploadKey: mode === "virtual_try_on" ? body.renderedUploadKey : undefined,
      styleId: mode === "virtual_try_on" ? "virtual-custom" : style.id,
      mode,
      sourceMode,
      makeupConfig,
      intensity,
      locale,
      status: "queued"
    })
    .returning({ id: generations.id });

  const { InsufficientCreditsError, deductCredits } = await import("@/lib/credits");
  try {
    await deductCredits(user.id, GENERATION_COST, "generation", {
      type: "generation",
      id: generationId
    });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      await db
        .update(generations)
        .set({ status: "failed", error: "insufficient_credits" })
        .where(eq(generations.id, generationId));
      return NextResponse.json(
        {
          code: "insufficient_credits",
          message:
            locale === "zh-CN"
              ? "credits 余额不足，请先购买套餐。"
              : "Not enough credits. Please top up to continue."
        },
        { status: 402 }
      );
    }
    throw error;
  }

  await inngest.send({
    name: "makeup/generate.requested",
    data: { generationId }
  });

  return NextResponse.json({ generationId, status: "queued" }, { status: 202 });
}
