import { PlatformImageEditPage, imageEditMetadata } from "@/components/platform-image-edit-page";
import { hairStylePath } from "@/lib/platform-image-edit-data";
import type { Metadata } from "next";
import type { PlatformSearchParams } from "@/lib/platform-homepage";

export const metadata: Metadata = imageEditMetadata(hairStylePath, "en");
export default async function HairStylePage({ searchParams }: { searchParams: Promise<PlatformSearchParams> }) {
  return <PlatformImageEditPage path={hairStylePath} locale="en" query={await searchParams}/>;
}
