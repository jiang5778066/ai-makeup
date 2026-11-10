import { Clapperboard, Compass, Crown, Drama, FolderOpen, Home, ImagePlus, Images, PersonStanding, Sparkles, WandSparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { compatibilityEntries, isEntryActive, platformEntry, primaryEntryIds, sidebarGroups } from "@/lib/platform-navigation";
import { PlatformLink } from "./platform-link";

const icons = { home: Home, community: Compass, creations: FolderOpen, "video-generator": Clapperboard, "video-effects": Sparkles, dance: PersonStanding,
  "image-generator": ImagePlus, "image-effects": WandSparkles, "happy-horse": Clapperboard, seedance: Clapperboard, "gpt-image": ImagePlus, makeup: Sparkles,
  "image-styler": Images, "lip-sync": Drama, age: PersonStanding };

export function PlatformSidebar({ locale, currentPath, onNavigate, drawer = false }: Readonly<{ locale: Locale; currentPath: string; onNavigate?: () => void; drawer?: boolean }>) {
  const link = (id: string) => {
    const entry = platformEntry(id); const Icon = icons[id as keyof typeof icons] ?? Sparkles;
    return <PlatformLink key={id} entry={entry} locale={locale} active={isEntryActive(entry, currentPath)} className="platform-side-link" onNavigate={onNavigate}>
      <Icon size={20} strokeWidth={2} aria-hidden="true" /><span>{entry.label[locale]}</span>
      {id === "dance" && <small className="platform-new">{locale === "zh-CN" ? "新品" : "New"}</small>}
    </PlatformLink>;
  };
  return <div className={`platform-sidebar-inner${drawer ? " platform-sidebar-in-drawer" : ""}`}>
    <nav className="platform-sidebar-scroll" aria-label={locale === "zh-CN" ? "工作台主导航" : "Workspace navigation"}>
      <div className="platform-side-primary">{primaryEntryIds.map(link)}</div>
      {sidebarGroups.map((group) => <div className="platform-side-group" key={group.label.en}>
        <h2>{group.label[locale]}</h2>{group.ids.map(link)}
      </div>)}
      <details className="platform-compatibility">
        <summary>{locale === "zh-CN" ? "实时与局部试妆" : "Live & part try-on"}</summary>
        {compatibilityEntries.map((entry) => <PlatformLink key={entry.id} entry={entry} locale={locale} active={isEntryActive(entry, currentPath)} className="platform-side-link" onNavigate={onNavigate}>{entry.label[locale]}</PlatformLink>)}
      </details>
    </nav>
    <div className="platform-sidebar-bottom"><PlatformLink entry={platformEntry("price")} locale={locale} active={isEntryActive(platformEntry("price"), currentPath)} className="platform-price-link" onNavigate={onNavigate}>
      <Crown size={20} aria-hidden="true" /><span>{platformEntry("price").label[locale]}</span>
    </PlatformLink></div>
  </div>;
}
