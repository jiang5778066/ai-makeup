import {render,screen} from "@testing-library/react";
import {expect,it,vi} from "vitest";
import {PlatformPricingPage} from "./platform-pricing-page";
import {billingMetadata} from "@/lib/platform-billing-page";
vi.mock("./site-shell",()=>({SiteShell:({children}:{children:React.ReactNode})=><>{children}</>}));
it.each(["en","zh-CN"] as const)("%s 唯一真实价格和关闭反馈",locale=>{render(<PlatformPricingPage locale={locale} available={false}/>);expect(screen.getByRole("button")).toBeDisabled();expect(screen.getByRole("main")).toHaveTextContent("$8");expect(screen.getByRole("main")).not.toHaveTextContent(/100 generations|100 次|40 free|unlimited use included/i);});
it("metadata 仅由根模板加一次品牌且有双语 alternate",()=>{const metadata=billingMetadata("zh-CN");expect(metadata.title).toBe("价格与积分");expect(metadata.alternates).toEqual({canonical:"/zh-CN/pricing",languages:{en:"/pricing","zh-CN":"/zh-CN/pricing"}});});
it("价格页免费注册保留当前中文query与hash",()=>{window.history.replaceState({},"","/zh-CN/pricing?source=menu#credits");render(<PlatformPricingPage locale="zh-CN" available={false}/>);expect(screen.getByRole("link",{name:"免费注册"})).toHaveAttribute("href","/login?"+new URLSearchParams({next:"/zh-CN/pricing?source=menu#credits"}));window.history.replaceState({},"","/");});
