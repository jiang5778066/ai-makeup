import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generations, projects } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { isJsonObject, isSameOriginRequest } from "@/lib/request-security";

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
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ code: "invalid_origin" }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }
  if (!isJsonObject(payload)) {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }
  const body = payload as { name?: unknown };
  if (body.name !== undefined && typeof body.name !== "string") {
    return NextResponse.json({ code: "invalid_name" }, { status: 400 });
  }
  const name = body.name?.trim() || "Untitled project";
  if (name.length > 100) {
    return NextResponse.json({ code: "invalid_name" }, { status: 400 });
  }
  const { db } = await import("@/db/client");

  const [row] = await db
    .insert(projects)
    .values({ userId: user.id, name })
    .returning();

  return NextResponse.json({ project: row }, { status: 201 });
}
