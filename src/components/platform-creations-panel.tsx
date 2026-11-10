/* eslint-disable @next/next/no-img-element -- 私有短期签名媒体使用原生元素。 */
"use client";
import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { loginHref } from "@/lib/auth-return";
import { usePlatformAccount, refreshPlatformAccount } from "@/lib/platform-account-session";
import { creationFilters, type CreationFilter } from "@/lib/platform-creations-types";
import { usePlatformCreations } from "@/hooks/use-platform-creations";
import { PlatformCreationsPreview } from "./platform-creations-preview";
import { creationFilterText, creationStatusText } from "./platform-creations-copy";
import styles from "./platform-creations-styles.module.css";
type Props = { locale: Locale; initialFilter: CreationFilter; path: string };
export function PlatformCreationsPanel({ locale, initialFilter, path }: Props) {
  const account = usePlatformAccount(); const zh = locale === "zh-CN";
  const [filter, setFilter] = useState<CreationFilter>(initialFilter);
  const destination = typeof window === "undefined" ? path : `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return <main className={styles.page}>
    <header className={styles.heading}><div><span>{zh ? "创作空间" : "YOUR WORKSPACE"}</span><h1>{zh ? "我的作品" : "My Creations"}</h1><p>{zh ? "在这里查看已保存的作品、任务进度与结果。" : "Your saved creations, task progress and results."}</p></div></header>
    <div className={styles.filters} aria-label={zh ? "筛选作品" : "Filter creations"}>
      {["all", "image", "video"].map(value => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value as CreationFilter)}>{creationFilterText(value, locale)}</button>)}
      <label>{zh ? "美妆分类" : "Makeup category"}<select aria-label={zh ? "美妆分类" : "Makeup category"} value={filter} onChange={event => setFilter(event.target.value as CreationFilter)}>{creationFilters.map(value => <option key={value} value={value}>{creationFilterText(value, locale)}</option>)}</select></label>
    </div>
    {filter === "video" && <p className={styles.info}>{zh ? "视频作品数据源尚未接入。" : "The video creations data source is not connected yet."}</p>}
    {account.status === "loading" ? <p role="status" className={styles.empty}>{zh ? "正在核验账户…" : "Checking your account…"}</p> : account.status === "signed_out" ? <section className={styles.empty}><h2>{zh ? "登录后查看作品" : "Sign in to view your creations"}</h2><p>{zh ? "作品只对所属账户可见。" : "Creations are private to your account."}</p><Link className={styles.primary} href={loginHref(destination)}>{zh ? "使用邮箱登录" : "Sign in with email"}</Link></section> : account.status === "error" || !account.user ? <section className={styles.empty}><p role="alert">{zh ? "账户服务暂不可用，请稍后重试。" : "Account service is unavailable. Please try again."}</p><button type="button" onClick={() => { void refreshPlatformAccount(); }}>{zh ? "重试" : "Retry"}</button></section> : <AuthenticatedCreations key={`${account.user.id}:${account.epoch}:${locale}:${filter}`} locale={locale} filter={filter}/>}
  </main>;
}
function AuthenticatedCreations({ locale, filter }: { locale: Locale; filter: CreationFilter }) {
  const state = usePlatformCreations(filter); const zh = locale === "zh-CN";
  const [preview, setPreview] = useState<string | null>(null);
  const active = state.items.find(item => item.id === preview);
  const errors: Record<string, string> = { load: zh ? "作品服务暂不可用，无法加载列表。请重试。" : "Creations are unavailable. Please retry loading.", remove: zh ? "移除失败，作品仍在列表中，请重试。" : "Removal failed. Your creation is still listed. Please retry.", refresh: zh ? "结果查询失败，请重试原作品。" : "Result check failed. Please retry the original creation.", download: zh ? "下载失败。重试会重新获取原作品链接，不会重新生成或扣费。" : "Download failed. Retry fetches the original result link without another generation or charge." };
  const notices: Record<string, string> = { removed: zh ? "已从作品列表移除。" : "Removed from your creations.", downloaded: zh ? "下载已交给浏览器。" : "Download handed to your browser.", paused: zh ? "自动查询已暂停，任务可能仍在继续。继续查询只读取原任务。" : "Automatic checks paused. The task may still be running. Continue checking the original task.", not_found: zh ? "原任务不可访问，未重新提交。可刷新列表。" : "The original task is unavailable. Refresh the list to check again." };
  return <>
    <div className={styles.toolbar}><p>{zh ? "仅显示当前账户的作品" : "Only creations owned by this account"}</p><button type="button" disabled={state.loading} onClick={() => { void state.load(); }}>{zh ? "刷新列表" : "Refresh list"}</button></div>
    {state.error && <p role="alert" className={styles.error}>{errors[state.error]}{state.error === "load" && <button type="button" onClick={() => { void state.load(); }}>{zh ? "重试加载" : "Retry loading"}</button>}</p>}
    {state.notice && <p role="status" className={styles.info}>{notices[state.notice]}{state.notice === "paused" && <button type="button" onClick={state.resume}>{zh ? "继续查询" : "Continue checking"}</button>}</p>}
    {state.loading && <p role="status">{zh ? "正在读取作品…" : "Loading creations…"}</p>}
    {!state.loading && !state.error && !state.items.length && <section className={styles.empty}><h2>{zh ? "暂无作品" : "No creations yet"}</h2><p>{filter === "video" ? (zh ? "视频数据源尚未接入。" : "Video data is not connected yet.") : (zh ? "当前分类还没有作品。可以先创建一款美妆。" : "There are no creations in this category. Start with a makeup look.")}</p><Link className={styles.primary} href={localizePath("/ai-makeup", locale)}>{zh ? "体验 AI 美妆" : "Try AI Makeup"}</Link></section>}
    <div className={styles.grid}>{state.items.map(item => <article key={item.id} className={styles.card}>
      <div className={styles.media}>{item.status === "done" && item.result && item.result.mimeType.startsWith(`${item.mediaType}/`) ? item.mediaType === "video" ? <video controls playsInline preload="metadata"><source src={item.result.url} type={item.result.mimeType}/></video> : <button type="button" className={styles.previewButton} aria-label={zh ? "预览作品" : "Preview creation"} onClick={() => setPreview(item.id)}><img src={item.result.url} alt={zh ? "已保存的美妆结果" : "Saved makeup result"}/></button> : <span>{item.status === "done" ? (zh ? "结果链接暂不可用" : "Result link unavailable") : creationStatusText(item.status, locale)}</span>}</div>
      <div className={styles.cardBody}><p className={styles.status} role="status">{creationStatusText(item.status, locale)}</p><h2>{item.title === "virtual_try_on" ? (zh ? "实时试妆" : "Virtual try-on") : item.title}</h2><time dateTime={item.createdAt}>{new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time>
        <div className={styles.actions}>{item.status === "done" && <><button type="button" onClick={() => setPreview(item.id)}>{zh ? "预览" : "Preview"}</button><button type="button" disabled={state.busy !== null} onClick={() => { void state.download(item.id); }}>{state.busy === item.id ? (zh ? "请稍候…" : "Please wait…") : (zh ? "下载" : "Download")}</button></>}<button type="button" onClick={() => { void state.refresh(item.id); }}>{zh ? "刷新状态/链接" : "Refresh status / link"}</button>
          <button type="button" disabled={!item.removable || state.busy !== null} onClick={() => { if (window.confirm(zh ? "从作品列表移除？仅隐藏此作品，原文件、任务和积分记录仍保留。" : "Remove from your creations? This only hides the creation. Original files, task and credit records are retained.")) void state.remove(item.id); }}>{zh ? "从列表移除" : "Remove from list"}</button></div>
        {!item.removable && <p className={styles.hint}>{zh ? "任务尚未结束，暂不能从列表移除。" : "This task is not settled and cannot be removed yet."}</p>}
      </div>
    </article>)}</div>
    {state.cursor && <button className={styles.more} type="button" disabled={state.loading} onClick={() => { void state.load(state.cursor); }}>{zh ? "加载更多" : "Load more"}</button>}
    {active && <PlatformCreationsPreview item={active} locale={locale} onClose={() => setPreview(null)} onRefresh={() => { void state.refresh(active.id); }}/>}
  </>;
}
