export type AlbumPreviewConfig={max:number;accept:string;maxBytes:number};
export type AlbumSlot={id:number;file:File;url:string};
type Snapshot={slots:AlbumSlot[];busy:boolean;pendingId:number|undefined;error:string};
type Dependencies={create:(file:File)=>string;revoke:(url:string)=>void;decode:(file:File,url:string)=>Promise<void>};
// 新文件解码完成后才提交；在途事务和已提交槽位分别持有自己的URL。
export class AlbumPreviewStore{
 private value:Snapshot={slots:[],busy:false,pendingId:undefined,error:''};private serial=0;private token=0;private live=true;private urls=new Set<string>();private listeners=new Set<()=>void>();
 constructor(private config:AlbumPreviewConfig,private deps:Dependencies){}
 snapshot=()=>this.value;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener)}};
 activate(){this.live=true}
 private emit(value:Partial<Snapshot>){this.value={...this.value,...value};this.listeners.forEach(fn=>fn())}
 private release(url:string){if(this.urls.delete(url))this.deps.revoke(url)}
 private validate(file:File){const accepted=this.config.accept.split(',').some(raw=>{const p=raw.trim().toLowerCase();return p.startsWith('.')?file.name.toLowerCase().endsWith(p):p.endsWith('/*')?file.type.startsWith(p.slice(0,-1)):file.type===p});return !accepted?'type':file.size>this.config.maxBytes?'size':''}
 private transact(id:number,file:File,replacing:boolean){
  if(!this.live||this.value.busy)return;
  const error=this.validate(file);if(error){this.emit({error});return}
  const token=++this.token,url=this.deps.create(file);this.urls.add(url);this.emit({busy:true,pendingId:id,error:''});
  void this.deps.decode(file,url).then(()=>{
   if(!this.live||token!==this.token){this.release(url);return}
   const previous=this.value.slots.find(s=>s.id===id);
   if(replacing&&!previous){this.release(url);this.emit({busy:false,pendingId:undefined});return}
   if(previous)this.release(previous.url);
   const slot={id,file,url};this.emit({slots:replacing?this.value.slots.map(s=>s.id===id?slot:s):[...this.value.slots,slot],busy:false,pendingId:undefined,error:''});
  }).catch(()=>{this.release(url);if(!this.live||token!==this.token)return;this.emit({busy:false,pendingId:undefined,error:'decode'})});
 }
 add(files:File[]){if(!this.live||!files.length||this.value.busy)return;if(this.value.slots.length>=this.config.max){this.emit({error:'count'});return}this.transact(++this.serial,files[0],false)}
 replace(id:number,file:File){if(this.value.slots.some(s=>s.id===id))this.transact(id,file,true)}
 remove(id:number){if(this.value.pendingId===id){this.token++;this.urls.forEach(url=>{if(!this.value.slots.some(s=>s.url===url))this.release(url)});this.emit({busy:false,pendingId:undefined})}const old=this.value.slots.find(s=>s.id===id);if(old)this.release(old.url);this.emit({slots:this.value.slots.filter(s=>s.id!==id),error:''})}
 dispose(){this.live=false;this.token++;this.urls.forEach(url=>this.release(url));this.emit({slots:[],busy:false,pendingId:undefined,error:''})}
}
export function decodeAlbumImage(_file:File,url:string){return new Promise<void>((resolve,reject)=>{const img=new Image();img.onload=()=>{img.onload=null;img.onerror=null;resolve()};img.onerror=()=>{img.onload=null;img.onerror=null;reject(new Error('本地图片解码失败'))};img.src=url})}
