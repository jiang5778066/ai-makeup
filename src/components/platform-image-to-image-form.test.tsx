import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,describe,expect,it} from 'vitest';
import {ImageToImageForm} from './platform-image-to-image-form';

afterEach(cleanup);
describe('图生图比例下拉框',()=>{
 it('更新同一会话参数并在语言和查询恢复时保留比例',()=>{
  const query='model=1000&mode=image-to-image';
  const first=render(<ImageToImageForm locale="en" query={query}/>);
  const ratio=screen.getByRole('combobox',{name:'Ratio'});
  fireEvent.change(ratio,{target:{value:'16:9'}});
  expect(ratio).toHaveValue('16:9');
  expect(screen.getByRole('button',{name:'16:9'})).toHaveAttribute('aria-pressed','true');
  first.unmount();
  render(<ImageToImageForm locale="zh-CN" query={query}/>);
  expect(screen.getByRole('combobox',{name:'画幅比例'})).toHaveValue('16:9');
 });
 it.each(['z-image','not-a-model'])('模型 %s 不激活比例入口或上传区，主动恢复后允许选择',model=>{
  render(<ImageToImageForm locale="en" query={`model=${model}`}/>);
  expect(screen.queryByRole('combobox',{name:'Ratio'})).toBeNull();
  expect(screen.queryByLabelText('Prompt')).toBeNull();
  expect(document.querySelector('input[type=file]')).toBeNull();
  fireEvent.change(screen.getByRole('combobox',{name:'Model'}),{target:{value:'nano-banana-pro'}});
  const ratio=screen.getByRole('combobox',{name:'Ratio'});
  fireEvent.change(ratio,{target:{value:'3:4'}});
  expect(ratio).toHaveValue('3:4');
 });
});
