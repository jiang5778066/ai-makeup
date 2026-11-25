import { PlatformPaperCollagePage, paperCollageMetadata } from "@/components/platform-paper-collage-page";

export const metadata = paperCollageMetadata("zh-CN");

export default function Page() {
  return <PlatformPaperCollagePage locale="zh-CN"/>;
}
