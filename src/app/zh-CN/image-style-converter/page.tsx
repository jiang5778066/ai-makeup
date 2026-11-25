import { PlatformImageEditPage, imageEditMetadata } from "@/components/platform-image-edit-page";
import { imageStylePath } from "@/lib/platform-image-edit-data";
import type { Metadata } from "next";
import type { PlatformSearchParams } from "@/lib/platform-homepage";

export const metadata: Metadata = imageEditMetadata(imageStylePath, "zh-CN");
export default async function ImageStyleConverterPage({ searchParams }: { searchParams: Promise<PlatformSearchParams> }) {
  return <PlatformImageEditPage path={imageStylePath} locale="zh-CN" query={await searchParams}/>;
}
