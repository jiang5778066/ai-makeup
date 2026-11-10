import type {Locale} from './i18n';
import {albumModels} from './platform-album-cover-models';
export type AlbumMode='image'|'text';
export type AlbumState={model:string;mode:AlbumMode;prompt:string;resolution:string;ratio:string;enhance:boolean;issues:('model'|'mode')[]};
export type AlbumConfig={id:string;slug:string;name:string;mode:AlbumMode;ratios:readonly {id:string;label:string}[];desktopRatios:readonly string[];resolutions:readonly string[];enhance:boolean;promptLimit:number;localPromptLimit:boolean;reference?:{max:number;accept:string;maxBytes:number}};
export const albumPrompt={en:'professional square album cover art for a music release, bold visual concept, cinematic lighting, strong color palette, clean composition with space for artist name and song title, high-resolution streaming platform cover','zh-CN':'为音乐发行创作专业方形专辑封面艺术，大胆的视觉概念，电影感灯光，强烈的色彩方案，干净构图，为艺人名和歌曲标题保留空间，高清流媒体平台封面'};
export function albumFind(id:string,mode:AlbumMode):AlbumConfig|undefined{return albumModels.find(m=>m.mode===mode&&(m.id===id||m.slug===id))}
export function albumConfig(state:AlbumState){return state.issues.length?undefined:albumFind(state.model,state.mode)}
export const albumSessionLimits={model:128,prompt:20000,key:4096,records:8,bytes:128*1024} as const;
function normalize(state:AlbumState):AlbumState{
 const mode:AlbumMode=state.mode==='image'?'image':'text';
 const modelConfig=albumFind(state.model,mode);
 const issues:AlbumState['issues']=[];
 if(state.issues.includes('mode')||(state.mode!=='text'&&state.mode!=='image'))issues.push('mode');
 if(state.issues.includes('model')||!modelConfig)issues.push('model');
 const config=issues.length?undefined:modelConfig;
 // 先校验完整值，再保留有界诊断；截断不能把非法模型变成合法模型。
 const model=state.model.length>albumSessionLimits.model?state.model.slice(0,albumSessionLimits.model-1)+'…':state.model;
 return {
  model:config?.id??model,mode,issues,
  prompt:state.prompt.slice(0,Math.min(config?.promptLimit??albumSessionLimits.prompt,albumSessionLimits.prompt)),
  resolution:config?(config.resolutions.includes(state.resolution)?state.resolution:config.resolutions[0]??''):'',
  ratio:config?(config.ratios.some(r=>r.id===state.ratio)?state.ratio:config.ratios.find(r=>r.id==='1')?.id??config.ratios[0]?.id??''):'',
  enhance:!!config?.enhance&&state.enhance,
 };
}
export function albumInitialize(query:string,locale:Locale):AlbumState{
 const q=new URLSearchParams(query.split('#')[0]);const rawModes=q.getAll('mode'),tabs=q.getAll('tab');
 const modes=rawModes.map((value):AlbumMode|undefined=>{
  if(value==='text-to-image')return 'text';
  if(value==='image-to-image')return 'image';
  return undefined;
 });
 const values=[...modes,...tabs.map(value=>value==='text'||value==='image'?value:undefined)];
 const mode:AlbumMode=values.find(v=>v!==undefined)??'text';
 const modeBad=values.some(v=>!v)||new Set(values).size>1;
 const models=q.getAll('model'),canonical=models.map(v=>albumFind(v,mode)?.id);const modelBad=canonical.some(v=>!v)||new Set(canonical).size>1;
 return normalize({model:models[0]??'2403',mode,prompt:albumPrompt[locale],resolution:'1K',ratio:'1',enhance:false,issues:[...(modeBad?['mode' as const]:[]),...(modelBad?['model' as const]:[])]});
}
export function albumSelectModel(state:AlbumState,id:string):AlbumState{const config=albumFind(id,state.mode);return normalize({...state,model:config?.id??id,resolution:'',ratio:'',enhance:false,issues:[...state.issues.filter(i=>i!=='model'),...(!config?['model' as const]:[])]})}
export function albumSelectMode(state:AlbumState,mode:AlbumMode):AlbumState{const config=albumFind(state.model,mode);return normalize({...state,mode,resolution:'',ratio:'',enhance:false,issues:[...state.issues.filter(i=>i!=='mode'),...(!config&&!state.issues.includes('model')?['model' as const]:[])]})}
export function albumQueryKey(query:string){return new URLSearchParams(query.split('#')[0]).toString()}
export function albumSessionKey(locale:Locale,query:string){return JSON.stringify([locale,albumQueryKey(query)])}
export function albumQuery(query:Record<string,string|string[]|undefined>){const q=new URLSearchParams();for(const [k,v] of Object.entries(query))for(const x of typeof v==='string'?[v]:v??[])q.append(k,x);return q.toString()}
type Session={state:AlbumState;owner:number};
function sessionBytes(key:string,state:AlbumState){
 const text=key.length+state.model.length+state.mode.length+state.prompt.length+state.resolution.length+state.ratio.length+state.issues.reduce((sum,issue)=>sum+issue.length,0);
 return text*2+128;
}
// 仅保存有界文字；完整key直接比较，不截断、不以哈希替代身份。
export class AlbumSessions{
 private entries=new Map<string,Session>();private serial=0;private listeners=new Set<()=>void>();
 read=(key:string)=>this.entries.get(key);
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener)}};
 private emit(){this.listeners.forEach(fn=>fn())}
 private trim(){
  // 按全部UTF-16文字的两倍长度计费，另加每条128字节固定预算；不声称是JS堆实测。
  let bytes=0;
  for(const [key,entry] of this.entries)bytes+=sessionBytes(key,entry.state);
  while(this.entries.size>albumSessionLimits.records||bytes>albumSessionLimits.bytes){
   const key=this.entries.keys().next().value!;
   bytes-=sessionBytes(key,this.entries.get(key)!.state);
   this.entries.delete(key);
  }
 }
 acquire(key:string,initial:AlbumState){
  const owner=++this.serial;
  if(key.length>albumSessionLimits.key)return owner;
  const state=normalize(this.entries.get(key)?.state??initial);
  this.entries.delete(key);this.entries.set(key,{owner,state});this.trim();this.emit();return owner;
 }
 write(key:string,owner:number,state:AlbumState){
  if(!owner||this.entries.get(key)?.owner!==owner)return;
  const next=normalize(state);
  this.entries.delete(key);this.entries.set(key,{owner,state:next});this.trim();this.emit();
 }
 release(key:string,owner:number){
  const old=this.entries.get(key);
  if(owner&&old?.owner===owner){this.entries.set(key,{...old,owner:0});this.emit()}
 }
}
export const albumSessions=new AlbumSessions();
