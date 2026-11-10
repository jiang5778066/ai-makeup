import type { SQL } from 'drizzle-orm';
export class MediaFault extends Error {
  constructor(public code: string, public status = 422) { super(code); this.name = 'MediaFault'; }
}
export const mediaUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type MediaMode = 'text_to_image' | 'image_to_image' | 'text_to_video' | 'image_to_video';
export type MediaRequest = { clientIntentId:string; mediaType:'image'|'video'; model:string; mode:MediaMode; prompt:string; parameters:Record<string,string|number>; inputIds:string[]; locale:'en'|'zh-CN'; consent:true; consentVersion:string };
export type MediaEconomics = { tariffVersion:string; credits:number; providerUpperCents:number; budgetApprovalRef:string; dailyCapCents:number; providerAccountRef:string };
export type MediaQuote = MediaEconomics & { version:1; quoteId:string; userId:string; payloadHash:string; expiresAt:number };
export type MediaStatus = 'preparing'|'reserved'|'submitting'|'waiting'|'storing'|'reconciling'|'done'|'failed'|'refunded';
export type MediaStage = 'submission'|'query'|'storage'|'accounting';
export type TaskRecord = {
 id:string; user_id:string; request:MediaRequest; quote:MediaQuote; request_hash:string; client_intent_id:string; client_idempotency_key:string;
 media_type:'image'|'video'; provider:string; provider_account_ref:string; model:string; mode:MediaMode; input_id:string|null;
 status:MediaStatus; credit_state:'none'|'reserved'|'settled'|'refunded'; credits_quoted:number; state_version:number; error_code:string|null; reconcile_stage:MediaStage|null;
 submission_id:string|null; submission: {prompt:string; payloadHash:string; historyBaseline?:string[]}|null; provider_task_id:string|null;
 result_locator:string|null; result_key:string|null; result_mime:string|null; result_bytes:number|null; result_sha256:string|null;
 lease_token:string|null; created_at:string; updated_at:string; next_action_at:string|null; deleted_at:string|null;
};
export type InputRecord = { id:string; user_id:string; staging_key:string; sealed_key:string|null; status:'uploading'|'ready'|'rejected'|'expired'; expected_mime:string; expected_bytes:number; expected_sha256:string; verified_mime:string|null; verified_bytes:number|null; verified_sha256:string|null; expires_at:string };
export interface MediaExecutor { execute(query:SQL):Promise<Record<string,unknown>[]> }
export interface MediaDatabase extends MediaExecutor { transaction<T>(fn:(tx:MediaExecutor)=>Promise<T>):Promise<T> }
export async function rows<T>(tx:MediaExecutor, query:SQL):Promise<T[]> { return await tx.execute(query) as T[]; }
export const terminalMedia = (task:Pick<TaskRecord,'status'>) => ['done','failed','refunded'].includes(task.status);
export function strictObject(value:unknown, allowed:string[]):Record<string,unknown> {
 if (!value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).some(k=>!allowed.includes(k))) throw new MediaFault('invalid_payload');
 return value as Record<string,unknown>;
}
