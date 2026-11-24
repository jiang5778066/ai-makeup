import { TrustPage, trustMetadata } from "@/components/trust-page";

export const metadata = trustMetadata("about", "zh-CN");
export default function Page() { return <TrustPage section="about" locale="zh-CN" />; }
