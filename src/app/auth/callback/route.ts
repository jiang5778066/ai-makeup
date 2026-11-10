import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import { safeReturnPath, loginHref } from "@/lib/auth-return";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeReturnPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}${loginHref(next)}&error=missing_code`);
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}${loginHref(next)}&error=auth_failed`);
  }

  const { grantSignupCreditsIfNew } = await import("@/lib/credits");
  await grantSignupCreditsIfNew(data.user.id);

  return NextResponse.redirect(`${origin}${next}`);
}
