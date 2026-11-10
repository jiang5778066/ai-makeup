"use client";

import { createElement, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import type { CoreVideoModelPath } from "@/lib/platform-generator-data";
import { videoModelContent, type VideoSectionNode, type VideoReferenceSection } from "@/lib/platform-video-model-content-data";
import { HomepageVideo } from "./platform-homepage-media";

function chartNodes(node: VideoSectionNode): Exclude<VideoSectionNode, string>[] {
  return typeof node === "string" ? [] : [node, ...node.children.flatMap(chartNodes)];
}

// 固定原件的SVG来自412×480采集布局；按宽屏坐标重新排版，文字不随非等比矩阵压扁。
function ReferenceScoreChart({ node, label }: { node: Exclude<VideoSectionNode, string>; label: string }) {
  const nodes = chartNodes(node);
  const series = nodes.filter(item => item.tag === "path" && item.attrs.name);
  const bar = nodes.some(item => String(item.attrs.id ?? "").includes("-recharts-bar-"));
  const attrs = { "data-video-model-chart": "true", role: "img", "aria-label": label, viewBox: "0 0 514 320", preserveAspectRatio: "xMidYMid meet", style: { width: "100%", height: "100%", display: "block" } };
  if (bar) {
    const ticks = nodes.filter(item => item.tag === "text" && item.attrs.orientation === "bottom");
    const names = nodes.filter(item => item.tag === "text" && item.attrs.orientation === "left");
    const text = (item: VideoSectionNode): string => typeof item === "string" ? item : item.children.map(text).join(" ");
    return <svg {...attrs}>
      {ticks.map((tick, index) => <g key={index}><line x1={100 + index * 98.5} y1="8" x2={100 + index * 98.5} y2="296" stroke="rgba(255,255,255,.06)" strokeDasharray="3 3"/><text x={100 + index * 98.5} y="312" fontSize="10" fill="#52525b" textAnchor="middle">{text(tick)}</text></g>)}
      {series.map((item, index) => <g key={String(item.attrs.name)}>
        <rect x="100" y={21 + index * 48} width={Number(item.attrs.width) / 292 * 394} height="22" rx="6" fill={String(item.attrs.fill)}/>
        <text x="92" y={35 + index * 48} fill="#a1a1aa" fontSize="11" textAnchor="end">{names[index]?.children.map((line, i) => <tspan key={i} x="92" dy={i ? "1em" : names[index].children.length > 1 ? "-.2em" : "0"}>{text(line)}</tspan>)}</text>
      </g>)}
      <path d="M100 8V296H494" fill="none" stroke="#52525b"/>
    </svg>;
  }
  const axes = nodes.filter(item => item.tag === "text" && item.attrs.orientation === "outer");
  const grid = nodes.filter(item => item.tag === "path" && item.attrs.radius !== undefined);
  const axisLines = nodes.filter(item => item.tag === "line");
  // 几何整体等比缩放；各轴标签使用独立文字坐标与原字号。
  return <svg {...attrs}>
    <g transform="translate(108.68 -22.8) scale(.72)">{axisLines.map((item, i) => <line key={`axis-${i}`} x1={Number(item.attrs.x1)} y1={Number(item.attrs.y1)} x2={Number(item.attrs.x2)} y2={Number(item.attrs.y2)} stroke={String(item.attrs.stroke ?? "rgba(255,255,255,.06)")}/>)}{grid.map((item, i) => <path key={i} d={String(item.attrs.d)} fill="none" stroke="rgba(255,255,255,.08)"/>)}{series.map((item, i) => <path key={i} d={String(item.attrs.d)} fill={String(item.attrs.fill)} fillOpacity={Number(item.attrs.fillOpacity)} stroke={String(item.attrs.stroke)} strokeWidth={Number(item.attrs.strokeWidth)}/>)}</g>
    {axes.map((item, i) => {
      const x = (Number(item.attrs.x) - 206) * .72 + 257;
      const y = (Number(item.attrs.y) - 240) * .72 + 150;
      return <text key={i} x={x} y={y} fontSize="10" fill={String(item.attrs.fill)} textAnchor={item.attrs.textAnchor as "start" | "middle" | "end"}>{item.children.map((child, j) => typeof child === "string" ? child : <tspan key={j} x={x} dy={String(child.attrs.dy ?? "0")}>{child.children as string[]}</tspan>)}</text>;
    })}
    {[0, 25, 50, 75, 100].map(value => <text key={value} x={257 + value * .95} y={150 - value * .55} fontSize="9" fill="#52525b" transform={`rotate(60 ${257 + value * .95} ${150 - value * .55})`}>{value}</text>)}
  </svg>;
}

function localTarget(raw: string, locale: Locale) {
  if (raw === "#generator" || raw === "#video-generator") return "#video-model-settings";
  if (raw === "#prompt-guide") return "#kling-ai-prompt-guide";
  if (raw.startsWith("#")) return raw;
  const url = new URL(raw, "https://www.lantaai.com");
  const pathname = url.pathname.replace(/^\/(zh-CN|zh)(?=\/|$)/, "");
  if (url.origin !== "https://www.lantaai.com" || !/^\/(ai-video-models\/[^/]+|ai-video-generator|ai-video-models|ai-image-generator)$/.test(pathname)) return null;
  return `${localizePath(pathname, locale)}${url.search}${url.hash}`;
}

export function VideoModelReferenceSection({ section, locale }: { section: VideoReferenceSection; locale: Locale }) {
  const scope = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);
  const zh = locale === "zh-CN";
  const render = (node: VideoSectionNode, key: string): ReactNode => {
    if (typeof node === "string") return node;
    if (node.panel !== undefined && node.panel !== tab) return null;
    const props: Record<string, unknown> = { ...node.attrs, key };
    const chartFrame = node.children.some(child => typeof child !== "string" && child.attrs["data-video-model-chart"] === "true");
    const chartHost = node.children.some(child => typeof child !== "string" && child.children.some(grandchild => typeof grandchild !== "string" && grandchild.attrs["data-video-model-chart"] === "true"));
    // 参照中的响应式图表已冻结为SVG，移除当时测量用的零尺寸和固定像素包装。
    if (chartFrame || chartHost) {
      props.style = { ...(props.style as React.CSSProperties), width: "100%", height: "100%" };
      if (chartFrame) props["data-video-model-chart-frame"] = true;
    }
    // 原始评分SVG使用HTML属性名；仅转换已核实的React属性边界。
    if ("font-size" in props) {
      props.fontSize = props["font-size"];
      delete props["font-size"];
    }
    const children = node.children.map((child, index) => render(child, `${key}-${index}`));
    if (node.media) return <div className={`platform-video-model-reference-video ${String(props.className ?? "")}`} style={props.style as React.CSSProperties} data-preview-card data-reference-source={node.media.src} key={key}>
      <HomepageVideo src={node.media.src} poster={node.media.poster} locale={locale} trigger="hover"/>
    </div>;
    if (node.tag === "a") {
      const target = localTarget(node.link ?? "", locale);
      if (target) props.href = target;
      else return <span key={key} className={String(props.className ?? "")} role="link" aria-disabled="true" title={zh ? "此入口待开放" : "This destination is not available yet"}>{children}<small> {zh ? "待开放" : "Coming soon"}</small></span>;
    }
    if (node.tag === "img") {
      props.loading = "lazy"; props.alt ??= "";
      if (props.src === "/logos/icon-192.png") props.src = "https://www.lantaai.com/logos/icon-192.png";
    }
    if (node.tag === "svg") {
      if (props["data-video-model-chart"]) return <ReferenceScoreChart key={key} node={node} label={zh ? "外部参照模型评分图" : "External reference model scores"}/>;
      props["aria-hidden"] = section.index === 6 ? undefined : true;
      if (section.index === 6) { props.role = "img"; props["aria-label"] = zh ? "外部参照模型评分图" : "External reference model scores"; }
    }
    if (node.action?.kind === "tab") {
      const index = node.action.index ?? 0;
      props["aria-selected"] = tab === index; props["data-state"] = tab === index ? "active" : "inactive";
      props.tabIndex = tab === index ? 0 : -1;
      props.onClick = () => setTab(index);
      props.onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const tabs = [...(scope.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])];
        const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        setTab(next); tabs[next]?.focus();
      };
    }
    if (node.action?.kind === "copy") {
      props.onClick = async () => {
        try { await navigator.clipboard.writeText(node.action?.text ?? ""); setCopied(key); setCopyError(false); }
        catch { setCopyError(true); }
      };
      props["aria-label"] = `${zh ? "复制例文" : "Copy example"} ${key.split('-')[0]} ${node.action.text?.slice(0, 48)}`;
      if (copied === key) return createElement("button", props, zh ? "已复制" : "Copied");
    }
    if (node.action?.kind === "rail") props["data-video-model-rail"] = true;
    if (node.action?.kind === "carousel") props.onClick = () => {
      const rail = scope.current?.querySelector<HTMLElement>('[data-video-model-rail]');
      if (rail) rail.scrollBy({ left: (node.action?.direction ?? 1) * rail.clientWidth * .8, behavior: "smooth" });
    };
    if (node.panel !== undefined) { props["data-state"] = "active"; props.tabIndex = 0; }
    if (["img", "br", "hr", "input", "source"].includes(node.tag)) return createElement(node.tag, props);
    return createElement(node.tag, props, children);
  };
  return <div ref={scope} id={section.index === 5 ? "kling-ai-prompt-guide" : undefined} className={`platform-video-model-reference-section platform-video-model-reference-section-${section.index}`} data-reference-section={section.index}>
    {render(section.tree, String(section.index))}
    {section.index > 0 && <p className="platform-video-model-source-note">{zh ? "本区为 Lanta AI 公开参照采集时资料；性能、许可和服务主张未经本项目独立验证。示例不是本站生成结果。" : "Source: Lanta AI public reference at capture time. Performance, licensing and service claims are not independently verified here; examples are not project generations."}</p>}
    {copyError && <p role="status">{zh ? "复制未完成，请选择例文手动复制。" : "Copy did not complete. Please select the example text to copy manually."}</p>}
  </div>;
}

export function VideoModelReferenceHero({ path, locale }: { path: CoreVideoModelPath; locale: Locale }) {
  const section = videoModelContent[path][locale].find(item => item.index === 0)!;
  return <VideoModelReferenceSection section={section} locale={locale}/>;
}

export function VideoModelReferenceBody({ path, locale, footer = false }: { path: CoreVideoModelPath; locale: Locale; footer?: boolean }) {
  const sections = videoModelContent[path][locale];
  const last = sections.at(-1)?.index;
  return <>{sections.filter(item => item.index > 0 && (footer ? item.index === last : item.index !== last)).map(section => <VideoModelReferenceSection key={section.index} section={section} locale={locale}/>)}</>;
}
