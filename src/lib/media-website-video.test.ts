// @vitest-environment node
import {it,expect,vi,describe} from 'vitest';
import {readFileSync} from 'node:fs';
import {createVideoMediaDecoder} from './media-video-decoder';
import {integrationVideoConfig,unitVideoConfig} from './test-fixtures/media-video';
import {createMediaResultStorage} from './media-storage';
import {createSupabaseMediaObjectStorage} from './media-storage-supabase';
const max=45*1024*1024;
it('结果下载明确传45MiB且超一字节不写对象',async()=>{
 const write=vi.fn();let requested=0;const download=async(_url:string,limit:number)=>{requested=limit;return {bytes:Buffer.alloc(max+1),mime:'video/mp4'}};
 const storage=createMediaResultStorage({putImmutable:write} as never,download,async()=>{throw Error('不应解码超限结果')});
 await expect(storage.store({media_type:'video',result_locator:'https://public.invalid/a'} as never)).rejects.toThrow();expect(requested).toBe(max);expect(write.mock.calls.length).toBe(0);
});
it('Supabase对象创建超45MiB在SDK外呼前拒绝',async()=>{
 let calls=0;const fetcher=async()=>{calls++;return new Response('{}',{status:500})};const objects=createSupabaseMediaObjectStorage({url:'https://abcdefghijklmnopqrst.supabase.co',projectRef:'abcdefghijklmnopqrst',serviceKey:'offline',privateBucketsApproved:true,buckets:{staging:'media-staging',inputs:'media-inputs',results:'media-results'}},{fetch:fetcher});
 await expect(objects.putImmutable(`media/results/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/${'a'.repeat(64)}.mp4`,Buffer.alloc(max+1),'video/mp4')).rejects.toThrow();expect(calls).toBe(0);
});
it('45MiB整边界可到对象写入，超限一字节拒绝',async()=>{
 let calls=0;const fetcher=async()=>{calls++;return new Response('{}',{status:200})};const objects=createSupabaseMediaObjectStorage({url:'https://abcdefghijklmnopqrst.supabase.co',projectRef:'abcdefghijklmnopqrst',serviceKey:'offline',privateBucketsApproved:true,resultMaxBytes:max,buckets:{staging:'media-staging',inputs:'media-inputs',results:'media-results'}},{fetch:fetcher});
 const key=`media/results/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/${'a'.repeat(64)}.mp4`;
 await objects.putImmutable(key,Buffer.alloc(max),'video/mp4');expect(calls).toBe(1);await expect(objects.putImmutable(key,Buffer.alloc(max+1),'video/mp4')).rejects.toThrow();expect(calls).toBe(1);
});
it('旧5秒成片明确留待核对，不下载写入或篡改请求参数',async()=>{
 const download=vi.fn(),write=vi.fn(),task={media_type:'video',request:{parameters:{durationSeconds:5}},result_locator:'https://public.invalid/legacy'};
 const storage=createMediaResultStorage({putImmutable:write} as never,download,async()=>{throw Error()});await expect(storage.store(task as never)).rejects.toThrow('media_legacy_video_requires_review');expect(download).not.toHaveBeenCalled();expect(write).not.toHaveBeenCalled();expect(task.request.parameters.durationSeconds).toBe(5);
});
describe.runIf(Boolean(integrationVideoConfig&&process.env.TEST_PROVIDER_VIDEO_PATH))('已生成样本仅本地安全解码',()=>{
 const bytes=()=>readFileSync(process.env.TEST_PROVIDER_VIDEO_PATH!);
 it('接收真实1秒H264+AAC+attached_pic，全部轨道解码且child全部close',async()=>{
  const events:{event:string}[]=[];const result=await createVideoMediaDecoder(integrationVideoConfig??unitVideoConfig,{onLifecycle:e=>events.push(e)})(bytes(),'video/mp4');
  expect(result).toMatchObject({width:848,height:480,frames:25,durationMs:1042,streams:3});expect(events.filter(e=>e.event==='close')).toHaveLength(events.filter(e=>e.event==='spawn').length);
 });
 it('真实样本沿结果存储合同校验后按hash不可变保存及重签名',async()=>{
  const original=bytes(),writes:{key:string;bytes:Buffer;mime:string}[]=[];let limit=0;
  const storage=createMediaResultStorage({putImmutable:async(key:string,bytes:Buffer,mime:string)=>{writes.push({key,bytes,mime})},signGet:async()=> 'https://private.invalid/signed'} as never,async(_url,max)=>{limit=max;return {bytes:original,mime:'video/mp4'}},createVideoMediaDecoder(integrationVideoConfig??unitVideoConfig));
  const stored=await storage.store({id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',user_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',media_type:'video',request:{parameters:{durationSeconds:1}},result_locator:'https://provider.invalid/result'} as never);
  expect(limit).toBe(max);expect(writes.length).toBe(1);expect(writes[0].bytes.equals(original)).toBe(true);expect(stored.key).toContain(stored.sha256);expect((await storage.sign(stored.key,stored.mime)).mimeType).toBe('video/mp4');
 });
 it('真实容器的外部dref与非白名单音轨在spawn前拒绝',async()=>{
  for(const mutate of [(b:Buffer)=>{const at=b.indexOf(Buffer.from('dref'));b.writeUInt32BE(0,at+20)},(b:Buffer)=>{const at=b.indexOf(Buffer.from('uuid'));b[at+4]^=1},(b:Buffer)=>{const at=b.indexOf(Buffer.from('mp4a'));expect(at).toBeGreaterThan(0);b.write('alac',at,'ascii')}]){
   const b=Buffer.from(bytes());mutate(b);const events:unknown[]=[];await expect(createVideoMediaDecoder(integrationVideoConfig??unitVideoConfig,{onLifecycle:e=>events.push(e)})(b,'video/mp4')).rejects.toThrow('media_decode_rejected');expect(events).toHaveLength(0);
  }
 });
});
