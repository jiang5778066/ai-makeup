import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { PlatformNavigationProvider } from "@/components/platform-navigation-link";

import { siteUrl } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PictoWink | AI Image & Video Creation",
    template: "%s | PictoWink"
  },
  description: "Explore AI image and video tools, compare settings, and plan your next visual. Generation availability is shown in each tool.",
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  applicationName: "PictoWink"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-page-locale") === "zh-CN" ? "zh-CN" : "en";
  return (
    <html lang={locale}>
      <body><PlatformNavigationProvider>{children}</PlatformNavigationProvider></body>
    </html>
  );
}
