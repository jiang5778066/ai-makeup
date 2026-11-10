import type {MediaProvider,ProviderOutcome} from '../media-provider';
import type {TaskRecord} from '../media-contracts';
import {assertMediaUrl} from '../media-security';
import {createPinnedVideoHttp,type ImageHttp} from '../media-pinned-transport';
import {validMediaTaskId} from './media-router-image';
const model='grok-imagine-video-1.5';
const base='https://api.router.team/api/public/creative-center/videos';
const unknown:ProviderOutcome={kind:'unknown'};
type Config={key:string;accountRef:string;inputHosts:readonly string[];resultHosts:readonly string[];http?:ImageHttp;allowSubmit?:boolean};
function validTask(t:TaskRecord){
 const p=t.request?.parameters;
 return t.model===model&&t.request?.model===model&&t.media_type==='video'&&t.request.mediaType==='video'&&t.request.mode===t.mode&&['text_to_video','image_to_video'].includes(t.mode)&&p&&Object.keys(p).length===2&&p.durationSeconds===5&&p.resolution==='480p'&&Array.isArray(t.request.inputIds)&&t.request.inputIds.length===(t.mode==='image_to_video'?1:0)&&t.input_id===(t.request.inputIds[0]??null);
}
export function createRouterVideoProvider(config:Config):MediaProvider{
 const http=config.http??createPinnedVideoHttp();
 const call=async(method:'GET'|'POST',url:string,t:TaskRecord,body?:string,id?:string):Promise<ProviderOutcome>=>{
  try{
   if(!config.key||t.provider_account_ref!==config.accountRef||!validTask(t))return unknown;
   const r=await http({method,url,key:config.key,body});
   if(r.status<200||r.status>=300||r.body.length>256*1024)return unknown;
   const b=JSON.parse(r.body.toString('utf8')) as Record<string,unknown>;
   if(!b||Array.isArray(b)||typeof b!=='object'||b.model!==undefined&&b.model!==model||b.type!==undefined&&b.type!=='video'||b.generation_type!==undefined&&b.generation_type!=='video')return unknown;
   if(b.task_id!==undefined&&b.taskId!==undefined&&b.task_id!==b.taskId)return unknown;
   // 视频协议要求task_id；taskId只能作为一致性校验，不能替代缺失的原ID。
   const taskId=b.task_id;
   if(!validMediaTaskId(taskId)||id!==undefined&&taskId!==id)return unknown;
   if(typeof b.status!=='string'||!['submitted','processing','completed','failed'].includes(b.status))return unknown;
   if(method==='POST'||b.status==='submitted'||b.status==='processing')return {kind:'accepted',taskId};
   // 只有响应明确回传原模型，原ID的GET失败才可授权既有确定失败流程。
   if(b.status==='failed')return b.model===model?{kind:'definitive_failure',taskId,code:'provider_failed'}:unknown;
   // 已存在但无效的高优先级字段拒绝，不借次级字段掩盖冲突；cover与图片字段不参与。
   const locator=b.output_url!==undefined?b.output_url:b.url;
   if(typeof locator!=='string'||!locator||locator.length>4096)return unknown;
   assertMediaUrl(locator,config.resultHosts);
   return {kind:'complete',taskId,locator};
  }catch{return unknown}
 };
 return {modes:['text_to_video','image_to_video'],async submit(task,inputUrl){
  if(config.allowSubmit===false||!validTask(task)||!task.submission||typeof task.submission.prompt!=='string'||!task.submission.prompt.trim()||task.submission.prompt.length>3800||task.submission.prompt!==task.request.prompt)return unknown;
  try{
   if(task.mode==='image_to_video'){if(!inputUrl||!task.input_id)return unknown;assertMediaUrl(inputUrl,config.inputHosts)}else if(inputUrl!==null)return unknown;
   const body={model,prompt:task.submission.prompt,duration:5,resolution:'480p',...(task.mode==='image_to_video'?{image:inputUrl}:{})};
   return call('POST',base,task,JSON.stringify(body));
  }catch{return unknown}
 },async query(id,task){
  if(!validMediaTaskId(id)||task.provider_task_id&&task.provider_task_id!==id)return unknown;
  return call('GET',`${base}/${encodeURIComponent(id)}?model=${model}`,task,undefined,id);
 }};
}
