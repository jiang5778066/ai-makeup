import {MediaFault,type TaskRecord} from './media-contracts';
import type {StoredResult} from './media-persistence';
export interface MediaObjectStorage {
 read(key:string):Promise<AsyncIterable<Uint8Array>>;
 putImmutable(key:string,bytes:Buffer,mime:string):Promise<void>;
 signPut(key:string,mime:string,expiresSeconds:number):Promise<string>;
 signGet(key:string,expiresSeconds:number):Promise<string>;
}
export interface MediaResultStorage {
 store(task:TaskRecord):Promise<StoredResult>;
 sign(key:string,mime:string):Promise<{url:string;mimeType:string;expiresAt:string}>;
 signInput(key:string):Promise<string>;
}
export const unavailableMediaStorage:MediaResultStorage={
 async store(){throw new MediaFault('media_storage_unconfigured',503)},
 async sign(){throw new MediaFault('media_storage_unconfigured',503)},
 async signInput(){throw new MediaFault('media_storage_unconfigured',503)}
};

import {createHash} from 'node:crypto';
import {verifyDecoded,type MediaDecoder} from './media-security';
export function createMediaResultStorage(objects:MediaObjectStorage,download:(url:string,max:number)=>Promise<{bytes:Buffer;mime:string}>,decode:MediaDecoder):MediaResultStorage{
 return {
 async store(task){
  if(!task.result_locator)throw new MediaFault('media_result_missing',409);
  const result=await download(task.result_locator,task.media_type==='image'?16*1024*1024:64*1024*1024);
  if(result.bytes.length>(task.media_type==='image'?16*1024*1024:64*1024*1024)||!(task.media_type==='image'?['image/png','image/jpeg','image/webp']:['video/mp4']).includes(result.mime))throw new MediaFault('media_result_mime');
  const verified=await verifyDecoded(result.bytes,result.mime,decode);
  if(task.media_type==='video'&&(verified.container!=='mp4'||verified.codec!=='h264'||verified.streams!==1||!Number.isFinite(verified.durationMs)||verified.durationMs!<4750||verified.durationMs!>5250||Math.min(verified.width,verified.height)!==480||Math.max(verified.width,verified.height)>864||verified.frames>315))throw new MediaFault('media_decode_rejected');
  const sha256=createHash('sha256').update(result.bytes).digest('hex'),key=`media/results/${task.user_id}/${task.id}/${sha256}.${result.mime.split('/')[1]}`;
  await objects.putImmutable(key,result.bytes,result.mime);return {key,mime:result.mime,bytes:result.bytes.length,sha256};
 },
 async sign(key,mime){return {url:await objects.signGet(key,900),mimeType:mime,expiresAt:new Date(Date.now()+900000).toISOString()}},
 async signInput(key){return objects.signGet(key,300)}
 };
}

import {isStorageConfigured,privateObjectStream,putPrivateObjectOnce,presignGetUrl,presignPutUrl,R2_BUCKET_ORIGINALS,R2_BUCKET_RESULTS} from './storage';
export function createR2MediaObjectStorage():MediaObjectStorage{
 const bucket=(key:string)=>{
  if(!isStorageConfigured())throw new MediaFault('media_storage_unconfigured',503);
  if(!/^media\/(staging|inputs|results)\/[\w/-]+(?:\.[a-z]+)?$/.test(key)||key.includes('..'))throw new MediaFault('invalid_media_key');
  return key.startsWith('media/results/')?R2_BUCKET_RESULTS:R2_BUCKET_ORIGINALS;
 };
 return {
 async read(key){return privateObjectStream(bucket(key),key)},
 async putImmutable(key,bytes,mime){if(!key.startsWith('media/inputs/')&&!key.startsWith('media/results/'))throw new MediaFault('media_sealed_key_required');return putPrivateObjectOnce(bucket(key),key,bytes,mime)},
 async signPut(key,mime,expires){if(!key.startsWith('media/staging/'))throw new MediaFault('media_staging_required');return presignPutUrl({bucket:bucket(key),key,contentType:mime,expiresIn:Math.min(300,expires)})},
 async signGet(key,expires){if(key.startsWith('media/staging/'))throw new MediaFault('media_sealed_key_required');return presignGetUrl({bucket:bucket(key),key,expiresIn:Math.min(900,expires)})}
 };
}
