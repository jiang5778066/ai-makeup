import {expect,it} from "vitest";
import {planIdForCheckout} from "./checkout-plans";
import {getPlan} from "./payments/plans";
it("仅真实100积分套餐能购买",()=>{expect(planIdForCheckout("credits_100")).toBe("credits_100");for(const value of ["free","pro","unlimited","__proto__","constructor"])expect(planIdForCheckout(value)).toBeNull();});
it("服务器套餐固定积分金额且不读取原型属性",()=>{expect(getPlan("credits_100")).toMatchObject({credits:100,priceUsd:8,oneTime:true});expect(getPlan("__proto__")).toBeNull();expect(getPlan("constructor")).toBeNull();});
