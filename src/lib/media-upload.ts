/** 浏览器只接收对象级上传授权，不接收Storage服务凭据。 */
export type MediaUploadAuthorization={backend:'r2'|'supabase';method:'PUT';uploadUrl:string;requiredHeaders:{'Content-Type':string};expiresAt:string;objectKey:string;bucket?:string};
export type MediaInputUploadDTO=MediaUploadAuthorization&{version:2;inputId:string;maxBytes:number};
const uuid='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
export function validMediaUpload(value:MediaInputUploadDTO,mime:string,bytes:number,hosts:readonly string[],now=Date.now()):boolean{
 try{
  const v=value,url=new URL(v.uploadUrl),expiry=Date.parse(v.expiresAt);
  if(v.version!==2||!['r2','supabase'].includes(v.backend)||v.method!=='PUT'||url.protocol!=='https:'||url.username||url.password||url.port||url.hash||!hosts.includes(url.hostname)||!new RegExp(`^${uuid}$`,'i').test(v.inputId)||v.maxBytes!==8388608||bytes>v.maxBytes||!Number.isFinite(expiry)||expiry<=now||expiry>now+(v.backend==='supabase'?7200000:300000)||!v.requiredHeaders||Object.keys(v.requiredHeaders).length!==1||v.requiredHeaders['Content-Type']!==mime||!new RegExp(`^media/staging/${uuid}/${v.inputId}$`,'i').test(v.objectKey))return false;
  if(v.backend==='supabase')return /^[a-z0-9]{20}\.supabase\.co$/.test(url.hostname)&&typeof v.bucket==='string'&&/^[a-z0-9][a-z0-9-]{1,62}$/.test(v.bucket)&&url.pathname===`/storage/v1/object/upload/sign/${v.bucket}/${v.objectKey}`&&[...url.searchParams.keys()].join(',')==='token'&&Boolean(url.searchParams.get('token'));
  return decodeURIComponent(url.pathname).endsWith('/'+v.objectKey)&&url.searchParams.get('X-Amz-Expires')!==null;
 }catch{return false}
}
