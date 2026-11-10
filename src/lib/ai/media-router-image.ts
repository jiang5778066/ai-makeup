import type {MediaProvider,ProviderOutcome} from '../media-provider';
import type {TaskRecord} from '../media-contracts';
import {assertMediaUrl} from '../media-security';
import {createPinnedImageHttp,type ImageHttp} from '../media-pinned-transport';
const base='https://api.router.team/api/public/creative-center/images';
const unknown:ProviderOutcome={kind:'unknown'};
type Config={key:string;accountRef:string;inputHosts:readonly string[];resultHosts:readonly string[];http?:ImageHttp;allowSubmit?:boolean};
const validId=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&v.length<=512&&!/[\u0000-\u001f\u007f]/.test(v);
export {validId as validMediaTaskId};
function validTask(t:TaskRecord){
 const p=t.request?.parameters;
 return t.model==='gpt-image-2'&&t.request?.model===t.model&&t.media_type==='image'&&t.request.mediaType==='image'&&t.request.mode===t.mode&&['text_to_image','image_to_image'].includes(t.mode)&&p&&Object.keys(p).length===3&&p.quality==='1k'&&p.size==='2:3'&&p.n===1&&Array.isArray(t.request.inputIds)&&t.request.inputIds.length===(t.mode==='image_to_image'?1:0)&&t.input_id===(t.request.inputIds[0]??null);
}
export function createRouterImageProvider(config:Config):MediaProvider{
 const http=config.http??createPinnedImageHttp();
 const call=async(method:'GET'|'POST',url:string,t:TaskRecord,body?:string,id?:string):Promise<ProviderOutcome>=>{
  try{
   if(!config.key||t.provider_account_ref!==config.accountRef||!validTask(t))return unknown;
   const r=await http({method,url,key:config.key,body});if(r.status<200||r.status>=300||r.body.length>256*1024)return unknown;
   const b=JSON.parse(r.body.toString('utf8')) as Record<string,unknown>;
   if(!b||Array.isArray(b)||typeof b!=='object'||b.model!==undefined&&b.model!=='gpt-image-2'||b.generation_type!==undefined&&b.generation_type!=='image'||b.type!==undefined&&b.type!=='image')return unknown;
   if(b.task_id!==undefined&&b.taskId!==undefined&&b.task_id!==b.taskId)return unknown;
   const taskId=b.task_id??b.taskId;if(!validId(taskId)||id!==undefined&&taskId!==id)return unknown;
   if(b.status==='submitted'||b.status==='processing')return {kind:'accepted',taskId};
   // POST 只确认受理身份；终态由原ID的可信GET确定，避免提交响应即触发退款。
   if(method==='POST'&&(b.status==='completed'||b.status==='failed'))return {kind:'accepted',taskId};
   if(b.status==='failed')return {kind:'definitive_failure',taskId,code:'provider_failed'};
   if(b.status!=='completed')return unknown;
   const data=Array.isArray(b.data)?b.data[0] as {url?:unknown}|undefined:undefined;
   const locator=(Array.isArray(b.result_urls)?b.result_urls[0]:undefined)??data?.url??b.cover_url;
   if(typeof locator!=='string'||locator.length>4096)return unknown;
   assertMediaUrl(locator,config.resultHosts);return {kind:'complete',taskId,locator};
  }catch{return unknown}
 };
 return {modes:['text_to_image','image_to_image'],async submit(task,inputUrl){
  if(config.allowSubmit===false||!validTask(task)||!task.submission||typeof task.submission.prompt!=='string'||!task.submission.prompt.trim()||task.submission.prompt.length>3800||task.submission.prompt!==task.request.prompt)return unknown;
  try{
   if(task.mode==='image_to_image'){if(!inputUrl||!task.input_id)return unknown;assertMediaUrl(inputUrl,config.inputHosts)}else if(inputUrl!==null)return unknown;
   const body={model:'gpt-image-2',prompt:task.submission.prompt,quality:'1k',size:'2:3',n:1,...(task.mode==='image_to_image'?{image_urls:[inputUrl]}:{})};
   return await call('POST',base,task,JSON.stringify(body));
  }catch{return unknown}
 },async query(id,task){if(!validId(id)||task.provider_task_id&&task.provider_task_id!==id)return unknown;return call('GET',`${base}/${encodeURIComponent(id)}`,task,undefined,id)}};
}
