import { Clapperboard, Compass, Crown, Drama, FolderOpen, Home, ImagePlus, Images, PersonStanding, Sparkles, WandSparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { compatibilityEntries, isEntryActive, primaryEntryIds, publicPlatformEntries, publicPlatformEntry, sidebarGroups, type PlatformEntry } from "@/lib/platform-navigation";
import { PlatformLink } from "./platform-link";

const icons = { home: Home, community: Compass, creations: FolderOpen, "video-generator": Clapperboard, "video-effects": Sparkles, dance: PersonStanding,
  "image-generator": ImagePlus, "image-effects": WandSparkles, "happy-horse": Clapperboard, seedance: Clapperboard, "gpt-image": ImagePlus, makeup: Sparkles,
  "image-styler": Images, "lip-sync": Drama, age: PersonStanding };

export function PlatformSidebar({ locale, currentPath, onNavigate, drawer = false }: Readonly<{ locale: Locale; currentPath: string; onNavigate?: () => void; drawer?: boolean }>) {
  const price = publicPlatformEntry("price");
  const compatibility = publicPlatformEntries(compatibilityEntries.map(({ id }) => id));
  const link = (entry: PlatformEntry) => {
    const { id } = entry;
    const Icon = icons[id as keyof typeof icons] ?? Sparkles;
    return <PlatformLink key={id} entry={entry} locale={locale} active={isEntryActive(entry, currentPath)} className="platform-side-link" onNavigate={onNavigate}>
      <Icon size={20} strokeWidth={2} aria-hidden="true" /><span>{entry.label[locale]}</span>
      {id === "dance" && <small className="platform-new">{locale === "zh-CN" ? "新品" : "New"}</small>}
    </PlatformLink>;
  };
  return <div className={`platform-sidebar-inner${drawer ? " platform-sidebar-in-drawer" : ""}`}>
    <nav className="platform-sidebar-scroll" aria-label={locale === "zh-CN" ? "工作台主导航" : "Workspace navigation"}>
      <div className="platform-side-primary">{publicPlatformEntries(primaryEntryIds).map(link)}</div>
      {sidebarGroups.map(({ label, ids }) => {
        const entries = publicPlatformEntries(ids);
        return entries.length ? <div className="platform-side-group" key={label.en}>
          <h2>{label[locale]}</h2>{entries.map(link)}
        </div> : null;
      })}
      {compatibility.length > 0 && <details className="platform-compatibility">
        <summary>{locale === "zh-CN" ? "实时与局部试妆" : "Live & part try-on"}</summary>
        {compatibility.map((entry) => <PlatformLink key={entry.id} entry={entry} locale={locale} active={isEntryActive(entry, currentPath)} className="platform-side-link" onNavigate={onNavigate}>{entry.label[locale]}</PlatformLink>)}
      </details>}
    </nav>
    {price && <div className="platform-sidebar-bottom"><PlatformLink entry={price} locale={locale} active={isEntryActive(price, currentPath)} className="platform-price-link" onNavigate={onNavigate}>
      <Crown size={20} aria-hidden="true" /><span>{price.label[locale]}</span>
    </PlatformLink></div>}
  </div>;
}
