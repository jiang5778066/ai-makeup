"use client";
import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Type, X } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { generatorModels, type GeneratorMode } from '@/lib/platform-generator-data';
import { generatorConfig, generatorModel, type GeneratorParameters } from '@/lib/platform-generator-parameters';
import { changeDreamfaceMode, chooseDreamfaceModel, selectDreamfaceDuration, type DreamfaceState } from '@/lib/platform-dreamface-data';
import { dreamfaceIcons } from '@/lib/platform-dreamface-media';
import { GeneratorChoices, GeneratorIssues, GeneratorPrompt, GeneratorUnavailable } from './platform-image-generator-form';
import { PlatformGeneratorModelPicker } from './platform-generator-model-picker';
import { PlatformGeneratorUpload } from './platform-generator-upload';

type Props={state:DreamfaceState;onChange:(state:DreamfaceState)=>void;locale:Locale;onFiles:()=>void;filesReleased?:boolean};
function DreamfaceGate({locale,trigger,onClose}:{locale:Locale;trigger:HTMLElement;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),zh=locale==='zh-CN';
 useEffect(()=>{const node=ref.current!,overflow=document.body.style.overflow;document.body.style.overflow='hidden';node.showModal();return()=>{node.close();document.body.style.overflow=overflow;trigger.focus()}},[trigger]);
 return <dialog ref={ref} className="platform-dreamface-gate" aria-labelledby="dreamface-gate-title" onCancel={event=>{event.preventDefault();onClose()}}><button type="button" aria-label={zh?'关闭提示':'Close notice'} onClick={onClose}><X aria-hidden="true"/></button>{dreamfaceIcons.vip&&<img src={dreamfaceIcons.vip} alt=""/> /* eslint-disable-line @next/next/no-img-element */}<h2 id="dreamface-gate-title">{zh?'5秒选项的会员提示':'Membership notice for the 5s option'}</h2><p>{zh?'公开参照中，Lanta 2.1 的5秒选项提示会员条件。这里只预览该条件，时长和提示词保持原值。生成暂不可用，不购买、不解锁、不扣费。':'The captured reference prompts for membership for Lanta 2.1 at 5s. This is a local preview of that condition. Your duration and Prompt are unchanged. Generation is unavailable; no purchase, unlock or charge occurs.'}</p><button type="button" onClick={onClose}>{zh?'返回参数':'Back to settings'}</button></dialog>;
}
export function PlatformDreamfaceGeneratorForm(props:Props){
 const {state,onChange,locale}=props,zh=locale==='zh-CN',config=generatorModel(state.model)?.kind==='video'?generatorConfig(state):undefined,[gate,setGate]=useState<HTMLElement|null>(null);
 const setMode=(mode:GeneratorMode)=>onChange(changeDreamfaceMode(state,mode));
 const update=(value:Partial<GeneratorParameters>)=>onChange({...state,parameters:{...state.parameters,...value},issues:state.issues.filter(x=>x!=='parameters-normalized')});
 const uploadKey=`${state.model}:${state.mode}:${state.parameters.submode??''}`;
 const promptProps={...props,onChange:(next:Parameters<typeof GeneratorPrompt>[0]['state'])=>onChange({...next,selectionSource:state.selectionSource})};
 return <form className="platform-generator-form platform-dreamface-form" onSubmit={event=>event.preventDefault()} data-selection-source={state.selectionSource}>
  <div className="platform-generator-mode-tabs" role="tablist" aria-label={zh?'生成模式':'Generation mode'}>{(['image','text'] as const).map(mode=><button key={mode} type="button" role="tab" aria-selected={state.mode===mode} tabIndex={state.mode===mode?0:-1} onClick={()=>setMode(mode)} onKeyDown={event=>{if(['Home','End','ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?'image':event.key==='End'?'text':state.mode==='image'?'text':'image';setMode(next);(event.currentTarget.parentElement?.children[next==='image'?0:1] as HTMLElement)?.focus()}}}>{mode==='image'?<ImageIcon aria-hidden="true"/>:<Type aria-hidden="true"/>}{zh?(mode==='image'?'图生视频':'文生视频'):(mode==='image'?'Image to Video':'Text to Video')}</button>)}</div>
  <PlatformGeneratorModelPicker searchable models={generatorModels.filter(model=>model.kind==='video'&&!!model.modes[state.mode]&&model.brand!=='Veo')} value={state.model} onChange={id=>onChange(chooseDreamfaceModel(state,id))} locale={locale}/>
  <p className="platform-generator-current-model">{dreamfaceIcons.lanta&&state.model==='lanta-2-1'&&<img src={dreamfaceIcons.lanta} alt=""/> /* eslint-disable-line @next/next/no-img-element */}{zh?'当前表单模型':'Current form model'}: {generatorModel(state.model)?.name??state.model}</p>
  <GeneratorIssues state={state} locale={locale}/>
  {state.issues.includes('parameters-normalized')&&<p role="status" className="platform-generator-hint">{zh?'模式切换已按当前型号调整不支持的参数；提示词保持。':'Settings unsupported by the current model were adjusted after the mode change. Your Prompt is preserved.'}</p>}
  {props.filesReleased&&<p role="status" className="platform-generator-hint">{zh?'页面切换已释放本地文件，请重新选择。':'Local files were released when the page changed. Please select them again.'}</p>}
  {config?.keyframes&&<fieldset><legend>{zh?'参考方式':'Reference mode'}</legend>{(['reference','keyframes'] as const).map(mode=><label key={mode}><input type="radio" name="dreamface-submode" checked={state.parameters.submode===mode} onChange={()=>update({submode:mode})}/>{mode==='reference'?(zh?'参考素材':'Reference'):(zh?'关键帧':'Keyframes')}</label>)}</fieldset>}
  {config?.reference&&(state.parameters.submode==='keyframes'?<div key={uploadKey}>{[zh?'首帧':'Start Frame',zh?'中间帧':'Middle Frames',zh?'尾帧（可选）':'End Frame (optional)'].map((label,i)=><PlatformGeneratorUpload key={label} config={{...config.reference!,max:i===1?6:1,accept:'image/*'}} locale={locale} label={label} onFiles={props.onFiles}/>)}</div>:<PlatformGeneratorUpload key={uploadKey} config={config.reference} locale={locale} label={zh?'参考图片':'Reference Images'} onFiles={props.onFiles}/>)}
  {config?.audio&&<PlatformGeneratorUpload key={`${uploadKey}:audio`} config={{max:1,accept:'audio/*,.mp3,.wav',maxBytes:10*1024*1024,localByteLimit:false}} locale={locale} label={zh?'音频（可选）':'Audio (optional)'} onFiles={props.onFiles}/>}
  {config?<GeneratorPrompt {...promptProps}/>:<div className="platform-generator-field"><label htmlFor="platform-generator-prompt">{zh?'提示词':'Prompt'}</label><textarea id="platform-generator-prompt" name="prompt" rows={5} value={state.prompt} onChange={event=>onChange({...state,prompt:event.target.value})}/></div>}
  {config&&<>
   {config.flavors&&<GeneratorChoices label={zh?'模型模式':'Model mode'} values={config.flavors} value={state.parameters.flavor} onChange={flavor=>update({flavor})}/>}
   <div className="platform-generator-field"><span className="platform-generator-label">{zh?'时长':'Duration'}</span>{config.durationRange?<label className="platform-dreamface-range"><input aria-label={zh?'时长':'Duration'} type="range" min={config.durationRange[0]} max={config.durationRange[1]} value={state.parameters.duration} onChange={event=>onChange(selectDreamfaceDuration(state,Number(event.target.value)).state)}/><output>{state.parameters.duration}s</output></label>:<div className="platform-generator-choices" role="group" aria-label={zh?'时长':'Duration'}>{config.durations?.map(duration=><button type="button" key={duration} aria-pressed={state.parameters.duration===duration} onClick={event=>{const result=selectDreamfaceDuration(state,duration);if(result.gated)setGate(event.currentTarget);else onChange(result.state)}}>{duration}s</button>)}</div>}</div>
   <GeneratorChoices label={zh?'画质':'Quality'} values={config.resolutions} value={state.parameters.resolution} onChange={resolution=>update({resolution})}/>
   <GeneratorChoices label={zh?'画幅比例':'Video Ratio'} values={config.ratios} value={state.parameters.ratio} onChange={ratio=>update({ratio})}/>
   {config.sound&&<label className="platform-generator-toggle"><input type="checkbox" checked={state.parameters.sound??false} onChange={event=>update({sound:event.target.checked})}/>{zh?'声音':'Sound'}</label>}
   {config.multishot&&<label className="platform-generator-toggle"><input type="checkbox" checked={state.parameters.multishot??false} onChange={event=>update({multishot:event.target.checked})}/>{zh?'多镜头':'Multi-shot'}</label>}
   {state.model==='lanta-2-1'&&<p className="platform-generator-hint">{zh?'8秒选项仅作合法参数预览，公开资格条件尚未核实。':'Eligibility for 8s has not been verified. This option is a local parameter preview only.'}</p>}
  </>}
  <GeneratorUnavailable locale={locale}/>
  {gate&&<DreamfaceGate locale={locale} trigger={gate} onClose={()=>setGate(null)}/>}
 </form>;
}
