import {it,expect,vi} from 'vitest';
import {MediaGenerationController,createMediaClient,readMediaRecovery,type MediaDraft} from './media-client';
const user='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const draft:MediaDraft={model:'gpt-image-2',mode:'text_to_image',prompt:'合成图片',locale:'zh-CN',files:[],selectionVersion:1};
const uploadFixture=(inputId:string)=>({version:2,backend:'supabase',method:'PUT',inputId,uploadUrl:`https://svlhstoiirtsutmmanrn.supabase.co/storage/v1/object/upload/sign/media-staging/media/staging/${user}/${inputId}?token=synthetic-upload`,requiredHeaders:{'Content-Type':'image/png'},expiresAt:new Date(Date.now()+7199000).toISOString(),objectKey:`media/staging/${user}/${inputId}`,bucket:'media-staging',maxBytes:8388608});
const ready=()=>({version:1,pricingAvailable:true,capabilities:[{mode:'text_to_image',model:'gpt-image-2',enabled:true,parameters:{quality:['1k'],size:['2:3'],n:[1]}}]});
const deferred=<T,>()=>{let resolve!:(v:T)=>void;const promise=new Promise<T>(r=>{resolve=r});return {promise,resolve}};
const setup=(fetcher:typeof fetch)=>{sessionStorage.clear();const c=new MediaGenerationController(createMediaClient(fetcher,['svlhstoiirtsutmmanrn.supabase.co']),sessionStorage);c.account(user,1);c.draft(draft);c.selectTuple();c.consent(true);return c};
const response=(b:unknown,status=200)=>new Response(JSON.stringify(b),{status});

it('媒体 GET 遇到认证 503 后仍可查询原 ID，明确 401 才清除恢复记录',async()=>{
 sessionStorage.clear();
 const original=JSON.stringify({version:1,userId:user,savedAt:Date.now(),taskId:user});
 sessionStorage.setItem('media-generation-recovery',original);
 const denied=vi.fn();
 const fetcher=vi.fn<(url:RequestInfo|URL,init?:RequestInit)=>Promise<Response>>()
  .mockResolvedValueOnce(response({code:'account_unavailable'},503))
  .mockResolvedValueOnce(response({taskId:user,status:'waiting',creditState:'reserved'}))
  .mockResolvedValueOnce(response({code:'unauthorized'},401));
 const controller=new MediaGenerationController(createMediaClient(fetcher),sessionStorage,()=>1,denied);
 controller.account(user,1);
 await controller.recover();
 expect(controller.snapshot()).toMatchObject({status:'stopped',task:{taskId:user},error:'account_unavailable'});
 expect(sessionStorage.getItem('media-generation-recovery')).toBe(original);
 expect(denied).not.toHaveBeenCalled();
 await controller.recover();
 expect(controller.snapshot()).toMatchObject({status:'pending',task:{taskId:user},error:null});
 await controller.recover();
 expect(controller.snapshot().task).toBeNull();
 expect(denied).toHaveBeenCalledExactlyOnceWith(1);
 expect(sessionStorage.getItem('media-generation-recovery')).toBeNull();
 expect(fetcher.mock.calls.map(([url,init])=>[url,init?.method])).toEqual(
  Array.from({length:3},()=>[`/api/media/tasks/${user}`,'GET']),
 );
 controller.dispose();
});

it('创建遇到认证 503 时保留已有幂等键和原始提交，显式重放后继续按原 ID 查询',async()=>{
 const posts: {key:string|null;body:BodyInit|null|undefined}[]=[];
 const fetcher=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{
  const path=String(url);
  if(path.endsWith('/capabilities'))return response(ready());
  if(path.endsWith('/quotes'))return response({quoteToken:'fixture',credits:2,expiresAt:new Date(Date.now()+300000).toISOString()});
  if(path.endsWith('/tasks')){
   posts.push({key:new Headers(init?.headers).get('idempotency-key'),body:init?.body});
   if(posts.length===1)return response({code:'account_unavailable'},503);
  }
  return response({taskId:user,status:'waiting',creditState:'reserved'});
 });
 const controller=setup(fetcher);
 await controller.capabilities();await controller.quote();await controller.confirm();
 expect(controller.snapshot().status).toBe('unknown');
 expect(readMediaRecovery(sessionStorage,user)?.key).toBe(posts[0].key);
 await controller.confirm();
 expect(posts).toHaveLength(1);
 await controller.recover();
 expect(posts).toEqual([posts[0],posts[0]]);
 await controller.recover();
 expect(fetcher.mock.calls.at(-1)).toEqual([`/api/media/tasks/${user}`,expect.objectContaining({method:'GET'})]);
 controller.dispose();
});

it('报价确认后双击只一次新建，正常响应仍完成；刷新包不含token/URL',async()=>{
 const create=deferred<Response>();const fetcher=vi.fn(async(url:RequestInfo|URL)=>String(url).endsWith('capabilities')?response(ready()):String(url).endsWith('quotes')?response({quoteToken:'synthetic-token',credits:2,expiresAt:new Date(Date.now()+300000).toISOString()}):create.promise);
 const c=setup(fetcher);await c.capabilities();await c.quote();expect(c.snapshot().status).toBe('confirm');const first=c.confirm();await c.confirm();expect(fetcher.mock.calls.filter(x=>String(x[0]).endsWith('/tasks'))).toHaveLength(1);const stored=sessionStorage.getItem('media-generation-recovery')!;expect(stored).not.toMatch(/synthetic-token|quoteToken|https:|uploadUrl/);create.resolve(response({taskId:user,status:'waiting',creditState:'reserved'}));await first;expect(c.snapshot().task?.taskId).toBe(user);expect(c.snapshot().status).toBe('pending');c.dispose();
});
it('旧账户与旧quote回调无效，未知重放复用原key/payload并且停止等待不退款',async()=>{
 const quote=deferred<Response>();let creates=0;const bodies:string[]=[],keys:string[]=[];
 const f=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{if(String(url).endsWith('capabilities'))return response(ready());if(String(url).endsWith('quotes'))return quote.promise.then(r=>r.clone());bodies.push(String(init?.body));keys.push(new Headers(init?.headers).get('Idempotency-Key')!);creates++;if(creates===1)throw Error('lost response');return response({taskId:user,status:'reconciling',creditState:'reserved'})});
 const c=setup(f);await c.capabilities();const pending=c.quote();c.draft({...draft,prompt:'已替换'});quote.resolve(response({quoteToken:'old-token',credits:2,expiresAt:new Date(Date.now()+300000).toISOString()}));await pending;expect(c.snapshot().quote).toBeNull();await c.quote();await c.confirm();expect(c.snapshot().status).toBe('unknown');c.stop();await c.recover();expect(keys[0]).toBe(keys[1]);expect(bodies[0]).toBe(bodies[1]);expect(c.snapshot().task?.creditState).toBe('reserved');c.account('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',2);expect(c.snapshot().task).toBeNull();expect(sessionStorage.getItem('media-generation-recovery')).toBeNull();c.dispose();
});
it('刷新只恢复本人最小原任务ID，不自动POST；伪造/跨账户/过期包拒绝',async()=>{
 const f=vi.fn(async()=>response(ready())),c=setup(f);sessionStorage.setItem('media-generation-recovery',JSON.stringify({version:1,userId:user,savedAt:Date.now(),taskId:user}));const next=new MediaGenerationController(createMediaClient(f),sessionStorage);next.account(user,2);expect(next.snapshot().task?.taskId).toBe(user);expect(f).not.toHaveBeenCalled();expect(readMediaRecovery(sessionStorage,'other')).toBeNull();sessionStorage.setItem('media-generation-recovery',JSON.stringify({version:1,userId:user,savedAt:Date.now()-86400001,taskId:user}));expect(readMediaRecovery(sessionStorage,user)).toBeNull();next.dispose();c.dispose();
});

it('提交中切换账户或编辑草稿后，晚成功不得复活旧任务；仍保留原意图显式恢复',async()=>{
 const pending=deferred<Response>();const f=vi.fn(async(url:RequestInfo|URL)=>String(url).endsWith('capabilities')?response(ready()):String(url).endsWith('quotes')?response({quoteToken:'offline',credits:2,expiresAt:new Date(Date.now()+300000).toISOString()}):pending.promise);const c=setup(f);await c.capabilities();await c.quote();const submit=c.confirm();c.draft({...draft,prompt:'新内容'});expect(c.snapshot().status).toBe('unknown');expect(c.originalSubmission()?.prompt).toBe(draft.prompt);c.account('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',2);pending.resolve(response({taskId:user,status:'waiting',creditState:'reserved'}));await submit;expect(c.snapshot().task).toBeNull();expect(sessionStorage.getItem('media-generation-recovery')).toBeNull();c.dispose();
});
it('正常图生图严格先上传并sealed，再报价确认；PUT不带本站凭据',async()=>{
 const input='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';const order:string[]=[];
 const f=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{const path=String(url);order.push(path);if(path.endsWith('/capabilities'))return response({capabilities:[{mode:'image_to_image',model:'gpt-image-2',enabled:true,parameters:{quality:['1k'],size:['2:3'],n:[1]}}]});if(path.endsWith('/inputs/sign'))return response(uploadFixture(input));if(path===uploadFixture(input).uploadUrl){expect(init?.credentials).toBe('omit');expect(init?.method).toBe('PUT');expect(init?.body).toBeInstanceOf(ArrayBuffer);expect(init?.redirect).toBe('error');expect(new Headers(init?.headers).has('Authorization')).toBe(false);return response({})}if(path.endsWith('/complete'))return response({inputId:input,status:'ready'});if(path.endsWith('/quotes')){expect(JSON.parse(String(init?.body)).inputIds).toEqual([input]);return response({quoteToken:'offline-only',credits:2,expiresAt:new Date(Date.now()+300000).toISOString()})}return response({taskId:user,status:'waiting',creditState:'reserved'})});
 const c=setup(f);c.draft({...draft,mode:'image_to_image',files:[new File(['png fixture'],'image.png',{type:'image/png'})],selectionVersion:2});c.selectTuple();c.consent(true);await c.capabilities();await c.quote();expect(c.snapshot().status).toBe('confirm');expect(order).toEqual(['/api/media/capabilities','/api/media/inputs/sign',uploadFixture(input).uploadUrl,`/api/media/inputs/${input}/complete`,'/api/media/quotes']);await c.confirm();expect(c.snapshot().task?.taskId).toBe(user);c.dispose();
});

it('同一客户端视频文/单图报价→一次create→原ID GET→合成done；输入摘要后封存',async()=>{
 for(const mode of ['text_to_video','image_to_video'] as const){
  const input='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',order:string[]=[],creates:Record<string,unknown>[]=[];
  const f=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{const path=String(url);order.push(path);if(path.endsWith('/capabilities'))return response({capabilities:[{mode,model:'grok-imagine-video-1.5',enabled:true,parameters:{durationSeconds:[1],resolution:['480p']}}]});if(path.endsWith('/inputs/sign')){expect(JSON.parse(String(init?.body)).sha256).toMatch(/^[a-f0-9]{64}$/);return response(uploadFixture(input))}if(path===uploadFixture(input).uploadUrl)return response({});if(path.endsWith('/complete'))return response({inputId:input,status:'ready'});if(path.endsWith('/quotes')){const request=JSON.parse(String(init?.body));expect(request.parameters).toEqual({durationSeconds:1,resolution:'480p'});expect(request.model).toBe('grok-imagine-video-1.5');expect(request.inputIds).toEqual(mode==='image_to_video'?[input]:[]);return response({quoteToken:'video-synthetic',credits:7,expiresAt:new Date(Date.now()+300000).toISOString()})}if(init?.method==='POST'){creates.push(JSON.parse(String(init?.body)));return response({taskId:user,status:'waiting',creditState:'reserved'})}return response({taskId:user,status:'done',creditState:'settled',result:{url:'https://results.example.com/synthetic.mp4',mimeType:'video/mp4',expiresAt:new Date(Date.now()+100000).toISOString()}})});
  const c=setup(f);c.draft({...draft,model:'grok-imagine-video-1.5',mode,files:mode==='image_to_video'?[new File(['synthetic PNG'],'first.png',{type:'image/png'})]:[]});c.selectTuple();c.consent(true);await c.capabilities();await c.quote();expect(c.snapshot().quote?.credits).toBe(7);await c.confirm();await c.recover();expect(c.snapshot().status).toBe('done');expect(c.snapshot().task?.result?.mimeType).toBe('video/mp4');expect(creates).toHaveLength(1);if(mode==='image_to_video')expect(order.indexOf(`/api/media/inputs/${input}/complete`)).toBeLessThan(order.indexOf('/api/media/quotes'));c.dispose();
 }
});
it('视频unknown同原token/key/body重放，视频恢复包不存token且既有图片包兼容',async()=>{
 let creates=0;const bodies:string[]=[],keys:string[]=[];const f=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{if(String(url).endsWith('/capabilities'))return response({capabilities:[{mode:'text_to_video',model:'grok-imagine-video-1.5',enabled:true,parameters:{durationSeconds:[1],resolution:['480p']}}]});if(String(url).endsWith('/quotes'))return response({quoteToken:'video-secret-token',credits:7,expiresAt:new Date(Date.now()+300000).toISOString()});bodies.push(String(init?.body));keys.push(new Headers(init?.headers).get('Idempotency-Key')!);if(++creates===1)throw Error('lost');return response({taskId:user,status:'waiting',creditState:'reserved'})});
 const c=setup(f);c.draft({...draft,model:'grok-imagine-video-1.5',mode:'text_to_video'});c.selectTuple();c.consent(true);await c.capabilities();await c.quote();await c.confirm();expect(c.snapshot().status).toBe('unknown');expect(sessionStorage.getItem('media-generation-recovery')).not.toContain('video-secret-token');expect(readMediaRecovery(sessionStorage,user)?.request?.model).toBe('grok-imagine-video-1.5');await c.recover();expect(bodies[0]).toBe(bodies[1]);expect(keys[0]).toBe(keys[1]);c.dispose();
});

it('拒绝不带受限上传合同的URL，不能向任意HTTPS主机上传',async()=>{
 const f=vi.fn(async()=>response({inputId:user,uploadUrl:'https://attacker.invalid/staging',requiredHeaders:{'Content-Type':'image/png'}}));
 await expect(createMediaClient(f).upload(new File(['fixture'],'a.png',{type:'image/png'}),new AbortController().signal)).rejects.toThrow('invalid_input');
 expect(f).toHaveBeenCalledTimes(1);
});

it('旧5秒未知提交刷新仅保留原请求供核对，不重新报价或POST',async()=>{
 const f=vi.fn(),r={version:1,userId:user,savedAt:Date.now(),key:user,request:{clientIntentId:user,mediaType:'video',model:'grok-imagine-video-1.5',mode:'text_to_video',prompt:'旧5秒请求',parameters:{durationSeconds:5,resolution:'480p'},inputIds:[],locale:'zh-CN',consent:true,consentVersion:'media-v1'}};
 sessionStorage.setItem('media-generation-recovery',JSON.stringify(r));const c=new MediaGenerationController(createMediaClient(f),sessionStorage);c.account(user,4);expect(c.snapshot().refreshUnknown).toBe(true);expect(c.originalSubmission()?.parameters.durationSeconds).toBe(5);await c.recover();expect(f).not.toHaveBeenCalled();c.dispose();
});

it('成片签名过期只按原ID重新取签名，不新建或再扣费',async()=>{
 const reads:string[]=[];const f=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{expect(init?.method).toBe('GET');reads.push(String(url));return response({taskId:user,status:'done',creditState:'settled',result:{url:`https://results.example.com/result?version=${reads.length}`,mimeType:'video/mp4',expiresAt:new Date(Date.now()+900000).toISOString()}})});
 sessionStorage.setItem('media-generation-recovery',JSON.stringify({version:1,userId:user,savedAt:Date.now(),taskId:user}));const c=new MediaGenerationController(createMediaClient(f),sessionStorage);c.account(user,1);await c.recover();await c.recover();expect(reads).toEqual([`/api/media/tasks/${user}`,`/api/media/tasks/${user}`]);expect(c.snapshot().task?.creditState).toBe('settled');c.dispose();
});

it.each(['text_to_image','text_to_video','image_to_video'] as const)('%s 多次核验和账户网络错误后，只由用户恢复原任务',async mode=>{
 const video=mode.endsWith('_video'),model=video?'grok-imagine-video-1.5':'gpt-image-2';
 const input='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 const release=deferred<Response>();
 const fetcher=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{
  const path=String(url);
  if(path.endsWith('/capabilities'))return response({capabilities:[{mode,model,enabled:true,parameters:video?{durationSeconds:[1],resolution:['480p']}:{quality:['1k'],size:['2:3'],n:[1]}}]});
  if(path.endsWith('/inputs/sign'))return response(uploadFixture(input));
  if(init?.method==='PUT')return response({});
  if(path.endsWith('/complete'))return response({inputId:input,status:'ready'});
  if(path.endsWith('/quotes'))return response({quoteToken:'fixture',credits:3,expiresAt:new Date(Date.now()+100000).toISOString()});
  if(path.endsWith('/tasks'))return response({taskId:user,status:'waiting',creditState:'reserved'});
  return fetcher.mock.calls.filter(([url])=>String(url).endsWith(`/tasks/${user}`)).length===1
   ?release.promise:response({taskId:user,status:'waiting',creditState:'reserved'});
 });
 const controller=setup(fetcher);
 controller.draft({...draft,mode,model,files:mode==='image_to_video'?[new File(['合成帧'],'frame.png',{type:'image/png'})]:[]});
 controller.selectTuple();
 controller.consent(true);
 await controller.capabilities();
 await controller.quote();
 await controller.confirm();
 const original=sessionStorage.getItem('media-generation-recovery');
 const reading=controller.recover();
 const readSignal=fetcher.mock.calls.at(-1)?.[1]?.signal;
 controller.account(null,2,true);
 expect(readSignal?.aborted).toBe(true);
 expect(controller.snapshot()).toMatchObject({task:null,selected:false,consent:false,quote:null,capabilities:[]});
 await controller.recover();
 controller.account(null,3,true);
 controller.account(user,3);
 controller.account(null,4,true);
 controller.account(user,4);
 release.resolve(response({taskId:user,status:'done',creditState:'settled',result:{url:'https://fixtures.invalid/old.png'}}));
 await reading;
 expect(controller.snapshot()).toMatchObject({status:'stopped',task:{taskId:user},selected:false,consent:false});
 expect(sessionStorage.getItem('media-generation-recovery')).toBe(original);
 await controller.capabilities();
 await controller.quote();
 await controller.confirm();
 await controller.recover();
 expect(fetcher.mock.calls.filter(([url])=>String(url).endsWith('/tasks'))).toHaveLength(1);
 expect(fetcher.mock.calls.filter(([url])=>String(url).endsWith(`/tasks/${user}`))).toHaveLength(2);
 controller.dispose();
});

it('输入、迟到报价与能力在同一账号核验时失效',async()=>{
 const input='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 const quote=deferred<Response>();
 const capability=deferred<Response>();
 let reads=0;
 const fetcher=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{
  const path=String(url);
  if(path.endsWith('/capabilities'))return ++reads===1?response({
   capabilities:[{mode:'image_to_image',model:'gpt-image-2',enabled:true,parameters:{quality:['1k'],size:['2:3'],n:[1]}}],
  }):capability.promise;
  if(path.endsWith('/inputs/sign'))return response(uploadFixture(input));
  if(init?.method==='PUT')return response({});
  if(path.endsWith('/complete'))return response({inputId:input,status:'ready'});
  return quote.promise;
 });
 const controller=setup(fetcher);
 controller.draft({...draft,mode:'image_to_image',files:[new File(['合成图'],'a.png',{type:'image/png'})]});
 controller.selectTuple();
 controller.consent(true);
 await controller.capabilities();
 const quoting=controller.quote();
 await vi.waitFor(()=>expect(fetcher.mock.calls.at(-1)?.[0]).toBe('/api/media/quotes'));
 const quoteSignal=fetcher.mock.calls.at(-1)?.[1]?.signal;
 const reading=controller.capabilities();
 const capabilitySignal=fetcher.mock.calls.at(-1)?.[1]?.signal;
 controller.account(null,2,true);
 controller.account(user,2);
 expect(quoteSignal?.aborted).toBe(true);
 expect(capabilitySignal?.aborted).toBe(true);
 capability.resolve(response(ready()));
 quote.resolve(response({quoteToken:'fixture',credits:3,expiresAt:new Date(Date.now()+100000).toISOString()}));
 await Promise.all([reading,quoting]);
 expect(controller.snapshot()).toMatchObject({capabilities:[],quote:null,selected:false,consent:false});
 expect(controller.inputNeedsSelection()).toBe(true);
 controller.draft({...draft,mode:'image_to_image',files:[new File(['新合成图'],'b.png',{type:'image/png'})],selectionVersion:2});
 expect(controller.inputNeedsSelection()).toBe(false);
 controller.dispose();
});

it('任务查询收到 HTTP 401 时清除恢复记录并通知账号会话',async()=>{
 const fetcher=vi.fn(async()=>new Response(null,{status:401}));
 const expire=vi.fn();
 sessionStorage.setItem('media-generation-recovery',JSON.stringify({version:1,userId:user,savedAt:Date.now(),taskId:user}));
 const controller=new MediaGenerationController(createMediaClient(fetcher),sessionStorage,()=>1,expire);
 controller.account(user,1);
 await controller.recover();
 expect(expire).toHaveBeenCalledWith(1);
 expect(controller.snapshot()).toMatchObject({task:null,quote:null,error:'unauthorized'});
 expect(sessionStorage.getItem('media-generation-recovery')).toBeNull();
 await controller.recover();
 expect(fetcher).toHaveBeenCalledTimes(1);
 controller.dispose();
});

it.each(['waiting','unknown'] as const)('全局退出与重登合并为一次渲染时也清除 %s 的内存状态',async status=>{
 let revision=0;
 const storage={
  accountRevision:()=>revision,
  getItem:(key:string)=>sessionStorage.getItem(key),
  setItem:(key:string,value:string)=>sessionStorage.setItem(key,value),
  removeItem:(key:string)=>sessionStorage.removeItem(key),
 };
 const fetcher=vi.fn(async(url:RequestInfo|URL)=>{
  const path=String(url);
  if(path.endsWith('/capabilities'))return response(ready());
  if(path.endsWith('/quotes'))return response({quoteToken:'fixture',credits:3,expiresAt:new Date(Date.now()+100000).toISOString()});
  if(status==='unknown')throw new Error('替身丢失提交响应');
  return response({taskId:user,status:'waiting',creditState:'reserved'});
 });
 const controller=new MediaGenerationController(createMediaClient(fetcher),storage);
 controller.account(user,1);
 controller.draft(draft);
 controller.selectTuple();
 controller.consent(true);
 await controller.capabilities();
 await controller.quote();
 await controller.confirm();
 expect(controller.snapshot().status).toBe(status==='waiting'?'pending':'unknown');
 revision++;
 sessionStorage.removeItem('media-generation-recovery');
 // 组件没渲染中间的退出状态，只收到同账号的新会话。
 controller.account(user,3);
 expect(controller.snapshot()).toMatchObject({status:'idle',task:null,refreshUnknown:false,quote:null,consent:false});
 expect(controller.originalSubmission()).toBeUndefined();
 await controller.recover();
 expect(fetcher.mock.calls.filter(([url])=>String(url).includes('/tasks'))).toHaveLength(1);
 controller.dispose();
});
