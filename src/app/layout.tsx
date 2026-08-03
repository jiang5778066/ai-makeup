import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Makeup AI | Live Virtual Try-On and AI Makeup",
    template: "%s | Makeup AI"
  },
  description: "Try full-face AI makeup and nine live virtual makeup effects on your photo or camera. Three free HD results, then $8 for 100.",
  applicationName: "Makeup AI"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-page-locale") === "zh-CN" ? "zh-CN" : "en";
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
