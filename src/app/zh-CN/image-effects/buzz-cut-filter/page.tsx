import type { Metadata } from "next";
import { PlatformImageEditPage, imageEditMetadata } from "@/components/platform-image-edit-page";
import type { PlatformSearchParams } from "@/lib/platform-homepage";
import { buzzCutFilterPath } from "@/lib/platform-remaining-image-edit-data";

export const metadata: Metadata = imageEditMetadata(buzzCutFilterPath, "zh-CN");

export default async function Page({ searchParams }: { searchParams: Promise<PlatformSearchParams> }) {
  return <PlatformImageEditPage path={buzzCutFilterPath} locale="zh-CN" query={await searchParams}/>;
}
