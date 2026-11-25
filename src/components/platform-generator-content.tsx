"use client";
import{useRef,useState}from'react';import{ArrowLeft,ArrowRight,ChevronDown,Copy,Sparkles,Zap,Share2,Upload,Download,Globe,Maximize,AArrowUp,CheckCircle2}from'lucide-react';
import type{Locale}from'@/lib/i18n';import{generatorContent,type GeneratorContentSection,type GeneratorContentCard}from'@/lib/platform-generator-content-data';import{generatorMedia,localGeneratorMedia}from'@/lib/platform-generator-media';import{HomepageVideo}from'./platform-homepage-media';import { publicPlatformHref } from '@/lib/platform-navigation';
import { PlatformNavigationLink } from './platform-navigation-link';
import { guideTranslation, isVideoGuidePath, videoGuides } from '@/lib/platform-video-guides';
const clean=(text:string)=>text.replaceAll('Lanta AI',/[\u4e00-\u9fff]/.test(text)?'公开参照':'the reference platform').replaceAll('Lanta',/[\u4e00-\u9fff]/.test(text)?'公开参照':'the reference platform');
function Picture({src,alt=''}:{src:string;alt?:string}){const local=localGeneratorMedia(src);return local?<img src={local} alt={alt} loading="lazy"/>:null /* eslint-disable-line @next/next/no-img-element */}
function Heading({section,family,index,locale}:{section:GeneratorContentSection;family:string;index:number;locale:Locale}){const title=clean(section.title),match=family==='nano'?(index===0?'Nano Banana Pro':title):family==='image'?(title.includes('AI Image Generator')?'AI Image Generator':title.includes('AI 图片生成器')?'AI 图片生成器':title.includes('AI 图像生成器')?'AI 图像生成器':''):'';const split=match?title.split(match):[];const badges=locale==='zh-CN'?['效果展示','核心优势','简单流程','应用场景','常见问题']:['See It In Action','Key Features','Simple Process','Use Cases','FAQ'];return <header className="platform-generator-section-heading">{family==='image'&&<span className="platform-generator-section-badge">{badges[index]}</span>}<h2>{match?<>{split[0]}<span className="platform-generator-gradient">{match}</span>{split.slice(1).join(match)}</>:title}</h2>{section.description&&<p>{clean(section.description)}</p>}</header>}

function Cta({ locale, label }: { locale: Locale; label?: string }) {
  return <a className="platform-generator-cta" href="#generator">{label ?? (locale === 'zh-CN' ? '浏览模型与参数' : 'Explore Models & Settings')}<ArrowRight size={17}/></a>;
}
const generationPanelHint = {
  en: 'Check the generation panel for available modes.',
  'zh-CN': '可用模式以生成面板为准。',
};

function PublicData({ locale, availability }: { locale: Locale; availability: string }) {
  const zh = locale === 'zh-CN';
  const description = zh
    ? '以下为外部模型公开资料与参照示例，非本项目生成、能力验证或用户作品。'
    : 'External model information and public reference examples. These are not project generations, verified project capabilities, or user creations. ';
  return <p className="platform-generator-public-note">{description}{availability}</p>;
}
function SourceText({card}:{card:GeneratorContentCard}){return <><h3>{card.title}</h3><p>{clean(card.description)}</p>{!!card.bullets.length&&<ul>{card.bullets.map((line,i)=><li key={i}>{clean(line)}</li>)}</ul>}</>}
function CardGrid({section,images=false,columns=3,decoration}:{section:GeneratorContentSection;images?:boolean;columns?:number;decoration?:'features'|'steps'}){return <div className="platform-generator-card-grid" style={{'--generator-columns':columns}as React.CSSProperties}>{section.cards.map((card,i)=><article key={card.title} className="platform-generator-info-card">{images&&<Picture src={card.image||section.images[i]?.src||''}/>}<div>{decoration&&<div className="platform-generator-card-decoration">{decoration==='steps'?<><b>{String(i+1).padStart(2,'0')}</b><small>Step {i+1}</small>{i===0?<Upload/>:i===1?<Sparkles/>:<Download/>}</>:i===0?<Sparkles/>:i===1?<Zap/>:<Share2/>}</div>}<SourceText card={card}/></div></article>)}</div>}
function Alternating({section,locale}:{section:GeneratorContentSection;locale:Locale}){return <div className="platform-generator-alternating">{section.cards.map((card,i)=><article key={card.title}><div><SourceText card={card}/><Cta locale={locale}/></div>{(card.image||section.images[i]?.src)?<Picture src={card.image||section.images[i]?.src}/>:card.video&&generatorMedia[card.video]?<div data-preview-card><HomepageVideo src={localGeneratorMedia(card.video)} poster={generatorMedia[card.video].poster} locale={locale}/></div>:null}</article>)}</div>}
function NanoFeatures({section,locale}:{section:GeneratorContentSection;locale:Locale}){
 const highlight=(text:string,terms:string[])=>{const pattern=terms.map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');return pattern?text.split(new RegExp(`(${pattern})`,'g')).map((part,i)=>terms.includes(part)?<strong key={i}>{part}</strong>:part):text};
 return <div className="platform-generator-nano-features">{section.cards.map((card,i)=>i<3?<article className="platform-generator-nano-feature" key={card.title}>
  <div className="platform-generator-nano-copy"><span className="platform-generator-nano-badge">{i===0?<Sparkles/>:i===1?<AArrowUp/>:<Globe/>}{card.badge}</span><h3>{card.title}</h3>{card.description.split('\n').map((text,j)=><p key={j}>{highlight(text,card.emphasis??[])}</p>)}</div>
  <figure><Picture src={card.image} alt={section.images[i]?.alt}/><figcaption><span>{i===1?<Maximize/>:i===2?<Globe/>:<i/>}{card.caption}</span><p>{card.captionDescription}</p></figcaption></figure>
 </article>:<aside className="platform-generator-nano-summary" key={card.title}><h3>{card.title}</h3><p>{card.description}</p><ul aria-label={locale==='zh-CN'?'公开模型资料要点':'Public model information highlights'}>{card.bullets.map(line=><li key={line}><CheckCircle2/>{line}</li>)}</ul></aside>)}</div>;
}
function UseTabs({section,locale}:{section:GeneratorContentSection;locale:Locale}){const[index,setIndex]=useState(0),card=section.cards[index];return <><div className="platform-generator-content-tabs" role="tablist" aria-label={section.title}>{section.cards.map((item,i)=><button type="button" role="tab" aria-selected={index===i} tabIndex={index===i?0:-1} id={`generator-use-${i}`} aria-controls="generator-use-panel" key={item.title} onClick={()=>setIndex(i)} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?section.cards.length-1:(i+(e.key==='ArrowRight'?1:-1)+section.cards.length)%section.cards.length;setIndex(n);(e.currentTarget.parentElement?.children[n]as HTMLElement)?.focus()}}}>{section.tabs[i]||item.title}</button>)}</div><div className="platform-generator-use-panel" role="tabpanel" id="generator-use-panel" aria-labelledby={`generator-use-${index}`} key={index}><div><SourceText card={card}/><Cta locale={locale}/></div><Picture src={section.images[index]?.src||card.image}/></div></>}
const stepSources=['choose-a-mode.png','pick-a-model-and-settings.png','Generate-Your-Video.png','Preview-and-Download.png'];
function VideoSteps({ section, locale }: { section: GeneratorContentSection; locale: Locale }) {
  const [index, setIndex] = useState(0);
  const previewDescription = locale === 'zh-CN'
    ? '浏览公开示例；不代表账户历史或本项目生成。'
    : 'Browse public examples, separate from account history and project generation.';
  return <div className="platform-generator-video-steps">
    <div>{section.cards.map((card, i) => <button type="button" aria-pressed={index === i} onClick={() => setIndex(i)} key={card.title}>
      <h3>{card.title}</h3>
      <p>{i === 3 ? previewDescription : clean(card.description)}</p>
    </button>)}</div>
    <div><Picture src={`https://cdn.lantaai.com/resources/ai-video-generator/${stepSources[index]}`}/><Cta locale={locale}/></div>
  </div>;
}
function VideoCarousel({section,locale}:{section:GeneratorContentSection;locale:Locale}){const ref=useRef<HTMLDivElement>(null),zh=locale==='zh-CN';const sources=section.videos.filter(Boolean);return <div className="platform-generator-video-carousel"><button type="button" aria-label={zh?'上一个示例':'Show previous examples'} onClick={()=>ref.current?.scrollBy({left:-(ref.current.querySelector('div')?.getBoundingClientRect().width||260)-20,behavior:'smooth'})}><ArrowLeft/></button><div ref={ref} className="platform-generator-video-track" tabIndex={0} aria-label={zh?'公开示例横向列表':'Public example carousel'}>{sources.map(src=>generatorMedia[src]&&<div data-preview-card key={src}><HomepageVideo poster={generatorMedia[src].poster} src={localGeneratorMedia(src)} locale={locale}/></div>)}</div><button type="button" aria-label={zh?'下一个示例':'Show next examples'} onClick={()=>ref.current?.scrollBy({left:(ref.current.querySelector('div')?.getBoundingClientRect().width||260)+20,behavior:'smooth'})}><ArrowRight/></button></div>}
function Faq({section,family,availability}:{section:GeneratorContentSection;family:string;availability:string}){const[open,setOpen]=useState<number|null>(family==='image'?0:null);const answer=(card:GeneratorContentCard)=>card.description||availability;return <div className="platform-generator-faq">{section.cards.map((card,i)=>family==='nano'?<details key={card.title}><summary><h3>{card.title}</h3><ChevronDown size={18}/></summary><p>{answer(card)}</p></details>:<div key={card.title}><h3><button type="button" aria-expanded={open===i} aria-controls={`generator-faq-${i}`} onClick={()=>setOpen(open===i?null:i)}><span>{family==='image'?'':'?'}</span>{card.title}<ChevronDown size={20}/></button></h3>{open===i&&<p id={`generator-faq-${i}`}>{answer(card)}</p>}</div>)}</div>}
function Prompts({section,locale,onPrompt}:{section:GeneratorContentSection;locale:Locale;onPrompt:(text:string)=>void}){const[feedback,setFeedback]=useState(''),zh=locale==='zh-CN';return <><div className="platform-generator-card-grid">{section.cards.map((card,i)=><article className="platform-generator-prompt-card" key={card.title}><Picture src={section.images[i]?.src||card.image}/><h3>{card.title}</h3><p>{card.description}</p><div><button type="button" onClick={()=>{void navigator.clipboard.writeText(card.description).then(()=>setFeedback(zh?'已复制提示词':'Prompt copied')).catch(()=>setFeedback(zh?'无法复制，请选中提示词手动复制。':'Copy failed. Select and copy the prompt manually.'))}}><Copy size={14}/>{zh?'复制':'Copy'}</button><button type="button" onClick={()=>onPrompt(card.description)}><Sparkles size={14}/>{zh?'使用提示词':'Use Prompt'}</button></div></article>)}</div><p role="status">{feedback}</p></>}
function Discussions({section,locale}:{section:GeneratorContentSection;locale:Locale}){const zh=locale==='zh-CN';return <div className="platform-generator-discussions">{section.cards.map((card,i)=><article key={card.title}><small>Reddit · {zh?'公开来源摘要':'Public source summary'}</small><h3>{card.title}</h3><p>{card.description}</p><Picture src={section.images[i*2+1]?.src||card.image}/>{card.source&&<a href={card.source} target="_blank" rel="noreferrer">{zh?'查看原始讨论':'View original discussion'} ↗</a>}</article>)}</div>}
function ToolCards({ section, locale, guides = false }: { section: GeneratorContentSection; locale: Locale; guides?: boolean }) {
  const zh = locale === 'zh-CN';
  const unavailable = guides
    ? (zh ? '指南页面待开放' : 'Guide page not available yet')
    : (zh ? '工具暂未开放' : 'Tool not available yet');
  return <div className={`platform-generator-card-grid ${guides ? 'platform-generator-guides' : ''}`}>
    {section.cards.map((card, i) => {
      const href = publicPlatformHref(card.href, locale);
      const path = href?.split(/[?#]/, 1)[0].replace(/^\/zh-CN(?=\/)/, "");
      if (href && path && isVideoGuidePath(path)) {
        const guide = videoGuides[path];
        return <article className="platform-generator-info-card" key={card.title}>
          <PlatformNavigationLink href={href}>
            <h3>{guideTranslation(guide.title, locale)}</h3>
            <p>{guideTranslation(guide.summary, locale)}</p>
            <span className="platform-generator-hint">{zh ? "查看指南" : "Read guide"}</span>
          </PlatformNavigationLink>
        </article>;
      }
      const image = card.image || section.images[i]?.src || '';
      const preview = generatorMedia[card.video];
      const text = <><h3>{card.title}</h3>{card.description && <p>{card.description}</p>}</>;
      return <article className="platform-generator-info-card" key={card.title}>
        {preview ? <div data-preview-card><HomepageVideo src={preview.src} poster={preview.poster} locale={locale} trigger="hover" previewTitle={card.title}/></div> : <Picture src={image}/>}
        {href ? <PlatformNavigationLink href={href}>{text}</PlatformNavigationLink> : <>{text}<span className="platform-generator-hint">{unavailable}</span></>}
      </article>;
    })}
  </div>;
}

export function PlatformGeneratorContent({ family, locale, onPrompt, previewModel }: {
  family: 'image' | 'gpt' | 'nano' | 'video';
  locale: Locale;
  onPrompt: (text: string) => void;
  previewModel?: string;
}) {
 const sections = generatorContent[family][locale];
 const zh = locale === 'zh-CN';
 const availability = previewModel
   ? (zh ? `${previewModel} 仅供预览，该模型的生成暂未开放。` : `${previewModel} is available for preview only. Generation with this model is not available.`)
   : generationPanelHint[locale];
 return <div className={`platform-generator-content-sections platform-generator-content-${family}`}>{sections.map((section,i)=>{
 let body:React.ReactNode;const last=i===sections.length-1;
 if (last) {
   const title = family === 'image' ? (zh ? '开始探索 AI 图片生成器' : 'Explore the AI Image Generator')
     : family === 'video' ? (zh ? '探索 AI 视频创作参数' : 'Explore AI Video Settings')
     : section.title.replaceAll('Lanta AI', 'FrameKoi');
   const description = `${zh ? '浏览模型资料，预览本地文件与创作参数。' : 'Explore model information, local previews and creative settings. '}${availability}`;
   const label = previewModel ? undefined : (zh ? '查看生成面板' : 'View generation panel');
   return <section className="platform-generator-bottom-cta" key={i}>
     <h2>{title}</h2><p>{description}</p><Cta locale={locale} label={label}/>
   </section>;
 }
 if(i===sections.length-2)body=<Faq section={section} family={family} availability={availability}/>;
 else if(family==='gpt'&&i===0||family==='video'&&i===4)body=<UseTabs section={section} locale={locale}/>;
 else if(family==='nano'&&i===1)body=<NanoFeatures section={section} locale={locale}/>;
 else if(family==='gpt'&&i===1||family==='video'&&i===1)body=<Alternating section={section} locale={locale}/>;
 else if(family==='gpt'&&i===2)body=<div className="platform-generator-table-wrap"><table><tbody>{section.table.map((row,j)=><tr key={j}>{row.map((cell,k)=>j===0?<th key={k}>{cell}</th>:<td key={k}>{cell}</td>)}</tr>)}</tbody></table></div>;
 else if(family==='gpt'&&i===3)body=<Prompts section={section} locale={locale} onPrompt={onPrompt}/>;
 else if(family==='gpt'&&i===4)body=<Discussions section={section} locale={locale}/>;
 else if(family==='video'&&i===0)body=<VideoCarousel section={section} locale={locale}/>;
 else if(family==='video'&&i===3)body=<VideoSteps section={section} locale={locale}/>;
 else if(family==='video'&&(i===5||i===6))body=<ToolCards section={section} locale={locale} guides={i===6}/>;
 else if(family==='image'&&i===0)body=<div className="platform-generator-example-grid">{['Realistic Portrait','Fantasy Landscape','Cartoon Style','Poster Rendering'].map((name,j)=><article key={name}><Picture src={section.images[j]?.src||''}/><h3>{zh?['写实人像','幻想风景','卡通风格','海报排版'][j]:name}</h3><small>{zh?'公开参照示例':'Public reference example'}</small></article>)}</div>;
 else body=<CardGrid section={section} images={family==='image'&&i===3||family==='video'&&i===2} columns={family==='nano'&&i===3?4:3} decoration={family==='image'&&i===1?'features':family==='image'&&i===2?'steps':undefined}/>;
 return <section className={`platform-generator-section platform-generator-section-${family}-${i}`} key={i}><Heading section={section} family={family} index={i} locale={locale}/>{(i===0||family==='gpt'&&i===2||family==='nano'&&i===1)&&<PublicData locale={locale} availability={availability}/>} {body}</section>;
 })}</div>}
