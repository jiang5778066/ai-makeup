import {act,cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import {afterEach,beforeAll,beforeEach,describe,expect,it,vi} from 'vitest';
import {PlatformVideoModelPage} from './platform-video-model-page';
vi.mock('./site-shell',()=>({SiteShell:({children}:{children:React.ReactNode})=><>{children}</>}));
vi.mock('next/navigation',()=>({usePathname:()=>window.location.pathname,useSearchParams:()=>new URLSearchParams(window.location.search)}));
vi.mock('./platform-homepage-media',()=>({HomepageVideo:()=> <span role="img" aria-label="public poster"/>}));
beforeAll(()=>{HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')}});
beforeEach(()=>window.history.replaceState({},'', '/'));
afterEach(()=>{cleanup();vi.unstubAllGlobals()});
const path='/ai-video-models/sora-2';
function navigate(url:string){act(()=>{window.history.pushState({},'',url);window.dispatchEvent(new PopStateEvent('popstate'))})}
describe('C2d真实page/form/session与URL组合',()=>{
 it.each(['en','zh-CN'] as const)('Sora %s初次空选，未知URL唯一说明；合法编辑只清对应原因，15秒取消回焦',locale=>{
  const zh=locale==='zh-CN',prefix=zh?'/zh-CN':'',query=`model=700&duration=bad-${locale}&sound=true`;navigate(`${prefix}${path}?${query}`);
  render(<PlatformVideoModelPage path={path} locale={locale} initialQuery={query}/>);
  expect(screen.getByRole('button',{name:zh?'模型':'Model'})).toHaveTextContent(zh?'选择模型':'Select a model');
  expect(screen.getByRole('textbox',{name:zh?'提示词':'Prompt'})).toHaveAttribute('maxlength','1000');
  expect(screen.getAllByRole('status').filter(x=>x.textContent?.includes(zh?'模型编号':'model ID'))).toHaveLength(1);
  const prompt=screen.getByRole('textbox',{name:zh?'提示词':'Prompt'});fireEvent.change(prompt,{target:{value:'local edited'}});
  expect(screen.getAllByRole('status').some(x=>x.textContent?.includes(zh?'时长格式':'duration is malformed'))).toBe(true);
  const duration=screen.getByRole('group',{name:zh?'时长':'Duration'}),gate=within(duration).getByRole('button',{name:/15s/});gate.focus();fireEvent.click(gate);
  expect(screen.getByRole('dialog')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:zh?'返回参数':'Back to settings'}));
  expect(gate).toHaveFocus();expect(within(duration).getByRole('button',{name:/10s/})).toHaveAttribute('aria-pressed','true');
  expect(screen.getAllByRole('status').some(x=>x.textContent?.includes(zh?'时长格式':'duration is malformed'))).toBe(true);
  fireEvent.click(within(duration).getByRole('button',{name:/10s/}));expect(screen.getAllByRole('status').some(x=>x.textContent?.includes(zh?'时长格式':'duration is malformed'))).toBe(false);
  fireEvent.click(screen.getByRole('tab',{name:zh?'文生视频':'Text to Video'}));expect(document.querySelector('input[type=file]')).toBeNull();expect(prompt).toHaveValue('local edited');
  fireEvent.click(screen.getByRole('button',{name:zh?'模型':'Model'}));fireEvent.change(screen.getByRole('textbox',{name:zh?'搜索模型':'Search models'}),{target:{value:'Veo 3.1 Fast'}});fireEvent.click(screen.getByRole('button',{name:/Veo 3.1 Fast/}));
  expect(document.querySelector('[data-current-model]')).toHaveAttribute('data-current-model','veo-3-1-fast');expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Sora');
  fireEvent.click(screen.getByRole('button',{name:zh?'恢复本页模型':'Restore page model'}));expect(document.querySelector('[data-current-model]')).toHaveAttribute('data-current-model','');expect(screen.getByRole('textbox',{name:zh?'提示词':'Prompt'})).toHaveValue('local edited');
  expect(screen.getByRole('button',{name:zh?'生成暂不可用':'Generation not available yet'})).toBeDisabled();
 });
 it('Sora语言保参不重放URL，跨path隔离；Mind明确恢复才采用核定默认参数',()=>{
  navigate(`${path}?duration=10`);const v=render(<PlatformVideoModelPage path={path} locale="en" initialQuery="duration=10"/>);
  fireEvent.change(screen.getByRole('textbox',{name:'Prompt'}),{target:{value:'language retained'}});
  navigate(`/zh-CN${path}?duration=10`);v.rerender(<PlatformVideoModelPage path={path} locale="zh-CN" initialQuery="duration=10"/>);expect(screen.getByRole('textbox',{name:'提示词'})).toHaveValue('language retained');
  const mind='/ai-video-models/mindvideo-ai';navigate(`${mind}?duration=12&ratio=9%3A16&sound=false`);v.rerender(<PlatformVideoModelPage path={mind} locale="en" initialQuery="duration=12&ratio=9%3A16&sound=false"/>);
  expect(screen.getByRole('textbox',{name:'Prompt'})).toHaveValue('');expect(screen.getByRole('slider',{name:'Duration'})).toHaveValue('12');
  fireEvent.change(screen.getByRole('textbox',{name:'Prompt'}),{target:{value:'mind edit'}});fireEvent.click(screen.getByRole('button',{name:'Restore page model'}));
  expect(screen.getByRole('slider',{name:'Duration'})).toHaveValue('5');expect(screen.getByRole('checkbox',{name:'Sound'})).toBeChecked();expect(screen.getByRole('textbox',{name:'Prompt'})).toHaveValue('mind edit');
 });
});


describe('Sora空选新消费者的本地文件所有权',()=>{
 function previewMocks(){
  const pending:{onload:(()=>void)|null;onerror:(()=>void)|null}[]=[];
  const create=vi.fn((file:File)=>`blob:c2d-${file.name}`),revoke=vi.fn();
  vi.stubGlobal('URL',class extends URL{static createObjectURL=create;static revokeObjectURL=revoke});
  vi.stubGlobal('Image',class{onload=null;onerror=null;constructor(){pending.push(this)}set src(_value:string){}});
  return {pending,create,revoke};
 }
 it.each(['mode','model','locale'] as const)('%s卸载空选上传并仅释放一次，迟到解码不能复活旧预览',async reason=>{
  const {pending,create,revoke}=previewMocks(),query=`duration=10&ratio=invalid-release-${reason}`;
  navigate(`${path}?${query}`);const view=render(<PlatformVideoModelPage path={path} locale="en" initialQuery={query}/>);
  fireEvent.change(screen.getByRole('textbox',{name:'Prompt'}),{target:{value:'file draft'}});
  fireEvent.change(screen.getByLabelText('Reference Images',{selector:'input'}),{target:{files:[new File(['local'],'pending.png',{type:'image/png'})]}});
  expect(create).toHaveBeenCalledTimes(1);expect(revoke).not.toHaveBeenCalled();expect(pending).toHaveLength(1);
  if(reason==='mode')fireEvent.click(screen.getByRole('tab',{name:'Text to Video'}));
  else if(reason==='model'){
   fireEvent.click(screen.getByRole('button',{name:'Model'}));fireEvent.change(screen.getByRole('textbox',{name:'Search models'}),{target:{value:'Grok Imagine'}});fireEvent.click(screen.getByRole('button',{name:'Grok Imagine'}));
  }else{navigate(`/zh-CN${path}?${query}`);view.rerender(<PlatformVideoModelPage path={path} locale="zh-CN" initialQuery={query}/>)}
  expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:c2d-pending.png');
  await act(async()=>{pending[0].onload?.()});expect(screen.queryByRole('img',{name:'pending.png'})).toBeNull();
  expect(screen.getByRole('textbox',{name:reason==='locale'?'提示词':'Prompt'})).toHaveValue('file draft');
  if(reason==='mode')fireEvent.click(screen.getByRole('tab',{name:'Image to Video'}));
  if(reason==='model')fireEvent.click(screen.getByRole('button',{name:'Restore page model'}));
  expect(document.querySelectorAll('[data-preview-state]')).toHaveLength(0);view.unmount();expect(revoke).toHaveBeenCalledTimes(1);
 });
 it('正常解码可预览，移除及失败均各自释放且不进入会话恢复',async()=>{
  const {pending,revoke}=previewMocks(),query='duration=10&ratio=invalid-decode';navigate(`${path}?${query}`);
  render(<PlatformVideoModelPage path={path} locale="en" initialQuery={query}/>);
  const file=()=>screen.getByLabelText('Reference Images',{selector:'input'});
  fireEvent.change(file(),{target:{files:[new File(['local'],'ready.png',{type:'image/png'})]}});
  await act(async()=>{pending[0].onload?.()});expect(screen.getByRole('img',{name:'ready.png'})).toHaveAttribute('src','blob:c2d-ready.png');
  fireEvent.click(screen.getByRole('button',{name:'Remove ready.png'}));expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:c2d-ready.png');
  fireEvent.change(file(),{target:{files:[new File(['bad'],'failed.png',{type:'image/png'})]}});
  await act(async()=>{pending[1].onerror?.()});expect(screen.getByRole('alert')).toHaveTextContent('Unable to read');expect(revoke.mock.calls).toEqual([['blob:c2d-ready.png'],['blob:c2d-failed.png']]);
  expect(document.querySelectorAll('[data-preview-state]')).toHaveLength(0);
 });
});
