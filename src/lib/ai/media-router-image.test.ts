// @vitest-environment node
import {it,expect,vi} from 'vitest';
import type {ImageHttpRequest} from '../media-pinned-transport';
import type {TaskRecord} from '../media-contracts';
import {createRouterImageProvider} from './media-router-image';
const inputId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const task=(mode='text_to_image')=>({model:'gpt-image-2',mode,media_type:'image',input_id:mode==='image_to_image'?inputId:null,provider_account_ref:'offline-account',request:{model:'gpt-image-2',mode,mediaType:'image',parameters:{quality:'1k',size:'2:3',n:1},inputIds:mode==='image_to_image'?[inputId]:[],prompt:'本地合成提示词'},submission:{prompt:'本地合成提示词'}} as unknown as TaskRecord);
const setup=(data:unknown,status=200)=>{const http=vi.fn(async(_request:ImageHttpRequest)=>({status,body:Buffer.from(typeof data==='string'?data:JSON.stringify(data))}));return {http,provider:createRouterImageProvider({key:'offline-key',accountRef:'offline-account',inputHosts:['inputs.example.com'],resultHosts:['results.example.com'],http})}};
it('严格序列化固定GPT tuple，文生无输入、图生只有sealed签名输入',async()=>{
 const {provider,http}=setup({task_id:'original',taskId:'original',status:'submitted'},202);
 expect(await provider.submit(task(),null)).toEqual({kind:'accepted',taskId:'original'});
 expect(JSON.parse(http.mock.calls[0][0].body!)).toEqual({model:'gpt-image-2',prompt:'本地合成提示词',quality:'1k',size:'2:3',n:1});
 await provider.submit(task('image_to_image'),'https://inputs.example.com/sealed?sig=synthetic');expect(JSON.parse(http.mock.calls[1][0].body!).image_urls).toHaveLength(1);
 for(const bad of [{...task(),model:'source-model'},{...task(),request:{...task().request,parameters:{quality:'1k',size:'2:3',n:2}}},{...task(),request:{...task().request,parameters:{quality:'1k',size:'2:3',n:1,seed:2}}}])expect(await provider.submit(bad as TaskRecord,null)).toEqual({kind:'unknown'});
 expect(http).toHaveBeenCalledTimes(2);
});
it('4xx/超时/坏JSON/冲突ID/未知状态不证明失败且绝不重POST',async()=>{
 for(const [data,status] of [[{},400],[{},403],[{},429],[{},500],['{',202],[{task_id:'a',taskId:'b',status:'submitted'},202],[{task_id:'a',status:'mystery'},202]] as const){const {provider,http}=setup(data,status);expect(await provider.submit(task(),null)).toEqual({kind:'unknown'});expect(http).toHaveBeenCalledTimes(1)}
 const http=vi.fn(async()=>{throw Error('secret timeout')});expect(await createRouterImageProvider({key:'x',accountRef:'offline-account',inputHosts:[],resultHosts:[],http}).submit(task(),null)).toEqual({kind:'unknown'});expect(http).toHaveBeenCalledTimes(1);
});
it('只查询原ID，completed字段优先级受限，明确原任务failed才确定失败',async()=>{
 const {provider,http}=setup({task_id:'original',status:'completed',result_urls:['https://results.example.com/original.png'],cover_url:'https://results.example.com/cover.png'});
 expect(await provider.query('original',task())).toEqual({kind:'complete',taskId:'original',locator:'https://results.example.com/original.png'});expect(http.mock.calls[0][0].url).toBe('https://api.router.team/api/public/creative-center/images/original');
 expect(await setup({task_id:'other',status:'failed'}).provider.query('original',task())).toEqual({kind:'unknown'});
 expect(await setup({task_id:'original',status:'failed'}).provider.query('original',task())).toEqual({kind:'definitive_failure',taskId:'original',code:'provider_failed'});
 expect(await setup({status:'completed',cover_url:'https://results.example.com/a'}).provider.query('original',task())).toEqual({kind:'unknown'});
 expect(await setup({task_id:'original',status:'completed',result_urls:['https://private.invalid/a']}).provider.query('original',task())).toEqual({kind:'unknown'});
});
