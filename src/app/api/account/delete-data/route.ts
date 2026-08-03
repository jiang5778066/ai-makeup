import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const { deleteUserData } = await import("@/lib/account-deletion");
  const result = await deleteUserData(user.id);
  return NextResponse.json({ deleted: true, ...result });
}
