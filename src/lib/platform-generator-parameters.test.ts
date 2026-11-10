import { describe, expect, it } from 'vitest';
import { initializeGenerator, changeGeneratorModel, changeGeneratorMode, normalizeParameters, selectDuration } from './platform-generator-parameters';
import { generatorModels } from './platform-generator-data';

describe('生成器URL身份与参数归属', () => {
 it('首个重复参数生效，有效mode优先tab；用户新选择不依赖旧URL', () => {
  const state=initializeGenerator('/ai-image-generator', 'model=gpt-image-2&model=nano-banana-pro&mode=text-to-image&tab=image');
  expect(state.model).toBe('gpt-image-2');expect(state.mode).toBe('text');expect(state.issues).toContain('mode-tab-conflict');
  const next=changeGeneratorModel({...state,prompt:'保留我的输入'},'nano-banana-pro');
  expect(next.model).toBe('nano-banana-pro');expect(next.prompt).toBe('保留我的输入');
 });
 it('专用页精确初选，显式冲突和未知不会被伪装成满足', () => {
  expect(initializeGenerator('/ai-image-models/gpt-image-2','').model).toBe('gpt-image-2');
  expect(initializeGenerator('/ai-image-models/nano-banana-pro','model=gpt-image-2').issues).toContain('path-model-conflict');
  const unknown=initializeGenerator('/ai-image-generator','model=unobserved');expect(unknown.model).toBe('unobserved');expect(unknown.issues).toContain('unknown-model');
 });
 it('保留支持参数，清除GPT无分辨率与text不支持的图模型', () => {
  const initial=initializeGenerator('/ai-image-generator','model=nano-banana-pro');
  const gpt=changeGeneratorModel({...initial,parameters:{...initial.parameters,resolution:'4K',ratio:'16:9'}},'gpt-image-2');
  expect(gpt.parameters.resolution).toBeUndefined();expect(gpt.parameters.ratio).toBe('16:9');
  const edit=changeGeneratorModel(initial,'qwen-image-edit-spicy');const text=changeGeneratorMode(edit,'text');
  expect(text.model).toBe('qwen-image-edit-spicy');expect(text.issues).toContain('unsupported-mode');
  expect(changeGeneratorModel(text,'gpt-image-2').issues).not.toContain('unsupported-mode');
 });
 it('Wan2.5门槛保持5s且URL和缓存归一化也不能灌入10s；别的模型正常10s', () => {
  const state=initializeGenerator('/ai-video-generator','model=wan-2-5&duration=10');
  expect(state.parameters.duration).toBe(5);
  expect(selectDuration(state,10)).toMatchObject({gated:true,state:{parameters:{duration:5}}});
  expect(selectDuration(state,5).gated).toBe(false);
  expect(normalizeParameters(generatorModels.find(x=>x.id==='wan-2-5')!,'image',{duration:10}).duration).toBe(5);
  expect(selectDuration(changeGeneratorModel(state,'wan-2-6'),10)).toMatchObject({gated:false,state:{parameters:{duration:10}}});
 });
 it('模式改变清除不支持的多镜头与声音，保持提示词并按新上限报错', () => {
  const state=initializeGenerator('/ai-video-generator','model=wan-2-6');
  const text=changeGeneratorMode({...state,prompt:'x'.repeat(5001),parameters:{...state.parameters,multishot:true}},'text');
  expect(text.parameters.multishot).toBeUndefined();expect(text.prompt).toHaveLength(5001);expect(text.issues).toContain('prompt-too-long');
  const seed=changeGeneratorModel({...text,prompt:'正常'},'seedance-2-0');expect(seed.issues).not.toContain('prompt-too-long');
 });
 it('两模式模型集和特殊模型控件保留实测差异', () => {
  expect(generatorModels.filter(x=>x.kind==='image'&&x.modes.image).length).toBe(12);
  expect(generatorModels.filter(x=>x.kind==='image'&&x.modes.text).length).toBe(12);
  expect(generatorModels.filter(x=>x.kind==='video'&&x.modes.image).length).toBe(24);
  expect(generatorModels.filter(x=>x.kind==='video'&&x.modes.text).length).toBe(19);
  expect(generatorModels.find(x=>x.id==='gpt-image-2-5-flare')?.modes.image?.reference).toMatchObject({max:16,maxBytes:30*1024*1024});
  expect(generatorModels.find(x=>x.id==='wan-2-5')?.modes.image?.reference?.max).toBe(1);
  expect(generatorModels.find(x=>x.id==='kling-4-0')?.modes.image?.durationRange).toEqual([3,30]);
 });
});

it('DreamFace显式已知与未知及unsupported只保真实请求不静默替代',()=>{const path='/ai-video-models/dreamface-ai';expect(initializeGenerator(path,'model=805&tab=text')).toMatchObject({model:'wan-3-0',mode:'text'});for(const id of ['dreamface-ai','unknown']){const state=initializeGenerator(path,`model=${id}`);expect(state.model).toBe(id);expect(state.parameters).toEqual({});expect(state.issues).toContain('unknown-model');}expect(initializeGenerator(path,'model=112&tab=text')).toMatchObject({model:'lanta-2-1',parameters:{},issues:expect.arrayContaining(['unsupported-mode'])});});
