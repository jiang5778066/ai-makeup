// @vitest-environment node
import {afterEach,expect,it,vi} from 'vitest';
import {createHash} from 'node:crypto';
import {PgDialect} from 'drizzle-orm/pg-core';
import sharp from 'sharp';
import {S3Client,PutObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {validateRuntime,TARGET,runtimeRequired} from '../../scripts/release/preflight';
import {createMediaClient} from './media-client';
import {createMediaInputs} from './media-inputs';
import {createSupabaseMediaObjectStorage} from './media-storage-supabase';
import {createSharpMediaDecoder} from './media-decoder';
import {MediaFault,type InputRecord,type MediaExecutor} from './media-contracts';
import type {MediaStore} from './media-persistence';
const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',account='a'.repeat(32),ref=TARGET.supabaseRef;
const key=`media/staging/${owner}/${id}`,host=`makeup-originals.${account}.r2.cloudflarestorage.com`;
const mediaConfig={storageBackend:'r2',executionBackend:'inngest',executionApprovalRef:'offline',executionValidUntil:'2099-01-01T00:00:00Z',creationEnabled:true,schemaApproved:true,approvalRef:'offline',environmentRef:TARGET.project,storageApprovalRef:'offline',decoderApprovalRef:'offline',transportApprovalRef:'offline',providerKey:'synthetic',providerAccountRef:'key:6789/group:56',quoteKey:Buffer.alloc(32,1),inputHosts:[host],resultHosts:['results.provider.com'],consentVersion:'media-v1',modes:{image_to_image:{approvalRef:'offline',validUntil:'2099-01-01T00:00:00Z',economics:{tariffVersion:'offline',credits:2,providerUpperCents:5,dailyCapCents:10,budgetApprovalRef:'offline',providerAccountRef:'key:6789/group:56'}}}};
const env=()=>({...Object.fromEntries(runtimeRequired.map(k=>[k,'synthetic-fixture'])),RELEASE_PROFILE:'full',DATABASE_URL:`postgres://postgres:synthetic@db.${ref}.supabase.co:5432/postgres?sslmode=verify-full`,NEXT_PUBLIC_SUPABASE_URL:`https://${ref}.supabase.co`,NEXT_PUBLIC_SITE_URL:`https://${TARGET.domain}`,R2_ACCOUNT_ID:account,R2_BUCKET_ORIGINALS:'makeup-originals',R2_ACCESS_KEY_ID:'synthetic-access',R2_SECRET_ACCESS_KEY:'synthetic-private',MEDIA_CREATE_ENABLED:'1',MEDIA_RUNTIME_CONFIG:JSON.stringify(mediaConfig)});
afterEach(()=>vi.unstubAllEnvs());
it('R03-001 开启R2图生的原full配置缺准确公开host必须在构建前拒绝；旧关闭配置兼容',()=>{
 expect(()=>validateRuntime(env())).toThrow('R2上传host');
 expect(()=>validateRuntime({...env(),MEDIA_CREATE_ENABLED:'0'})).not.toThrow();
 for(const invalid of ['other.r2.cloudflarestorage.com',`${account}.r2.cloudflarestorage.com`,'https://'+host,host+'.attacker.invalid','*.'+host])expect(()=>validateRuntime({...env(),NEXT_PUBLIC_MEDIA_UPLOAD_HOST:invalid})).toThrow('R2上传host');
});
it('R03-001 准确R2 host通过full且默认客户端实际上传，不通过测试参数注入host',async()=>{
 const config={...env(),NEXT_PUBLIC_MEDIA_UPLOAD_HOST:host};expect(()=>validateRuntime(config)).not.toThrow();for(const [k,v]of Object.entries(config))vi.stubEnv(k,v);
 const {createMediaRuntime}=await import('./media-runtime');const r=createMediaRuntime({config:mediaConfig as Parameters<typeof createMediaRuntime>[0]['config'],store:{} as MediaStore,objects:{} as never,decoder:async()=>{throw Error('不应解码')},transport:{} as never,executionReady:true});expect(r.catalog.adapterModes).toContain('image_to_image');
 const sdk=new S3Client({region:'auto',endpoint:`https://${account}.r2.cloudflarestorage.com`,credentials:{accessKeyId:'synthetic-access',secretAccessKey:'synthetic-private'}});
 const uploadUrl=await getSignedUrl(sdk,new PutObjectCommand({Bucket:'makeup-originals',Key:key,ContentType:'image/png'}),{expiresIn:300});expect(new URL(uploadUrl).hostname).toBe(host);
 let puts=0;const f=vi.fn(async(raw:RequestInfo|URL,init?:RequestInit)=>{const path=String(raw);if(path==='/api/media/inputs/sign')return Response.json({version:2,backend:'r2',method:'PUT',uploadUrl,requiredHeaders:{'Content-Type':'image/png'},expiresAt:new Date(Date.now()+299000).toISOString(),objectKey:key,inputId:id,maxBytes:8388608});if(path.startsWith('https:')){expect(new URL(path).hostname).toBe(host);expect(init?.credentials).toBe('omit');puts++;return new Response(null,{status:200})}return Response.json({inputId:id,status:'ready'})});
 expect(await createMediaClient(f).upload(new File(['synthetic'],'a.png',{type:'image/png'}),new AbortController().signal)).toBe(id);expect(puts).toBe(1);sdk.destroy();
});
const storageConfig={url:`https://${ref}.supabase.co`,projectRef:ref,serviceKey:'synthetic-private',privateBucketsApproved:true,buckets:{staging:'media-staging',inputs:'media-inputs',results:'media-results'}};
async function inputFixture(readFault?:Error|number,override?:{bytes?:Buffer;expectedMime?:string;expectedSha?:string;decode?:ReturnType<typeof createSharpMediaDecoder>}){
 const png=await sharp({create:{width:8,height:12,channels:3,background:'white'}}).png().toBuffer(),bytes=override?.bytes??png;
 let record={id,user_id:owner,staging_key:key,status:'uploading',expected_mime:override?.expectedMime??'image/png',expected_bytes:bytes.length,expected_sha256:override?.expectedSha??createHash('sha256').update(bytes).digest('hex'),expires_at:new Date(Date.now()+86400000).toISOString()} as InputRecord;
 let gets=0,puts=0,readyUpdates=0,rejectedUpdates=0;
 const database:MediaExecutor={async execute(q){const sql=new PgDialect().sqlToQuery(q);if(sql.sql.includes("SET status='rejected'")){rejectedUpdates++;record={...record,status:'rejected'}}if(sql.sql.includes("SET status='ready'")){readyUpdates++;record={...record,status:'ready',sealed_key:String(sql.params[0]),verified_mime:String(sql.params[1]),verified_bytes:Number(sql.params[2]),verified_sha256:String(sql.params[3])}}return [record]}};
 const store={input:async(u:string,i:string)=>u===owner&&i===id?record:null,database} as unknown as MediaStore;
 const objects=createSupabaseMediaObjectStorage(storageConfig,{fetch:async(_raw,init)=>{if(init?.method==='POST'){puts++;return Response.json({Key:'fixture'})}gets++;if(gets===1&&readFault){if(typeof readFault==='number')return new Response(null,{status:readFault});throw readFault;}return new Response(new Uint8Array(bytes))}});
 return {inputs:createMediaInputs(store,objects,override?.decode??createSharpMediaDecoder()),state:()=>({record,gets,puts,readyUpdates,rejectedUpdates})};
}
it.each(['timeout','503'])('R03-002 Storage首次临时%s后保留原输入，第二次读并封存，重复complete不重复写',async(kind)=>{
 const t=await inputFixture(kind==='timeout'?Error('temporary timeout'):503);await expect(t.inputs.complete(owner,id)).rejects.toMatchObject({code:'media_storage_read_failed',status:503});expect(t.state()).toMatchObject({record:{status:'uploading'},gets:1,puts:0,readyUpdates:0,rejectedUpdates:0});
 const ready=await t.inputs.complete(owner,id);expect(ready).toMatchObject({inputId:id,status:'ready'});expect(t.state()).toMatchObject({gets:2,puts:1,readyUpdates:1,rejectedUpdates:0});expect(await t.inputs.complete(owner,id)).toEqual(ready);expect(t.state()).toMatchObject({gets:2,puts:1,readyUpdates:1});
});
it.each(['media_decoder_busy','media_decode_timeout','unknown'])('R03-002 解码暂时性或未知%s不拒绝原输入',async(code)=>{
 const t=await inputFixture(undefined,{decode:async()=>{if(code==='unknown')throw Error('temporary unavailable');throw new MediaFault(code,code==='media_decoder_busy'?503:422)}});
 await expect(t.inputs.complete(owner,id)).rejects.toThrow();expect(t.state()).toMatchObject({record:{status:'uploading'},puts:0,readyUpdates:0,rejectedUpdates:0});
});
it.each(['hash','mime','size'])('R03-002 永久内容%s仍拒绝且不封存',async(kind)=>{
 const t=await inputFixture(undefined,kind==='hash'?{expectedSha:'0'.repeat(64)}:kind==='mime'?{bytes:Buffer.from('not png')}:{bytes:Buffer.alloc(8388609)});await expect(t.inputs.complete(owner,id)).rejects.toThrow();expect(t.state()).toMatchObject({record:{status:'rejected'},puts:0,readyUpdates:0,rejectedUpdates:1});
});
it('R03-003 非规范大小写key所有操作在fetch前拒绝，正常小写仍使用声明bucket',async()=>{
 const fetcher=vi.fn(async(_raw:RequestInfo|URL)=>Response.json({Key:'fixture'})),s=createSupabaseMediaObjectStorage(storageConfig,{fetch:fetcher});
 const canonical=`media/results/${owner}/${id}/${'a'.repeat(64)}.png`;
 for(const invalid of [canonical.replace('/results/','/RESULTS/'),canonical.replace('media/','MEDIA/'),canonical.replace('.png','.PNG')]){await expect(s.putImmutable(invalid,Buffer.from([1]),'image/png')).rejects.toThrow('invalid_media_key');await expect(s.read(invalid)).rejects.toThrow('invalid_media_key');await expect(s.signGet(invalid,300)).rejects.toThrow('invalid_media_key')}
 await expect(s.signUpload!(key.replace('/staging/','/STAGING/'),'image/png',owner)).rejects.toThrow('invalid_media_key');expect(fetcher).not.toHaveBeenCalled();await s.putImmutable(canonical,Buffer.from([1]),'image/png');expect(new URL(String(fetcher.mock.calls[0][0])).pathname).toBe(`/storage/v1/object/media-results/${canonical}`);
});
it('R03-003 未映射或非字符串bucket配置在任何fetch前拒绝',()=>{
 const fetcher=vi.fn();expect(()=>createSupabaseMediaObjectStorage({...storageConfig,buckets:{...storageConfig.buckets,results:undefined} as never},{fetch:fetcher})).toThrow('media_storage_unconfigured');expect(fetcher).not.toHaveBeenCalled();
});
