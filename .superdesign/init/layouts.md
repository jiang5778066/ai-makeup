# Layouts

## `src/app/layout.tsx`
Root Next.js layout importing global CSS.

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "AI Makeup Studio",
    template: "%s | AI Makeup Studio"
  },
  description: "AI makeup generator, virtual makeup try-on, and personalized makeup advisor."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## `src/components/site-shell.tsx`
Shared navigation and footer shell.

```tsx
import { Languages, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";

export function SiteShell({
  locale,
  currentPath,
  children
}: Readonly<{
  locale: Locale;
  currentPath: string;
  children: React.ReactNode;
}>) {
  const alternateLocale: Locale = locale === "en" ? "zh-CN" : "en";
  return <div className="site-shell">{children}</div>;
}
```
