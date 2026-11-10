"use client";

import {useState} from "react";
import {generatorModels} from "@/lib/platform-generator-data";
import {changeVideoModelMode, changeVideoModelSelection, selectableVideoModels, videoModelConfig} from "@/lib/platform-video-model-data";
import type {VideoModelPath} from "@/lib/platform-generator-data";
import {GeneratorModes, GeneratorChoices, GeneratorUnavailable, type GeneratorFormProps} from "./platform-image-generator-form";
import {PlatformGeneratorModelPicker} from "./platform-generator-model-picker";
import {PlatformGeneratorUpload} from "./platform-generator-upload";
import {DurationGate} from "./platform-video-generator-form";

// 仅Sora尚未选择真实型号时使用；不向共享registry注册虚构服务。
export function PlatformVideoModelUnselectedForm(props: GeneratorFormProps) {
  const {state, locale, onChange} = props;
  const zh=locale === "zh-CN", config=videoModelConfig(state)!;
  const [gate,setGate]=useState<HTMLElement|null>(null);
  const models=generatorModels.filter(model=>selectableVideoModels(state.path as VideoModelPath,state.mode).includes(model.id));
  const over=state.prompt.length>config.promptLimit;
  return <form className="platform-generator-form platform-generator-video-form platform-video-model-unselected-form" onSubmit={event=>event.preventDefault()}>
    <GeneratorModes {...props} onChange={next=>onChange(changeVideoModelMode(state,next.mode))}/>
    <PlatformGeneratorModelPicker models={models} value="" emptyLabel={zh?"选择模型":"Select a model"} onChange={id=>onChange(changeVideoModelSelection(state,id))} locale={locale} searchable/>
    <p className="platform-generator-current-model">{zh?"当前表单模型：尚未选择模型":"Current form model: No model selected"}</p>
    {props.filesReleased&&<p className="platform-generator-hint" role="status">{zh?"本地文件已释放，请重新选择。":"Local files were released. Please select them again."}</p>}
    {config.reference&&<PlatformGeneratorUpload key={`${state.mode}:unselected`} config={config.reference} locale={locale} label={zh?"参考图片":"Reference Images"} onFiles={props.onFiles}/>}
    <div className="platform-generator-field"><div className="platform-generator-label"><label htmlFor="platform-generator-prompt">{zh?"提示词":"Prompt"}</label><span>{state.prompt.length}/1000</span></div>
      <textarea id="platform-generator-prompt" name="prompt" rows={5} maxLength={1000} value={state.prompt} aria-invalid={over} aria-describedby={over?"platform-generator-prompt-error":undefined} placeholder={zh?"描述你希望看到的场景、动作与镜头…":"Describe the scene, motion and camera you want…"} onChange={event=>onChange({...state,prompt:event.target.value,issues:state.issues.filter(issue=>issue!=="prompt-too-long")})}/>
      {over&&<p id="platform-generator-prompt-error" role="alert" className="platform-generator-error">{zh?"提示词超过1000字限制，请缩短。":"Prompt exceeds the 1000-character limit. Please shorten it."}</p>}
    </div>
    <div className="platform-generator-field"><span className="platform-generator-label">{zh?"时长":"Duration"}</span><div className="platform-generator-choices" role="group" aria-label={zh?"时长":"Duration"}>{[10,15].map(duration=><button type="button" key={duration} aria-pressed={state.parameters.duration===duration} onClick={event=>{if(duration===15){setGate(event.currentTarget);return}onChange({...state,parameters:{...state.parameters,duration},issues:state.issues.filter(issue=>!issue.endsWith(":duration"))})}}>{duration}s{duration===15&&<small> ◇</small>}</button>)}</div></div>
    <GeneratorChoices label={zh?"画幅比例":"Video Ratio"} values={config.ratios} value={state.parameters.ratio} onChange={ratio=>onChange({...state,parameters:{...state.parameters,ratio},issues:state.issues.filter(issue=>!issue.endsWith(":ratio"))})}/>
    <GeneratorUnavailable locale={locale}/>
    {gate&&<DurationGate locale={locale} onClose={()=>setGate(null)} trigger={gate} model="Sora 2" duration={15} wan={false} videoModel/>}
  </form>;
}
