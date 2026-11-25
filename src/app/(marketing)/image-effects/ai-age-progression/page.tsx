import { PlatformImageEditPage, imageEditMetadata } from "@/components/platform-image-edit-page";
import { ageProgressionPath } from "@/lib/platform-image-edit-data";
import type { Metadata } from "next";
import type { PlatformSearchParams } from "@/lib/platform-homepage";

export const metadata: Metadata = imageEditMetadata(ageProgressionPath, "en");
export default async function AgeProgressionPage({ searchParams }: { searchParams: Promise<PlatformSearchParams> }) {
  return <PlatformImageEditPage path={ageProgressionPath} locale="en" query={await searchParams}/>;
}
