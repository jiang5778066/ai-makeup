import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ code: "unauthorized" }, { status: 401, headers });
    const { getBalance } = await import("@/lib/credits");
    return NextResponse.json({ userId: user.id, balance: await getBalance(user.id) }, { headers });
  } catch { return NextResponse.json({ code: "balance_unavailable" }, { status: 503, headers }); }
}
