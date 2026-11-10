"use client";

import { PlatformNavigationLink as Link } from "./platform-navigation-link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { PlatformEntry } from "@/lib/platform-navigation";
import { entryHref } from "@/lib/platform-navigation";

type Props = Readonly<{ entry: PlatformEntry; locale: Locale; children?: React.ReactNode; className?: string; active?: boolean; onNavigate?: () => void }>;

export function PlatformLink({ entry, locale, children, className, active, onNavigate }: Props) {
  const [notice, setNotice] = useState(false);
  return <>
    <Link href={entryHref(entry, locale)} prefetch={entry.status === "ready" ? undefined : false} className={className}
      aria-current={active ? "page" : undefined} title={entry.status === "pending" ? (locale === "zh-CN" ? "即将推出" : "Coming soon") : undefined}
      onClick={(event) => {
        if (entry.status === "pending") { event.preventDefault(); setNotice(true); return; }
        onNavigate?.();
      }}>
      {children ?? entry.label[locale]}
    </Link>
    {notice && <div className="platform-notice" role="status">
      <span>{entry.label[locale]} · {locale === "zh-CN" ? "即将推出" : "Coming soon"}</span>
      <button type="button" onClick={() => setNotice(false)} aria-label={locale === "zh-CN" ? "关闭提示" : "Dismiss notification"}>×</button>
    </div>}
  </>;
}
