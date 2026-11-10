// @vitest-environment node
import {it,expect,vi} from 'vitest';
import type {TaskRecord} from '../media-contracts';
import type {ImageHttpRequest} from '../media-pinned-transport';
import {createRouterVideoProvider} from './media-router-video';
const input='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const task=(mode='text_to_video')=>({model:'grok-imagine-video-1.5',media_type:'video',mode,input_id:mode==='image_to_video'?input:null,provider_account_ref:'offline-account',request:{model:'grok-imagine-video-1.5',mediaType:'video',mode,prompt:'离线合成',parameters:{durationSeconds:5,resolution:'480p'},inputIds:mode==='image_to_video'?[input]:[]},submission:{prompt:'离线合成'}} as unknown as TaskRecord);
const setup=(data:unknown,status=200)=>{const http=vi.fn(async(_r:ImageHttpRequest)=>({status,body:Buffer.from(typeof data==='string'?data:JSON.stringify(data))}));return {http,provider:createRouterVideoProvider({key:'offline-key',accountRef:'offline-account',inputHosts:['inputs.example.com'],resultHosts:['results.example.com'],http})}};
it('视频固定tuple映射且只一次POST，文生无image、图生单sealed URL',async()=>{
 const {provider,http}=setup({task_id:'原始 /?ID',status:'submitted'},202);
 expect(await provider.submit(task(),null)).toEqual({kind:'accepted',taskId:'原始 /?ID'});
 expect(JSON.parse(http.mock.calls[0][0].body!)).toEqual({model:'grok-imagine-video-1.5',prompt:'离线合成',duration:5,resolution:'480p'});
 expect(http.mock.calls[0][0].url).toBe('https://api.router.team/api/public/creative-center/videos');
 await provider.submit(task('image_to_video'),'https://inputs.example.com/sealed?synthetic=1');
 expect(JSON.parse(http.mock.calls[1][0].body!).image).toBe('https://inputs.example.com/sealed?synthetic=1');
 await provider.query('原始 /?ID',task());expect(http.mock.calls[2][0].url).toBe('https://api.router.team/api/public/creative-center/videos/%E5%8E%9F%E5%A7%8B%20%2F%3FID?model=grok-imagine-video-1.5');
});
it('无ID/坏JSON/冲突/不确定HTTP保unknown，不把POST failed当退款依据',async()=>{
 for(const data of [{},'{',{task_id:'a',taskId:'b',status:'submitted'},{task_id:'a',status:'mystery'},{task_id:'a',status:'submitted',model:'gpt-image-2'},{task_id:'a',status:'submitted',type:'image'},{task_id:'a',status:'submitted',generation_type:'image'}]){const {provider,http}=setup(data);expect(await provider.submit(task(),null)).toEqual({kind:'unknown'});expect(http).toHaveBeenCalledTimes(1)}
 for(const status of [400,403,404,429,500,302]){const {provider,http}=setup({task_id:'a',status:'failed'},status);expect(await provider.submit(task(),null)).toEqual({kind:'unknown'});expect(http).toHaveBeenCalledTimes(1)}
 const {provider,http}=setup({task_id:'a',status:'failed'});expect(await provider.submit(task(),null)).toEqual({kind:'accepted',taskId:'a'});http.mockRejectedValueOnce(Error('敏感正文'));expect(await provider.submit(task(),null)).toEqual({kind:'unknown'});
});
it('completed仅output_url或url，cover与图片结果不能冒充视频；优先字段坏时不降级',async()=>{
 for(const data of [{cover_url:'https://results.example.com/a.mp4'},{result_urls:['https://results.example.com/a.mp4']},{output_url:'https://private.invalid/a',url:'https://results.example.com/a.mp4'},{output_url:7,url:'https://results.example.com/a.mp4'},{output_url:'https://results.example.com/a.mp4',type:'image'}])expect(await setup({task_id:'a',status:'completed',...data}).provider.query('a',task())).toEqual({kind:'unknown'});
 expect(await setup({task_id:'a',status:'completed',output_url:'https://results.example.com/out.mp4',url:'https://results.example.com/other.mp4',cover_url:'https://results.example.com/cover.png'}).provider.query('a',task())).toEqual({kind:'complete',taskId:'a',locator:'https://results.example.com/out.mp4'});
 expect(await setup({task_id:'a',status:'completed',url:'https://results.example.com/out.mp4'}).provider.query('a',task())).toHaveProperty('kind','complete');
 expect(await setup({task_id:'b',status:'failed'}).provider.query('a',task())).toEqual({kind:'unknown'});
 expect(await setup({task_id:'a',status:'failed',model:'grok-imagine-video-1.5'}).provider.query('a',task())).toEqual({kind:'definitive_failure',taskId:'a',code:'provider_failed'});
});
it('额外参数、错误输入、账户或封存prompt不一致拒绝且零外呼',async()=>{
 const {provider,http}=setup({task_id:'a',status:'submitted'});
 for(const parameters of [{durationSeconds:6,resolution:'480p'},{durationSeconds:5,resolution:'480p',audio:1},{durationSeconds:5,resolution:'480p',ratio:'1:1'}] as Record<string,string|number>[])expect(await provider.submit({...task(),request:{...task().request,parameters}},null)).toEqual({kind:'unknown'});
 expect(await provider.submit(task('image_to_video'),null)).toEqual({kind:'unknown'});expect(await provider.submit(task(),'https://inputs.example.com/a')).toEqual({kind:'unknown'});expect(await provider.submit({...task(),provider_account_ref:'other'},null)).toEqual({kind:'unknown'});expect(http).not.toHaveBeenCalled();
});

import {createMediaProcessor} from '../../inngest/media-functions';
import type {MediaStore} from '../media-persistence';
import type {MediaResultStorage} from '../media-storage';
it('E3-001：只有2xx原ID明确正确model的GET failed才可确定失败',async()=>{
 for(const model of [undefined,'',null,0,false,{},[],'other-model']){
  const {provider,http}=setup({task_id:'original /?ID',status:'failed',model});
  expect(await provider.query('original /?ID',task())).toEqual({kind:'unknown'});
  expect(http).toHaveBeenCalledTimes(1);
 }
 expect(await setup({task_id:'original /?ID',status:'failed',model:'grok-imagine-video-1.5'}).provider.query('original /?ID',task())).toEqual({kind:'definitive_failure',taskId:'original /?ID',code:'provider_failed'});
 expect(await setup({task_id:'other',status:'failed',model:'grok-imagine-video-1.5'}).provider.query('original /?ID',task())).toEqual({kind:'unknown'});
 for(const status of [302,400,403,429,500])expect(await setup({task_id:'original /?ID',status:'failed',model:'grok-imagine-video-1.5'},status).provider.query('original /?ID',task())).toEqual({kind:'unknown'});
 for(const status of ['failed','completed']){
  const {provider,http}=setup({task_id:'original /?ID',status});
  expect(await provider.submit(task(),null)).toEqual({kind:'accepted',taskId:'original /?ID'});
  expect(http).toHaveBeenCalledTimes(1);
 }
});
it('E3-001：缺model原ID失败走既有processor后仍reserved且不调用fail',async()=>{
 const id='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 let row={...task(),id,provider_task_id:'original',status:'waiting',credit_state:'reserved'} as TaskRecord;
 const fail=vi.fn(async()=>{throw Error('不允许退款入口')});
 const transition=vi.fn(async(_task:TaskRecord,next:{status:TaskRecord['status'];error?:string})=>{row={...row,status:next.status,error_code:next.error??null};return row});
 const store={recovery:async()=>row,claim:async()=>({task:row,submit:false}),transition,fail} as unknown as MediaStore;
 const {provider,http}=setup({task_id:'original',status:'failed'});
 const storage={store:vi.fn(async()=>{throw Error('不应存储')})} as unknown as MediaResultStorage;
 await createMediaProcessor(store,{get:()=>provider},storage)(id);
 expect(row.credit_state).toBe('reserved');expect(row.status).toBe('reconciling');expect(row.error_code).toBe('provider_unknown');
 expect(fail).not.toHaveBeenCalled();expect(storage.store).not.toHaveBeenCalled();expect(http.mock.calls.map(c=>c[0].method)).toEqual(['GET']);
});
