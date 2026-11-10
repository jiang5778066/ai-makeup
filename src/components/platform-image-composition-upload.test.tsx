import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {compositionModel} from '@/lib/platform-image-composition-state';
import {CompositionUpload} from './platform-image-composition-upload';
const config={max:2,accept:'image/*',maxBytes:10*1024*1024,localByteLimit:false};
let images:{onload:null|(()=>void);onerror:null|(()=>void);src:string}[],create:ReturnType<typeof vi.fn>,revoke:ReturnType<typeof vi.fn>;
beforeEach(()=>{images=[];let seq=0;create=vi.fn(()=>`blob:local-${++seq}`);revoke=vi.fn();vi.stubGlobal('Image',class {onload=null;onerror=null;src='';constructor(){images.push(this);}});vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:create,revokeObjectURL:revoke}));});
afterEach(()=>{vi.unstubAllGlobals();});
describe('本批本地多图资源所有权',()=>{
 it('真实input取消不改变预览，替换后旧解码不覆盖或重复释放新资源，卸载全部释放',async()=>{
  const {unmount}=render(<CompositionUpload config={config} locale="en" onFiles={()=>{}}/>),input=screen.getByLabelText('Choose local reference images'),a=new File(['a'],'first.png',{type:'image/png'}),b=new File(['b'],'second.png',{type:'image/png'});
  fireEvent.change(input,{target:{files:[a]}});const stale=images[0].onload!;
  fireEvent(input,new Event('cancel'));expect(create).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button',{name:'Replace first.png'}));fireEvent.change(input,{target:{files:[b]}});
  expect(revoke).toHaveBeenCalledWith('blob:local-1');await act(async()=>{stale();});expect(screen.queryByAltText('first.png')).toBeNull();
  await act(async()=>{images[1].onload!();});expect(screen.getByAltText('second.png')).toHaveAttribute('src','blob:local-2');
  unmount();expect(revoke.mock.calls.map(x=>x[0])).toEqual(['blob:local-1','blob:local-2']);
 });
 it('损坏图片移除、删除成功图片释放，并拒绝错误类型与超过数量',async()=>{
  render(<CompositionUpload config={config} locale="en" onFiles={()=>{}}/>);const input=screen.getByLabelText('Choose local reference images');
  fireEvent.change(input,{target:{files:[new File(['bad'],'broken.png',{type:'image/png'})]}});
  await act(async()=>{images[0].onerror!();});expect(screen.getByRole('alert')).toHaveTextContent('could not be decoded');expect(revoke).toHaveBeenCalledWith('blob:local-1');
  fireEvent.change(input,{target:{files:[new File(['txt'],'note.txt',{type:'text/plain'})]}});expect(screen.getByRole('alert')).toHaveTextContent('Unsupported');expect(create).toHaveBeenCalledTimes(1);
  fireEvent.change(input,{target:{files:['a','b','c'].map(x=>new File([x],`${x}.png`,{type:'image/png'}))}});expect(screen.getByRole('alert')).toHaveTextContent('at most 2');
  await act(async()=>{images.slice(1).forEach(x=>x.onload!());});await waitFor(()=>expect(screen.getByAltText('a.png')).toBeVisible());fireEvent.click(screen.getByRole('button',{name:'Remove a.png'}));expect(screen.queryByAltText('a.png')).toBeNull();expect(revoke).toHaveBeenCalledWith('blob:local-2');
 });
});

describe('当前模型字节限制与提示一致',()=>{
 it.each(['en','zh-CN'] as const)('10/30MiB模型切换同步按钮、超限错误和本地保护说明（%s）',locale=>{
  const modelIds=['nano-banana-pro','gpt-image-2','gpt-image-2-5-flare','gpt-image-2-5-sunburst','nano-banana-pro'];
  const view=render(<div/>);
  for(const id of modelIds){
   const reference=compositionModel(id)!.modes.image!.reference!,limit=id.includes('2-5')?30:10;
   expect(reference.maxBytes).toBe(limit*1024*1024);
   view.rerender(<CompositionUpload key={id} config={{...reference,localByteLimit:true}} locale={locale} onFiles={()=>{}}/>);
   expect(screen.getByRole('button',{name:locale==='en'?`Add Image Max ${limit}MB`:`添加图片 最大 ${limit}MB`})).toBeVisible();
   expect(screen.getByText(locale==='en'?new RegExp(`${limit}MB is a local preview protection limit`):new RegExp(`${limit}MB为本地预览保护限制`))).toBeVisible();
   const file=new File(['small fixture'],'oversize.png',{type:'image/png'});Object.defineProperty(file,'size',{value:reference.maxBytes+1});
   fireEvent.change(screen.getByLabelText(locale==='en'?'Choose local reference images':'选择本地参考图片'),{target:{files:[file]}});
   expect(screen.getByRole('alert')).toHaveTextContent(locale==='en'?`This file exceeds the ${limit}MB limit.`:`文件超过${limit}MB限制。`);
   expect(create).not.toHaveBeenCalled();
  }
 });
});
