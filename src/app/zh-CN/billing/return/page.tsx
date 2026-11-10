import { PlatformPricingReturn } from "@/components/platform-pricing-return";
import { billingMetadata } from "@/lib/platform-billing-page";
export const dynamic = "force-dynamic";
export const metadata = billingMetadata("zh-CN", "/billing/return");
export default function ReturnPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <PlatformPricingReturn locale="zh-CN" searchParams={searchParams}/>; }
