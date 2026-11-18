import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';
import {Socket} from 'node:net';
import {connect as connectTls,checkServerIdentity} from 'node:tls';
import {sql} from 'drizzle-orm';
import supabaseCa from '@/db/supabase-ca.json';
import type {MediaDatabase} from './media-contracts';

/** 独占请求连接；工厂拥有TCP和TLS生命周期，驱动仅接收已严格验证的TLS流。 */
export function createMediaStepDatabase(signal:AbortSignal,value=process.env.DATABASE_URL??''){
 signal.throwIfAborted();
 const url=new URL(value);
 if(!['postgres:','postgresql:'].includes(url.protocol))throw Error('media_database_unconfigured');
 const handles:{socket:Socket;closed:Promise<void>}[]=[];
 const owners=new Set<Socket>();
 const factories=new Set<Promise<unknown>>(),work=new Set<Promise<unknown>>();
 let stopping=false,closing:Promise<void>|undefined;
 const assertOpen=()=>{signal.throwIfAborted();if(stopping)throw Error('media_database_closed')};
 const own=<T extends Socket>(socket:T,parent?:Socket)=>{
  // 仅顶层流拥有主动销毁权；父子流均保留独立真实close等待，不能互相代偿。
  if(parent)owners.delete(parent);owners.add(socket);
  socket.on('error',()=>{/* 等待器和驱动传播错误；所有权监听覆盖交接间隙，避免未处理error。 */});
  const closed=new Promise<void>(resolve=>socket.once('close',()=>{owners.delete(socket);resolve()}));
  handles.push({socket,closed});return socket;
 };
 const track=<T>(pending:Set<Promise<unknown>>,promise:Promise<T>)=>{
  pending.add(promise);void promise.then(()=>pending.delete(promise),()=>pending.delete(promise));return promise;
 };
 const createSocket=async()=>{
  assertOpen();
  const raw=own(Object.assign(new Socket(),{host:url.hostname,port:Number(url.port||5432)}));
  let transport:Socket=raw;
  // 覆盖TCP、SSLRequest和握手的总期限，而非只在驱动收到连接后才起计。
  const timer=setTimeout(()=>transport.destroy(Error('media_database_connect_timeout')),5000);
  const wait=(socket:Socket,event:'connect'|'secureConnect'|'data',start:()=>void)=>new Promise<unknown>((resolve,reject)=>{
   const cleanup=()=>{socket.removeListener(event,ready);socket.removeListener('error',failed);socket.removeListener('close',closed)};
   const ready=(data:unknown)=>{cleanup();resolve(data)},failed=()=>{cleanup();reject(Error('media_database_unavailable'))},closed=()=>{cleanup();reject(Error('media_database_closed'))};
   socket.once(event,ready);socket.once('error',failed);socket.once('close',closed);
   try{assertOpen();if(socket.destroyed)throw Error('media_database_closed');start()}catch(error){cleanup();reject(error)}
  });
  try{
   await wait(raw,'connect',()=>{raw.connect(raw.port,raw.host)});
   const response=await wait(raw,'data',()=>{raw.write(Buffer.from([0,0,0,8,4,210,22,47]))});
   if(!Buffer.isBuffer(response)||response.length!==1||response[0]!==83)throw Error('media_database_tls_required');
   assertOpen();
   transport=own(connectTls({socket:raw,ca:supabaseCa.certificate,rejectUnauthorized:true,servername:url.hostname,checkServerIdentity}),raw);
   await wait(transport,'secureConnect',()=>{});
   assertOpen();if(transport.destroyed)throw Error('media_database_closed');return transport;
  }catch(error){
   transport.destroy();
   throw error;
  }finally{clearTimeout(timer)}
 };
 const options:postgres.Options<Record<string,postgres.PostgresType>>&{socket:()=>Promise<Socket>}={
  max:1,prepare:false,connect_timeout:5,debug:false,onnotice:()=>{},
  // TLS已由独占工厂强制完成；禁止驱动再次SSLRequest/升级并移除raw生命周期监听。
  ssl:false,socket:()=>track(factories,createSocket())
 };
 const client=postgres(value,options),db=drizzle(client);
 const close=()=>{
  if(closing)return closing;
  // 同步关门，阻止驱动已排队的初始重试创建新handle。
  stopping=true;signal.removeEventListener('abort',abort);
  closing=(async()=>{
   const ended=client.end({timeout:0});
   // 驱动end拒绝待决查询；只销毁顶层owner，不制造父流晚到error。
   for(const socket of owners)socket.destroy();
   await ended;
   await Promise.allSettled([...factories,...work]);
   await Promise.all(handles.map(h=>h.closed));
  })();
  return closing;
 };
 const abort=()=>{void close().catch(()=>{/* 调用方finally等待同一关闭Promise并接收错误。 */})};
 signal.addEventListener('abort',abort,{once:true});
 const database:MediaDatabase={
  execute:query=>database.transaction(tx=>tx.execute(query)),
  transaction(fn){
   // 保持异步拒绝合同；同时跟踪驱动事务和用户回调，避免驱动内部race遗留工作。
   const operation=(async()=>{
    assertOpen();return db.transaction(tx=>track(work,(async()=>{
     await tx.execute(sql`SET LOCAL statement_timeout='5s'`);
     await tx.execute(sql`SET LOCAL lock_timeout='2s'`);
     assertOpen();return fn({execute:async q=>{assertOpen();const rows=Array.from(await tx.execute(q));assertOpen();return rows}});
    })()));
   })();
   return track(work,operation);
  }
 };
 return {database,close};
}
