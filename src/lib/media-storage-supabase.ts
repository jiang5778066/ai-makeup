import {MEDIA_VIDEO_MAX_BYTES} from './media-video-contract';
import {createClient} from '@supabase/supabase-js';
import {MediaFault,mediaUuid} from './media-contracts';
import {readBounded} from './media-security';
import {parseMediaObjectKey,type DeletableMediaObjectStorage} from './media-storage';
import type {MediaUploadAuthorization} from './media-upload';
export type SupabaseMediaStorageConfig={url:string;projectRef:string;serviceKey:string;privateBucketsApproved:boolean;resultMaxBytes?:number;buckets:{staging:string;inputs:string;results:string}};
type Dependencies={fetch?:typeof fetch;now?:()=>number};
const imageMime=['image/png','image/jpeg','image/webp'];
/** 仅服务端装配；私有bucket状态由独立服务验收批准，本模块不创建或更改bucket。 */
export function createSupabaseMediaObjectStorage(config:SupabaseMediaStorageConfig,deps:Dependencies={}):DeletableMediaObjectStorage{
 const fail=(code:string):never=>{throw new MediaFault(code,503)};
 const buckets=Object.freeze({...config.buckets}),resultMax=config.resultMaxBytes??MEDIA_VIDEO_MAX_BYTES;
 if(!Number.isSafeInteger(resultMax)||resultMax<1||resultMax>MEDIA_VIDEO_MAX_BYTES)fail('media_storage_unconfigured');
 if(typeof window!=='undefined'||!config.serviceKey||!config.privateBucketsApproved||!/^[a-z0-9]{20}$/.test(config.projectRef)||config.url!==`https://${config.projectRef}.supabase.co`||Object.keys(buckets).length!==3||['staging','inputs','results'].some(kind=>!Object.hasOwn(buckets,kind))||Object.values(buckets).some(b=>typeof b!=='string'||!/^[a-z0-9][a-z0-9-]{1,62}$/.test(b))||new Set(Object.values(buckets)).size!==3)fail('media_storage_unconfigured');
 const nativeFetch=deps.fetch??fetch,now=deps.now??Date.now;
 // 限定同项目API、拒绝重定向，并覆盖SDK异常中可能携带的秘密。
 const safeFetch:typeof fetch=async(raw,init)=>{
  const u=new URL(String(raw));if(u.origin!==config.url||!u.pathname.startsWith('/storage/v1/'))return fail('media_storage_target_rejected');
  return nativeFetch(u.href,{...init,credentials:'omit',redirect:'error',signal:AbortSignal.timeout(30000)});
 };
 const sdk=createClient(config.url,config.serviceKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:safeFetch}});
 const classify=(key:string)=>{
  const {kind,owner}=parseMediaObjectKey(key);
  const bucket=buckets[kind];
  if(typeof bucket!=='string'||!/^[a-z0-9][a-z0-9-]{1,62}$/.test(bucket))throw new MediaFault('invalid_media_key');
  return {kind,bucket,owner};
 };
 const target=(raw:string,path:string)=>{const u=new URL(raw);if(u.origin!==config.url||u.pathname!==path||u.username||u.password||u.hash||[...u.searchParams.keys()].join(',')!=='token'||!u.searchParams.get('token'))fail('media_storage_sign_failed');return u.href};
 const read=async(key:string):Promise<AsyncIterable<Uint8Array>>=>{
  const {bucket,kind}=classify(key),max=kind==='staging'?8388608:kind==='inputs'?8388608:resultMax;
  try{
   const r=await safeFetch(`${config.url}/storage/v1/object/${bucket}/${key}`,{headers:{Authorization:`Bearer ${config.serviceKey}`,apikey:config.serviceKey}});
   if(!r.ok||!r.body){await r.body?.cancel();return fail('media_storage_read_failed')}
   if(Number(r.headers.get('content-length'))>max){await r.body.cancel();throw new MediaFault('media_too_large')}
   const stream=r.body;
   return (async function*(){const reader=stream.getReader();let size=0;try{while(true){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>max)throw new MediaFault('media_too_large');yield next.value}}catch(e){if(e instanceof MediaFault)throw e;fail('media_storage_read_failed')}finally{await reader.cancel().catch(()=>{});reader.releaseLock()}})();
  }catch(e){if(e instanceof MediaFault&&e.code==='media_too_large')throw e;return fail('media_storage_read_failed')}
 };
 const signUpload=async(key:string,mime:string,owner:string):Promise<MediaUploadAuthorization>=>{
  const t=classify(key);if(t.kind!=='staging'||!mediaUuid.test(owner)||owner!==t.owner||!imageMime.includes(mime))throw new MediaFault('media_staging_required');
  const started=now();try{const {data,error}=await sdk.storage.from(t.bucket).createSignedUploadUrl(key,{upsert:false});if(error||!data)return fail('media_storage_sign_failed');const uploadUrl=target(data.signedUrl,`/storage/v1/object/upload/sign/${t.bucket}/${key}`);
   // 只从同项目认证API返回的token读取期限；不在客户端解码或记录token。
   const segments=data.token.split('.');if(segments.length!==3)return fail('media_storage_sign_failed');
   const claims=JSON.parse(Buffer.from(segments[1],'base64url').toString('utf8')) as {exp:number;iat:number};
   if(!Number.isSafeInteger(claims.exp)||!Number.isSafeInteger(claims.iat)||claims.exp-claims.iat!==7200||claims.exp*1000<=started||claims.exp*1000>started+7230000)return fail('media_storage_sign_failed');
   return {backend:'supabase',method:'PUT',uploadUrl,requiredHeaders:{'Content-Type':mime},expiresAt:new Date(claims.exp*1000).toISOString(),objectKey:key,bucket:t.bucket}}catch{return fail('media_storage_sign_failed')}
 };
 return {
  read,signUpload,
  async remove(key){
   const {bucket}=classify(key);
   try{
    // 原生批量删除成功时只返回实际移除的对象。空数组表示请求中的对象已不存在。
    const {data,error}=await sdk.storage.from(bucket).remove([key]);
    if(error||!Array.isArray(data))return fail('media_storage_delete_failed');
   }catch{return fail('media_storage_delete_failed')}
  },
  async putImmutable(key,bytes,mime){
   const t=classify(key);if(t.kind==='staging'||!(t.kind==='inputs'?imageMime:[...imageMime,'video/mp4']).includes(mime)||bytes.length>(t.kind==='inputs'?8388608:resultMax))throw new MediaFault('media_sealed_key_required');
   try{
    const {error}=await sdk.storage.from(t.bucket).upload(key,bytes,{upsert:false,contentType:mime});if(!error)return;
    // 不把未知400、认证失败或超时当冲突，也不退回覆盖写入。
    const duplicate=error.name==='StorageApiError'&&(error.status===400||error.status===409)&&(error.statusCode==='Duplicate'||error.statusCode==='ResourceAlreadyExists'||(['400','409'].includes(error.statusCode??'')&&['The resource already exists','Asset Already Exists'].includes(error.message)));
    if(!duplicate)return fail('media_storage_write_failed');
    const old=await readBounded(await read(key),bytes.length);if(!old.equals(bytes))throw new MediaFault('media_immutable_conflict');
   }catch(e){if(e instanceof MediaFault&&e.code==='media_immutable_conflict')throw e;return fail('media_storage_write_failed')}
  },
  async signPut(){throw new MediaFault('media_typed_upload_required')},
  async signGet(key,expires){const t=classify(key);if(t.kind==='staging')throw new MediaFault('media_sealed_key_required');if(!Number.isInteger(expires)||expires<1)throw new MediaFault('invalid_media_expiry');try{const {data,error}=await sdk.storage.from(t.bucket).createSignedUrl(key,Math.min(900,expires));if(error||!data)return fail('media_storage_sign_failed');return target(data.signedUrl,`/storage/v1/object/sign/${t.bucket}/${key}`)}catch{return fail('media_storage_sign_failed')}}
 };
}
