import {describe,it,expect} from 'vitest';
import {initializeComposition,compositionKey,CompositionSessions,selectCompositionModel} from './platform-image-composition-state';
describe('图片合成专属状态',()=>{
 it('专页保留Nano身份并明确未知模型和模式冲突，重复参数取首值',()=>{
  const s=initializeComposition('combiner','en','model=unknown&model=1000&mode=text-to-image');
  expect(s.model).toBe('nano-banana-pro');expect(s.issues).toContain('unknown-model');expect(s.issues).toContain('unsupported-mode');
 });
 it('主动切换只使用真实注册模型，并按参数矩阵归一化',()=>{
  const s=selectCompositionModel(initializeComposition('merger','en',''),'gpt-image-2');
  expect(s.model).toBe('gpt-image-2');expect(s.parameters.resolution).toBeUndefined();
  expect(selectCompositionModel(s,'fake').model).toBe('fake');
 });
 it('语言往返保存文本但不保存File，参数请求和页面隔离且有界',()=>{
  const sessions=new CompositionSessions(2),a=compositionKey('combiner','model=1000&x=1'),b=compositionKey('merger','model=1000');
  expect(a).toBe(compositionKey('combiner','model=1000&x=2#generator'));
  const initial=initializeComposition('combiner','en',''),owner=sessions.acquire(a,initial);
  sessions.write(a,owner,{...initial,prompt:'已编辑'});sessions.release(a,owner,true);
  const next=sessions.acquire(a,initializeComposition('combiner','zh-CN',''));
  expect(sessions.read(a)?.state.prompt).toBe('已编辑');expect(sessions.read(a)?.filesReleased).toBe(true);
  expect(sessions.write(a,owner,{...initial,prompt:'旧owner'})).toBe(false);
  sessions.acquire(b,initial);sessions.acquire('third',initial);expect(sessions.read(a)).toBeUndefined();expect(next).not.toBe(owner);
 });
});
