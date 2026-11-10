"use client";
import { Check, ImageIcon, Sparkles, Zap } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { perchanceConfig, restorePerchance, selectPerchance, type PerchanceState } from '@/lib/platform-perchance-state';
import { perchanceCopy } from '@/lib/platform-perchance-content';
import styles from './platform-perchance-page.module.css';

export function PlatformPerchanceForm({ state: raw, onChange, locale }: { state: PerchanceState; onChange: (state: PerchanceState) => void; locale: Locale }) {
 const state=restorePerchance(raw), config=perchanceConfig(state), c=perchanceCopy(locale), zh=locale==='zh-CN';
 return <div className={styles.workspace} data-generation-availability="unavailable" data-generator-model={state.model} data-generator-mode={state.mode}>
  <form className={styles.form} onSubmit={event=>event.preventDefault()}>
   <header><span className={styles.formIcon}><Sparkles aria-hidden="true"/></span><h3>{c[16]}</h3><p>{c[17]}</p></header>
   {!config&&<div role="alert" className={styles.modelAlert}><p>{zh?'当前请求的模型':'Requested model'}: <strong>{state.model}</strong></p><p>{state.issues.includes('unsupported-page-model')?(zh?'该模型存在于共享目录，但此页面不支持。':'This model exists in the shared catalog but is not supported on this page.'):state.issues.includes('unknown-model')?(zh?'无法识别此模型；已保留原始身份。':'This model is unknown; its requested identity is preserved.'):(zh?'本页面仅支持文生图模式。':'This page supports text to image only.')}</p><button type="button" onClick={()=>onChange(selectPerchance(state))}>{zh?'选择 Perchance 文生图':'Select Perchance Text to Image'}</button></div>}
   <label className={styles.stepLabel} htmlFor="perchance-prompt"><span>1</span>{c[19]}</label>
   <textarea id="perchance-prompt" name="prompt" rows={4} value={state.prompt} placeholder={zh?'详细描述你的创意画面…':'Describe your creative vision in detail...'} onChange={event=>onChange({...state,prompt:event.target.value})}/>
   {config&&<fieldset><legend className={styles.stepLabel}><span>2</span>{c[21]}</legend><div className={styles.ratios}>{config.ratios.map((ratio,i)=><button className={state.parameters.ratio===ratio?styles.selected:''} type="button" key={ratio} aria-pressed={state.parameters.ratio===ratio} aria-label={`${ratio} ${c[23+i*2]}`} onClick={()=>onChange({...state,parameters:{ratio}})}><span className={styles.ratioIcon} style={{aspectRatio:ratio.replace(':','/')}}/>{state.parameters.ratio===ratio&&<Check className={styles.check} aria-hidden="true"/>}<strong>{ratio}</strong><small>{c[23+i*2]}</small></button>)}</div></fieldset>}
   <button className={styles.generate} type="submit" disabled aria-describedby="perchance-unavailable">{state.prompt.trim()?(zh?'生成暂不可用':'Generation unavailable'):c[32]}<Zap size={20} aria-hidden="true"/><span aria-label={zh?'参照成本5积分':'Reference cost 5 credits'}>5</span></button>
   <p id="perchance-unavailable" className={styles.notice}>{zh?'这里只预览本地提示词与尺寸。通用生成尚未接通，不提交、不扣费；参照的5积分不是本站报价。原有3次美妆体验保留。':'Preview your prompt and size locally. General generation is not connected; no submission or charge occurs. The reference cost of 5 is not a Makeup AI quote. Your original 3 makeup trials remain.'}</p>
  </form>
  <aside className={styles.creations}><h3><ImageIcon aria-hidden="true"/>{c[34]}</h3><div className={styles.empty}><ImageIcon size={56} aria-hidden="true"/><p>{zh?'暂无本站生成作品':'No Makeup AI creations yet'}</p><p>{zh?'生成尚未开放；本页公开示例来自 Lanta AI，非本站账户作品。':'Generation is unavailable. Public examples on this page come from Lanta AI and are not works from your Makeup AI account.'}</p></div><div className={styles.ready}><span><i/>{zh?'本地参数预览':'Local settings preview'}</span><span>{c[37]}</span></div></aside>
 </div>;
}
