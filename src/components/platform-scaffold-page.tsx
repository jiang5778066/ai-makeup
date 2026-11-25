"use client";

import { Suspense, useState } from "react";
import { ArrowLeft, Construction } from "lucide-react";
import { brand } from "@/lib/brand";
import { localizePath, type Locale } from "@/lib/i18n";
import { directoryCards, directoryPaths } from "@/lib/platform-directory-data";
import { resolveHomepageRoute } from "@/lib/platform-homepage";
import type { PlatformEntry } from "@/lib/platform-navigation";
import { usePlatformUrl } from "./use-platform-url";
import { SiteShell } from "./site-shell";
import { PlatformTemplateGuide } from "./platform-template-guide";

type ScaffoldProps = { locale: Locale; currentPath: string; entry: PlatformEntry; initialQuery?: string };

const unavailableLabel = { en: "Currently unavailable", "zh-CN": "当前不可用" } as const;

const chineseTitles = new Map<string, string>([
  ...directoryPaths.flatMap(path => directoryCards(path).map(card => [card.entryId, card.title["zh-CN"]] as const)),
  ["christmas-ai-photo-generator", "AI 圣诞照片生成器"],
  ["hunyuanvideo-avatar", "混元视频数字人"]
]);

export function PlatformScaffoldPage(props: ScaffoldProps) {
  if (!props.entry.templateId) return <ScaffoldContent {...props}/>;

  const serverPath = `${localizePath(props.currentPath, props.locale)}${props.initialQuery ? `?${props.initialQuery}` : ""}`;
  return <Suspense fallback={<ScaffoldContent {...props}/>}>
    <ReactiveTemplate locale={props.locale} currentPath={props.currentPath} serverPath={serverPath}/>
  </Suspense>;
}

function ReactiveTemplate({ locale, currentPath, serverPath }: Pick<ScaffoldProps, "locale" | "currentPath"> & { serverPath: string }) {
  const location = new URL(usePlatformUrl(serverPath), "https://local.invalid");
  const { pathname } = location;
  const templateId = location.searchParams.get("template_id");
  // 与服务端统一采用首个重复参数，模板切换后按当前地址选择标题。
  const resolved = resolveHomepageRoute(currentPath, { template_id: templateId ?? undefined });
  const entry = resolved?.kind === "scaffold" ? resolved.entry : null;

  const active = pathname === localizePath(currentPath, locale);
  const title = active && entry ? `${entry.label[locale]} · ${unavailableLabel[locale]} | ${brand.name}` : null;
  // 原生历史切到无效查询时保留上一个有效标题。
  const [lastTitle, setLastTitle] = useState(title);
  if (title && title !== lastTitle) setLastTitle(title);

  return <>
    {active && lastTitle && <title>{lastTitle}</title>}
    <ScaffoldContent locale={locale} currentPath={currentPath} entry={entry}/>
  </>;
}

function ScaffoldContent({ locale, currentPath, entry }: Pick<ScaffoldProps, "locale" | "currentPath"> & { entry: PlatformEntry | null }) {
  if (entry?.templateId) return <PlatformTemplateGuide templateId={entry.templateId} locale={locale}/>;
  const zh = locale === "zh-CN";
  let title = entry?.label[locale] ?? (zh ? "未指定或不支持的模板" : "Missing or unsupported template");
  if (entry && zh && entry.label["zh-CN"] === entry.label.en) {
    title = chineseTitles.get(entry.id) ?? title;
  }

  return <SiteShell locale={locale} currentPath={currentPath}>
    <main className="platform-scaffold" id="generator">
      <Construction aria-hidden="true" size={36}/>
      <h1>{title}</h1>
      <strong>{unavailableLabel[locale]}</strong>
      <p>{zh ? "此功能尚未开放。你可以在工作台浏览其他功能，或使用已开放的美妆工具。" : "This feature is not available yet. Browse other features in the workspace or use the available makeup tools."}</p>
      <a className="platform-home-cta" href={localizePath("/home", locale)}>
        <ArrowLeft aria-hidden="true" size={16}/>{zh ? "返回工作台" : "Back to workspace"}
      </a>
    </main>
  </SiteShell>;
}
