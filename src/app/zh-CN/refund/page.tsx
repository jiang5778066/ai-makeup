import { TrustPage, trustMetadata } from "@/components/trust-page";

export const metadata = trustMetadata("refund", "zh-CN");
export default function Page() { return <TrustPage section="refund" locale="zh-CN" />; }
