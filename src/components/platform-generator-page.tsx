"use client";
import{Suspense,useCallback,useEffect,useRef,useSyncExternalStore,useState}from'react';import{ArrowRight,Download,RefreshCw,Trash2}from'lucide-react';
import type{Locale}from'@/lib/i18n';import{localizePath}from'@/lib/i18n';import{generatorPages,type GeneratorPath}from'@/lib/platform-generator-data';import{initializeGenerator,changeGeneratorMode,changeGeneratorModel,generatorModel,type GeneratorState}from'@/lib/platform-generator-parameters';import{generatorSessions,generatorSelectionKey}from'@/lib/platform-generator-session';import{generatorMedia,localGeneratorMedia,generatorVideoExamples}from'@/lib/platform-generator-media';import{PlatformImageGeneratorForm}from'./platform-image-generator-form';import{PlatformVideoGeneratorForm}from'./platform-video-generator-form';import{PlatformGeneratorContent}from'./platform-generator-content';import{HomepageVideo}from'./platform-homepage-media';import{SiteShell}from'./site-shell';import{usePlatformUrl}from'./use-platform-url';
import { isVideoModeToolPath, videoModeTools } from '@/lib/platform-video-mode-tools';
import { PlatformNavigationLink } from './platform-navigation-link';

function VideoModeToolHeading({ path, locale }: { path: keyof typeof videoModeTools; locale: Locale }) {
 const tool = videoModeTools[path];
 return <header className="platform-generator-video-title platform-video-mode-tool-title">
  <h1>{tool.title[locale]}</h1>
  <p>{tool.description[locale]}</p>
  <PlatformNavigationLink href={localizePath(tool.otherTool, locale) + '#generator'}>
   {videoModeTools[tool.otherTool].title[locale]}
  </PlatformNavigationLink>
 </header>;
}

type Props={path:GeneratorPath;locale:Locale;initialQuery?:string};
function ShowcasePreview({source,locale,onClose,trigger}:{source:string;locale:Locale;onClose:()=>void;trigger:HTMLElement|null}){const ref=useRef<HTMLDialogElement>(null),media=generatorMedia[source],zh=locale==='zh-CN';useEffect(()=>{const node=ref.current!,previous=document.body.style.overflow;node.showModal();document.body.style.overflow='hidden';return()=>{node.close();document.body.style.overflow=previous;trigger?.focus()}},[trigger]);return <dialog ref={ref} className="platform-generator-preview-dialog" aria-label={zh?'公开示例视频预览':'Public example video preview'} onCancel={e=>{e.preventDefault();onClose()}}><button type="button" onClick={onClose}>{zh?'关闭预览':'Close preview'}</button><div data-preview-card><HomepageVideo src={media.src} poster={media.poster} locale={locale}/></div><p>{zh?'公开视频展示，非账户作品；生成暂不可用。':'Public video showcase, separate from account creations. Generation is not available.'}</p></dialog>}
export function Showcase({locale,video}:{locale:Locale;video:boolean}){const[removed,setRemoved]=useState<string[]>([]),[preview,setPreview]=useState<{source:string;trigger:HTMLElement}|null>(null),zh=locale==='zh-CN';const gallery=Object.keys(generatorMedia).filter(s=>s.includes('/public/gallery/')&&!s.includes('width=160')&&!s.endsWith('.mp4')).slice(0,6);return <aside className={`platform-generator-showcase ${video?'platform-generator-showcase-video':''}`} aria-label={zh?'公开参照示例':'Public reference examples'}>{video&&<h2>{zh?'公开视频示例':'Public Video Examples'}</h2>}<p className="platform-generator-hint">{zh?'公开参照展示，非本项目生成或账户作品。':'Public reference showcases, separate from project generations and account creations.'}</p>{(video?generatorVideoExamples.map(x=>x.source):gallery).filter(s=>!removed.includes(s)).map((src,i)=>{const example=generatorVideoExamples.find(x=>x.source===src);return <article key={src} data-preview-card>{video?<div className="platform-generator-history-content"><button className="platform-generator-history-thumbnail" type="button" aria-label={`${zh?'预览公开示例':'Preview public example'} ${i+1}`} onClick={e=>setPreview({source:src,trigger:e.currentTarget})}><img src={generatorMedia[src]?.poster} alt=""/><span>▶</span></button><div><strong>{zh?'公开参照示例':'Public reference example'}</strong><p>{example?.duration}s · {zh?'图生视频':'Image to Video'}</p><small>{example?.model}</small></div></div>:<div className="platform-generator-showcase-image"><img src={localGeneratorMedia(src)} alt={zh?'公开参照示例':'Public reference example'} loading="lazy"/></div> /* eslint-disable-line @next/next/no-img-element */}<div className="platform-generator-showcase-actions"><a href={localGeneratorMedia(src)} download><Download size={14}/>{zh?'下载公开示例':'Download public example'}</a><button type="button" disabled title={zh?'生成暂不可用':'Generation is not available'}><RefreshCw size={14}/>{zh?'重新生成':'Redo'}</button>{video&&<button type="button" aria-label={zh?`移除此示例 ${i+1}`:`Remove this example ${i+1}`} onClick={()=>setRemoved([...removed,src])}><Trash2 size={14}/></button>}</div></article>})}{preview&&<ShowcasePreview source={preview.source} locale={locale} trigger={preview.trigger} onClose={()=>setPreview(null)}/>}</aside>}

function Hero({path,locale}:{path:GeneratorPath;locale:Locale}){
 if (isVideoModeToolPath(path)) return <VideoModeToolHeading path={path} locale={locale}/>;
 const page=generatorPages[path],zh=locale==='zh-CN';if(page.family==='video')return null;return <>{(page.family==='gpt'||page.family==='nano')&&<nav className="platform-generator-breadcrumb" aria-label={zh?'面包屑导航':'Breadcrumb'}><a href={localizePath('/',locale)}>{zh?'首页':'Home'}</a><span>›</span><a href={localizePath('/ai-image-models',locale)}>{zh?'AI 图像模型':'AI Image Models'}</a><span>›</span><span>{page.family==='gpt'?'GPT Image 2': 'Nano Banana Pro'}</span></nav>}<header className={`platform-generator-hero platform-generator-hero-${page.family}`}><div>{page.family!=='gpt'&&<span className="platform-generator-eyebrow">{page.family==='nano'?(zh?'Gemini 3 Pro · 公开模型资料':'Gemini 3 Pro · Public Model Information'):(zh?'AI 图像技术':'AI Image Technology')}</span>}<h1>{page.family==='image'?<>{zh?'在线':'Online'} <span>{page.title[locale]}</span></>:<span>{page.title[locale]}</span>}</h1><p>{page.family==='gpt'?(zh?'探索 GPT Image 2 的海报、UI 概念稿、漫画分镜和营销视觉公开示例。可预览来源参数与本地文件；本站图片生成能力以面板状态为准。':'Explore public GPT Image 2 examples for posters, UI concepts, manga and campaign visuals. Preview reference settings and local files; site image availability is shown in the panel.'):page.family==='nano'?(zh?'浏览 Nano Banana Pro 图中文字排版、图片编辑与高分辨率视觉的公开资料。模型能力未经本项目验证，生成服务尚未开放。':'Explore public information on Nano Banana Pro typography, image editing and high-resolution visuals. Model capabilities have not been verified by this project; generation is not available.'):(zh?'从提示词或参考照片开始，描述主体、构图和风格，再预览本地文件。可用模式与报价以生成面板为准。':'Start with a text prompt or a reference photo. Describe the subject, framing, and style, then preview your file. Check the generation panel for available modes and quotes.')}</p>{page.family!=='gpt'&&<><a href="#generator" className="platform-generator-cta">{zh?'探索生成器参数':'Explore Generator Settings'}<ArrowRight size={16}/></a><div className="platform-generator-hero-facts"><span>{zh?'● 本地文件预览':'● Local file preview'}</span><span>{page.family==='nano'?(zh?'● 生成暂不可用':'● Generation not available yet'):(zh?'● 查看当前可用模式':'● Check available modes')}</span>{page.family==='nano'&&<span>{zh?'● 公开资料展示':'● Public model information'}</span>}</div></>}</div>{page.family==='nano'&&<div className="platform-generator-nano-hero-image"><img src={localGeneratorMedia('https://cdn.lantaai.com/resources/a379e328-6e4f-471f-9797-7c6acb1d225f/v1/nano-banana-example/w480.webp')} alt={zh?'Nano Banana Pro 公开示例':'Nano Banana Pro public example'}/><span>{zh?'公开示例':'Public example'}</span></div> /* eslint-disable-line @next/next/no-img-element */}</header></>}
function GeneratorSession({path,locale,query}:{path:GeneratorPath;locale:Locale;query:string}){const page=generatorPages[path],key=generatorSelectionKey(path,query),[initial]=useState(()=>initializeGenerator(path,query)),owner=useRef(0);const subscribe=useCallback((fn:()=>void)=>generatorSessions.subscribe(fn),[]);const read=useCallback(()=>generatorSessions.read(key),[key]);const session=useSyncExternalStore(subscribe,read,()=>undefined);const state=session?.state??initial;
 useEffect(()=>{owner.current=generatorSessions.acquire(key,initial);const token=owner.current;return()=>generatorSessions.release(key,token)},[key,initial]);
 const hasGenerationPanel = path === '/ai-video-generator' || page.defaultModel === 'gpt-image-2';
 const previewModel = hasGenerationPanel ? undefined : (generatorModel(page.defaultModel)?.name ?? page.title[locale]);
 const update=(next:GeneratorState)=>generatorSessions.write(key,owner.current,next);const onFiles=()=>generatorSessions.markFiles(key,owner.current);const props={state,onChange:update,locale,onFiles,filesReleased:session?.filesReleased};
 if (isVideoModeToolPath(path)) {
  return <div className="platform-generator-workspace platform-generator-workspace-mode-tool"
   id="generator" data-generator-model={state.model} data-generation-availability="capabilities">
   <PlatformVideoGeneratorForm {...props}/>
  </div>;
 }
 return <><div className={`platform-generator-workspace platform-generator-workspace-${page.family}`} id="generator" data-generator-model={state.model} data-generation-availability="capabilities">{page.kind==='video'?<PlatformVideoGeneratorForm {...props}/>:<PlatformImageGeneratorForm {...props}/>}<Showcase video={page.kind==='video'} locale={locale}/></div>{page.family==='video'&&<header className="platform-generator-video-title"><h1>{locale==='zh-CN'?'AI 视频生成器：从文字与图片探索视频创意':'AI Video Generator: Explore Videos from Text & Images'}</h1><p>{locale==='zh-CN'?'从提示词或照片开始，描述一个明确的动作和镜头运动。可以了解参数并预览本地文件；可用模式与报价以生成面板为准。':'Start with a prompt or a photo. Describe one clear action and how the camera should move. Explore settings and local previews; check the generation panel for available modes and quotes.'}</p></header>}<PlatformGeneratorContent family={page.family==='wan'?'video':page.family} locale={locale} previewModel={previewModel} onPrompt={prompt=>{const next=changeGeneratorModel(changeGeneratorMode(state,'text'),'gpt-image-2');update({...next,prompt});document.getElementById('generator')?.scrollIntoView({behavior:'smooth'});document.getElementById('platform-generator-prompt')?.focus({preventScroll:true})}}/></>;
}
function ReactiveGenerator({ path, locale, initialQuery = '' }: Props) {
 const pathname = localizePath(path, locale);
 const serverPath = initialQuery ? `${pathname}?${initialQuery}` : pathname;
 const url = usePlatformUrl(serverPath);
 const parsed = new URL(url, 'https://local.invalid');
 if (parsed.pathname !== pathname) return null;

 const selectionKey = generatorSelectionKey(path, parsed.search);
 return <GeneratorSession key={`${locale}:${selectionKey}`} path={path} locale={locale} query={parsed.search}/>;
}

export function PlatformGeneratorPage({ path, locale, initialQuery }: Props) {
 const loading = locale === 'zh-CN' ? '正在准备本地参数预览…' : 'Preparing local parameter preview…';
 return <SiteShell locale={locale} currentPath={path}>
  <main className={`platform-generator platform-generator-${generatorPages[path].family}`} data-generator-page={path}>
   <Hero path={path} locale={locale}/>
   <Suspense fallback={<p>{loading}</p>}>
    <ReactiveGenerator path={path} locale={locale} initialQuery={initialQuery}/>
   </Suspense>
  </main>
 </SiteShell>;
}
