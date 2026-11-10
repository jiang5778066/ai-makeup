import {createHash,randomUUID} from 'node:crypto';
import {sql} from 'drizzle-orm';
import {MediaFault,strictObject,type InputRecord} from './media-contracts';
import type {MediaStore} from './media-persistence';
import type {MediaObjectStorage} from './media-storage';
import {MEDIA_INPUT_MAX,readBounded,verifyDecoded,type MediaDecoder} from './media-security';
export function validateInputSpec(value:unknown){const b=strictObject(value,['contentType','contentLength','sha256','purpose']);if(!['image/png','image/jpeg','image/webp'].includes(String(b.contentType))||!Number.isSafeInteger(b.contentLength)||Number(b.contentLength)<1||Number(b.contentLength)>MEDIA_INPUT_MAX||typeof b.sha256!=='string'||!/^[0-9a-f]{64}$/.test(b.sha256)||b.purpose!=='reference_image')throw new MediaFault('invalid_input');return {mime:b.contentType as string,bytes:b.contentLength as number,sha256:b.sha256}}
const inputDTO=(i:InputRecord)=>({version:1,inputId:i.id,status:i.status,mimeType:i.verified_mime,bytes:i.verified_bytes,sha256:i.verified_sha256,expiresAt:i.expires_at});
export function createMediaInputs(store:MediaStore,objects:MediaObjectStorage,decode:MediaDecoder,now:()=>number=Date.now){
 const owned=async(user:string,id:string)=>{const i=await store.input(user,id);if(!i)throw new MediaFault('not_found',404);return i};
 const sign=async(i:InputRecord)=>{
  if(i.status!=='uploading'||new Date(i.expires_at).getTime()<=now())throw new MediaFault('input_not_uploadable',409);
  return {version:1,inputId:i.id,uploadUrl:await objects.signPut(i.staging_key,i.expected_mime,300),requiredHeaders:{'Content-Type':i.expected_mime},expiresAt:new Date(now()+300000).toISOString(),maxBytes:MEDIA_INPUT_MAX};
 };
 return {
 async create(user:string,value:unknown){const b=validateInputSpec(value),id=randomUUID();const [i]=await store.database.execute(sql`INSERT INTO media_inputs(id,user_id,staging_key,expected_mime,expected_bytes,expected_sha256,expires_at) VALUES(${id},${user},${`media/staging/${user}/${id}`},${b.mime},${b.bytes},${b.sha256},${new Date(now()+86400000).toISOString()}::timestamptz) RETURNING *`);return sign(i as InputRecord)},
 async sign(user:string,id:string){return sign(await owned(user,id))},
 async complete(user:string,id:string){
  const i=await owned(user,id);if(i.status==='ready')return inputDTO(i);
  if(i.status!=='uploading'||new Date(i.expires_at).getTime()<=now())throw new MediaFault('input_not_ready',409);
  let bytes:Buffer;try{bytes=await readBounded(await objects.read(i.staging_key),MEDIA_INPUT_MAX)}catch(e){if(e instanceof MediaFault){await store.database.execute(sql`UPDATE media_inputs SET status='rejected' WHERE id=${id} AND user_id=${user} AND status='uploading' RETURNING id`);throw e}throw new MediaFault('input_not_ready',409)}
  const hash=createHash('sha256').update(bytes).digest('hex');
  try{if(bytes.length!==i.expected_bytes||hash!==i.expected_sha256)throw new MediaFault('input_content_mismatch');await verifyDecoded(bytes,i.expected_mime,decode)}catch(e){
   await store.database.execute(sql`UPDATE media_inputs SET status='rejected' WHERE id=${id} AND user_id=${user} AND status='uploading' RETURNING id`);
   if(e instanceof MediaFault)throw e;throw new MediaFault('input_decode_failed');
  }
  const ext=i.expected_mime.split('/')[1],key=`media/inputs/${user}/${id}/${hash}/${randomUUID()}.${ext}`;
  await objects.putImmutable(key,bytes,i.expected_mime);
  await store.database.execute(sql`UPDATE media_inputs SET status='ready',sealed_key=${key},verified_mime=${i.expected_mime},verified_bytes=${bytes.length},verified_sha256=${hash},sealed_at=now() WHERE id=${id} AND user_id=${user} AND status='uploading' AND expires_at>now() RETURNING id`);
  const result=await owned(user,id);if(result.status!=='ready')throw new MediaFault('input_not_ready',409);return inputDTO(result);
 }
 };
}
export type MediaInputs=ReturnType<typeof createMediaInputs>;
