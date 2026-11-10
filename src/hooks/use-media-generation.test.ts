import {it,expect,vi} from 'vitest';
import {renderHook,act} from '@testing-library/react';
import {useMediaGeneration} from './use-media-generation';
import type {MediaDraft} from '@/lib/media-client';
vi.mock('@/lib/platform-account-session',()=>({usePlatformAccount:()=>({status:'signed_in',user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'},epoch:1})}));
it('hook原样采用账户epoch，替换文件后的旧上传不能生成quote',async()=>{
 let finish!:(r:Response)=>void;const pending=new Promise<Response>(r=>{finish=r});const fetcher=vi.fn(async(url:RequestInfo|URL)=>String(url).endsWith('capabilities')?new Response(JSON.stringify({capabilities:[{mode:'image_to_image',model:'gpt-image-2',enabled:true,parameters:{quality:['1k'],size:['2:3'],n:[1]}}]})):pending);
 const draft:MediaDraft={model:'gpt-image-2',mode:'image_to_image',prompt:'合成',locale:'en',files:[new File(['a'],'a.png',{type:'image/png'})],selectionVersion:1};
 const {result,rerender,unmount}=renderHook(({d})=>useMediaGeneration(d,fetcher),{initialProps:{d:draft}});await act(async()=>{await result.current.controller.capabilities();result.current.controller.selectTuple();result.current.controller.consent(true)});
 const digest=vi.spyOn(crypto.subtle,'digest').mockResolvedValue(new ArrayBuffer(32));let promise:Promise<void>;await act(async()=>{promise=result.current.controller.quote();await Promise.resolve()});rerender({d:{...draft,files:[],selectionVersion:2}});await act(async()=>{finish(new Response(JSON.stringify({inputId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',uploadUrl:'https://inputs.example.com/a',requiredHeaders:{'Content-Type':'image/png'}})));await promise!});expect(result.current.state.quote).toBeNull();expect(fetcher.mock.calls.filter(x=>String(x[0]).endsWith('/quotes'))).toHaveLength(0);digest.mockRestore();unmount();
});

it('视频hook正常报价不被自身重渲染取消，替换来源参数须重新确认本站tuple',async()=>{
 const f=vi.fn(async(url:RequestInfo|URL)=>new Response(JSON.stringify(String(url).endsWith('capabilities')?{capabilities:[{mode:'text_to_video',model:'grok-imagine-video-1.5',enabled:true,parameters:{durationSeconds:[5],resolution:['480p']}}]}:{quoteToken:'synthetic-video',credits:7,expiresAt:new Date(Date.now()+300000).toISOString()})));
 const draft:MediaDraft={model:'grok-imagine-video-1.5',mode:'text_to_video',prompt:'合成',locale:'zh-CN',files:[],selectionVersion:0,sourceSelection:'6秒'};
 const {result,rerender,unmount}=renderHook(({d})=>useMediaGeneration(d,f),{initialProps:{d:draft}});await act(async()=>{await result.current.controller.capabilities();result.current.controller.selectTuple();result.current.controller.consent(true);await result.current.controller.quote()});expect(result.current.state.status).toBe('confirm');rerender({d:{...draft,files:[]}});expect(result.current.state.quote?.credits).toBe(7);rerender({d:{...draft,sourceSelection:'10秒'}});expect(result.current.state.quote).toBeNull();expect(result.current.state.selected).toBe(false);unmount();
});
