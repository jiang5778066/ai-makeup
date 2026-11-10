import {fireEvent,render,screen,within} from '@testing-library/react';
import {describe,expect,it,vi} from 'vitest';
import {PlatformGeneratorContent} from './platform-generator-content';
import {generatorContent} from '@/lib/platform-generator-content-data';
vi.mock('./platform-homepage-media',()=>({HomepageVideo:()=>null}));
describe('逐题中文FAQ与正文专属结构',()=>{
 it('八题逐项回答对应主题，单开、关闭和英文原答案保持',()=>{
  const terms=['OpenAI','海报','文字','光照','动漫','背景','一致','非英文'];
  const cards=generatorContent.gpt['zh-CN'].at(-2)!.cards;
  expect(cards).toHaveLength(8);expect(new Set(cards.map(c=>c.description)).size).toBe(8);
  const {unmount}=render(<PlatformGeneratorContent family="gpt" locale="zh-CN" onPrompt={vi.fn()}/>);
  const faq=document.querySelector('.platform-generator-faq')!;
  cards.forEach((c,i)=>{expect(c.description).toContain(terms[i]);fireEvent.click(within(faq as HTMLElement).getByRole('button',{name:new RegExp(c.title.replace(/[？?]/g,''))}));expect(faq.querySelectorAll('p')).toHaveLength(1);expect(faq.querySelector('p')?.textContent).toBe(c.description)});
  fireEvent.click(within(faq as HTMLElement).getAllByRole('button')[7]);expect(faq.querySelector('p')).toBeNull();unmount();
  render(<PlatformGeneratorContent family="gpt" locale="en" onPrompt={vi.fn()}/>);fireEvent.click(screen.getByRole('button',{name:/What is GPT Image 2/}));expect(document.querySelector('.platform-generator-faq p')?.textContent).toBe(generatorContent.gpt.en.at(-2)!.cards[0].description);
 });
 it('用途五项依次换图文，键盘Home/End和焦点保留',()=>{
  render(<PlatformGeneratorContent family="gpt" locale="en" onPrompt={vi.fn()}/>);const tabs=screen.getAllByRole('tab');const sources=new Set();
  tabs.forEach((tab,i)=>{fireEvent.click(tab);expect(tab).toHaveAttribute('aria-selected','true');expect(screen.getByRole('tabpanel')).toHaveTextContent(generatorContent.gpt.en[0].cards[i].title);sources.add(screen.getByRole('tabpanel').querySelector('img')?.src)});expect(sources.size).toBe(5);
  fireEvent.keyDown(tabs[4],{key:'Home'});expect(tabs[0]).toHaveFocus();fireEvent.keyDown(tabs[0],{key:'End'});expect(tabs[4]).toHaveFocus();
 });
 it('Nano保留三组图文、分段、图片内角标，末尾说明独立完整；标题有渐变范围',()=>{
  render(<PlatformGeneratorContent family="nano" locale="en" onPrompt={vi.fn()}/>);const section=document.querySelector('.platform-generator-section-nano-1')!;
  expect(section.querySelector('h2 .platform-generator-gradient')).toHaveTextContent('What Is Nano Banana Pro?');
  expect(section.querySelectorAll('.platform-generator-nano-feature')).toHaveLength(3);
  expect(section.querySelectorAll('figure figcaption')).toHaveLength(3);
  expect(section.querySelector('.platform-generator-nano-feature')?.querySelectorAll('.platform-generator-nano-copy p')).toHaveLength(2);
  expect(section.querySelector('.platform-generator-nano-summary')).toHaveTextContent('Why teams choose Nano Banana Pro');
  expect(document.querySelectorAll('details')).toHaveLength(generatorContent.nano.en.at(-2)!.cards.length);
 });
});
