import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { SiteShell } from "./site-shell";
import { PlatformImageEditWorkspace } from "./platform-image-edit-workspace";
import { platformSearchQuery } from "@/lib/platform-homepage";
import {
  imageEditContent, imageStylePath, hairColorPath, isPortraitImageEditPath,
  portraitImageEditPaths, type ImageEditPath,
} from "@/lib/platform-image-edit-data";
import { alternateLanguagesForPath, localizePath, type Locale } from "@/lib/i18n";
import { brand, brandShareImage } from "@/lib/brand";
import { platformEntry, entryHref } from "@/lib/platform-navigation";
import "./platform-image-edit-page.css";

export function imageEditMetadata(path: ImageEditPath, locale: Locale): Metadata {
  const copy = imageEditContent[path];
  const canonical = localizePath(path, locale);
  const title = copy.title[locale];
  return {
    title: { absolute: `${title} | ${brand.name}` },
    description: copy.description[locale],
    alternates: { canonical, languages: { ...alternateLanguagesForPath(path), "x-default": path } },
    openGraph: { title: `${title} | ${brand.name}`, description: copy.description[locale], siteName: brand.name,
      images: [brandShareImage], url: canonical, type: "website", locale: locale === "zh-CN" ? "zh_CN" : "en_US" },
    twitter: { card: "summary_large_image", images: [brandShareImage.url], title, description: copy.description[locale] },
  };
}

export function PlatformImageEditPage({ path, locale, query = {} }: {
  path: ImageEditPath;
  locale: Locale;
  query?: Record<string, string | string[] | undefined>;
}) {
  const copy = imageEditContent[path];
  const zh = locale === "zh-CN";
  const directory = path === imageStylePath ? "/tools" : "/image-effects";
  const portrait = isPortraitImageEditPath(path);
  const related = portrait
    ? portraitImageEditPaths.filter(relatedPath => relatedPath !== path)
      .map(relatedPath => ({ href: localizePath(relatedPath, locale), label: imageEditContent[relatedPath].title[locale] }))
    : (["image-styler", "old-photo-restoration"] as const).map(platformEntry).filter(entry => entry.pathname !== path)
      .map(entry => ({ href: entryHref(entry, locale), label: entry.label[locale] }));
  return <SiteShell locale={locale} currentPath={path}><main className="platform-image-edit-page" data-portrait-image-edit={portrait ? "" : undefined} lang={locale}>
    <nav className="platform-image-edit-breadcrumb" aria-label={zh ? "面包屑导航" : "Breadcrumb"}>
      <a href={localizePath("/", locale)}>{zh ? "首页" : "Home"}</a><span aria-hidden="true">›</span>
      <a href={localizePath(directory, locale)}>{zh ? (directory === "/tools" ? "工具" : "图片特效") : (directory === "/tools" ? "Tools" : "Image Effects")}</a>
      <span aria-hidden="true">›</span><span aria-current="page">{copy.title[locale]}</span>
    </nav>
    <header className="platform-image-edit-hero">
      <div><h1>{copy.title[locale]}</h1><p>{copy.description[locale]}</p>
        <a href="#generator">{zh ? "开始编辑" : "Start editing"}<ArrowDown size={17}/></a>
      </div>
      {"illustration" in copy
        ? <figure className="platform-image-edit-illustration" id={"illustrationAnchor" in copy ? copy.illustrationAnchor : undefined}
          data-image-edit-anchor={"illustrationAnchor" in copy ? "" : undefined}>
          <Image src={copy.illustration} width={800} height={640} alt="" unoptimized/>
          <figcaption>{zh ? "FrameKoi 示意图" : "FrameKoi illustration"}</figcaption>
        </figure>
        : <div className="platform-image-edit-art" aria-hidden="true"><span className="platform-image-edit-art-ring"/>
          <span className="platform-image-edit-art-dash"/></div>}
    </header>
    <section className="platform-image-edit-main">
      <PlatformImageEditWorkspace path={path} locale={locale} initialQuery={platformSearchQuery(query).toString()}/>
    </section>
    <nav className="platform-image-edit-related" id={path === hairColorPath ? "hair-related" : undefined}
      aria-label={zh ? "相关工具" : "Related tools"}>
      {related.map(({ href, label }) => <a href={href} key={href}>
        <span>{label}</span><ArrowRight size={16}/>
      </a>)}
    </nav>
  </main></SiteShell>;
}
