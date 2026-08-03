import type { Metadata } from "next";
import type { LandingPage } from "./content";
import type { Locale } from "./i18n";
import { alternateLanguagesForPath, localizePath } from "./i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function metadataForPage(page: LandingPage, locale: Locale, path: string): Metadata {
  const alternates = alternateLanguagesForPath(path);
  const absoluteAlternates = Object.fromEntries(
    Object.entries(alternates).map(([key, value]) => [key, `${siteUrl}${value}`])
  );
  absoluteAlternates["x-default"] = `${siteUrl}${localizePath(path, "en")}`;

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    keywords: page.keywords,
    alternates: {
      canonical: `${siteUrl}${localizePath(path, locale)}`,
      languages: absoluteAlternates
    },
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      url: `${siteUrl}${localizePath(path, locale)}`,
      siteName: "AI Makeup Studio",
      locale,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle,
      description: page.seoDescription
    }
  };
}

export function pageSchemas(page: LandingPage, locale: Locale, path: string) {
  const url = `${siteUrl}${localizePath(path, locale)}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: page.title,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript and a modern browser",
      isAccessibleForFree: true,
      featureList: page.sections,
      offers: [
        { "@type": "Offer", name: "Free signup results", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "100 generation credit pack", price: "8", priceCurrency: "USD" }
      ],
      url
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: page.h1,
      step: [
        { "@type": "HowToStep", name: locale === "zh-CN" ? "上传自拍" : "Upload a selfie" },
        { "@type": "HowToStep", name: locale === "zh-CN" ? "选择妆容风格" : "Choose a makeup style" },
        { "@type": "HowToStep", name: locale === "zh-CN" ? "生成并下载结果" : "Generate and download the result" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "AI Makeup Studio",
          item: `${siteUrl}${localizePath("/", locale)}`
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.title,
          item: url
        }
      ]
    }
  ];
}
