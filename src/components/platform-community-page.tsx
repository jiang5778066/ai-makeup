import type { Metadata } from "next";
import { alternateLanguagesForPath, localizePath, type Locale } from "@/lib/i18n";
import { getCommunityExamples } from "@/lib/platform-community-data";
import { PlatformCommunityGallery } from "./platform-community-gallery";
import { SiteShell } from "./site-shell";
import styles from "./platform-community.module.css";

const path = "/explore";
const pageCopy = {
  en: {
    title: "Community showcase",
    description: "Explore FrameKoi’s AI makeup illustrations, from everyday looks to creative styles. The portraits are makeup references and do not show actual product results."
  },
  "zh-CN": {
    title: "社区作品展示",
    description: "浏览 FrameKoi 的 AI 妆容示例，从日常妆到创意造型。虚拟人像仅作妆容参考，不代表真实产品效果。"
  }
};

export function communityMetadata(locale: Locale): Metadata {
  return {
    ...pageCopy[locale],
    alternates: {
      canonical: localizePath(path, locale),
      languages: { ...alternateLanguagesForPath(path), "x-default": path }
    }
  };
}

export function PlatformCommunityPage({ locale }: { locale: Locale }) {
  const { title, description } = pageCopy[locale];
  return (
    <SiteShell locale={locale} currentPath={path}>
      <main className={styles.page}>
        <header className={styles.intro}>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <PlatformCommunityGallery locale={locale} examples={getCommunityExamples(locale)} />
      </main>
    </SiteShell>
  );
}
