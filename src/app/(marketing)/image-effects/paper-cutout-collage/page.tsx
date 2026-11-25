import { PlatformPaperCollagePage, paperCollageMetadata } from "@/components/platform-paper-collage-page";

export const metadata = paperCollageMetadata("en");

export default function Page() {
  return <PlatformPaperCollagePage locale="en"/>;
}
