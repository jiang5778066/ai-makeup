import {it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {MediaGenerationPanel} from './media-generation-panel';
vi.mock('@/lib/platform-account-session',()=>({usePlatformAccount:()=>({status:'signed_in',user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'},epoch:1})}));
it('双语面板明确关闭状态与本站GPT参数，不能在未开放时上传/扣费',async()=>{
 const f=vi.fn(async()=>new Response(JSON.stringify({capabilities:[{mode:'text_to_image',model:'gpt-image-2',enabled:false}]}),{status:503}));
 const {rerender}=render(<MediaGenerationPanel draft={{model:'gpt-image-2',mode:'text_to_image',prompt:'合成',locale:'en',files:[],selectionVersion:0}} currentPath="/ai-image-generator" fetcher={f}/>);
 await waitFor(()=>expect(screen.getByText('Generation is currently unavailable.')).toBeInTheDocument());expect(screen.getByText(/GPT Image 2/)).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Use these site settings'}));expect(screen.getByRole('button',{name:'Get quote'})).toBeDisabled();expect(f).toHaveBeenCalledTimes(1);
 rerender(<MediaGenerationPanel draft={{model:'gpt-image-2',mode:'text_to_image',prompt:'合成',locale:'zh-CN',files:[],selectionVersion:0}} currentPath="/zh-CN/ai-image-generator" fetcher={f}/>);expect(screen.getByText('生成服务暂未开放。')).toBeInTheDocument();
});

it('视频面板固定5秒480p与第三方同意，按实际MIME播放合成成片并下载',async()=>{
 const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';const f=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>new Response(JSON.stringify(String(url).endsWith('capabilities')?{capabilities:[{model:'grok-imagine-video-1.5',mode:'text_to_video',enabled:true,parameters:{durationSeconds:[5],resolution:['480p']}}]}:String(url).endsWith('quotes')?{quoteToken:'synthetic',credits:7,expiresAt:new Date(Date.now()+300000).toISOString()}:init?.method==='POST'?{taskId:id,status:'done',creditState:'settled',result:{url:'https://results.example.com/synthetic.mp4',mimeType:'video/mp4',expiresAt:new Date(Date.now()+300000).toISOString()}}:{})));
 render(<MediaGenerationPanel draft={{model:'grok-imagine-video-1.5',mode:'text_to_video',prompt:'合成视频',locale:'zh-CN',files:[],selectionVersion:0}} currentPath="/zh-CN/ai-video-generator" fetcher={f}/>);
 expect(screen.getByText(/5秒 · 480p/)).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'使用这些本站参数'}));fireEvent.click(screen.getByRole('checkbox',{name:/第三方视频服务/}));await waitFor(()=>expect(screen.getByRole('button',{name:'获取报价'})).toBeEnabled());fireEvent.click(screen.getByRole('button',{name:'获取报价'}));await screen.findByRole('button',{name:'确认使用 7 积分'});fireEvent.click(screen.getByRole('button',{name:'确认使用 7 积分'}));await screen.findByText('视频已完成。');expect(screen.getByLabelText('你的生成视频').tagName).toBe('VIDEO');expect(screen.getByRole('link',{name:'下载原结果'})).toHaveAttribute('href','https://results.example.com/synthetic.mp4');
});
