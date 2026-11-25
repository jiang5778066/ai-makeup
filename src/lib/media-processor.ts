import {MediaFault,mediaUuid,type TaskRecord} from './media-contracts';
import type {MediaStore} from './media-persistence';
import type {MediaProviders,ProviderOutcome} from './media-provider';
import type {MediaResultStorage} from './media-storage';
type Options={singleStep?:boolean;signal?:AbortSignal};
/** 持久状态是唯一恢复起点；通知和浏览器生命周期不授予执行权。 */
export function createMediaProcessor(store:MediaStore,providers:MediaProviders,storage:MediaResultStorage,options:Options={}){
 const outcome=async(t:TaskRecord,r:ProviderOutcome,submissionResponse=false)=>{
  if(t.result_locator&&t.error_code==='media_download_expired'){
   const freshResult=r.kind==='complete'&&r.taskId&&r.taskId.length<=512&&r.taskId===t.provider_task_id
    &&r.locator&&r.locator.length<=4096&&r.locator!==t.result_locator;
   if(!freshResult){
    // 显式身份冲突仍交给仓储拒绝并审计，其余未取得新地址的响应继续查原ID。
    const conflictingId=(r.kind==='accepted'||r.kind==='complete')&&r.taskId&&t.provider_task_id&&r.taskId!==t.provider_task_id?r.taskId:undefined;
    return store.transition(t,{
     status:'reconciling',error:'media_download_expired',stage:'query',
     taskId:conflictingId,locator:conflictingId&&r.kind==='complete'?r.locator:undefined
    });
   }
  }
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
 return async(id:string,leased?:TaskRecord)=>{
  if(!mediaUuid.test(id)||options.signal?.aborted)return false;
  const claim=await store.claim(id,leased);if(!claim)return false;
  let t:TaskRecord|null=claim.task;
  const check=()=>options.signal?.throwIfAborted();
  try{
   check();const adapter=providers.get(t.model);
   const needsRefresh=t.result_locator&&t.error_code==='media_download_expired'&&t.provider_task_id;
   if(!t.result_locator||needsRefresh){
    if(!adapter||!adapter.modes.includes(t.mode))return false;
    if(claim.submit){
     let inputUrl:string|null=null;
     // 意图已持久化后遇到任何不确定错误都保留原提交，绝不重新POST。
     try{
      if(t.input_id){const input=await store.input(t.user_id,t.input_id);check();if(!input?.sealed_key)throw Error('input_unavailable');inputUrl=await storage.signInput(input.sealed_key)}
      check();t=await outcome(t,await adapter.submit(t,inputUrl),true);
     }catch{if(t)t=await outcome(t,{kind:'unknown'})}
    }else if(t.provider_task_id){
     try{check();t=await outcome(t,await adapter.query(t.provider_task_id,t))}catch{if(t)t=await outcome(t,{kind:'unknown'})}
    }else {
     t=await outcome(t,{kind:'unknown'});return true;
    }
    // 单次认证step只执行提交或一次查询；locator必须先落库，下一tick才下载存储。
    if(options.singleStep)return true;
   }
   // 过期地址只用于比对刷新响应。
   if(t?.credit_state==='reserved'&&t.result_locator&&t.error_code!=='media_download_expired'){
    const storing=t;
    try{check();const result=await storage.store(storing);check();t=await store.complete(storing,result)}
    catch(e){t=await store.transition(storing,{status:'reconciling',error:e instanceof MediaFault&&e.code==='media_download_expired'?'media_download_expired':'storage_unavailable',stage:'storage'})}
   }
   return true;
  }finally{
   // 保留最新版本；过期或已转让租约的release在数据库端是无操作。
   await store.release(t??claim.task);
  }
 };
}
