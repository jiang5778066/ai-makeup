// @vitest-environment node
import {expect,it} from 'vitest';
import {PgDialect} from 'drizzle-orm/pg-core';
import {createMediaStore} from './media-persistence';
import type {MediaDatabase,TaskRecord} from './media-contracts';
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const row=()=>({id,status:'storing',credit_state:'reserved',state_version:4,lease_token:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',lease_expires_at:'2099-01-01T00:00:00Z',result_locator:'https://results.invalid/original',provider_task_id:'original',request:{prompt:'合成'},submission_id:id,user_id:id} as TaskRecord);
function fixture(){const queries:{sql:string;params:unknown[]}[]=[];let current=row();const execute=async(query:Parameters<MediaDatabase['execute']>[0])=>{const q=new PgDialect().sqlToQuery(query);queries.push(q);if(q.sql.startsWith('SELECT *, (lease_expires_at>clock_timestamp()) AS lease_valid FROM media_tasks'))return [{...current,lease_valid:new Date(current.lease_expires_at!).getTime()>Date.now()}];if(q.sql.includes('RETURNING *')&&q.sql.startsWith('UPDATE media_tasks'))return [{...current}];return []};const db:MediaDatabase={execute,transaction:fn=>fn({execute})};return {store:createMediaStore(db),queries,set:(v:TaskRecord)=>{current=v},row:()=>current}}
it('due领取至多一行、SKIP LOCKED及原子token/expiry/version，拒绝无界limit',async()=>{const f=fixture();await f.store.claimDue();const q=f.queries.find(x=>x.sql.startsWith('UPDATE media_tasks'))!;expect(q.sql).toContain('FOR UPDATE SKIP LOCKED LIMIT 1');expect(q.sql).toContain('state_version=state_version+1');expect(q.sql).toContain('lease_expires_at');expect(q.params).toContain(150)});
it('旧token、过期token和版本不匹配都不能转移/结算/退款或释放新租约',async()=>{
 for(const patch of [{lease_token:id},{state_version:3},{lease_expires_at:'2000-01-01T00:00:00Z'}]){const f=fixture(),stale={...row(),result_locator:null,...patch};f.set({...row(),result_locator:null,...('lease_expires_at'in patch?patch:{})});
 expect(await f.store.transition(stale,{status:'reconciling'})).toBeNull();expect(await f.store.complete(stale,{key:'k',mime:'image/png',bytes:1,sha256:'a'.repeat(64)})).toBeNull();expect(await f.store.fail(stale,'provider_failed')).toBeNull();await f.store.release(stale);
 expect(f.queries.filter(q=>/UPDATE media_tasks SET status=|credit_balances|credit_grants|credits_ledger/.test(q.sql))).toHaveLength(0);
 }
});
it('真实生成SQL的执行更新、完成和释放均含token/版本及数据库时钟expiry门禁',async()=>{const f=fixture();await f.store.transition(row(),{status:'reconciling'});await f.store.complete(row(),{key:'k',mime:'image/png',bytes:1,sha256:'a'.repeat(64)});await f.store.release(row());for(const q of f.queries.filter(q=>q.sql.startsWith('UPDATE media_tasks'))){expect(q.sql).toContain('lease_token=');expect(q.sql).toContain('lease_expires_at>clock_timestamp()');expect(q.sql).toContain('state_version=')}});
it('租约过期判断使用实际数据库时钟，不能以事务起点时间延长执行权',async()=>{const f=fixture();await f.store.complete(row(),{key:'k',mime:'image/png',bytes:1,sha256:'a'.repeat(64)});expect(f.queries.find(q=>q.sql.startsWith('UPDATE media_tasks'))!.sql).toContain('lease_expires_at>clock_timestamp()')});
