import { PlatformPricingLoginLink } from "./platform-pricing-login-link";
import { Check, Coins, ArrowUpRight, ShieldCheck } from "lucide-react";
import { localizePath, type Locale } from "@/lib/i18n";
import { SiteShell } from "./site-shell";
import { CheckoutButtons } from "./checkout-buttons";
import styles from "./platform-pricing-page.module.css";

export function PlatformPricingPage({ locale, available }: { locale: Locale; available: boolean }) {
  const zh = locale === "zh-CN";
  return <SiteShell locale={locale} currentPath="/pricing"><main className={styles.page} lang={locale}>
    <nav className={styles.breadcrumb}><a href={localizePath("/", locale)}>{zh ? "首页" : "Home"}</a><span>/</span><span>{zh ? "价格与积分" : "Pricing & credits"}</span></nav>
    <header className={styles.hero}><span className={styles.eyebrow}><Coins size={15}/>{zh ? "按需购买 · 清晰计费" : "PAY AS YOU GO"}</span><h1>{zh ? <>需要多少，<br/><em>就购买多少。</em></> : <>A little credit.<br/><em>Room to create.</em></>}</h1><p>{zh ? "一次性积分包，没有订阅。了解积分如何使用，再决定是否购买。" : "One simple credit pack. No subscription. Understand your credits before you buy."}</p></header>
    <div className={styles.grid} id="credits">
      <article className={styles.starter}><span className={styles.eyebrow}>{zh ? "新账户" : "A FIRST LOOK"}</span><h2>{zh ? "免费开始" : "Start free"}</h2><p className={styles.price}>$0</p><p className={styles.quantity}>{zh ? "注册赠送 3 积分" : "3 signup credits"}</p><p>{zh ? "每个新账户仅发放一次，不会每日或每月重置。" : "Granted once per new account. No daily or monthly reset."}</p><PlatformPricingLoginLink className={styles.secondary} nextPath={localizePath("/pricing", locale)}>{zh ? "免费注册" : "Create an account"}<ArrowUpRight size={17}/></PlatformPricingLoginLink></article>
      <article className={styles.pack}><span className={styles.badge}>{zh ? "唯一积分套餐" : "ONE-TIME PACK"}</span><span className={styles.eyebrow}>{zh ? "创作积分" : "CREATIVE CREDIT"}</span><h2>{zh ? "100 积分" : "100 credits"}</h2><p className={styles.price}>$8 <small>USD / {zh ? "一次性" : "one time"}</small></p><p>{zh ? "按需充值，无自动续费。积分不是生成次数。" : "Top up when you need to. No automatic renewal. Credits are not a count of generations."}</p><ul><li><Check size={16}/>{zh ? "服务器确认付款后入账" : "Added after verified payment"}</li><li><Check size={16}/>{zh ? "保留积分使用与退款记录" : "Credit usage and refund records"}</li></ul><CheckoutButtons planId="credits_100" cta={zh ? "购买 100 积分" : "Buy 100 credits"} locale={locale} available={available}/></article>
    </div>
    <section className={styles.rules}><div><ShieldCheck size={23}/><h2>{zh ? "每一积分，都说清楚" : "Know what a credit means"}</h2></div><dl><div><dt>{zh ? "美妆生成" : "Makeup generation"}</dt><dd>{zh ? "当前每次美妆生成扣 1 积分。明确失败仅退回本次扣除的积分一次。" : "Each makeup generation currently costs 1 credit. An explicit failure returns that generation's credits once."}</dd></div><div><dt>{zh ? "图片与视频" : "Images & video"}</dt><dd>{zh ? "通用图片与视频生成尚未开放计费，不承诺固定次数或无限使用。" : "General image and video generation billing is not available. No fixed generation count or unlimited use is promised."}</dd></div><div><dt>{zh ? "退款与争议" : "Refunds & disputes"}</dt><dd>{zh ? "需要核对付款与该笔积分使用情况；已使用积分的订单进入人工核对。" : "Payment and the purchased credit lot must be checked. Orders with used credits require review."}</dd></div></dl></section>
    <p className={styles.note}>{zh ? "已经完成结账？" : "Already returned from checkout?"} <a href={localizePath("/billing/return", locale)}>{zh ? "查看付款确认与余额" : "Check payment confirmation & balance"} →</a></p>
  </main></SiteShell>;
}
