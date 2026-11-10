import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGrantPurchaseCredits = vi.fn();
const mockReverseCreditsForRefund = vi.fn();

vi.mock("@/lib/payments/handlers", () => ({
  grantPurchaseCredits: (...args: unknown[]) => mockGrantPurchaseCredits(...args),
  reverseCreditsForRefund: (...args: unknown[]) => mockReverseCreditsForRefund(...args)
}));

function signedRequest(body: unknown) {
  const payload = JSON.stringify(body);
  const signature = crypto.createHmac("sha256", "webhook_secret").update(payload).digest("hex");
  return new Request("http://localhost/api/webhooks/creem", {
    method: "POST",
    body: payload,
    headers: { "creem-signature": signature }
  });
}

beforeEach(() => {
  vi.resetModules();
  mockGrantPurchaseCredits.mockReset();
  mockReverseCreditsForRefund.mockReset();
  process.env.CREEM_WEBHOOK_SECRET = "webhook_secret";
  process.env.CREEM_PRODUCT_CREDITS_100 = "prod_credits_100";
});

describe("POST /api/webhooks/creem", () => {
  it("processes the official eventType + object checkout payload", async () => {
    mockGrantPurchaseCredits.mockResolvedValue("granted");
    const { POST } = await import("./route");

    const response = await POST(
      signedRequest({
        id: "evt_1",
        eventType: "checkout.completed",
        object: {
          id: "checkout_1",
          product: { id: "prod_credits_100" },
          order: {
            id: "order_1",
            transaction: "transaction_1",
            amount: 800,
            currency: "USD"
          },
          metadata: { userId: "user_1", planId: "credits_100" }
        }
      })
    );

    expect(response.status).toBe(200);
    expect(mockGrantPurchaseCredits).toHaveBeenCalledWith({
      provider: "creem",
      productId: "prod_credits_100",
      eventId: "evt_1",
      providerOrderId: "order_1",
      providerTransactionId: "transaction_1",
      userId: "user_1",
      planId: "credits_100",
      credits: 100,
      amountCents: 800,
      currency: "USD"
    });
  });

  it("locates refunds by the official transaction_id when no order id is included", async () => {
    mockReverseCreditsForRefund.mockResolvedValue("reversed");
    const { POST } = await import("./route");

    const response = await POST(
      signedRequest({
        id: "evt_refund_1",
        eventType: "refund.created",
        object: { transaction_id: "transaction_1" }
      })
    );

    expect(response.status).toBe(200);
    expect(mockReverseCreditsForRefund).toHaveBeenCalledWith({
      provider: "creem",
      eventId: "evt_refund_1",
      providerTransactionId: "transaction_1",
      reviewOnly: true, eventType: "refund.created"
    });
  });
});

it.each([{product:{id:"prod_wrong"},metadata:{userId:"user_1",planId:"credits_100"},order:{id:"order_1",amount:800,currency:"USD"}},{product:{id:"prod_credits_100"},metadata:{userId:"user_1"},order:{id:"order_1",amount:1,currency:"USD"}},{product:{id:"prod_credits_100"},metadata:{userId:"user_1"},order:{id:"order_1",amount:800,currency:"EUR"}},{product:{id:"prod_credits_100"},metadata:{userId:"user_1"},id:"checkout_1"}])("拒绝冲突产品或缺失/错误金额币种与真实订单",async object=>{const {POST}=await import("./route");expect((await POST(signedRequest({id:"evt_bad",eventType:"checkout.completed",object}))).status).toBe(400);expect(mockGrantPurchaseCredits).not.toHaveBeenCalled();});
it("数据库失败返回可重试且不泄露正文",async()=>{mockGrantPurchaseCredits.mockRejectedValue(new Error("database-private"));const {POST}=await import("./route");const response=await POST(signedRequest({id:"evt_retry",eventType:"checkout.completed",object:{product:{id:"prod_credits_100"},metadata:{userId:"user_1"},order:{id:"order_1",transaction:"tx_1",amount:800,currency:"USD"}}}));expect(response.status).toBe(503);expect(await response.text()).not.toContain("database-private");});
it("签名格式错误拒绝",async()=>{const {POST}=await import("./route");expect((await POST(new Request("http://localhost/api/webhooks/creem",{method:"POST",body:"{}",headers:{"creem-signature":"a".repeat(64)}}))).status).toBe(401);});
it("未配置返回503",async()=>{delete process.env.CREEM_WEBHOOK_SECRET;const{POST}=await import("./route");expect((await POST(signedRequest({}))).status).toBe(503);});
it("超限正文有界拒绝",async()=>{const{POST}=await import("./route");expect((await POST(new Request("http://localhost/api/webhooks/creem",{method:"POST",body:"a".repeat(65537)}))).status).toBe(413);});
it("未知事件明确忽略而不写入",async()=>{const{POST}=await import("./route");const r=await POST(signedRequest({id:"evt_unknown",eventType:"product.updated",object:{id:"prod_credits_100"}}));expect(await r.json()).toEqual({received:true,ignored:true});expect(mockGrantPurchaseCredits).not.toHaveBeenCalled();});

it.each([{}, {transaction_id:"conflict"},{transaction_id:{id:"transaction_1"}},{transaction:null},{transaction:42},{transaction:{id:"bad id"}}])("交易标识缺失或冲突安全拒绝 %j",async extra=>{const{POST}=await import("./route");const order:Record<string,unknown>={id:"order_1",amount:800,currency:"USD"};if(Object.keys(extra).length)order.transaction="transaction_1";const r=await POST(signedRequest({id:"invalid_alias",eventType:"checkout.completed",object:{product:{id:"prod_credits_100"},metadata:{userId:"user_1"},order,...extra}}));expect(r.status).toBe(400);expect(mockGrantPurchaseCredits).not.toHaveBeenCalled();});
it("三个交易别名合法且一致才授额",async()=>{const{POST}=await import("./route");const r=await POST(signedRequest({id:"consistent_alias",eventType:"checkout.completed",object:{product:{id:"prod_credits_100"},metadata:{userId:"user_1"},order:{id:"order_1",transaction:{id:"transaction_1"},amount:800,currency:"USD"},transaction_id:"transaction_1",transaction:{id:"transaction_1"}}}));expect(r.status).toBe(200);expect(mockGrantPurchaseCredits).toHaveBeenCalledWith(expect.objectContaining({providerTransactionId:"transaction_1"}));});
