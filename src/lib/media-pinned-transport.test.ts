// @vitest-environment node
import {it,expect,vi,afterEach} from 'vitest';
import {EventEmitter} from 'node:events';
import {Readable} from 'node:stream';
import {createPinnedMediaTransport,createPinnedImageHttp,type MediaDnsResolver} from './media-pinned-transport';
import type {request as httpsRequest} from 'node:https';

type Address={address:string;family:4|6};
const host='results.example.com',url=new URL(`https://${host}/image`);
const imageRequest={url:'https://api.router.team/api/public/creative-center/images',method:'POST' as const,key:'local-only',body:'{}'};
const noData=()=>Object.assign(new Error('本机受控空记录'),{code:'ENODATA'});
const resolverFor=(addresses:Address[]):(()=>MediaDnsResolver)=>()=>({
 resolve4:async()=>addresses.filter(a=>a.family===4).map(a=>a.address),
 resolve6:async()=>addresses.filter(a=>a.family===6).map(a=>a.address),cancel:vi.fn(),
});
const fixture=(chunks:Buffer[]=[Buffer.from('ok')],headers:Record<string,string>={},status=200)=>{
 const calls:Record<string,unknown>[]=[];
 const wire=vi.fn((opts:Record<string,unknown>,done:(r:Readable)=>void)=>{
  calls.push(opts);
  return Object.assign(new EventEmitter(),{destroy:vi.fn(),end:()=>{
   const r=Object.assign(Readable.from(chunks),{statusCode:status,headers:{'content-type':'image/png',...headers}});
   queueMicrotask(()=>done(r));
  }});
 });
 return {wire:wire as unknown as typeof httpsRequest,calls};
};
function deferred<T>(){
 let resolve!:(value:T)=>void,reject!:(reason:unknown)=>void;
 const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no});
 return {promise,resolve,reject};
}
function controlled(autoCancel=true){
 const sessions:{a:ReturnType<typeof deferred<string[]>>;aaaa:ReturnType<typeof deferred<string[]>>;cancel:ReturnType<typeof vi.fn>;acknowledge:()=>void;active:()=>number}[]=[];
 const factory=vi.fn(()=>{
  const a=deferred<string[]>(),aaaa=deferred<string[]>();let active=0;
  const acknowledge=()=>{const error=Object.assign(new Error('本次取消'),{code:'ECANCELLED'});a.reject(error);aaaa.reject(error)};
  const cancel=vi.fn(()=>{if(autoCancel)acknowledge()});
  sessions.push({a,aaaa,cancel,acknowledge,active:()=>active});
  const query=(value:ReturnType<typeof deferred<string[]>>)=>{active++;return value.promise.finally(()=>{active--})};
  return {resolve4:()=>query(a),resolve6:()=>query(aaaa),cancel};
 });
 return {factory,sessions};
}
const finish=(session:ReturnType<typeof controlled>['sessions'][number],address:string)=>{session.a.resolve([address]);session.aaaa.reject(noData())};
afterEach(()=>vi.useRealTimers());

it('全量A和AAAA拒混合私网、IPv6和保留地址；正常固定IPv4且TLS保持原域',async()=>{
 for(const addresses of [
  [{address:'8.8.8.8',family:4},{address:'127.0.0.1',family:4}],
  [{address:'8.8.8.8',family:4},{address:'2001:4860:4860::8888',family:6}],
  [{address:'192.88.99.1',family:4}],[],
 ] as Address[][]){
  const f=fixture(),t=createPinnedMediaTransport({hosts:[host],resolver:resolverFor(addresses),request:f.wire});
  await expect(t.resolve(host)).rejects.toThrow('media_transport_rejected');expect(f.calls).toHaveLength(0);
 }
 const f=fixture(),factory=vi.fn(resolverFor([{address:'8.8.8.8',family:4}]));
 const t=createPinnedMediaTransport({hosts:[host],resolver:factory,request:f.wire});
 const [pin]=await t.resolve(host);expect((await t.request(url,pin)).status).toBe(200);
 expect(f.calls[0]).toMatchObject({hostname:'8.8.8.8',servername:host,rejectUnauthorized:true,agent:false,headers:{Host:host,'Accept-Encoding':'identity'}});
 expect(f.calls[0].headers).not.toHaveProperty('Authorization');expect(f.calls[0].headers).not.toHaveProperty('Cookie');expect(factory).toHaveBeenCalledOnce();
});

it('拒重定向、压缩、超流和未经验证pin；Bearer不能交给下载域或未知路径',async()=>{
 for(const f of [fixture([],{},302),fixture([],{'content-encoding':'gzip'}),fixture([Buffer.alloc(17*1024*1024)])]){
  const t=createPinnedMediaTransport({hosts:[host],resolver:resolverFor([{address:'8.8.8.8',family:4}]),request:f.wire});
  const [pin]=await t.resolve(host);await expect(t.request(url,pin)).rejects.toThrow();
 }
 const f=fixture(),http=createPinnedImageHttp({resolver:resolverFor([{address:'8.8.8.8',family:4}]),request:f.wire});
 await expect(http({...imageRequest,url:'https://results.example.com/a',method:'GET'})).rejects.toThrow();
 await expect(http({...imageRequest,url:'https://api.router.team/config',method:'GET'})).rejects.toThrow();expect(f.calls).toHaveLength(0);
});

it('两次合法POST并发、反向完成和串行均恰一次连接各自pin',async()=>{
 for(const order of [[0,1],[1,0]]){
  const d=controlled(),f=fixture(),http=createPinnedImageHttp({resolver:d.factory,request:f.wire});
  const pending=[http(imageRequest),http(imageRequest)];
  const addresses=['8.8.8.8','1.1.1.1'];for(const i of order)finish(d.sessions[i],addresses[i]);
  expect((await Promise.all(pending)).map(r=>r.status)).toEqual([200,200]);
  expect(f.calls.map(c=>c.hostname).sort()).toEqual([...addresses].sort());
  expect(f.calls.every(c=>c.method==='POST'&&(c.headers as Record<string,string>).Authorization==='Bearer local-only')).toBe(true);
  const third=http(imageRequest);finish(d.sessions[2],'9.9.9.9');await third;
  expect(f.calls).toHaveLength(3);expect(f.calls[2].hostname).toBe('9.9.9.9');
 }
});

it('并发下载及旧解析凭据不被新解析撤销；原对象不可篡改且伪造、跨域、跨实例拒绝',async()=>{
 const d=controlled(),f=fixture(),t=createPinnedMediaTransport({hosts:[host,'other.example.com'],resolver:d.factory,request:f.wire});
 const one=t.resolve(host),two=t.resolve(host);finish(d.sessions[1],'1.1.1.1');finish(d.sessions[0],'8.8.8.8');
 const [[a],[b]]=await Promise.all([one,two]);await Promise.all([t.request(url,a),t.request(url,b)]);
 const third=t.resolve(host);finish(d.sessions[2],'9.9.9.9');await third;await t.request(url,a);
 expect(f.calls.map(c=>c.hostname)).toEqual(['8.8.8.8','1.1.1.1','8.8.8.8']);
 expect(Object.isFrozen(a)).toBe(true);expect(Reflect.set(a,'address','9.9.9.9')).toBe(false);
 const other=createPinnedMediaTransport({hosts:[host],resolver:resolverFor([{address:'8.8.8.8',family:4}]),request:f.wire});
 for(const forged of [{...a},{address:'9.9.9.9',family:4 as const},new Proxy(a,{})])await expect(t.request(url,forged)).rejects.toThrow();
 await expect(t.request(new URL('https://other.example.com/image'),a)).rejects.toThrow();
 await expect(other.request(url,a)).rejects.toThrow();expect(f.calls).toHaveLength(3);
});

it('慢DNS超时取消两条查询且等待settled，HTTPS为0，清timer后可正常重用容量',async()=>{
 vi.useFakeTimers();const d=controlled(),f=fixture(),http=createPinnedImageHttp({resolver:d.factory,maxDnsConcurrent:1,request:f.wire});
 const pending=http(imageRequest),assertion=expect(pending).rejects.toThrow('media_transport_rejected');
 expect(d.sessions[0].active()).toBe(2);await vi.advanceTimersByTimeAsync(3001);await assertion;
 expect(d.sessions[0].active()).toBe(0);expect(d.sessions[0].cancel).toHaveBeenCalledOnce();expect(f.calls).toHaveLength(0);expect(vi.getTimerCount()).toBe(0);
 finish(d.sessions[0],'8.8.8.8');await Promise.resolve();expect(f.calls).toHaveLength(0);
 const next=http(imageRequest);finish(d.sessions[1],'1.1.1.1');await next;expect(f.calls).toHaveLength(1);
 console.log('DNS超时资源证据',JSON.stringify({active:d.sessions[0].active(),cancel:d.sessions[0].cancel.mock.calls.length,timers:vi.getTimerCount(),lateHttps:0}));
});

it('取消确认尚未settled时不释放名额、不排队；容量拒绝不创建新resolver',async()=>{
 vi.useFakeTimers();const d=controlled(false),f=fixture(),t=createPinnedMediaTransport({hosts:[host],resolver:d.factory,maxDnsConcurrent:1,request:f.wire});
 let settled=false;const first=t.resolve(host);const assertion=expect(first).rejects.toThrow();void first.catch(()=>{settled=true});
 await vi.advanceTimersByTimeAsync(3001);expect(settled).toBe(false);expect(d.sessions[0].active()).toBe(2);
 await expect(t.resolve(host)).rejects.toThrow();expect(d.factory).toHaveBeenCalledOnce();expect(f.calls).toHaveLength(0);
 d.sessions[0].acknowledge();await assertion;expect(d.sessions[0].active()).toBe(0);expect(vi.getTimerCount()).toBe(0);
 const next=t.resolve(host);finish(d.sessions[1],'8.8.8.8');await next;expect(d.sessions[1].cancel).toHaveBeenCalledOnce();
});

it('每wire及跨实例全局容量均有界，拒绝无队列；取消一个不影响另一个',async()=>{
 vi.useFakeTimers();const d=controlled(),f=fixture(),t=createPinnedMediaTransport({hosts:[host],resolver:d.factory,maxDnsConcurrent:2,request:f.wire});
 const one=t.resolve(host),assertion=expect(one).rejects.toThrow();
 await vi.advanceTimersByTimeAsync(1000);const two=t.resolve(host);
 await expect(t.resolve(host)).rejects.toThrow();expect(d.sessions).toHaveLength(2);
 await vi.advanceTimersByTimeAsync(2001);await assertion;
 expect(d.sessions[0].cancel).toHaveBeenCalledOnce();expect(d.sessions[1].cancel).not.toHaveBeenCalled();expect(d.sessions[1].active()).toBe(2);
 finish(d.sessions[1],'1.1.1.1');const [pin]=await two;await t.request(url,pin);
 expect(d.sessions[1].cancel).toHaveBeenCalledOnce();expect(d.sessions[1].active()).toBe(0);
 const many=controlled();const transports=Array.from({length:9},()=>createPinnedMediaTransport({hosts:[host],resolver:many.factory,request:f.wire}));
 const queries=transports.slice(0,8).map(x=>x.resolve(host));
 await expect(transports[8].resolve(host)).rejects.toThrow();expect(many.sessions).toHaveLength(8);
 many.sessions.forEach(s=>finish(s,'8.8.8.8'));await Promise.all(queries);expect(vi.getTimerCount()).toBe(0);
});

it('只有ENODATA为空；DNS错误、同步错误、工厂错误都去密清理且不发送HTTPS',async()=>{
 vi.useFakeTimers();const f=fixture();
 for(const code of ['ENOTFOUND','ETIMEOUT','ECANCELLED','SERVFAIL']){
  const cancel=vi.fn(),resolve4=vi.fn(async()=>['8.8.8.8']),resolve6=vi.fn(async()=>{throw Object.assign(new Error('不得泄漏密钥或正文'),{code})});
  const t=createPinnedMediaTransport({hosts:[host],resolver:()=>({resolve4,resolve6,cancel}),request:f.wire});
  await expect(t.resolve(host)).rejects.toThrow(/^media_transport_rejected$/);expect(resolve4).toHaveBeenCalledWith(host);expect(resolve6).toHaveBeenCalledWith(host);expect(cancel).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
 }
 const cancel=vi.fn(),factory=vi.fn()
  .mockImplementationOnce(()=>{throw new Error('工厂失败')})
  .mockImplementationOnce(()=>({resolve4:()=>{throw new Error('同步失败')},resolve6:async()=>[],cancel}))
  .mockImplementation(resolverFor([{address:'8.8.8.8',family:4}]));
 const t=createPinnedMediaTransport({hosts:[host],resolver:factory,maxDnsConcurrent:1,request:f.wire});
 await expect(t.resolve(host)).rejects.toThrow();await expect(t.resolve(host)).rejects.toThrow();expect(cancel).toHaveBeenCalledOnce();expect(await t.resolve(host)).toHaveLength(1);
 expect(f.calls).toHaveLength(0);expect(vi.getTimerCount()).toBe(0);
});

import {createPinnedVideoHttp} from './media-pinned-transport';
it('视频HTTP固定POST/原ID带唯一model查询；拒额外query且仍用同一pin机制',async()=>{
 const f=fixture(),http=createPinnedVideoHttp({resolver:resolverFor([{address:'8.8.8.8',family:4}]),request:f.wire});
 const base='https://api.router.team/api/public/creative-center/videos';
 await http({...imageRequest,url:base});await http({...imageRequest,method:'GET',body:undefined,url:base+'/a%2Fb%3Fc?model=grok-imagine-video-1.5'});
 expect(f.calls).toHaveLength(2);expect(f.calls[1]).toMatchObject({hostname:'8.8.8.8',servername:'api.router.team',path:'/api/public/creative-center/videos/a%2Fb%3Fc?model=grok-imagine-video-1.5'});
 for(const value of [base+'?model=grok-imagine-video-1.5',base+'/a',base+'/a?model=other',base+'/a?model=grok-imagine-video-1.5&x=1',base+'/a?model=grok-imagine-video-1.5&model=grok-imagine-video-1.5'])await expect(http({...imageRequest,method:'GET',url:value})).rejects.toThrow();expect(f.calls).toHaveLength(2);
});
it('视频wire实际放行超过16MiB且64MiB仍封顶，图片默认16MiB不变',async()=>{
 const chunks=[Buffer.alloc(17*1024*1024)],f=fixture(chunks,{'content-type':'video/mp4'}),t=createPinnedMediaTransport({hosts:[host],resolver:resolverFor([{address:'8.8.8.8',family:4}]),request:f.wire});const [pin]=await t.resolve(host);
 const result=await t.request(url,pin,64*1024*1024);let size=0;for await(const b of result.body)size+=b.length;expect(size).toBe(17*1024*1024);await expect(t.request(url,pin)).rejects.toThrow();await expect(t.request(url,pin,64*1024*1024+1)).rejects.toThrow();
 const tooLarge=fixture([],{ 'content-length':String(64*1024*1024+1)}),limited=createPinnedMediaTransport({hosts:[host],resolver:resolverFor([{address:'8.8.8.8',family:4}]),request:tooLarge.wire});const [p]=await limited.resolve(host);await expect(limited.request(url,p,64*1024*1024)).rejects.toThrow();
});
