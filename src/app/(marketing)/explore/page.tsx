import { PlatformCommunityPage, communityMetadata } from "@/components/platform-community-page";

export const metadata = communityMetadata("en");

export default function ExplorePage() {
  return <PlatformCommunityPage locale="en" />;
}
