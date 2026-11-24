import type { Locale } from "@/lib/i18n";

export function SupportContact({ kind = "support", locale = "en" }: Readonly<{
  kind?: "support" | "privacy" | "copyright";
  locale?: Locale;
}>) {
  const specialized = kind === "privacy" ? process.env.PRIVACY_EMAIL : kind === "copyright" ? process.env.DMCA_EMAIL : undefined;
  const email = (specialized || process.env.SUPPORT_EMAIL || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /@(?:yourdomain|example)\.com$/i.test(email)) {
    return <span>{locale === "zh-CN" ? "客服邮箱正在配置中，正式购买暂未开放。" : "Our support email is being configured. Paid purchases are not open yet."}</span>;
  }
  return <a href={`mailto:${email}`}>{email}</a>;
}
