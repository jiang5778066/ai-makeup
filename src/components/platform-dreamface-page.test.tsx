import type { ReactNode } from 'react';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { PlatformDreamfacePage } from './platform-dreamface-page';
import { PlatformDreamfaceGeneratorForm } from './platform-dreamface-generator-form';
import { dreamfaceContent, initializeDreamface, type DreamfaceState } from '@/lib/platform-dreamface-data';
import { generatorSessions, generatorSelectionKey } from '@/lib/platform-generator-session';

vi.mock('./site-shell', () => ({ SiteShell: ({ children }: {children:ReactNode}) => <>{children}</> }));
vi.mock('./platform-homepage-media', () => ({ HomepageVideo: ({src,poster}:{src:string;poster:string}) => <div data-local-src={src} data-local-poster={poster}/> }));
vi.mock('./use-platform-url', () => ({ usePlatformUrl: (initial:string) => initial }));
vi.mock('./platform-navigation-link', () => ({ PlatformNavigationLink: ({href,children,...props}:{href:string;children:ReactNode}) => <a href={href} {...props}>{children}</a> }));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function(){this.open=true;};
  HTMLDialogElement.prototype.close = function(){this.open=false;};
});
afterEach(() => {
  cleanup();
  const key=generatorSelectionKey('/ai-video-models/dreamface-ai','');
  const owner=generatorSessions.acquire(key,initializeDreamface(''));
  generatorSessions.write(key,owner,initializeDreamface(''));
  generatorSessions.release(key,owner);
});
function Form({query=''}:{query?:string}) {
  const [state,setState]=useState<DreamfaceState>(()=>initializeDreamface(query));
  return <><PlatformDreamfaceGeneratorForm state={state} onChange={setState} locale="en" onFiles={()=>{}}/><output data-testid="state">{JSON.stringify(state)}</output></>;
}
const current=()=>JSON.parse(screen.getByTestId('state').textContent!);

describe('DreamFace专页完整本地合同',()=>{
  it('双语Related保准确顶行图标和圆箭头，Hero与第四能力使用对应图形',()=>{
    for(const locale of ['en','zh-CN'] as const){
      const view=render(<PlatformDreamfacePage locale={locale}/>),root=view.container;
      const primary=root.querySelector('.platform-dreamface-hero a[href="#generator"]')!;
      expect(primary.firstElementChild).toHaveClass('lucide-video');
      expect(primary.lastElementChild).toHaveClass('lucide-arrow-right');
      const labels=root.querySelectorAll('.platform-dreamface-card-label');
      expect(labels[3].querySelector('.lucide-image')).toBeInTheDocument();
      expect(labels[3].querySelector('.lucide-sparkles')).toBeNull();
      const related=root.querySelector('[data-dreamface-section="related"]')!;
      expect(related.querySelector('.platform-dreamface-related-heading-icon .lucide-sparkles')).toBeInTheDocument();
      const cards=related.querySelectorAll('.platform-dreamface-related-grid>a');
      expect(cards).toHaveLength(3);
      for(const [i,path] of ['/ai-video-models/wan-2-6','/ai-video-models/kling-3-0','/ai-video-models/seedance-2-0'].entries()){
        expect(cards[i]).toHaveAttribute('href',(locale==='en'?'':'/zh-CN')+path);
        expect(cards[i].firstElementChild).toHaveClass('platform-dreamface-related-top');
        expect(cards[i].querySelector('.platform-dreamface-related-logo img')).toHaveAttribute('src',expect.stringMatching(/^\/platform\//));
        expect(cards[i].querySelector('.platform-dreamface-related-arrow .lucide-arrow-right')).toBeInTheDocument();
        expect(cards[i].textContent).not.toMatch(/Explore model|探索模型/);
      }
      expect(related.querySelector('.platform-dreamface-directory-link .lucide-arrow-right')).toBeInTheDocument();
      view.unmount();
    }
  });
  it('双语8区、9FAQ全文、4准确媒体；本地历史空且无生成承诺',()=>{
    for(const locale of ['en','zh-CN'] as const){
      const view=render(<PlatformDreamfacePage locale={locale}/>);
      expect(screen.getByRole('heading',{level:1})).toHaveTextContent('DreamFace AI');
      expect(screen.getByRole('navigation',{name:locale==='en'?'Breadcrumb':'面包屑导航'})).toHaveTextContent('DreamFace AI');
      expect(view.container.querySelectorAll('[data-dreamface-section]')).toHaveLength(8);
      expect(view.container.querySelectorAll('details')).toHaveLength(9);
      for(const faq of dreamfaceContent[locale].faq){expect(screen.getByText(faq.question)).toBeInTheDocument();expect(screen.getByText(faq.answer)).toBeInTheDocument();}
      expect(view.container.querySelectorAll('[data-local-src]')).toHaveLength(4);
      expect(view.container.querySelectorAll('.platform-dreamface-capability .platform-dreamface-source')).toHaveLength(4);
      expect(view.container.querySelector('.platform-dreamface-history')).toHaveTextContent(locale==='en'?'No generation records yet':'暂无生成记录');
      expect(view.container.querySelector('.platform-dreamface-history video')).toBeNull();
      expect(screen.getByRole('button',{name:locale==='en'?'Generation not available yet':'生成暂不可用'})).toBeDisabled();
      for(const href of ['#generator','#dreamface-use-cases'])expect(view.container.querySelector(`a[href="${href}"]`)).toBeInTheDocument();
      expect(view.container.querySelector('a[href="'+(locale==='en'?'':'/zh-CN')+'/ai-video-models"]')).toBeInTheDocument();
      view.unmount();
    }
  });
  it('真实表单automatic往返保Prompt；用户主动112在Text保持unsupported',()=>{
    render(<Form/>);fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'Synthetic local prompt'}});
    fireEvent.click(screen.getByRole('tab',{name:'Text to Video'}));expect(current()).toMatchObject({model:'wan-3-0',mode:'text',prompt:'Synthetic local prompt',selectionSource:'automatic'});
    fireEvent.keyDown(screen.getByRole('tab',{name:'Text to Video'}),{key:'Home'});expect(current().model).toBe('lanta-2-1');
    fireEvent.click(screen.getByRole('button',{name:'Model'}));
    fireEvent.click(within(screen.getByRole('group',{name:'All models'})).getByRole('button',{name:/Lanta 2.1/}));
    fireEvent.keyDown(screen.getByRole('tab',{name:'Image to Video'}),{key:'End'});
    expect(current()).toMatchObject({model:'lanta-2-1',selectionSource:'explicit-user',parameters:{}});
    expect(current().issues).toContain('unsupported-mode');
    expect(screen.queryByLabelText('Reference Images')).not.toBeInTheDocument();
  });
  it('5s门槛关闭保值Prompt并回焦；720P直接选无dialog；8s仅参数预览',()=>{
    render(<Form/>);fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'Keep through gate'}});
    const five=screen.getByRole('button',{name:'5s'});five.focus();fireEvent.click(five);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(current().parameters.duration).toBe(3);
    fireEvent.click(screen.getByRole('button',{name:'Close notice'}));expect(five).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(current().prompt).toBe('Keep through gate');
    fireEvent.click(screen.getByRole('button',{name:'720P'}));expect(current().parameters.resolution).toBe('720P');expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'8s'}));expect(current().parameters.duration).toBe(8);expect(screen.getByText(/Eligibility for 8s/)).toBeInTheDocument();
  });
  it('未知URL不显示伪造参数或DreamFace provider，picker正常搜索/无结果/Escape回焦',()=>{
    render(<Form query="model=dreamface-ai"/>);
    expect(current()).toMatchObject({model:'dreamface-ai',parameters:{},selectionSource:'explicit-url'});
    expect(screen.queryByRole('group',{name:'Quality'})).not.toBeInTheDocument();
    const trigger=screen.getByRole('button',{name:'Model'});fireEvent.click(trigger);
    const search=screen.getByRole('textbox',{name:'Search models'});
    fireEvent.change(search,{target:{value:'Lanta'}});expect(within(screen.getByRole('group',{name:'All models'})).getAllByRole('button')).toHaveLength(1);
    fireEvent.change(search,{target:{value:'no-match-xyz'}});expect(screen.getByText('No models found')).toBeInTheDocument();
    fireEvent.change(search,{target:{value:''}});expect(screen.getByRole('group',{name:'Recommended models'})).toBeInTheDocument();
    expect(screen.getByRole('dialog').textContent).not.toContain('Veo');
    fireEvent.keyDown(search,{key:'Escape'});expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(trigger).toHaveFocus();
    expect(current().model).toBe('dreamface-ai');
  });
  it('已知图片型号在视频入口仍是unknown身份，不泄露其它kind的参数',()=>{
    render(<Form query="model=gpt-image-2"/>);
    expect(current()).toMatchObject({model:'gpt-image-2',parameters:{},issues:expect.arrayContaining(['unknown-model'])});
    expect(screen.queryByRole('group',{name:'Video Ratio'})).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Reference Images')).not.toBeInTheDocument();
  });
  it('语言重挂恢复显式用户选择来源与文本，文件只有释放提示不进入会话',()=>{
    const view=render(<PlatformDreamfacePage locale="en"/>);
    fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'Locale source check'}});
    fireEvent.click(screen.getByRole('button',{name:'Model'}));
    fireEvent.click(within(screen.getByRole('group',{name:'All models'})).getByRole('button',{name:/Lanta 2.1/}));
    view.rerender(<PlatformDreamfacePage locale="zh-CN"/>);
    expect(screen.getByLabelText('提示词')).toHaveValue('Locale source check');
    expect(view.container.querySelector('form')).toHaveAttribute('data-selection-source','explicit-user');
    fireEvent.click(screen.getByRole('tab',{name:'文生视频'}));
    expect(screen.getByText(/当前模型不支持此模式/)).toBeInTheDocument();
    view.rerender(<PlatformDreamfacePage locale="en"/>);
    expect(screen.getByLabelText('Prompt')).toHaveValue('Locale source check');
    expect(view.container.querySelector('form')).toHaveAttribute('data-selection-source','explicit-user');
    expect(screen.getByRole('tab',{name:'Text to Video'})).toHaveAttribute('aria-selected','true');
  });
});
