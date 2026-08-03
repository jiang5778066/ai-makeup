import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createCreemCheckout } from "@/lib/payments/creem-checkout";
import { getPlan } from "@/lib/payments/plans";
import { isCheckoutEnabled } from "@/lib/launch-flags";
import { isJsonObject, isSameOriginRequest } from "@/lib/request-security";

type CheckoutRequest = {
  planId?: string;
  provider?: string;
};

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ code: "invalid_origin" }, { status: 403 });
  }

  if (!isCheckoutEnabled()) {
    return NextResponse.json({ code: "checkout_disabled" }, { status: 503 });
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
  const body = payload as CheckoutRequest;
  const plan = body.planId ? getPlan(body.planId) : null;
  const provider = body.provider ?? "creem";

  if (!plan) {
    return NextResponse.json({ code: "unknown_plan" }, { status: 400 });
  }
  if (provider !== "creem") {
    return NextResponse.json({ code: "creem_only" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    const checkoutUrl = await createCreemCheckout({
      plan,
      userId: user.id,
      email: user.email ?? "",
      siteUrl
    });
    return NextResponse.json({ checkoutUrl, provider, planId: plan.id });
  } catch {
    return NextResponse.json({ code: "checkout_failed" }, { status: 502 });
  }
}
