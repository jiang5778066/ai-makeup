import type {Locale} from './i18n';
import {generatorModels} from './platform-generator-data';
import {normalizeParameters,type GeneratorParameters} from './platform-generator-parameters';
import {compositionContent} from './platform-image-composition-content';
export type CompositionKind='combiner'|'merger';
export type CompositionState={model:string;prompt:string;parameters:GeneratorParameters;issues:string[]};
export const compositionModels=generatorModels.filter(m=>m.kind==='image'&&m.modes.image);
export const compositionModel=(id:string)=>compositionModels.find(m=>m.id===id||m.referenceId===id);
export const compositionConfig=(state:CompositionState)=>compositionModel(state.model)?.modes.image;
export const compositionKey=(kind:CompositionKind,query:string)=>{const q=new URLSearchParams(query.split('#')[0]);return JSON.stringify([kind,...['model','mode','tab','resolution','ratio'].map(k=>q.get(k))]);};
export function initializeComposition(kind:CompositionKind,locale:Locale,query:string):CompositionState {
 const q=new URLSearchParams(query),requested=q.get('model'),model=compositionModel('nano-banana-pro')!;
 const parameters=normalizeParameters(model,'image'),issues:string[]=[];
 if(requested&&compositionModel(requested)?.id!==model.id)issues.push(compositionModel(requested)?'path-model-conflict':'unknown-model');
 if(q.get('mode')&&q.get('mode')!=='image-to-image'||q.get('tab')&&q.get('tab')!=='image')issues.push('unsupported-mode');
 const resolution=q.get('resolution'),ratio=q.get('ratio'),config=model.modes.image!;
 if(resolution){if(config.resolutions.includes(resolution))parameters.resolution=resolution;else issues.push('invalid-resolution');}
 if(ratio){if(config.ratios.includes(ratio))parameters.ratio=ratio;else issues.push('invalid-ratio');}
 return {model:model.id,prompt:compositionContent[kind][locale].prompt,parameters,issues};
}
export function selectCompositionModel(state:CompositionState,id:string):CompositionState {
 const model=compositionModel(id);return {...state,model:model?.id??id,parameters:model?normalizeParameters(model,'image',state.parameters):{},issues:model?[]:['unknown-model']};
}
type Session={state:CompositionState;owner:number;filesReleased:boolean};
// 只保存有界文本和参数；File、URL及照片不进入此内存。
export class CompositionSessions {
 private entries=new Map<string,Session>();private serial=0;private listeners=new Set<()=>void>();
 constructor(private limit=8){}
 read=(key:string)=>this.entries.get(key);
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);}};
 private emit(){this.listeners.forEach(fn=>fn());}
 acquire(key:string,initial:CompositionState){const old=this.entries.get(key),owner=++this.serial;this.entries.delete(key);this.entries.set(key,{state:old?.state??initial,owner,filesReleased:old?.filesReleased??false});while(this.entries.size>this.limit)this.entries.delete(this.entries.keys().next().value!);this.emit();return owner;}
 write(key:string,owner:number,state:CompositionState){const old=this.entries.get(key);if(old?.owner!==owner)return false;this.entries.set(key,{...old,state});this.emit();return true;}
 release(key:string,owner:number,hadFiles:boolean){const old=this.entries.get(key);if(old?.owner!==owner)return;this.entries.set(key,{...old,owner:0,filesReleased:old.filesReleased||hadFiles});this.emit();}
}
export const compositionSessions=new CompositionSessions();
