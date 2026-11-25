import { PlatformImageEditPage, imageEditMetadata } from "@/components/platform-image-edit-page";
import { hairColorPath } from "@/lib/platform-image-edit-data";
import type { Metadata } from "next";
import type { PlatformSearchParams } from "@/lib/platform-homepage";

export const metadata: Metadata = imageEditMetadata(hairColorPath, "zh-CN");
export default async function HairColorPage({ searchParams }: { searchParams: Promise<PlatformSearchParams> }) {
  return <PlatformImageEditPage path={hairColorPath} locale="zh-CN" query={await searchParams}/>;
}
