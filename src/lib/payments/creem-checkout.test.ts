import { afterEach, beforeEach, expect, it, vi } from "vitest";
const fetchMock = vi.fn();
beforeEach(() => { vi.resetModules(); vi.stubGlobal("fetch", fetchMock); fetchMock.mockReset(); vi.stubEnv("ENABLE_CHECKOUT", "1"); vi.stubEnv("DISABLE_CHECKOUT", "0"); vi.stubEnv("CREEM_WEBHOOK_SECRET", "synthetic"); vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://makeup.example"); vi.stubEnv("CREEM_API_KEY", "synthetic"); vi.stubEnv("CREEM_PRODUCT_CREDITS_100", "prod_test"); vi.stubEnv("CREEM_API_BASE", "https://api.creem.io"); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
async function checkout(requestId = "checkout-stable", attemptId = "00000000-0000-4000-8000-000000000001") { const {createCreemCheckout}=await import("./creem-checkout"); const {getPlan}=await import("./plans"); return createCreemCheckout({plan:getPlan("credits_100")!,userId:"user_1",email:"test@example.com",siteUrl:"https://makeup.example",locale:"zh-CN",requestId,attemptId}); }
it("透传已持久化request_id与attempt且固定本地化返回页", async () => {
 fetchMock.mockResolvedValue({ok:true,json:async()=>({checkout_url:"https://www.creem.io/payment/test"})});
 await checkout(); await checkout(); await checkout("checkout-new","00000000-0000-4000-8000-000000000002"); const bodies=fetchMock.mock.calls.map(c=>JSON.parse(c[1].body));
 expect(bodies[0].request_id).toBe("checkout-stable"); expect(bodies[1].request_id).toBe("checkout-stable"); expect(bodies[2].request_id).toBe("checkout-new"); expect(bodies[0].metadata.attemptId).toBe("00000000-0000-4000-8000-000000000001");
 expect(bodies[0].success_url).toBe("https://makeup.example/zh-CN/billing/return");
 expect(bodies[0].product_id).toBe("prod_test");
});
it.each(["https://evil.example/pay","javascript:alert(1)","https://checkout.creem.io.evil.example/pay","http://checkout.creem.io/pay","https://user:pass@www.creem.io/pay"])("拒绝不可信 checkout URL %s",async url=>{ fetchMock.mockResolvedValue({ok:true,json:async()=>({checkout_url:url})}); await expect(checkout()).rejects.toThrow("creem_invalid_checkout_url"); });
it("上游失败不把正文带到错误",async()=>{ fetchMock.mockResolvedValue({ok:false,status:400,text:async()=>"private-key"}); await expect(checkout()).rejects.toThrow(/^creem_checkout_failed$/); });
it("拒绝任意供应商 API origin",async()=>{vi.stubEnv("CREEM_API_BASE","https://evil.example");await expect(checkout()).rejects.toThrow("creem_unconfigured");expect(fetchMock).not.toHaveBeenCalled();});
