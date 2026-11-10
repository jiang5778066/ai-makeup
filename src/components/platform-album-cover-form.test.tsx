import {StrictMode} from 'react';
import {render,screen,fireEvent,cleanup,act} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {AlbumForm} from './platform-album-cover-form';
afterEach(cleanup);
beforeEach(()=>{vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:vi.fn(()=>`blob:test-${Math.random()}`),revokeObjectURL:vi.fn()}))});
describe('专辑封面表单交互',()=>{
 it('文生图默认无文件输入，生成始终禁用且提交不调用网络',()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);render(<AlbumForm locale="en" query="ui=default"/>);expect(screen.getByRole('tab',{name:'Text to Image'})).toHaveAttribute('aria-selected','true');expect(document.querySelector('input[type=file]')).toBeNull();expect(screen.getByRole('button',{name:/Generate/})).toBeDisabled();fireEvent.submit(document.querySelector('form')!);expect(fetch).not.toHaveBeenCalled()});
 it('重复参数后值为未知时不激活上传，主动选择合法模型才恢复',()=>{render(<AlbumForm locale="en" query="mode=image-to-image&model=2403&model=bad&ui=bad"/>);expect(screen.getByRole('alert')).toBeVisible();expect(document.querySelector('input[type=file]')).toBeNull();fireEvent.change(screen.getByLabelText('Model'),{target:{value:'2403'}});expect(document.querySelector('input[type=file]')).not.toBeNull()});
 it('tab键盘切换保留编辑提示词并释放上传区域，取消选择无副作用',()=>{render(<AlbumForm locale="zh-CN" query="ui=tabs"/>);const prompt=screen.getByLabelText('提示词');fireEvent.change(prompt,{target:{value:'蓝色爵士'}});const image=screen.getByRole('tab',{name:'图生图'});fireEvent.keyDown(screen.getByRole('tab',{name:'文生图'}),{key:'ArrowLeft'});expect(image).toHaveFocus();expect(image).toHaveAttribute('aria-selected','true');fireEvent.change(document.querySelector('input[type=file]')!,{target:{files:[]}});expect(screen.getByLabelText('提示词')).toHaveValue('蓝色爵士');fireEvent.click(screen.getByRole('tab',{name:'文生图'}));expect(document.querySelector('input[type=file]')).toBeNull()});
 it('语言和query变更隔离提示词，返回同边界恢复文字但不恢复文件',()=>{const {rerender}=render(<AlbumForm locale="en" query="ui=session"/>);fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'专属文字'}});rerender(<AlbumForm locale="zh-CN" query="ui=session"/>);expect(screen.getByLabelText('提示词')).not.toHaveValue('专属文字');rerender(<AlbumForm locale="en" query="ui=other"/>);expect(screen.getByLabelText('Prompt')).not.toHaveValue('专属文字');rerender(<AlbumForm locale="en" query="ui=session"/>);expect(screen.getByLabelText('Prompt')).toHaveValue('专属文字')});
 it('真实文件解码成功可预览，模式切换释放对象URL',async()=>{const images:{onload:(()=>void)|null;onerror:(()=>void)|null;src:string}[]=[];vi.stubGlobal('Image',class{onload=null;onerror=null;src='';constructor(){images.push(this)}});render(<AlbumForm locale="en" query="mode=image-to-image&ui=decode"/>);fireEvent.change(document.querySelector('input[type=file]')!,{target:{files:[new File(['png'],'cover.png',{type:'image/png'})]}});expect(screen.getByText(/Decoding/)).toBeVisible();await act(async()=>images[0].onload?.());expect(screen.getByAltText('cover.png')).toBeVisible();fireEvent.click(screen.getByRole('tab',{name:'Text to Image'}));expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)});
});

describe('返工01：真实React恢复与超大地址',()=>{
 it.each(['toString','constructor','__proto__','hasOwnProperty'])('mode=%s 显示错误且可用键盘恢复',mode=>{
  render(<AlbumForm locale="en" query={`mode=${mode}&rework=keyboard`}/>);
  expect(screen.getByRole('alert')).toBeVisible();
  const text=screen.getByRole('tab',{name:'Text to Image'}),image=screen.getByRole('tab',{name:'Image To Image'});
  expect(text.tabIndex).toBe(0);text.focus();expect(text).toHaveFocus();
  fireEvent.keyDown(text,{key:'Home'});expect(image).toHaveFocus();expect(image).toHaveAttribute('aria-selected','true');
  expect(screen.queryByRole('alert')).toBeNull();
 });
 it('键盘修复mode不能洗掉独立model错误',()=>{
  render(<AlbumForm locale="en" query="mode=constructor&model=unknown&rework=both"/>);
  fireEvent.keyDown(screen.getByRole('tab',{name:'Text to Image'}),{key:'Home'});
  expect(screen.getByRole('tab',{name:'Image To Image'})).toHaveFocus();
  expect(screen.getByRole('alert')).toBeVisible();expect(document.querySelector('input[type=file]')).toBeNull();
  fireEvent.change(screen.getByLabelText('Model'),{target:{value:'2403'}});
  expect(screen.queryByRole('alert')).toBeNull();expect(document.querySelector('input[type=file]')).not.toBeNull();
 });
 it('超长非法model只显示有界诊断，主动恢复后连续编辑和重渲染不丢字',()=>{
  const query=`model=${'x'.repeat(100000)}&rework=oversize`,view=render(<AlbumForm locale="en" query={query}/>);
  expect(screen.getByRole('alert')).toBeVisible();
  expect(screen.getByRole('option',{name:/Choose a supported model/}).textContent!.length).toBeLessThan(200);
  fireEvent.change(screen.getByLabelText('Model'),{target:{value:'2403'}});
  fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'第一个字'}});
  fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'连续编辑'}});
  view.rerender(<AlbumForm locale="en" query={query}/>);
  expect(screen.getByLabelText('Prompt')).toHaveValue('连续编辑');
  expect(screen.queryByRole('alert')).toBeNull();expect(screen.getByRole('button',{name:/Generate/})).toBeDisabled();
 });
 it('相同超长前缀、不同后缀及语言不串会话，返回超大地址重新开始',()=>{
  const prefix='rework=long&x='+'a'.repeat(100000),a=prefix+'A',b=prefix+'B';
  const view=render(<AlbumForm locale="en" query={a}/>);
  fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'A独有文字'}});
  view.rerender(<AlbumForm locale="en" query={b}/>);
  expect(screen.getByLabelText('Prompt')).not.toHaveValue('A独有文字');
  fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'B独有文字'}});
  view.rerender(<AlbumForm locale="zh-CN" query={b}/>);
  expect(screen.getByLabelText('提示词')).not.toHaveValue('B独有文字');
  view.rerender(<AlbumForm locale="en" query={a}/>);
  expect(screen.getByLabelText('Prompt')).not.toHaveValue('A独有文字');
 });
});


describe('返工01：超大地址生命周期',()=>{
 it('StrictMode下超大地址仍可恢复和编辑，正常地址返回仍恢复缓存',()=>{
  const normal='rework=normal-return',large='mode=toString&x='+'x'.repeat(100000);
  const view=render(<StrictMode><AlbumForm locale="en" query={normal}/></StrictMode>);
  fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'正常缓存'}});
  view.rerender(<StrictMode><AlbumForm locale="en" query={large}/></StrictMode>);
  expect(screen.getByRole('alert')).toBeVisible();
  fireEvent.keyDown(screen.getByRole('tab',{name:'Text to Image'}),{key:'End'});
  expect(screen.queryByRole('alert')).toBeNull();
  fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'超界当前文字'}});
  view.rerender(<StrictMode><AlbumForm locale="en" query={large}/></StrictMode>);
  expect(screen.getByLabelText('Prompt')).toHaveValue('超界当前文字');
  view.rerender(<StrictMode><AlbumForm locale="en" query={normal}/></StrictMode>);
  expect(screen.getByLabelText('Prompt')).toHaveValue('正常缓存');
 });
});
