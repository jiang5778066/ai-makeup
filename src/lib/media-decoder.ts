import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {isAbsolute} from 'node:path';
import {MediaFault} from './media-contracts';
import {sniffMediaMime,type MediaDecoder} from './media-security';
// Webpack将此标识保留为产物模块的原生Node require；源码环境走createRequire。
declare const __non_webpack_require__:NodeRequire|undefined;
// 独立进程使用同一直接依赖路径；超时强制结束并等待close，避免后台解码继续占用资源。
const program=String.raw`
const sharp=require(process.argv[1]);sharp.cache(false);sharp.concurrency(1);
let size=0,chunks=[];process.stdin.on('data',b=>{size+=b.length;if(size>16777216)process.exit(2);chunks.push(b)});
process.stdin.on('end',async()=>{try{
 const bytes=Buffer.concat(chunks),image=sharp(bytes,{failOn:'warning',limitInputPixels:32000000,animated:true});
 const m=await image.metadata();
 if(!['png','jpeg','webp'].includes(m.format)||!m.width||!m.height||m.width>8192||m.height>8192||m.width*m.height>32000000||(m.pages||1)!==1)throw Error();
 const {data,info}=await image.raw().toBuffer({resolveWithObject:true});
 if(info.width!==m.width||info.height!==m.height||data.length!==info.width*info.height*info.channels)throw Error();
 process.stdout.write(JSON.stringify({mime:'image/'+m.format,width:info.width,height:info.height,frames:1}));
 }catch{process.exitCode=2}});
`;
export function createSharpMediaDecoder(options:{timeoutMs?:number;maxConcurrent?:number}={}):MediaDecoder{
 const timeout=Math.min(10000,Math.max(1,options.timeoutMs??5000)),max=Math.min(2,Math.max(1,options.maxConcurrent??2));let active=0;
 return async(bytes,mime)=>{
  if(bytes.length>16*1024*1024||!['image/png','image/jpeg','image/webp'].includes(mime)||sniffMediaMime(bytes)!==mime)throw new MediaFault('media_decode_rejected');
  if(active>=max)throw new MediaFault('media_decoder_busy',503);
  let sharpPath:string;
  try{
   const nativeRequire=typeof __non_webpack_require__==='function'?__non_webpack_require__:createRequire(import.meta.url);
   sharpPath=nativeRequire.resolve('sharp');
   if(typeof sharpPath!=='string'||!isAbsolute(sharpPath)||nativeRequire('sharp/package.json').version!=='0.34.5')throw Error();
  }catch{throw new MediaFault('media_decoder_unconfigured',503)}
  active++;
  try{return await new Promise<{mime:string;width:number;height:number;frames:number}>((resolve,reject)=>{
   const child=spawn(process.execPath,['--max-old-space-size=96','-e',program,sharpPath],{env:{NODE_ENV:'production',PATH:'/usr/bin:/bin',VIPS_CONCURRENCY:'1',MALLOC_ARENA_MAX:'2'},stdio:['pipe','pipe','pipe']});
   let output=Buffer.alloc(0),failed=false,timedOut=false;
   const kill=()=>{failed=true;child.kill('SIGKILL')};
   const timer=setTimeout(()=>{timedOut=true;kill()},timeout);
   child.stdout.on('data',(b:Buffer)=>{output=Buffer.concat([output,b]);if(output.length>1024)kill()});
   child.stderr.on('data',()=>{/* 原生库正文不进入用户错误或日志。 */});
   child.stdin.on('error',()=>{failed=true});child.on('error',()=>{failed=true});
   child.on('close',code=>{
    clearTimeout(timer);
    if(timedOut||failed||code!==0){reject(new MediaFault(timedOut?'media_decode_timeout':'media_decode_rejected'));return}
    try{const r=JSON.parse(output.toString());if(r.mime!==mime||r.frames!==1||!Number.isSafeInteger(r.width)||!Number.isSafeInteger(r.height)||r.width<1||r.height<1||r.width>8192||r.height>8192||r.width*r.height>32000000)throw Error();resolve(r)}catch{reject(new MediaFault('media_decode_rejected'))}
   });child.stdin.end(bytes);
  })}finally{active--}
 };
}
