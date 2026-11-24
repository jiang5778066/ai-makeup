import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";
import type { Locale } from "@/lib/i18n";

export function LegalShell({
  title,
  lastUpdated,
  currentPath,
  locale = "en",
  children
}: Readonly<{
  title: string;
  lastUpdated: string;
  currentPath: string;
  locale?: Locale;
  children: ReactNode;
}>) {
  return (
    <SiteShell locale={locale} currentPath={currentPath}>
      <main className="container" style={{ maxWidth: 780, padding: "56px 24px 80px" }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ fontSize: "2.6rem", lineHeight: 1.05, margin: "12px 0 6px" }}>{title}</h1>
        <p style={{ color: "#a1a1aa", marginBottom: 32 }}>{locale === "zh-CN" ? "更新日期：" : "Last updated: "}{lastUpdated}</p>
        <article
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            fontSize: "1rem",
            lineHeight: 1.65,
            color: "#e5e7eb"
          }}
        >
          {children}
        </article>
      </main>
    </SiteShell>
  );
}
