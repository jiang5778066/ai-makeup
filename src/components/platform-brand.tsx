import Link from "next/link";
import { localizePath, type Locale } from "@/lib/i18n";
import { brand } from "@/lib/brand";

export function PictoWinkMark({ className, size = 32 }: { className?: string; size?: number }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="9" fill="#6D4AFF" />
    <path d="M10 8H8a2 2 0 0 0-2 2v3m16-5h2a2 2 0 0 1 2 2v3M6 21v2a2 2 0 0 0 2 2h3m15-4v2a2 2 0 0 1-2 2h-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="15" r="1.7" fill="white" />
    <path d="m19 14 3 2-3 1m-7 3q4 3 8 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function PlatformBrand({ locale, compact = false }: Readonly<{ locale: Locale; compact?: boolean }>) {
  return <Link className={`platform-brand${compact ? " platform-brand-compact" : ""}`} href={localizePath("/", locale)} aria-label={locale === "zh-CN" ? `${brand.name} 首页` : `${brand.name} home`}>
    <PictoWinkMark className="platform-brand-mark" /><strong>{brand.name}</strong>
  </Link>;
}
