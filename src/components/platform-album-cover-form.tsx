'use client';
import {useCallback,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {Sparkles,ImageIcon,Type} from 'lucide-react';
import type {Locale} from '@/lib/i18n';
import {albumModels} from '@/lib/platform-album-cover-models';
import {albumCopy} from '@/lib/platform-album-cover-content';
import {AlbumSessions,albumSessionLimits,albumConfig,albumInitialize,albumSelectModel,albumSelectMode,albumSessionKey,albumSessions,type AlbumState,type AlbumMode} from '@/lib/platform-album-cover-state';
import {AlbumUpload} from './platform-album-cover-upload';
import styles from './platform-album-cover-page.module.css';
export function AlbumForm({locale,query}:{locale:Locale;query:string}){return <AlbumFormSession key={albumSessionKey(locale,query)} locale={locale} query={query}/>}
function AlbumFormSession({locale,query}:{locale:Locale;query:string}){
 const zh=locale==='zh-CN',copy=albumCopy(locale),key=albumSessionKey(locale,query),owner=useRef(0),[initial]=useState(()=>albumInitialize(query,locale));
 // 超大地址使用组件私有的有界store；完整React key仍负责query/语言卸载边界。
 const [store]=useState(()=>key.length>albumSessionLimits.key?new AlbumSessions():albumSessions);
 const sessionKey=key.length>albumSessionLimits.key?'current':key;
 const read=useCallback(()=>store.read(sessionKey),[store,sessionKey]);
 const session=useSyncExternalStore(store.subscribe,read,()=>undefined),state=session?.state??initial,config=albumConfig(state);
 useEffect(()=>{owner.current=store.acquire(sessionKey,initial);const token=owner.current;return()=>store.release(sessionKey,token)},[store,sessionKey,initial]);
 const update=(next:AlbumState)=>store.write(sessionKey,owner.current,next);
 const tab=(mode:AlbumMode)=>update(albumSelectMode(state,mode));
 const ratioLabels=config?.desktopRatios??[];
 return <form id="album-form" className={styles.form} onSubmit={e=>e.preventDefault()} data-album-model={state.model} data-generation-availability="unavailable"><h2><Sparkles size={24}/>{copy.form}</h2>
 <div className={styles.tabs} role="tablist" aria-label={zh?'生成模式':'Generation mode'}>{(['image','text'] as const).map((mode,i)=><button key={mode} type="button" role="tab" aria-controls="album-panel" aria-selected={state.mode===mode} tabIndex={state.mode===mode?0:-1} onClick={()=>tab(mode)} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?'image':e.key==='End'?'text':state.mode==='image'?'text':'image';tab(next);(e.currentTarget.parentElement?.children[next==='image'?0:1] as HTMLButtonElement)?.focus()}}>{i===0?<ImageIcon size={16}/>:<Type size={16}/>} {zh?(mode==='image'?'图生图':'文生图'):(mode==='image'?'Image To Image':'Text to Image')}</button>)}</div>
 <div id="album-panel" role="tabpanel"><label className={styles.label} htmlFor="album-model">{zh?'模型':'Model'}</label><select id="album-model" value={state.issues.length?'__unavailable':state.model} onChange={e=>update(albumSelectModel(state,e.target.value))}>{(!config||state.issues.includes('model'))&&<option value="__unavailable" disabled>{state.model} — {zh?'选择合法模型':'Choose a supported model'}</option>}{albumModels.filter(m=>m.mode===state.mode).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
 {!!state.issues.length&&<p role="alert" className={styles.error}>{zh?'此地址含不支持或冲突的模型/模式参数，参数与文件预览未激活。请主动选择本页合法模型或模式恢复。':'This URL contains unsupported or conflicting model/mode parameters. Settings and file previews are inactive. Choose a supported model or mode to restore them.'}</p>}
 {config&&<><label className={styles.label} htmlFor="album-prompt">{zh?'提示词':'Prompt'}</label><textarea id="album-prompt" name="prompt" value={state.prompt} maxLength={config.promptLimit} rows={4} placeholder={zh?'请描述画面内容、风格、氛围及其他约束条件...':'Describe the subject, style, mood, and any constraints...'} onChange={e=>update({...state,prompt:e.target.value})}/>
 <div className={styles.parameters}>{!!config.resolutions.length&&<fieldset className={styles.choices}><legend>{zh?'分辨率':'Resolution'}</legend>{config.resolutions.map(v=><button key={v} type="button" aria-pressed={state.resolution===v} onClick={()=>update({...state,resolution:v})}>{v}</button>)}</fieldset>}
 {!!config.ratios.length&&<fieldset className={`${styles.choices} ${styles.ratio}`}><legend id="album-ratio-label">{zh?'画幅比例':'Aspect Ratio'}</legend><select aria-labelledby="album-ratio-label" className={styles.ratioSelect} value={state.ratio} onChange={e=>update({...state,ratio:e.target.value})}>{config.ratios.map(r=><option key={r.id} value={r.id}>{zh&&r.label==='Auto'?'自动':r.label}</option>)}</select><div className={styles.ratioButtons}>{ratioLabels.map(label=>{const ratio=config.ratios.find(r=>r.label===label)!;return <button key={ratio.id} type="button" aria-pressed={state.ratio===ratio.id} onClick={()=>update({...state,ratio:ratio.id})}><span className={styles.ratioIcon} style={{aspectRatio:label==='Auto'?'1':label.replace(':','/')}}/>{zh&&label==='Auto'?'自动':label}</button>})}</div></fieldset>}</div>
 {config.enhance&&<div className={styles.enhance}><span>{zh?'提示词增强':'Prompt Enhance'}<small>{zh?'来源参数预览；不会调用增强服务。':'Reference setting preview; no enhancement service is called.'}</small></span><button type="button" role="switch" aria-label={zh?'提示词增强':'Prompt Enhance'} aria-checked={state.enhance} onClick={()=>update({...state,enhance:!state.enhance})}><span/></button></div>}
 {state.mode==='image'&&config.reference&&<AlbumUpload key={`${locale}:${key}:${config.id}:${state.mode}`} config={config.reference} locale={locale}/>}</>}
 <button className={styles.generate} type="submit" disabled><Sparkles size={18}/>{zh?'生成暂不可用':'Generate unavailable'}</button><p className={styles.hint}>{zh?'仅本地参数与图片预览，不上传、不生成、不扣额度。':'Local settings and image previews only. No upload, generation, or credits used.'}{state.model==='2403'&&<><br/>{zh?'来源默认展示：14 积分；不代表本站计费。':'Source default display: 14 credits; this is not Makeup AI pricing.'}</>}</p>
 </div></form>;
}
