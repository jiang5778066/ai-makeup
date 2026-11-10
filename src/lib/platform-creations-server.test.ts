// @vitest-environment node
import {it,expect,vi} from 'vitest';
const fixture=vi.hoisted(()=>{
 const task={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',model:'gpt-image-2',mode:'text_to_image',credit_state:'reserved',status:'reserved',input_id:null};
 const submit=vi.fn(async()=>({kind:'unknown'}));
 const runtime={catalog:{enabled:true,consentVersion:'media-v1',tariffs:{text_to_image:{credits:2}},adapterModes:['text_to_image']},signer:{},inputs:{},store:{ready:async()=>true,recovery:async()=>task,claim:async()=>({task,submit:true}),transition:vi.fn(async()=>null)},providers:{get:()=>({modes:['text_to_image'],submit})},storage:{sign:vi.fn(async()=>({url:'https://results.example.com/fresh',mimeType:'image/png',expiresAt:'synthetic'}))}};
 return {runtime,submit,source:vi.fn((..._args:unknown[])=>({}))};
});
vi.mock('./media-runtime',()=>({getMediaRuntime:()=>fixture.runtime}));
vi.mock('./supabase/server',()=>({getCurrentUser:async()=>({id:'synthetic'})}));
vi.mock('./platform-account-http',async importOriginal=>({...await importOriginal<typeof import('./platform-account-http')>(),accountConfigured:()=>true}));
vi.mock('./media-creations-source',()=>({createUnifiedCreationSource:fixture.source}));
import {mediaHandlers} from './media-tasks';
import {processMediaTask} from '../inngest/media-functions';
import {creations} from './platform-creations-server';
it('三个真实默认入口均取同一lazy runtime，漏worker或D1注入即失败',async()=>{
 expect(creations).toBeDefined();const response=await mediaHandlers.capabilities(new Request('https://app.example/api/media/capabilities'));expect(response.status).toBe(200);
 await processMediaTask('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');expect(fixture.submit).toHaveBeenCalledTimes(1);
 const sign=fixture.source.mock.calls[0][2] as (key:string,mime:string)=>Promise<unknown>;expect(typeof sign).toBe('function');await expect(sign('media/results/original','image/png')).resolves.toHaveProperty('url','https://results.example.com/fresh');expect(fixture.runtime.storage.sign).toHaveBeenCalledWith('media/results/original','image/png');
});
