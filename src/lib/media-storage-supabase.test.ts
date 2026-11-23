// @vitest-environment node
import {expect,it,vi} from 'vitest';
import {createClient} from '@supabase/supabase-js';
import {createSupabaseMediaObjectStorage} from './media-storage-supabase';
import {readBounded} from './media-security';
const ref='svlhstoiirtsutmmanrn',origin=`https://${ref}.supabase.co`,owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const staging=`media/staging/${owner}/${id}`,sealed=`media/inputs/${owner}/${id}/${'a'.repeat(64)}/${id}.png`,result=`media/results/${owner}/${id}/${'a'.repeat(64)}.png`;
const config={url:origin,projectRef:ref,serviceKey:'synthetic-service-private',privateBucketsApproved:true,buckets:{staging:'media-staging',inputs:'media-inputs',results:'media-results'}};
const uploadToken=`eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({iat:1,exp:7201})).toString('base64url')}.offline-signature`;
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
function fixture(){
 const data=new Map<string,Buffer>(),calls:{url:URL;init:RequestInit}[]=[];
 const f=vi.fn(async(raw:RequestInfo|URL,init:RequestInit={})=>{
  const url=new URL(String(raw));calls.push({url,init});const key=url.pathname.replace('/storage/v1/object/','');
  if(url.pathname.includes('/upload/sign/'))return json({url:url.pathname.replace('/storage/v1','')+'?token='+uploadToken});
  if(url.pathname.includes('/object/sign/'))return json({signedURL:url.pathname.replace('/storage/v1/object/sign/','/object/sign/')+'?token=synthetic-read'});
  if(init.method==='POST'){if(data.has(key))return json({message:'The resource already exists',error:'Duplicate',statusCode:'409'},400);data.set(key,Buffer.from(init.body as Uint8Array));return json({Key:key})}
  const bytes=data.get(key);return bytes?new Response(new Uint8Array(bytes)):json({error:'not_found'},404);
 });
 return {f,data,calls,objects:()=>createSupabaseMediaObjectStorage(config,{fetch:f,now:()=>1000})};
}
it('SDK原生不可变POST，无覆盖；同键同字节允许，不同字节拒绝',async()=>{
 const t=fixture(),s=t.objects();await s.putImmutable(sealed,Buffer.from('a'),'image/png');await s.putImmutable(sealed,Buffer.from('a'),'image/png');await expect(s.putImmutable(sealed,Buffer.from('b'),'image/png')).rejects.toThrow('media_immutable_conflict');
 expect(t.calls.filter(c=>c.init.method==='POST').every(c=>new Headers(c.init.headers).get('x-upsert')==='false')).toBe(true);
 expect(await readBounded(await s.read(sealed),10)).toEqual(Buffer.from('a'));
});
it.each(['timeout','unknown400'])('未知%s绝不当对象冲突，不读回、不覆盖且脱敏',async(kind)=>{
 const f=vi.fn(async()=>{if(kind==='timeout')throw Error('synthetic-service-private');return json({message:'synthetic-service-private',error:'unknown'},400)});
 const s=createSupabaseMediaObjectStorage(config,{fetch:f});await expect(s.putImmutable(result,Buffer.from('a'),'image/png')).rejects.toThrow('media_storage_write_failed');expect(f).toHaveBeenCalledTimes(1);
});
it('原生签名固定两小时，DTO不含服务凭据，仅允许本人唯一staging',async()=>{
 const t=fixture(),s=t.objects(),signed=await s.signUpload!(staging,'image/png',owner);
 expect(signed).toMatchObject({backend:'supabase',method:'PUT',requiredHeaders:{'Content-Type':'image/png'},expiresAt:new Date(7201000).toISOString()});expect(JSON.stringify(signed)).not.toContain(config.serviceKey);
 expect(t.calls[0].init.method).toBe('POST');expect(new Headers(t.calls[0].init.headers).get('x-upsert')).not.toBe('true');
 for(const [key,user] of [[staging,''],[staging,id],[sealed,owner],[result,owner],[`media/staging/${owner}/../${id}`,owner]])await expect(s.signUpload!(key,'image/png',user)).rejects.toThrow();
 await expect(s.signPut(staging,'image/png',300)).rejects.toThrow('media_typed_upload_required');await expect(s.signGet(staging,300)).rejects.toThrow();
});
it('SDK上传夹具证实浏览器可用raw PUT、Content-Type及token，无upsert',async()=>{
 let call:RequestInit|undefined;const f=vi.fn(async(_url:RequestInfo|URL,init?:RequestInit)=>{call=init;return json({Key:'fixture'})});
 const sdk=createClient(origin,'synthetic-anon',{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:f}});
 const r=await sdk.storage.from('media-staging').uploadToSignedUrl(staging,'synthetic-upload',new Uint8Array([1,2]).buffer,{contentType:'image/png'});
 expect(r.error).toBeNull();expect(call?.method).toBe('PUT');expect(new Headers(call?.headers).get('content-type')).toBe('image/png');expect(new Headers(call?.headers).get('x-upsert')).not.toBe('true');expect(call?.body).toBeInstanceOf(ArrayBuffer);
});
it('错项目/公开未批bucket/重复bucket及非法key均拒绝；签名目标严格核对',async()=>{
 const t=fixture();for(const patch of [{url:'https://wrong.supabase.co'},{privateBucketsApproved:false},{buckets:{...config.buckets,results:config.buckets.staging}}])expect(()=>createSupabaseMediaObjectStorage({...config,...patch},{fetch:t.f})).toThrow();
 const s=t.objects();await expect(s.putImmutable(staging,Buffer.from('a'),'image/png')).rejects.toThrow();await expect(s.signGet('other-bucket/key',300)).rejects.toThrow();
 const evil=createSupabaseMediaObjectStorage(config,{fetch:async()=>json({url:'https://attacker.invalid/?token=private'})});await expect(evil.signUpload!(staging,'image/png',owner)).rejects.toThrow('media_storage_sign_failed');
});
it('并发同键首写后只比较字节，sealed和results保持分离且读签名最多900秒',async()=>{
 const t=fixture(),s=t.objects();const writes=await Promise.allSettled([s.putImmutable(result,Buffer.from('a'),'image/png'),s.putImmutable(result,Buffer.from('b'),'image/png')]);expect(writes.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(writes.filter(r=>r.status==='rejected')).toHaveLength(1);
 const url=await s.signGet(result,3600);expect(new URL(url).pathname).toBe(`/storage/v1/object/sign/media-results/${result}`);const call=t.calls.at(-1)!;expect(JSON.parse(String(call.init.body))).toEqual({expiresIn:900});expect(new Headers(call.init.headers).get('Authorization')).toBe('Bearer '+config.serviceKey);
});
it('响应字节有界并取消流；读失败不暴露原始异常或秘密',async()=>{
 const cancel=vi.fn();const f=vi.fn(async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(8388609))},cancel})));
 const s=createSupabaseMediaObjectStorage(config,{fetch:f});await expect(readBounded(await s.read(staging),8388608)).rejects.toThrow('media_too_large');expect(cancel).toHaveBeenCalledTimes(1);
 const bad=createSupabaseMediaObjectStorage(config,{fetch:async()=>{throw Error(config.serviceKey)}});await expect(bad.read(sealed)).rejects.toThrow('media_storage_read_failed');
});
it('有界读取使用与实际SDK download完全一致的原生路径',async()=>{
 const paths:string[]=[];const f=vi.fn(async(raw:RequestInfo|URL)=>{paths.push(new URL(String(raw)).pathname);return new Response(new Uint8Array([1]))});
 const sdk=createClient(origin,config.serviceKey,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:f}});
 await sdk.storage.from(config.buckets.inputs).download(sealed);
 const s=createSupabaseMediaObjectStorage(config,{fetch:f});await readBounded(await s.read(sealed),10);expect(paths).toHaveLength(2);expect(paths[1]).toBe(paths[0]);
});
it('仅明确官方Asset Already Exists冲突可重读，未知400不进入比较',async()=>{
 const calls:string[]=[];const f=vi.fn(async(_url:RequestInfo|URL,init?:RequestInit)=>{calls.push(init?.method??'GET');return init?.method==='POST'?json({statusCode:'400',message:'Asset Already Exists'},400):new Response(new Uint8Array([1]))});
 const s=createSupabaseMediaObjectStorage(config,{fetch:f});await expect(s.putImmutable(result,Buffer.from([1]),'image/png')).resolves.toBeUndefined();expect(calls).toEqual(['POST','GET']);
});
