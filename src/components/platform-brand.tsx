import Link from "next/link";
import { localizePath, type Locale } from "@/lib/i18n";

export function PlatformBrand({ locale, compact = false }: Readonly<{ locale: Locale; compact?: boolean }>) {
  return <Link className={`platform-brand${compact ? " platform-brand-compact" : ""}`} href={localizePath("/", locale)} aria-label="Makeup AI home">
    <span className="platform-brand-mark" aria-hidden="true">M</span><strong>Makeup AI</strong>
  </Link>;
}
