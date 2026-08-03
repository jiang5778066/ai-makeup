import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSameOriginRequest } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ code: "invalid_origin" }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const { deleteUserData } = await import("@/lib/account-deletion");
  const result = await deleteUserData(user.id);
  return NextResponse.json({ deleted: true, ...result });
}
