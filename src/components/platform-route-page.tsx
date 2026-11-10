import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getLandingPage, slugFromPath } from "@/lib/content";
import { platformSearchQuery, resolveHomepageRoute, type PlatformSearchParams } from "@/lib/platform-homepage";
import { platformHomepageMetadata, platformHomepageSchemas } from "@/lib/platform-homepage-seo";
import { metadataForPage, pageSchemas } from "@/lib/seo";
import { PlatformLandingPage } from "./platform-landing-page";
import { PlatformWorkspacePage } from "./platform-workspace-page";
import { PlatformScaffoldPage } from "./platform-scaffold-page";
import { LandingPage } from "./landing-page";
import { PlatformDirectoryPage } from "./platform-directory-page";
import { PlatformGeneratorPage } from "./platform-generator-page";
import { generatorPages } from "@/lib/platform-generator-data";
import { PlatformWanModelPage } from "./platform-wan-model-page";
import { wanTitle } from "@/lib/platform-wan-model-data";
import { directoryContent } from "@/lib/platform-directory-data";
import { videoModelPages } from "@/lib/platform-video-model-data";
import { PlatformVideoModelPage } from "./platform-video-model-page";
import { rootGeneratorPages } from "@/lib/platform-root-generator-data";
import { PlatformRootGeneratorPage } from "./platform-root-generator-page";

import { PlatformDreamfacePage } from "./platform-dreamface-page";

export function platformRouteMetadata(path: string, locale: Locale, searchParams: PlatformSearchParams = {}) {
  const route = resolveHomepageRoute(path, searchParams);
  if (route?.kind === "landing" || route?.kind === "workspace") return platformHomepageMetadata(locale, route.kind === "workspace");
  if (route?.kind === "dreamface") return { title: `DreamFace AI ${locale === "zh-CN" ? "视频生成器" : "Video Generator"} · Makeup AI`, description: locale === "zh-CN" ? "DreamFace公开功能介绍与本地参数预览；当前型号单独标识，生成服务尚未开放。" : "DreamFace public product information and local settings previews, with the current model identified separately. Generation is not available yet.", alternates: { canonical: `${locale === "zh-CN" ? "/zh-CN" : ""}${route.path}` } };
  if (route?.kind === "root-generator") {
    const page = rootGeneratorPages[route.path];
    return { title: `${page.title[locale]} · Makeup AI`, description: locale === "zh-CN" ? `${page.title[locale]}：模型介绍与公开示例。通用生成器入口不代表该型号已接入，生成服务尚未开放。` : `${page.title[locale]}: model information and public examples. A link to the general generator does not imply model availability. Generation is not available yet.`, alternates: { canonical: `${locale === "zh-CN" ? "/zh-CN" : ""}${route.path}` } };
  }
  if (route?.kind === "video-model") { const page = videoModelPages[route.path]; return { title: `${page.title[locale]} · Makeup AI`, description: locale === "zh-CN" ? `${page.title[locale]}：公开模型资料与本地参数预览。${route.path==='/ai-video-models/grok-imagine'?'本站视频能力以生成面板为准。':'生成服务尚未开放。'}` : `${page.title[locale]}: public model information and local parameter preview. ${route.path==='/ai-video-models/grok-imagine'?'Site video availability is shown in the generation panel.':'Generation is not available yet.'}`, alternates: { canonical: `${locale === "zh-CN" ? "/zh-CN" : ""}${page.canonical}` } }; }
  if (route?.kind === "wan") return { title: wanTitle(route.path, locale), description: locale === "zh-CN" ? `${wanTitle(route.path, locale)}：公开模型资料、示例与参数预览。视频生成暂不可用。` : `${wanTitle(route.path, locale)}: public model information, examples and settings. Video generation is not available.`, alternates: { canonical: `${locale === "zh-CN" ? "/zh-CN" : ""}${route.path}` } };
  if (route?.kind === "generator") { const page = generatorPages[route.path]; const siteImage=page.kind==='image'&&page.family!=='nano',siteVideo=route.path==='/ai-video-generator'; return { title: `${page.title[locale]} · Makeup AI`, description: locale === "zh-CN" ? `${page.title[locale]}：公开模型资料与本地参数、文件预览。${siteImage?'本站图片能力以生成面板为准。':siteVideo?'本站视频能力以生成面板为准。':'生成服务尚未开放。'}` : `${page.title[locale]}: public model information and local parameter and file previews. ${siteImage?'Site image availability is shown in the generation panel.':siteVideo?'Site video availability is shown in the generation panel.':'Generation is not available yet.'}`, alternates: { canonical: `${locale === "zh-CN" ? "/zh-CN" : ""}${route.path}` } }; }
  if (route?.kind === "directory") { const page = directoryContent[route.path]; return { title: `${page.title[locale]} · Makeup AI`, description: page.description[locale], alternates: { canonical: `${locale === "zh-CN" ? "/zh-CN" : ""}${route.path}` } }; }
  if (route?.kind === "scaffold") return { title: `${route.entry.label[locale]} · ${locale === "zh-CN" ? "当前不可用" : "Currently unavailable"}`, robots: { index: false, follow: true } };
  const slug = slugFromPath(path);
  return slug ? metadataForPage(getLandingPage(slug, locale), locale, path) : {};
}
export function PlatformRoutePage({ path, locale, searchParams = {} }: { path: string; locale: Locale; searchParams?: PlatformSearchParams }) {
  const route = resolveHomepageRoute(path, searchParams);
  if (route?.kind === "dreamface") return <PlatformDreamfacePage locale={locale} initialQuery={platformSearchQuery(searchParams).toString()}/>;
  if (route?.kind === "workspace") return <PlatformWorkspacePage locale={locale} currentPath={path}/>;
  if (route?.kind === "root-generator") return <PlatformRootGeneratorPage key={route.path} path={route.path} locale={locale}/>;
  if (route?.kind === "video-model") return <PlatformVideoModelPage path={route.path} locale={locale} initialQuery={platformSearchQuery(searchParams).toString()}/>;
  if (route?.kind === "wan") return <PlatformWanModelPage path={route.path} locale={locale} initialQuery={platformSearchQuery(searchParams).toString()}/>;
  if (route?.kind === "generator") return <PlatformGeneratorPage path={route.path} locale={locale} initialQuery={platformSearchQuery(searchParams).toString()}/>;
  if (route?.kind === "directory") return <PlatformDirectoryPage path={route.path} locale={locale}/>;
  if (route?.kind === "scaffold") return <PlatformScaffoldPage locale={locale} currentPath={path} entry={route.entry} initialQuery={platformSearchQuery(searchParams).toString()}/>;
  if (route?.kind === "landing") return <><PlatformLandingPage locale={locale} currentPath={path}/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(platformHomepageSchemas(locale)) }}/></>;
  const slug = slugFromPath(path);
  if (!slug) notFound();
  const page = getLandingPage(slug, locale);
  return <><LandingPage locale={locale} currentPath={path} page={page}/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchemas(page, locale, path)) }}/></>;
}
