export type PreviewConfig={max:number;accept:string;maxBytes:number;localByteLimit:boolean};
export type PreviewSlot={id:number;token:number;file:File;url:string;status:'loading'|'ready'};
type Dependencies={create:(file:File)=>string;revoke:(url:string)=>void;decode:(file:File,url:string)=>Promise<void>};
export function validatePreviewFile(file:File,config:PreviewConfig):'type'|'size'|null {
 const accepted=config.accept.split(',').some(pattern=>{const p=pattern.trim();return p.startsWith('.')?file.name.toLowerCase().endsWith(p):p.endsWith('/*')?file.type.startsWith(p.slice(0,-1)):file.type===p});
 return !accepted?'type':file.size>config.maxBytes?'size':null;
}
// 每个异步解码只拥有自己创建的URL，不能释放替换后的新slot资源。
export class ImageToImageUploadStore {
 private pending=new Map<number,{url:string;token:number}>();private sequence=0;private slots:PreviewSlot[]=[];private nextId=0;private epoch=0;private live=true;private urls=new Set<string>();private listeners=new Set<()=>void>();error='';
 constructor(private config:PreviewConfig,private deps:Dependencies){}
 activate(){this.live=true}
 snapshot=()=>this.slots;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener)}};
 private emit(){this.slots=[...this.slots];this.listeners.forEach(fn=>fn())}
 private release(url:string){if(this.urls.delete(url))this.deps.revoke(url)}
 private preview(slot:PreviewSlot){const epoch=this.epoch;void this.deps.decode(slot.file,slot.url).then(()=>{if(!this.live||epoch!==this.epoch||!this.slots.some(x=>x.id===slot.id&&x.token===slot.token)){this.release(slot.url);return}this.slots=this.slots.map(x=>x.id===slot.id?{...x,status:'ready'}:x);this.emit()}).catch(()=>{this.release(slot.url);if(!this.live||epoch!==this.epoch||!this.slots.some(x=>x.id===slot.id&&x.token===slot.token))return;this.slots=this.slots.filter(x=>x.id!==slot.id);this.error='decode';this.emit()})}
 add(files:File[]){if(!this.live||!files.length)return;this.error='';for(const file of files){const error=validatePreviewFile(file,this.config);if(error){this.error=error;continue}if(this.slots.length>=this.config.max){this.error='count';continue}const url=this.deps.create(file);this.urls.add(url);const slot:PreviewSlot={id:++this.nextId,token:1,file,url,status:'loading'};this.slots=[...this.slots,slot];this.preview(slot)}this.emit()}
 replace(id:number,file:File){
  if(!this.live)return;const previous=this.slots.find(x=>x.id===id);if(!previous)return;
  const error=validatePreviewFile(file,this.config);if(error){this.error=error;this.emit();return}
  const oldPending=this.pending.get(id);if(oldPending)this.release(oldPending.url);
  const url=this.deps.create(file),token=++this.sequence,epoch=this.epoch;this.urls.add(url);this.pending.set(id,{url,token});this.error='';this.emit();
  // 解码完成前原图继续持有；只有当前 owner/epoch 候选可以提交替换。
  void this.deps.decode(file,url).then(()=>{
   if(!this.live||this.epoch!==epoch||this.pending.get(id)?.token!==token||!this.slots.some(x=>x.id===id)){this.release(url);return}
   const current=this.slots.find(x=>x.id===id)!;this.pending.delete(id);this.release(current.url);this.slots=this.slots.map(x=>x.id===id?{id,token:current.token+1,file,url,status:'ready'}:x);this.emit();
  }).catch(()=>{this.release(url);if(!this.live||this.epoch!==epoch||this.pending.get(id)?.token!==token)return;this.pending.delete(id);this.error='decode';this.emit()});
 }
 remove(id:number){const pending=this.pending.get(id);if(pending)this.release(pending.url);this.pending.delete(id);const previous=this.slots.find(x=>x.id===id);if(previous)this.release(previous.url);this.slots=this.slots.filter(x=>x.id!==id);this.emit()}
 reset(config:PreviewConfig){this.epoch++;this.pending.clear();this.config=config;this.urls.forEach(url=>this.release(url));this.slots=[];this.error='';this.emit()}
 dispose(){this.reset(this.config);this.live=false;this.listeners.clear()}
}
export function decodeLocalPreview(file:File,url:string):Promise<void>{
 if(file.type.startsWith('image/'))return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{image.onload=null;image.onerror=null;resolve()};image.onerror=()=>{image.onload=null;image.onerror=null;reject(new Error('image decode'))};image.src=url});
 return new Promise((resolve,reject)=>{const media=document.createElement(file.type.startsWith('video/')?'video':'audio');const clear=()=>{media.onloadedmetadata=null;media.onerror=null;media.removeAttribute('src');media.load()};media.preload='metadata';media.onloadedmetadata=()=>{clear();resolve()};media.onerror=()=>{clear();reject(new Error('media decode'))};media.src=url});
}
