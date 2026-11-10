import {afterEach,beforeEach,expect,it,vi} from "vitest";
let billingConfiguration: typeof import("./platform-billing-config").billingConfiguration;
beforeEach(async()=>{vi.resetModules();for(const[k,v]of Object.entries({ENABLE_CHECKOUT:"1",DISABLE_CHECKOUT:"0",CREEM_API_KEY:"synthetic",CREEM_PRODUCT_CREDITS_100:"synthetic_product",CREEM_WEBHOOK_SECRET:"synthetic_secret",CREEM_API_BASE:"https://api.creem.io",NEXT_PUBLIC_SITE_URL:"https://synthetic.invalid"}))vi.stubEnv(k,v);({billingConfiguration}=await import("./platform-billing-config"));});afterEach(()=>vi.unstubAllEnvs());
it("配置齐备且开关允许才就绪",()=>{expect(billingConfiguration()?.siteUrl).toBe("https://synthetic.invalid");vi.stubEnv("DISABLE_CHECKOUT","1");expect(billingConfiguration()).toBeNull();});
it.each(["CREEM_WEBHOOK_SECRET","CREEM_API_KEY","CREEM_PRODUCT_CREDITS_100"])("缺%s不就绪",key=>{vi.stubEnv(key,"");expect(billingConfiguration()).toBeNull();});
it.each(["http://remote.invalid","https://user:password@synthetic.invalid","https://synthetic.invalid/subpath","https://synthetic.invalid/?q=1"])("不可信site%s不就绪",url=>{vi.stubEnv("NEXT_PUBLIC_SITE_URL",url);expect(billingConfiguration()).toBeNull();});
