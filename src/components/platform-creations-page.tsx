import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { creationFilters, type CreationFilter } from "@/lib/platform-creations-types";
import { PlatformCreationsPanel } from "./platform-creations-panel";
import { SiteShell } from "./site-shell";
export const PlatformCreationsPage = ({ locale, filter = "all", path = "/my-creations" }: { locale: Locale; filter?: string; path?: string }) => <SiteShell locale={locale} currentPath="/my-creations"><PlatformCreationsPanel key={`${locale}:${filter}`} locale={locale} path={localizePath(path, locale)} initialFilter={creationFilters.includes(filter as CreationFilter) ? filter as CreationFilter : "all"}/></SiteShell>;
