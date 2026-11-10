import {it,expect} from 'vitest';
import {createMediaOperations} from './media-operations';
import {randomUUID} from 'node:crypto';
it('没有可信运行身份校验器时拒绝写恢复，自报operator和双签字符串不能授权',async()=>{
 const ops=createMediaOperations({} as never);
 await expect(ops.apply({operator:'admin',approvers:['a','b']} as never,'伪凭据')).rejects.toThrow('media_operations_unconfigured');
});
const operation=(action:'bind_original'|'confirm_failed')=>({taskId:randomUUID(),operationId:randomUUID(),expectedVersion:1,action,caseId:'synthetic-case',evidenceSha256:'a'.repeat(64),...(action==='bind_original'?{providerTaskId:'original'}:{})});
for(const action of ['bind_original','confirm_failed'] as const){
 for(const approvalSubjects of [[],['a','a'],['operator','a']]){
  it(`${action}拒绝不足两个独立审批身份：${JSON.stringify(approvalSubjects)}`,async()=>{
   const ops=createMediaOperations({} as never,async(_c,operationHash)=>({subject:'operator',roles:['media_reconcile','media_settlement'],operationHash,approvalSubjects}));
   await expect(ops.apply(operation(action),null)).rejects.toThrow('two_person_approval_required');
  });
 }
 it(`${action}拒绝绑定错误operationHash的审批凭据`,async()=>{
  const ops=createMediaOperations({} as never,async()=>({subject:'operator',roles:['media_reconcile','media_settlement'],operationHash:'wrong',approvalSubjects:['a','b']}));
  await expect(ops.apply(operation(action),null)).rejects.toThrow('operation_forbidden');
 });
}
it('双签不能替代退款结算角色',async()=>{
 const ops=createMediaOperations({} as never,async(_c,operationHash)=>({subject:'operator',roles:['media_reconcile'],operationHash,approvalSubjects:['a','b']}));
 await expect(ops.apply(operation('confirm_failed'),null)).rejects.toThrow('operation_forbidden');
});
