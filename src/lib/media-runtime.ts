import {MEDIA_VIDEO_MAX_BYTES} from './media-video-contract';
import {boundedMediaFetch,mediaExecutionSignal,checkMediaExecution} from './media-execution';
import {validMediaStepSecret} from './media-step';
import {createSupabaseMediaObjectStorage} from './media-storage-supabase';
import type {SupabaseMediaStorageConfig} from './media-storage-supabase';
import {createMediaStore,type MediaStore} from './media-persistence';
import {closedMediaCatalog,type MediaCatalog} from './media-catalog';
import {createQuoteSigner,validateEconomics,quoteEconomics,type QuoteSigner} from './media-quotes';
import {createMediaInputs,type MediaInputs} from './media-inputs';
import {createMediaResultStorage,createR2MediaObjectStorage,unavailableMediaStorage,type MediaObjectStorage,type MediaResultStorage} from './media-storage';
import {createMediaDownloader,type MediaDecoder,type PinnedTransport} from './media-security';
import {createRouterImageProvider} from './ai/media-router-image';
import {createRouterVideoProvider} from './ai/media-router-video';
import {createVideoMediaDecoder,type VideoDecoderConfig} from './media-video-decoder';
import {createPinnedMediaTransport,type ImageHttp} from './media-pinned-transport';
import {createSharpMediaDecoder} from './media-decoder';
import {isStorageConfigured} from './storage';
import {MediaFault,type MediaEconomics,type MediaMode} from './media-contracts';
import type {MediaProviders,MediaProvider} from './media-provider';
export type MediaRuntimeConfig={databaseStep?:{scheduleApprovalRef:string;resourceApprovalRef:string;validUntil:string};storageBackend?:'r2'|'supabase';executionBackend?:'inngest'|'database-step';executionApprovalRef?:string;executionValidUntil?:string;supabaseStorage?:Omit<SupabaseMediaStorageConfig,'url'|'serviceKey'>;videoDecoder?:VideoDecoderConfig;videoDeploymentApprovalRef?:string;creationEnabled:boolean;schemaApproved:boolean;approvalRef:string;environmentRef:string;storageApprovalRef:string;decoderApprovalRef:string;transportApprovalRef:string;providerKey:string;providerAccountRef:string;quoteKey?:Buffer;inputHosts:readonly string[];resultHosts:readonly string[];consentVersion:string;modes:Partial<Record<MediaMode,{approvalRef:string;validUntil:string;economics:MediaEconomics}>>};
type Options={executionReady?:boolean;stepSecret?:string;config:MediaRuntimeConfig;store?:MediaStore;objects?:MediaObjectStorage;decoder?:MediaDecoder;videoDecoder?:MediaDecoder;transport?:PinnedTransport;providers?:MediaProviders;http?:ImageHttp;now?:()=>number};
export type MediaRuntime={store:MediaStore;catalog:MediaCatalog;signer?:QuoteSigner;inputs?:MediaInputs;storage:MediaResultStorage;providers:MediaProviders};
const hostsValid=(hosts:readonly string[])=>hosts.length>0&&hosts.every(h=>/^(?=.{1,253}$)[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,63}$/.test(h)&&!h.includes('*'));
export function createMediaRuntime(options:Options):MediaRuntime{
 const now=options.now??Date.now;const c=options.config,store=options.store??createMediaStore();
 let signer:QuoteSigner|undefined;
 try{if(c.quoteKey)signer=createQuoteSigner(c.quoteKey,now)}catch{/* 缺配置只关闭新建；旧结果恢复独立保留。 */}
 const backendReady=c.storageBackend==='r2'||c.storageBackend==='supabase';
 const backendExecutionReady=c.executionBackend==='inngest'||c.executionBackend==='database-step'&&c.storageBackend==='supabase'&&validMediaStepSecret(options.stepSecret)&&databaseStepApprovalsValid(c,now());
 const executionReady=options.executionReady===true&&backendExecutionReady&&Boolean(c.executionApprovalRef)&&Number.isFinite(Date.parse(c.executionValidUntil??''))&&Date.parse(c.executionValidUntil!)>now();
 const storageReady=Boolean(backendReady&&options.objects&&options.decoder&&options.transport&&c.storageApprovalRef&&c.decoderApprovalRef&&c.transportApprovalRef&&hostsValid(c.resultHosts));
 const videoReady=Boolean((c.storageBackend!=='supabase'||c.supabaseStorage?.resultMaxBytes===MEDIA_VIDEO_MAX_BYTES)&&backendReady&&options.objects&&options.videoDecoder&&options.transport&&c.storageApprovalRef&&c.videoDecoder?.approvalRef&&c.videoDeploymentApprovalRef&&c.transportApprovalRef&&hostsValid(c.resultHosts));
 const decode:MediaDecoder=(bytes,mime)=>mime==='video/mp4'&&videoReady?options.videoDecoder!(bytes,mime):mime.startsWith('image/')&&storageReady?options.decoder!(bytes,mime):Promise.reject(new MediaFault('media_decoder_unconfigured',503));
 const unavailable=async()=>{throw new MediaFault('media_storage_unconfigured',503)};
 const storage=options.objects&&c.storageApprovalRef?createMediaResultStorage(options.objects,(storageReady||videoReady)?createMediaDownloader(c.resultHosts,options.transport!):unavailable,decode):unavailableMediaStorage;
 const inputs=storageReady&&hostsValid(c.inputHosts)?createMediaInputs(store,options.objects!,options.decoder!,now):undefined;
 const tariffs:MediaCatalog['tariffs']={},enabledModes:MediaMode[]=[],deadlines=new Map<MediaMode,number>();
 const active=(mode:MediaMode)=>executionReady&&(c.executionBackend!=='database-step'||databaseStepApprovalsValid(c,now()))&&Date.parse(c.executionValidUntil??'')>now()&&enabledModes.includes(mode)&&(deadlines.get(mode)??0)>now();
 const recoveryAllowed=Boolean(c.providerKey&&c.providerAccountRef&&c.environmentRef&&c.approvalRef&&c.transportApprovalRef);
 const defaultAdapter=recoveryAllowed?createRouterImageProvider({key:c.providerKey,accountRef:c.providerAccountRef,inputHosts:c.inputHosts,resultHosts:c.resultHosts,http:options.http}):undefined;
 const videoAdapter=recoveryAllowed?createRouterVideoProvider({key:c.providerKey,accountRef:c.providerAccountRef,inputHosts:c.inputHosts,resultHosts:c.resultHosts,http:options.http}):undefined;
 const rawProviders=options.providers??{get:(model:string)=>model==='gpt-image-2'?defaultAdapter:model==='grok-imagine-video-1.5'?videoAdapter:undefined};
 for(const mode of ['text_to_image','image_to_image','text_to_video','image_to_video'] as const){
  const image=mode.endsWith('_image'),ready=image?storageReady&&Boolean(inputs):videoReady&&(mode==='text_to_video'||Boolean(inputs));
  const approval=c.modes[mode];
  try{
   if(!executionReady||c.consentVersion!=='media-v1'||!c.creationEnabled||!c.schemaApproved||!c.approvalRef||!c.environmentRef||!c.providerKey||!c.providerAccountRef||!signer||!ready||!approval?.approvalRef||!Number.isFinite(Date.parse(approval.validUntil))||Date.parse(approval.validUntil)<=now()||!rawProviders.get(image?'gpt-image-2':'grok-imagine-video-1.5')?.modes.includes(mode))continue;
   validateEconomics(approval.economics);if(approval.economics.providerAccountRef!==c.providerAccountRef)continue;
   tariffs[mode]=quoteEconomics(approval.economics);enabledModes.push(mode);deadlines.set(mode,Date.parse(approval.validUntil));
  }catch{/* 未核的价格与预算不进入目录。 */}
 }
 const catalog:MediaCatalog={consentVersion:c.consentVersion||closedMediaCatalog.consentVersion,get enabled(){return enabledModes.some(active)},get tariffs(){return Object.fromEntries(Object.entries(tariffs).filter(([mode])=>active(mode as MediaMode)))},get adapterModes(){return enabledModes.filter(active)}};
 const providers:MediaProviders={get(model){const adapter=rawProviders.get(model);if(!adapter)return undefined;return {modes:adapter.modes,async submit(task,input){if(!active(task.mode)||task.provider_account_ref!==c.providerAccountRef)return {kind:'unknown'};return adapter.submit(task,input)},async query(id,task){if(!recoveryAllowed||task.provider_account_ref!==c.providerAccountRef)return {kind:'unknown'};return adapter.query(id,task)}} satisfies MediaProvider}};
 return {store,catalog,signer,get inputs(){return active('image_to_image')||active('image_to_video')?inputs:undefined},storage,providers};
}
const emptyConfig=():MediaRuntimeConfig=>({creationEnabled:false,schemaApproved:false,approvalRef:'',environmentRef:'',storageApprovalRef:'',decoderApprovalRef:'',transportApprovalRef:'',providerKey:'',providerAccountRef:'',inputHosts:[],resultHosts:[],consentVersion:'media-v1',modes:{}});
// 仅可信服务端部署变量；不会发/config，不从key存在推断许可，不提供合成价格。
export function readMediaRuntimeConfig(env:NodeJS.ProcessEnv):MediaRuntimeConfig{
 try{
  const raw:unknown=JSON.parse(env.MEDIA_RUNTIME_CONFIG??'{}');if(!raw||typeof raw!=='object'||Array.isArray(raw))return emptyConfig();
  const b=raw as Record<string,unknown>,text=(k:string)=>typeof b[k]==='string'?b[k] as string:'',hosts=(k:string)=>Array.isArray(b[k])&&(b[k] as unknown[]).every(x=>typeof x==='string')?b[k] as string[]:[];
  const modes:MediaRuntimeConfig['modes']={};
  for(const mode of ['text_to_image','image_to_image','text_to_video','image_to_video'] as const){
   const m=(b.modes as Record<string,unknown>|undefined)?.[mode];
   if(!m||typeof m!=='object'||Array.isArray(m))continue;
   const v=m as {approvalRef?:unknown;validUntil?:unknown;economics?:MediaEconomics};
   try{
    if(typeof v.approvalRef!=='string'||!v.approvalRef||typeof v.validUntil!=='string'||!Number.isFinite(Date.parse(v.validUntil))||!v.economics)continue;
    validateEconomics(v.economics);
    modes[mode]={approvalRef:v.approvalRef,validUntil:v.validUntil,economics:v.economics};
   }catch{/* 单个mode的坏价目只关闭自身，不丢弃其它模式与独立恢复身份。 */}
  }
  const key=env.MEDIA_QUOTE_HMAC_HEX;
  return {storageBackend:b.storageBackend==='r2'||b.storageBackend==='supabase'?b.storageBackend:undefined,databaseStep:readDatabaseStepConfig(b.databaseStep),executionBackend:b.executionBackend==='inngest'||b.executionBackend==='database-step'?b.executionBackend:undefined,executionApprovalRef:text('executionApprovalRef'),executionValidUntil:text('executionValidUntil'),supabaseStorage:readSupabaseConfig(b.supabaseStorage),creationEnabled:env.MEDIA_CREATE_ENABLED==='1'&&b.creationEnabled===true,schemaApproved:b.schemaApproved===true,approvalRef:text('approvalRef'),environmentRef:text('environmentRef'),storageApprovalRef:text('storageApprovalRef'),decoderApprovalRef:text('decoderApprovalRef'),transportApprovalRef:text('transportApprovalRef'),providerKey:env.MEDIA_ROUTER_API_KEY??'',providerAccountRef:text('providerAccountRef'),quoteKey:key&&/^[0-9a-f]{64,128}$/i.test(key)&&key.length%2===0?Buffer.from(key,'hex'):undefined,inputHosts:hosts('inputHosts'),resultHosts:hosts('resultHosts'),consentVersion:text('consentVersion')||'media-v1',modes,videoDeploymentApprovalRef:text('videoDeploymentApprovalRef'),videoDecoder:readVideoConfig(b.videoDecoder)};
 }catch{return emptyConfig()}
}
function readVideoConfig(raw:unknown):VideoDecoderConfig|undefined{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return;
 const v=raw as VideoDecoderConfig;
 if(typeof v.approvalRef!=='string'||typeof v.version!=='string'||![v.ffmpeg,v.ffprobe].every(b=>b&&typeof b.path==='string'&&typeof b.sha256==='string'))return;
 return {approvalRef:v.approvalRef,version:v.version,ffmpeg:{path:v.ffmpeg.path,sha256:v.ffmpeg.sha256},ffprobe:{path:v.ffprobe.path,sha256:v.ffprobe.sha256}};
}
function readSupabaseConfig(raw:unknown):MediaRuntimeConfig['supabaseStorage']{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return;
 const v=raw as Record<string,unknown>,b=v.buckets as Record<string,unknown>|undefined;
 if(v.resultMaxBytes!==undefined&&(!Number.isSafeInteger(v.resultMaxBytes)||Number(v.resultMaxBytes)<1||Number(v.resultMaxBytes)>MEDIA_VIDEO_MAX_BYTES))return;
 if(typeof v.projectRef!=='string'||v.privateBucketsApproved!==true||!b||![b.staging,b.inputs,b.results].every(x=>typeof x==='string'))return;
 return {projectRef:v.projectRef,privateBucketsApproved:true,resultMaxBytes:v.resultMaxBytes as number|undefined,buckets:{staging:b.staging as string,inputs:b.inputs as string,results:b.results as string}};
}
let runtime:MediaRuntime|undefined;
export function getMediaRuntime():MediaRuntime{
 if(runtime)return runtime;
 const config=readMediaRuntimeConfig(process.env);
 let objects:MediaObjectStorage|undefined;
 try{if(config.storageApprovalRef){if(config.storageBackend==='r2'&&isStorageConfigured())objects=createR2MediaObjectStorage();else if(config.storageBackend==='supabase'&&config.supabaseStorage)objects=createSupabaseMediaObjectStorage({...config.supabaseStorage,url:process.env.NEXT_PUBLIC_SUPABASE_URL??'',serviceKey:process.env.MEDIA_SUPABASE_SERVICE_KEY??''},{fetch:boundedMediaFetch(fetch)})}}catch{/* 错项目或缺私有存储批准时保持关闭，不输出凭据。 */}
 const imageDecoder=config.decoderApprovalRef?createSharpMediaDecoder():undefined;
 const decoder:MediaDecoder|undefined=imageDecoder?async(bytes,mime)=>{checkMediaExecution();const result=await imageDecoder(bytes,mime);checkMediaExecution();return result}:undefined;
 const transport=config.transportApprovalRef&&hostsValid(config.resultHosts)?createPinnedMediaTransport({hosts:config.resultHosts}):undefined;
 let videoDecoder:MediaDecoder|undefined;
 try{if(config.videoDecoder?.approvalRef){const decodeVideo=createVideoMediaDecoder(config.videoDecoder);videoDecoder=async(bytes,mime)=>decodeVideo(bytes,mime,mediaExecutionSignal())}}catch{/* 视频二进制不符只关闭视频，不影响图片和原ID查询。 */}
 runtime=createMediaRuntime({config,objects,decoder,videoDecoder,transport,stepSecret:process.env.MEDIA_STEP_SECRET,executionReady:config.executionBackend==='inngest'?Boolean(process.env.INNGEST_EVENT_KEY&&process.env.INNGEST_SIGNING_KEY):config.executionBackend==='database-step'&&process.env.MEDIA_STEP_ENABLED==='1'});return runtime;
}

export function databaseStepApprovalsValid(config:MediaRuntimeConfig,now=Date.now()){
 const c=config.databaseStep;return Boolean(c&&c.scheduleApprovalRef&&c.resourceApprovalRef&&Number.isFinite(Date.parse(c.validUntil))&&Date.parse(c.validUntil)>now);
}
function readDatabaseStepConfig(raw:unknown):MediaRuntimeConfig['databaseStep']{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return;const r=raw as Record<string,unknown>;
 if(Object.keys(r).some(k=>!['scheduleApprovalRef','resourceApprovalRef','validUntil'].includes(k))||typeof r.scheduleApprovalRef!=='string'||typeof r.resourceApprovalRef!=='string'||typeof r.validUntil!=='string')return;
 return {scheduleApprovalRef:r.scheduleApprovalRef,resourceApprovalRef:r.resourceApprovalRef,validUntil:r.validUntil};
}
