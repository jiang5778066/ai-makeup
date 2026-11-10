import {sql} from 'drizzle-orm';
import {mediaDatabase} from './media-persistence';
import {mediaCreationId,makeupCreationId,encodeGlobalCreationCursor} from './platform-creations-query';
import {mapMakeupCreation,mapMediaCreation} from './platform-creations-mapping';
import {makeupResultLink} from './platform-creations-results';
import {unavailableMediaStorage} from './media-storage';
import type {CreationSource,CreationQuery,CreationResult} from './platform-creations-types';
import {rows,type MediaDatabase,type TaskRecord} from './media-contracts';
type UnifiedRow={kind:'makeup'|'media';id:string;cursor_at:string;data:Record<string,unknown>};
export function createUnifiedCreationSource(database:MediaDatabase=mediaDatabase,signMakeup:typeof makeupResultLink=makeupResultLink,signMedia:(key:string,mime:string)=>Promise<CreationResult|null>=unavailableMediaStorage.sign):CreationSource{
 const map=async(row:UnifiedRow)=>row.kind==='media'?mapMediaCreation(row.data as unknown as TaskRecord,signMedia):mapMakeupCreation({id:row.id,status:String(row.data.status),mode:row.data.mode as 'full_face'|'virtual_try_on',styleId:String(row.data.style_id),resultKey:row.data.result_key as string|null,error:row.data.error as string|null,createdAt:new Date(String(row.data.created_at)),updatedAt:new Date(String(row.data.updated_at))},signMakeup);
 return {
 async connectionState(){try{const [r]=await database.execute(sql`SELECT to_regclass('public.generations') IS NOT NULL AS makeup,to_regclass('public.media_tasks') IS NOT NULL AS media`);return {makeup:r.makeup?'connected':'unavailable',media:r.media?'connected':'not_connected'}}catch{return {makeup:'unavailable',media:'unavailable'}}},
 async validateCursor(user,cursor){
  const kind=cursor.kind??'makeup',table=kind==='makeup'?sql`generations`:sql`media_tasks`;
  const found=await database.execute(sql`SELECT id FROM ${table} WHERE user_id=${user}::uuid AND id=${cursor.id}::uuid AND created_at=${cursor.at}::timestamptz LIMIT 1`);return found.length===1;
 },
 async list(user,query){
  const f=query.filter;
  const makeupFilter=f==='video'?sql`false`:f==='full_face'?sql`g.mode='full_face'`:!['all','image'].includes(f)?sql`g.mode='virtual_try_on' AND g.makeup_config->${f}->'enabled'='true'::jsonb`:sql`true`;
  const mediaFilter=['all','image','video'].includes(f)?f==='all'?sql`true`:sql`m.media_type=${f}`:sql`false`;
  const cursor=query.cursor?sql`AND (created_at,kind COLLATE "C",id)<(${query.cursor.at}::timestamptz,${query.cursor.kind??'makeup'}::text COLLATE "C",${query.cursor.id}::uuid)`:sql``;
  const records=await rows<UnifiedRow>(database,sql`SELECT kind,id,to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_at,data FROM (SELECT 'makeup'::text AS kind,g.id,g.created_at,to_jsonb(g) AS data FROM generations g WHERE g.user_id=${user}::uuid AND g.deleted_at IS NULL AND ${makeupFilter} UNION ALL SELECT 'media'::text AS kind,m.id,m.created_at,to_jsonb(m) AS data FROM media_tasks m WHERE m.user_id=${user}::uuid AND m.deleted_at IS NULL AND ${mediaFilter}) creations WHERE true ${cursor} ORDER BY created_at DESC,kind COLLATE "C" DESC,id DESC LIMIT ${query.limit+1}`);
  const visible=records.slice(0,query.limit),last=visible.at(-1);return {items:await Promise.all(visible.map(map)),nextCursor:records.length>query.limit&&last?encodeGlobalCreationCursor(query.filter,last.cursor_at,last.kind,last.id):null};
 },
 async read(user,opaque){
  const media=mediaCreationId(opaque),makeup=makeupCreationId(opaque),id=media??makeup;if(!id)return null;const table=media?sql`media_tasks`:sql`generations`;
  const [r]=await database.execute(sql`SELECT to_jsonb(t) AS data FROM ${table} t WHERE id=${id}::uuid AND user_id=${user}::uuid AND deleted_at IS NULL`);
  return r?map({kind:media?'media':'makeup',id,cursor_at:'',data:r.data as Record<string,unknown>}):null;
 },
 async remove(user,opaque){
  const media=mediaCreationId(opaque),makeup=makeupCreationId(opaque),id=media??makeup;if(!id)return 'not_found';const table=media?sql`media_tasks`:sql`generations`;
  const settled=media?sql`credit_state IN ('none','settled','refunded')`:sql`(status='done' OR error IS NULL OR error NOT IN ('creative_submission_pending','creative_result_pending'))`;
  const updated=await database.execute(sql`UPDATE ${table} SET deleted_at=now() WHERE id=${id}::uuid AND user_id=${user}::uuid AND deleted_at IS NULL AND status IN ('done','failed','refunded') AND ${settled} RETURNING id`);
  if(updated.length)return 'removed';const [r]=await database.execute(sql`SELECT deleted_at FROM ${table} WHERE id=${id}::uuid AND user_id=${user}::uuid`);return !r?'not_found':r.deleted_at?'removed':'in_progress';
 }
 };
}
