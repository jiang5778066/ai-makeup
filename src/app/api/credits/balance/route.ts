import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  return NextResponse.json({ balance: await getBalance(user.id) });
}
