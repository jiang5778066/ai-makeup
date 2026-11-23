// @vitest-environment node
import {expect,it,vi} from 'vitest';
const observed=vi.hoisted(()=>({socketClosed:false,end:vi.fn(async()=>{}),options:null as Record<string,unknown>|null}));
vi.mock('node:net',async()=>{const {EventEmitter}=await import('node:events');return {Socket:class extends EventEmitter {destroy(){queueMicrotask(()=>{observed.socketClosed=true;this.emit('close')});return this}connect(){return this}}}});
vi.mock('postgres',()=>({default:(_url:string,options:Record<string,unknown>)=>{observed.options=options;return {end:observed.end}}}));
vi.mock('drizzle-orm/postgres-js',()=>({drizzle:()=>({execute:async()=>[],transaction:async(fn:(tx:{execute:()=>Promise<never[]>})=>Promise<unknown>)=>fn({execute:async()=>[]})})}));
import {createMediaStepDatabase} from './media-step-database';
it('每次step独占数据库连接，不共用无限pool队列；abort关闭并在返回前await',async()=>{const c=new AbortController(),s=createMediaStepDatabase(c.signal,'postgres://fixture:fixture@db.fixture.supabase.co:5432/postgres');c.abort();await s.close();expect(observed.end).toHaveBeenCalledWith({timeout:0});expect(observed.options).toMatchObject({max:1,prepare:false,connect_timeout:5,debug:false,ssl:false});expect(observed.options!.socket).toBeTypeOf('function')});

it('连接建立前abort也销毁独占socket，等待关闭及连接Promise拒绝',async()=>{observed.socketClosed=false;const c=new AbortController(),s=createMediaStepDatabase(c.signal,'postgres://fixture:fixture@db.fixture.supabase.co:5432/postgres');const socket=(observed.options!.socket as ()=>Promise<unknown>)();const rejected=expect(socket).rejects.toThrow('media_database_closed');c.abort();await s.close();await rejected;expect(observed.socketClosed).toBe(true)});

it('关闭等待仍在运行的事务回调，并复用同一关闭Promise',async()=>{
 let release!:()=>void,started!:()=>void;
 const ready=new Promise<void>(resolve=>{started=resolve}),gate=new Promise<void>(resolve=>{release=resolve});
 const scoped=createMediaStepDatabase(new AbortController().signal,'postgres://fixture:fixture@db.fixture.supabase.co/postgres');
 const query=scoped.database.transaction(async()=>{started();await gate;return 7});
 await ready;
 const closing=scoped.close();expect(scoped.close()).toBe(closing);
 let finished=false;void closing.then(()=>{finished=true});
 await Promise.resolve();await Promise.resolve();expect(finished).toBe(false);
 release();expect(await query).toBe(7);await closing;expect(finished).toBe(true);
});
