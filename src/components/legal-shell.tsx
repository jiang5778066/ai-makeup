import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";

export function LegalShell({
  title,
  lastUpdated,
  currentPath,
  children
}: Readonly<{
  title: string;
  lastUpdated: string;
  currentPath: string;
  children: ReactNode;
}>) {
  return (
    <SiteShell locale="en" currentPath={currentPath}>
      <main className="container" style={{ maxWidth: 780, padding: "56px 24px 80px" }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ fontSize: "2.6rem", lineHeight: 1.05, margin: "12px 0 6px" }}>{title}</h1>
        <p style={{ color: "var(--taupe)", marginBottom: 32 }}>Last updated: {lastUpdated}</p>
        <article
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            fontSize: "1rem",
            lineHeight: 1.65,
            color: "var(--charcoal)"
          }}
        >
          {children}
        </article>
        <p
          style={{
            marginTop: 48,
            padding: 16,
            border: "1px solid var(--line)",
            background: "var(--paper)",
            fontSize: "0.9rem",
            color: "var(--charcoal)"
          }}
        >
          This page describes our paid beta operating terms. It is provided for transparency and
          should be reviewed with qualified counsel before broader public launch.
        </p>
      </main>
    </SiteShell>
  );
}
