import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformWallpaperBannerPage } from './platform-wallpaper-banner-page';
import { wallpaperBannerKey, wallpaperBannerSessions } from '@/lib/platform-wallpaper-banner-state';
vi.mock('./site-shell',()=>({SiteShell:({children}:{children:React.ReactNode})=><>{children}</>}));
vi.mock('./use-platform-url',()=>({usePlatformUrl:(path:string)=>path}));
beforeEach(()=>{HTMLElement.prototype.scrollIntoView=vi.fn()});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks()});

describe('专页真实消费者交互边界',()=>{
 it.each([
  ['banner','wan-3-0'],
  ['wallpaper','wan-3-0'],
  ['banner','completely-unknown-c3d'],
 ] as const)('%s 对不支持模型 %s 关闭配置，模式和语言恢复后仍保留身份与提示词', (kind,model)=>{
  const query=`model=${model}&mode=image-to-image`,key=wallpaperBannerKey(kind,query);
  const view=render(<PlatformWallpaperBannerPage kind={kind} locale="en" initialQuery={query}/>);
  const assertBlocked=()=>{
   expect(document.querySelector('[data-generator-model]')).toHaveAttribute('data-generator-model',model);
   expect(document.querySelector('[data-model-source-id]')).toBeNull();
   expect(document.querySelector('input[type="file"]')).toBeNull();
   expect(document.querySelector('[role="group"]')).toBeNull();
   expect(screen.getByRole('textbox')).toHaveAttribute('maxlength','20000');
   expect(wallpaperBannerSessions.read(key)?.state).toMatchObject({model,parameters:{},issues:expect.arrayContaining(['unknown-model'])});
  };
  assertBlocked();
  fireEvent.change(screen.getByRole('textbox'),{target:{value:'保留输入与原查询'}});assertBlocked();
  fireEvent.click(screen.getByRole('tab',{name:'Text to Image'}));assertBlocked();
  fireEvent.click(screen.getByRole('tab',{name:'Image To Image'}));assertBlocked();
  view.rerender(<PlatformWallpaperBannerPage kind={kind} locale="zh-CN" initialQuery={query}/>);assertBlocked();
  expect(screen.getByRole('textbox')).toHaveValue('保留输入与原查询');
  expect(screen.getByText('查询中包含未知或不支持的模型，未替换为其它服务。请选择已观察的模型。')).toBeVisible();
  view.unmount();
  render(<PlatformWallpaperBannerPage kind={kind} locale="en" initialQuery={query}/>);assertBlocked();
  expect(screen.getByRole('textbox')).toHaveValue('保留输入与原查询');
 });
 it('允许模型正常提供图片配置，不支持模型主动改选后恢复且语言往返保留',()=>{
  const view=render(<PlatformWallpaperBannerPage kind="wallpaper" locale="en" initialQuery="model=1000&mode=image-to-image"/>);
  expect(screen.getByLabelText('Reference Images')).toHaveAttribute('accept','image/*');
  expect(screen.getByRole('group',{name:'Resolution'})).toHaveTextContent('1K2K4K');
  view.unmount();
  const query='model=wan-3-0&mode=image-to-image&ratio=16%3A9',recovery=render(<PlatformWallpaperBannerPage kind="banner" locale="en" initialQuery={query}/>);
  expect(document.querySelector('input[type="file"]')).toBeNull();
  fireEvent.change(screen.getByRole('textbox'),{target:{value:'恢复时保留提示词'}});
  fireEvent.click(screen.getByRole('button',{name:'Model'}));
  fireEvent.click(screen.getByRole('option',{name:'Nano Banana Pro'}));
  expect(document.querySelector('[data-generator-model]')).toHaveAttribute('data-model-source-id','1000');
  expect(screen.getByLabelText('Reference Images')).toHaveAttribute('accept','image/*');
  expect(screen.getByRole('button',{name:/^1K$/})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByRole('textbox')).toHaveValue('恢复时保留提示词');
  expect(screen.queryByText(/query requests an unknown or unsupported model/)).toBeNull();
  recovery.rerender(<PlatformWallpaperBannerPage kind="banner" locale="zh-CN" initialQuery={query}/>);
  expect(screen.getByLabelText('参考图片')).toHaveAttribute('accept','image/*');
  expect(document.querySelector('[data-generator-model]')).toHaveAttribute('data-generator-model','nano-banana-pro');
  expect(screen.getByRole('textbox')).toHaveValue('恢复时保留提示词');
 });
 it('提示词按钮保留当前模型与比例，FAQ可多开，生成按钮和Enter均不请求网络',()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  render(<PlatformWallpaperBannerPage kind="wallpaper" locale="en" initialQuery="model=2100&ratio=16%3A9"/>);
  fireEvent.click(screen.getAllByRole('button',{name:'Use This Prompt'})[0]);
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain('Wide mountain landscape');
  expect(document.querySelector('[data-generator-model]')).toHaveAttribute('data-generator-model','gpt-image-2');
  const faqs=screen.getAllByRole('button',{expanded:false}).filter(b=>b.dataset.action==='faq');
  fireEvent.click(faqs[0]);fireEvent.click(faqs[1]);expect(faqs[0]).toHaveAttribute('aria-expanded','true');expect(faqs[1]).toHaveAttribute('aria-expanded','true');
  expect(screen.getByRole('button',{name:/Generation not available yet/})).toBeDisabled();fireEvent.submit(document.querySelector('form')!);expect(fetch).not.toHaveBeenCalled();
 });
 it('本地图片正常完成、取消选择不删已有图，模式切换使旧解码失效并释放URL',async()=>{
  let i=0;const revoke=vi.fn(),pending:{onload:null|(()=>void);onerror:null|(()=>void);src:string}[]=[];
  vi.stubGlobal('Image',class {onload=null;onerror=null;src='';constructor(){pending.push(this)}});
  vi.spyOn(URL,'createObjectURL').mockImplementation(()=>`blob:c3d-${++i}`);vi.spyOn(URL,'revokeObjectURL').mockImplementation(revoke);
  render(<PlatformWallpaperBannerPage kind="banner" locale="en" initialQuery="mode=image-to-image"/>);
  const input=screen.getByLabelText('Reference Images'),file=(name:string)=>new File(['local'],name,{type:'image/png'});
  fireEvent.change(input,{target:{files:[file('A.png')]}});await act(async()=>pending[0].onload?.());expect(document.querySelector('[data-preview-state="ready"]')).toBeTruthy();
  fireEvent.change(input,{target:{files:[]}});expect(document.querySelector('[data-preview-state="ready"]')).toBeTruthy();
  fireEvent.change(input,{target:{files:[file('slow.png')]}});fireEvent.click(screen.getByRole('tab',{name:'Text to Image'}));await act(async()=>pending[1].onload?.());
  expect(document.querySelector('[data-preview-state]')).toBeNull();expect(revoke.mock.calls.flat()).toEqual(['blob:c3d-1','blob:c3d-2']);
 });
});
