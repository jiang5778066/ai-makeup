import type {GeneratorState} from './platform-generator-parameters';
export function generatorSelectionKey(path:string,query:string){const q=new URLSearchParams(query.split('#')[0]);return JSON.stringify([path,q.get('model'),q.get('mode'),q.get('tab')])}
type Session={state:GeneratorState;owner:number;filesReleased:boolean;hasFiles:boolean};
// 只保存本批有界文本/参数；File和objectURL永远不进入会话内存。
export class GeneratorSessions {
 private entries=new Map<string,Session>();private serial=0;private listeners=new Set<()=>void>();
 constructor(private limit=8){}
 read=(key:string)=>this.entries.get(key);
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn)}};
 private emit(){this.listeners.forEach(fn=>fn())}
 acquire(key:string,initial:GeneratorState){const old=this.entries.get(key);const owner=++this.serial;this.entries.delete(key);this.entries.set(key,{state:old?.state??initial,owner,filesReleased:old?.filesReleased??false,hasFiles:false});while(this.entries.size>this.limit)this.entries.delete(this.entries.keys().next().value!);this.emit();return owner}
 write(key:string,owner:number,state:GeneratorState){const old=this.entries.get(key);if(old?.owner!==owner)return false;this.entries.set(key,{...old,state});this.emit();return true}
 markFiles(key:string,owner:number){const old=this.entries.get(key);if(old?.owner===owner)this.entries.set(key,{...old,hasFiles:true})}
 release(key:string,owner:number){const old=this.entries.get(key);if(old?.owner!==owner)return;this.entries.set(key,{...old,owner:0,filesReleased:old.filesReleased||old.hasFiles,hasFiles:false});this.emit()}
}
export const generatorSessions=new GeneratorSessions();
