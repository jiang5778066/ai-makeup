import { TrustPage, trustMetadata } from "@/components/trust-page";

export const metadata = trustMetadata("content-moderation-policy", "en");
export default function Page() { return <TrustPage section="content-moderation-policy" locale="en" />; }
