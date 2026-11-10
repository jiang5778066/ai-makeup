import { describe, expect, it } from 'vitest';
import { generatorSessions } from './platform-generator-session';
import { initializePerchance, restorePerchance, selectPerchance, perchanceConfig, perchancePath } from './platform-perchance-state';
describe('Perchance 页面成员隔离与恢复',()=>{
 it('工厂默认仅文生图和本页五种比例',()=>{const s=initializePerchance('');expect(s.model).toBe('perchance');expect(s.mode).toBe('text');expect(s.parameters).toEqual({ratio:'1:1'});expect(perchanceConfig(s)?.ratios).toEqual(['1:1','3:4','4:3','9:16','16:9'])});
 it.each([['gpt-image-2','unsupported-page-model'],['not-a-real-model','unknown-model']])('保留%s身份且不激活其它参数', (model,issue)=>{const s=initializePerchance(`model=${model}`);expect(s.model).toBe(model);expect(s.issues).toContain(issue);expect(s.parameters).toEqual({});expect(perchanceConfig(s)).toBeUndefined();expect(perchanceConfig(restorePerchance({...s,parameters:{ratio:'16:9',resolution:'4K'}}))).toBeUndefined()});
 it('不支持的模式不能借恢复激活配置',()=>{for(const query of ['mode=image-to-image','mode=alien','tab=image']){const s=initializePerchance(query);expect(perchanceConfig(s)).toBeUndefined();expect(perchanceConfig(restorePerchance(s))).toBeUndefined();expect(selectPerchance(s).mode).toBe('text')}});
 it('主动选择才恢复正常，并保留提示词',()=>{const s=selectPerchance({...initializePerchance('model=unknown'),prompt:'雨后的森林'});expect(s.prompt).toBe('雨后的森林');expect(s.parameters).toEqual({ratio:'1:1'});expect(perchanceConfig(s)).toBeDefined()});
 it('会话/语言恢复重新校验页面成员，外页参数不能泄露',()=>{const key=perchancePath+':negative';const owner=generatorSessions.acquire(key,{...initializePerchance(''),model:'gpt-image-2',parameters:{ratio:'16:9'}});const s=restorePerchance(generatorSessions.read(key)!.state);expect(s.model).toBe('gpt-image-2');expect(s.parameters).toEqual({});generatorSessions.release(key,owner)});
 it('支持成员恢复仅接受本页比例',()=>{const s=restorePerchance({...initializePerchance(''),parameters:{ratio:'21:9',resolution:'4K'}});expect(s.parameters).toEqual({ratio:'1:1'})});
});
