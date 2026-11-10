import {expect,it,vi} from "vitest";
vi.mock("@/db/client",()=>({db:{}}));
import {publicBillingAttempt} from "./platform-billing-attempts";
const row={id:"synthetic",userId:"private-user",provider:"creem",planId:"credits_100",requestId:"private-request",providerOrderId:"private-order",checkoutUrl:"https://www.creem.io/payment/synthetic",createdAt:new Date(),updatedAt:new Date(),status:"completed"};
it("completed/unknown/submitting不暴露旧付款链接和供应商私有身份",()=>{for(const status of ["completed","unknown","submitting"]){expect(publicBillingAttempt({...row,status})).toEqual({id:"synthetic",status});}});
it("只有ready返回受信HTTPS URL",()=>{expect(publicBillingAttempt({...row,status:"ready"}).checkoutUrl).toBe(row.checkoutUrl);expect(publicBillingAttempt({...row,status:"ready",checkoutUrl:"https://evil.invalid"}).checkoutUrl).toBeUndefined();});
