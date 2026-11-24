import { TrustPage, trustMetadata } from "@/components/trust-page";

export const metadata = trustMetadata("content-moderation-policy", "zh-CN");
export default function Page() { return <TrustPage section="content-moderation-policy" locale="zh-CN" />; }
