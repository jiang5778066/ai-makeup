// @vitest-environment node
import {expect,it,vi,afterEach} from 'vitest';
vi.mock('@/inngest/client',()=>{throw Error('database-step禁止加载Inngest SDK')});
import {notifyMediaTask} from './media-tasks';
import {POST,runtime,maxDuration} from '@/app/api/internal/media/step/route';
afterEach(()=>vi.unstubAllEnvs());
it('database-step通知是持久due唤醒提示，不加载Inngest或触发第二次提交',async()=>{vi.stubEnv('MEDIA_RUNTIME_CONFIG',JSON.stringify({executionBackend:'database-step'}));await expect(notifyMediaTask('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')).resolves.toBeUndefined()});
it('默认部署路由关闭，Node且maxDuration120，缺秘密零数据库执行',async()=>{vi.stubEnv('MEDIA_STEP_SECRET','');vi.stubEnv('MEDIA_STEP_ENABLED','0');expect(runtime).toBe('nodejs');expect(maxDuration).toBe(120);const r=await POST(new Request('https://app.invalid/api/internal/media/step',{method:'POST'}));expect(r.status).toBe(503);expect(await r.json()).toEqual({code:'media_step_unconfigured'})});

import {createMediaHandlers} from './media-tasks';
import {createQuoteSigner} from './media-quotes';
import type {MediaStore} from './media-persistence';
import type {MediaRequest,TaskRecord} from './media-contracts';
it('create短事务提交后通知丢失仍202原ID；换key重放不再预留，后续due不依赖浏览器',async()=>{
 const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',user='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';let row:TaskRecord|null=null,reservations=0;const econ={tariffVersion:'fixture-only',credits:2,providerUpperCents:5,dailyCapCents:10,budgetApprovalRef:'fixture-only',providerAccountRef:'fixture-only'};
 const store={ready:async()=>true,inputHashes:async()=>[],identities:async()=>row?[row]:[],replay:async()=>row,create:async(_u:string,key:string,r:MediaRequest,hash:string,quote:TaskRecord['quote'])=>{reservations++;row={id,user_id:user,request:r,request_hash:hash,quote,model:r.model,mode:r.mode,status:'reserved',credit_state:'reserved',client_intent_id:r.clientIntentId,client_idempotency_key:key,next_action_at:new Date().toISOString()} as TaskRecord;return {task:row,replayed:false}},claimDue:async()=>row} as unknown as MediaStore;
 const emit=vi.fn(async()=>{throw Error('唤醒丢失')}),signer=createQuoteSigner(Buffer.alloc(32,7));const h=createMediaHandlers({currentUser:async()=>({id:user}),store,signer,catalog:{enabled:true,adapterModes:['text_to_image'],consentVersion:'media-v1',tariffs:{text_to_image:econ}},limit:()=>true,emit});
 const payload={clientIntentId:id,mediaType:'image',model:'gpt-image-2',mode:'text_to_image',prompt:'合成恢复输入',parameters:{quality:'1k',size:'2:3',n:1},inputIds:[],locale:'zh-CN',consent:true,consentVersion:'media-v1'};
 const req=(b:unknown,key='fixture-idempotency-key')=>new Request('https://app.invalid/api/media/tasks',{method:'POST',headers:{origin:'https://app.invalid','content-type':'application/json','idempotency-key':key},body:JSON.stringify(b)});const q=await(await h.quotes(req(payload))).json();const body={...payload,quoteToken:q.quoteToken};const r=await h.create(req(body));expect(r.status).toBe(202);expect((await r.json()).taskId).toBe(id);const replay=await h.create(req(body,'other-idempotency-key'));expect(replay.status).toBe(200);expect((await replay.json()).taskId).toBe(id);expect(reservations).toBe(1);expect(emit).toHaveBeenCalledTimes(1);expect((await store.claimDue())?.id).toBe(id);
});
