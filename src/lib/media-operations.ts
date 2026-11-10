import {sql} from 'drizzle-orm';
import {MediaFault,mediaUuid,rows,strictObject,type TaskRecord} from './media-contracts';
import type {MediaStore} from './media-persistence';
import {lockMediaBalance,refundMediaCredits} from './credits';
import {canonicalHash} from './media-quotes';
export type MediaOperation={taskId:string;operationId:string;expectedVersion:number;action:'bind_original'|'confirm_failed';caseId:string;evidenceSha256:string;providerTaskId?:string};
// 由受限运行环境验签/鉴权返回，approval身份须已核对同一operationHash，不能来自CLI字符串。
export type VerifiedMediaOperator={subject:string;roles:readonly string[];operationHash:string;approvalSubjects:readonly string[]};
export type MediaOperationVerifier=(credential:unknown,operationHash:string)=>Promise<VerifiedMediaOperator|null>;
export function createMediaOperations(store:MediaStore,verify?:MediaOperationVerifier){return {
 async dryRun(taskId:string){if(!mediaUuid.test(taskId))throw new MediaFault('invalid_task_id');const t=await store.get(taskId);return t?{taskId:t.id,status:t.status,creditState:t.credit_state,expectedVersion:t.state_version,reconcileStage:t.reconcile_stage,hasProviderId:Boolean(t.provider_task_id),writable:Boolean(verify)}:null},
 async apply(value:MediaOperation,credential:unknown){
  if(!verify)throw new MediaFault('media_operations_unconfigured',503);
  const b=strictObject(value,['taskId','operationId','expectedVersion','action','caseId','evidenceSha256','providerTaskId']);
  if(!mediaUuid.test(String(b.taskId))||!mediaUuid.test(String(b.operationId))||!Number.isSafeInteger(b.expectedVersion)||Number(b.expectedVersion)<0||!['bind_original','confirm_failed'].includes(String(b.action))||typeof b.caseId!=='string'||!/^[\w-]{1,120}$/.test(b.caseId)||typeof b.evidenceSha256!=='string'||!/^[0-9a-f]{64}$/.test(b.evidenceSha256)||b.action==='bind_original'&&(typeof b.providerTaskId!=='string'||!/^[\w.:/-]{1,512}$/.test(b.providerTaskId))||b.action==='confirm_failed'&&b.providerTaskId!==undefined)throw new MediaFault('invalid_operation');
  const identity=canonicalHash(b),operator=await verify(credential,identity);
  if(!operator||!operator.subject||operator.operationHash!==identity||!operator.roles.includes('media_reconcile'))throw new MediaFault('operation_forbidden',403);
  if(new Set(operator.approvalSubjects.filter(x=>x&&x!==operator.subject)).size<2)throw new MediaFault('two_person_approval_required',403);
  if(value.action==='confirm_failed'&&!operator.roles.includes('media_settlement'))throw new MediaFault('operation_forbidden',403);
  return store.database.transaction(async tx=>{
   const snapshot=await store.get(value.taskId);if(!snapshot)throw new MediaFault('not_found',404);
   await lockMediaBalance(tx,snapshot.user_id);
   const [t]=await rows<TaskRecord>(tx,sql`SELECT * FROM media_tasks WHERE id=${value.taskId} FOR UPDATE`);
   const [old]=await tx.execute(sql`SELECT payload_identity FROM media_task_events WHERE task_id=${t.id} AND operation_id=${value.operationId}`);
   if(old){if(old.payload_identity!==identity)throw new MediaFault('operation_conflict',409);return {taskId:t.id,replayed:true}}
   if(t.state_version!==value.expectedVersion||t.credit_state!=='reserved'||t.status!=='reconciling'||t.result_locator)throw new MediaFault('operation_state_conflict',409);
   if(value.action==='bind_original'){
    if(t.provider_task_id||t.result_locator||!t.submission_id)throw new MediaFault('operation_state_conflict',409);
    await tx.execute(sql`UPDATE media_tasks SET provider_task_id=${value.providerTaskId!},status='waiting',reconcile_stage='query',state_version=state_version+1,next_action_at=now(),updated_at=now() WHERE id=${t.id} RETURNING id`);
   }else{
    const amount=await refundMediaCredits(tx,t.user_id,t.id);if(amount!==t.credits_quoted)throw new Error('media_consumptions_out_of_sync');
    await tx.execute(sql`UPDATE media_tasks SET status='refunded',credit_state='refunded',credits_refunded_at=now(),error_code='operator_confirmed_failure',reconcile_stage=null,state_version=state_version+1,next_action_at=null,updated_at=now() WHERE id=${t.id} RETURNING id`);
   }
   await tx.execute(sql`INSERT INTO media_task_events(task_id,user_id,operation_id,event_type,state_version,actor_kind,actor_id,evidence_ref,payload_identity,details) VALUES(${t.id},${t.user_id},${value.operationId},${value.action},${t.state_version+1},'operator',${operator.subject},${value.evidenceSha256},${identity},${JSON.stringify({caseId:value.caseId,approvalSubjects:operator.approvalSubjects})}::jsonb) RETURNING id`);
   return {taskId:t.id,replayed:false};
  });
 }
}}
