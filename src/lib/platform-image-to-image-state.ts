import {generatorModels,type GeneratorMode} from './platform-generator-data';
import {normalizeParameters,type GeneratorParameters} from './platform-generator-parameters';
export const imageToImageModelIds={image:['seedream-5-0-pro','seedream-5-0-lite','qwen-image-edit-spicy','gpt-image-2','gpt-image-2-5-flare','gpt-image-2-5-sunburst','nano-banana-pro','wan-2-7-image-pro','qwen-image-edit-max','wan-2-5-image','flux-2-pro','flux-2-flex'],text:['seedream-5-0-pro','seedream-5-0-lite','gpt-image-2','gpt-image-2-5-flare','gpt-image-2-5-sunburst','nano-banana-pro','wan-2-7-image-pro','flux-2-pro','flux-2-flex','z-image-spicy','z-image','qwen-image-2-0-pro']} as const;
export type ImageToImageState={model:string;mode:GeneratorMode;prompt:string;parameters:GeneratorParameters;issues:string[]};
export function imageToImageModel(id:string){return generatorModels.find(m=>m.kind==='image'&&(m.id===id||m.referenceId===id));}
export function imageToImageConfig(state:ImageToImageState){if(state.issues.includes('unknown-mode')||!(imageToImageModelIds[state.mode] as readonly string[]).includes(state.model))return undefined;return imageToImageModel(state.model)?.modes[state.mode];}
export function restoreImageToImage(state:ImageToImageState):ImageToImageState{const model=imageToImageModel(state.model);const modelId=model?.id??state.model;const valid=(imageToImageModelIds[state.mode] as readonly string[]).includes(modelId);const issues=[...(state.issues.includes('unknown-mode')?['unknown-mode']:[]),...(!valid?['unsupported-model']:[])];return {...state,model:modelId,prompt:state.prompt.slice(0,20000),parameters:valid&&!issues.length?normalizeParameters(model!,state.mode,state.parameters):{},issues};}
export function initializeImageToImage(query:string):ImageToImageState{const q=new URLSearchParams(query),raw=q.get('mode'),tab=q.get('tab');const mode=raw==='text-to-image'||(!raw&&tab==='text')?'text':'image';return restoreImageToImage({model:q.get('model')??'nano-banana-pro',mode,prompt:'',parameters:{},issues:raw&&!['image-to-image','text-to-image'].includes(raw)||tab&&!['image','text'].includes(tab)?['unknown-mode']:[]});}
export function selectImageToImageModel(state:ImageToImageState,id:string){return restoreImageToImage({...state,model:id});}
export function selectImageToImageMode(state:ImageToImageState,mode:GeneratorMode){return restoreImageToImage({...state,mode,issues:[]});}
// 会话只保留有界文本与参数，文件和对象 URL 不进入跨语言内存。
export function imageToImageKey(query:string){const q=new URLSearchParams(query);return JSON.stringify([q.get('model'),q.get('mode'),q.get('tab')]);}
type Session={state:ImageToImageState;owner:number;hasFiles:boolean;filesReleased:boolean};
export class ImageToImageSessions{
 private entries=new Map<string,Session>();private serial=0;private listeners=new Set<()=>void>();
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn)}};
 read=(key:string)=>this.entries.get(key);
 private emit(){this.listeners.forEach(fn=>fn())}
 acquire(key:string,initial:ImageToImageState){const old=this.entries.get(key),owner=++this.serial;this.entries.delete(key);this.entries.set(key,{state:restoreImageToImage(old?.state??initial),owner,hasFiles:false,filesReleased:old?.filesReleased??false});while(this.entries.size>8)this.entries.delete(this.entries.keys().next().value!);this.emit();return owner}
 write(key:string,owner:number,state:ImageToImageState){const old=this.entries.get(key);if(old?.owner!==owner)return;this.entries.set(key,{...old,state:restoreImageToImage(state)});this.emit()}
 files(key:string,owner:number,hasFiles:boolean){const old=this.entries.get(key);if(old?.owner===owner)this.entries.set(key,{...old,hasFiles})}
 release(key:string,owner:number){const old=this.entries.get(key);if(old?.owner!==owner)return;this.entries.set(key,{...old,owner:0,hasFiles:false,filesReleased:old.filesReleased||old.hasFiles});this.emit()}
}
export const imageToImageSessionStore=new ImageToImageSessions();
