import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generations } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { getStyleLibrary } from "@/lib/content";
import { toLocale } from "@/lib/i18n";
import { R2_BUCKET_ORIGINALS, R2_BUCKET_RESULTS, isStorageConfigured, presignGetUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { db } = await import("@/db/client");
  const [row] = await db
    .select()
    .from(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, user.id)));

  if (!row) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const locale = toLocale(row.locale);
  const styles = getStyleLibrary(locale);
  const style = styles.find((s) => s.id === row.styleId);

  let resultUrl: string | null = null;
  let beforeUrl: string | null = null;
  if (isStorageConfigured()) {
    beforeUrl = await presignGetUrl({
      bucket: R2_BUCKET_ORIGINALS,
      key: row.uploadKey,
      expiresIn: 60 * 15
    });
  }
  if (row.status === "done" && row.resultKey) {
    if (row.resultKey.startsWith("http")) {
      resultUrl = row.resultKey;
    } else if (isStorageConfigured()) {
      resultUrl = await presignGetUrl({
        bucket: R2_BUCKET_RESULTS,
        key: row.resultKey,
        expiresIn: 60 * 15
      });
    }
  }

  const fitNotes = row.status === "done" && style
    ? locale === "zh-CN"
      ? [
          `${style.name} 会突出五官重点，同时保持肤色自然。`,
          `当前强度 ${row.intensity}% 适合先预览整体效果。`,
          "建议使用正脸清晰照片以提升口红和眼妆边缘准确度。"
        ]
      : [
          `${style.name} emphasizes facial balance while keeping skin texture believable.`,
          `The current ${row.intensity}% intensity is a good preview level before HD export.`,
          "Use a clear front-facing photo to improve lip and eye edge accuracy."
        ]
    : [];

  return NextResponse.json({
    id: row.id,
    status: row.status,
    styleName: style?.name ?? row.styleId,
    intensity: row.intensity,
    error: row.error,
    resultUrl,
    beforeUrl,
    mode: row.mode,
    sourceMode: row.sourceMode,
    makeupConfig: row.makeupConfig,
    fitNotes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  });
}
