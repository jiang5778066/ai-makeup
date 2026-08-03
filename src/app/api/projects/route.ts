import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generations, projects } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }
  const { db } = await import("@/db/client");

  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      createdAt: projects.createdAt,
      generationCount: sql<number>`COUNT(${generations.id})::int`,
      creditsUsed: sql<number>`COUNT(${generations.id}) FILTER (WHERE ${generations.status} = 'done')::int`
    })
    .from(projects)
    .leftJoin(
      generations,
      and(eq(generations.projectId, projects.id), eq(generations.userId, user.id))
    )
    .where(eq(projects.userId, user.id))
    .groupBy(projects.id)
    .orderBy(desc(projects.createdAt));

  return NextResponse.json({ projects: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = body.name?.trim() || "Untitled project";
  const { db } = await import("@/db/client");

  const [row] = await db
    .insert(projects)
    .values({ userId: user.id, name })
    .returning();

  return NextResponse.json({ project: row }, { status: 201 });
}
