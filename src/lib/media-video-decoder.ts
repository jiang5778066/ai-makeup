import {MEDIA_VIDEO_MAX_BYTES,MEDIA_VIDEO_MAX_FRAMES,MEDIA_VIDEO_MIN_MS,MEDIA_VIDEO_MAX_MS} from './media-video-contract';
import {spawn} from 'node:child_process';
import {readFileSync,realpathSync,statSync} from 'node:fs';
import {isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {MediaFault} from './media-contracts';
import {sniffMediaMime,type DecodedMedia} from './media-security';
export type VideoDecoderConfig={approvalRef:string;version:string;ffmpeg:{path:string;sha256:string};ffprobe:{path:string;sha256:string}};
export type VideoChildEvent={event:'spawn'|'kill'|'close';phase:string;pid?:number;code?:number|null;signal?:string|null};
type Track={index:number;codec_type:string;codec_name:string;width?:number;height?:number;duration?:string;nb_frames?:string;avg_frame_rate?:string;r_frame_rate?:string;sample_rate?:string;channels?:number;disposition?:{attached_pic:number}};
type Options={timeoutMs?:number;maxConcurrent?:number;onLifecycle?:(event:VideoChildEvent)=>void};
const fault=(code='media_decode_rejected')=>new MediaFault(code);
const MAX_BYTES=MEDIA_VIDEO_MAX_BYTES,MAX_FRAMES=MEDIA_VIDEO_MAX_FRAMES;
let globalActive=0;
function verifyBinary(binary:VideoDecoderConfig['ffmpeg']){
 if(!binary||!isAbsolute(binary.path)||realpathSync(binary.path)!==binary.path||!statSync(binary.path).isFile()||statSync(binary.path).size>64*1024*1024||!/^[0-9a-f]{64}$/.test(binary.sha256)||createHash('sha256').update(readFileSync(binary.path)).digest('hex')!==binary.sha256)throw fault('media_decoder_unconfigured');
}
// 只接受独立MP4字节；pipe是唯一输入协议，mov是唯一解复用器，禁止dref外部读取。
function verifyContainer(bytes:Buffer){
 if(bytes.length>MAX_BYTES||sniffMediaMime(bytes)!=='video/mp4')throw fault();
 let offset=0,ftyp=0,moov=0,mdat=0,manifests=0;
 const tracks:{references:number;descriptions:number;audioDescriptions:number}[]=[];
 const containers=new Set(['moov','trak','mdia','minf','dinf','stbl','edts','udta','mvex','moof','traf','mfra','tref','ipro','sinf','schi','wave','meta','ilst']);
 const inspect=(start:number,end:number,path:string[],track?:typeof tracks[number],depth=0)=>{
  if(depth>8)throw fault();
  for(let pos=start;pos<end;){
   if(pos+8>end)throw fault();const length=bytes.readUInt32BE(pos),type=bytes.toString('ascii',pos+4,pos+8);
   if(length<8||pos+length>end)throw fault();
   const parentPath=path.join('/');
   if(type==='uuid')throw fault();
   if(type==='trak'){
    if(parentPath!=='moov'||track)throw fault();
    const current={references:0,descriptions:0,audioDescriptions:0};tracks.push(current);
    inspect(pos+8,pos+length,[...path,type],current,depth+1);
   }else if(type==='dref'){
    if(parentPath!=='moov/trak/mdia/minf/dinf'||!track)throw fault();
    // 唯一自包含url条目，不接受urn、外部文件/网络引用或额外引用。
    if(length!==28||bytes.readUInt32BE(pos+8)!==0||bytes.readUInt32BE(pos+12)!==1||bytes.readUInt32BE(pos+16)!==12||bytes.toString('ascii',pos+20,pos+24)!=='url '||bytes.readUInt32BE(pos+24)!==1)throw fault();track.references++;
   }else if(type==='stsd'){
    if(parentPath!=='moov/trak/mdia/minf/stbl'||!track)throw fault();
    const entryType=bytes.toString('ascii',pos+20,pos+24),entryStart=pos+16,entrySize=length-16,sampleHeader=entryType==='mp4a'?28:78;
    if(length<32||bytes.readUInt32BE(pos+8)!==0||bytes.readUInt32BE(pos+12)!==1||bytes.readUInt32BE(pos+16)!==entrySize||!['avc1','avc3','mp4a'].includes(entryType)||bytes.readUInt16BE(pos+30)!==1||entrySize<8+sampleHeader||(entryType==='mp4a'&&bytes.readUInt16BE(entryStart+16)!==0))throw fault();
    track.descriptions++;if(entryType==='mp4a')track.audioDescriptions++;
    inspect(entryStart+8+sampleHeader,pos+length,[...path,type,entryType],track,depth+1);
   }else if(containers.has(type)){
    const prefix=type==='meta'?4:0;
    if(length<8+prefix)throw fault();
    inspect(pos+8+prefix,pos+length,[...path,type],track,depth+1);
   }
   pos+=length;
  }
 };
 while(offset<bytes.length){
  if(offset+8>bytes.length)throw fault();
  const size=bytes.readUInt32BE(offset),kind=bytes.toString('ascii',offset+4,offset+8);
  if(size<8||offset+size>bytes.length||!['ftyp','moov','mdat','free','skip','wide','uuid'].includes(kind))throw fault();
  // 仅允许本样本使用的C2PA UUID元数据；不解析或跟随其中的外部声明。
  if(kind==='uuid'&&(++manifests>1||size<24||size>256*1024||bytes.subarray(offset+8,offset+24).toString('hex')!=='d8fec3d61b0e483c92975828877ec481'))throw fault();
  if(kind==='ftyp')ftyp++;if(kind==='moov'){moov++;inspect(offset+8,offset+size,['moov'])}if(kind==='mdat')mdat++;
  offset+=size;
 }
 const references=tracks.reduce((count,track)=>count+track.references,0),descriptions=tracks.reduce((count,track)=>count+track.descriptions,0),audioDescriptions=tracks.reduce((count,track)=>count+track.audioDescriptions,0);
 if(ftyp!==1||moov!==1||mdat<1||tracks.length<1||tracks.length>2||tracks.some(track=>track.references!==1||track.descriptions!==1)||references!==descriptions||audioDescriptions>1)throw fault();
 return {tracks:descriptions,audioTracks:audioDescriptions};
}
export function createVideoMediaDecoder(config:VideoDecoderConfig,options:Options={}){
 try{if(!config.approvalRef||!/^\d+\.\d+(?:\.\d+)?$/.test(config.version))throw Error();verifyBinary(config.ffmpeg);verifyBinary(config.ffprobe)}catch{throw fault('media_decoder_unconfigured')}
 const timeout=options.timeoutMs??12000,max=options.maxConcurrent??1;
 if(!Number.isInteger(timeout)||timeout<1||timeout>15000||!Number.isInteger(max)||max<1||max>2)throw fault('media_decoder_unconfigured');
 let active=0;
 const emit=(event:VideoChildEvent)=>{try{options.onLifecycle?.(event)}catch{/* 观察回调不能破坏child回收。 */}};
 return async(bytes:Buffer,mime:string,signal?:AbortSignal):Promise<DecodedMedia>=>{
  if(mime!=='video/mp4')throw fault();const container=verifyContainer(bytes);
  if(signal?.aborted)throw fault('media_decode_aborted');
  if(active>=max||globalActive>=2)throw fault('media_decoder_busy');
  active++;globalActive++;const deadline=Date.now()+timeout;
  const run=(path:string,args:string[],phase:string,input?:Buffer,outputLimit=65536)=>new Promise<Buffer>((resolve,reject)=>{
   const remaining=deadline-Date.now();if(remaining<1){reject(fault('media_decode_timeout'));return}
   let child:ReturnType<typeof spawn>;
   try{child=spawn(path,args,{shell:false,env:{NODE_ENV:'production',PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'},stdio:['pipe','pipe','pipe']})}catch{reject(fault());return}
   emit({event:'spawn',phase,pid:child.pid});let error:string|undefined,stdout=Buffer.alloc(0),stderrBytes=0,closed=false;
   const kill=(code:string)=>{if(closed||error)return;error=code;emit({event:'kill',phase,pid:child.pid});child.kill('SIGKILL')};
   const abort=()=>kill('media_decode_aborted');const timer=setTimeout(()=>kill('media_decode_timeout'),remaining);
   signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
   child.stdout!.on('data',(chunk:Buffer)=>{if(stdout.length+chunk.length>outputLimit){kill('media_decode_rejected');return}stdout=Buffer.concat([stdout,chunk]);if(phase==='decode'&&stdout.toString('ascii').split('\n').filter(l=>l&&!l.startsWith('#')).length>MAX_FRAMES)kill('media_decode_rejected')});
   child.stderr!.on('data',(chunk:Buffer)=>{stderrBytes+=chunk.length;if(stderrBytes>16384)kill('media_decode_rejected')});
   // probe/单帧封面可在读取完所需数据后关闭输入；仍必须等待其close且退出0。
   child.stdin!.on('error',(e:NodeJS.ErrnoException)=>{if(e.code!=='EPIPE'||!['probe','cover'].includes(phase))kill('media_decode_rejected')});child.on('error',()=>kill('media_decode_rejected'));
   child.on('close',(code,exitSignal)=>{closed=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);emit({event:'close',phase,pid:child.pid,code,signal:exitSignal});if(error||code!==0)reject(fault(error));else resolve(stdout)});
   child.stdin!.end(input);
  });
  try{
   verifyBinary(config.ffmpeg);verifyBinary(config.ffprobe);
   for(const [path,name] of [[config.ffmpeg.path,'ffmpeg'],[config.ffprobe.path,'ffprobe']]){
    const version=(await run(path,['-version'],name+'-version')).toString('ascii');
    if(!version.startsWith(`${name} version ${config.version} `))throw fault('media_decoder_unconfigured');
   }
   const inputArgs=['-v','error','-threads','1','-protocol_whitelist','pipe','-format_whitelist','mov','-enable_drefs','0','-use_absolute_path','0','-f','mov'];
   const probe=JSON.parse((await run(config.ffprobe.path,[...inputArgs,'-i','pipe:0','-show_entries','format=format_name,duration:stream=index,codec_name,codec_type,width,height,duration,nb_frames,avg_frame_rate,r_frame_rate,sample_rate,channels:stream_disposition=attached_pic','-of','json'],'probe',bytes)).toString());
   if(!Array.isArray(probe.streams)||probe.streams.length<1||probe.streams.length>3||!probe.format?.format_name?.split(',').includes('mp4'))throw fault();
   const tracks=probe.streams as Track[],indices=tracks.map(t=>t.index);
   if(indices.some(i=>!Number.isSafeInteger(i)||i<0||i>2)||new Set(indices).size!==tracks.length)throw fault();
   const videos=tracks.filter(t=>t.codec_type==='video'&&t.codec_name==='h264'&&t.disposition?.attached_pic===0);
   const audio=tracks.filter(t=>t.codec_type==='audio'&&t.codec_name==='aac'&&t.disposition?.attached_pic===0);
   const covers=tracks.filter(t=>t.codec_type==='video'&&t.codec_name==='mjpeg'&&t.disposition?.attached_pic===1);
   if(videos.length!==1||audio.length>1||covers.length>1||videos.length+audio.length+covers.length!==tracks.length||container.tracks!==1+audio.length||container.audioTracks!==audio.length)throw fault();
   const stream=videos[0],width=stream.width!,height=stream.height!,duration=Number(stream.duration),containerDuration=Number(probe.format.duration),frames=Number(stream.nb_frames);
   const rate=(value:unknown)=>{if(typeof value!=='string'||!/^\d+\/\d+$/.test(value))return NaN;const [n,d]=value.split('/').map(Number);return n/d};
   if(stream.codec_type!=='video'||stream.codec_name!=='h264'||stream.disposition?.attached_pic!==0||![width,height,frames].every(Number.isSafeInteger)||Math.min(width,height)!==480||Math.max(width,height)>864||frames<1||frames>MAX_FRAMES||!Number.isFinite(duration)||duration*1000<MEDIA_VIDEO_MIN_MS||duration*1000>MEDIA_VIDEO_MAX_MS||!Number.isFinite(containerDuration)||Math.abs(containerDuration-duration)>0.05||![rate(stream.avg_frame_rate),rate(stream.r_frame_rate)].every(r=>r>=1&&r<=60))throw fault();
   // framecrc对逐帧原始像素求校验，stdout只有有界记录，不累积raw视频。
   const decoded=(await run(config.ffmpeg.path,[...inputArgs,'-xerror','-err_detect','explode','-i','pipe:0','-map',`0:${stream.index}`,'-threads','1','-filter_threads','1','-c:v','rawvideo','-pix_fmt','yuv420p','-fps_mode','passthrough','-f','framecrc','pipe:1'],'decode',bytes,65536)).toString('ascii');
   const lines=decoded.trim().split('\n'),dimensions=lines.find(l=>l.startsWith('#dimensions 0:'))?.match(/(\d+)x(\d+)/),tb=lines.find(l=>l.startsWith('#tb 0:'))?.match(/(\d+)\/(\d+)/);
   const records=lines.filter(l=>!l.startsWith('#')).map(l=>l.split(',').map(x=>x.trim()));
   if(!dimensions||Number(dimensions[1])!==width||Number(dimensions[2])!==height||!tb||records.length!==frames||records.length>MAX_FRAMES)throw fault();
   const timebase=Number(tb[1])/Number(tb[2]);let start=Infinity,end=-Infinity,previous=-Infinity;
   // 固定yuv420p输出的两个色度平面分别向上取整，输入仍可为其它H264像素格式。
   const frameBytes=width*height+2*Math.ceil(width/2)*Math.ceil(height/2);
   for(const record of records){const [index,,pts,span,size]=record.map(Number);if(index!==0||!Number.isSafeInteger(pts)||!Number.isSafeInteger(span)||span<1||pts<=previous||size!==frameBytes)throw fault();previous=pts;start=Math.min(start,pts*timebase);end=Math.max(end,(pts+span)*timebase)}
   const actualDuration=end-start;
   if(!Number.isFinite(actualDuration)||Math.abs(actualDuration-duration)>0.05||actualDuration*1000<MEDIA_VIDEO_MIN_MS||actualDuration*1000>MEDIA_VIDEO_MAX_MS)throw fault();
   // 白名单轨逐个真实解码；显式map不能掩盖未经核验的其它轨道。
   for(const track of audio){
    const sampleRate=Number(track.sample_rate),channels=track.channels!,audioDuration=Number(track.duration),packets=Number(track.nb_frames);
    if(![1,2].includes(channels)||!Number.isSafeInteger(sampleRate)||sampleRate<8000||sampleRate>48000||!Number.isSafeInteger(packets)||packets<1||packets>64||!Number.isFinite(audioDuration)||audioDuration<0.9||audioDuration>1.1||Math.abs(audioDuration-duration)>0.1)throw fault();
    const pcm=await run(config.ffmpeg.path,[...inputArgs,'-xerror','-err_detect','explode','-i','pipe:0','-map',`0:${track.index}`,'-threads','1','-c:a','pcm_s16le','-f','s16le','pipe:1'],'audio',bytes,Math.ceil(sampleRate*channels*2*1.15));
    const samples=pcm.length/(channels*2);if(!Number.isSafeInteger(samples)||Math.abs(samples/sampleRate-audioDuration)>0.05)throw fault();
   }
   for(const track of covers){
    if(track.width!==width||track.height!==height)throw fault();
    const cover=(await run(config.ffmpeg.path,[...inputArgs,'-xerror','-err_detect','explode','-i','pipe:0','-map',`0:${track.index}`,'-threads','1','-filter_threads','1','-c:v','rawvideo','-pix_fmt','yuv420p','-f','framecrc','pipe:1'],'cover',bytes,4096)).toString('ascii');
    const coverLines=cover.trim().split('\n'),coverFrames=coverLines.filter(l=>l&&!l.startsWith('#'));
    if(!coverLines.includes(`#dimensions 0: ${width}x${height}`)||coverFrames.length!==1||Number(coverFrames[0].split(',')[4])!==frameBytes)throw fault();
   }
   return {mime,width,height,frames,durationMs:Math.round(actualDuration*1000),codec:'h264',container:'mp4',streams:tracks.length};
  }catch(error){if(error instanceof MediaFault)throw error;throw fault()}finally{active--;globalActive--}
 };
}
