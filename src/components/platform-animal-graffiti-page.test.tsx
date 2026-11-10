import{render,screen,fireEvent,cleanup,within}from'@testing-library/react';import{describe,it,expect,vi,afterEach}from'vitest';
import{PlatformAnimalGraffitiPage}from'./platform-animal-graffiti-page';
import {generatorSessions} from '@/lib/platform-generator-session';
import {animalGraffitiKey,initializeAnimalGraffiti} from '@/lib/platform-animal-graffiti-state';
vi.mock('./site-shell',()=>({SiteShell:({children}:{children:React.ReactNode})=><>{children}</>}));
vi.mock('./use-platform-url',()=>({usePlatformUrl:(path:string)=>path}));
afterEach(cleanup);
describe('动物和涂鸦新表单消费者',()=>{
 it('文本模式初选准确模型，未知查询不静默换服务，切换后恢复实际参数',()=>{const {unmount}=render(<PlatformAnimalGraffitiPage tool="animal" locale="en" initialQuery="model=missing"/>);expect(screen.getByRole('button',{name:'Model'})).toHaveTextContent('Unsupported model: missing');expect(screen.queryByRole('group',{name:'Resolution'})).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Model'}));fireEvent.click(screen.getByRole('option',{name:/Nano Banana Pro/}));expect(within(screen.getByRole('group',{name:'Resolution'})).getByRole('button',{name:'1K'})).toHaveAttribute('aria-pressed','true');unmount()});
 it('图像预览只在图像模式挂载，离开模式卸载，提交及Enter不调用远程业务',()=>{const request=vi.spyOn(globalThis,'fetch');render(<PlatformAnimalGraffitiPage tool="graffiti" locale="zh-CN"/>);expect(screen.queryByLabelText('参考图片')).not.toBeInTheDocument();fireEvent.click(screen.getByRole('tab',{name:'图生图'}));expect(screen.getByLabelText('参考图片')).toHaveAttribute('type','file');fireEvent.click(screen.getByRole('tab',{name:'文生图'}));expect(screen.queryByLabelText('参考图片')).not.toBeInTheDocument();const prompt=screen.getByRole('textbox',{name:'提示词'});fireEvent.change(prompt,{target:{value:'只保留本地草稿'}});fireEvent.keyDown(prompt,{key:'Enter'});fireEvent.submit(prompt.closest('form')!);expect(screen.getByRole('button',{name:'生成暂不可用'})).toBeDisabled();expect(request).not.toHaveBeenCalled();request.mockRestore()});
 it('语言往返保留文本参数，两个入口会话独立',()=>{const a=render(<PlatformAnimalGraffitiPage tool="animal" locale="en" initialQuery="model=1000&tab=text"/>);fireEvent.change(screen.getByRole('textbox',{name:'Prompt'}),{target:{value:'animal-local-draft'}});a.unmount();const g=render(<PlatformAnimalGraffitiPage tool="graffiti" locale="en" initialQuery="model=1000&tab=text"/>);expect(screen.getByRole('textbox',{name:'Prompt'})).toHaveValue('');g.unmount();render(<PlatformAnimalGraffitiPage tool="animal" locale="zh-CN" initialQuery="model=1000&tab=text"/>);expect(screen.getByRole('textbox',{name:'提示词'})).toHaveValue('animal-local-draft')});
});

describe('本页配置成员门禁',()=>{
 it('共享已注册wan-3-0在模式、语言及会话恢复后仍无参数和文件入口，主动改选可恢复',()=>{
  const query='model=wan-3-0&mode=image-to-image';
  let view=render(<PlatformAnimalGraffitiPage tool="animal" locale="en" initialQuery={query}/>);
  const blocked=()=>{expect(document.querySelector('#generator')).toHaveAttribute('data-generator-model','wan-3-0');expect(screen.queryAllByRole('group',{name:/Resolution|Ratio|分辨率|画幅比例/})).toHaveLength(0);expect(document.querySelector('input[type="file"]')).toBeNull();};
  blocked();
  fireEvent.change(screen.getByRole('textbox',{name:'Prompt'}),{target:{value:'保留不支持模型草稿'}});
  expect(screen.getByText(/No other service has been substituted/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab',{name:'Text to Image'}));blocked();
  fireEvent.click(screen.getByRole('tab',{name:'Image To Image'}));blocked();view.unmount();
  view=render(<PlatformAnimalGraffitiPage tool="animal" locale="zh-CN" initialQuery={query}/>);blocked();
  expect(screen.getByRole('textbox',{name:'提示词'})).toHaveValue('保留不支持模型草稿');expect(screen.getByText(/未替换为其它服务/)).toBeInTheDocument();
  view.unmount();render(<PlatformAnimalGraffitiPage tool="animal" locale="en" initialQuery={query}/>);blocked();
  fireEvent.click(screen.getByRole('button',{name:'Model'}));fireEvent.click(screen.getByRole('option',{name:/Nano Banana Pro/}));
  expect(screen.getByRole('group',{name:'Resolution'})).toBeInTheDocument();expect(screen.getByLabelText('Reference Images')).toHaveAttribute('type','file');expect(screen.getByRole('textbox',{name:'Prompt'})).toHaveValue('保留不支持模型草稿');expect(screen.queryByText(/No other service has been substituted/)).not.toBeInTheDocument();
 });
 it('恢复没有issues的不支持共享模型时仍按当前页成员判定',()=>{
  const query='model=wan-3-0&tab=image&restore=gate',key=animalGraffitiKey('graffiti',query),state={...initializeAnimalGraffiti(query),issues:[],prompt:'恢复草稿'};
  const owner=generatorSessions.acquire(key,state);generatorSessions.release(key,owner);
  render(<PlatformAnimalGraffitiPage tool="graffiti" locale="en" initialQuery={query}/>);
  expect(screen.queryByRole('group',{name:'Resolution'})).not.toBeInTheDocument();expect(document.querySelector('input[type="file"]')).toBeNull();expect(screen.getByText(/No other service has been substituted/)).toBeInTheDocument();expect(screen.getByRole('textbox',{name:'Prompt'})).toHaveValue('恢复草稿');
 });
 it('完全未知模型切到图片模式仍无参数和文件，主动选择允许模型后恢复',()=>{
  render(<PlatformAnimalGraffitiPage tool="graffiti" locale="en" initialQuery="model=fully-unknown-c3c&tab=image"/>);
  expect(screen.getByRole('button',{name:'Model'})).toHaveTextContent('fully-unknown-c3c');expect(document.querySelector('input[type="file"]')).toBeNull();expect(screen.queryByRole('group',{name:'Resolution'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Model'}));fireEvent.click(screen.getByRole('option',{name:/Nano Banana Pro/}));expect(screen.getByRole('group',{name:'Resolution'})).toBeInTheDocument();expect(screen.getByLabelText('Reference Images')).toHaveAttribute('type','file');
 });
 it('允许的图片专属模型切到不支持模式后保持提示，回到图片模式恢复',()=>{
  render(<PlatformAnimalGraffitiPage tool="animal" locale="en" initialQuery="model=qwen-image-edit-spicy&tab=image"/>);
  expect(screen.getByLabelText('Reference Images')).toHaveAttribute('type','file');fireEvent.click(screen.getByRole('tab',{name:'Text to Image'}));expect(screen.queryByRole('group',{name:'Resolution'})).not.toBeInTheDocument();expect(document.querySelector('input[type="file"]')).toBeNull();expect(screen.getByText(/No other service has been substituted/)).toBeInTheDocument();fireEvent.click(screen.getByRole('tab',{name:'Image To Image'}));expect(screen.getByLabelText('Reference Images')).toHaveAttribute('type','file');
 });
});
