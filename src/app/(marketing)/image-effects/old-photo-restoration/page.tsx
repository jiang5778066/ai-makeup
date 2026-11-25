import { PlatformImageEditPage, imageEditMetadata } from "@/components/platform-image-edit-page";
import { photoRestorationPath } from "@/lib/platform-image-edit-data";
import type { Metadata } from "next";
import type { PlatformSearchParams } from "@/lib/platform-homepage";

export const metadata: Metadata = imageEditMetadata(photoRestorationPath, "en");
export default async function OldPhotoRestorationPage({ searchParams }: { searchParams: Promise<PlatformSearchParams> }) {
  return <PlatformImageEditPage path={photoRestorationPath} locale="en" query={await searchParams}/>;
}
