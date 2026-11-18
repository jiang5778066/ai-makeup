import { PlatformRoutePage, platformRouteMetadata } from "@/components/platform-route-page";
export const metadata = { ...platformRouteMetadata("/", "en"), title: { absolute: "PictoWink | AI Image & Video Creation" } };
export default function HomePage() { return <PlatformRoutePage path="/" locale="en"/>; }
