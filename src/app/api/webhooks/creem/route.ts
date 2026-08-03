import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getPlan, planByCreemProductId } from "@/lib/payments/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreemOrder = {
  id?: string;
  transaction?: string | { id?: string };
  amount?: number;
  currency?: string;
};

type CreemObject = {
  id?: string;
  product_id?: string;
  product?: string | { id?: string };
  order_id?: string;
  order?: CreemOrder;
  transaction_id?: string;
  transaction?: string | { id?: string; order?: string | { id?: string } };
  amount?: number;
  currency?: string;
  metadata?: Record<string, string>;
};

type CreemEvent = {
  id: string;
  eventType: string;
  object: CreemObject;
};

function nestedId(value: string | { id?: string } | undefined): string | undefined {
  return typeof value === "string" ? value : value?.id;
}

function verifySignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const received = header.trim();
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function resolvePlan(object: CreemObject) {
  const metadataPlan = object.metadata?.planId;
  if (metadataPlan) {
    const plan = getPlan(metadataPlan);
    if (plan) return plan;
  }
  const productId = object.product_id ?? nestedId(object.product);
  return productId ? planByCreemProductId(productId) : null;
}

export async function POST(request: Request) {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ code: "creem_unconfigured" }, { status: 503 });

  const payload = await request.text();
  if (!verifySignature(payload, request.headers.get("creem-signature"), secret)) {
    return NextResponse.json({ code: "invalid_signature" }, { status: 401 });
  }

  let event: CreemEvent;
  try {
    event = JSON.parse(payload) as CreemEvent;
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }
  if (!event.id || !event.eventType || !event.object) {
    return NextResponse.json({ code: "invalid_event" }, { status: 400 });
  }

  if (event.eventType === "checkout.completed") {
    const plan = resolvePlan(event.object);
    const userId = event.object.metadata?.userId;
    const providerOrderId = event.object.order?.id ?? event.object.order_id ?? event.object.id;
    if (!plan || !userId || !providerOrderId) {
      return NextResponse.json({ code: "unresolvable" }, { status: 400 });
    }
    const { grantPurchaseCredits } = await import("@/lib/payments/handlers");
    await grantPurchaseCredits({
      provider: "creem",
      eventId: event.id,
      providerOrderId,
      providerTransactionId:
        nestedId(event.object.order?.transaction) ??
        event.object.transaction_id ??
        nestedId(event.object.transaction),
      userId,
      planId: plan.id,
      credits: plan.credits,
      amountCents: event.object.order?.amount ?? event.object.amount ?? plan.priceUsd * 100,
      currency: (event.object.order?.currency ?? event.object.currency ?? "USD").toUpperCase()
    });
    return NextResponse.json({ received: true });
  }

  if (event.eventType === "refund.created" || event.eventType === "dispute.created") {
    const providerOrderId =
      event.object.order_id ??
      nestedId(event.object.transaction && typeof event.object.transaction !== "string"
        ? event.object.transaction.order
        : undefined) ??
      event.object.order?.id;
    const providerTransactionId =
      event.object.transaction_id ?? nestedId(event.object.transaction);
    if (!providerOrderId && !providerTransactionId) {
      return NextResponse.json({ code: "missing_order_or_transaction" }, { status: 400 });
    }
    const { reverseCreditsForRefund } = await import("@/lib/payments/handlers");
    await reverseCreditsForRefund({
      provider: "creem",
      eventId: event.id,
      ...(providerOrderId ? { providerOrderId } : {}),
      ...(providerTransactionId ? { providerTransactionId } : {})
    });
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true, ignored: true });
}
