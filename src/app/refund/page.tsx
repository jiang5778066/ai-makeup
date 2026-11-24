import { TrustPage, trustMetadata } from "@/components/trust-page";

export const metadata = trustMetadata("refund", "en");
export default function Page() { return <TrustPage section="refund" locale="en" />; }
