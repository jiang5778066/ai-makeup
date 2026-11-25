import { PlatformImageEditPage, imageEditMetadata } from "@/components/platform-image-edit-page";
import { ageProgressionPath } from "@/lib/platform-image-edit-data";
import type { Metadata } from "next";
import type { PlatformSearchParams } from "@/lib/platform-homepage";

export const metadata: Metadata = imageEditMetadata(ageProgressionPath, "zh-CN");
export default async function AgeProgressionPage({ searchParams }: { searchParams: Promise<PlatformSearchParams> }) {
  return <PlatformImageEditPage path={ageProgressionPath} locale="zh-CN" query={await searchParams}/>;
}
