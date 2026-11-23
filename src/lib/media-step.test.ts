// @vitest-environment node
import {it,expect,vi} from 'vitest';
import {createMediaStepHandler,MEDIA_STEP_MAX_DURATION,MEDIA_STEP_DEADLINE_MS,MEDIA_STEP_LEASE_SECONDS} from './media-step';
const secret='ab'.repeat(32);
const request=(patch:RequestInit={},url='https://app.invalid/api/internal/media/step')=>new Request(url,{method:'POST',headers:{authorization:`Bearer ${secret}`},...patch});
it('固定一步有界且请求await执行，响应没有任务内容',async()=>{
 let finished=false;const tick=vi.fn(async()=>{await Promise.resolve();finished=true;return {processed:true}});
 const response=await createMediaStepHandler({secret:()=>secret,enabled:()=>true,tick})(request());
 expect(finished).toBe(true);expect(tick).toHaveBeenCalledTimes(1);expect(await response.json()).toEqual({processed:true});expect(response.headers.get('cache-control')).toContain('no-store');
 expect(MEDIA_STEP_MAX_DURATION).toBeLessThanOrEqual(120);expect(MEDIA_STEP_DEADLINE_MS).toBeLessThan(MEDIA_STEP_MAX_DURATION*1000-10000);expect(MEDIA_STEP_LEASE_SECONDS*1000).toBeGreaterThan(MEDIA_STEP_DEADLINE_MS+30000);
});
it('无值、错值、session/UA和短秘密不能授权；关闭时零执行',async()=>{
 const tick=vi.fn();for(const headers of [{},{authorization:'Bearer wrong'},{cookie:'session=fake','user-agent':'cron'}]){
 const r=await createMediaStepHandler({secret:()=>secret,enabled:()=>true,tick})(request({headers:headers as Record<string,string>}));expect(r.status).toBe(401)}
 expect((await createMediaStepHandler({secret:()=>'',enabled:()=>true,tick})(request())).status).toBe(503);
 expect((await createMediaStepHandler({secret:()=>secret,enabled:()=>false,tick})(request())).status).toBe(503);expect(tick).not.toHaveBeenCalled();
});
it('任意查询/正文/方法拒绝，错误摘要不泄密',async()=>{
 const tick=vi.fn(async()=>{throw Error('private token prompt URL')});const h=createMediaStepHandler({secret:()=>secret,enabled:()=>true,tick});
 expect((await h(request({},'https://app.invalid/api/internal/media/step?task=any'))).status).toBe(400);
 expect((await h(request({body:'{"task":"any"}'}))).status).toBe(400);expect((await h(request({method:'GET'}))).status).toBe(405);expect(tick).not.toHaveBeenCalled();
 const r=await h(request());expect(r.status).toBe(503);expect(await r.text()).not.toContain('private');
});
it('客户端abort传给工作并等待清理，不悬空返回',async()=>{
 const controller=new AbortController();let cleaned=false;const tick=vi.fn(async(signal:AbortSignal)=>{await new Promise<void>(resolve=>signal.addEventListener('abort',()=>{cleaned=true;resolve()},{once:true}));return {processed:false}});
 const pending=createMediaStepHandler({secret:()=>secret,enabled:()=>true,tick})(request({signal:controller.signal}));await Promise.resolve();controller.abort();await pending;expect(cleaned).toBe(true);
});

it('接受pg_net固定空JSON包，拒绝额外字段和慢正文abort后清理',async()=>{
 const tick=vi.fn(async()=>({processed:false})),h=createMediaStepHandler({secret:()=>secret,enabled:()=>true,tick});
 expect((await h(request({body:'{}',headers:{authorization:`Bearer ${secret}`,'content-type':'application/json','content-length':'2'}}))).status).toBe(200);
 expect((await h(request({body:'{ }'}))).status).toBe(400);
 const c=new AbortController();let cancelled=false;const stream=new ReadableStream({cancel(){cancelled=true}});const r=new Request('https://app.invalid/api/internal/media/step',{method:'POST',headers:{authorization:`Bearer ${secret}`},body:stream,signal:c.signal,duplex:'half'} as RequestInit);const pending=h(r);await Promise.resolve();c.abort();expect((await pending).status).toBe(503);expect(cancelled).toBe(true);
});
it('内部85秒deadline触发后等待工作清理再503，仍留函数收尾宽限',async()=>{
 vi.useFakeTimers();try{let cleaned=false,returned=false;const tick=async(signal:AbortSignal)=>{await new Promise<void>(resolve=>signal.addEventListener('abort',()=>setTimeout(()=>{cleaned=true;resolve()},5),{once:true}));return {processed:false}};const pending=createMediaStepHandler({secret:()=>secret,enabled:()=>true,tick})(request()).then(r=>{returned=true;return r});await vi.advanceTimersByTimeAsync(MEDIA_STEP_DEADLINE_MS);expect(returned).toBe(false);await vi.advanceTimersByTimeAsync(5);expect((await pending).status).toBe(503);expect(cleaned).toBe(true)}finally{vi.useRealTimers()}
});
