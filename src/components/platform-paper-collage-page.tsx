import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { alternateLanguagesForPath, localizePath, type Locale } from "@/lib/i18n";
import { imageStylePath } from "@/lib/platform-image-edit-data";
import { paperCollageArt, paperCollagePath } from "@/lib/platform-paper-collage";
import { SiteShell } from "./site-shell";
import "./platform-image-edit-page.css";

const copy = {
  en: {
    title: "Paper Cutout Collage",
    description: "Build an illustration from layered paper shapes, visible cut edges and a limited color palette.",
    status: "This guide shows an original FrameKoi illustration. For a photo edit, try Flat illustration in Image Style Converter.",
    directory: "Image Effects",
    cta: "Open Image Style Converter",
    illustration: "FrameKoi illustration",
  },
  "zh-CN": {
    title: "纸片拼贴插画",
    description: "用层叠的纸片色块、清晰的剪裁边缘和少量配色构成插画。",
    status: "这里展示 FrameKoi 自绘示意图。要处理自己的照片，可在图片风格转换中试用扁平插画。",
    directory: "图片特效",
    cta: "打开图片风格转换",
    illustration: "FrameKoi 示意图",
  },
} as const;

export function paperCollageMetadata(locale: Locale): Metadata {
  const { title, description } = copy[locale];
  const canonical = localizePath(paperCollagePath, locale);
  return {
    title: { absolute: `${title} | ${brand.name}` },
    description,
    alternates: { canonical, languages: { ...alternateLanguagesForPath(paperCollagePath), "x-default": paperCollagePath } },
    openGraph: { title: `${title} | ${brand.name}`, description, url: canonical, siteName: brand.name,
      images: [{ url: paperCollageArt, width: 800, height: 640 }], type: "website", locale: locale === "zh-CN" ? "zh_CN" : "en_US" },
  };
}

export function PlatformPaperCollagePage({ locale }: { locale: Locale }) {
  const { title, description, status, directory, cta, illustration } = copy[locale];
  return <SiteShell locale={locale} currentPath={paperCollagePath}>
    <main className="platform-image-edit-page" data-portrait-image-edit lang={locale}>
      <nav className="platform-image-edit-breadcrumb" aria-label={locale === "zh-CN" ? "面包屑导航" : "Breadcrumb"}>
        <a href={localizePath("/image-effects", locale)}>{directory}</a>
        <span aria-hidden="true">›</span><span aria-current="page">{title}</span>
      </nav>
      <header className="platform-image-edit-hero">
        <div>
          <h1>{title}</h1><p>{description}</p><p>{status}</p>
          <a id="generator" data-image-edit-anchor href={`${localizePath(imageStylePath, locale)}?style=flat-illustration#generator`}>
            {cta}<ArrowRight size={17}/>
          </a>
        </div>
        <figure className="platform-image-edit-illustration">
          <Image src={paperCollageArt} width={800} height={640} alt="" unoptimized/>
          <figcaption>{illustration}</figcaption>
        </figure>
      </header>
    </main>
  </SiteShell>;
}
