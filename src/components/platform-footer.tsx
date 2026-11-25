import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { footerGroups, publicPlatformEntry, type FooterItem } from "@/lib/platform-navigation";
import { brand } from "@/lib/brand";
import { PlatformBrand } from "./platform-brand";
import { PlatformLink } from "./platform-link";

export function PlatformFooter({ locale }: Readonly<{ locale: Locale }>) {
  const zh = locale === "zh-CN";
  const link = ({ id, label }: FooterItem) => {
    const entry = publicPlatformEntry(id);
    return entry && <PlatformLink key={id} entry={entry} locale={locale}>{label?.[locale] ?? entry.label[locale]}</PlatformLink>;
  };
  return <footer className="platform-footer">
    <div className="platform-footer-grid">
      {footerGroups.map(({ label, items }) => {
        const links = items.map(link).filter(Boolean);
        return links.length ? <div key={label.en}><h2>{label[locale]}</h2>{links}</div> : null;
      })}
      <div><h2>{zh ? "关于与信任" : "About & Trust"}</h2><Link href="/login">{zh ? "登录" : "Sign in"}</Link>{link({ id: "about" })}{link({ id: "refund" })}<Link href="/legal/privacy">{zh ? "隐私声明" : "Privacy Notice"}</Link><Link href="/legal/terms">{zh ? "服务条款" : "Terms of Service"}</Link>{link({ id: "moderation-policy" })}<Link href="/legal/cookies">Cookies</Link><Link href="/legal/dmca">DMCA</Link></div>
    </div>
    <div className="platform-footer-bottom"><div><PlatformBrand locale={locale} /><p className="platform-brand-tagline">{brand.tagline[locale]}</p></div><span>Copyright © {new Date().getFullYear()} FrameKoi</span></div>
  </footer>;
}
