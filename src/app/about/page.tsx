import { TrustPage, trustMetadata } from "@/components/trust-page";

export const metadata = trustMetadata("about", "en");
export default function Page() { return <TrustPage section="about" locale="en" />; }
