// @vitest-environment node
import {it,expect,vi} from 'vitest';
import sharp from 'sharp';
import {createSharpMediaDecoder} from './media-decoder';
import {createMediaRuntime,getMediaRuntime,type MediaRuntimeConfig} from './media-runtime';
import {createMediaHandlers} from './media-tasks';
import {createMediaProcessor} from '../inngest/media-functions';
import {createUnifiedCreationSource} from './media-creations-source';
import type {TaskRecord,MediaRequest} from './media-contracts';
import type {MediaStore} from './media-persistence';
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',user='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const economics={tariffVersion:'offline-v1',credits:2,providerUpperCents:5,dailyCapCents:10,budgetApprovalRef:'offline-budget',providerAccountRef:'offline-account'};
const config:MediaRuntimeConfig={creationEnabled:true,schemaApproved:true,approvalRef:'offline-only',environmentRef:'offline',storageApprovalRef:'offline',decoderApprovalRef:'offline',transportApprovalRef:'offline',providerKey:'offline-key',providerAccountRef:'offline-account',quoteKey:Buffer.alloc(32,3),inputHosts:['inputs.example.com'],resultHosts:['results.example.com'],consentVersion:'media-v1',modes:{text_to_image:{approvalRef:'offline-mode',validUntil:new Date(Date.now()+300000).toISOString(),economics}}};
const payload:MediaRequest={clientIntentId:id,mediaType:'image',model:'gpt-image-2',mode:'text_to_image',prompt:'测试',parameters:{quality:'1k',size:'2:3',n:1},inputIds:[],locale:'zh-CN',consent:true,consentVersion:'media-v1'};
const req=(path:string,b?:unknown)=>new Request(`https://app.example/api/media/${path}`,{method:b?'POST':'GET',headers:{origin:'https://app.example','Content-Type':'application/json','Idempotency-Key':'offline-idempotency-key'},...(b?{body:JSON.stringify(b)}:{})});
const resources=()=>{
 let task:TaskRecord|null=null;
 const store={ready:async()=>true,inputHashes:async()=>[],identities:async()=>task?[task]:[],replay:async()=>task,create:async(_u:string,key:string,r:MediaRequest,hash:string,quote:TaskRecord['quote'])=>{task={id,user_id:user,model:r.model,mode:r.mode,media_type:'image',request:r,request_hash:hash,quote,provider_account_ref:economics.providerAccountRef,client_idempotency_key:key,input_id:null,status:'reserved',credit_state:'reserved',state_version:1,created_at:new Date().toISOString(),updated_at:new Date().toISOString()} as TaskRecord;return {task,replayed:false}},recovery:async()=>task?.credit_state==='reserved'?task:null,claim:async()=>{const submit=task?.status==='reserved';if(submit)task={...task!,status:'submitting',submission:{prompt:payload.prompt,payloadHash:'offline'}};return {task,submit}},transition:async(_t:TaskRecord,next:{status:TaskRecord['status'];taskId?:string;locator?:string;error?:string})=>{task={...task!,status:next.status,error_code:next.error??null,provider_task_id:next.taskId??task!.provider_task_id,result_locator:next.locator??task!.result_locator};return task},complete:async(_t:TaskRecord,result:{key:string;mime:string})=>{task={...task!,status:'done',credit_state:'settled',result_key:result.key,result_mime:result.mime};return task},read:async()=>task} as unknown as MediaStore;
 const http=vi.fn(async(r:{method:string})=>({status:r.method==='POST'?202:200,body:Buffer.from(JSON.stringify({task_id:'provider-original',status:r.method==='POST'?'submitted':'completed',result_urls:['https://results.example.com/a.png']}))}));
 const objects={read:async()=> (async function*(){yield Buffer.alloc(0)})(),putImmutable:vi.fn(async()=>{}),signPut:async()=>'',signGet:vi.fn(async()=> 'https://inputs.example.com/fresh?synthetic=1')};
 const transport={resolve:vi.fn(async()=>[{address:'8.8.8.8',family:4 as const}]),request:vi.fn(async()=>({status:200,contentType:'image/png',body:(async function*(){yield Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(4),Buffer.from('IHDR'),Buffer.alloc(8)])})()}))};
 return {store,http,objects,transport,decoder:vi.fn(async()=>({mime:'image/png',width:1,height:1,frames:1}))};
};
it('完整runtime贯通报价→创建→同worker原ID处理→D1签名；单独API依赖不足',async()=>{
 const deps=resources();const bytes=await sharp({create:{width:24,height:36,channels:3,background:'white'}}).png().toBuffer();deps.transport.request.mockImplementation(async()=>({status:200,contentType:'image/png',body:(async function*(){yield Buffer.from(bytes)})()}));const runtime=createMediaRuntime({config,...deps,decoder:createSharpMediaDecoder()});const handlers=createMediaHandlers({...runtime,currentUser:async()=>({id:user}),limit:()=>true,emit:async()=>{}});
 const quote=await (await handlers.quotes(req('quotes',payload))).json();expect(quote.credits).toBe(2);
 const created=await handlers.create(req('tasks',{...payload,quoteToken:quote.quoteToken}));expect(created.status).toBe(202);
 const run=createMediaProcessor(runtime.store,runtime.providers,runtime.storage);await run(id);await run(id);expect(deps.http).toHaveBeenCalledTimes(2);expect(deps.http.mock.calls.map(c=>c[0].method)).toEqual(['POST','GET']);expect(deps.objects.putImmutable).toHaveBeenCalledTimes(1);
 const row=await deps.store.read(user,id);expect(row?.status).toBe('done');const source=createUnifiedCreationSource({execute:async()=>[{data:row}],transaction:async()=>{throw Error()}} as never,undefined,runtime.storage.sign);const creation=await source.read(user,`media:${id}`);expect(creation?.result?.url).toContain('fresh');
 const empty=createMediaRuntime({config:{...config,creationEnabled:false},store:deps.store});await expect(empty.storage.sign('x','image/png')).rejects.toThrow();
});
it('缺任一批准/密钥/资源/adapter/价目/host都关闭，报价503且零外呼',async()=>{
 const cases:Partial<MediaRuntimeConfig>[]=[{creationEnabled:false},{schemaApproved:false},{approvalRef:''},{environmentRef:''},{storageApprovalRef:''},{decoderApprovalRef:''},{transportApprovalRef:''},{providerKey:''},{providerAccountRef:''},{quoteKey:undefined},{inputHosts:[]},{resultHosts:[]},{modes:{}},{modes:{text_to_image:{approvalRef:'',validUntil:new Date(Date.now()+300000).toISOString(),economics}}},{modes:{text_to_image:{approvalRef:'offline',validUntil:new Date(Date.now()+300000).toISOString(),economics:{...economics,dailyCapCents:0}}}}];
 for(const patch of cases){const deps=resources(),runtime=createMediaRuntime({config:{...config,...patch},...deps});const h=createMediaHandlers({...runtime,currentUser:async()=>({id:user}),limit:()=>true,emit:async()=>{}});expect((await h.capabilities(req('capabilities'))).status).toBe(503);expect((await h.quotes(req('quotes',payload))).status).toBe(503);expect(deps.http).not.toHaveBeenCalled()}
 for(const patch of [{objects:undefined},{decoder:undefined},{transport:undefined},{providers:{get:()=>undefined}}]){const deps=resources(),r=createMediaRuntime({config,...deps,...patch});expect(r.catalog.enabled).toBe(false);expect(deps.http).not.toHaveBeenCalled()}
});
it('关闭新建仍保留原账户GET与已有结果签名，默认装配只读构造无外呼',async()=>{
 const deps=resources(),r=createMediaRuntime({config:{...config,creationEnabled:false},...deps});expect(r.catalog.enabled).toBe(false);expect(r.providers.get('gpt-image-2')).toBeDefined();await expect(r.storage.sign('media/results/a','image/png')).resolves.toHaveProperty('url');expect(deps.http).not.toHaveBeenCalled();expect(getMediaRuntime).toBeTypeOf('function');
});

it('存储失败保原ID与预留，下一次仅存储而不重新生成',async()=>{
 const deps=resources(),r=createMediaRuntime({config,...deps}),h=createMediaHandlers({...r,currentUser:async()=>({id:user}),limit:()=>true,emit:async()=>{}});const q=await(await h.quotes(req('quotes',payload))).json();await h.create(req('tasks',{...payload,quoteToken:q.quoteToken}));const run=createMediaProcessor(r.store,r.providers,r.storage);
 deps.objects.putImmutable.mockRejectedValueOnce(Error('offline store failure'));await run(id);await run(id);let row=await deps.store.read(user,id);expect(row?.provider_task_id).toBe('provider-original');expect(row?.credit_state).toBe('reserved');expect(row?.status).toBe('reconciling');await run(id);expect(deps.http.mock.calls.map(c=>c[0].method)).toEqual(['POST','GET']);expect((await deps.store.read(user,id))?.status).toBe('done');
});
it('原结果URL过期只GET同provider ID刷新，不重POST且保留预留直至存储完成',async()=>{
 const deps=resources(),r=createMediaRuntime({config,...deps}),h=createMediaHandlers({...r,currentUser:async()=>({id:user}),limit:()=>true,emit:async()=>{}});const q=await(await h.quotes(req('quotes',payload))).json();await h.create(req('tasks',{...payload,quoteToken:q.quoteToken}));const run=createMediaProcessor(r.store,r.providers,r.storage);
 await run(id);deps.transport.request.mockResolvedValueOnce({status:403,contentType:'image/png',body:(async function*(){yield Buffer.alloc(0)})()});await run(id);expect((await deps.store.read(user,id))?.error_code).toBe('media_download_expired');expect((await deps.store.read(user,id))?.credit_state).toBe('reserved');await run(id);expect(deps.http.mock.calls.map(c=>c[0].method)).toEqual(['POST','GET','GET']);expect((await deps.store.read(user,id))?.status).toBe('done');
});
import {createHash} from 'node:crypto';
import {createMediaInputs} from './media-inputs';
import {PgDialect} from 'drizzle-orm/pg-core';
import type {InputRecord,MediaExecutor} from './media-contracts';
it('实际输入封存实现把staging复制至不可变sealed，晚PUT不改变ready输入',async()=>{
 const bytes=await sharp({create:{width:8,height:12,channels:3,background:'white'}}).png().toBuffer();let record:InputRecord;const objectsMap=new Map<string,Buffer>();
 const database:MediaExecutor={async execute(query){const q=new PgDialect().sqlToQuery(query);if(q.sql.startsWith('INSERT INTO media_inputs')){const [id,user,key,mime,size,sha,expires]=q.params;record={id,user_id:user,staging_key:key,expected_mime:mime,expected_bytes:size,expected_sha256:sha,expires_at:expires,status:'uploading',sealed_key:null,verified_mime:null,verified_bytes:null,verified_sha256:null} as InputRecord;objectsMap.set(String(key),bytes);return [record]}
 if(q.sql.includes("SET status='ready'")){const [key,mime,size,sha]=q.params;record={...record,status:'ready',sealed_key:String(key),verified_mime:String(mime),verified_bytes:Number(size),verified_sha256:String(sha)}}return [record]}};
 const store={database,input:async(u:string,i:string)=>record.user_id===u&&record.id===i?record:null} as unknown as MediaStore;
 const objects={async read(key:string){return (async function*(){yield Buffer.from(objectsMap.get(key)!)})()},async putImmutable(key:string,value:Buffer){if(objectsMap.has(key)&&!objectsMap.get(key)!.equals(value))throw Error('immutable conflict');objectsMap.set(key,Buffer.from(value))},async signPut(){return 'https://inputs.example.com/staging'},async signGet(){return 'https://inputs.example.com/sealed'}};
 const inputs=createMediaInputs(store,objects,createSharpMediaDecoder()),signed=await inputs.create(user,{contentType:'image/png',contentLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),purpose:'reference_image'});const first=await inputs.complete(user,signed.inputId);const sealed=record!.sealed_key!;objectsMap.set(record!.staging_key,Buffer.from('late PUT'));expect(objectsMap.get(sealed)).toEqual(bytes);expect(await inputs.complete(user,signed.inputId)).toEqual(first);await expect(inputs.sign(user,signed.inputId)).rejects.toThrow('input_not_uploadable');
});

it('批准价目过期后能力与新建实时关闭，但原ID查询和签名保持',async()=>{
 let now=Date.now();const deps=resources(),r=createMediaRuntime({config,...deps,now:()=>now});expect(r.catalog.enabled).toBe(true);now+=600000;expect(r.catalog.enabled).toBe(false);expect(r.catalog.tariffs.text_to_image).toBeUndefined();expect(r.providers.get('gpt-image-2')).toBeDefined();await expect(r.storage.sign('media/results/a','image/png')).resolves.toHaveProperty('url');expect(deps.http).not.toHaveBeenCalled();
});

it('缺新建decoder/下载依赖不拆除已有对象签名与原账户查询adapter',async()=>{
 const deps=resources(),r=createMediaRuntime({config:{...config,creationEnabled:false,inputHosts:[],resultHosts:[]},store:deps.store,objects:deps.objects,http:deps.http});expect(r.catalog.enabled).toBe(false);expect(r.providers.get('gpt-image-2')).toBeDefined();await expect(r.storage.sign('media/results/original','image/png')).resolves.toHaveProperty('url');await expect(r.storage.store({result_locator:'https://results.example.com/a',media_type:'image'} as TaskRecord)).rejects.toThrow('media_storage_unconfigured');expect(deps.http).not.toHaveBeenCalled();
});

import {runtimeVideoConfig as videoConfig,normalVideo,runtimeVideoDecoder as createVideoMediaDecoder} from './test-fixtures/media-video';
it('视频完整本机注入原ID→完整解码→条件写→done→D1签名，不拆图片装配',async()=>{
 const deps=resources(),bytes=normalVideo();
 const videoPayload:MediaRequest={...payload,mediaType:'video',model:'grok-imagine-video-1.5',mode:'text_to_video',parameters:{durationSeconds:5,resolution:'480p'}};
 const create=deps.store.create.bind(deps.store);deps.store.create=async(...args)=>{const result=await create(...args);result.task.media_type='video';return result};
 deps.http.mockImplementation(async r=>({status:r.method==='POST'?202:200,body:Buffer.from(JSON.stringify({task_id:'video-original',status:r.method==='POST'?'submitted':'completed',model:'grok-imagine-video-1.5',type:'video',output_url:'https://results.example.com/result.mp4'}))}));
 deps.transport.request.mockImplementation(async()=>({status:200,contentType:'video/mp4',body:(async function*(){yield bytes})()}));
 const c={...config,videoDecoder:videoConfig,videoDeploymentApprovalRef:'synthetic-deployment-only',modes:{...config.modes,text_to_video:{approvalRef:'offline-video',validUntil:new Date(Date.now()+300000).toISOString(),economics}}};
 const runtime=createMediaRuntime({config:c,...deps,videoDecoder:createVideoMediaDecoder(videoConfig)}),handlers=createMediaHandlers({...runtime,currentUser:async()=>({id:user}),limit:()=>true,emit:async()=>{}});
 const q=await (await handlers.quotes(req('quotes',videoPayload))).json();expect(q.credits).toBe(2);expect((await handlers.create(req('tasks',{...videoPayload,quoteToken:q.quoteToken}))).status).toBe(202);
 const run=createMediaProcessor(runtime.store,runtime.providers,runtime.storage);await run(id);deps.objects.putImmutable.mockRejectedValueOnce(Error('synthetic storage failure'));await run(id);expect((await deps.store.read(user,id))?.credit_state).toBe('reserved');await run(id);
 const row=await deps.store.read(user,id);expect(row?.status).toBe('done');expect(row?.provider_task_id).toBe('video-original');expect(row?.result_mime).toBe('video/mp4');expect(deps.http.mock.calls.map(c=>c[0].method)).toEqual(['POST','GET']);expect(deps.objects.putImmutable).toHaveBeenLastCalledWith(expect.stringContaining('.mp4'),bytes,'video/mp4');
 const source=createUnifiedCreationSource({execute:async()=>[{data:row}],transaction:async()=>{throw Error()}} as never,undefined,runtime.storage.sign);expect((await source.read(user,`media:${id}`))?.result?.url).toContain('fresh');
 const closed=createMediaRuntime({config:{...c,creationEnabled:false},...deps,videoDecoder:createVideoMediaDecoder(videoConfig)});expect(closed.catalog.enabled).toBe(false);expect((await closed.providers.get('grok-imagine-video-1.5')!.query('video-original',row!)).kind).toBe('complete');await expect(closed.storage.sign(row!.result_key!,'video/mp4')).resolves.toHaveProperty('url');
});
it('key/图片许可不启视频；缺视频binary/部署许可只关视频，价目过期不影响原ID恢复',async()=>{
 const deps=resources();let now=Date.now();const mode={approvalRef:'offline-video',validUntil:new Date(now+1000).toISOString(),economics};
 const c={...config,videoDecoder:videoConfig,videoDeploymentApprovalRef:'offline-only',modes:{...config.modes,text_to_video:mode,image_to_video:mode}};
 for(const patch of [{},{videoDecoder:undefined},{videoDeploymentApprovalRef:''}]){
  const runtime=createMediaRuntime({config:{...c,...patch},...deps});expect(runtime.catalog.adapterModes).toContain('text_to_image');expect(runtime.catalog.adapterModes).not.toContain('text_to_video');expect(runtime.providers.get('grok-imagine-video-1.5')).toBeDefined();
 }
 const runtime=createMediaRuntime({config:c,...deps,videoDecoder:createVideoMediaDecoder(videoConfig),now:()=>now});expect(runtime.catalog.adapterModes).toContain('image_to_video');expect(runtime.inputs).toBeDefined();now+=2000;expect(runtime.catalog.adapterModes).not.toContain('text_to_video');expect(runtime.providers.get('grok-imagine-video-1.5')).toBeDefined();await expect(runtime.storage.sign('media/results/original','video/mp4')).resolves.toHaveProperty('url');
});

import {readMediaRuntimeConfig} from './media-runtime';
it('默认部署配置读取视频可信binary与独立模式；key本身不开启，坏视频配置不影响图片',()=>{
 const c={...config,videoDecoder:videoConfig,videoDeploymentApprovalRef:'offline-deployment',modes:{...config.modes,text_to_video:{approvalRef:'offline-mode',validUntil:new Date(Date.now()+300000).toISOString(),economics}}};
 const read=readMediaRuntimeConfig({NODE_ENV:'test',MEDIA_RUNTIME_CONFIG:JSON.stringify(c),MEDIA_ROUTER_API_KEY:'synthetic-key',MEDIA_CREATE_ENABLED:'1',MEDIA_QUOTE_HMAC_HEX:'03'.repeat(32)});expect(read.videoDecoder).toEqual(videoConfig);expect(read.modes.text_to_video?.economics.credits).toBe(2);expect(read.creationEnabled).toBe(true);
 expect(readMediaRuntimeConfig({NODE_ENV:'test',MEDIA_ROUTER_API_KEY:'synthetic-only'}).creationEnabled).toBe(false);
 const invalid=readMediaRuntimeConfig({NODE_ENV:'test',MEDIA_RUNTIME_CONFIG:JSON.stringify({...c,videoDecoder:{approvalRef:'bad'}})});expect(invalid.videoDecoder).toBeUndefined();expect(invalid.modes.text_to_image).toBeDefined();
});

it('单sealed首帧视频复用上传身份与原任务processor，签名失败保reserved且不POST',async()=>{
 for(const signingFails of [false,true]){
  const deps=resources(),input='dddddddd-dddd-4ddd-8ddd-dddddddddddd',bytes=normalVideo();
  const request:MediaRequest={...payload,mediaType:'video',model:'grok-imagine-video-1.5',mode:'image_to_video',parameters:{durationSeconds:5,resolution:'480p'},inputIds:[input]};
  deps.store.input=async(u,i)=>{if(u!==user||i!==input)throw Error('synthetic input not found');return {id:input,user_id:user,status:'ready',sealed_key:'media/inputs/'+user+'/sealed',verified_sha256:'f'.repeat(64)} as InputRecord};deps.store.inputHashes=async()=>['f'.repeat(64)];
  const create=deps.store.create.bind(deps.store);deps.store.create=async(...args)=>{const result=await create(...args);result.task.media_type='video';result.task.input_id=input;return result};
  if(signingFails)deps.objects.signGet.mockRejectedValueOnce(Error('synthetic signing failure'));
  deps.http.mockImplementation(async r=>({status:200,body:Buffer.from(JSON.stringify({task_id:'video-firstframe',status:r.method==='POST'?'submitted':'completed',output_url:'https://results.example.com/result.mp4'}))}));deps.transport.request.mockImplementation(async()=>({status:200,contentType:'video/mp4',body:(async function*(){yield bytes})()}));
  const c={...config,videoDecoder:videoConfig,videoDeploymentApprovalRef:'offline',modes:{image_to_video:{approvalRef:'offline',validUntil:new Date(Date.now()+300000).toISOString(),economics}}};const runtime=createMediaRuntime({config:c,...deps,videoDecoder:createVideoMediaDecoder(videoConfig)}),h=createMediaHandlers({...runtime,currentUser:async()=>({id:user}),limit:()=>true,emit:async()=>{}});const q=await(await h.quotes(req('quotes',request))).json();expect((await h.create(req('tasks',{...request,quoteToken:q.quoteToken}))).status).toBe(202);
  const run=createMediaProcessor(runtime.store,runtime.providers,runtime.storage);await run(id);if(signingFails){expect(deps.http).not.toHaveBeenCalled();expect((await deps.store.read(user,id))?.credit_state).toBe('reserved')}else{await run(id);expect((await deps.store.read(user,id))?.status).toBe('done');expect(JSON.parse((deps.http.mock.calls[0][0] as unknown as {body:string}).body).image).toContain('synthetic=1');expect(deps.http.mock.calls.map(c=>c[0].method)).toEqual(['POST','GET'])}
 }
});

const parsedConfig=(raw:unknown)=>readMediaRuntimeConfig({NODE_ENV:'test',MEDIA_RUNTIME_CONFIG:JSON.stringify(raw),MEDIA_CREATE_ENABLED:'1',MEDIA_ROUTER_API_KEY:'synthetic-parser-key',MEDIA_QUOTE_HMAC_HEX:'04'.repeat(32)});
const modeApproval=()=>({approvalRef:'synthetic-mode',validUntil:'2099-01-01T00:00:00Z',economics:{...economics}});
it('E3-002：真实解析路径中坏视频只关闭自身，图片及原图/视频查询和已有签名恢复',async()=>{
 const approval=modeApproval(),parsed=parsedConfig({...config,modes:{text_to_image:approval,text_to_video:{...approval,economics:{...economics,credits:0}}}});
 expect(parsed.modes.text_to_video).toBeUndefined();expect(parsed.modes.text_to_image).toBeDefined();
 expect(parsed).toMatchObject({providerKey:'synthetic-parser-key',providerAccountRef:config.providerAccountRef,environmentRef:config.environmentRef,storageApprovalRef:config.storageApprovalRef,transportApprovalRef:config.transportApprovalRef});expect(parsed.quoteKey).toEqual(Buffer.alloc(32,4));
 const deps=resources();deps.http.mockImplementation(async request=>{const image=(request as {method:string;url:string}).url.includes('/images/');return {status:200,body:Buffer.from(JSON.stringify({task_id:image?'image-original':'video-original',status:'processing',model:image?'gpt-image-2':'grok-imagine-video-1.5'}))}});
 const runtime=createMediaRuntime({config:parsed,...deps});expect(runtime.catalog.adapterModes).toEqual(['text_to_image']);expect(runtime.signer).toBeDefined();
 const imageRow={model:'gpt-image-2',request:payload,media_type:'image',mode:'text_to_image',input_id:null,provider_account_ref:economics.providerAccountRef,provider_task_id:'image-original'} as TaskRecord;
 const videoRow={...imageRow,model:'grok-imagine-video-1.5',media_type:'video',mode:'text_to_video',provider_task_id:'video-original',request:{...payload,model:'grok-imagine-video-1.5',mediaType:'video',mode:'text_to_video',parameters:{durationSeconds:5,resolution:'480p'}}} as TaskRecord;
 for(const current of [runtime,createMediaRuntime({config:{...parsed,creationEnabled:false},...deps})]){
  expect(await current.providers.get('gpt-image-2')!.query('image-original',imageRow)).toEqual({kind:'accepted',taskId:'image-original'});
  expect(await current.providers.get('grok-imagine-video-1.5')!.query('video-original',videoRow)).toEqual({kind:'accepted',taskId:'video-original'});
  await expect(current.storage.sign('media/results/existing-image','image/png')).resolves.toHaveProperty('url');
  await expect(current.storage.sign('media/results/existing-video','video/mp4')).resolves.toHaveProperty('url');
  expect(await current.providers.get('grok-imagine-video-1.5')!.submit(videoRow,null)).toEqual({kind:'unknown'});
 }
 expect(deps.http.mock.calls.map(c=>c[0].method)).toEqual(['GET','GET','GET','GET']);expect(deps.objects.putImmutable).not.toHaveBeenCalled();
});
it('E3-002：坏图片加健康视频及单mode正常控制均经过配置解析',()=>{
 const approval=modeApproval(),video={videoDecoder:videoConfig,videoDeploymentApprovalRef:'synthetic-local-only'};
 const healthyVideo={...config,...video,modes:{text_to_image:{...approval,economics:{...economics,credits:0}},text_to_video:approval}};
 const cases=[{raw:healthyVideo,expected:['text_to_video']},{raw:{...config,modes:{text_to_image:approval}},expected:['text_to_image']},{raw:{...config,...video,modes:{text_to_video:approval}},expected:['text_to_video']}];
 for(const {raw,expected} of cases){const parsed=parsedConfig(raw),runtime=createMediaRuntime({config:parsed,...resources(),videoDecoder:createVideoMediaDecoder(videoConfig)});expect(runtime.catalog.adapterModes).toEqual(expected);expect(parsed.providerAccountRef).toBe(config.providerAccountRef)}
});
it('E3-002：每mode结构/经济错误局部关闭，坏顶层JSON仍整体关闭',()=>{
 const approval=modeApproval();
 for(const bad of [null,[],17,'bad',{approvalRef:7,validUntil:approval.validUntil,economics},{...approval,validUntil:'invalid'},{...approval,economics:null},{...approval,economics:{...economics,credits:0}},{...approval,economics:{...economics,providerUpperCents:99}}]){
  const parsed=parsedConfig({...config,modes:{text_to_image:approval,text_to_video:bad}});
  expect(parsed.modes.text_to_video).toBeUndefined();expect(parsed.modes.text_to_image).toBeDefined();expect(parsed.providerKey).toBe('synthetic-parser-key');
 }
 for(const raw of [null,[],17,'bad']){const parsed=parsedConfig(raw);expect(parsed.creationEnabled).toBe(false);expect(parsed.providerKey).toBe('');expect(parsed.modes).toEqual({})}
 const malformed=readMediaRuntimeConfig({NODE_ENV:'test',MEDIA_RUNTIME_CONFIG:'{',MEDIA_ROUTER_API_KEY:'synthetic-key',MEDIA_CREATE_ENABLED:'1'});expect(malformed.creationEnabled).toBe(false);expect(malformed.providerKey).toBe('');
});
