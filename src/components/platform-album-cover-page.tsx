/* eslint-disable @next/next/no-img-element */
import type {Metadata} from 'next';
import {ArrowRight,Download,RefreshCw,Zap,Gift,Sparkles,Music2,SlidersHorizontal,ImageDown} from 'lucide-react';
import {type Locale,localizePath,alternateLanguagesForPath} from '@/lib/i18n';
import {albumCopy} from '@/lib/platform-album-cover-content';
import {albumMedia} from '@/lib/platform-album-cover-media';
import {SiteShell} from './site-shell';
import {AlbumReactiveForm} from './platform-album-cover-workspace';
import styles from './platform-album-cover-page.module.css';
const path='/image-effects/ai-album-cover-generator';
const benefitIcons=[Zap,Gift,Sparkles,Music2,SlidersHorizontal,ImageDown];
function Cta({children,href='#generator'}:{children:React.ReactNode;href?:string}){return <a className={styles.ctaLink} href={href}>{children}<ArrowRight size={18}/></a>}
export function AlbumCoverPage({locale,query}:{locale:Locale;query:string}){
 const zh=locale==='zh-CN',d=albumCopy(locale),gallery=albumMedia.filter(m=>m.source.includes('/gallery/')),genres=albumMedia.filter(m=>m.source.includes('/resources/')).slice(0,8),names=['Phonk','Rap / Hip-Hop','EDM','R&B','Jazz','Pop','K-pop',zh?'超现实主义':'Surrealism'];
 const source=zh?'以下内容为 Lanta AI 公开来源介绍，含其生成速度、免费积分、自定义及导出说明，不代表 Makeup AI 已提供这些能力。本站仅提供本地参数和参考图片预览，生成暂不可用。':'The descriptions below introduce the public Lanta AI reference, including its speed, free credits, customization and export claims. These are not Makeup AI capabilities. This page provides local settings and reference image previews; generation is unavailable.';
 return <SiteShell locale={locale} currentPath={path}><main lang={locale} data-album-cover-page className={styles.page}>
 <nav className={styles.breadcrumb} aria-label={zh?'面包屑导航':'Breadcrumb'}><a href={localizePath('/',locale)}>{zh?'首页':'Home'}</a><span>›</span><a href={localizePath('/image-effects',locale)}>{zh?'图片特效':'Image Effects'}</a><span>›</span><span>AI Album Cover Generator</span></nav>
 <header className={styles.hero}><h1>{zh?<><span>AI 专辑封</span><span>面生成器</span></>:d.title}</h1><p>{d.intro}</p><p className={styles.attribution}>{zh?'来源介绍 · Lanta AI；Makeup AI 生成暂不可用。':'Source introduction · Lanta AI; Makeup AI generation is unavailable.'}</p></header>
 <div id="generator" className={styles.workspace}><AlbumReactiveForm locale={locale} query={query}/><aside className={styles.showcase} aria-label={zh?'来源公开示例':'Public reference examples'}>{gallery.map((m,i)=><article key={m.src}><img src={m.src} alt={zh?`来源公开示例 ${i+1}`:m.alt} loading={i>1?'lazy':'eager'}/><div><a href={m.src} download><Download size={14}/>{zh?'下载来源示例':'Download example'}</a><button disabled type="button"><RefreshCw size={14}/>{zh?'重新生成暂不可用':'Redo unavailable'}</button></div></article>)}<p className={styles.hint}>{zh?'来源展示素材，不是本站生成或账户作品。':'Public reference media, separate from project generations and account creations.'}</p></aside></div>
 <p className={styles.sourceNote}>{source}</p>
 <section id="examples" className={styles.section}><div className={styles.heading}><h2>{d.examples}</h2></div><div className={styles.examplesGrid}>{genres.map((m,i)=><article className={styles.genre} key={m.src}><img src={m.src} alt={zh?`${names[i]} 专辑封面来源示例`:m.alt} loading="lazy"/><h3>{names[i]}</h3></article>)}</div><div className={styles.actions}><Cta>{d.action}</Cta></div></section>
 <section className={`${styles.section} ${styles.benefits}`}><div className={styles.heading}><h2>{d.benefits}</h2><p>{d.benefitsIntro}</p></div><div className={styles.cards}>{d.cards.map((card,i)=>{const Icon=benefitIcons[i];return <article key={card.title}><span className={styles.icon}><Icon size={25}/></span><h3>{card.title}</h3><p>{card.body}</p></article>})}</div><div className={styles.actions}><Cta>{d.action}</Cta></div></section>
 <section className={`${styles.section} ${styles.features}`} aria-label={zh?'来源专辑封面工作流介绍':'Reference album cover workflow'}>{d.features.map((f,i)=>{const media=albumMedia.find(m=>m.src.endsWith('/'+f.image))!;return <article className={styles.feature} key={f.title}><div className={styles.featureImage}><img src={media.src} alt={zh?`${f.title}的来源配图`:i===0?'Jazz album cover with double bass and hands':media.alt} loading="lazy"/></div><div><h2>{f.title}</h2><p>{f.body}</p><Cta href={f.href}>{f.button}</Cta></div></article>})}</section>
 <section className={`${styles.section} ${styles.steps}`}><div className={styles.heading}><h2>{d.steps}</h2></div><div className={styles.cards}>{d.stepCards.map((card,i)=><article key={card.title}><span className={styles.stepNumber}>{i+1}</span><h3>{card.title}</h3><p>{card.body}</p></article>)}</div><div className={styles.actions}><Cta>{d.action}</Cta></div></section>
 <section className={styles.closing}><span className={styles.brandMark} aria-label="Makeup AI">M</span><h2>{d.cta}</h2><p>{d.ctaBody}</p><div className={styles.actions}><Cta>{d.action}</Cta></div><p className={styles.sourceNote}>{zh?'Makeup AI · 生成暂不可用':'Makeup AI · Generation unavailable'}</p></section>
 </main></SiteShell>;
}
export function albumMetadata(locale:Locale):Metadata{const d=albumCopy(locale),description=locale==='zh-CN'?'浏览专辑封面风格，设置专属模型与提示词并预览本地参考图片。Makeup AI 生成暂不可用。':'Explore album cover styles, model settings, prompts and local reference image previews. Makeup AI generation is unavailable.';return {title:{absolute:`${d.title} | Makeup AI`},description,alternates:{canonical:localizePath(path,locale),languages:alternateLanguagesForPath(path)},openGraph:{title:`${d.title} | Makeup AI`,description,locale:locale==='zh-CN'?'zh_CN':'en_US'}}}
