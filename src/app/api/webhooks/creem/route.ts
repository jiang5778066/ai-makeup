import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getPlan, planByCreemProductId } from "@/lib/payments/plans";
import { boundedBody } from "@/lib/platform-billing-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
const identifier = (value: unknown): string | undefined => typeof value === "string" && value.length > 0 && value.length <= 255 && !/[\x00-\x20]/.test(value) ? value : undefined;
const nestedId = (value: unknown) => identifier(value) ?? identifier(record(value).id);
const reply = (body: RecordValue, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) return reply({ code: "creem_unconfigured" }, 503);
  let payload: string;
  try { payload = await boundedBody(request, 65536); }
  catch { return reply({ code: "invalid_body" }, 413); }
  const received = request.headers.get("creem-signature");
  if (!received || !/^[a-f0-9]{64}$/.test(received)) return reply({ code: "invalid_signature" }, 401);
  const expected = crypto.createHmac("sha256", secret).update(payload).digest();
  if (!crypto.timingSafeEqual(expected, Buffer.from(received, "hex"))) return reply({ code: "invalid_signature" }, 401);
  let event: RecordValue;
  try { event = record(JSON.parse(payload)); } catch { return reply({ code: "invalid_json" }, 400); }
  const eventId = identifier(event.id), eventType = identifier(event.eventType);
  const object = record(event.object);
  if (!eventId || !eventType || !Object.keys(object).length) return reply({ code: "invalid_event" }, 400);
  const order = record(object.order), metadata = record(object.metadata);
  try {
    if (eventType === "checkout.completed") {
      const productId = identifier(object.product_id) ?? nestedId(object.product);
      if (object.product_id && object.product && identifier(object.product_id) !== nestedId(object.product)) return reply({ code: "product_conflict" }, 400);
      const plan = productId ? planByCreemProductId(productId) : null;
      const metadataPlan = metadata.planId === undefined ? plan : typeof metadata.planId === "string" ? getPlan(metadata.planId) : null;
      const userId = identifier(metadata.userId), providerOrderId = identifier(order.id);
      const transactions = [order.transaction === undefined ? undefined : nestedId(order.transaction), object.transaction_id === undefined ? undefined : identifier(object.transaction_id), object.transaction === undefined ? undefined : nestedId(object.transaction)].filter((_, index) => [order.transaction, object.transaction_id, object.transaction][index] !== undefined);
      if (!transactions.length || transactions.some(value => !value) || new Set(transactions).size !== 1) return reply({ code: "transaction_identity_invalid" }, 400);
      const attemptId = metadata.attemptId;
      if (attemptId !== undefined && (typeof attemptId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attemptId))) return reply({ code: "attempt_identity_invalid" }, 400);
      const amount = order.amount, currency = order.currency;
      if (!plan || !metadataPlan || metadataPlan.id !== plan.id || !userId || !providerOrderId ||
        amount !== plan.priceUsd * 100 || typeof currency !== "string" || currency.toUpperCase() !== "USD" ||
        (object.amount !== undefined && object.amount !== amount) ||
        (object.currency !== undefined && object.currency !== currency) ||
        (object.order_id !== undefined && object.order_id !== providerOrderId)) return reply({ code: "unresolvable" }, 400);
      const { grantPurchaseCredits } = await import("@/lib/payments/handlers");
      await grantPurchaseCredits({ provider: "creem", eventId, providerOrderId,
        providerTransactionId: transactions[0], productId, ...(attemptId ? { attemptId: attemptId as string } : {}),
        userId, planId: plan.id, credits: plan.credits, amountCents: plan.priceUsd * 100, currency: "USD" });
      return reply({ received: true });
    }
    if (eventType === "refund.created" || eventType === "dispute.created") {
      const transaction = record(object.transaction);
      const orderIds = [identifier(object.order_id), nestedId(transaction.order), identifier(order.id)].filter(Boolean);
      const transactionIds = [identifier(object.transaction_id), nestedId(object.transaction)].filter(Boolean);
      if (new Set(orderIds).size > 1 || new Set(transactionIds).size > 1) return reply({ code: "identity_conflict" }, 400);
      const providerOrderId = orderIds[0], providerTransactionId = transactionIds[0];
      if (!providerOrderId && !providerTransactionId) return reply({ code: "missing_order_or_transaction" }, 400);
      const { reverseCreditsForRefund } = await import("@/lib/payments/handlers");
      const result = await reverseCreditsForRefund({ provider: "creem", eventId,
        ...(providerOrderId ? { providerOrderId } : {}), ...(providerTransactionId ? { providerTransactionId } : {}),
        // 保存文档没有提供部分退款/争议金额合同；这些事件仅进入人工核对。
        reviewOnly: true, eventType });
      return reply({ received: true, review: result === "not_refundable" });
    }
    return reply({ received: true, ignored: true });
  } catch { return reply({ code: "processing_retry" }, 503); }
}
