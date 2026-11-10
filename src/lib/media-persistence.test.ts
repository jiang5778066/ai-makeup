import { spawn,execFileSync } from 'node:child_process';
import { readFileSync,appendFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PgDialect } from 'drizzle-orm/pg-core';
import { sql, type SQL } from 'drizzle-orm';
import { describe,it,expect,vi } from 'vitest';
import * as persistence from './media-persistence';
import type { MediaDatabase,MediaExecutor } from './media-contracts';
const report=process.env.MEDIA_SQL_REPORT??'docs/orca-delivery/trials/20261103-lanta-platform-replica/e1/rework-01/sql';
const enabled=process.env.MEDIA_SQL_ISOLATED==='1';
const sqlIt=enabled?it:it.skip;
const service=enabled?JSON.parse(readFileSync(`${report}/services.json`,'utf8')):{containerId:''};
const inspect=enabled?JSON.parse(execFileSync('docker',['inspect',service.containerId],{encoding:'utf8'}))[0]:null;
if(enabled&&(inspect.Config.Labels['orca.task']!==process.env.MEDIA_SQL_TASK||inspect.Config.Labels['orca.run']!=='run_5a70c332d746'||inspect.HostConfig.NetworkMode!=='none'||inspect.HostConfig.Binds?.length||Object.keys(inspect.HostConfig.PortBindings??{}).length))throw Error('隔离库身份不符');
const dialect=new PgDialect();
const literal=(v:unknown):string=>v===null?'NULL':typeof v==='number'?String(v):typeof v==='boolean'?String(v):`'${String(v instanceof Date?v.toISOString():v).replaceAll("'","''")}'`;
class Session implements MediaExecutor {
 child=spawn('docker',['exec','-i',service.containerId,'psql','-XqAt','-v','ON_ERROR_STOP=1','-U','postgres','-d',service.database??'e1']);
 buffer='';output:string[]=[];error='';closed=false;pending:{id:string;resolve:(v:string)=>void;reject:(e:Error)=>void}|null=null;
 constructor(){this.child.stdout.on('data',b=>{this.buffer+=String(b);let end;while((end=this.buffer.indexOf('\n'))>=0){const line=this.buffer.slice(0,end);this.buffer=this.buffer.slice(end+1);if(this.pending&&line===this.pending.id){const p=this.pending;this.pending=null;const value=this.output.join('\n');this.output=[];p.resolve(value)}else this.output.push(line)}});this.child.stderr.on('data',b=>{this.error+=String(b)});this.child.on('close',()=>{this.closed=true;this.pending?.reject(new Error(this.error||'SQL会话关闭'))})}
 async command(text:string){if(this.closed||this.pending)throw Error('SQL会话不可用');const id=`END_${randomUUID()}`;appendFileSync(`${report}/actual-queries.log`,`${text}\n`);return new Promise<string>((resolve,reject)=>{const timer=setTimeout(()=>{this.child.kill();reject(new Error('隔离SQL超过12秒'))},12000);this.pending={id,resolve:v=>{clearTimeout(timer);resolve(v)},reject:e=>{clearTimeout(timer);reject(e)}};this.child.stdin.write(`${text}\n\\echo ${id}\n`)})}
 async execute(query:SQL){const c=dialect.sqlToQuery(query);const text=c.sql.replace(/\$(\d+)/g,(_s,n)=>literal(c.params[Number(n)-1]));const answer=await this.command(`WITH media_bridge_rows AS (${text}) SELECT coalesce(json_agg(media_bridge_rows),'[]') FROM media_bridge_rows;`);return JSON.parse(answer.trim()) as Record<string,unknown>[]}
 close(){this.child.stdin.end()}
}
const database:MediaDatabase={
 async execute(q){const s=new Session();try{return await s.execute(q)}finally{s.close()}},
 async transaction(fn){const s=new Session();try{await s.command('BEGIN;');const r=await fn(s);await s.command('COMMIT;');return r}catch(e){if(!s.closed)await s.command('ROLLBACK;').catch(()=>{});throw e}finally{s.close()}}
};
describe.runIf(enabled)('真实隔离Postgres媒体持久化',()=>{
 sqlIt('0003建立独立媒体表且保留两个0002与美妆非空约束',async()=>{
  const [row]=await database.execute(sql`select to_regclass('public.media_tasks') is not null as present`);expect(row.present).toBe(true);
  const [old]=await database.execute(sql`select is_nullable from information_schema.columns where table_name='generations' and column_name='upload_key'`);expect(old.is_nullable).toBe('NO');
 });
});

sqlIt('媒体实现提供原子预留和恢复仓储',()=>{expect(persistence.createMediaStore).toBeTypeOf('function')});
import {normalizeMediaRequest} from './media-catalog';
import {canonicalHash} from './media-quotes';
import {createMediaProcessor} from '../inngest/media-functions';
import type {MediaProvider} from './media-provider';
import type {MediaResultStorage} from './media-storage';
const store=persistence.createMediaStore(database);
const request=()=>normalizeMediaRequest({clientIntentId:randomUUID(),mediaType:'image',model:'gpt-image-2',mode:'text_to_image',prompt:'合成隔离图片',parameters:{quality:'1k',size:'2:3',n:1},inputIds:[],locale:'zh-CN',consent:true,consentVersion:'media-v1'});
async function seed(amount=20){const user=randomUUID();await database.transaction(async tx=>{await tx.execute(sql`INSERT INTO auth.users(id) VALUES(${user}) RETURNING id`);await tx.execute(sql`INSERT INTO credit_balances(user_id,balance) VALUES(${user},${amount}) RETURNING user_id`);await tx.execute(sql`INSERT INTO credit_grants(user_id,source_type,source_id,initial_amount,remaining) VALUES(${user},'synthetic',${user},${amount},${amount}) RETURNING id`);await tx.execute(sql`INSERT INTO credits_ledger(user_id,delta,reason,ref_type,ref_id) VALUES(${user},${amount},'admin_adjust','synthetic',${user}) RETURNING id`)});return user}
async function create(user:string,r=request(),key=randomUUID()) {const hash=canonicalHash(r);return store.create(user,key,r,hash,{version:1,quoteId:randomUUID(),userId:user,payloadHash:hash,expiresAt:Date.now()+300000,tariffVersion:'synthetic-only',credits:3,providerUpperCents:7,budgetApprovalRef:'isolated-test',dailyCapCents:1000000,providerAccountRef:'synthetic'})}
const storage:MediaResultStorage={async store(t){return {key:`media/${t.user_id}/${t.id}`,mime:'image/png',bytes:10,sha256:'a'.repeat(64)}},async sign(){throw Error('不签公网')},async signInput(){throw Error('不取公网')}};
sqlIt('同意图并发和换key重放只有一行一次扣费，变payload409，跨用户同空',async()=>{
 const u=await seed(),r=request(),key=randomUUID();
 const results=await Promise.all([create(u,r,key),create(u,r,key),create(u,r,randomUUID())]);
 expect(new Set(results.map(x=>x.task.id)).size).toBe(1);expect(results.filter(x=>!x.replayed)).toHaveLength(1);
 await expect(create(u,{...r,prompt:'变化'},key)).rejects.toThrow('idempotency_conflict');
 expect(await store.read(await seed(),results[0].task.id)).toBeNull();
 const [balance]=await database.execute(sql`SELECT balance FROM credit_balances WHERE user_id=${u}`);expect(balance.balance).toBe(17);
 const [ledger]=await database.execute(sql`SELECT count(*)::int AS count FROM credits_ledger WHERE user_id=${u} AND ref_type='media_task'`);expect(ledger.count).toBe(1);
});
sqlIt('接受响应丢失、进程重启和重复事件不再POST不退款，已知原ID只查原ID',async()=>{
 const u=await seed(),{task}=await create(u);let posts=0,queries=0;
 const provider:MediaProvider={modes:['text_to_image'],async submit(){posts++;throw Error('响应丢失')},async query(){queries++;return {kind:'unknown'}}};
 const process=createMediaProcessor(store,{get:()=>provider},storage);
 await Promise.all([process(task.id),process(task.id)]);await createMediaProcessor(store,{get:()=>provider},storage)(task.id);
 const unknown=await store.get(task.id);expect(posts).toBe(1);expect(queries).toBe(0);expect(unknown?.status).toBe('reconciling');expect(unknown?.credit_state).toBe('reserved');
 const [b]=await database.execute(sql`SELECT balance FROM credit_balances WHERE user_id=${u}`);expect(b.balance).toBe(17);
});
sqlIt('正常成功与存储故障只重存原结果，重复失败与晚成功不能双退或覆盖',async()=>{
 const u=await seed(),{task}=await create(u);let posts=0,stores=0,queries=0;
 const p:MediaProvider={modes:['text_to_image'],async submit(){posts++;return {kind:'complete',taskId:'original-'+task.id,locator:'https://trusted.invalid/result'}},async query(){queries++;return {kind:'unknown'}}};
 const s={...storage,async store(t:Parameters<MediaResultStorage['store']>[0]){if(++stores===1)throw Error('暂时存储失败');return storage.store(t)}};
 const process=createMediaProcessor(store,{get:()=>p},s);await process(task.id);expect((await store.get(task.id))?.reconcile_stage).toBe('storage');await process(task.id);await process(task.id);
 expect((await store.get(task.id))?.status).toBe('done');expect(posts).toBe(1);expect(stores).toBe(2);expect(queries).toBe(0);
 const {task:other}=await create(u);const claim=await store.claim(other.id);expect(claim?.submit).toBe(true);
 await Promise.all([store.fail(claim!.task,'provider_failed'),store.fail(claim!.task,'provider_failed')]);
 expect(await store.complete(claim!.task,{key:'late',mime:'image/png',bytes:1,sha256:'a'.repeat(64)})).toBeNull();
 expect((await store.get(other.id))?.status).toBe('refunded');
 const [b]=await database.execute(sql`SELECT balance FROM credit_balances WHERE user_id=${u}`);expect(b.balance).toBe(17);
 const [counts]=await database.execute(sql`SELECT count(*) FILTER(WHERE reason='generation')::int AS debits,count(*) FILTER(WHERE reason='refund')::int AS refunds FROM credits_ledger WHERE ref_type='media_task' AND user_id=${u}`);expect(counts).toEqual({debits:2,refunds:1});
});
sqlIt('额度不足整体回滚任务、budget、lot和ledger，恢复扫描有界排他',async()=>{
 const u=await seed(1);const [before]=await database.execute(sql`SELECT coalesce(sum(reserved_cents),0)::int AS amount FROM ai_daily_usage`);
 await expect(create(u)).rejects.toThrow('insufficient_credits');
 const [after]=await database.execute(sql`SELECT coalesce(sum(reserved_cents),0)::int AS amount FROM ai_daily_usage`);expect(after).toEqual(before);
 const [count]=await database.execute(sql`SELECT count(*)::int AS count FROM media_tasks WHERE user_id=${u}`);expect(count.count).toBe(0);
 const [a,b]=await Promise.all([store.due(2),store.due(2)]);expect(a.length).toBeLessThanOrEqual(2);expect(b.length).toBeLessThanOrEqual(2);expect(a.some(x=>b.some(y=>x.id===y.id))).toBe(false);
});
import {createHash} from 'node:crypto';
import {createMediaInputs} from './media-inputs';
import {createUnifiedCreationSource} from './media-creations-source';
import {parseCreationQuery,encodeCreationCursor} from './platform-creations-query';
import {createMediaHandlers} from './media-tasks';
import {createQuoteSigner} from './media-quotes';
import {createMediaOperations} from './media-operations';
import type {MediaCatalog} from './media-catalog';
sqlIt('真实输入封存后晚PUT不污染，跨用户不可签名，摘要不符拒绝',async()=>{
 const user=await seed(),other=await seed(),png=Buffer.alloc(24);Buffer.from([137,80,78,71,13,10,26,10]).copy(png);png.write('IHDR',12);const sha=createHash('sha256').update(png).digest('hex');
 const objects=new Map<string,Buffer>();let stage='';
 const inputs=createMediaInputs(store,{async read(key){async function* body(){yield objects.get(key)!}return body()},async putImmutable(key,bytes){if(objects.has(key))throw Error('重复覆写');objects.set(key,Buffer.from(bytes))},async signPut(key){stage=key;return 'https://synthetic.invalid/put'},async signGet(){throw Error('不签公网')}},async()=>({mime:'image/png',width:1,height:1,frames:1}));
 const created=await inputs.create(user,{contentType:'image/png',contentLength:24,sha256:sha,purpose:'reference_image'});objects.set(stage,png);
 expect((await inputs.complete(user,created.inputId)).status).toBe('ready');const original=await store.input(user,created.inputId);
 objects.set(stage,Buffer.from('旧签名晚PUT恶意内容'));expect((await inputs.complete(user,created.inputId)).sha256).toBe(sha);expect(objects.get(original!.sealed_key!)?.equals(png)).toBe(true);
 await expect(inputs.sign(other,created.inputId)).rejects.toThrow('not_found');await expect(inputs.sign(user,created.inputId)).rejects.toThrow('input_not_uploadable');
 const bad=await inputs.create(user,{contentType:'image/png',contentLength:24,sha256:'f'.repeat(64),purpose:'reference_image'});objects.set(stage,png);await expect(inputs.complete(user,bad.inputId)).rejects.toThrow('input_content_mismatch');expect((await store.input(user,bad.inputId))?.status).toBe('rejected');
});
sqlIt('联合源同微秒跨kind稳定分页、过滤先limit、v1及软移除边界归属',async()=>{
 const u=await seed(100),at='2026-11-09T12:00:00.123456Z';const expected:string[]=[];
 for(let n=0;n<3;n++){const {task}=await create(u);expected.push(`media:${task.id}`);await database.execute(sql`UPDATE media_tasks SET created_at=${at}::timestamptz WHERE id=${task.id} RETURNING id`);const id=randomUUID();expected.push(`makeup:${id}`);await database.execute(sql`INSERT INTO generations(id,user_id,upload_key,style_id,status,created_at) VALUES(${id},${u},'synthetic','test','done',${at}::timestamptz) RETURNING id`)}
 const source=createUnifiedCreationSource(database,async()=>null,async()=>null),seen:string[]=[];let cursor:string|null=null;
 do{const query=parseCreationQuery(new URL(`https://app.invalid/api/creations?limit=2${cursor?'&cursor='+cursor:''}`))!;if(query.cursor)expect(await source.validateCursor!(u,query.cursor)).toBe(true);const page=await source.list(u,query);seen.push(...page.items.map(x=>x.id));cursor=page.nextCursor;if(cursor){const decoded=JSON.parse(Buffer.from(cursor,'base64url').toString());expect(decoded.at).toBe(at);expect(decoded.v).toBe(2)}}while(cursor);
 expect(seen).toEqual([...expected].sort().reverse());expect(new Set(seen).size).toBe(6);
 const first=seen.find(x=>x.startsWith('makeup:'))!;expect(await source.remove(u,first)).toBe('removed');const v1=encodeCreationCursor('all',at,first.slice(7)),q=parseCreationQuery(new URL(`https://app.invalid?cursor=${v1}`))!;expect(await source.validateCursor!(u,q.cursor!)).toBe(true);expect(await source.validateCursor!(await seed(),q.cursor!)).toBe(false);
 expect(await source.remove(u,seen.find(x=>x.startsWith('media:'))!)).toBe('in_progress');expect(await source.read(await seed(),first)).toBeNull();
 const vr=normalizeMediaRequest({...request(),mediaType:'video',model:'grok-imagine-video-1.5',mode:'text_to_video',parameters:{durationSeconds:5,resolution:'480p'}});const v=await create(u,vr);const videos=await source.list(u,{filter:'video',limit:1,cursor:null});expect(videos.items.map(x=>x.id)).toEqual(['media:'+v.task.id]);
 const mc=await store.claim(v.task.id),ms=await store.transition(mc!.task,{status:'storing',taskId:'video-'+v.task.id,locator:'https://synthetic.invalid/v'});await store.complete(ms!,{key:'media/results/synthetic/video',mime:'video/mp4',bytes:20,sha256:'a'.repeat(64)});expect(await source.remove(u,'media:'+v.task.id)).toBe('removed');const mt=await store.get(v.task.id);expect(await source.validateCursor!(u,{at:mt!.created_at,id:v.task.id,kind:'media'})).toBe(true);
});
sqlIt('API过期quote旧意图重放、报价篡改/跨用户/未知参数拒绝且无重复投递',async()=>{
 const u=await seed();let now=Date.now(),emitted=0;const signer=createQuoteSigner(Buffer.alloc(32,9),()=>now);
 const econ={tariffVersion:'synthetic-only',credits:3,providerUpperCents:7,budgetApprovalRef:'synthetic-approved',dailyCapCents:1000000,providerAccountRef:'synthetic'};
 const catalog:MediaCatalog={enabled:true,consentVersion:'media-v1',adapterModes:['text_to_image'],tariffs:{text_to_image:econ}};
 const deps={currentUser:async()=>({id:u}),catalog,store,signer,limit:()=>true,emit:async()=>{emitted++;throw Error('事件投递丢失')}};const h=createMediaHandlers(deps),r=request(),key=randomUUID();
 const http=(path:string,body:unknown)=>new Request('https://app.invalid/api/media/'+path,{method:'POST',headers:{origin:'https://app.invalid','content-type':'application/json','idempotency-key':key},body:JSON.stringify(body)});
 const quote=await (await h.quotes(http('quotes',r))).json();expect(quote.credits).toBe(3);
 const first=await h.create(http('tasks',{...r,quoteToken:quote.quoteToken}));expect(first.status).toBe(202);const task=await first.json();catalog.enabled=false;now+=400000;
 expect((await h.create(http('tasks',{...r,quoteToken:quote.quoteToken}))).status).toBe(200);expect(emitted).toBe(1);
 expect((await h.read(new Request('https://app.invalid'),task.taskId)).status).toBe(200);
 expect((await createMediaHandlers({...deps,currentUser:async()=>({id:await seed()})}).read(new Request('https://app.invalid'),task.taskId)).status).toBe(404);
 expect((await h.create(http('tasks',{...r,prompt:'改动',quoteToken:quote.quoteToken}))).status).toBe(409);
 expect((await h.quotes(http('quotes',{...r,parameters:{...r.parameters,audio:true}}))).status).toBe(422);
 const [count]=await database.execute(sql`SELECT count(*)::int AS count FROM media_tasks WHERE user_id=${u}`);expect(count.count).toBe(1);
});
sqlIt('受限运维绑定仅原ID、expectedVersion/CAS及两人审批退款，审计同事务',async()=>{
 const u=await seed(),{task}=await create(u),claim=await store.claim(task.id);const t=await store.transition(claim!.task,{status:'reconciling',error:'submission_unknown',stage:'submission'});
 const ops=createMediaOperations(store,async(_credential,operationHash)=>({subject:'isolated-runtime',roles:['media_reconcile','media_settlement'],operationHash,approvalSubjects:['reviewer-a','reviewer-b']}));
 const op={taskId:t!.id,operationId:randomUUID(),expectedVersion:t!.state_version,action:'bind_original' as const,caseId:'isolated-case',evidenceSha256:'a'.repeat(64),providerTaskId:'known-original-'+t!.id};
 expect((await ops.apply(op,'synthetic-proof')).replayed).toBe(false);expect((await ops.apply(op,'synthetic-proof')).replayed).toBe(true);expect((await store.get(task.id))?.provider_task_id).toBe('known-original-'+t!.id);
 await expect(ops.apply({...op,operationId:randomUUID()},'synthetic-proof')).rejects.toThrow('operation_state_conflict');
 const current=await store.get(task.id),unknown=await store.transition(current!,{status:'reconciling',stage:'query'});const fail={...op,operationId:randomUUID(),expectedVersion:unknown!.state_version,action:'confirm_failed' as const,providerTaskId:undefined};await ops.apply(fail,'synthetic-proof');
 const [ledger]=await database.execute(sql`SELECT count(*)::int AS count FROM credits_ledger WHERE user_id=${u} AND reason='refund'`);expect(ledger.count).toBe(1);
 const [audit]=await database.execute(sql`SELECT count(*)::int AS count FROM media_task_events WHERE task_id=${task.id} AND actor_kind='operator'`);expect(audit.count).toBe(2);
});

import {drizzle} from 'drizzle-orm/postgres-js';
import type postgres from 'postgres';
function bridgeClient(session?:Session):unknown {
 const run=async(text:string,params:unknown[])=>{
  const s=session??new Session();
  const query=text.replace(/\$(\d+)/g,(_s,n)=>literal(params[Number(n)-1]));
  const returning=/^\s*(?:insert|update|delete)\b/i.test(query)&&! /\breturning\b/i.test(query)?query+' RETURNING *':query;
  try{return JSON.parse((await s.command(`WITH media_bridge_rows AS (${returning}) SELECT coalesce(json_agg(media_bridge_rows),'[]') FROM media_bridge_rows;`)).trim()) as Record<string,unknown>[]}finally{if(!session)s.close()}
 };
 return {options:{parsers:{},serializers:{}},unsafe(text:string,params:unknown[]=[]){const p=run(text,params);return Object.assign(p,{values:async()=> (await p).map(row=>Object.values(row))})},async begin(fn:(client:unknown)=>Promise<unknown>){const s=new Session();try{await s.command('BEGIN;');const result=await fn(bridgeClient(s));await s.command('COMMIT;');return result}catch(e){if(!s.closed)await s.command('ROLLBACK;').catch(()=>{});throw e}finally{s.close()}}};
}
sqlIt('D2原退款handler与媒体预留/失败退款交叉执行真实SQL保持同账且无死锁',async()=>{
 const sqlDrizzle=drizzle(bridgeClient() as ReturnType<typeof postgres>);
 vi.doMock('@/db/client',()=>({db:sqlDrizzle}));
 const {reverseCreditsForRefund}=await import('./payments/handlers');
 async function purchased(){const user=randomUUID(),order=randomUUID();await database.transaction(async tx=>{await tx.execute(sql`INSERT INTO auth.users(id) VALUES(${user}) RETURNING id`);await tx.execute(sql`INSERT INTO orders(id,user_id,provider,provider_order_id,provider_transaction_id,plan_id,amount_cents,currency,credits_awarded,status) VALUES(${order},${user},'creem',${order},${order},'synthetic',100,'USD',20,'completed') RETURNING id`);await tx.execute(sql`INSERT INTO credit_balances(user_id,balance) VALUES(${user},20) RETURNING user_id`);await tx.execute(sql`INSERT INTO credit_grants(user_id,source_type,source_id,initial_amount,remaining) VALUES(${user},'purchase',${order},20,20) RETURNING id`);await tx.execute(sql`INSERT INTO credits_ledger(user_id,delta,reason,ref_type,ref_id) VALUES(${user},20,'purchase','order',${order}) RETURNING id`)});return {user,order}}
 const first=await purchased();
 const results=await Promise.allSettled([create(first.user),reverseCreditsForRefund({provider:'creem',eventId:randomUUID(),providerOrderId:first.order,amountCents:100,currency:'USD'})]);
 if(results[0].status==='rejected')expect(String(results[0].reason)).toContain('insufficient_credits');expect(results[1].status).toBe('fulfilled');if(results[1].status==='fulfilled')expect(['reversed','not_refundable']).toContain(results[1].value);
 const [a]=await database.execute(sql`SELECT balance,(SELECT sum(remaining)::int FROM credit_grants WHERE user_id=${first.user}) AS lots,(SELECT sum(delta)::int FROM credits_ledger WHERE user_id=${first.user}) AS ledger FROM credit_balances WHERE user_id=${first.user}`);expect(a.balance).toBe(a.lots);expect(a.balance).toBe(a.ledger);
 const second=await purchased(),created=await create(second.user),claimed=await store.claim(created.task.id);
 await Promise.all([store.fail(claimed!.task,'provider_failed'),reverseCreditsForRefund({provider:'creem',eventId:randomUUID(),providerOrderId:second.order,amountCents:100,currency:'USD'})]);
 const [b]=await database.execute(sql`SELECT balance,(SELECT sum(remaining)::int FROM credit_grants WHERE user_id=${second.user}) AS lots,(SELECT sum(delta)::int FROM credits_ledger WHERE user_id=${second.user}) AS ledger FROM credit_balances WHERE user_id=${second.user}`);expect(b.balance).toBe(b.lots);expect(b.balance).toBe(b.ledger);expect([0,20]).toContain(b.balance);
 vi.doUnmock('@/db/client');
},10000);
sqlIt('同key更换payload必须409，即使携带旧报价，不能当普通422绕开幂等冲突',async()=>{
 const u=await seed(),r=request(),key=randomUUID(),signer=createQuoteSigner(Buffer.alloc(32,9));const econ={tariffVersion:'synthetic',credits:3,providerUpperCents:7,budgetApprovalRef:'synthetic',dailyCapCents:1000000,providerAccountRef:'synthetic'};
 const h=createMediaHandlers({currentUser:async()=>({id:u}),catalog:{enabled:true,consentVersion:'media-v1',adapterModes:['text_to_image'],tariffs:{text_to_image:econ}},store,signer,limit:()=>true,emit:async()=>{}});
 const http=(body:unknown)=>new Request('https://app.invalid/api/media/tasks',{method:'POST',headers:{origin:'https://app.invalid','content-type':'application/json','idempotency-key':key},body:JSON.stringify(body)});
 const q=await(await h.quotes(http(r))).json();expect((await h.create(http({...r,quoteToken:q.quoteToken}))).status).toBe(202);expect((await h.create(http({...r,prompt:'不同意图内容',quoteToken:q.quoteToken}))).status).toBe(409);
});
sqlIt('已知provider ID的超时只查原ID，提交claim后崩溃不重新POST',async()=>{
 const u=await seed(),{task}=await create(u);const c=await store.claim(task.id);const waiting=await store.transition(c!.task,{status:'waiting',taskId:'fixed-original-'+task.id});let queries=0,posts=0;
 const p:MediaProvider={modes:['text_to_image'],async submit(){posts++;return {kind:'unknown'}},async query(id){expect(id).toBe('fixed-original-'+task.id);queries++;return {kind:'unknown'}}};
 const run=createMediaProcessor(store,{get:()=>p},storage);await run(waiting!.id);await run(waiting!.id);expect(queries).toBe(2);expect(posts).toBe(0);
 const {task:crash}=await create(u);await store.claim(crash.id);await database.execute(sql`UPDATE media_tasks SET updated_at=now()-interval '6 minutes' WHERE id=${crash.id} RETURNING id`);await run(crash.id);await run(crash.id);expect(posts).toBe(0);expect((await store.get(crash.id))?.credit_state).toBe('reserved');expect((await store.get(crash.id))?.status).toBe('reconciling');
});
sqlIt('输入流超限后拒绝记录，不能残留uploading继续签名',async()=>{
 const user=await seed();const inputs=createMediaInputs(store,{async read(){return (async function*(){yield Buffer.alloc(8388609)})()},async putImmutable(){throw Error('不可写')},async signPut(){return 'https://synthetic.invalid'},async signGet(){throw Error('不可签')}},async()=>{throw Error('不可解码')});
 const input=await inputs.create(user,{contentType:'image/png',contentLength:24,sha256:'a'.repeat(64),purpose:'reference_image'});await expect(inputs.complete(user,input.inputId)).rejects.toThrow('media_too_large');expect((await store.input(user,input.inputId))?.status).toBe('rejected');
});
import {MediaFault} from './media-contracts';
sqlIt('供应商临时结果URL过期仅查原ID刷新，再存同一任务不重生成',async()=>{
 const u=await seed(),{task}=await create(u);let posts=0,queries=0,attempts=0;
 const p:MediaProvider={modes:['text_to_image'],async submit(){posts++;return {kind:'complete',taskId:'refresh-'+task.id,locator:'https://synthetic.invalid/expired'}},async query(id){queries++;expect(id).toBe('refresh-'+task.id);return {kind:'complete',taskId:id,locator:'https://synthetic.invalid/fresh'}}};
 const s={...storage,async store(t:Parameters<MediaResultStorage['store']>[0]){if(++attempts===1)throw new MediaFault('media_download_expired');expect(t.result_locator).toBe('https://synthetic.invalid/fresh');return storage.store(t)}};
 const run=createMediaProcessor(store,{get:()=>p},s);await run(task.id);await run(task.id);expect(posts).toBe(1);expect(queries).toBe(1);expect((await store.get(task.id))?.status).toBe('done');
});
sqlIt('已确认成功原结果后供应商矛盾失败不能退款或抹去结果',async()=>{
 const u=await seed(),{task}=await create(u),claim=await store.claim(task.id);const storing=await store.transition(claim!.task,{status:'storing',taskId:'success-'+task.id,locator:'https://synthetic.invalid/result'});
 expect(await store.fail(storing!,'provider_failed')).toBeNull();expect((await store.get(task.id))?.credit_state).toBe('reserved');expect((await store.get(task.id))?.result_locator).toBe('https://synthetic.invalid/result');
});

sqlIt('同毫秒不同微秒的三页游标不经Date截断',async()=>{
 const u=await seed();const ids:string[]=[];
 for(const micros of ['123456','123455','123454']){const {task}=await create(u);ids.push('media:'+task.id);await database.execute(sql`UPDATE media_tasks SET created_at=${'2026-11-09T12:00:00.'+micros+'Z'}::timestamptz WHERE id=${task.id} RETURNING id`)}
 const source=createUnifiedCreationSource(database,async()=>null,async()=>null),seen:string[]=[];let cursor:string|null=null;
 do{const q=parseCreationQuery(new URL(`https://app.invalid?limit=1${cursor?'&cursor='+cursor:''}`))!;const page=await source.list(u,q);seen.push(...page.items.map(x=>x.id));cursor=page.nextCursor}while(cursor);
 expect(seen).toEqual(ids);
});
sqlIt('事务取锁后也拒绝新任务过期报价，旧同意图不重新预留',async()=>{
 const u=await seed(),r=request(),hash=canonicalHash(r),q={version:1 as const,quoteId:randomUUID(),userId:u,payloadHash:hash,expiresAt:Date.now()-1,tariffVersion:'synthetic',credits:3,providerUpperCents:7,budgetApprovalRef:'synthetic',dailyCapCents:1000000,providerAccountRef:'synthetic'};
 await expect(store.create(u,randomUUID(),r,hash,q)).rejects.toThrow('quote_expired');
});

sqlIt('晚肯定响应只能补同提交快照，冲突原ID、不同提交及终态不能覆盖',async()=>{
 const u=await seed(100);
 for(const mismatch of ['none','future_version','submission','payload','model','provider','account','request','snapshot','existing_id','owned_id','done','refunded']){
  const {task}=await create(u),c=(await store.claim(task.id))!.task;
  await store.transition(c,{status:'reconciling',stage:'submission'});
  const id='late-'+task.id;
  let stale=c;
  if(mismatch==='future_version')stale={...c,state_version:c.state_version+100};
  if(mismatch==='submission')stale={...c,submission_id:randomUUID()};
  if(mismatch==='payload')stale={...c,request_hash:'f'.repeat(64)};
  if(mismatch==='model')stale={...c,model:'other'};
  if(mismatch==='provider')stale={...c,provider:'other'};
  if(mismatch==='account')stale={...c,provider_account_ref:'other'};
  if(mismatch==='request')stale={...c,request:{...c.request,prompt:'other'}};
  if(mismatch==='snapshot')stale={...c,submission:{prompt:'other',payloadHash:c.request_hash}};
  if(mismatch==='existing_id')await database.execute(sql`UPDATE media_tasks SET provider_task_id=${'different-'+task.id} WHERE id=${task.id} RETURNING id`);
  if(mismatch==='owned_id'){const other=await create(await seed()),oc=(await store.claim(other.task.id))!.task;await store.transition(oc,{status:'waiting',taskId:id})}
  if(mismatch==='done'){const t=(await store.get(task.id))!,s=await store.transition(t,{status:'storing',taskId:id,locator:'https://synthetic.invalid/winner'});await store.complete(s!,await storage.store(s!))}
  if(mismatch==='refunded')await store.fail((await store.get(task.id))!,'provider_failed');
  const result=await store.transition(stale,{status:'storing',taskId:id,locator:'https://synthetic.invalid/late',submissionResponse:true});
  if(mismatch==='none'){expect(result?.provider_task_id).toBe(id);expect(result?.result_locator).toBe('https://synthetic.invalid/late')}
  else{expect(result).toBeNull();expect((await store.get(task.id))?.result_locator).not.toBe('https://synthetic.invalid/late')}
  const events=await database.execute(sql`SELECT details FROM media_task_events WHERE task_id=${task.id} AND event_type LIKE 'late_%'`);expect(events.length).toBeGreaterThan(0);expect(JSON.stringify(events)).not.toContain('https://');
 }
});

sqlIt('暂停后的双签原ID绑定不重置24小时时钟，扫描不留下可重复调度时间',async()=>{
 const u=await seed(),{task}=await create(u),c=(await store.claim(task.id))!.task;
 await store.transition(c,{status:'reconciling',stage:'submission'});
 await database.execute(sql`UPDATE media_tasks SET submission_intent_at=now()-interval '25 hours' WHERE id=${task.id} RETURNING id`);
 await createMediaProcessor(store,{get:()=>undefined},storage)(task.id);
 const paused=(await store.get(task.id))!;
 const ops=createMediaOperations(store,async(_c,operationHash)=>({subject:'operator',roles:['media_reconcile'],operationHash,approvalSubjects:['a','b']}));
 await ops.apply({taskId:task.id,operationId:randomUUID(),expectedVersion:paused.state_version,action:'bind_original',caseId:'test',evidenceSha256:'a'.repeat(64),providerTaskId:'paused-'+task.id},null);
 expect((await store.due(100)).some(t=>t.id===task.id)).toBe(false);
 expect((await store.get(task.id))?.next_action_at).toBeNull();
});

sqlIt('稳定提交起点25小时且updated_at刚刷新仍持久暂停，扫描与排队事件均零GET',async()=>{
 const u=await seed(),{task}=await create(u),c=(await store.claim(task.id))!.task;
 await store.transition(c,{status:'waiting',taskId:'aged-'+task.id});
 await database.execute(sql`UPDATE media_tasks SET submission_intent_at=now()-interval '25 hours',updated_at=now(),next_action_at=now()-interval '1 minute' WHERE id=${task.id} RETURNING id`);
 expect((await store.due(100)).some(x=>x.id===task.id)).toBe(false);
 let posts=0,queries=0;const p:MediaProvider={modes:['text_to_image'],async submit(){posts++;return {kind:'unknown'}},async query(){queries++;return {kind:'unknown'}}};
 const process=createMediaProcessor(store,{get:()=>p},storage);await process(task.id);await process(task.id);
 const t=await store.get(task.id);expect(t?.status).toBe('reconciling');expect(t?.error_code).toBe('media_manual_review_required');expect(t?.next_action_at).toBeNull();expect(t?.provider_task_id).toBe('aged-'+task.id);expect(t?.credit_state).toBe('reserved');expect([posts,queries]).toEqual([0,0]);
 const [audit]=await database.execute(sql`SELECT count(*)::int AS n FROM media_task_events WHERE task_id=${task.id} AND event_type='automatic_query_paused'`);expect(audit.n).toBe(1);
 const [money]=await database.execute(sql`SELECT provider_upper_cents,credits_quoted,(SELECT count(*)::int FROM credits_ledger WHERE ref_id=${task.id} AND reason='refund') AS refunds FROM media_tasks WHERE id=${task.id}`);expect(money).toEqual({provider_upper_cents:7,credits_quoted:3,refunds:0});
});

sqlIt('25小时已有结果仍重存原结果，过期locator刷新也受暂停门禁，未超龄可正常查询',async()=>{
 const u=await seed();let queries=0,stores=0;
 const p:MediaProvider={modes:['text_to_image'],async submit(){throw Error('不可POST')},async query(id){queries++;return {kind:'complete',taskId:id,locator:'https://synthetic.invalid/fresh'}}};
 for(const expired of [false,true]){
  const {task}=await create(u),c=(await store.claim(task.id))!.task;await store.transition(c,{status:'storing',taskId:'storage-'+task.id,locator:'https://synthetic.invalid/original'});
  await database.execute(sql`UPDATE media_tasks SET submission_intent_at=now()-interval '25 hours',error_code=${expired?'media_download_expired':'storage_unavailable'} WHERE id=${task.id} RETURNING id`);
  const process=createMediaProcessor(store,{get:()=>p},{...storage,async store(t){stores++;return storage.store(t)}});await process(task.id);
  expect((await store.get(task.id))?.status).toBe(expired?'reconciling':'done');
 }
 expect([queries,stores]).toEqual([0,1]);
 const {task}=await create(u),c=(await store.claim(task.id))!.task;await store.transition(c,{status:'waiting',taskId:'recent-'+task.id});await createMediaProcessor(store,{get:()=>p},storage)(task.id);expect(queries).toBe(1);expect((await store.get(task.id))?.status).toBe('done');
});

sqlIt('真实缺表和schema权限故障可区分，权限恢复正常不遗留写操作',async()=>{
 const h=(s:ReturnType<typeof persistence.createMediaStore>)=>createMediaHandlers({currentUser:async()=>({id:randomUUID()}),catalog:{enabled:false} as MediaCatalog,store:s,limit:()=>true,emit:async()=>{throw Error('不可投递')}});
 const capability=async(s:ReturnType<typeof persistence.createMediaStore>)=>h(s).capabilities(new Request('https://synthetic.invalid/api/media/capabilities'));
 const missing=new Session();
 try{
  await missing.command('BEGIN; ALTER TABLE media_task_events RENAME TO media_events_missing;');
  const response=await capability(persistence.createMediaStore({...database,execute:q=>missing.execute(q)}));expect((await response.json()).code).toBe('media_schema_unavailable');
 }finally{await missing.command('ROLLBACK;');missing.close()}
 const denied=new Session();
 try{
  await denied.command('BEGIN; CREATE ROLE e1_rework_noaccess; REVOKE USAGE ON SCHEMA public FROM PUBLIC; SET LOCAL ROLE e1_rework_noaccess;');
  const response=await capability(persistence.createMediaStore({...database,execute:q=>denied.execute(q)}));expect(response.status).toBe(503);expect((await response.json()).code).toBe('media_unavailable');
 }finally{if(!denied.closed)await denied.command('ROLLBACK;').catch(()=>{});denied.close()}
 expect(await store.ready()).toBe(true);
});
