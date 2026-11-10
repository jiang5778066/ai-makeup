"use client";

import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { generatorModel, type GeneratorState } from "@/lib/platform-generator-parameters";
import { generatorSessions } from "@/lib/platform-generator-session";
import { describeVideoModelIssues, initializeVideoModel, normalizeVideoModelState, videoModelPages, videoModelSelectionKey } from "@/lib/platform-video-model-data";
import {isAdditionalVideoModelPath} from "@/lib/platform-video-model-additional-data";
import {AdditionalVideoModelHero} from "./platform-video-model-additional-content";
import {PlatformVideoModelUnselectedForm} from "./platform-video-model-unselected-form";
import type { VideoModelPath } from "@/lib/platform-generator-data";
import { PlatformVideoGeneratorForm } from "./platform-video-generator-form";
import { PlatformVideoModelContent } from "./platform-video-model-content";
import { VideoModelReferenceHero } from "./platform-video-model-sections";
import { SiteShell } from "./site-shell";
import { usePlatformUrl } from "./use-platform-url";

type Props = { path: VideoModelPath; locale: Locale; initialQuery?: string };

function ActiveVideoModelPage({ path, locale, initialQuery = "" }: Props) {
  const serverPath = `${localizePath(path, locale)}${initialQuery ? `?${initialQuery}` : ""}`;
  const url = usePlatformUrl(serverPath);
  const parsed = new URL(url, "https://local.invalid");
  const active = parsed.pathname === localizePath(path, locale);
  const query = parsed.search;
  const key = videoModelSelectionKey(path, query);
  return <SelectionVideoModelPage key={key} path={path} locale={locale} initialQuery={query} active={active}/>;
}

function SelectionVideoModelPage({ path, locale, initialQuery, active }: { path: VideoModelPath; locale: Locale; initialQuery: string; active: boolean }) {
  const page = videoModelPages[path];
  const key = videoModelSelectionKey(path, initialQuery);
  const [initial] = useState(() => initializeVideoModel(path, initialQuery));
  const owner = useRef(0);
  const subscribe = useCallback((notify: () => void) => generatorSessions.subscribe(notify), []);
  const read = useCallback(() => generatorSessions.read(key), [key]);
  const session = useSyncExternalStore(subscribe, read, () => undefined);
  const state = session?.state ?? initial;
  useEffect(() => {
    owner.current = generatorSessions.acquire(key, initial);
    const token = owner.current;
    return () => generatorSessions.release(key, token);
  }, [initial, key, locale]);
  const update = (next: typeof state) => generatorSessions.write(key, owner.current, normalizeVideoModelState(next));
  const markFiles = () => generatorSessions.markFiles(key, owner.current);
  const settings = active && <section id="video-model-settings" className="platform-video-model-settings" data-current-model={state.model} data-current-mode={state.mode}>
    <div className="platform-video-model-form-wrap">{path==="/ai-video-models/sora-2"&&state.model===""?<PlatformVideoModelUnselectedForm key={locale} state={state} onChange={update} locale={locale} onFiles={markFiles} filesReleased={session?.filesReleased}/>:<PlatformVideoGeneratorForm key={locale} state={state} onChange={update} locale={locale} onFiles={markFiles} filesReleased={session?.filesReleased} videoModelPolicy pageModel={page.defaultModel}/>}
      <VideoModelIssues state={state} initialQuery={initialQuery} locale={locale}/>
      <p className="platform-video-model-current">{zhLabel(locale, "当前表单模型", "Current form model")}: {generatorModel(state.model)?.name ?? (state.model || zhLabel(locale,"尚未选择模型","No model selected"))}</p>
    </div>
    <aside className="platform-video-model-public-examples"><h2>{zhLabel(locale, "公开示例", "Public examples")}</h2><p>{zhLabel(locale, "下方为公开参照素材；本人的生成任务请在我的作品查看。", "These are public references. View your own generated tasks in My Creations.")}</p><div className="platform-video-model-history-empty">{zhLabel(locale,"公开示例区","Public examples area")}</div><a href="#video-model-examples">{zhLabel(locale,"浏览公开视频示例","Browse public video examples")}</a><p>{path==="/ai-video-models/grok-imagine"?zhLabel(locale,"来源参数与文件可先预览；本站视频能力以生成面板为准，确认报价后才提交。","Preview reference settings and files first. Site video availability is shown in the panel; tasks are submitted after quote confirmation."):zhLabel(locale, "文件仅在本机预览；生成不会上传、提交任务或扣除额度。", "Files stay on this device. Generation does not upload, submit tasks, or use credits.")}</p></aside>
  </section>;
  return <SiteShell locale={locale} currentPath={path}><main className={`platform-video-model-page platform-video-model-page-${page.catalogId}${isAdditionalVideoModelPath(path)?" platform-video-model-additional":""}`} data-video-model-path={path} data-generation-availability={path==="/ai-video-models/grok-imagine"?"capabilities":"unavailable"}>
    <nav className="platform-video-model-breadcrumb" aria-label={zhLabel(locale,"面包屑","Breadcrumb")}><a href={localizePath("/",locale)}>{zhLabel(locale,"首页","Home")}</a> / <a href={localizePath("/ai-video-models",locale)}>{zhLabel(locale,"视频模型","Video models")}</a> / {page.title[locale]}</nav>
    {isAdditionalVideoModelPath(path)?<AdditionalVideoModelHero path={path} locale={locale} settings={settings}/>:<VideoModelReferenceHero path={path} locale={locale}/>}
    {path!=="/ai-video-models/vheer"&&settings}
    <div id="video-model-examples"/>
    <PlatformVideoModelContent page={page} locale={locale}/>
  </main></SiteShell>;
}

function VideoModelIssues({ state, initialQuery, locale }: { state: GeneratorState; initialQuery: string; locale: Locale }) {
  const zh = locale === "zh-CN";
  const name = generatorModel(state.model)?.name ?? (state.model || zhLabel(locale,"尚未选择模型","No model selected"));
  const mode = zh ? (state.mode === "text" ? "文生视频" : "图生视频") : (state.mode === "text" ? "text-to-video" : "image-to-video");
  const current = zh ? `当前表单模型为 ${name}（${mode}）。` : `Current form model: ${name} (${mode}).`;
  const labels: Record<string, string> = zh ? {
    "model-fallback": `表单已切换为 ${name}，用于${mode}；介绍页身份不变。`,
    "unsupported-model-mode": `请求的模型不适用于本页该模式，未采用该请求；${current}`,
    "path-model-conflict": `请求的模型不在本页该模式可选范围内，未采用该请求；${current}`,
    "unknown-model": `URL 中的模型编号未识别，未采用该请求；${current}`,
    "unknown-mode": `URL 中的生成模式未识别，初始化时未采用；${current}`,
    "mode-tab-conflict": `URL 的 mode 与 tab 不一致，初始化时优先采用 mode；${current}`,
    "unsupported-mode": `请求的模式未采用；${current}`,
  } : {
    "model-fallback": `The form switched to ${name} for ${mode}. The page introduction is unchanged.`,
    "unsupported-model-mode": `The requested model is unavailable for this page and mode and was not applied. ${current}`,
    "path-model-conflict": `The requested model is outside this page's available selection for this mode and was not applied. ${current}`,
    "unknown-model": `The URL model ID is unknown and was not applied. ${current}`,
    "unknown-mode": `The URL mode is unknown and was not applied at initialization. ${current}`,
    "mode-tab-conflict": `The URL mode and tab values conflict; mode took precedence at initialization. ${current}`,
    "unsupported-mode": `The requested mode was not applied. ${current}`,
  };
  const fields = zh ? { duration: "时长", resolution: "画质", ratio: "画幅比例", sound: "声音", multishot: "多镜头" } : { duration: "duration", resolution: "quality", ratio: "aspect ratio", sound: "sound", multishot: "multi-shot" };
  return <>{describeVideoModelIssues(state, initialQuery).map(({ code, field, availability }) => {
    let text = labels[code];
    if (field) {
      const label = fields[field];
      if (code.startsWith("invalid-parameter:")) text = zh
        ? `URL ${label}参数格式无效，初始化时未采用；当前值以表单为准，请手动选择。`.replace("时长参数格式", "时长格式")
        : `The URL ${label} is malformed and was not applied at initialization. Use the form to choose the current setting.`;
      else {
        const history = zh ? `URL ${label}设置在初始化时未采用。` : `The URL ${label} setting was not applied at initialization. `;
        text = history + (availability === "gated"
          ? (zh ? `该请求在当前参照模型与模式下仍提示会员条件，当前值保持不变。` : `This request still prompts for membership for the current reference model and mode; your setting is unchanged.`)
          : availability === "available"
            ? (zh ? `当前 ${name} 的${mode}支持该设置，但先前 URL 设置未重新应用，请在表单中选择。` : `${name} supports this setting for ${mode} now; the earlier URL setting has not been reapplied. Choose it in the form.`)
            : (zh ? `该请求也不适用于当前 ${name} 的${mode}，请从表单可用选项选择。` : `The request is also unavailable for ${name} in ${mode}; choose an available setting in the form.`));
      }
    }
    return text && <p className="platform-generator-error" role="status" key={code}>{text}</p>;
  })}</>;
}

function zhLabel(locale: Locale, zh: string, en: string) { return locale === "zh-CN" ? zh : en; }

export function PlatformVideoModelPage(props: Props) {
  return <Suspense fallback={<SiteShell locale={props.locale} currentPath={props.path}><main className="platform-video-model-page"><p>{zhLabel(props.locale, "正在准备本地参数预览…", "Preparing local settings preview…")}</p></main></SiteShell>}>
    <ActiveVideoModelPage {...props}/>
  </Suspense>;
}
