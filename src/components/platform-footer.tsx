import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { footerCandidateEntries, footerGroups, platformEntry } from "@/lib/platform-navigation";
import { PlatformBrand } from "./platform-brand";
import { PlatformLink } from "./platform-link";

export function PlatformFooter({ locale }: Readonly<{ locale: Locale }>) {
  const zh = locale === "zh-CN";
  const candidate = (id: string) => footerCandidateEntries.find((entry) => entry.id === id)!;
  return <footer className="platform-footer">
    <div className="platform-footer-grid">
      {footerGroups.map((group) => <div key={group.label.en}><h2>{group.label[locale]}</h2>{group.items.map(({ id, label }) => {
        const entry = footerCandidateEntries.find((entry) => entry.id === id) ?? platformEntry(id);
        return <PlatformLink key={id} entry={entry} locale={locale}>{label?.[locale] ?? entry.label[locale]}</PlatformLink>;
      })}</div>)}
      <div><h2>{zh ? "关于与信任" : "About & Trust"}</h2><Link href="/login">{zh ? "登录" : "Sign in"}</Link><PlatformLink entry={candidate("about")} locale={locale} /><PlatformLink entry={candidate("refund")} locale={locale} /><Link href="/legal/privacy">{zh ? "隐私声明" : "Privacy Notice"}</Link><Link href="/legal/terms">{zh ? "服务条款" : "Terms of Service"}</Link><PlatformLink entry={candidate("moderation-policy")} locale={locale} /><Link href="/legal/cookies">Cookies</Link><Link href="/legal/dmca">DMCA</Link></div>
    </div>
    <div className="platform-footer-bottom"><PlatformBrand locale={locale} /><span>Copyright © {new Date().getFullYear()} Makeup AI</span></div>
  </footer>;
}
