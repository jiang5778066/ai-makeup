import {randomUUID} from 'node:crypto';
import {getCurrentUser} from './supabase/server';
import {accountConfigured,privateJson,sameOrigin} from './platform-account-http';
import {rateLimit} from './rate-limit';
import {MediaFault,mediaUuid,strictObject,type MediaRequest,type TaskRecord} from './media-contracts';
import {economicsFor,mediaCapabilities,normalizeMediaRequest,type MediaCatalog} from './media-catalog';
import {canonicalHash,quoteEconomics,type QuoteSigner} from './media-quotes';
import {type MediaStore} from './media-persistence';
import {InsufficientCreditsError} from './credits';
import type {MediaInputs} from './media-inputs';
import {unavailableMediaStorage,type MediaResultStorage} from './media-storage';
import {inngest} from '@/inngest/client';
import {getMediaRuntime} from './media-runtime';
const fields=['clientIntentId','mediaType','model','mode','prompt','parameters','inputIds','locale','consent','consentVersion'];
export type MediaDependencies={currentUser:()=>Promise<{id:string}|null>;catalog:MediaCatalog;store:MediaStore;signer?:QuoteSigner;inputs?:MediaInputs;storage?:MediaResultStorage;limit:(user:string)=>boolean;emit:(taskId:string)=>Promise<void>};
export async function mediaBody(request:Request){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new MediaFault('invalid_content_type',400);
 if(Number(request.headers.get('content-length')??0)>16384)throw new MediaFault('payload_too_large',413);
 const reader=request.body?.getReader();if(!reader)throw new MediaFault('invalid_payload',400);let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>16384){await reader.cancel();throw new MediaFault('payload_too_large',413)}chunks.push(r.value)}return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown}catch(e){if(e instanceof MediaFault)throw e;throw new MediaFault('invalid_payload',400)}finally{reader.releaseLock()}
}
export async function mediaTaskDTO(task:TaskRecord,storage:MediaResultStorage=unavailableMediaStorage){
 let result=null;if(task.status==='done'&&task.result_key&&task.result_mime)try{result=await storage.sign(task.result_key,task.result_mime)}catch{/* 原任务和完成状态保留，后续原ID重取。 */}
 return {version:1,taskId:task.id,creationId:`media:${task.id}`,mediaType:task.media_type,model:task.model,mode:task.mode,status:task.status,creditState:task.credit_state,createdAt:task.created_at,updatedAt:task.updated_at,result,errorCode:task.error_code?'media_recovery_required':null};
}
export function createMediaHandlers(deps:MediaDependencies){
 const execute=async(request:Request,write:boolean,run:(user:string)=>Promise<Response>)=>{
  try{
   const user=await deps.currentUser();if(!user)return privateJson({code:'unauthorized'},401);
   if(write&&!sameOrigin(request))return privateJson({code:'origin_rejected'},403);
   if(!deps.limit(user.id))return privateJson({code:'rate_limited'},429);
   if(!await deps.store.ready())return privateJson({code:'media_schema_unavailable'},503);
   return await run(user.id);
  }catch(e){if(e instanceof InsufficientCreditsError)return privateJson({code:'insufficient_credits'},402);return privateJson({code:e instanceof MediaFault?e.code:'media_unavailable'},e instanceof MediaFault?e.status:503)}
 };
 const hash=async(user:string,request:MediaRequest,economics:Parameters<typeof quoteEconomics>[0])=>canonicalHash({userId:user,request,inputHashes:await deps.store.inputHashes(user,request),economics:quoteEconomics(economics)});
 return {
 capabilities:(request:Request)=>execute(request,false,async()=>{const capabilities=mediaCapabilities(deps.catalog),available=capabilities.some(x=>x.enabled)&&Boolean(deps.signer);return privateJson({version:1,capabilities:capabilities.map(x=>({...x,enabled:x.enabled&&Boolean(deps.signer)})),pricingAvailable:available},available?200:503)}),
 quotes:(request:Request)=>execute(request,true,async user=>{
  const r=normalizeMediaRequest(await mediaBody(request)),economics=economicsFor(deps.catalog,r);if(!deps.signer)throw new MediaFault('media_quotes_unconfigured',503);
  const payloadHash=await hash(user,r,economics),token=deps.signer.issue(user,payloadHash,economics),q=deps.signer.verify(token,user,payloadHash);
  return privateJson({version:1,quoteId:q.quoteId,quoteToken:token,expiresAt:new Date(q.expiresAt).toISOString(),payloadHash,credits:q.credits,tariffVersion:q.tariffVersion,model:r.model,mode:r.mode});
 }),
 create:(request:Request)=>execute(request,true,async user=>{
  const b=strictObject(await mediaBody(request),[...fields,'quoteToken']),r=normalizeMediaRequest(Object.fromEntries(fields.map(k=>[k,b[k]]))),key=request.headers.get('idempotency-key')??'';
  if(!/^[\w-]{16,128}$/.test(key))throw new MediaFault('invalid_idempotency_key');
  const identities=await deps.store.identities(user,key,r.clientIntentId);
  if(identities.length>1||identities.some(t=>canonicalHash(t.request)!==canonicalHash(r)))throw new MediaFault('idempotency_conflict',409);
  if(!deps.signer||typeof b.quoteToken!=='string')throw new MediaFault('media_quotes_unconfigured',503);
  // 仅用未验正文取待验证hash；签名校验先于任何重放/账务操作。
  let claimedHash:string;try{claimedHash=JSON.parse(Buffer.from(b.quoteToken.split('.')[0],'base64url').toString()).payloadHash}catch{throw new MediaFault('invalid_quote')}
  const q=deps.signer.verify(b.quoteToken,user,claimedHash,true),payloadHash=await hash(user,r,q);if(identities.some(t=>canonicalHash(quoteEconomics(t.quote))!==canonicalHash(quoteEconomics(q))))throw new MediaFault('idempotency_conflict',409);if(q.payloadHash!==payloadHash)throw new MediaFault('invalid_quote');
  const old=await deps.store.replay(user,key,r,payloadHash);if(old)return privateJson({...await mediaTaskDTO(old,deps.storage),replayed:true});
  deps.signer.verify(b.quoteToken,user,payloadHash);const current=economicsFor(deps.catalog,r);if(canonicalHash(quoteEconomics(current))!==canonicalHash(quoteEconomics(q)))throw new MediaFault('quote_obsolete');
  const created=await deps.store.create(user,key,r,payloadHash,q);
  if(!created.replayed)try{await deps.emit(created.task.id)}catch{/* 已提交短事务，扫描器恢复投递；响应仍指向同一任务。 */}
  return privateJson({...await mediaTaskDTO(created.task,deps.storage),replayed:created.replayed},created.replayed?200:202);
 }),
 read:(request:Request,id:string)=>execute(request,false,async user=>{if(!mediaUuid.test(id))throw new MediaFault('not_found',404);const task=await deps.store.read(user,id);if(!task)throw new MediaFault('not_found',404);return privateJson(await mediaTaskDTO(task,deps.storage))}),
 inputCreate:(request:Request)=>execute(request,true,async user=>{if(!deps.inputs)throw new MediaFault('media_inputs_unconfigured',503);return privateJson(await deps.inputs.create(user,await mediaBody(request)),201)}),
 inputComplete:(request:Request,id:string)=>execute(request,true,async user=>{if(!mediaUuid.test(id))throw new MediaFault('not_found',404);if(!await deps.store.input(user,id))throw new MediaFault('not_found',404);if(!deps.inputs)throw new MediaFault('media_inputs_unconfigured',503);strictObject(await mediaBody(request),[]);return privateJson(await deps.inputs.complete(user,id))}),
 inputSign:(request:Request,id:string)=>execute(request,true,async user=>{if(!mediaUuid.test(id))throw new MediaFault('not_found',404);if(!await deps.store.input(user,id))throw new MediaFault('not_found',404);if(!deps.inputs)throw new MediaFault('media_inputs_unconfigured',503);strictObject(await mediaBody(request),[]);return privateJson(await deps.inputs.sign(user,id))})
 };
}
export const mediaHandlers=createMediaHandlers({currentUser:async()=>accountConfigured()?getCurrentUser():null,get catalog(){return getMediaRuntime().catalog},get store(){return getMediaRuntime().store},get signer(){return getMediaRuntime().signer},get inputs(){return getMediaRuntime().inputs},get storage(){return getMediaRuntime().storage},limit:user=>rateLimit(`media:${user}`,60,60000).ok,emit:async taskId=>{await inngest.send({name:'media/generate.requested',data:{taskId,operationId:randomUUID()}})}});
