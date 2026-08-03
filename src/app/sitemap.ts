import type { MetadataRoute } from "next";
import { landingSlugs } from "@/lib/content";
import { locales, localizePath } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = landingSlugs
    .filter((slug) => slug !== "ai-makeup/generator" && slug !== "ai-makeup/filter")
    .map((slug) => (slug === "home" ? "/" : `/${slug}`));

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}${localizePath(path, locale)}`,
      lastModified: new Date("2026-08-03"),
      changeFrequency: "weekly" as const,
      priority: path === "/" || path === "/ai-makeup" ? 1 : 0.8
    }))
  );
}
