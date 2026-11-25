import { permanentRedirect } from "next/navigation";
import { localizePath, type Locale } from "./i18n";
import { platformSearchQuery, type PlatformSearchParams } from "./platform-homepage";

export const paperCollagePath = "/image-effects/paper-cutout-collage";
export const paperCollageArt = "/platform/directories/framekoi-paper-cutout-collage-illustration.webp";

export function redirectToPaperCollage(searchParams: PlatformSearchParams, locale: Locale) {
  const query = platformSearchQuery(searchParams);
  permanentRedirect(`${localizePath(paperCollagePath, locale)}${query.size ? `?${query}` : ""}`);
}
