import { redirectToPaperCollage } from "@/lib/platform-paper-collage";
import type { PlatformSearchParams } from "@/lib/platform-homepage";

export default async function Page({ searchParams }: { searchParams: Promise<PlatformSearchParams> }) {
  redirectToPaperCollage(await searchParams, "en");
}
