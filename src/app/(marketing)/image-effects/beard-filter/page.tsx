import type { Metadata } from "next";
import { PlatformImageEditPage, imageEditMetadata } from "@/components/platform-image-edit-page";
import type { PlatformSearchParams } from "@/lib/platform-homepage";
import { beardFilterPath } from "@/lib/platform-remaining-image-edit-data";

export const metadata: Metadata = imageEditMetadata(beardFilterPath, "en");

export default async function Page({ searchParams }: { searchParams: Promise<PlatformSearchParams> }) {
  return <PlatformImageEditPage path={beardFilterPath} locale="en" query={await searchParams}/>;
}
