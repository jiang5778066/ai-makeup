import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/supabase/server";
import { SiteShell } from "./site-shell";
import { PlatformPricingFeedback } from "./platform-pricing-feedback";
import styles from "./platform-pricing-page.module.css";
export async function PlatformPricingReturn({ locale, searchParams }: { locale: Locale; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  // order_id 仅作候选查询键，绝不作为付款证明；其它返回参数不用于记账。
  const orderId = typeof query.order_id === "string" && query.order_id.length <= 255 ? query.order_id : null;
  const user = await getCurrentUser();
  return <SiteShell locale={locale} currentPath="/pricing"><main className={styles.page}><header className={styles.hero}><span className={styles.eyebrow}>{locale === "zh-CN" ? "结账返回" : "CHECKOUT RETURN"}</span><h1>{locale === "zh-CN" ? "确认你的积分" : "Check your credits"}</h1></header><PlatformPricingFeedback locale={locale} userId={user?.id ?? null} orderId={orderId}/><p className={styles.note}><a href={localizePath("/pricing", locale)}>← {locale === "zh-CN" ? "返回价格页" : "Back to pricing"}</a></p></main></SiteShell>;
}
