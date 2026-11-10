import { PlatformPricingPage } from "@/components/platform-pricing-page";
import { billingAvailable, billingMetadata } from "@/lib/platform-billing-page";
export const dynamic = "force-dynamic";
export const metadata = billingMetadata("zh-CN");
export default function PricingPage() { return <PlatformPricingPage locale="zh-CN" available={billingAvailable()}/>; }
