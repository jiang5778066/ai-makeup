import {it,expect,vi,beforeEach} from 'vitest';
import {useLayoutEffect} from 'react';
import {act,render,screen,fireEvent,waitFor} from '@testing-library/react';
import {MediaGenerationPanel} from './media-generation-panel';
const accountMock=vi.hoisted(()=>({value:{status:'signed_in' as 'signed_in'|'signed_out'|'loading'|'error',user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'} as {id:string}|null,epoch:1}}));
vi.mock('@/lib/platform-account-session',()=>({usePlatformAccount:()=>accountMock.value,getPlatformAccountEpoch:()=>accountMock.value.epoch,expirePlatformAccount:vi.fn()}));
const userA='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const userB='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
function CommitObserver({observe,children}:{observe:()=>void;children:React.ReactNode}){useLayoutEffect(()=>{observe()});return children}
beforeEach(()=>{accountMock.value={status:'signed_in',user:{id:userA},epoch:1};sessionStorage.clear()});
it('双语面板明确关闭状态与本站GPT参数，不能在未开放时上传/扣费',async()=>{
 const f=vi.fn(async()=>new Response(JSON.stringify({capabilities:[{mode:'text_to_image',model:'gpt-image-2',enabled:false}]}),{status:503}));
 const {rerender}=render(<MediaGenerationPanel draft={{model:'gpt-image-2',mode:'text_to_image',prompt:'合成',locale:'en',files:[],selectionVersion:0}} currentPath="/ai-image-generator" fetcher={f}/>);
 await waitFor(()=>expect(screen.getByText('Generation is currently unavailable.')).toBeInTheDocument());expect(screen.getByText(/GPT Image 2/)).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Use these site settings'}));expect(screen.getByRole('button',{name:'Get quote'})).toBeDisabled();expect(f).toHaveBeenCalledTimes(1);
 rerender(<MediaGenerationPanel draft={{model:'gpt-image-2',mode:'text_to_image',prompt:'合成',locale:'zh-CN',files:[],selectionVersion:0}} currentPath="/zh-CN/ai-image-generator" fetcher={f}/>);expect(screen.getByText('生成服务暂未开放。')).toBeInTheDocument();
});

it('视频面板固定1秒480p与第三方同意，按实际MIME播放合成成片并下载',async()=>{
 const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';const f=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>new Response(JSON.stringify(String(url).endsWith('capabilities')?{capabilities:[{model:'grok-imagine-video-1.5',mode:'text_to_video',enabled:true,parameters:{durationSeconds:[1],resolution:['480p']}}]}:String(url).endsWith('quotes')?{quoteToken:'synthetic',credits:7,expiresAt:new Date(Date.now()+300000).toISOString()}:init?.method==='POST'?{taskId:id,status:'done',creditState:'settled',result:{url:'https://results.example.com/synthetic.mp4',mimeType:'video/mp4',expiresAt:new Date(Date.now()+300000).toISOString()}}:{})));
 render(<MediaGenerationPanel draft={{model:'grok-imagine-video-1.5',mode:'text_to_video',prompt:'合成视频',locale:'zh-CN',files:[],selectionVersion:0}} currentPath="/zh-CN/ai-video-generator" fetcher={f}/>);
 expect(screen.getByText(/1秒 · 480p/)).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'使用这些本站参数'}));fireEvent.click(screen.getByRole('checkbox',{name:/第三方视频服务/}));await waitFor(()=>expect(screen.getByRole('button',{name:'获取报价'})).toBeEnabled());fireEvent.click(screen.getByRole('button',{name:'获取报价'}));await screen.findByRole('button',{name:'确认使用 7 积分'});fireEvent.click(screen.getByRole('button',{name:'确认使用 7 积分'}));await screen.findByText('视频已完成。');expect(screen.getByLabelText('你的生成视频').tagName).toBe('VIDEO');expect(screen.getByRole('link',{name:'下载原结果'})).toHaveAttribute('href','https://results.example.com/synthetic.mp4');
});

async function renderCompletedPanel(){
 const commits:{account:{status:string;user:{id:string}|null;epoch:number};html:string}[]=[];
 const observe=()=>commits.push({account:accountMock.value,html:document.body.innerHTML});
 const fetcher=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{
  const taskUser=accountMock.value.user?.id??userA;
  const body=String(url).endsWith('capabilities')?{capabilities:[{model:'gpt-image-2',mode:'text_to_image',enabled:true,parameters:{quality:['1k'],size:['2:3'],n:[1]}}]}:
   String(url).endsWith('quotes')?{quoteToken:`synthetic-${taskUser}`,credits:2,expiresAt:new Date(Date.now()+300000).toISOString()}:
   init?.method==='POST'?{taskId:taskUser,status:'done',creditState:'settled',result:{url:`https://results.example.com/${taskUser}.png`,mimeType:'image/png',expiresAt:new Date(Date.now()+300000).toISOString()}}:{};
  return new Response(JSON.stringify(body));
 });
 const panel=()=> <MediaGenerationPanel draft={{model:'gpt-image-2',mode:'text_to_image',prompt:'synthetic prompt A',locale:'en',files:[],selectionVersion:0}} currentPath="/ai-image-generator" fetcher={fetcher}/>;
 const rendered=render(<CommitObserver observe={observe}>{panel()}</CommitObserver>);
 fireEvent.click(screen.getByRole('button',{name:'Use these site settings'}));
 fireEvent.click(screen.getByRole('checkbox'));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Get quote'})).toBeEnabled());
 fireEvent.click(screen.getByRole('button',{name:'Get quote'}));
 await screen.findByRole('button',{name:/Confirm 2 credits/});
 fireEvent.click(screen.getByRole('button',{name:/Confirm 2 credits/}));
 await screen.findByAltText('Your generated image');
 return {rendered,commits,panel,fetcher};
}

it.each([
 ['切换到另一账户',{status:'signed_in' as const,user:{id:userB},epoch:2}],
 ['登出',{status:'signed_out' as const,user:null,epoch:2}],
 ['同一账户身份epoch更新',{status:'signed_in' as const,user:{id:userA},epoch:2}],
])('%s时首个提交不包含旧账户的任务和签名链接',async(_label,nextAccount)=>{
 const {rendered,commits,panel,fetcher}=await renderCompletedPanel();
 const previousCommitCount=commits.length;
 accountMock.value=nextAccount;
 rendered.rerender(<CommitObserver observe={()=>commits.push({account:accountMock.value,html:document.body.innerHTML})}>{panel()}</CommitObserver>);
 const firstChangedCommit=commits.slice(previousCommitCount).find(commit=>commit.account.epoch===nextAccount.epoch&&commit.account.status===nextAccount.status);
 expect(firstChangedCommit).toBeDefined();
 expect(firstChangedCommit?.html).not.toContain('https://results.example.com/a.png');
 expect(firstChangedCommit?.html).not.toContain('Your generated image');
 expect(firstChangedCommit?.html).not.toContain('Image complete.');
 if(nextAccount.user?.id===userB){
  fireEvent.click(await screen.findByRole('button',{name:'Use these site settings'}));
  fireEvent.click(screen.getByRole('checkbox'));
  await waitFor(()=>expect(screen.getByRole('button',{name:'Get quote'})).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'Get quote'}));
  await screen.findByRole('button',{name:/Confirm 2 credits/});
  fireEvent.click(screen.getByRole('button',{name:/Confirm 2 credits/}));
  expect(await screen.findByAltText('Your generated image')).toHaveAttribute('src',`https://results.example.com/${userB}.png`);
  expect(fetcher.mock.calls.filter(call=>String(call[0]).endsWith('/tasks'))).toHaveLength(2);
 }
});

it('账户切换后旧任务读取晚到不能恢复结果',async()=>{
 const taskId=userA;let finishRead!:(response:Response)=>void;let reads=0;
 const fetcher=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{
  if(String(url).endsWith('capabilities'))return new Response(JSON.stringify({capabilities:[{model:'gpt-image-2',mode:'text_to_image',enabled:true,parameters:{quality:['1k'],size:['2:3'],n:[1]}}]}));
  if(String(url).endsWith('quotes'))return new Response(JSON.stringify({quoteToken:'synthetic-a',credits:2,expiresAt:new Date(Date.now()+300000).toISOString()}));
  if(init?.method==='POST')return new Response(JSON.stringify({taskId,status:'done',creditState:'settled',result:{url:'https://results.example.com/a.png',mimeType:'image/png',expiresAt:new Date(Date.now()+300000).toISOString()}}));
  reads++;
  return new Promise<Response>(resolve=>{finishRead=resolve});
 });
 const panel=()=> <MediaGenerationPanel draft={{model:'gpt-image-2',mode:'text_to_image',prompt:'synthetic prompt A',locale:'en',files:[],selectionVersion:0}} currentPath="/ai-image-generator" fetcher={fetcher}/>;
 const rendered=render(panel());
 fireEvent.click(screen.getByRole('button',{name:'Use these site settings'}));fireEvent.click(screen.getByRole('checkbox'));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Get quote'})).toBeEnabled());fireEvent.click(screen.getByRole('button',{name:'Get quote'}));
 await screen.findByRole('button',{name:/Confirm 2 credits/});fireEvent.click(screen.getByRole('button',{name:/Confirm 2 credits/}));await screen.findByAltText('Your generated image');
 fireEvent.click(screen.getByRole('button',{name:'Refresh download link'}));await waitFor(()=>expect(reads).toBe(1));
 accountMock.value={status:'signed_in',user:{id:userB},epoch:2};
 rendered.rerender(panel());
 await act(async()=>{finishRead(new Response(JSON.stringify({taskId,status:'done',creditState:'settled',result:{url:'https://results.example.com/a-late.png',mimeType:'image/png',expiresAt:new Date(Date.now()+300000).toISOString()}})));await Promise.resolve()});
 expect(fetcher).toHaveBeenCalledTimes(5);
 expect(document.body.innerHTML).not.toContain('a-late.png');
 expect(document.body.innerHTML).not.toContain('https://results.example.com/a.png');
});

it.each(['waiting','unknown'] as const)('存储不可用时 %s 可跨页面恢复，同账号核验无自动提交',async status=>{
 const unavailable=()=>{throw new DOMException('存储不可用','SecurityError')};
 const storage=vi.spyOn(window,'sessionStorage','get').mockImplementation(unavailable);
 const calls:{path:string;key:string|null;body?:BodyInit|null}[]=[];
 const fetcher=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{
  const path=String(url);
  calls.push({path,key:new Headers(init?.headers).get('Idempotency-Key'),body:init?.body});
  if(path.endsWith('/capabilities'))return Response.json({capabilities:[
   {model:'gpt-image-2',mode:'text_to_image',enabled:true,parameters:{quality:['1k'],size:['2:3'],n:[1]}},
  ]});
  if(path.endsWith('/quotes'))return Response.json({quoteToken:'fixture',credits:2,expiresAt:new Date(Date.now()+300000).toISOString()});
  if(path.endsWith('/tasks')&&status==='unknown'&&calls.filter(call=>call.path===path).length===1)throw Error('响应中断');
  return Response.json({taskId:userA,status:'waiting',creditState:'reserved'});
 });
 const panel=(path:string)=><MediaGenerationPanel
  draft={{model:'gpt-image-2',mode:'text_to_image',prompt:'同一原提交',locale:'en',files:[],selectionVersion:0}}
  currentPath={path} fetcher={fetcher}/>;
 const first=render(panel('/ai-image-generator'));
 try{
  fireEvent.click(screen.getByRole('button',{name:'Use these site settings'}));
  fireEvent.click(screen.getByRole('checkbox'));
  await waitFor(()=>expect(screen.getByRole('button',{name:'Get quote'})).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'Get quote'}));
  fireEvent.click(await screen.findByRole('button',{name:'Confirm 2 credits'}));
  await screen.findByRole('button',{name:'Check this submission'});
  accountMock.value={status:'loading',user:null,epoch:2};
  first.rerender(panel('/ai-image-generator'));
  expect(screen.queryByText(/Original submission/)).toBeNull();
  expect(screen.queryByRole('button',{name:'Check this submission'})).toBeNull();
  accountMock.value={status:'error',user:null,epoch:2};
  first.rerender(panel('/ai-image-generator'));
  expect(screen.getByText('Account service is unavailable.')).toBeVisible();
  accountMock.value={status:'signed_in',user:{id:userA},epoch:3};
  first.rerender(panel('/ai-image-generator'));
  const check=await screen.findByRole('button',{name:'Check this submission'});
  expect(calls.filter(call=>call.path==='/api/media/tasks')).toHaveLength(1);
  if(status==='unknown'){
   fireEvent.click(check);
   await screen.findByText('Processing; credits remain reserved.');
   const sends=calls.filter(call=>call.path==='/api/media/tasks');
   expect(sends).toHaveLength(2);
   expect(sends[1]).toEqual(sends[0]);
  }
  first.unmount();
  const second=render(panel('/ai-image-models/gpt-image-2'));
  expect(screen.queryByRole('button',{name:'Get quote'})).toBeNull();
  expect(calls.filter(call=>call.path===`/api/media/tasks/${userA}`)).toHaveLength(0);
  fireEvent.click(await screen.findByRole('button',{name:'Check this submission'}));
  await waitFor(()=>expect(calls.filter(call=>call.path===`/api/media/tasks/${userA}`)).toHaveLength(1));
  storage.mockRestore();
  accountMock.value={status:'signed_out',user:null,epoch:4};
  second.rerender(panel('/ai-image-models/gpt-image-2'));
  expect(screen.queryByRole('button',{name:'Check this submission'})).toBeNull();
  accountMock.value={status:'signed_in',user:{id:userA},epoch:5};
  second.rerender(panel('/ai-image-models/gpt-image-2'));
  expect(screen.getByRole('button',{name:'Get quote'})).toBeDisabled();
  expect(screen.queryByRole('button',{name:'Check this submission'})).toBeNull();
 }finally{
  storage.mockRestore();
 }
});

it('未知提交在页面切换后保留核对锁定且不重放',async()=>{
 const fetcher=vi.fn(async(url:RequestInfo|URL)=>{
  if(String(url).endsWith('/capabilities'))return Response.json({capabilities:[]});
  throw Error('新页面不应提交请求');
 });
 sessionStorage.setItem('media-generation-recovery',JSON.stringify({
  version:1,userId:userA,savedAt:Date.now(),key:userB,
  request:{clientIntentId:userB,mediaType:'image',model:'gpt-image-2',mode:'text_to_image',prompt:'原提示词',
   parameters:{quality:'1k',size:'2:3',n:1},inputIds:[],locale:'en',consent:true,consentVersion:'media-v1'},
 }));
 render(<MediaGenerationPanel draft={{model:'grok-imagine-video-1.5',mode:'text_to_video',prompt:'下一页提示词',
  locale:'en',files:[],selectionVersion:0}} currentPath="/ai-video-generator" fetcher={fetcher}/>);
 expect(await screen.findByText('Original submission: 原提示词')).toBeVisible();
 expect(screen.getByText(/This tab has an unresolved submission/)).toBeVisible();
 expect(screen.queryByRole('button',{name:'Get quote'})).toBeNull();
 expect(fetcher.mock.calls.map(([url])=>url)).toEqual(['/api/media/capabilities']);
});
