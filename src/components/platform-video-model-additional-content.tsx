"use client";

import {createElement,useEffect,useRef,useState,type ReactNode} from "react";
import {ChevronLeft,ChevronRight,ChevronDown,Pause,Play} from "lucide-react";
import type {AdditionalVideoModelPath} from "@/lib/platform-generator-data";
import {localizePath,type Locale} from "@/lib/i18n";
import {additionalVideoModelContent,type AdditionalContentNode,type AdditionalContentSection} from "@/lib/platform-video-model-additional-content-data";
import {additionalVideoModelPages} from "@/lib/platform-video-model-additional-data";
import {additionalMedia,vheerExamples} from "@/lib/platform-video-model-additional-media";
import {HomepageVideo} from "./platform-homepage-media";

function localTarget(raw:string,locale:Locale){
  if(raw==='#generator'||raw==='#video-generator')return '#video-model-settings';
  if(raw==='#how-it-works')return '#c2d-veo-3-how-it-works';
  if(raw.startsWith('#'))return raw;
  const url=new URL(raw,'https://www.lantaai.com');
  if(url.origin==='https://www.lantaai.com')return localizePath(url.pathname.replace(/^\/(zh-CN|zh)(?=\/|$)/,''),locale)+url.search+url.hash;
  if(['https://docs.x.ai/developers/pricing','https://developers.openai.com/api/docs/pricing','https://ai.google.dev/gemini-api/docs/pricing'].includes(url.origin+url.pathname.replace(/\/$/,'')))return url.href;
  return null;
}

// 舞台只管理本批示例身份与计时；实际播放和资源释放仍由HomepageVideo负责。
function VheerStage({locale}:{locale:Locale}){
  const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(true),[wide,setWide]=useState(false);
  const scope=useRef<HTMLDivElement>(null),zh=locale==='zh-CN';
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width: 1024px)');
    const update=()=>setReduced(media.matches),updateWidth=()=>setWide(desktop.matches);
    update();updateWidth();media.addEventListener('change',update);desktop.addEventListener('change',updateWidth);
    const observer=new IntersectionObserver(entries=>setVisible(entries[0]?.isIntersecting??false));observer.observe(scope.current!);
    return()=>{observer.disconnect();media.removeEventListener('change',update);desktop.removeEventListener('change',updateWidth)};
  },[]);
  useEffect(()=>{if(paused||!visible||reduced)return;const timer=setInterval(()=>setIndex(i=>(i+1)%4),5200);return()=>clearInterval(timer)},[paused,visible,reduced]);
  const example=vheerExamples[index];
  return <div ref={scope} className="platform-video-add-stage" data-vheer-stage data-example={example.id}>
    <div className="platform-video-add-stage-cards">{([{position:'left',offset:1},{position:'right',offset:2},{position:'front',offset:0}] as const).filter(card=>wide||card.position==='front').map(({position,offset})=>{const item=vheerExamples[(index+offset)%4],media=additionalMedia[item.source],poster=additionalMedia[item.posterSource]?.src;return <figure className={`platform-video-add-stage-card is-${position}`} key={item.id} aria-label={item.label[locale]} data-preview-card>
      {!paused&&visible&&media?.src&&poster?<HomepageVideo src={media.src} poster={poster} locale={locale}/>:poster?<img src={poster} alt={item.label[locale]}/>:<div className="platform-video-add-media-unavailable" role="img" aria-label={item.label[locale]}>{zh?'公开示例素材尚未就绪':'Public example media is not ready'}</div>}
    </figure>})}</div>
    <button className="platform-video-add-stage-prev" type="button" aria-label={zh?'上一个 Vheer AI 视频示例':'Previous Vheer AI video example'} onClick={()=>setIndex(i=>(i+3)%4)}><ChevronLeft/></button>
    <button className="platform-video-add-stage-next" type="button" aria-label={zh?'下一个 Vheer AI 视频示例':'Next Vheer AI video example'} onClick={()=>setIndex(i=>(i+1)%4)}><ChevronRight/></button>
    <div className="platform-video-add-stage-controls"><div className="platform-video-add-stage-dots">{vheerExamples.map((item,i)=><button type="button" key={item.id} aria-label={`${item.label[locale]} ${i+1}`} aria-pressed={index===i} onClick={()=>setIndex(i)}/>)}</div>
    <button className="platform-video-add-stage-pause" type="button" onClick={()=>setPaused(value=>!value)}>{paused?<Play size={16} aria-hidden="true"/>:<Pause size={16} aria-hidden="true"/>}{zh?(paused?'继续视频预览':'暂停视频预览'):(paused?'Resume video previews':'Pause video previews')}</button></div>
  </div>;
}

function AdditionalSection({section,locale,settings}:{section:AdditionalContentSection;locale:Locale;settings?:ReactNode}){
  const [tab,setTab]=useState(0),scope=useRef<HTMLDivElement>(null),zh=locale==='zh-CN';
  const render=(node:AdditionalContentNode,key:string):ReactNode=>{
    if(typeof node==='string')return node;
    if(node.action==='settings')return <div key={key} className={node.attrs?.className as string|undefined}>{settings}</div>;
    if(node.action==='stage')return <VheerStage key={key} locale={locale}/>;
    const props:Record<string,unknown>={...node.attrs,key};
    if(node.media){const media=additionalMedia[node.media.source],poster=media?.poster??(node.media.posterSource?additionalMedia[node.media.posterSource]?.src:null);return <div key={key} className={`platform-video-add-reference-video ${String(props.className??'')}`} data-reference-source={node.media.source} data-preview-card>
      {media?.src&&poster?<HomepageVideo src={media.src} poster={poster} locale={locale} nativeControls={node.media.nativeControls}/>:<div className="platform-video-add-media-unavailable" role="img" aria-label={zh?'公开参照视频素材尚未就绪':'Public reference video media is not ready'}/>}
    </div>}
    if(node.image){const local=additionalMedia[node.image.source]?.src;if(local){props.src=local;props.loading='lazy';}else return <span key={key} className={`platform-video-add-image-unavailable ${String(props.className??'')}`} role="img" aria-label={String(props.alt??(zh?'公开参照图片素材尚未就绪':'Public reference image media is not ready'))}/>;}
    if(node.tag==='a'){const target=localTarget(node.link??'',locale);if(target){props.href=target;if(target.startsWith('https:')){props.target='_blank';props.rel='noopener noreferrer';}}else{props['aria-disabled']=true;props.role='link';return createElement('span',props,node.children.map((child,i)=>render(child,`${key}-${i}`)));}}
    if(node.action==='display-play'){props['aria-hidden']=true;props['data-sora-display-play']=true;props.className=`${String(props.className??'')} platform-video-add-display-play`;delete props.tabIndex;}
    if(node.action==='tab'){
      const index=node.tab??0;props['aria-selected']=tab===index;props.tabIndex=tab===index?0:-1;props.onClick=()=>setTab(index);
      props.onKeyDown=(event:React.KeyboardEvent<HTMLButtonElement>)=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...(scope.current?.querySelectorAll<HTMLButtonElement>('[role=tab]')??[])],next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setTab(next);tabs[next]?.focus()};
    }
    if(node.panel!==undefined){props.hidden=node.panel!==tab;props.tabIndex=node.panel===tab?0:-1;props.className=`${String(props.className??'')} platform-video-add-tabpanel`;}
    if(node.action==='cta'){props.type='button';props.onClick=()=>{const target=document.getElementById('video-model-settings');target?.scrollIntoView({behavior:'smooth',block:'start'});target?.querySelector<HTMLElement>('button,textarea')?.focus({preventScroll:true})};}
    if(node.tag==='svg')props['aria-hidden']=true;
    if(['img','br','hr','input','source'].includes(node.tag))return createElement(node.tag,props);
    return createElement(node.tag,props,node.children.map((child,i)=>render(child,`${key}-${i}`)));
  };
  return <div ref={scope} className={`platform-video-add-section platform-video-add-section-${section.index}`} data-reference-section={section.index}>
    {section.index>0&&<p className="platform-video-model-source-note">{zh?'来源：采集时 Lanta AI 公开页面。以下性能、价格、许可和服务说明属于该来源资料，未经本项目独立核验；示例不是本站生成结果。':'Source: Lanta AI public page at capture time. The following performance, pricing, licensing and service statements belong to that source and are not independently verified here; examples are not project generations.'}</p>}
    {render(section.tree,String(section.index))}
  </div>;
}

function AdditionalFaq({path,locale}:{path:AdditionalVideoModelPath;locale:Locale}){
  const [open,setOpen]=useState<number[]>([]),page=additionalVideoModelPages[path];
  return <section className="platform-video-model-faq" aria-labelledby={`${page.catalogId}-faq-title`}><h2 id={`${page.catalogId}-faq-title`}>{locale==='zh-CN'?'常见问题':`${page.title.en} FAQ`}</h2>{page.faq.map((item,index)=><article key={item.question.en}><h3><button type="button" aria-expanded={open.includes(index)} aria-controls={`${page.catalogId}-faq-${index}`} onClick={()=>setOpen(items=>items.includes(index)?items.filter(i=>i!==index):[...items,index])}>{item.question[locale]}<ChevronDown size={18}/></button></h3>{open.includes(index)&&<p id={`${page.catalogId}-faq-${index}`}>{item.answer[locale]}</p>}</article>)}</section>;
}
export function AdditionalVideoModelHero({path,locale,settings}:{path:AdditionalVideoModelPath;locale:Locale;settings?:ReactNode}){return <AdditionalSection section={additionalVideoModelContent[path][locale][0]} locale={locale} settings={settings}/>;}
export function AdditionalVideoModelBody({path,locale}:{path:AdditionalVideoModelPath;locale:Locale}){const sections=additionalVideoModelContent[path][locale].filter(s=>s.index>0),footer=sections.at(-1);return <div className="platform-video-add-content">{sections.filter(s=>s!==footer).map(section=><AdditionalSection key={section.index} section={section} locale={locale}/>)}<AdditionalFaq path={path} locale={locale}/>{footer&&<AdditionalSection section={footer} locale={locale}/>}</div>;}
