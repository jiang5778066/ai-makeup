import {fireEvent,render,screen,within} from '@testing-library/react';
import {describe,expect,it,vi} from 'vitest';
import {useState} from 'react';
import {PlatformGeneratorModelPicker} from './platform-generator-model-picker';
import {generatorModels} from '@/lib/platform-generator-data';
const names=['Lanta 2.1','Wan 3.0','Wan 2.2 Spicy','Kling 4.0','Grok Imagine Video 1.5','Seedance 2.0','MiniMax H3'];
function Picker({mode='image',locale='en'}:{mode?:'image'|'text';locale?:'en'|'zh-CN'}){const[value,setValue]=useState('kling-4-0');return <PlatformGeneratorModelPicker models={generatorModels.filter(m=>m.kind==='video'&&m.modes[mode])} value={value} onChange={setValue} locale={locale} searchable/>}
describe('视频推荐入口与当前模式一致',()=>{
 it('推荐顺序准确，两入口共享选中；搜索、空结果和清空有结果',()=>{
  render(<Picker/>);fireEvent.click(screen.getByRole('button',{name:'Model'}));
  const recommended=screen.getByRole('group',{name:'Recommended models'});
  expect(within(recommended).getAllByRole('button').map(b=>b.textContent?.replace('✓',''))).toEqual(names);
  const all=screen.getByRole('group',{name:'All models'});
  expect(within(recommended).getByRole('button',{name:/Kling 4.0/})).toHaveAttribute('data-selected','true');
  expect(within(all).getByRole('button',{name:/Kling 4.0/})).toHaveAttribute('data-selected','true');
  fireEvent.click(within(recommended).getByRole('button',{name:/Wan 3.0$/}));
  fireEvent.click(screen.getByRole('button',{name:'Model'}));
  for(const group of [screen.getByRole('group',{name:'Recommended models'}),screen.getByRole('group',{name:'All models'})])expect(within(group).getByRole('button',{name:/^Wan 3\.0(?:\s*✓)?$/})).toHaveAttribute('data-selected','true');
  const search=screen.getByRole('textbox',{name:'Search models'});fireEvent.change(search,{target:{value:'kling 4'}});
  expect(screen.getAllByRole('button',{name:/Kling 4.0/})).toHaveLength(1);
  fireEvent.change(search,{target:{value:'not-a-model'}});expect(screen.getByRole('status')).toHaveTextContent('No models found');
  fireEvent.change(search,{target:{value:''}});expect(screen.getByRole('group',{name:'Recommended models'})).toBeInTheDocument();
 });
 it('文生不复活无参照的Lanta，中文分组/键盘/Escape恢复焦点且id唯一',()=>{
  render(<Picker mode="text" locale="zh-CN"/>);const trigger=screen.getByRole('button',{name:'模型'});fireEvent.click(trigger);
  expect(screen.queryByRole('button',{name:/Lanta 2.1/})).not.toBeInTheDocument();
  const group=screen.getByRole('group',{name:'推荐模型'});expect(within(group).getAllByRole('button').map(b=>b.textContent?.replace('✓',''))).toEqual(['Wan 3.0','Kling 4.0','Seedance 2.0','MiniMax H3']);
  const all=screen.getByRole('group',{name:'全部模型'});
  for(const name of ['Lanta 2.1','Wan 2.2 Spicy','Grok Imagine Video 1.5'])for(const current of [group,all])expect(within(current).queryByRole('button',{name:new RegExp(name)})).not.toBeInTheDocument();
  const input=screen.getByRole('textbox',{name:'搜索模型'});input.focus();fireEvent.keyDown(input,{key:'ArrowDown'});expect(document.activeElement).toBe(within(group).getAllByRole('button')[0]);
  fireEvent.keyDown(document.activeElement!,{key:'End'});expect(document.activeElement?.textContent).toContain('MiniMax H3');
  fireEvent.keyDown(document.activeElement!,{key:'Escape'});expect(trigger).toHaveFocus();expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 });
 it('图片选择器保持无推荐无搜索',()=>{render(<PlatformGeneratorModelPicker models={generatorModels.filter(m=>m.kind==='image'&&m.modes.image)} value="gpt-image-2" onChange={vi.fn()} locale="en"/>);fireEvent.click(screen.getByRole('button',{name:'Model'}));expect(screen.getAllByRole('option')).toHaveLength(12);expect(screen.queryByRole('textbox')).not.toBeInTheDocument();expect(screen.queryByText('Recommended models')).not.toBeInTheDocument()});
});

 describe('空选标签只作用于显式开启的空值',()=>{it('Sora可显示空选，未知非空编号仍明确不支持',()=>{const v=render(<PlatformGeneratorModelPicker models={generatorModels} value="" onChange={vi.fn()} locale="en" emptyLabel="Select a model"/>);expect(screen.getByRole('button',{name:'Model'})).toHaveTextContent('Select a model');v.rerender(<PlatformGeneratorModelPicker models={generatorModels} value="unknown-700" onChange={vi.fn()} locale="en" emptyLabel="Select a model"/>);expect(screen.getByRole('button',{name:'Model'})).toHaveTextContent('Unsupported model: unknown-700')})});
