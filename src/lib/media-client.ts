import type {MediaRequest,MediaStatus} from './media-contracts';
import type {Locale} from './i18n';
export type MediaDraft={model:string;mode:'text_to_image'|'image_to_image'|'text_to_video'|'image_to_video';prompt:string;locale:Locale;files:File[];selectionVersion:number;sourceSelection?:string};
export type MediaCapability={mode:string;model:string;enabled:boolean;parameters?:{quality?:string[];size?:string[];n?:number[];durationSeconds?:number[];resolution?:string[]}};
export type MediaTask={taskId:string;status:MediaStatus;creditState:string;result?:{url:string;mimeType:string;expiresAt:string}|null;errorCode?:string|null};
export type ClientQuote={quoteToken:string;credits:number;expiresAt:string};
export type MediaClientState={status:'idle'|'loading'|'uploading'|'quoting'|'confirm'|'submitting'|'pending'|'unknown'|'stopped'|'done'|'review'|'error';capabilities:MediaCapability[];selected:boolean;consent:boolean;quote:ClientQuote|null;task:MediaTask|null;error:string|null;refreshUnknown:boolean};
export class MediaClientError extends Error{constructor(public code:string){super(code)}}
const recoveryKey='media-generation-recovery',uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Intent={key:string;request:MediaRequest;quote:ClientQuote};
type Recovery={version:1;userId:string;savedAt:number;taskId?:string;key?:string;request?:MediaRequest};
const imageMode=(mode:string)=>mode.endsWith('_image');
const inputMode=(mode:string)=>mode.startsWith('image_to_');
const siteParameters=(mode:string):Record<string,string|number>=>imageMode(mode)?{quality:'1k',size:'2:3',n:1}:{durationSeconds:5,resolution:'480p'};
const validTuple=(model:string,mode:string)=>imageMode(mode)?model==='gpt-image-2'&&['text_to_image','image_to_image'].includes(mode):model==='grok-imagine-video-1.5'&&['text_to_video','image_to_video'].includes(mode);
const normalizePrompt=(v:string)=>v.normalize('NFC').replace(/\r\n?/g,'\n').trim();
export function readMediaRecovery(storage:Storage|undefined,user:string):Recovery|null{
 try{
  const raw=storage?.getItem(recoveryKey);if(!raw)return null;if(raw.length>24576)throw Error();
  const r=JSON.parse(raw) as Recovery;
  if(!r||Object.keys(r).some(k=>!['version','userId','savedAt','taskId','key','request'].includes(k))||r.version!==1||r.userId!==user||!Number.isSafeInteger(r.savedAt)||r.savedAt>Date.now()||Date.now()-r.savedAt>=86400000)throw Error();
  if(r.taskId){if(!uuid.test(r.taskId)||r.key||r.request)throw Error();return r}
  const p=r.request;
  if(!p||!r.key||!uuid.test(r.key)||!uuid.test(p.clientIntentId)||!validTuple(p.model,p.mode)||p.mediaType!==(imageMode(p.mode)?'image':'video')||typeof p.prompt!=='string'||!p.prompt||p.prompt.length>3800||p.consent!==true||typeof p.consentVersion!=='string'||p.consentVersion.length>100||!['en','zh-CN'].includes(p.locale)||JSON.stringify(p.parameters)!==JSON.stringify(siteParameters(p.mode))||!Array.isArray(p.inputIds)||p.inputIds.length!==(inputMode(p.mode)?1:0)||p.inputIds.some(i=>!uuid.test(i))||Object.keys(p).some(k=>!['clientIntentId','mediaType','model','mode','prompt','parameters','inputIds','locale','consent','consentVersion'].includes(k)))throw Error();
  return r;
 }catch{try{storage?.removeItem(recoveryKey)}catch{/* 存储可能被浏览器禁用。 */}return null}
}
export function createMediaClient(fetcher:typeof fetch=fetch){
 const json=async<T>(path:string,signal:AbortSignal,body?:unknown,key?:string,allowDisabled=false):Promise<T>=>{
  const r=await fetcher(`/api/media/${path}`,{method:body===undefined?'GET':'POST',cache:'no-store',credentials:'same-origin',redirect:'error',signal,headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(key?{'Idempotency-Key':key}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const b=await r.json();if(!r.ok&&!(allowDisabled&&r.status===503&&Array.isArray(b.capabilities)))throw new MediaClientError(typeof b.code==='string'?b.code:'media_unavailable');return b;
 };
 return {
 capabilities:(s:AbortSignal)=>json<{capabilities:MediaCapability[];consentVersion?:string}>('capabilities',s,undefined,undefined,true),
 quote:(r:MediaRequest,s:AbortSignal)=>json<ClientQuote>('quotes',s,r),
 create:(i:Intent,s:AbortSignal)=>json<MediaTask>('tasks',s,{...i.request,quoteToken:i.quote.quoteToken},i.key),
 read:(id:string,s:AbortSignal)=>json<MediaTask>(`tasks/${encodeURIComponent(id)}`,s),
 async upload(file:File,s:AbortSignal){
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size<1||file.size>8388608)throw new MediaClientError('invalid_input');
  const bytes=await (typeof file.arrayBuffer==='function'?file.arrayBuffer():new Promise<ArrayBuffer>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result as ArrayBuffer);r.onerror=()=>reject(new MediaClientError('invalid_input'));r.readAsArrayBuffer(file)}));
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)))).map(v=>v.toString(16).padStart(2,'0')).join('');if(s.aborted)throw new MediaClientError('cancelled');
  const signed=await json<{inputId:string;uploadUrl:string;requiredHeaders:Record<string,string>}>('inputs/sign',s,{contentType:file.type,contentLength:file.size,sha256:hash,purpose:'reference_image'});
  const url=new URL(signed.uploadUrl);if(url.protocol!=='https:'||url.username||url.password||Object.keys(signed.requiredHeaders).some(k=>k.toLowerCase()!=='content-type')||!uuid.test(signed.inputId))throw new MediaClientError('invalid_input');
  if(s.aborted)throw new MediaClientError('cancelled');
  const put=await fetcher(url.href,{method:'PUT',body:file,headers:signed.requiredHeaders,credentials:'omit',redirect:'error',signal:s});if(!put.ok)throw new MediaClientError('input_not_ready');
  const ready=await json<{inputId:string;status:string}>(`inputs/${signed.inputId}/complete`,s,{});if(ready.status!=='ready'||ready.inputId!==signed.inputId)throw new MediaClientError('input_not_ready');return ready.inputId;
 }
 };
}
export type MediaClient=ReturnType<typeof createMediaClient>;
const initial=():MediaClientState=>({status:'idle',capabilities:[],selected:false,consent:false,quote:null,task:null,error:null,refreshUnknown:false});
export class MediaGenerationController{
 private state=initial();private listeners=new Set<()=>void>();private user:string|null=null;private epoch=-1;private version=0;private draftValue:MediaDraft|null=null;private controller?:AbortController;private capabilityController?:AbortController;private intent?:Intent;private lock=false;private timer?:ReturnType<typeof setTimeout>;private pollStart=0;private pollDelay=5000;private live=true;
 constructor(private api:MediaClient,private storage?:Storage){}
 snapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener)}};
 private set(patch:Partial<MediaClientState>){this.state={...this.state,...patch};this.listeners.forEach(f=>f())}
 private invalidate(){this.version++;this.controller?.abort();clearTimeout(this.timer);this.timer=undefined;this.lock=false}
 private begin(){this.controller?.abort();const controller=new AbortController();this.controller=controller;const version=++this.version,epoch=this.epoch;return {signal:controller.signal,valid:()=>this.live&&!controller.signal.aborted&&this.version===version&&this.epoch===epoch}}
 private clearRecovery(){try{this.storage?.removeItem(recoveryKey)}catch{/* 受限存储不影响服务端幂等。 */}}
 private save(taskId?:string){try{if(!this.user)return;const record:Recovery={version:1,userId:this.user,savedAt:Date.now(),...(taskId?{taskId}:this.intent?{key:this.intent.key,request:this.intent.request}:{})};const raw=JSON.stringify(record);if(raw.length<=24576)this.storage?.setItem(recoveryKey,raw)}catch{/* 刷新恢复不可用时仍保留当前页原意图。 */}}
 account(user:string|null,epoch:number){
  if(this.user===user&&this.epoch===epoch)return;const previous=this.user;this.invalidate();this.intent=undefined;this.recoveryRequest=undefined;this.capabilityController?.abort();if(previous)this.clearRecovery();this.user=user;this.epoch=epoch;this.state=initial();
  const r=user?readMediaRecovery(this.storage,user):null;if(r?.taskId)this.state={...this.state,status:'stopped',task:{taskId:r.taskId,status:'reconciling',creditState:'reserved'}};else if(r){this.recoveryRequest=r.request;this.state={...this.state,status:'review',refreshUnknown:true}};this.set({});
 }
 draft(d:MediaDraft){
  const old=this.draftValue;this.draftValue=d;
  if(old&&old.model===d.model&&old.mode===d.mode&&old.prompt===d.prompt&&old.locale===d.locale&&old.selectionVersion===d.selectionVersion&&old.sourceSelection===d.sourceSelection&&old.files.length===d.files.length&&old.files.every((f,i)=>f===d.files[i]))return;
  this.invalidate();this.set({quote:null,error:null,...(this.intent?{status:'unknown' as const}:this.state.task&&!['done','failed','refunded'].includes(this.state.task.status)?{status:'stopped' as const}:!this.state.task&&!this.state.refreshUnknown?{status:'idle' as const}:{}),...(old&&(old.model!==d.model||old.mode!==d.mode||old.selectionVersion!==d.selectionVersion||old.sourceSelection!==d.sourceSelection)?{consent:false,selected:false}:{})});
 }
 selectTuple(){this.set({selected:true,quote:null})}
 consent(value:boolean){this.invalidate();this.set({consent:value,quote:null,...(!this.intent&&!this.state.task&&!this.state.refreshUnknown?{status:'idle' as const}:{})})}
 async capabilities(){
  if(!this.user)return;this.capabilityController?.abort();const controller=new AbortController();this.capabilityController=controller;const epoch=this.epoch,user=this.user;const valid=()=>this.live&&!controller.signal.aborted&&this.epoch===epoch&&this.user===user;
  try{const r=await this.api.capabilities(controller.signal);if(valid())this.set({capabilities:r.capabilities,error:null})}catch(e){if(valid())this.set({error:e instanceof MediaClientError?e.code:'media_unavailable'})}
 }
 available(){const d=this.draftValue;return Boolean(d&&validTuple(d.model,d.mode)&&this.state.capabilities.some(c=>c.model===d.model&&c.mode===d.mode&&c.enabled&&(imageMode(d.mode)?c.parameters?.quality?.includes('1k')&&c.parameters?.size?.includes('2:3')&&c.parameters?.n?.includes(1):c.parameters?.durationSeconds?.includes(5)&&c.parameters?.resolution?.includes('480p'))))}
 async quote(){
  const d=this.draftValue;if(!d||!this.user||this.lock||this.intent||this.state.task||this.state.refreshUnknown||!this.available()||!this.state.selected||!this.state.consent)return;
  const prompt=normalizePrompt(d.prompt);if(!prompt||prompt.length>3800||d.files.length!==(inputMode(d.mode)?1:0)){this.set({error:'invalid_input'});return}
  this.lock=true;const op=this.begin();this.set({status:inputMode(d.mode)?'uploading':'quoting',quote:null,error:null});
  try{
   const inputIds=inputMode(d.mode)?[await this.api.upload(d.files[0],op.signal)]:[];if(!op.valid())return;
   const request:MediaRequest={clientIntentId:crypto.randomUUID(),mediaType:imageMode(d.mode)?'image':'video',model:d.model,mode:d.mode,prompt,parameters:siteParameters(d.mode),inputIds,locale:d.locale,consent:true,consentVersion:'media-v1'};
   this.set({status:'quoting'});const quote=await this.api.quote(request,op.signal);if(!op.valid())return;
   if(!quote.quoteToken||!Number.isSafeInteger(quote.credits)||quote.credits<1||!Number.isFinite(Date.parse(quote.expiresAt)))throw new MediaClientError('invalid_quote');
   this.quotedRequest=request;this.set({status:'confirm',quote});
  }catch(e){if(op.valid())this.set({status:'error',error:e instanceof MediaClientError?e.code:'media_unavailable'})}finally{if(op.valid())this.lock=false}
 }
 private quotedRequest?:MediaRequest;
 originalSubmission(){return this.intent?.request??this.recoveryRequest}
 private recoveryRequest?:MediaRequest;
 async confirm(){
  if(this.lock||!this.user||this.intent||!this.state.quote||!this.quotedRequest||!this.state.consent)return;
  if(Date.parse(this.state.quote.expiresAt)<=Date.now()){this.set({quote:null,status:'error',error:'quote_expired'});return}
  this.intent={key:crypto.randomUUID(),request:this.quotedRequest,quote:this.state.quote};this.save();await this.submitOriginal();
 }
 private async submitOriginal(){
  if(!this.intent||this.lock)return;this.lock=true;const op=this.begin();this.set({status:'submitting',error:null});
  try{const task=await this.api.create(this.intent,op.signal);if(!op.valid())return;this.accept(task)}catch(e){if(op.valid()){
   const definite=e instanceof MediaClientError&&['quote_expired','quote_obsolete','invalid_quote','insufficient_credits','media_pricing_unavailable','unauthorized'].includes(e.code);
   if(definite&&e instanceof MediaClientError){this.clearRecovery();this.intent=undefined;this.set({status:'error',error:e.code,quote:null})}
   else this.set({status:'unknown',error:e instanceof MediaClientError?e.code:'submission_unknown',quote:null});
  }}finally{if(op.valid())this.lock=false}
 }
 private accept(task:MediaTask){
  if(!uuid.test(task.taskId)||!['preparing','reserved','submitting','waiting','storing','reconciling','done','failed','refunded'].includes(task.status))throw new MediaClientError('submission_unknown');
  if(this.state.task&&task.taskId!==this.state.task.taskId)throw new MediaClientError('submission_unknown');
  const terminal=['done','failed','refunded'].includes(task.status);if(terminal)this.clearRecovery();else this.save(task.taskId);this.intent=undefined;
  const result=task.result;let safeResult:MediaTask['result']=null;try{if(result&&new URL(result.url).protocol==='https:')safeResult=result}catch{/* 非法URL不渲染。 */}
  this.set({task:{...task,result:safeResult},quote:null,status:task.status==='done'?'done':terminal?'error':task.errorCode?'review':'pending',error:terminal&&task.status!=='done'?'generation_failed':null});
 }
 async recover(){
  if(!this.user||this.lock)return;
  if(!this.state.task){if(this.intent)await this.submitOriginal();return}
  this.lock=true;const op=this.begin();
  try{const task=await this.api.read(this.state.task.taskId,op.signal);if(op.valid())this.accept(task)}catch(e){if(op.valid())this.set({status:'stopped',error:e instanceof MediaClientError?e.code:'media_unavailable'})}finally{if(op.valid())this.lock=false}
 }
 poll(){if(this.timer||!this.state.task||this.state.status!=='pending')return;if(!this.pollStart)this.pollStart=Date.now();if(Date.now()-this.pollStart>=600000){this.set({status:'stopped'});return}this.timer=setTimeout(()=>{this.timer=undefined;void this.recover().then(()=>{this.pollDelay=Math.min(30000,this.pollDelay*1.5);this.poll()})},this.pollDelay)}
 stop(){this.invalidate();this.set({status:this.intent?'unknown':'stopped'})}
 newDraft(){if(!this.state.task||!['done','failed','refunded'].includes(this.state.task.status))return;this.invalidate();this.intent=undefined;this.quotedRequest=undefined;this.clearRecovery();this.pollStart=0;this.pollDelay=5000;this.set({task:null,quote:null,status:'idle',error:null,consent:false})}
 activate(){this.live=true}
 dispose(){this.live=false;this.capabilityController?.abort();this.invalidate();this.listeners.clear()}
}
