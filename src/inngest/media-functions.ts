import {randomUUID} from 'node:crypto';
import {inngest} from './client';
import {MediaFault,mediaUuid,type TaskRecord} from '@/lib/media-contracts';
import {type MediaStore} from '@/lib/media-persistence';
import {type MediaProviders,type ProviderOutcome} from '@/lib/media-provider';
import {type MediaResultStorage} from '@/lib/media-storage';
import {getMediaRuntime} from '@/lib/media-runtime';
export function createMediaProcessor(store:MediaStore,providers:MediaProviders,storage:MediaResultStorage){
 const outcome=async(t:TaskRecord,r:ProviderOutcome,submissionResponse=false)=>{
  if(r.kind==='definitive_failure'){
   if(t.result_locator)return store.transition(t,{status:'reconciling',error:'provider_status_conflict',stage:'storage'});
   if(t.provider_task_id&&r.taskId!==t.provider_task_id)return store.transition(t,{status:'reconciling',error:'provider_identity_conflict',stage:'query'});
   return store.fail(t,r.code);
  }
  if(r.kind==='unknown')return store.transition(t,{status:'reconciling',error:'provider_unknown',stage:t.provider_task_id?'query':'submission'});
  if(!r.taskId||r.taskId.length>512)return store.transition(t,{status:'reconciling',error:'provider_response_invalid',stage:'submission'});
  if(r.kind==='complete'&&(!r.locator||r.locator.length>4096))return store.transition(t,{status:'reconciling',error:'provider_response_invalid',stage:'query'});
  return store.transition(t,{status:r.kind==='complete'?'storing':'waiting',taskId:r.taskId,locator:r.kind==='complete'?r.locator:undefined,submissionResponse});
 };
 return async(id:string)=>{
  if(!mediaUuid.test(id))return;
  const existing=await store.recovery(id);if(!existing)return;
  const adapter=providers.get(existing.model);
  // 默认关闭新外呼不阻断已持久结果的存储恢复。
  let t:TaskRecord|null=existing;
  if(existing.result_locator){
   if(existing.error_code==='media_download_expired'&&existing.provider_task_id&&adapter){
    try{t=await outcome(existing,await adapter.query(existing.provider_task_id,existing))}catch{t=await outcome(existing,{kind:'unknown'})}
   }
  }
  else if(!adapter||!adapter.modes.includes(existing.mode))return;
  else {
   const claim=await store.claim(id);if(!claim)return;t=claim.task;
   if(claim.submit){
    let inputUrl:string|null=null;
    // 输入签名失败发生在持久提交意图后，同样保守保留，不能暗中重新POST。
    try{
     if(t.input_id){const input=await store.input(t.user_id,t.input_id);if(!input?.sealed_key)throw Error('input_unavailable');inputUrl=await storage.signInput(input.sealed_key)}
     const response=await adapter!.submit(t,inputUrl);t=await outcome(t,response,true);
    }catch{if(t)t=await outcome(t,{kind:'unknown'})}
   }else if(t.provider_task_id){
    t=await store.recovery(id);if(!t||!t.provider_task_id)return;
    try{t=await outcome(t,await adapter!.query(t.provider_task_id,t))}catch{if(t)t=await outcome(t,{kind:'unknown'})}
   }else if(t.status==='submitting'&&Date.now()-new Date(t.updated_at).getTime()>300000){
    t=await outcome(t,{kind:'unknown'});
   }else return;
  }
  if(t?.credit_state==='reserved'&&t.result_locator){
   try{await store.complete(t,await storage.store(t))}
   catch(e){await store.transition(t,{status:'reconciling',error:e instanceof MediaFault&&e.code==='media_download_expired'?'media_download_expired':'storage_unavailable',stage:'storage'})}
  }
 };
}
export const processMediaTask=async(id:string)=>{const r=getMediaRuntime();return createMediaProcessor(r.store,r.providers,r.storage)(id)};
const triggers=[{event:'media/generate.requested'},{event:'media/reconcile.requested'},{event:'media/store.requested'}];
export const mediaGenerate=inngest.createFunction({id:'media-generate',retries:2,triggers},async({event,step})=>{
 const data=event.data as {taskId?:unknown;operationId?:unknown};
 if(typeof data.taskId!=='string'||!mediaUuid.test(data.taskId)||typeof data.operationId!=='string'||!mediaUuid.test(data.operationId))return {ignored:true};
 await step.run('process-original-task',()=>processMediaTask(data.taskId as string));return {processed:true};
});
export const mediaScan=inngest.createFunction({id:'media-recovery-scan',retries:1,triggers:{cron:'*/2 * * * *'}},async({step})=>{
 const store=getMediaRuntime().store;
 if(!await store.ready())return {unavailable:true};
 const due=await step.run('lease-bounded-tasks',()=>store.due(20));
 for(const task of due)await step.sendEvent(`recover-${task.id}`,{name:'media/reconcile.requested',data:{taskId:task.id,operationId:randomUUID()}});
 return {scheduled:due.length};
});
