import {checkMediaExecution} from './media-execution';
import {randomUUID} from 'node:crypto';
import {sql} from 'drizzle-orm';
import {lockMediaBalance,reserveMediaCredits,refundMediaCredits} from './credits';
import {reserveMediaBudget} from './ai-budget';
import {MediaFault,rows,type MediaDatabase,type MediaExecutor,type MediaRequest,type MediaQuote,type TaskRecord,type InputRecord} from './media-contracts';
import {canonicalHash,validateEconomics} from './media-quotes';
export const mediaDatabase:MediaDatabase={
 async execute(query){return mediaDatabase.transaction(tx=>tx.execute(query))},
 async transaction(fn){
  checkMediaExecution();return (await import('@/db/client')).db.transaction(async tx=>{
   // 仅当前媒体事务，既不改变生产会话全局配置，也不留下无限锁等待。
   await tx.execute(sql`SET LOCAL statement_timeout='5s'`);await tx.execute(sql`SET LOCAL lock_timeout='2s'`);
   return fn({execute:async q=>{checkMediaExecution();const result=Array.from(await tx.execute(q));checkMediaExecution();return result}});
  });
 }
};
export type StoredResult={key:string;mime:string;bytes:number;sha256:string};
export function createMediaStore(database:MediaDatabase=mediaDatabase){
 const get=async(tx:MediaExecutor,id:string,lock=false)=> (await rows<TaskRecord>(tx,sql`SELECT *, (lease_expires_at>clock_timestamp()) AS lease_valid FROM media_tasks WHERE id=${id}::uuid ${lock?sql`FOR UPDATE`:sql``}`))[0]??null;
 const owns=(current:TaskRecord|null,t:TaskRecord)=>Boolean(current&&current.id===t.id&&t.lease_token&&current.lease_token===t.lease_token&&current.state_version===t.state_version&&(current as TaskRecord&{lease_valid?:boolean}).lease_valid===true);
 const leaseWhere=(t:TaskRecord)=>sql`lease_token=${t.lease_token}::uuid AND lease_expires_at>clock_timestamp() AND state_version=${t.state_version}`;
 const audit=async(tx:MediaExecutor,t:TaskRecord,event:string,details:Record<string,unknown>={},operationId=randomUUID())=>{
  await tx.execute(sql`INSERT INTO media_task_events(task_id,user_id,operation_id,event_type,state_version,payload_identity,details) VALUES(${t.id},${t.user_id},${operationId},${event},${t.state_version},${canonicalHash(details)},${JSON.stringify(details)}::jsonb) ON CONFLICT(task_id,operation_id) DO NOTHING RETURNING id`);
 };
 const replay=async(tx:MediaExecutor,user:string,key:string,request:MediaRequest,hash:string)=>{
  const found=await rows<TaskRecord>(tx,sql`SELECT * FROM media_tasks WHERE user_id=${user} AND (client_idempotency_key=${key} OR client_intent_id=${request.clientIntentId}::uuid)`);
  if(found.some(t=>t.request_hash!==hash||t.client_intent_id!==request.clientIntentId)||found.length>1)throw new MediaFault('idempotency_conflict',409);
  return found[0]??null;
 };
 // 提交时间是稳定恢复起点；已完成原结果仍可存储，刷新失效定位也属于GET预算。
 const recoveryGate=async(tx:MediaExecutor,t:TaskRecord)=>{
  if(t.credit_state!=='reserved')return null;
  if(t.error_code==='media_manual_review_required'){
   await tx.execute(sql`UPDATE media_tasks SET next_action_at=null,lease_token=null,lease_expires_at=null WHERE id=${t.id} AND state_version=${t.state_version} AND credit_state='reserved' AND ${leaseWhere(t)} AND (next_action_at IS NOT NULL OR lease_token IS NOT NULL) RETURNING id`);
   return null;
  }
  if(t.status==='reserved'||t.result_locator&&t.error_code!=='media_download_expired')return t;
  const [age]=await tx.execute(sql`SELECT coalesce(submission_intent_at,created_at)<=now()-interval '24 hours' AS expired FROM media_tasks WHERE id=${t.id}`);
  if(!age?.expired)return t;
  const [paused]=await rows<TaskRecord>(tx,sql`UPDATE media_tasks SET status='reconciling',error_code='media_manual_review_required',reconcile_stage=${t.provider_task_id?'query':'submission'},next_action_at=null,lease_token=null,lease_expires_at=null,state_version=state_version+1,updated_at=now() WHERE id=${t.id} AND state_version=${t.state_version} AND credit_state='reserved' AND ${leaseWhere(t)} RETURNING *`);
  if(paused)await audit(tx,paused,'automatic_query_paused',{reason:'recovery_window_exceeded',windowHours:24});
  return null;
 };
 const store={
 database,
 async ready(){try{const [r]=await database.execute(sql`SELECT to_regclass('public.media_tasks') IS NOT NULL AND to_regclass('public.media_inputs') IS NOT NULL AND to_regclass('public.media_task_events') IS NOT NULL AS ready`);if(typeof r?.ready!=='boolean')throw Error('invalid_readiness');return r.ready}catch{throw new MediaFault('media_unavailable',503)}},
 async identities(user:string,key:string,intent:string){return rows<TaskRecord>(database,sql`SELECT * FROM media_tasks WHERE user_id=${user} AND (client_idempotency_key=${key} OR client_intent_id=${intent}::uuid)`)},
 replay:(user:string,key:string,request:MediaRequest,hash:string)=>replay(database,user,key,request,hash),
 get:(id:string)=>get(database,id),
 async recovery(id:string){const t=await get(database,id);return t?.credit_state==='reserved'?t:null},
 async read(user:string,id:string){const t=await get(database,id);return t?.user_id===user?t:null},
 async input(user:string,id:string){return (await rows<InputRecord>(database,sql`SELECT * FROM media_inputs WHERE id=${id}::uuid AND user_id=${user}::uuid`))[0]??null},
 async inputHashes(user:string,request:MediaRequest){const hashes:string[]=[];for(const id of request.inputIds){const i=await store.input(user,id);if(!i||i.status!=='ready')throw new MediaFault('input_not_found',404);hashes.push(i.verified_sha256!)}return hashes},
 async create(user:string,key:string,request:MediaRequest,hash:string,quote:MediaQuote){
  if(!/^[\w-]{16,128}$/.test(key))throw new MediaFault('invalid_idempotency_key');
  validateEconomics(quote);if(quote.userId!==user||quote.payloadHash!==hash)throw new MediaFault('invalid_quote');
  return database.transaction(async tx=>{
   await lockMediaBalance(tx,user);
   const old=await replay(tx,user,key,request,hash);if(old)return {task:old,replayed:true};
   if(quote.expiresAt<=Date.now())throw new MediaFault('quote_expired');
   for(const id of request.inputIds){const [i]=await tx.execute(sql`SELECT id FROM media_inputs WHERE user_id=${user}::uuid AND id=${id}::uuid AND status='ready' AND expires_at>now() FOR SHARE`);if(!i)throw new MediaFault('input_not_found',404)}
   const usage=await reserveMediaBudget(tx,quote.providerUpperCents,quote.dailyCapCents);if(!usage)throw new MediaFault('media_budget_unavailable',503);
   const id=randomUUID();
   const [task]=await rows<TaskRecord>(tx,sql`INSERT INTO media_tasks(id,user_id,media_type,provider_account_ref,model,mode,request,request_hash,client_intent_id,client_idempotency_key,input_id,quote,credits_quoted,provider_upper_cents,budget_usage_date,budget_reserved_at,status,credit_state,credits_reserved_at) VALUES(${id},${user},${request.mediaType},${quote.providerAccountRef},${request.model},${request.mode},${JSON.stringify(request)}::jsonb,${hash},${request.clientIntentId},${key},${request.inputIds[0]??null},${JSON.stringify(quote)}::jsonb,${quote.credits},${quote.providerUpperCents},${usage}::date,now(),'reserved','reserved',now()) RETURNING *`);
   await reserveMediaCredits(tx,user,id,quote.credits);await audit(tx,task,'reserved');return {task,replayed:false};
  });
 },
 async claimDue(){return database.transaction(async tx=>{
  const [t]=await rows<TaskRecord>(tx,sql`UPDATE media_tasks SET lease_token=${randomUUID()},lease_expires_at=clock_timestamp()+(${150}*interval '1 second'),state_version=state_version+1 WHERE id IN (SELECT id FROM media_tasks WHERE next_action_at<=now() AND credit_state='reserved' AND status IN ('reserved','submitting','waiting','storing','reconciling') AND (lease_expires_at IS NULL OR lease_expires_at<=now()) ORDER BY next_action_at,id FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`);
  return t?recoveryGate(tx,t):null;
 })},
 async claim(id:string,leased?:TaskRecord){return database.transaction(async tx=>{
  let t:TaskRecord|null;
  if(leased){t=await get(tx,id,true);if(!owns(t,leased))return null}
  else {
   const [acquired]=await rows<TaskRecord>(tx,sql`UPDATE media_tasks SET lease_token=${randomUUID()},lease_expires_at=clock_timestamp()+(${150}*interval '1 second'),state_version=state_version+1 WHERE id=${id}::uuid AND credit_state='reserved' AND status IN ('reserved','submitting','waiting','storing','reconciling') AND (lease_expires_at IS NULL OR lease_expires_at<=now()) RETURNING *`);t=acquired??null;
  }
  if(!t)return null;t=await recoveryGate(tx,t);if(!t)return null;
  if(t.status!=='reserved')return {task:t,submit:false};
  const [r]=await rows<TaskRecord>(tx,sql`UPDATE media_tasks SET status='submitting',submission_id=${randomUUID()},submission=${JSON.stringify({prompt:t.request.prompt,payloadHash:t.request_hash})}::jsonb,submission_intent_at=now(),state_version=state_version+1,updated_at=now(),next_action_at=now()+interval '60 seconds' WHERE id=${id}::uuid AND credit_state='reserved' AND ${leaseWhere(t)} RETURNING *`);
  if(!r)return null;await audit(tx,r,'submission_intent');return {task:r,submit:true};
 })},
 async release(t:TaskRecord){return database.transaction(async tx=>{
  const current=await get(tx,t.id,true);if(!owns(current,t))return null;
  const [r]=await rows<TaskRecord>(tx,sql`UPDATE media_tasks SET lease_token=null,lease_expires_at=null WHERE id=${t.id}::uuid AND ${leaseWhere(t)} RETURNING *`);return r??null;
 })},
 async transition(t:TaskRecord,patch:{status:'waiting'|'storing'|'reconciling';taskId?:string;locator?:string;error?:string;stage?:string;submissionResponse?:boolean}){
  const auditIdentityConflict=(tx:MediaExecutor,current:TaskRecord)=>audit(tx,current,'late_identity_conflict',{
   responseHash:canonicalHash({taskId:patch.taskId,locator:patch.locator}),expectedVersion:t.state_version
  });
  return database.transaction(async tx=>{
   const current=await get(tx,t.id,true);if(!current||!owns(current,t))return null;
   // 旧租约或旧版本的晚肯定响应不自动补写；未知原ID走受控人工核对。
   const sameSubmission=Boolean(t.submission_id&&current.submission_id===t.submission_id&&t.submission&&current.submission&&current.submission.payloadHash===current.request_hash&&t.submission.payloadHash===t.request_hash&&canonicalHash(current.submission)===canonicalHash(t.submission)&&current.user_id===t.user_id&&current.request_hash===t.request_hash&&current.model===t.model&&current.mode===t.mode&&current.provider===t.provider&&current.provider_account_ref===t.provider_account_ref&&canonicalHash(current.request)===canonicalHash(t.request));
   if(current.credit_state!=='reserved'||['done','refunded','failed'].includes(current.status)||patch.submissionResponse&&!sameSubmission){await audit(tx,current,'late_response_ignored',{expectedVersion:t.state_version});return null}
   if(patch.taskId&&current.provider_task_id&&current.provider_task_id!==patch.taskId){
    await auditIdentityConflict(tx,current);return null;
   }
   // 人工暂停只能被已核原提交成功结果转为存储；accepted不能重新开启自动查询。
   const paused=current.error_code==='media_manual_review_required'&&!patch.locator;
   const [r]=await rows<TaskRecord>(tx,sql`UPDATE media_tasks SET status=${paused?'reconciling':patch.status},provider_task_id=coalesce(provider_task_id,${patch.taskId??null}),result_locator=coalesce(${patch.locator??null},result_locator),error_code=${paused?'media_manual_review_required':patch.error??null},reconcile_stage=${paused?'query':patch.stage??null},state_version=state_version+1,updated_at=now(),next_action_at=${paused?sql`null`:sql`now()+interval '60 seconds'`} WHERE id=${t.id} AND state_version=${current.state_version} AND credit_state='reserved' AND ${leaseWhere(t)} RETURNING *`);
   if(!r)return null;
   await audit(tx,r,patch.status);return r;
  }).catch(async error=>{
   // 唯一索引是最终归属门禁；并发抢占冲突回滚后单独保留去密审计。
   let cause:unknown=error;
   for(let depth=0;depth<4&&cause&&typeof cause==='object';depth++){
    if(patch.submissionResponse&&patch.taskId&&'code' in cause&&cause.code==='23505'&&'constraint_name' in cause&&cause.constraint_name==='media_tasks_provider_task_uq'){
     await database.transaction(async tx=>{const current=await get(tx,t.id,true);if(current)await auditIdentityConflict(tx,current)});
     return null;
    }
    cause='cause' in cause?cause.cause:null;
   }
   throw error;
  });
 },
 async complete(t:TaskRecord,result:StoredResult){return database.transaction(async tx=>{
  const current=await get(tx,t.id,true);if(!owns(current,t))return null;
  const [r]=await rows<TaskRecord>(tx,sql`UPDATE media_tasks SET status='done',credit_state='settled',credits_settled_at=now(),result_key=${result.key},result_mime=${result.mime},result_bytes=${result.bytes},result_sha256=${result.sha256},error_code=null,reconcile_stage=null,state_version=state_version+1,updated_at=now(),next_action_at=null,lease_token=null,lease_expires_at=null WHERE id=${t.id} AND state_version=${t.state_version} AND credit_state='reserved' AND result_locator IS NOT NULL AND ${leaseWhere(t)} RETURNING *`);
  if(r)await audit(tx,r,'done');return r??null;
 })},
 async fail(t:TaskRecord,code:string){return database.transaction(async tx=>{
  const current=await get(tx,t.id,true);if(!current||!owns(current,t))return null;
  await lockMediaBalance(tx,t.user_id);
  if(current.state_version!==t.state_version||current.credit_state!=='reserved'||current.result_locator){await audit(tx,current,'late_failure_ignored');return null}
  const total=await refundMediaCredits(tx,t.user_id,t.id);if(total!==current.credits_quoted)throw new Error('media_consumptions_out_of_sync');
  const [r]=await rows<TaskRecord>(tx,sql`UPDATE media_tasks SET status='refunded',credit_state='refunded',credits_refunded_at=now(),error_code=${code},reconcile_stage=null,state_version=state_version+1,updated_at=now(),next_action_at=null,lease_token=null,lease_expires_at=null WHERE id=${t.id} AND ${leaseWhere(t)} RETURNING *`);if(!r)throw new MediaFault('media_lease_lost',409);await audit(tx,r,'refunded');return r;
 })},
 async due(limit=20){if(!Number.isInteger(limit)||limit<1||limit>100)throw new MediaFault('invalid_scan_limit');return database.transaction(async tx=>{
  const leased=await rows<TaskRecord>(tx,sql`UPDATE media_tasks SET lease_token=${randomUUID()},lease_expires_at=clock_timestamp()+(${150}*interval '1 second'),state_version=state_version+1 WHERE id IN (SELECT id FROM media_tasks WHERE next_action_at<=now() AND credit_state='reserved' AND status IN ('reserved','submitting','waiting','storing','reconciling') AND (lease_expires_at IS NULL OR lease_expires_at<=now()) ORDER BY next_action_at,id FOR UPDATE SKIP LOCKED LIMIT ${limit}) RETURNING *`);
  const due:TaskRecord[]=[];for(const t of leased)if(await recoveryGate(tx,t))due.push(t);return due;
 })},
 audit
 };
 return store;
}
export type MediaStore=ReturnType<typeof createMediaStore>;
