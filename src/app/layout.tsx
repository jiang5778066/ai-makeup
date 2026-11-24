import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { PlatformNavigationProvider } from "@/components/platform-navigation-link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.framekoi.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FrameKoi | AI Image and Video Creation",
    template: "%s | FrameKoi"
  },
  description: "Explore AI image and video creation tools, visual effects, and available makeup previews. Feature availability is shown on each tool.",
  applicationName: "FrameKoi"
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
