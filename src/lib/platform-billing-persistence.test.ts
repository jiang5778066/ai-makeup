import {beforeEach,expect,it,vi} from "vitest";
const execute=vi.fn();vi.mock("@/db/client",()=>({db:{execute:(...a:unknown[])=>execute(...a)}}));
beforeEach(()=>{execute.mockReset();});
it("缺迁移精确拒绝，正常配置可继续",async()=>{const{ensureBillingPersistence}=await import("./platform-billing-persistence");execute.mockResolvedValueOnce([{ready:false}]).mockResolvedValueOnce([{ready:true}]);await expect(ensureBillingPersistence()).rejects.toThrow("billing_migration_required");await expect(ensureBillingPersistence()).resolves.toBeUndefined();});
it("连接/权限错误保持原故障，不冒称缺迁移",async()=>{const{ensureBillingPersistence}=await import("./platform-billing-persistence");execute.mockRejectedValue(new Error("connection_failure"));await expect(ensureBillingPersistence()).rejects.toThrow("connection_failure");});
