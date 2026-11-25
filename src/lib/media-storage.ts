import {MEDIA_VIDEO_MAX_BYTES,MEDIA_VIDEO_MIN_MS,MEDIA_VIDEO_MAX_MS,MEDIA_VIDEO_MAX_FRAMES} from './media-video-contract';
import type {MediaUploadAuthorization} from './media-upload';
import {MediaFault,type TaskRecord} from './media-contracts';
import type {StoredResult} from './media-persistence';
export interface MediaObjectStorage {
 signUpload?(key:string,mime:string,owner:string):Promise<MediaUploadAuthorization>;
 read(key:string):Promise<AsyncIterable<Uint8Array>>;
 putImmutable(key:string,bytes:Buffer,mime:string):Promise<void>;
 signPut(key:string,mime:string,expiresSeconds:number):Promise<string>;
 signGet(key:string,expiresSeconds:number):Promise<string>;
}
export type DeletableMediaObjectStorage = MediaObjectStorage & { remove(key: string): Promise<void> };

const mediaKeyUuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const mediaKeyHead = new RegExp(`^media/(staging|inputs|results)/(${mediaKeyUuid})/(${mediaKeyUuid})(.*)$`);
const mediaInputTail = new RegExp(`^/[a-f0-9]{64}/${mediaKeyUuid}\\.(png|jpeg|webp)$`);
type MediaKeyKind = 'staging' | 'inputs' | 'results';

export function parseMediaObjectKey(key: string): { kind: MediaKeyKind; owner: string; recordId: string } {
 const match = mediaKeyHead.exec(key);
 if (!match || match[0] !== key) throw new MediaFault('invalid_media_key');
 const [, kind, owner, recordId, tail] = match;
 if ((kind === 'staging' && tail === '') || (kind === 'inputs' && mediaInputTail.test(tail)) ||
     (kind === 'results' && /^\/[a-f0-9]{64}\.(png|jpeg|webp|mp4)$/.test(tail))) return { kind, owner, recordId };
 throw new MediaFault('invalid_media_key');
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
  if(task.media_type==='video'&&task.request?.parameters.durationSeconds===5)throw new MediaFault('media_legacy_video_requires_review',409);
  if(!task.result_locator)throw new MediaFault('media_result_missing',409);
  const result=await download(task.result_locator,task.media_type==='image'?16*1024*1024:MEDIA_VIDEO_MAX_BYTES);
  if(result.bytes.length>(task.media_type==='image'?16*1024*1024:MEDIA_VIDEO_MAX_BYTES)||!(task.media_type==='image'?['image/png','image/jpeg','image/webp']:['video/mp4']).includes(result.mime))throw new MediaFault('media_result_mime');
  const verified=await verifyDecoded(result.bytes,result.mime,decode);
  if(task.media_type==='video'&&(verified.container!=='mp4'||verified.codec!=='h264'||(!Number.isSafeInteger(verified.streams)||verified.streams!<1||verified.streams!>3)||!Number.isFinite(verified.durationMs)||verified.durationMs!<MEDIA_VIDEO_MIN_MS||verified.durationMs!>MEDIA_VIDEO_MAX_MS||Math.min(verified.width,verified.height)!==480||Math.max(verified.width,verified.height)>864||verified.frames>MEDIA_VIDEO_MAX_FRAMES))throw new MediaFault('media_decode_rejected');
  const sha256=createHash('sha256').update(result.bytes).digest('hex'),key=`media/results/${task.user_id}/${task.id}/${sha256}.${result.mime.split('/')[1]}`;
  await objects.putImmutable(key,result.bytes,result.mime);return {key,mime:result.mime,bytes:result.bytes.length,sha256};
 },
 async sign(key,mime){return {url:await objects.signGet(key,900),mimeType:mime,expiresAt:new Date(Date.now()+900000).toISOString()}},
 async signInput(key){return objects.signGet(key,300)}
 };
}

import {deleteObject,isStorageConfigured,privateObjectStream,putPrivateObjectOnce,presignGetUrl,presignPutUrl,R2_BUCKET_ORIGINALS,R2_BUCKET_RESULTS} from './storage';
export function createR2MediaObjectStorage():DeletableMediaObjectStorage{
 const bucket=(key:string)=>{
  if(!isStorageConfigured())throw new MediaFault('media_storage_unconfigured',503);
  if(!/^media\/(staging|inputs|results)\/[\w/-]+(?:\.[a-z]+)?$/.test(key)||key.includes('..'))throw new MediaFault('invalid_media_key');
  return key.startsWith('media/results/')?R2_BUCKET_RESULTS:R2_BUCKET_ORIGINALS;
 };
 return {
 async remove(key){
  if(!isStorageConfigured())throw new MediaFault('media_storage_unconfigured',503);
  const {kind}=parseMediaObjectKey(key);
  await deleteObject(kind==='results'?R2_BUCKET_RESULTS:R2_BUCKET_ORIGINALS,key);
 },
 async read(key){return privateObjectStream(bucket(key),key)},
 async putImmutable(key,bytes,mime){if(!key.startsWith('media/inputs/')&&!key.startsWith('media/results/'))throw new MediaFault('media_sealed_key_required');return putPrivateObjectOnce(bucket(key),key,bytes,mime)},
 async signPut(key,mime,expires){if(!key.startsWith('media/staging/'))throw new MediaFault('media_staging_required');return presignPutUrl({bucket:bucket(key),key,contentType:mime,expiresIn:Math.min(300,expires)})},
 async signGet(key,expires){if(key.startsWith('media/staging/'))throw new MediaFault('media_sealed_key_required');return presignGetUrl({bucket:bucket(key),key,expiresIn:Math.min(900,expires)})}
 };
}
