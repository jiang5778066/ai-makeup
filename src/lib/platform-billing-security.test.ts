import {expect,it} from "vitest";
import {billingLoginUrl,safeBillingPath} from "./platform-billing-security";
it("中文登录回跳完整保留安全 query/hash",()=>expect(billingLoginUrl("/zh-CN/pricing?from=menu#credits","zh-CN")).toBe("/login?next=%2Fzh-CN%2Fpricing%3Ffrom%3Dmenu%23credits"));
it.each(["//evil.example","/\\evil.example","https://evil.example","/%2f%2fevil.example","/a%0ab"])("拒绝危险本地回跳 %s",path=>expect(safeBillingPath(path)).toBe("/pricing"));
it("安全 query 中的编码路径完整保留",()=>expect(safeBillingPath("/zh-CN/pricing?from=%2Ftools%3Fx%3D1#credits")).toBe("/zh-CN/pricing?from=%2Ftools%3Fx%3D1#credits"));
