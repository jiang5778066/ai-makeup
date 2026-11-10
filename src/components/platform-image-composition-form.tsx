'use client';
import {Suspense,useCallback,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {Sparkles} from 'lucide-react';
import {localizePath,type Locale} from '@/lib/i18n';
import {compositionContent} from '@/lib/platform-image-composition-content';
import {compositionKey,compositionConfig,compositionModels,compositionModel,compositionSessions,initializeComposition,selectCompositionModel,type CompositionKind,type CompositionState} from '@/lib/platform-image-composition-state';
import {PlatformGeneratorModelPicker} from './platform-generator-model-picker';
import {usePlatformUrl} from './use-platform-url';
import {CompositionUpload} from './platform-image-composition-upload';
import styles from './platform-image-composition-page.module.css';
function Choices({label,values,value,onChange,ratio=false,locale}:{label:string;values:string[];value?:string;onChange:(v:string)=>void;ratio?:boolean;locale:Locale}){
 if(!values.length)return null;const zh=locale==='zh-CN';return <fieldset className={styles['platform-field']}><legend>{label}</legend>{ratio&&<select className={styles['platform-ratio-mobile']} aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{values.map(option=><option key={option} value={option}>{option==='Auto'&&zh?'自动':option}</option>)}</select>}<div className={ratio?styles['platform-ratios']:styles['platform-choices']}>
 {values.map(option=><button type="button" key={option} aria-pressed={option===value} onClick={()=>onChange(option)}>{ratio&&<span aria-hidden style={{aspectRatio:option==='Auto'?'1':option.replace(':',' / ')}}/>}{option==='Auto'&&zh?'自动':option}</button>)}</div></fieldset>;
}
function CompositionSession({kind,locale,query}:{kind:CompositionKind;locale:Locale;query:string}){
 const key=compositionKey(kind,query),[initial]=useState(()=>initializeComposition(kind,locale,query)),owner=useRef(0),hadFiles=useRef(false),zh=locale==='zh-CN';
 const read=useCallback(()=>compositionSessions.read(key),[key]),session=useSyncExternalStore(compositionSessions.subscribe,read,()=>undefined),state=session?.state??initial,config=compositionConfig(state);
 useEffect(()=>{owner.current=compositionSessions.acquire(key,initial);const token=owner.current;return()=>compositionSessions.release(key,token,hadFiles.current);},[key,initial]);
 const update=(next:CompositionState)=>compositionSessions.write(key,owner.current,next),onFiles=useCallback((value:boolean)=>{hadFiles.current=value;},[]);
 const issues:Record<string,string>=zh?{'unknown-model':'查询包含未知模型；本页保留Nano Banana Pro，未替代未知服务。','path-model-conflict':'查询模型与本页初选身份冲突，仍初选Nano Banana Pro。可主动切换。','unsupported-mode':'本页仅提供图片合成参数预览，不支持查询中的模式。','invalid-resolution':'查询分辨率不支持，显示本页默认值。','invalid-ratio':'查询画幅比例不支持，显示本页默认值。'}:{'unknown-model':'The query contains an unknown model. This page keeps Nano Banana Pro; no service was substituted.','path-model-conflict':'The requested model conflicts with this page. Nano Banana Pro is initially selected; you can explicitly change it.','unsupported-mode':'This page previews image composition settings only. The requested mode is unsupported.','invalid-resolution':'Unsupported query resolution. Showing the page default.','invalid-ratio':'Unsupported query ratio. Showing the page default.'};
 return <form className={styles['platform-form']} onSubmit={e=>e.preventDefault()} data-generation-availability="unavailable" data-composition-model={state.model}>
 <h2>{compositionContent[kind][locale].title}</h2>{state.issues.map(issue=><p key={issue} role="status" className={styles['platform-error']}>{issues[issue]}</p>)}
 {session?.filesReleased&&<p role="status" className={styles['platform-hint']}>{zh?'页面切换已释放本地文件，请重新选择。':'Local files were released when the page changed. Please select them again.'}</p>}
 {config?.reference&&<CompositionUpload key={state.model} config={config.reference} locale={locale} onFiles={onFiles}/>}
 <label className={styles['platform-field']} htmlFor="platform-composition-prompt">{zh?'提示词':'Prompt'}<textarea id="platform-composition-prompt" name="prompt" value={state.prompt} maxLength={config?.promptLimit??20000} rows={4} placeholder={zh?'请描述画面内容、风格、氛围及其他约束条件...':'Describe the image, style, mood, and any constraints...'} onChange={e=>update({...state,prompt:e.target.value})}/></label>
 <div className={styles['platform-picker']}><PlatformGeneratorModelPicker models={compositionModels} value={state.model} onChange={id=>update(selectCompositionModel(state,id))} locale={locale}/></div>
 {state.model!=='nano-banana-pro'&&<button type="button" className={styles['platform-restore']} onClick={()=>update(selectCompositionModel(state,'nano-banana-pro'))}>{zh?'恢复Nano Banana Pro':'Restore Nano Banana Pro'}</button>}
 {config&&<><Choices label={zh?'分辨率':'Resolution'} values={config.resolutions} value={state.parameters.resolution} onChange={resolution=>update({...state,parameters:{...state.parameters,resolution}})} locale={locale}/><Choices label={zh?'画幅比例':'Ratio'} values={config.ratios} value={state.parameters.ratio} onChange={ratio=>update({...state,parameters:{...state.parameters,ratio}})} ratio locale={locale}/></>}

 <button type="button" disabled className={styles['platform-submit']}><Sparkles size={18}/>{zh?'生成暂不可用':'Generation not available yet'}</button><p className={styles['platform-hint']}>{zh?'仅本地参数与文件预览，不生成、不扣额度。':'Local parameter and file preview only. No generation or credits used.'}</p>
 <span className={styles['platform-hint']}>{zh?'当前模型':'Current model'}: {compositionModel(state.model)?.name??state.model}</span></form>;
}
function ReactiveForm({kind,locale,initialQuery}:{kind:CompositionKind;locale:Locale;initialQuery:string}){const path=`/tools/ai-image-${kind}`,url=usePlatformUrl(`${localizePath(path,locale)}${initialQuery?`?${initialQuery}`:''}`),parsed=new URL(url,'https://local.invalid');return parsed.pathname===localizePath(path,locale)?<CompositionSession key={`${locale}:${compositionKey(kind,parsed.search)}`} kind={kind} locale={locale} query={parsed.search}/>:null;}
export function CompositionForm(props:{kind:CompositionKind;locale:Locale;initialQuery:string}){return <Suspense fallback={<p>{props.locale==='zh-CN'?'正在准备本地预览…':'Preparing local preview…'}</p>}><ReactiveForm {...props}/></Suspense>;}
