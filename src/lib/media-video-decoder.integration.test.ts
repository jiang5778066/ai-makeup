// @vitest-environment node
import {it,expect,afterAll,describe} from 'vitest';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {integrationVideoConfig,unitVideoConfig} from './test-fixtures/media-video';
import {createVideoMediaDecoder as createDecoder,type VideoDecoderConfig,type VideoChildEvent} from './media-video-decoder';
describe.runIf(Boolean(integrationVideoConfig))('显式批准二进制的真实decoder集成',()=>{
const report=mkdtempSync(join(tmpdir(),'media-video-integration-'));
const config:VideoDecoderConfig=integrationVideoConfig??unitVideoConfig;
mkdirSync(report+'/fixtures',{recursive:true});
const allChildEvents:VideoChildEvent[]=[];
const fixtureExits:unknown[]=[];
function createVideoMediaDecoder(...[c,options]:Parameters<typeof createDecoder>){return createDecoder(c,{...options,onLifecycle:event=>{allChildEvents.push(event);options?.onLifecycle?.(event)}})}
afterAll(()=>{
 writeFileSync(report+'/unit-child-lifecycle.json',JSON.stringify(allChildEvents,null,2));
 writeFileSync(report+'/unit-fixture-exits.json',JSON.stringify(fixtureExits,null,2));
 rmSync(report,{recursive:true,force:true});
});
function fixture(name:string,extra:string[]=[],duration='5',size='480x640',pix='yuv420p'){
 const path=report+'/fixtures/'+name+'.mp4';
 const r=spawnSync(config.ffmpeg.path,['-v','error','-nostdin','-f','lavfi','-i',`color=c=blue:s=${size}:r=25,format=${pix}`,...extra,'-t',duration,'-c:v','libx264','-threads','1','-pix_fmt',pix,'-movflags','+faststart','-y',path],{env:{NODE_ENV:'test',PATH:'/usr/bin:/bin'},timeout:15000,maxBuffer:65536});
 fixtureExits.push({name,pid:r.pid,status:r.status,signal:r.signal,error:r.error?.message,api:'spawnSync返回后已等待进程退出'});expect(r.status).toBe(0);return readFileSync(path);
}
it('真实H264五秒视频完整逐帧解码；所有child close后资源归还',async()=>{
 const events:VideoChildEvent[]=[];const decode=createVideoMediaDecoder(config,{onLifecycle:e=>events.push(e)});
 const bytes=fixture('normal');const result=await decode(bytes,'video/mp4');
 expect(result).toMatchObject({mime:'video/mp4',width:480,height:640,frames:125,codec:'h264',container:'mp4',streams:1,durationMs:5000});
 expect(events.filter(e=>e.event==='spawn').length).toBeGreaterThanOrEqual(2);expect(events.filter(e=>e.event==='close')).toHaveLength(events.filter(e=>e.event==='spawn').length);
 writeFileSync(report+'/video-child-normal.json',JSON.stringify({events,result},null,2));
});
it('拒绝音轨、非H264、截断、伪MIME、尺寸与超时长，失败后正常恢复',async()=>{
 const decode=createVideoMediaDecoder(config);
 const normal=fixture('normal');
 // 编码参数后写覆盖用于实际非H264样本，避免仅改MIME。
 const p=report+'/fixtures/nonh264.mp4';const r=spawnSync(config.ffmpeg.path,['-v','error','-f','lavfi','-i','color=s=480x640:r=25','-t','5','-c:v','mpeg4','-threads','1','-movflags','+faststart','-y',p],{env:{NODE_ENV:'test',PATH:'/usr/bin:/bin'},timeout:15000,maxBuffer:65536});fixtureExits.push({name:'nonh264',pid:r.pid,status:r.status,signal:r.signal,error:r.error?.message,api:'spawnSync返回后已等待进程退出'});expect(r.status).toBe(0);
 const audio=fixture('audio',['-f','lavfi','-i','sine=frequency=440','-c:a','aac']);
 for(const bytes of [audio,readFileSync(p),normal.subarray(0,normal.length-500),fixture('long',[],'6'),fixture('pixels',[],'5','482x640')])await expect(decode(bytes,'video/mp4')).rejects.toThrow('media_decode_rejected');
 await expect(decode(normal,'video/webm')).rejects.toThrow();;
 expect((await decode(normal,'video/mp4')).frames).toBe(125);
});
it('可信身份不符或缺审批拒绝，不借PATH发现二进制',()=>{
 for(const patch of [{approvalRef:''},{version:''},{ffmpeg:{...config.ffmpeg,sha256:'0'.repeat(64)}},{ffprobe:{...config.ffprobe,path:'/bin/sh'}}])expect(()=>createVideoMediaDecoder({...config,...patch})).toThrow();
});
it('abort/墙钟终止并等待真实close，busy后可恢复，不取消独立正常请求',async()=>{
 const bytes=fixture('normal'),events:VideoChildEvent[]=[];const decode=createVideoMediaDecoder(config,{maxConcurrent:1,onLifecycle:e=>events.push(e)}),abort=new AbortController();
 const active=decode(bytes,'video/mp4',abort.signal);await expect(decode(bytes,'video/mp4')).rejects.toThrow('media_decoder_busy');abort.abort();await expect(active).rejects.toThrow();
 expect(events.filter(e=>e.event==='close')).toHaveLength(events.filter(e=>e.event==='spawn').length);expect((await decode(bytes,'video/mp4')).frames).toBe(125);
 const timeoutEvents:VideoChildEvent[]=[];await expect(createVideoMediaDecoder(config,{timeoutMs:20,onLifecycle:e=>timeoutEvents.push(e)})(bytes,'video/mp4')).rejects.toThrow('media_decode_timeout');
 expect(timeoutEvents.some(e=>e.event==='kill')).toBe(true);expect(timeoutEvents.filter(e=>e.event==='close')).toHaveLength(timeoutEvents.filter(e=>e.event==='spawn').length);
 writeFileSync(report+'/video-child-abort-timeout.json',JSON.stringify({events,timeoutEvents},null,2));
});

it('MP4外部dref/额外采样描述在spawn前拒绝，不尝试网络或任意文件',async()=>{
 const normal=fixture('normal'),external=Buffer.from(normal),position=external.indexOf(Buffer.from('dref'));
 expect(position).toBeGreaterThan(0);external.writeUInt32BE(0,position+24-4);
 const events:VideoChildEvent[]=[];await expect(createVideoMediaDecoder(config,{onLifecycle:e=>events.push(e)})(external,'video/mp4')).rejects.toThrow();expect(events).toHaveLength(0);
 const descriptions=Buffer.from(normal),stsd=descriptions.indexOf(Buffer.from('stsd'));descriptions.writeUInt32BE(2,stsd+8);await expect(createVideoMediaDecoder(config)(descriptions,'video/mp4')).rejects.toThrow();
});

it('实际逐帧child收到abort也等close，另一正常请求不被替代并可完成',async()=>{
 const bytes=fixture('normal'),abort=new AbortController(),events:VideoChildEvent[]=[];
 const cancelled=createVideoMediaDecoder(config,{onLifecycle:e=>{events.push(e);if(e.phase==='decode'&&e.event==='spawn')queueMicrotask(()=>abort.abort())}});
 const normal=createVideoMediaDecoder(config);
 const [a,b]=await Promise.allSettled([cancelled(bytes,'video/mp4',abort.signal),normal(bytes,'video/mp4')]);expect(a.status).toBe('rejected');expect(b.status).toBe('fulfilled');expect(events.some(e=>e.phase==='decode'&&e.event==='kill')).toBe(true);expect(events.filter(e=>e.event==='close')).toHaveLength(events.filter(e=>e.event==='spawn').length);
 writeFileSync(report+'/video-child-decode-abort.json',JSON.stringify(events,null,2));
});

it('E3-003：853与854长边同H264/yuv444p单流5秒125帧均完整接受，不收窄政策',async()=>{
 const results=[];
 for(const width of [853,854]){
  const bytes=fixture('width-'+width,[],'5',width+'x480','yuv444p');
  const result=await createVideoMediaDecoder(config)(bytes,'video/mp4');
  expect(result).toEqual({mime:'video/mp4',width,height:480,frames:125,codec:'h264',container:'mp4',streams:1,durationMs:5000});results.push(result);
 }
 writeFileSync(report+'/odd-even-unit-results.json',JSON.stringify(results,null,2));
});
it('E3-003：完整容器内截短媒体与采样帧数/时间不一致仍拒绝，之后正常恢复',async()=>{
 const normal=fixture('consistency'),mismatch=Buffer.from(normal),stsz=mismatch.indexOf(Buffer.from('stsz'));
 expect(stsz).toBeGreaterThan(0);expect(mismatch.readUInt32BE(stsz+12)).toBe(125);mismatch.writeUInt32BE(123,stsz+12);
 const events:VideoChildEvent[]=[],decode=createVideoMediaDecoder(config,{onLifecycle:e=>events.push(e)});
 await expect(decode(mismatch,'video/mp4')).rejects.toThrow('media_decode_rejected');
 expect(events.some(e=>e.phase==='decode'&&e.event==='close'&&e.code===0)).toBe(true);
 let mdat=-1;for(let pos=0;pos<normal.length;pos+=normal.readUInt32BE(pos))if(normal.toString('ascii',pos+4,pos+8)==='mdat')mdat=pos;
 expect(mdat).toBeGreaterThan(0);expect(mdat+normal.readUInt32BE(mdat)).toBe(normal.length);
 const truncated=Buffer.from(normal.subarray(0,normal.length-100));truncated.writeUInt32BE(normal.readUInt32BE(mdat)-100,mdat);
 await expect(decode(truncated,'video/mp4')).rejects.toThrow('media_decode_rejected');
 expect((await decode(normal,'video/mp4')).frames).toBe(125);
 writeFileSync(report+'/consistency-unit-events.json',JSON.stringify(events,null,2));
});

});
