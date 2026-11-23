import assert from 'node:assert/strict';
import net from 'node:net';
import tls from 'node:tls';
import {Duplex} from 'node:stream';
import {syncBuiltinESMExports} from 'node:module';
import {setTimeout as delay} from 'node:timers/promises';
import {sql} from 'drizzle-orm';
const mode=process.argv[2];
const trace:Record<string,unknown>[]=[];
const sockets:MemorySocket[]=[];let phase='none',syntheticSecureEvents=0;
class MemorySocket extends Duplex {
 host='';port=0;
 constructor(){super();sockets.push(this)}
 connect(){phase='tcp';if(mode!=='tcp')queueMicrotask(()=>this.emit('connect'));return this}
 _read(){}
 _write(bytes:Buffer,_encoding:unknown,cb:()=>void){
  if(bytes.equals(Buffer.from([0,0,0,8,4,210,22,47]))){phase='ssl';if(mode!=='ssl')queueMicrotask(()=>this.push(Buffer.from(mode==='reject'?'N':'S')))}
  else {phase='tls';if(mode==='failure')queueMicrotask(()=>this.push(Buffer.from('invalid TLS record')))}
  cb();
 }
 _destroy(error:Error|null,callback:(error?:Error|null)=>void){trace.push({event:'raw-destroy',error:error?.message??null});if(mode.startsWith('handoff-'))setTimeout(()=>{trace.push({event:'raw-destroy-complete',tlsErrorListeners:tlsSockets.at(-1)?.listenerCount('error')});callback(error)},20);else callback(error)}
 setKeepAlive(){return this}
}
const original=net.Socket,originalTls=tls.connect;
const tlsSockets:tls.TLSSocket[]=[];
Object.assign(tls,{connect:(options:tls.ConnectionOptions)=>{
 assert.equal(options.rejectUnauthorized,true);assert.equal(options.servername,'db.fixture.supabase.co');assert(options.ca);assert.equal(options.checkServerIdentity,tls.checkServerIdentity);
 const socket=originalTls(options);tlsSockets.push(socket);
 const remove=socket.removeAllListeners;socket.removeAllListeners=function(event?:string|symbol){trace.push({event:'tls-remove-listeners',type:event??'all',rawClosed:sockets.at(-1)?.closed});return event===undefined?remove.call(this):remove.call(this,event)};
 // 只在重试用例注入驱动交接里程碑；保留真实TLS包装，不声称握手/证书已通过。
 if(['retry','handoff-close','handoff-abort'].includes(mode))setTimeout(()=>{syntheticSecureEvents++;socket.emit('secureConnect');if(mode==='retry'&&tlsSockets.length===1)setTimeout(()=>socket.destroy(),5)},5);
 return socket;
}});
function SocketFactory(this:unknown,...args:unknown[]){if(this instanceof tls.TLSSocket)return (original as unknown as (...args:unknown[])=>unknown).apply(this,args);return new MemorySocket()}
SocketFactory.prototype=original.prototype;
Object.assign(net,{Socket:SocketFactory});syncBuiltinESMExports();
process.on('uncaughtExceptionMonitor',error=>console.error(JSON.stringify({uncaught:error.message,trace})));
try {
 const {createMediaStepDatabase}=await import('./media-step-database.ts');
 const {createMediaStepHandler,MEDIA_STEP_DEADLINE_MS}=await import('./media-step.ts');
 const controller=new AbortController();
 const scoped=createMediaStepDatabase(controller.signal,'postgresql://fixture:synthetic@db.fixture.supabase.co:5432/postgres?sslmode=verify-full');
 if(mode==='unused'){await scoped.close();assert.equal(sockets.length,0);await assert.rejects(scoped.database.execute(sql`SELECT 1`));}
 else if(mode==='deadline'){
  const nativeTimer=globalThis.setTimeout;
  globalThis.setTimeout=((fn:()=>void,ms:number,...args:unknown[])=>nativeTimer(fn,ms===MEDIA_STEP_DEADLINE_MS?50:ms,...args)) as typeof setTimeout;
  try {
   let finished=false;
   const handler=createMediaStepHandler({secret:()=> 'a'.repeat(64),enabled:()=>true,tick:async signal=>{
    const db=createMediaStepDatabase(signal,'postgresql://fixture:synthetic@db.fixture.supabase.co:5432/postgres');
    try{await db.database.execute(sql`SELECT 1`);return {processed:false}}finally{await db.close();finished=true}
   }});
   const response=await handler(new Request('https://fixture/api/internal/media/step',{method:'POST',headers:{authorization:`Bearer ${'a'.repeat(64)}`}}));
   assert.equal(response.status,503);assert.equal((await response.json()).code,'media_step_aborted');assert(finished);await scoped.close();
  }finally{globalThis.setTimeout=nativeTimer}
 } else {
  let settled=false;
  const work=scoped.database.execute(sql`SELECT 1`).then(()=>{throw Error('不应成功')},()=>{settled=true});
  const target=mode==='tcp'?'tcp':mode==='ssl'||mode==='reject'?'ssl':'tls';
  for(let i=0;i<100&&phase!==target;i++)await delay(2);
  assert.equal(phase,target);
  if(mode.startsWith('handoff-')){for(let i=0;i<100&&syntheticSecureEvents===0;i++)await delay(2);assert.equal(syntheticSecureEvents,1);await delay(5)}
  if(mode==='retry'){
   for(let i=0;i<100&&sockets.length<2;i++)await delay(2);
   assert.equal(sockets.length,2,'真实驱动初始关闭应走重连路径');
  }
  if(mode==='normal'){await delay(25);assert(!controller.signal.aborted);assert(sockets.every(s=>!s.destroyed));assert(!settled)}
  if(mode==='handoff-close'){const closing=scoped.close();assert.equal(scoped.close(),closing);await closing}
  else if(mode!=='failure'&&mode!=='reject')controller.abort();
  await work;await scoped.close();assert(settled);assert(sockets.length>0);
 }
 assert(sockets.every(s=>s.destroyed&&s.closed));assert(tlsSockets.every(s=>s.destroyed&&s.closed));
 if(mode.startsWith('handoff-')){assert(trace.some(e=>e.event==='raw-destroy-complete'));assert(trace.filter(e=>e.event==='raw-destroy').every(e=>e.error===null),'正常及取消收尾均不得主动制造raw错误')}

 const count=sockets.length;await delay(25);assert.equal(sockets.length,count);
 console.log(JSON.stringify({mode,phase,sockets:sockets.length,tlsHandles:tlsSockets.length,syntheticSecureEvents,trace,allClosed:true,actualPostgres:true,actualNodeTls:true,networkConnections:0,realDatabase:false,certificateVerified:false}));
}finally{Object.assign(net,{Socket:original});Object.assign(tls,{connect:originalTls});syncBuiltinESMExports()}
