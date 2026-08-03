import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generations, projects } from "@/db/schema";
import { getStyleLibrary } from "@/lib/content";
import { R2_BUCKET_RESULTS, isStorageConfigured, presignGetUrl } from "@/lib/storage";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function buildResultUrl(resultKey: string | null) {
  if (!resultKey) return null;
  if (resultKey.startsWith("http")) return resultKey;
  if (!isStorageConfigured()) return null;
  return presignGetUrl({ bucket: R2_BUCKET_RESULTS, key: resultKey, expiresIn: 60 * 15 });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { db } = await import("@/db/client");

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)));

  if (!project) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(generations)
    .where(and(eq(generations.projectId, id), eq(generations.userId, user.id)))
    .orderBy(desc(generations.createdAt));

  const styles = getStyleLibrary("en");
  const gens = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      styleId: row.styleId,
      styleName: styles.find((s) => s.id === row.styleId)?.name ?? row.styleId,
      status: row.status,
      intensity: row.intensity,
      error: row.error,
      resultUrl: row.status === "done" ? await buildResultUrl(row.resultKey) : null,
      createdAt: row.createdAt
    }))
  );

  return NextResponse.json({
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    generations: gens
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { db } = await import("@/db/client");

  const result = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .returning({ id: projects.id });

  if (result.length === 0) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
