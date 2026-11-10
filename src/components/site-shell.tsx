import type { Locale } from "@/lib/i18n";
import { PlatformFooter } from "./platform-footer";
import { PlatformHeader } from "./platform-header";
import { PlatformSidebar } from "./platform-sidebar";

export function SiteShell({ locale, currentPath, variant, children }: Readonly<{
  locale: Locale;
  currentPath: string;
  variant?: "marketing" | "workspace";
  children: React.ReactNode;
}>) {
  const shell = variant ?? (currentPath === "/" ? "marketing" : "workspace");
  return <div className={`platform-shell platform-shell-${shell}`}>
    <PlatformHeader locale={locale} currentPath={currentPath} variant={shell} />
    <div className="platform-frame" data-platform-background>
      {shell === "workspace" && <aside className="platform-sidebar" aria-label={locale === "zh-CN" ? "工作台导航" : "Workspace sidebar"}><PlatformSidebar locale={locale} currentPath={currentPath} /></aside>}
      <div className="platform-content">{children}<PlatformFooter locale={locale} /></div>
    </div>
  </div>;
}
