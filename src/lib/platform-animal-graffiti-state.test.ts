import {describe,it,expect} from 'vitest';
import {initializeAnimalGraffiti,animalGraffitiKey,animalGraffitiModels} from './platform-animal-graffiti-state';
import {animalGraffitiContent} from './platform-animal-graffiti-content';
describe('动物与涂鸦专属模型身份',()=>{
 it('重复参数取首值，未知模型保留而不回退',()=>{const state=initializeAnimalGraffiti('model=missing&model=1000&mode=text-to-image');expect(state.model).toBe('missing');expect(state.parameters).toEqual({});expect(state.issues).toContain('unknown-model')});
 it('准确公开ID解析，mode优先tab并明确冲突',()=>{const state=initializeAnimalGraffiti('model=1000&mode=image-to-image&tab=text');expect(state.model).toBe('nano-banana-pro');expect(state.mode).toBe('image');expect(state.issues).toContain('mode-tab-conflict');expect(state.parameters.resolution).toBe('1K')});
 it('两入口隔离、语言及tracking不清除参数会话',()=>{expect(animalGraffitiKey('animal','model=1000&utm=1')).toBe(animalGraffitiKey('animal','model=1000&utm=2'));expect(animalGraffitiKey('animal','')).not.toBe(animalGraffitiKey('graffiti',''))});
 it('观察列表不混入其它模型，参数与未知模式分别处理',()=>{expect(animalGraffitiModels('text').some(m=>m.name==='Z Image Spicy')).toBe(true);expect(animalGraffitiModels('image').some(m=>m.name==='Z Image Spicy')).toBe(false);expect(initializeAnimalGraffiti('mode=unknown').issues).toContain('unknown-mode')});
 it('逐题保留未观察语言的拟译身份与不同页族完整段落',()=>{expect(animalGraffitiContent.animal['zh-CN'].faq).toHaveLength(10);expect(animalGraffitiContent.graffiti.en.faq).toHaveLength(8);expect(animalGraffitiContent.animal.en.sections.map(s=>s.kind)).toContain('styles');expect(animalGraffitiContent.graffiti.en.sections.map(s=>s.kind)).toContain('prompts');expect(animalGraffitiContent.graffiti['zh-CN'].faq.every(f=>!f.observed)).toBe(true)});
});

describe('本轮准确文案和模型顺序',()=>{
 it('英文动物页六个相关标题使用原文，保留路径和顺序',()=>{
  const related=animalGraffitiContent.animal.en.sections.find(s=>s.kind==='related')!;
  expect(related.links?.map(l=>l.path)).toEqual(['/ai-image-generator','/tools/ai-wallpaper-generator','/tools/ai-image-to-video','/tools/ai-graffiti-generator','/image-style-converter','/tools/ai-animate-image-generator','/tools/ai-text-to-video','/ai-image-models/nano-banana-pro']);
  expect(related.links?.map(l=>l.title)).toEqual(['AI Image Generator','AI Wallpaper Generator','AI Image to Video','AI Graffiti Generator','Image to Ghibli Style','AI Animate Image Generator','AI Text to Video','Nano Banana Pro']);
 });
 it('按本页图像原文顺序提供十二个模型',()=>{
  expect(animalGraffitiModels('image').map(m=>m.name)).toEqual(['Seedream 5.0 Pro','Seedream 5.0 Lite','GPT Image 2','GPT Image 2.5 Flare','GPT Image 2.5 Sunburst','Nano Banana Pro','Wan 2.7 Image Pro','Flux 2 Pro','Flux 2 Flex','Qwen Image Edit Spicy','Qwen Image Edit Max','Wan 2.5']);
 });
});
