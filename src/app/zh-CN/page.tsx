import { PlatformRoutePage, platformRouteMetadata } from "@/components/platform-route-page";
export const metadata = platformRouteMetadata("/", "zh-CN");
export default function HomePage() { return <PlatformRoutePage path="/" locale="zh-CN"/>; }
