import { PlatformCommunityPage, communityMetadata } from "@/components/platform-community-page";

export const metadata = communityMetadata("zh-CN");

export default function ChineseExplorePage() {
  return <PlatformCommunityPage locale="zh-CN" />;
}
