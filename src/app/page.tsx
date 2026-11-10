import { PlatformRoutePage, platformRouteMetadata } from "@/components/platform-route-page";
export const metadata = platformRouteMetadata("/", "en");
export default function HomePage() { return <PlatformRoutePage path="/" locale="en"/>; }
