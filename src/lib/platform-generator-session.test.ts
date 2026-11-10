import {describe,expect,it} from 'vitest';
import {GeneratorSessions,generatorSelectionKey} from './platform-generator-session';
import {initializeGenerator} from './platform-generator-parameters';
describe('生成器局部有界参数内存',()=>{
 it('相同路径首值选择跨语言/hash保持身份，明确新URL与别的产品隔离',()=>{
 expect(generatorSelectionKey('/ai-image-generator','model=gpt-image-2&model=x&next=a#old')).toBe(generatorSelectionKey('/ai-image-generator','model=gpt-image-2&model=y&next=b'));
 expect(generatorSelectionKey('/ai-image-generator','model=nano-banana-pro')).not.toBe(generatorSelectionKey('/ai-image-generator','model=gpt-image-2'));
 });
 it('正常语言往返保留文本参数，失活旧owner不能覆盖新owner；有文件只记重选提示',()=>{
 const store=new GeneratorSessions(2),state=initializeGenerator('/ai-image-generator','');
 const old=store.acquire('one',state);store.write('one',old,{...state,prompt:'用户新输入'});store.markFiles('one',old);store.release('one',old);
 const next=store.acquire('one',state);expect(store.read('one')?.state.prompt).toBe('用户新输入');expect(store.read('one')?.filesReleased).toBe(true);expect(store.write('one',old,{...state,prompt:'旧缓存'})).toBe(false);
 expect(store.write('one',next,{...state,prompt:'当前'})).toBe(true);expect(store.read('one')?.state.prompt).toBe('当前');
 store.acquire('two',state);store.acquire('three',state);expect(store.read('one')).toBeUndefined();
 });
});
