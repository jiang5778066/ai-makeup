import {spawn} from 'node:child_process';
import {readFileSync,realpathSync,statSync} from 'node:fs';
import {isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {MediaFault} from './media-contracts';
import {sniffMediaMime,type DecodedMedia} from './media-security';
export type VideoDecoderConfig={approvalRef:string;version:string;ffmpeg:{path:string;sha256:string};ffprobe:{path:string;sha256:string}};
export type VideoChildEvent={event:'spawn'|'kill'|'close';phase:string;pid?:number;code?:number|null;signal?:string|null};
type Options={timeoutMs?:number;maxConcurrent?:number;onLifecycle?:(event:VideoChildEvent)=>void};
const fault=(code='media_decode_rejected')=>new MediaFault(code);
const MAX_BYTES=64*1024*1024,MAX_FRAMES=315;
let globalActive=0;
function verifyBinary(binary:VideoDecoderConfig['ffmpeg']){
 if(!binary||!isAbsolute(binary.path)||realpathSync(binary.path)!==binary.path||!statSync(binary.path).isFile()||statSync(binary.path).size>64*1024*1024||!/^[0-9a-f]{64}$/.test(binary.sha256)||createHash('sha256').update(readFileSync(binary.path)).digest('hex')!==binary.sha256)throw fault('media_decoder_unconfigured');
}
// 只接受独立MP4字节；pipe是唯一输入协议，mov是唯一解复用器，禁止dref外部读取。
function verifyContainer(bytes:Buffer){
 if(bytes.length>MAX_BYTES||sniffMediaMime(bytes)!=='video/mp4')throw fault();
 let offset=0,ftyp=0,moov=0,mdat=0,references=0;
 const inspect=(start:number,end:number,depth=0)=>{
  if(depth>8)throw fault();
  for(let pos=start;pos<end;){
   if(pos+8>end)throw fault();const length=bytes.readUInt32BE(pos),type=bytes.toString('ascii',pos+4,pos+8);
   if(length<8||pos+length>end)throw fault();
   if(['moov','trak','mdia','minf','dinf','stbl'].includes(type))inspect(pos+8,pos+length,depth+1);
   if(type==='dref'){
    // 唯一自包含url条目，不接受urn、外部文件/网络引用或额外引用。
    if(length!==28||bytes.readUInt32BE(pos+8)!==0||bytes.readUInt32BE(pos+12)!==1||bytes.readUInt32BE(pos+16)!==12||bytes.toString('ascii',pos+20,pos+24)!=='url '||bytes.readUInt32BE(pos+24)!==1)throw fault();references++;
   }
   if(type==='stsd'){
    if(length<32||bytes.readUInt32BE(pos+8)!==0||bytes.readUInt32BE(pos+12)!==1||bytes.readUInt32BE(pos+16)!==length-16||!['avc1','avc3'].includes(bytes.toString('ascii',pos+20,pos+24))||bytes.readUInt16BE(pos+30)!==1)throw fault();
   }
   pos+=length;
  }
 };
 while(offset<bytes.length){
  if(offset+8>bytes.length)throw fault();
  const size=bytes.readUInt32BE(offset),kind=bytes.toString('ascii',offset+4,offset+8);
  if(size<8||offset+size>bytes.length||!['ftyp','moov','mdat','free','skip','wide'].includes(kind))throw fault();
  if(kind==='ftyp')ftyp++;if(kind==='moov'){moov++;inspect(offset+8,offset+size)}if(kind==='mdat')mdat++;
  offset+=size;
 }
 if(ftyp!==1||moov!==1||mdat<1||references!==1)throw fault();
}
export function createVideoMediaDecoder(config:VideoDecoderConfig,options:Options={}){
 try{if(!config.approvalRef||!/^\d+\.\d+(?:\.\d+)?$/.test(config.version))throw Error();verifyBinary(config.ffmpeg);verifyBinary(config.ffprobe)}catch{throw fault('media_decoder_unconfigured')}
 const timeout=options.timeoutMs??12000,max=options.maxConcurrent??1;
 if(!Number.isInteger(timeout)||timeout<1||timeout>15000||!Number.isInteger(max)||max<1||max>2)throw fault('media_decoder_unconfigured');
 let active=0;
 const emit=(event:VideoChildEvent)=>{try{options.onLifecycle?.(event)}catch{/* 观察回调不能破坏child回收。 */}};
 return async(bytes:Buffer,mime:string,signal?:AbortSignal):Promise<DecodedMedia>=>{
  if(mime!=='video/mp4')throw fault();verifyContainer(bytes);
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
   child.stdin!.on('error',()=>kill('media_decode_rejected'));child.on('error',()=>kill('media_decode_rejected'));
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
   const probe=JSON.parse((await run(config.ffprobe.path,[...inputArgs,'-i','pipe:0','-show_entries','format=format_name,duration:stream=index,codec_name,codec_type,width,height,duration,nb_frames,avg_frame_rate,r_frame_rate:stream_disposition=attached_pic','-of','json'],'probe',bytes)).toString());
   if(!Array.isArray(probe.streams)||probe.streams.length!==1||!probe.format?.format_name?.split(',').includes('mp4'))throw fault();
   const stream=probe.streams[0],width=stream.width,height=stream.height,duration=Number(stream.duration),containerDuration=Number(probe.format.duration),frames=Number(stream.nb_frames);
   const rate=(value:unknown)=>{if(typeof value!=='string'||!/^\d+\/\d+$/.test(value))return NaN;const [n,d]=value.split('/').map(Number);return n/d};
   if(stream.codec_type!=='video'||stream.codec_name!=='h264'||stream.disposition?.attached_pic!==0||![width,height,frames].every(Number.isSafeInteger)||Math.min(width,height)!==480||Math.max(width,height)>864||frames<1||frames>MAX_FRAMES||!Number.isFinite(duration)||duration<4.75||duration>5.25||!Number.isFinite(containerDuration)||Math.abs(containerDuration-duration)>0.05||![rate(stream.avg_frame_rate),rate(stream.r_frame_rate)].every(r=>r>=1&&r<=60))throw fault();
   // framecrc对逐帧原始像素求校验，stdout只有有界记录，不累积raw视频。
   const decoded=(await run(config.ffmpeg.path,[...inputArgs,'-xerror','-err_detect','explode','-i','pipe:0','-map','0:v:0','-an','-sn','-dn','-threads','1','-filter_threads','1','-c:v','rawvideo','-pix_fmt','yuv420p','-fps_mode','passthrough','-f','framecrc','pipe:1'],'decode',bytes,65536)).toString('ascii');
   const lines=decoded.trim().split('\n'),dimensions=lines.find(l=>l.startsWith('#dimensions 0:'))?.match(/(\d+)x(\d+)/),tb=lines.find(l=>l.startsWith('#tb 0:'))?.match(/(\d+)\/(\d+)/);
   const records=lines.filter(l=>!l.startsWith('#')).map(l=>l.split(',').map(x=>x.trim()));
   if(!dimensions||Number(dimensions[1])!==width||Number(dimensions[2])!==height||!tb||records.length!==frames||records.length>MAX_FRAMES)throw fault();
   const timebase=Number(tb[1])/Number(tb[2]);let start=Infinity,end=-Infinity,previous=-Infinity;
   // 固定yuv420p输出的两个色度平面分别向上取整，输入仍可为其它H264像素格式。
   const frameBytes=width*height+2*Math.ceil(width/2)*Math.ceil(height/2);
   for(const record of records){const [index,,pts,span,size]=record.map(Number);if(index!==0||!Number.isSafeInteger(pts)||!Number.isSafeInteger(span)||span<1||pts<=previous||size!==frameBytes)throw fault();previous=pts;start=Math.min(start,pts*timebase);end=Math.max(end,(pts+span)*timebase)}
   const actualDuration=end-start;
   if(!Number.isFinite(actualDuration)||Math.abs(actualDuration-duration)>0.05||actualDuration<4.75||actualDuration>5.25)throw fault();
   return {mime,width,height,frames,durationMs:Math.round(actualDuration*1000),codec:'h264',container:'mp4',streams:1};
  }catch(error){if(error instanceof MediaFault)throw error;throw fault()}finally{active--;globalActive--}
 };
}
