import { insertLegacyGeneration } from "@/lib/platform-creations-legacy-schema";
import { NextResponse } from "next/server";
import { getStyleLibrary } from "@/lib/content";
import { toLocale, type Locale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/supabase/server";
import { scheduleInitialMakeupDispatch, sendInitialMakeupEvents } from "@/lib/makeup-dispatch";
import { lockAccountData } from "@/lib/account-data-lock";
import { isOwnedLegacyUploadKey, legacyUploadExists } from "@/lib/storage";
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
  if (!isOwnedLegacyUploadKey(user.id, body.uploadKey)) {
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
    !isOwnedLegacyUploadKey(user.id, body.renderedUploadKey)
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
  const { getBalance } = await import("@/lib/credits");
  const { MAKEUP_GENERATION_COST } = await import("@/lib/makeup-accounting");

  const { uploadKey } = body;
  const renderedUploadKey = mode === "virtual_try_on" ? body.renderedUploadKey : undefined;
  let admission;
  try {
    admission = await db.transaction(async (tx) => {
      await lockAccountData(tx, user.id);
      const deadline = AbortSignal.timeout(3_000);
      // 等清理提交后再核验两张图。事务在 queued 记录写入并提交后释放锁。
      const [source, rendered] = await Promise.allSettled([
        legacyUploadExists(uploadKey, deadline),
        renderedUploadKey && renderedUploadKey !== uploadKey ? legacyUploadExists(renderedUploadKey, deadline) : true
      ]);
      if (source.status === "rejected" || rendered.status === "rejected" || deadline.aborted) {
        return { status: 503, code: "upload_storage_unavailable" } as const;
      }
      if (!source.value || !rendered.value) {
        return { status: 404, code: source.value ? "rendered_upload_not_found" : "upload_not_found" } as const;
      }
      // 入口仅做余额预检。最终扣分在审核通过后的任务事务中完成。
      if (await getBalance(user.id, tx) < MAKEUP_GENERATION_COST) {
        return { status: 402, code: "insufficient_credits", message: locale === "zh-CN"
          ? "credits 余额不足，请先购买套餐。"
          : "Not enough credits. Please top up to continue." } as const;
      }
      const [{ id }] = await insertLegacyGeneration(tx, {
        userId: user.id,
        uploadKey,
        renderedUploadKey,
        styleId: mode === "virtual_try_on" ? "virtual-custom" : style.id,
        mode,
        sourceMode,
        makeupConfig,
        intensity,
        locale,
        status: "queued"
      });
      await scheduleInitialMakeupDispatch(tx, id);
      return { id };
    });
  } catch {
    return NextResponse.json({ code: "generation_admission_unavailable" }, { status: 503 });
  }
  if ("code" in admission) {
    return NextResponse.json({ code: admission.code, message: admission.message }, { status: admission.status });
  }
  const { id: generationId } = admission;

  await sendInitialMakeupEvents([{ generationId }]);

  return NextResponse.json({ generationId, status: "queued" }, { status: 202 });
}
