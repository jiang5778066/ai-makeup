import { VideoReframePage } from "@/components/platform-video-reframe-page";
import { videoReframeMetadata } from "@/lib/platform-video-reframe-data";

export const metadata = videoReframeMetadata("en");

export default function Page() {
  return <VideoReframePage locale="en" />;
}
