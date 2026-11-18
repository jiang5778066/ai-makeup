// @vitest-environment node
import {expect,it} from 'vitest';
import {PgDialect} from 'drizzle-orm/pg-core';
import {createMediaOperations} from './media-operations';
import {createMediaStore} from './media-persistence';
import type {MediaDatabase} from './media-contracts';
it('双签运维也不能在自动执行租约存活时绑定原ID或退款',async()=>{
 const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',queries:string[]=[];const execute:MediaDatabase['execute']=async query=>{const q=new PgDialect().sqlToQuery(query);queries.push(q.sql);if(q.sql.includes('SELECT *')&&q.sql.includes('FROM media_tasks'))return [{id,user_id:id,submission_id:id,status:'reconciling',credit_state:'reserved',state_version:4,lease_token:id,lease_valid:true,lease_expires_at:'2099-01-01',provider_task_id:null,result_locator:null}];if(q.sql.startsWith('SELECT balance'))return [{balance:20}];if(q.sql.startsWith('UPDATE media_tasks'))return [{id}];return []};const store=createMediaStore({execute,transaction:fn=>fn({execute})});const ops=createMediaOperations(store,async(_c,operationHash)=>({subject:'operator',roles:['media_reconcile','media_settlement'],operationHash,approvalSubjects:['a','b']}));
 for(const action of ['bind_original','confirm_failed'] as const)await expect(ops.apply({taskId:id,operationId:id,expectedVersion:4,action,caseId:'fixture',evidenceSha256:'a'.repeat(64),...(action==='bind_original'?{providerTaskId:'original'}:{})},null)).rejects.toThrow('operation_state_conflict');
 expect(queries.filter(q=>q.startsWith('UPDATE media_tasks'))).toHaveLength(0);
});
