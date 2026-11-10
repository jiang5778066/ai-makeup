import {beforeEach,expect,it,vi} from "vitest";
const eventRows=vi.fn(), snapshot=vi.fn(), locks=vi.fn(), values=vi.fn();
vi.mock("@/lib/platform-billing-persistence",()=>({ensureBillingPersistence:vi.fn()}));
vi.mock("@/db/client",()=>({db:{transaction:(callback:(tx:unknown)=>unknown)=>callback({
 insert:()=>({values:(input:unknown)=>{values(input);return{onConflictDoNothing:()=>({returning:()=>eventRows()})};}}),
 select:()=>({from:()=>({where:()=>({limit:()=>snapshot(),for:()=>locks()})})}),
 update:()=>({set:()=>({where:()=>undefined})})
})}}));
const base={id:"o",providerOrderId:"order",providerTransactionId:"tx",userId:"u",planId:"credits_100",creditsAwarded:100,amountCents:800,currency:"USD",status:"completed"};
function configure(status="completed"){const row={...base,status};snapshot.mockResolvedValueOnce([row]).mockResolvedValueOnce([]);locks.mockResolvedValueOnce([row]);}
beforeEach(()=>{for(const m of[eventRows,snapshot,locks,values])m.mockReset();eventRows.mockResolvedValue([{eventId:"r"}]);});
it("按可信transaction身份回收未用批次，不影响其它额度",async()=>{configure();locks.mockResolvedValueOnce([{balance:103}]).mockResolvedValueOnce([{id:"lot",initialAmount:100,remaining:100}]);const{reverseCreditsForRefund}=await import("./handlers");expect(await reverseCreditsForRefund({provider:"creem",eventId:"r",providerTransactionId:"tx",amountCents:800,currency:"USD"})).toBe("reversed");expect(values).toHaveBeenCalledWith(expect.objectContaining({userId:"u",delta:-100,reason:"refund",refType:"order",refId:"o"}));});
it("乱序退款不吞掉可重试事件",async()=>{snapshot.mockResolvedValue([]);const{reverseCreditsForRefund}=await import("./handlers");await expect(reverseCreditsForRefund({provider:"creem",eventId:"early",providerOrderId:"future"})).rejects.toThrow("refund_order_pending");expect(values).not.toHaveBeenCalled();});
it("已退款终态不重复扣回",async()=>{configure("refunded");const{reverseCreditsForRefund}=await import("./handlers");expect(await reverseCreditsForRefund({provider:"creem",eventId:"again",providerOrderId:"order"})).toBe("duplicate");expect(values.mock.calls.filter(c=>c[0].reason==="refund")).toHaveLength(0);});
it("已使用批次仅转人工核对",async()=>{configure();locks.mockResolvedValueOnce([{balance:102}]).mockResolvedValueOnce([{id:"lot",initialAmount:100,remaining:99}]);const{reverseCreditsForRefund}=await import("./handlers");expect(await reverseCreditsForRefund({provider:"creem",eventId:"used",providerOrderId:"order",amountCents:800,currency:"USD"})).toBe("not_refundable");expect(values.mock.calls.filter(c=>c[0].reason==="refund")).toHaveLength(0);});
it("reviewOnly只取得order锁，不取得余额和批次锁",async()=>{configure();const{reverseCreditsForRefund}=await import("./handlers");expect(await reverseCreditsForRefund({provider:"creem",eventId:"review",providerOrderId:"order",reviewOnly:true,eventType:"dispute.created"})).toBe("not_refundable");expect(locks).toHaveBeenCalledOnce();expect(values.mock.calls.filter(c=>c[0].reason==="refund")).toHaveLength(0);});
