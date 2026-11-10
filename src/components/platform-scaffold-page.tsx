"use client";

import { Suspense } from "react";
import { ArrowLeft, Construction } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import type { PlatformEntry } from "@/lib/platform-navigation";
import { resolveHomepageRoute } from "@/lib/platform-homepage";
import { usePlatformUrl } from "./use-platform-url";
import { SiteShell } from "./site-shell";

type ScaffoldProps = { locale: Locale; currentPath: string; entry: PlatformEntry; initialQuery?: string };
export function PlatformScaffoldPage(props: ScaffoldProps) {
  const serverPath = `${localizePath(props.currentPath, props.locale)}${props.initialQuery ? `?${props.initialQuery}` : ""}`;
  return <Suspense fallback={<ScaffoldContent {...props} locationPath={serverPath}/>}><ReactiveScaffold {...props} serverPath={serverPath}/></Suspense>;
}
function ReactiveScaffold(props: ScaffoldProps & { serverPath: string }) {
  const locationPath = usePlatformUrl(props.serverPath);
  return <ScaffoldContent {...props} locationPath={locationPath}/>;
}
function ScaffoldContent({ locale, currentPath, entry, locationPath }: ScaffoldProps & { locationPath: string }) {
  const query = new URL(locationPath, "https://local.invalid").searchParams;
  // 与服务端统一采用首个重复参数；客户端过渡时也不能沿用旧模板标题。
  const resolved = resolveHomepageRoute(currentPath, { template_id: query.get("template_id") ?? undefined });
  const selected = resolved?.kind === "scaffold" ? resolved.entry : null;
  const title = selected?.label[locale] ?? (locale === "zh-CN" ? "未指定或不支持的模板" : "Missing or unsupported template");
  const selection = { path: locationPath, model: query.get("model") ?? entry.model ?? "", mode: query.get("mode") ?? entry.mode ?? "", template: query.get("template_id") ?? "" };
  const zh = locale === "zh-CN";
  return <SiteShell locale={locale} currentPath={currentPath}><main className="platform-scaffold" id="generator"><Construction size={36}/><p>{zh ? "工具预览" : "Tool preview"}</p><h1>{title}</h1><strong>{zh ? "当前不可用" : "Currently unavailable"}</strong><p>{zh ? "此入口的专用工具和生成服务尚未开放。你可以返回工作台浏览，或使用已开放的美妆工具。" : "The dedicated tool and generation service are not available yet. Browse the workspace or use the available makeup tools."}</p><dl><dt>{zh ? "当前入口" : "Destination"}</dt><dd>{selection.path}</dd>{selection.model && <><dt>{zh ? "模型" : "Model"}</dt><dd>{selection.model}</dd></>}{selection.mode && <><dt>{zh ? "模式" : "Mode"}</dt><dd>{selection.mode}</dd></>}{selection.template && <><dt>{zh ? "模板" : "Template"}</dt><dd>{selection.template}</dd></>}</dl><a className="platform-home-cta" href={localizePath("/home", locale)}><ArrowLeft size={16}/>{zh ? "返回工作台" : "Back to workspace"}</a></main></SiteShell>;
}
