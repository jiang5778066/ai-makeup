import {Resolver} from 'node:dns/promises';
import {request as httpsRequest} from 'node:https';
import {checkServerIdentity} from 'node:tls';
import {MediaFault} from './media-contracts';
import {assertMediaUrl,publicMediaAddress,type PinnedTransport} from './media-security';
export type ImageHttpRequest={url:string;method:'POST'|'GET';key:string;body?:string};
export type ImageHttp=(request:ImageHttpRequest)=>Promise<{status:number;body:Buffer}>;
type Address={address:string;family:4|6};
// 每次工厂调用须返回独占句柄；cancel必须使该句柄全部待决查询settled。
export interface MediaDnsResolver {
 resolve4(host:string):Promise<string[]>;
 resolve6(host:string):Promise<string[]>;
 cancel():void;
}
type Options={hosts:readonly string[];resolver?:()=>MediaDnsResolver;dnsTimeoutMs?:number;maxDnsConcurrent?:number;request?:typeof httpsRequest};
const fault=()=>new MediaFault('media_transport_rejected',503);
// 跨wire也有限额；不排队，超时后底层未settled时不提前归还名额。
const GLOBAL_DNS_LIMIT=8;
let activeDns=0;
function createWire(options:Options){
 const hosts=Object.freeze([...options.hosts]);
 const timeout=options.dnsTimeoutMs??3000,limit=options.maxDnsConcurrent??4;
 if(!Number.isInteger(timeout)||timeout<1||timeout>3000||!Number.isInteger(limit)||limit<1||limit>GLOBAL_DNS_LIMIT)throw fault();
 const pins=new WeakMap<Address,Readonly<{host:string;address:string;family:4|6}>>();
 let active=0;
 const resolve=async(host:string)=>{
  if(!hosts.includes(host)||active>=limit||activeDns>=GLOBAL_DNS_LIMIT)throw fault();
  active++;activeDns++;
  let resolver:MediaDnsResolver|undefined,timer:ReturnType<typeof setTimeout>|undefined;
  let expired=false,cancelled=false;
  const cancel=()=>{if(cancelled||!resolver)return;cancelled=true;try{resolver.cancel()}catch{/* 注入句柄失败也必须等待原查询settled，不能释放在途名额。 */}};
  try{
   resolver=(options.resolver??(()=>new Resolver({timeout:1000,tries:1})))();
   const start=(query:()=>Promise<string[]>)=>{try{return Promise.resolve(query())}catch(error){return Promise.reject(error)}};
   const queries=[start(()=>resolver!.resolve4(host)),start(()=>resolver!.resolve6(host))];
   timer=setTimeout(()=>{expired=true;cancel()},timeout);
   // 不用外层race冒充取消：cancel后仍等待两个原生查询的完成通知。
   const answers=await Promise.allSettled(queries);
   if(expired)throw fault();
   const addresses:Address[]=[];
   for(let i=0;i<answers.length;i++){
    const answer=answers[i];
    if(answer.status==='rejected'){
     if(!answer.reason||answer.reason.code!=='ENODATA')throw fault();
    }else for(const address of answer.value)addresses.push({address,family:i===0?4:6});
   }
   if(!addresses.length||addresses.some(a=>a.family!==4||!publicMediaAddress(a.address)||a.address.startsWith('192.88.99.')))throw fault();
   return addresses.map(address=>{
    const pin=Object.freeze({...address});
    pins.set(pin,Object.freeze({host,...address}));
    return pin;
   });
  }catch{throw fault()}finally{clearTimeout(timer);cancel();active--;activeDns--}
 };
 const send=async(url:URL,pin:Address,max:number,method:'GET'|'POST'='GET',headers:Record<string,string>={},body?:string)=>{
  assertMediaUrl(url.href,hosts);
  const evidence=pins.get(pin);
  if(!evidence||evidence.host!==url.hostname||pin.address!==evidence.address||pin.family!==evidence.family||pin.family!==4||!publicMediaAddress(pin.address))throw fault();
  return new Promise<{status:number;contentType:string;bytes:Buffer}>((resolve,reject)=>{
   let finished=false;let response:import('node:http').IncomingMessage|undefined;
   let req:import('node:http').ClientRequest|undefined;
   const timers:ReturnType<typeof setTimeout>[]=[];
   const clear=()=>timers.forEach(clearTimeout);
   const fail=()=>{if(finished)return;finished=true;clear();response?.destroy();req?.destroy();reject(fault())};
   const timer=(ms:number)=>{const id=setTimeout(fail,ms);timers.push(id);return id};
   timer(30000);const connection=timer(5000),firstByte=timer(10000);
   try{
    req=(options.request??httpsRequest)({protocol:'https:',hostname:pin.address,family:4,port:443,servername:url.hostname,rejectUnauthorized:true,checkServerIdentity:(_host,cert)=>checkServerIdentity(url.hostname,cert),method,path:url.pathname+url.search,agent:false,maxHeaderSize:16384,headers:{Host:url.hostname,Accept:'*/*','Accept-Encoding':'identity',...headers}},r=>{
     response=r;clearTimeout(connection);clearTimeout(firstByte);
     const encoding=r.headers['content-encoding'],length=r.headers['content-length'];
     if((r.statusCode??0)>=300&&(r.statusCode??0)<400||encoding&&encoding!=='identity'||length&&(!/^\d+$/.test(length)||Number(length)>max)){fail();return}
     const chunks:Buffer[]=[];let size=0;
     r.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>max){fail();return}chunks.push(Buffer.from(chunk))});
     r.on('error',fail);r.on('aborted',fail);
     r.on('end',()=>{if(finished)return;if(length&&size!==Number(length)){fail();return}finished=true;clear();resolve({status:r.statusCode??0,contentType:String(r.headers['content-type']??''),bytes:Buffer.concat(chunks)})});
    });
    req.maxHeadersCount=64;
    req.on('socket',socket=>socket.once('secureConnect',()=>clearTimeout(connection)));
    req.on('error',fail);req.end(body);
   }catch{fail()}
  });
 };
 return {resolve,send};
}
export function createPinnedMediaTransport(options:Options):PinnedTransport{
 const wire=createWire(options);
 return {resolve:wire.resolve,async request(url,pin,max=16*1024*1024){if(!Number.isSafeInteger(max)||max<1||max>64*1024*1024)throw fault();const r=await wire.send(url,pin,max);return {status:r.status,contentType:r.contentType,body:(async function*(){yield r.bytes})()}}};
}
export function createPinnedImageHttp(options:Omit<Options,'hosts'>={}):ImageHttp{
 return createPinnedProviderHttp('images',options);
}
export function createPinnedVideoHttp(options:Omit<Options,'hosts'>={}):ImageHttp{
 return createPinnedProviderHttp('videos',options);
}
function createPinnedProviderHttp(kind:'images'|'videos',options:Omit<Options,'hosts'>):ImageHttp{
 const wire=createWire({...options,hosts:['api.router.team']});
 return async request=>{
  const url=assertMediaUrl(request.url,['api.router.team']);
  const base=`/api/public/creative-center/${kind}`;
  const validQuery=kind==='videos'&&request.method==='GET'?url.search==='?model=grok-imagine-video-1.5':!url.search;
  if(!validQuery||request.method==='POST'&&url.pathname!==base||request.method==='GET'&&(!url.pathname.startsWith(base+'/')||!url.pathname.slice(base.length+1)||url.pathname.slice(base.length+1).includes('/'))||!request.key||/[\r\n]/.test(request.key)||request.body&&Buffer.byteLength(request.body)>32768)throw fault();
  const [pin]=await wire.resolve(url.hostname);
  const r=await wire.send(url,pin,256*1024,request.method,{Authorization:`Bearer ${request.key}`,'Content-Type':'application/json',...(request.body?{'Content-Length':String(Buffer.byteLength(request.body))}:{})},request.body);
  return {status:r.status,body:r.bytes};
 };
}
