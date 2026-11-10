import {act,cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import {beforeEach,afterEach,describe,expect,it,vi} from 'vitest';
import fs from 'node:fs';
import faqContract from '../../docs/orca-delivery/trials/20261103-lanta-platform-replica/evidence/developer-c-12-faq-bilingual-contract.json';
import {AdditionalVideoModelHero,AdditionalVideoModelBody} from './platform-video-model-additional-content';
import {additionalVideoModelPages} from '@/lib/platform-video-model-additional-data';
import type {AdditionalVideoModelPath} from '@/lib/platform-generator-data';
vi.mock('./platform-homepage-media',()=>({HomepageVideo:({src,nativeControls}:{src:string;nativeControls?:boolean})=><video src={src} controls={nativeControls}/>}));
beforeEach(()=>{vi.stubGlobal('matchMedia',(query:string)=>({matches:query==='(min-width: 1024px)',addEventListener:vi.fn(),removeEventListener:vi.fn()}));vi.stubGlobal('IntersectionObserver',class{constructor(private callback:(entries:{isIntersecting:boolean}[])=>void){}observe(){this.callback([{isIntersecting:true}])}disconnect(){}})});
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals()});
const dir='docs/orca-delivery/trials/20261103-lanta-platform-replica/evidence/reference-c-02d/';
const normalize=(value:string)=>value.replace(/\s+/g,' ').trim();
describe('五页完整独特正文与明确交互消费者',()=>{
 it('Veo工作方式CTA指向本页实际章节，不能保留已不存在的原始片段',()=>{
  const view=render(<><AdditionalVideoModelHero path="/ai-video-models/veo-3" locale="en"/><AdditionalVideoModelBody path="/ai-video-models/veo-3" locale="en"/></>);
  const link=screen.getByRole('link',{name:'See how it works'});
  expect(link).toHaveAttribute('href','#c2d-veo-3-how-it-works');
  expect(view.container.querySelector(link.getAttribute('href')!)).toHaveTextContent('How to create');
 });
 it('固定英文正文逐section完整保留，Grok价格数字与Mind长prompt不被摘要替代',()=>{
  for(const path of Object.keys(additionalVideoModelPages) as AdditionalVideoModelPath[]){
   const slug=path.split('/').at(-1)!,ref=JSON.parse(fs.readFileSync(`${dir}${slug}-en-content.json`,'utf8'));
   const v=render(<><AdditionalVideoModelHero path={path} locale="en" settings={<div>safe local form</div>}/><AdditionalVideoModelBody path={path} locale="en"/></>);
   for(const section of ref.sections){
    if((section.index===1&&['grok-imagine','mindvideo-ai','veo-3'].includes(slug))||section.index===0&&slug==='vheer'||section.index===1&&slug==='vheer'||section.index===5&&slug==='vheer'||/FAQ|Frequently Asked|Questions About|Veo 3 questions/.test(section.heading??''))continue;
    const doc=new DOMParser().parseFromString(section.html,'text/html');const walker=doc.createTreeWalker(doc.body,4);let node;
    while((node=walker.nextNode())){const text=normalize(node.textContent??'');if(text.length>4&&!node.parentElement?.closest('svg,script,style'))expect(normalize(v.container.textContent??'')).toContain(text);}
   }
   if(slug==='grok-imagine'){expect(v.container.querySelector('table')).not.toBeNull();expect(v.container.querySelectorAll('a[href^="https://"]')).toHaveLength(3);}
   if(slug==='mindvideo-ai')expect(v.container.textContent).toContain('Keep the bottle upright and still. A soft reflection travels slowly across the glass');
   v.unmount();
  }
 });
 it('Vheer四用途有真实panel与键盘切换，隐藏panel不留多余tab入口',()=>{
  render(<AdditionalVideoModelBody path="/ai-video-models/vheer" locale="en"/>);
  const tabs=screen.getAllByRole('tab');expect(tabs.map(x=>x.textContent)).toEqual(['Social','Marketing','Stories','Education']);
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Social Posts From One Image');
  fireEvent.keyDown(tabs[0],{key:'End'});expect(tabs[3]).toHaveFocus();expect(screen.getByRole('tabpanel')).toHaveTextContent('Classroom and Explainer Clips');
  fireEvent.click(tabs[1]);expect(screen.getByRole('tabpanel')).toHaveTextContent('Product Ads and Website Clips');
 });
 it('Vheer舞台按四源身份循环，方向/dot/暂停清理均有消费者',()=>{
  vi.useFakeTimers();const v=render(<AdditionalVideoModelBody path="/ai-video-models/vheer" locale="en"/>);
  const stage=v.container.querySelector('[data-vheer-stage]')!;expect(stage).toHaveAttribute('data-example','coffee');
  fireEvent.click(screen.getByRole('button',{name:'Previous Vheer AI video example'}));expect(stage).toHaveAttribute('data-example','ski-dog');
  fireEvent.click(screen.getByRole('button',{name:'Next Vheer AI video example'}));expect(stage).toHaveAttribute('data-example','coffee');
  const dot=screen.getByRole('button',{name:/Coastal convertible.*3/});fireEvent.click(dot);expect(stage).toHaveAttribute('data-example','coastal');
  fireEvent.click(screen.getByRole('button',{name:'Pause video previews'}));act(()=>vi.advanceTimersByTime(15000));expect(stage).toHaveAttribute('data-example','coastal');
  fireEvent.click(screen.getByRole('button',{name:'Resume video previews'}));act(()=>vi.advanceTimersByTime(5200));expect(stage).toHaveAttribute('data-example','ski-dog');v.unmount();expect(vi.getTimerCount()).toBe(0);
 });
 it.each([
  {main:'coffee',dot:'Iced coffee pour example shown as a vheer ai video from the vheer ai video generator 1',left:'/platform/video-models/vheer/50c5bbcdcb7cddf6.mp4',right:'/platform/video-models/vheer/2a94553f215b11e4.mp4',front:'/platform/video-models/vheer/051daf07c55157b4.mp4'},
  {main:'snowboard',dot:'Snowboarder carving through powder in a vheer ai video generator action example 2',left:'/platform/video-models/vheer/2a94553f215b11e4.mp4',right:'/platform/video-models/vheer/7a660352d8621489.mp4',front:'/platform/video-models/vheer/50c5bbcdcb7cddf6.mp4'},
  {main:'coastal',dot:'Coastal convertible road trip animated as a vheer ai video example 3',left:'/platform/video-models/vheer/7a660352d8621489.mp4',right:'/platform/video-models/vheer/051daf07c55157b4.mp4',front:'/platform/video-models/vheer/2a94553f215b11e4.mp4'},
  {main:'ski-dog',dot:'Ski dog close-up created as a playful vheer ai video generator example 4',left:'/platform/video-models/vheer/051daf07c55157b4.mp4',right:'/platform/video-models/vheer/50c5bbcdcb7cddf6.mp4',front:'/platform/video-models/vheer/7a660352d8621489.mp4'},
 ])('Vheer主卡$main对应准确左右公开素材，而非只验证dot前卡',({main,dot,left,right,front})=>{
  const view=render(<AdditionalVideoModelBody path="/ai-video-models/vheer" locale="en"/>);
  fireEvent.click(screen.getByRole('button',{name:dot}));const stage=view.container.querySelector('[data-vheer-stage]')!;
  expect(stage).toHaveAttribute('data-example',main);
  expect(stage.querySelector('.is-left video')).toHaveAttribute('src',left);
  expect(stage.querySelector('.is-right video')).toHaveAttribute('src',right);
  expect(stage.querySelector('.is-front video')).toHaveAttribute('src',front);
 });
 it.each([390,768,1023,1024,1440])('Vheer在%ipx的实际后卡消费者只在lg挂载',width=>{
  const listeners=new Map<string,()=>void>();
  vi.stubGlobal('matchMedia',(query:string)=>({matches:query==='(min-width: 1024px)'&&width>=1024,addEventListener:vi.fn((_type:string,fn:()=>void)=>listeners.set(query,fn)),removeEventListener:vi.fn((_type:string,fn:()=>void)=>{if(listeners.get(query)===fn)listeners.delete(query)})}));
  const view=render(<AdditionalVideoModelBody path="/ai-video-models/vheer" locale="en"/>),stage=view.container.querySelector('[data-vheer-stage]')!;
  expect(stage.querySelectorAll('.is-left,.is-right')).toHaveLength(width>=1024?2:0);
  expect(stage.querySelectorAll('video')).toHaveLength(width>=1024?3:1);
  expect(stage.querySelector('.is-front video')).toHaveAttribute('src','/platform/video-models/vheer/051daf07c55157b4.mp4');
  expect(listeners.has('(min-width: 1024px)')).toBe(true);view.unmount();expect(listeners.size).toBe(0);
 });
 it('Sora大Play仅展示且不承诺动作；38FAQ完整双语且多开',()=>{
  const v=render(<AdditionalVideoModelBody path="/ai-video-models/sora-2" locale="en"/>);
  expect(v.container.querySelectorAll('[data-sora-display-play]')).toHaveLength(4);
  for(const icon of v.container.querySelectorAll('[data-sora-display-play]')){expect(icon).toHaveAttribute('aria-hidden','true');expect(icon.tagName).toBe('SPAN');expect(icon).not.toHaveAttribute('tabindex');}
  v.unmount();
  expect(Object.values(additionalVideoModelPages).flatMap(p=>p.faq)).toHaveLength(38);
  for(const reference of faqContract.pages){const page=additionalVideoModelPages[`/ai-video-models/${reference.page}` as AdditionalVideoModelPath];expect(page.faq).toHaveLength(reference.faq.length);reference.faq.forEach((row,i)=>{expect(page.faq[i].question.en).toBe(row.en.q);expect(page.faq[i].question['zh-CN']).toBe(row['zh-CN'].q);expect(page.faq[i].answer.en).toContain(row.en.a);expect(page.faq[i].answer['zh-CN']).toContain(row['zh-CN'].a)})}
  for(const path of Object.keys(additionalVideoModelPages) as AdditionalVideoModelPath[])for(const locale of ['en','zh-CN'] as const){const page=additionalVideoModelPages[path],current=render(<AdditionalVideoModelBody path={path} locale={locale}/>);const faq=current.container.querySelector('.platform-video-model-faq')!;
   for(const item of page.faq)fireEvent.click(within(faq as HTMLElement).getByRole('button',{name:item.question[locale]}));
   for(const item of page.faq){expect(faq).toHaveTextContent(item.answer[locale]);expect(item.question['zh-CN']).not.toBe(item.question.en);}
   current.unmount();
  }
 });
});
