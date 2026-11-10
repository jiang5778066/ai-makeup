"use client";
/* eslint-disable @next/next/no-img-element */
import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowRight, Award, Brush, Camera, Check, ChevronRight, Gamepad2, Globe, Heart, ImageIcon, Megaphone, Palette, Shield, Sparkles, Users, Zap } from 'lucide-react';
import { localizePath, type Locale } from '@/lib/i18n';
import { perchanceCopy, perchanceEnglish, perchanceMedia, perchanceRelated } from '@/lib/platform-perchance-content';
import { initializePerchance, perchancePath, restorePerchance, type PerchanceState } from '@/lib/platform-perchance-state';
import { generatorSelectionKey, generatorSessions } from '@/lib/platform-generator-session';
import { PlatformNavigationLink } from './platform-navigation-link';
import { PlatformPerchanceForm } from './platform-perchance-form';
import { SiteShell } from './site-shell';
import { usePlatformUrl } from './use-platform-url';
import styles from './platform-perchance-page.module.css';

type Props={locale:Locale;initialQuery?:string};
function Source({locale}:{locale:Locale}){return <p className={styles.source}>{locale==='zh-CN'?'公开介绍与示例来源：':'Public information and examples: '}<a href="https://www.lantaai.com/tools/perchance-image-generator" target="_blank" rel="noreferrer">Lanta AI</a>{locale==='zh-CN'?'。非本站账户作品；第三方能力、免费及数据主张未经本站验证。':' — not works from your Makeup AI account. Third-party capabilities, free offers and figures are not verified by Makeup AI.'}</p>}
function PerchanceSession({query,locale}:{query:string;locale:Locale}){
 const key=generatorSelectionKey(perchancePath,query),[initial]=useState(()=>initializePerchance(query)),owner=useRef(0);
 const subscribe=useCallback((notify:()=>void)=>generatorSessions.subscribe(notify),[]),read=useCallback(()=>generatorSessions.read(key),[key]);
 const session=useSyncExternalStore(subscribe,read,()=>undefined),state=restorePerchance(session?.state??initial);
 useEffect(()=>{owner.current=generatorSessions.acquire(key,initial);const token=owner.current;return()=>generatorSessions.release(key,token)},[key,initial]);
 const update=(next:PerchanceState)=>generatorSessions.write(key,owner.current,restorePerchance(next));
 return <PlatformPerchanceForm state={state} onChange={update} locale={locale}/>;
}
function PerchanceBody({locale,initialQuery=''}:Props){
 const zh=locale==='zh-CN',c=perchanceCopy(locale),url=usePlatformUrl(`${localizePath(perchancePath,locale)}${initialQuery?'?'+initialQuery:''}`),parsed=new URL(url,'http://localhost');
 const featureIcons=[Zap,Palette,ImageIcon,Shield,Users,Award],useIcons=[Megaphone,Globe,Brush,Camera,Gamepad2,Heart];
 const heroImages=perchanceMedia.slice(0,4).map((media,sourceIndex)=>({...media,sourceIndex,label:c[9+sourceIndex],portrait:sourceIndex===0||sourceIndex===3}));
 const heroColumns=[heroImages.slice(0,2),heroImages.slice(2,4)];
 return <SiteShell locale={locale} currentPath={perchancePath}><main className={styles.page}>
  <nav className={styles.breadcrumb} aria-label={zh?'面包屑导航':'Breadcrumb'}><PlatformNavigationLink href={localizePath('/',locale)}>{zh?'首页':'Home'}</PlatformNavigationLink><ChevronRight/><PlatformNavigationLink href={localizePath('/tools',locale)}>{zh?'工具':'Tools'}</PlatformNavigationLink><ChevronRight/><span>{zh?'Perchance 图片生成器':'Perchance Image Generator'}</span></nav>
  <section className={styles.hero} data-perchance-section="hero"><div className={styles.heroCopy}><p className={styles.badge}><Sparkles size={16}/>{c[0]}</p><h1><span>Perchance</span><br/><span>{c[2]}</span></h1><p className={styles.heroDescription}>{c[3]}</p><ul className={styles.heroBadges}>{[4,5,6,7].map(i=><li key={i}>{c[i]}</li>)}</ul><a className={styles.cta} href="#generator">{c[8]}<ArrowRight size={20}/></a><Source locale={locale}/></div><div className={styles.heroGallery}>
   {heroColumns.map((column,columnIndex)=><div className={styles.heroColumn} key={columnIndex}>
    {column.map(image=><figure className={image.portrait?styles.heroPortrait:undefined} key={image.sourceIndex}><img src={image.src} alt={zh?`Lanta AI 公开示例：${image.label}`:image.alt} width={image.portrait?864:1024} height={image.portrait?1152:1024}/><figcaption>{image.label}</figcaption></figure>)}
   </div>)}
  </div></section>
  <section id="generator" className={styles.generator} data-perchance-section="generator"><div className={styles.sectionHeading}><p className={styles.badge}><Sparkles/>{c[13]}</p><h2><span>{zh?'用 Perchance 创作精彩图像':'Create Amazing Images'}</span>{zh?'，探索 AI 图片生成':' with AI Image Generator Perchance'}</h2><p>{c[15]}</p></div><PerchanceSession key={generatorSelectionKey(perchancePath,parsed.search)} locale={locale} query={parsed.search}/><Source locale={locale}/></section>
  <section className={styles.features} data-perchance-section="features"><div className={styles.sectionHeading}><p className={styles.badge}>{c[38]}</p><h2><span>{c[39]}</span><br/>{c[40]}</h2><p>{c[41]}</p></div><div className={styles.featureGrid}>{featureIcons.map((Icon,i)=>{const n=42+i*4;return <article className={styles.featureCard} key={n}><div className={styles.cardTop}><span className={styles.iconBox}><Icon/></span><span>{c[n]}</span></div><h3>{c[n+1]}</h3><p className={styles.metric}>{c[n+2]}</p><p>{c[n+3]}</p></article>})}</div><Source locale={locale}/></section>
  <section className={styles.trust} data-perchance-section="trust"><div className={styles.sectionHeading}><p className={styles.badge}>{c[66]}</p><h2>{c[67]}</h2><p>{c[68]}</p></div><div className={styles.trustGrid}><div className={styles.trustCopy}><h3>{c[69]}</h3><ul>{[70,71,72,73].map(i=><li key={i}><Check/>{c[i]}</li>)}</ul></div><div className={styles.styleGallery}>{perchanceMedia.slice(4).map((media,i)=><img key={media.src} src={media.src} alt={zh?`Lanta AI 公开风格示例 ${i+1}`:media.alt} width={1024} height={1024} loading="lazy"/>)}</div></div><Source locale={locale}/></section>
  <section className={styles.uses} data-perchance-section="uses"><div className={styles.sectionHeading}><p className={styles.badge}>{c[74]}</p><h2>{c[75]}</h2><p>{c[76]}</p></div><div className={styles.useGrid}>{useIcons.map((Icon,i)=>{const n=77+i*7;return <article className={styles.useCard} key={n}><span className={styles.iconBox}><Icon/></span><h3>{c[n]}</h3><p>{c[n+1]}</p><h4>{c[n+2]}</h4><ul>{[3,4,5,6].map(j=><li key={j}><Check size={15}/>{c[n+j]}</li>)}</ul></article>})}</div><Source locale={locale}/></section>
  <section className={styles.faq} data-perchance-section="faq"><div className={styles.sectionHeading}><p className={styles.badge}>{c[119]}</p><h2><span>{c[120]}</span><br/>{c[121]}</h2><p>{c[122]}</p></div><p className={styles.notice}>{zh?'FAQ 已按要求暂缓。以下为已保存的英文问题原文，未保存答案，不展开或补写。':'FAQ work is deferred. These are the saved original questions; answers were not captured and are not available.'}</p><ul>{perchanceEnglish.slice(123,131).map(q=><li key={q}>{q}</li>)}</ul><Source locale={locale}/></section>
  <section className={styles.related} data-perchance-section="related"><div className={styles.sectionHeading}><h2>{c[133]}</h2><p>{c[134]}</p></div><div className={styles.relatedGrid}>{perchanceRelated.map((path,i)=><PlatformNavigationLink key={path} href={localizePath(path,locale)}><span>{c[135+i]}</span><ArrowRight size={18}/></PlatformNavigationLink>)}</div></section>
  <section className={styles.bottom} data-perchance-section="bottom"><p className={styles.badge}><Sparkles/>{c[142]}</p><h2>{c[143]}</h2><p>{c[144]}</p><a className={styles.cta} href="#generator">{c[145]}<ArrowRight size={20}/></a><ul className={styles.bottomBadges}>{[146,147,148].map(i=><li key={i}><Check size={16}/>{c[i]}</li>)}</ul><Source locale={locale}/><p className={styles.notice}>{zh?'Makeup AI 通用生成暂不可用；可在上方预览本地提示词与尺寸。':'General generation is unavailable on Makeup AI. Explore the local prompt and size settings above.'}</p></section>
 </main></SiteShell>;
}
export function PlatformPerchancePage(props:Props){return <Suspense fallback={<p>{props.locale==='zh-CN'?'正在准备 Perchance 页面…':'Preparing Perchance…'}</p>}><PerchanceBody {...props}/></Suspense>}
