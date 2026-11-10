import { describe, expect, it } from 'vitest';
import { generatorModels } from './platform-generator-data';
import { GeneratorSessions, generatorSelectionKey } from './platform-generator-session';
import { icedItConfig, iceditPath, initializeIcedit, restoreIcedit, selectIcedit } from './platform-icedit-data';
import { iceditMetadata } from './platform-icedit-seo';

describe('ICEdit 页面成员与生命周期', () => {
  it('默认仅支持单图编辑，不继承共享模型配置', () => {
    const state = initializeIcedit();
    expect(state.model).toBe('icedit'); expect(state.mode).toBe('image');
    expect(icedItConfig(state)).toMatchObject({ max: 1, accept: 'image/*' });
    expect(state.parameters).toEqual({});
  });
  it.each([generatorModels[0].id, 'unknown-c3e-model'])('保留不支持身份 %s 并隔离文件入口，主动选择才恢复', model => {
    const state = initializeIcedit(`model=${model}`);
    expect(state.model).toBe(model); expect(icedItConfig(state)).toBeUndefined();
    const restored = restoreIcedit({ ...state, prompt: '保留提示词', parameters: { ratio: '16:9', duration: 8 } });
    expect(restored.model).toBe(model); expect(restored.parameters).toEqual({}); expect(icedItConfig(restored)).toBeUndefined();
    const selected = selectIcedit(restored);
    expect(selected.prompt).toBe('保留提示词'); expect(icedItConfig(selected)).toBeDefined();
  });
  it('不支持的模式与未知模式均无文件入口，不静默改模式', () => {
    for (const mode of ['text', 'unknown-mode']) {
      const state = initializeIcedit(`mode=${mode}`);
      expect(state.mode).toBe(mode); expect(icedItConfig(restoreIcedit(state))).toBeUndefined();
      expect(selectIcedit(state).mode).toBe('image');
    }
  });
  it('会话跨语言复用文本，离开释放文件标记，旧owner不能写回', () => {
    const sessions = new GeneratorSessions(), key = generatorSelectionKey(iceditPath, '');
    const a = sessions.acquire(key, initializeIcedit());
    sessions.write(key, a, { ...initializeIcedit(), prompt: 'my vision' }); sessions.markFiles(key, a); sessions.release(key, a);
    const b = sessions.acquire(key, initializeIcedit());
    expect(sessions.read(key)?.state.prompt).toBe('my vision'); expect(sessions.read(key)?.filesReleased).toBe(true);
    expect(sessions.write(key, a, initializeIcedit())).toBe(false); expect(b).not.toBe(a);
  });
  it.each(['en', 'zh-CN'] as const)('英中metadata使用绝对标题并保留canonical、语言与OG：%s', locale => {
    const metadata = iceditMetadata(locale);
    const title = locale === 'en' ? 'ICEdit AI Image Editor with Prompts | Makeup AI' : 'ICEdit AI 图片编辑器：用提示词编辑图片 | Makeup AI';
    const path = locale === 'en' ? iceditPath : `/zh-CN${iceditPath}`;
    expect(metadata.title).toEqual({ absolute: title });
    expect(title.match(/Makeup AI/g)).toHaveLength(1);
    expect(metadata.alternates).toEqual({ canonical: path, languages: { en: iceditPath, 'zh-CN': `/zh-CN${iceditPath}` } });
    expect(metadata.openGraph).toMatchObject({ title, description: metadata.description, type: 'website', locale: locale === 'en' ? 'en_US' : 'zh_CN', url: path });
  });
});
