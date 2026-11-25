import{render,screen,fireEvent,within}from'@testing-library/react';import{describe,it,expect,vi,beforeAll}from'vitest';
import{PlatformGeneratorPage}from'./platform-generator-page';
import { createMediaClient, MediaGenerationController } from '@/lib/media-client';
vi.mock('./site-shell',()=>({SiteShell:({children}:{children:React.ReactNode})=><>{children}</>}));
vi.mock('./use-platform-url',()=>({usePlatformUrl:(path:string)=>path}));
/* eslint-disable @next/next/no-img-element */
vi.mock('./platform-homepage-media',()=>({HomepageVideo:({poster}:{poster:string})=><img src={poster} alt="公开展示"/>}));
beforeAll(()=>{HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')}});
describe('四专用页面与真实本地交互',()=>{
 it('GPT精确初选，无分辨率；用户换Nano后出现4K，恢复本页模型',()=>{render(<PlatformGeneratorPage path="/ai-image-models/gpt-image-2" locale="zh-CN"/>);expect(screen.getByRole('heading',{level:1})).toHaveTextContent('GPT Image 2');expect(screen.queryByRole('group',{name:'分辨率'})).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'模型'}));fireEvent.click(screen.getByRole('option',{name:/Nano Banana Pro/}));expect(screen.getByRole('group',{name:'分辨率'})).toHaveTextContent('4K');fireEvent.click(screen.getByRole('button',{name:'恢复本页模型'}));expect(screen.queryByRole('group',{name:'分辨率'})).not.toBeInTheDocument();});
 it('视频搜索无结果可恢复，Wan2.5 10s打开门槛仍5s；取消不发请求',()=>{const request=vi.spyOn(globalThis,'fetch');render(<PlatformGeneratorPage path="/ai-video-generator" locale="en"/>);fireEvent.click(screen.getByRole('button',{name:'Model'}));const search=screen.getByRole('textbox',{name:'Search models'});fireEvent.change(search,{target:{value:'zzzz'}});expect(screen.getByText('No models found')).toBeInTheDocument();fireEvent.change(search,{target:{value:'Wan 2.5'}});fireEvent.click(screen.getByRole('button',{name:/Wan 2.5/}));const duration=screen.getByRole('group',{name:'Duration'});fireEvent.click(within(duration).getByRole('button',{name:/10s/}));expect(screen.getByRole('dialog')).toHaveTextContent('Membership');expect(within(duration).getByRole('button',{name:'5s'})).toHaveAttribute('aria-pressed','true');fireEvent.click(screen.getByRole('button',{name:'Back to settings'}));expect(screen.queryByRole('dialog')).not.toBeInTheDocument();const prompt=screen.getByRole('textbox',{name:'Prompt'});fireEvent.change(prompt,{target:{value:'local draft'}});fireEvent.submit(prompt.closest('form')!);expect(screen.getByRole('button',{name:'Generation not available yet'})).toBeDisabled();expect(request).not.toHaveBeenCalled();request.mockRestore();});
});

describe('完整正文动作与表单结果',()=>{
 it.each([
  ['en', 'text-to-video', 'text_to_video', 'Text to Video'],
  ['en', 'image-to-video', 'image_to_video', 'Image to Video'],
  ['zh-CN', 'text-to-video', 'text_to_video', '文生视频'],
  ['zh-CN', 'image-to-video', 'image_to_video', '图生视频'],
 ] as const)('%s %s 的九条常见问题适用能力开启和关闭', async (locale, mode, modeId, modeLabel) => {
  const zh = locale === 'zh-CN';
  const { container } = render(<PlatformGeneratorPage path="/ai-video-generator" locale={locale} initialQuery={`mode=${mode}`}/>);
  const panel = within(container.querySelector<HTMLElement>('#generator')!);
  expect(panel.getByRole('tab', { name: modeLabel })).toHaveAttribute('aria-selected', 'true');
  const faq = container.querySelector<HTMLElement>('.platform-generator-faq')!;
  const questions = within(faq).getAllByRole('button');
  expect(questions).toHaveLength(9);
  expect.soft(faq).not.toHaveTextContent(/Lanta AI/);
  const expected = zh
   ? [/生成面板.*确认报价.*我的作品/, /本地预览不扣积分.*免费额度.*报价/, /任务状态.*不提供固定完成时间/, /本地预览.*同意.*首帧.*核验.*报价/, /Grok Imagine Video 1\.5.*面板.*预览/, /公开示例.*外部模型/, /公开示例.*主体.*动作.*镜头/, /1 秒.*480p.*剪辑/, /预留.*结算.*退回.*待核对/]
   : [/generation panel.*confirm the quote.*My Creations/i, /local previews use no credits.*free quota.*quote/i, /task status.*no fixed completion time/i, /preview.*consent.*first frame.*verif.*quote/i, /Grok Imagine Video 1\.5.*panel.*preview/i, /public examples.*external models/i, /public examples.*subject.*action.*camera/i, /1 second.*480p.*edit/i, /reserved.*settled.*returned.*under review/i];
  for (const [index, question] of questions.entries()) {
   fireEvent.click(question);
   expect.soft(question).toHaveAttribute('aria-expanded', 'true');
   expect.soft(faq.querySelector('p')).toHaveTextContent(expected[index]);
   expect.soft(faq.querySelector('p')).not.toHaveTextContent(/生成(?:服务)?尚未(?:接入|开放)|不会发送生成任务|generation is not (?:connected|available)|3-5 minutes/i);
  }
  for (const enabled of [false, true]) {
   const capabilities = ['text_to_video', 'image_to_video'].map((candidate) => ({
    model: 'grok-imagine-video-1.5', mode: candidate, enabled: candidate === modeId ? enabled : !enabled,
    parameters: { durationSeconds: [1], resolution: ['480p'] },
   }));
   const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ capabilities }));
   const controller = new MediaGenerationController(createMediaClient(fetcher));
   controller.account('fixture-only', 1);
   controller.draft({ locale, mode: modeId, model: 'grok-imagine-video-1.5', prompt: 'fixture', files: [], selectionVersion: 0 });
   await controller.capabilities();
   expect(controller.available()).toBe(enabled);
   expect(fetcher).toHaveBeenCalledExactlyOnceWith('/api/media/capabilities', expect.objectContaining({ method: 'GET' }));
   controller.dispose();
  }
 });
 it.each(['en', 'zh-CN'] as const)('%s GPT Image 2 的两处资料提示和底部入口以生成面板为准', (locale) => {
  const { container } = render(<PlatformGeneratorPage path="/ai-image-models/gpt-image-2" locale={locale} initialQuery="model=gpt-image-2"/>);
  expect(container.querySelector('#generator')).toHaveAttribute('data-generator-model', 'gpt-image-2');
  const zh = locale === 'zh-CN';
  const hint = zh ? '可用模式以生成面板为准' : 'Check the generation panel for available modes';
  const fixedStatus = zh ? /生成服务尚未(?:接入|开放)/ : /Generation is not (?:connected|available)/i;
  const notes = [...container.querySelectorAll('.platform-generator-public-note')];
  expect(notes).toHaveLength(2);
  for (const note of notes) {
   expect.soft(note).not.toHaveTextContent(fixedStatus);
   expect.soft(note).toHaveTextContent(hint);
   expect.soft(note).toHaveTextContent(zh ? '外部模型公开资料' : 'External model information');
  }
  const footer = container.querySelector<HTMLElement>('.platform-generator-bottom-cta')!;
  expect.soft(footer).not.toHaveTextContent(fixedStatus);
  expect.soft(footer).toHaveTextContent(hint);
  expect.soft(within(footer).queryByRole('link', { name: zh ? '查看生成面板' : 'View generation panel' })).toHaveAttribute('href', '#generator');
  const faq = container.querySelector<HTMLElement>('.platform-generator-faq')!;
  for (const question of within(faq).getAllByRole('button')) {
   fireEvent.click(question);
   expect(faq.querySelector('p')).not.toHaveTextContent(zh ? /尚未接入|不能在此提交生成|不会上传或执行模型编辑|或提供该生成服务/ : /not connected for generation/i);
  }
 });
 it.each(['en', 'zh-CN'] as const)('%s 通用图片页引导查看面板并区分本地预览和实际任务', (locale) => {
  const zh = locale === 'zh-CN';
  const { container } = render(<PlatformGeneratorPage path="/ai-image-generator" locale={locale}/>);
  const panel = within(container.querySelector<HTMLElement>('#generator')!);
  expect(panel.getByRole('button', { name: zh ? '获取报价' : 'Get quote' })).toBeDisabled();
  expect(panel.getByText(zh ? '生成服务暂未开放。' : 'Generation is currently unavailable.')).toBeVisible();
  const hero = container.querySelector('.platform-generator-hero');
  const content = container.querySelector('.platform-generator-content-image');
  const fixedStatus = zh ? /(?:尚未开放|暂不可用|只提供本地预览|尚未连接生成|尚未接入.*生成)/ : /(?:generation is (?:unavailable|not connected|not available)|offers local previews only|not connected for generation)/i;
  expect(hero).not.toHaveTextContent(fixedStatus);
  expect(content).not.toHaveTextContent(fixedStatus);
  expect(content).toHaveTextContent(zh ? '可用模式以生成面板为准' : 'Check the generation panel for available modes');
  expect(content).toHaveTextContent(zh ? '本地预览不扣额度' : 'Local preview uses no credits');
  const faq = container.querySelector<HTMLElement>('.platform-generator-faq')!;
  for (const question of within(faq).getAllByRole('button').slice(1)) {
   fireEvent.click(question);
   expect(faq.querySelector('p')).not.toHaveTextContent(fixedStatus);
  }
  fireEvent.click(within(faq).getByRole('button', { name: zh ? /可以商用/ : /use commercially/i }));
  expect(faq.querySelector('p')).toHaveTextContent(zh ? '商用授权' : 'commercial image rights');
 });
 it.each(['en', 'zh-CN'] as const)('%s Nano Banana Pro 保留该模型的本地预览说明', (locale) => {
  const zh = locale === 'zh-CN';
  const { container } = render(<PlatformGeneratorPage path="/ai-image-models/nano-banana-pro" locale={locale} initialQuery="model=nano-banana-pro"/>);
  const panel = within(container.querySelector<HTMLElement>('#generator')!);
  expect(panel.getByRole('button', { name: zh ? '生成暂不可用' : 'Generation not available yet' })).toBeDisabled();
  expect(panel.queryByRole('button', { name: zh ? '获取报价' : 'Get quote' })).not.toBeInTheDocument();
  const notes = [...container.querySelectorAll('.platform-generator-public-note')];
  expect(notes).toHaveLength(2);
  for (const note of notes) expect(note).toHaveTextContent(zh ? 'Nano Banana Pro 仅供预览' : 'Nano Banana Pro is available for preview');
  fireEvent.click(panel.getByRole('button', { name: zh ? '模型' : 'Model' }));
  fireEvent.click(panel.getByRole('option', { name: 'GPT Image 2' }));
  expect(panel.getByRole('button', { name: zh ? '获取报价' : 'Get quote' })).toBeInTheDocument();
  for (const note of notes) expect(note).toHaveTextContent(zh ? 'Nano Banana Pro 仅供预览' : 'Nano Banana Pro is available for preview');
  fireEvent.click(panel.getByRole('button', { name: zh ? '恢复本页模型' : 'Restore page model' }));
  expect(panel.getByRole('button', { name: zh ? '生成暂不可用' : 'Generation not available yet' })).toBeDisabled();
 });
 it.each([
  ['en','text-to-video','Text to Video'],
  ['en','image-to-video','Image to Video'],
  ['zh-CN','text-to-video','文生视频'],
  ['zh-CN','image-to-video','图生视频'],
 ] as const)('%s 的 %s 使用当前面板状态说明公开视频与生成步骤', (locale, mode, modeLabel) => {
  const zh = locale === 'zh-CN';
  const { container } = render(<PlatformGeneratorPage path="/ai-video-generator" locale={locale} initialQuery={`mode=${mode}`}/>);
  const panel = within(container.querySelector<HTMLElement>('#generator')!);
  expect(panel.getByRole('tab', { name: modeLabel })).toHaveAttribute('aria-selected', 'true');
  const note = container.querySelector('.platform-generator-public-note');
  const step = screen.getByRole('button', { name: zh ? /^步骤 3：生成视频/ : /^Step 3: Generate Your Video/ });
  const fixedStatus = zh ? /(?:尚未接入|尚未开放|不会提交任务)/ : /(?:Generation is not connected|without submitting a task)/i;
  expect.soft(note).not.toHaveTextContent(fixedStatus);
  expect.soft(step).not.toHaveTextContent(fixedStatus);
  expect.soft(note).toHaveTextContent(zh ? '外部模型公开资料' : 'External model information');
  expect.soft(note).toHaveTextContent(zh ? '可用模式以生成面板为准' : 'Check the generation panel for available modes');
  expect.soft(step).toHaveTextContent(zh ? '确认报价' : 'confirm the quote');
  expect.soft(step).toHaveTextContent(zh ? '我的作品' : 'My Creations');
  fireEvent.click(step);
  expect(step).toHaveAttribute('aria-pressed', 'true');
 });
 it('GPT用途切换改变面板，使用公开提示词选择文生图并保留GPT身份',()=>{Element.prototype.scrollIntoView=vi.fn();render(<PlatformGeneratorPage path="/ai-image-models/gpt-image-2" locale="en"/>);const tabs=screen.getAllByRole('tab').filter(t=>t.id.startsWith('generator-use-'));fireEvent.click(tabs[1]);expect(tabs[1]).toHaveAttribute('aria-selected','true');expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby',tabs[1].id);fireEvent.click(screen.getAllByRole('button',{name:'Use Prompt'})[0]);expect(screen.getByRole('tab',{name:'Text to Image'})).toHaveAttribute('aria-selected','true');expect(screen.getByRole('textbox',{name:'Prompt'})).not.toHaveValue('');expect(document.querySelector('[data-generator-model]')).toHaveAttribute('data-generator-model','gpt-image-2');});
 it('Nano保留多开FAQ，视频步骤替换图片且完整横滑示例可见',()=>{const {unmount}=render(<PlatformGeneratorPage path="/ai-image-models/nano-banana-pro" locale="en"/>);const details=[...document.querySelectorAll('details')];details[0].open=true;details[1].open=true;expect(details[0].open&&details[1].open).toBe(true);unmount();render(<PlatformGeneratorPage path="/ai-video-generator" locale="en"/>);const buttons=[...document.querySelectorAll('.platform-generator-video-steps button')];const image=document.querySelector('.platform-generator-video-steps img')!;const previous=image.getAttribute('src');fireEvent.click(buttons[1]);expect(image.getAttribute('src')).not.toBe(previous);expect(buttons[1]).toHaveAttribute('aria-pressed','true');expect(document.querySelectorAll('.platform-generator-video-track [data-preview-card]')).toHaveLength(10);});
});
