'use client';

import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore, type MouseEvent } from 'react';
import { ChevronRight, Download, RefreshCw, Sparkles } from 'lucide-react';
import { localizePath, type Locale } from '@/lib/i18n';
import { changeGeneratorModel, type GeneratorState } from '@/lib/platform-generator-parameters';
import { wallpaperBannerContent } from '@/lib/platform-wallpaper-banner-content';
import { initializeWallpaperBanner, wallpaperBannerKey, wallpaperBannerModels, wallpaperBannerPaths, wallpaperBannerSessions, type WallpaperBannerKind } from '@/lib/platform-wallpaper-banner-state';
import { wallpaperBannerTitle } from '@/lib/platform-wallpaper-banner-metadata';
import { generatorMedia } from '@/lib/platform-generator-media';
import { SiteShell } from './site-shell';
import { usePlatformUrl } from './use-platform-url';
import { PlatformGeneratorModelPicker } from './platform-generator-model-picker';
import { PlatformGeneratorUpload } from './platform-generator-upload';
import { GeneratorChoices, GeneratorIssues, GeneratorModes, GeneratorPrompt, GeneratorUnavailable } from './platform-image-generator-form';
import reference from './platform-wallpaper-banner-reference.module.css';
import styles from './platform-wallpaper-banner-page.module.css';

type Props = { kind: WallpaperBannerKind; locale: Locale; initialQuery?: string };
const sourceUrl = (kind: WallpaperBannerKind, locale: Locale) => `https://www.lantaai.com${kind === 'banner' && locale === 'zh-CN' ? '/zh' : ''}${wallpaperBannerPaths[kind]}`;
const Source = ({kind,locale}:{kind:WallpaperBannerKind;locale:Locale}) => <p className={styles.source}><a href={sourceUrl(kind,locale)} target="_blank" rel="noreferrer">Lanta AI</a>{locale === 'zh-CN' ? ` 公开参照${kind === 'wallpaper' ? ' · 中文拟译' : ''}；示例与服务主张属于原站，本站生成暂不可用。` : ' public reference · examples and service claims belong to the source; generation is unavailable here.'}</p>;

function PublicSection({html,kind,locale,onPrompt}:{html:string;kind:WallpaperBannerKind;locale:Locale;onPrompt:(value:string)=>void}) {
  const [notice,setNotice]=useState('');
  const click = async (event:MouseEvent<HTMLDivElement>) => {
    const b=(event.target as Element).closest<HTMLButtonElement>('button[data-action]'); if(!b)return;
    if(b.dataset.action==='faq'){
      const panel=document.getElementById(b.getAttribute('aria-controls')??'');if(!panel)return;
      const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));b.dataset.state=open?'open':'closed';panel.dataset.state=b.dataset.state;panel.hidden=!open;
      b.closest('h2,h3')?.parentElement?.setAttribute('data-state',b.dataset.state);return;
    }
    if(b.dataset.action==='prompt'){onPrompt(b.dataset.prompt??'');return;}
    if(b.dataset.action==='generator'){document.getElementById('generator')?.scrollIntoView({behavior:'instant',block:'start'});document.getElementById('platform-generator-prompt')?.focus({preventScroll:true});return;}
    if(b.dataset.action==='copy'){
      try{await navigator.clipboard.writeText(b.dataset.prompt??'');setNotice(locale==='zh-CN'?'提示词已复制。':'Prompt copied.');}
      catch{setNotice(locale==='zh-CN'?'复制失败，请手动选择提示词。':'Copy failed. Select the prompt text manually.');}
    }
  };
  return <div onClick={click}><div dangerouslySetInnerHTML={{__html:html}}/><Source kind={kind} locale={locale}/>{notice&&<p role="status" className={styles.notice}>{notice}</p>}</div>;
}

function ReferencePreview({locale}:{locale:Locale}) {
  const base='/platform/c3-wallpaper-banner/';
  // 两件准确源 SVG 的本地映射；与正文同源，不替换成近似图。
  return <aside className={styles.wallpaperPreview} aria-label={locale==='zh-CN'?'手机与桌面壁纸构想':'Phone and desktop wallpaper ideas'}><div className={styles.devices}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`${base}c00815496cddb693.svg`} data-artwork="mountain" alt=""/>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`${base}a83ef6ea333124a7.svg`} data-artwork="phone" alt=""/>
  </div><h3>{locale==='zh-CN'?'手机与桌面壁纸构想':'Phone and desktop wallpaper ideas'}</h3><p>{locale==='zh-CN'?'Lanta 插画概念：宽幅山景与竖幅夜空背景。':'Lanta illustrated concepts: a wide mountain landscape and a vertical night-sky background.'}</p></aside>;
}
function PublicGallery({locale}:{locale:Locale}) {
  const sources=Object.keys(generatorMedia).filter(s=>s.includes('/public/gallery/')&&!s.includes('width=160')&&!s.endsWith('.mp4')).slice(0,6);
  return <aside className={styles.gallery}><p>{locale==='zh-CN'?'Lanta 公开示例，非本站账户作品':'Lanta public examples, separate from account creations'}</p>{sources.map((s,i)=><article key={s}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={generatorMedia[s].src} alt={`${locale==='zh-CN'?'Lanta 公开示例':'Lanta public example'} ${i+1}`} loading="lazy"/>
    <div><a href={generatorMedia[s].src} download aria-label={`${locale==='zh-CN'?'下载公开示例':'Download public example'} ${i+1}`}><Download size={16}/></a><button type="button" disabled aria-label={locale==='zh-CN'?'生成暂不可用':'Generation unavailable'}><RefreshCw size={16}/></button></div>
  </article>)}</aside>;
}

function Session({kind,locale,query}:{kind:WallpaperBannerKind;locale:Locale;query:string}) {
  const [initial]=useState(()=>initializeWallpaperBanner(kind,query)),key=wallpaperBannerKey(kind,query),owner=useRef(0);
  const subscribe=useCallback((fn:()=>void)=>wallpaperBannerSessions.subscribe(fn),[]),read=useCallback(()=>wallpaperBannerSessions.read(key),[key]);
  const session=useSyncExternalStore(subscribe,read,()=>undefined),state=session?.state??initial,zh=locale==='zh-CN';
  // 包括会话恢复在内，每次渲染均从本页允许集合及当前模式取配置。
  const selected=wallpaperBannerModels.find(m=>m.id===state.model),config=selected?.modes[state.mode];
  useEffect(()=>{owner.current=wallpaperBannerSessions.acquire(key,initial);const token=owner.current;return()=>wallpaperBannerSessions.release(key,token)},[key,initial]);
  const update=(next:GeneratorState)=>{
    const model=wallpaperBannerModels.find(m=>m.id===next.model);
    // 共享模式切换及提示词编辑会重新解析注册表，写回时仍需守住本页边界。
    const safe=model?.modes[next.mode]?next:{...next,parameters:{},issues:[...new Set([...next.issues.filter(issue=>issue!=='prompt-too-long'),model?'unsupported-mode':'unknown-model'])]};
    wallpaperBannerSessions.write(key,owner.current,safe);
  };
  const props={state,onChange:update,locale,onFiles:()=>wallpaperBannerSessions.markFiles(key,owner.current),filesReleased:session?.filesReleased};
  const prompt=(value:string)=>{const next={...state,prompt:value};update(next);document.getElementById('generator')?.scrollIntoView({behavior:'instant',block:'start'});document.getElementById('platform-generator-prompt')?.focus({preventScroll:true})};
  const sections=wallpaperBannerContent[`${kind}-${zh?'zh':'en'}`];
  return <>
    <PublicSection html={sections[0]} kind={kind} locale={locale} onPrompt={prompt}/>
    <div className={`${styles.workspace} ${kind==='banner'?styles.bannerWorkspace:''}`} id="generator" data-generator-model={state.model} data-model-source-id={config?selected?.referenceId:undefined}>
      <form className={`platform-generator-form ${styles.form}`} onSubmit={e=>e.preventDefault()}><h2><Sparkles size={23}/>{kind==='wallpaper'?(zh?'创作 AI 壁纸':'Create your AI wallpaper'):'AI YouTube Banner Maker'}</h2>
        <GeneratorModes {...props}/><PlatformGeneratorModelPicker models={wallpaperBannerModels.filter(m=>m.modes[state.mode])} value={state.model} onChange={id=>update(changeGeneratorModel(state,id))} locale={locale}/>
        <GeneratorIssues state={state} locale={locale}/>{state.issues.some(x=>x.startsWith('unsupported-')&&x!=='unsupported-mode')&&<p role="status" className="platform-generator-error">{zh?'查询参数不受当前模型支持，已保留可用参数。':'The requested parameter is unsupported by this model; supported settings remain visible.'}</p>}
        {session?.filesReleased&&<p role="status" className="platform-generator-hint">{zh?'页面切换已释放本地文件，请重新选择。':'Local files were released when the page changed. Please select them again.'}</p>}
        {config?.reference&&<PlatformGeneratorUpload key={`${state.model}:${state.mode}`} config={config.reference} locale={locale} label={zh?'参考图片':'Reference Images'} onFiles={props.onFiles}/>}
        {config?<GeneratorPrompt {...props}/>:<div className="platform-generator-field"><div className="platform-generator-label"><label htmlFor="platform-generator-prompt">{zh?'提示词':'Prompt'}</label></div><textarea id="platform-generator-prompt" name="prompt" value={state.prompt} maxLength={20000} rows={4} aria-invalid={false} placeholder={zh?'请描述画面内容、风格、氛围及其他约束条件…':'Describe the subject, style, mood, and any constraints…'} onChange={e=>update({...state,prompt:e.target.value})}/></div>}
        {config&&<><GeneratorChoices label={zh?'分辨率':'Resolution'} values={config.resolutions} value={state.parameters.resolution} onChange={resolution=>update({...state,parameters:{...state.parameters,resolution}})}/><GeneratorChoices label={zh?'画幅比例':'Ratio'} values={config.ratios} value={state.parameters.ratio} onChange={ratio=>update({...state,parameters:{...state.parameters,ratio}})} ratio/></>}
        <GeneratorUnavailable locale={locale}/>
      </form>{kind==='wallpaper'?<ReferencePreview locale={locale}/>:<PublicGallery locale={locale}/>}
    </div>
    {sections.slice(1).map((html,i)=><PublicSection key={`${kind}:${locale}:${i}`} html={html} kind={kind} locale={locale} onPrompt={prompt}/>)}
  </>;
}
function ReactivePage({kind,locale,initialQuery=''}:Props) {
  const path=wallpaperBannerPaths[kind],url=usePlatformUrl(`${localizePath(path,locale)}${initialQuery?'?'+initialQuery:''}`),parsed=new URL(url,'https://local.invalid');
  return <SiteShell locale={locale} currentPath={path}><main className={`${reference.page} ${styles.page} platform-generator`} data-wallpaper-banner={kind} data-generation-availability="unavailable">
    <nav className={styles.breadcrumb} aria-label={locale==='zh-CN'?'面包屑导航':'Breadcrumb'}><a href={localizePath('/',locale)}>{locale==='zh-CN'?'首页':'Home'}</a><ChevronRight size={14}/><a href={localizePath('/tools',locale)}>{locale==='zh-CN'?'工具':'Tools'}</a><ChevronRight size={14}/><span>{wallpaperBannerTitle(kind,locale)}</span></nav>
    {parsed.pathname===localizePath(path,locale)&&<Session key={`${locale}:${wallpaperBannerKey(kind,parsed.search)}`} kind={kind} locale={locale} query={parsed.search}/>}
  </main></SiteShell>;
}
export function PlatformWallpaperBannerPage(props:Props){return <Suspense fallback={<SiteShell locale={props.locale} currentPath={wallpaperBannerPaths[props.kind]}><p>{props.locale==='zh-CN'?'正在准备本地预览…':'Preparing local preview…'}</p></SiteShell>}><ReactivePage {...props}/></Suspense>}
