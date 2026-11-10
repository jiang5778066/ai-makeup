import { describe, expect, it } from 'vitest';
import { changeDreamfaceMode, chooseDreamfaceModel, dreamfaceContent, dreamfacePath, initializeDreamface, restoreDreamfaceState, selectDreamfaceDuration } from './platform-dreamface-data';
import { generatorSelectionKey, GeneratorSessions } from './platform-generator-session';
import { dreamfaceMedia, completeDreamfaceMedia, dreamfaceIcons } from './platform-dreamface-media';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

describe('DreamFace局部选择来源与身份', () => {
  it('仅automatic来源随模式切换112/805，保留Prompt和共同合法参数', () => {
    const image = initializeDreamface('');
    expect(image).toMatchObject({ model: 'lanta-2-1', mode: 'image', selectionSource: 'automatic', parameters: { duration: 3, resolution: '540P' } });
    const text = changeDreamfaceMode({ ...image, prompt: 'Synthetic garden', parameters: { duration: 8, resolution: '720P' } }, 'text');
    expect(text).toMatchObject({ model: 'wan-3-0', mode: 'text', prompt: 'Synthetic garden', selectionSource: 'automatic', parameters: { duration: 8, resolution: '720P' } });
    expect(changeDreamfaceMode(text, 'image')).toMatchObject({ model: 'lanta-2-1', parameters: { duration: 8, resolution: '720P' } });
    expect(initializeDreamface('?tab=text').parameters.sound).toBe(false);
  });
  it('显式未知保requested且空参数，已知unsupported不替换', () => {
    for (const id of ['dreamface-ai', 'unknown', '']) {
      const state = initializeDreamface(`?model=${id}&mode=text-to-video`);
      expect(state).toMatchObject({ model: id, selectionSource: 'explicit-url', parameters: {} });
      expect(state.issues).toContain('unknown-model');
      expect(changeDreamfaceMode(state, 'image').model).toBe(id);
    }
    const explicit = initializeDreamface('?model=112&mode=text-to-video&tab=image');
    expect(explicit).toMatchObject({ model: 'lanta-2-1', mode: 'text', parameters: {} });
    expect(explicit.issues).toEqual(expect.arrayContaining(['unsupported-mode', 'mode-tab-conflict']));
    expect(initializeDreamface('?model=805&model=112&mode=text-to-video&mode=image-to-video').model).toBe('wan-3-0');
  });
  it('主动换型清除不合法参数并提示，unknown不遗留上一型号参数',()=>{
    const image={...initializeDreamface(''),parameters:{duration:8,resolution:'720P',ratio:'16:9'}};
    const selected=chooseDreamfaceModel(image,'lanta-2-1');
    expect(selected.parameters.ratio).toBeUndefined();
    expect(selected.issues).toContain('parameters-normalized');
    expect(chooseDreamfaceModel(image,'unknown')).toMatchObject({parameters:{},issues:expect.arrayContaining(['unknown-model'])});
  });
  it('主动选择即explicit-user，不能凭112/805数值猜自动；旧metadata缺失保守处理', () => {
    const chosen = chooseDreamfaceModel(initializeDreamface(''), '112');
    expect(chosen.selectionSource).toBe('explicit-user');
    expect(changeDreamfaceMode(chosen, 'text')).toMatchObject({ model: 'lanta-2-1', parameters: {} });
    expect(changeDreamfaceMode(chosen, 'text').issues).toContain('unsupported-mode');
    const { selectionSource, ...legacy } = initializeDreamface('');
    expect(selectionSource).toBe('automatic');
    expect(restoreDreamfaceState(legacy).selectionSource).toBe('explicit-user');
    expect(restoreDreamfaceState(chosen).selectionSource).toBe('explicit-user');
  });
  it('同selection忽略tracking/hash，来源随会话恢复；旧owner与不同URL选择不能覆盖', () => {
    const key = generatorSelectionKey(dreamfacePath, '?utm_source=x#generator');
    expect(key).toBe(generatorSelectionKey(dreamfacePath, ''));
    expect(key).not.toBe(generatorSelectionKey(dreamfacePath, '?model=112'));
    const sessions = new GeneratorSessions();
    const first = sessions.acquire(key, initializeDreamface(''));
    const chosen = { ...chooseDreamfaceModel(initializeDreamface(''), '805'), prompt: 'Keep me' };
    expect(sessions.write(key, first, chosen)).toBe(true);
    sessions.release(key, first);
    const second = sessions.acquire(key, initializeDreamface(''));
    expect(restoreDreamfaceState(sessions.read(key)!.state)).toMatchObject({ prompt: 'Keep me', selectionSource: 'explicit-user' });
    expect(sessions.write(key, first, initializeDreamface(''))).toBe(false);
    sessions.release(key, first);
    expect(sessions.read(key)!.owner).toBe(second);
    expect(JSON.stringify(sessions.read(key)!.state)).not.toMatch(/blob:|File/);
  });
  it('5s仅门槛不改值，4s/8s合法预览，720P不附加资格', () => {
    const state = { ...initializeDreamface(''), prompt: 'Keep gate prompt' };
    expect(selectDreamfaceDuration(state, 5)).toEqual({ state, gated: true });
    expect(selectDreamfaceDuration(state, 8)).toMatchObject({ gated: false, state: { parameters: { duration: 8 }, prompt: state.prompt } });
    expect(selectDreamfaceDuration(state, 4).state.parameters.duration).toBe(4);
    expect(selectDreamfaceDuration(state, 99).state.parameters.duration).toBe(3);
    expect(selectDreamfaceDuration(initializeDreamface('?tab=text'), 5).gated).toBe(false);
  });
});

describe('DreamFace完整内容与准确媒体', () => {
  it('图标准确指向完整本地PNG/WebP，不能用空映射或错误体代替', () => {
    expect(dreamfaceIcons).toEqual({ lanta: '/platform/dreamface/lanta-icon-192.png', vip: '/platform/dreamface/vip-icon.webp' });
    const lanta = readFileSync(`public${dreamfaceIcons.lanta}`);
    expect(lanta.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(createHash('sha256').update(lanta).digest('hex')).toBe('1c40f7dbf5f84b41b0a2368e533e462486c7ef37f707aa62c371adfd534cf7e6');
    expect([lanta.readUInt32BE(16), lanta.readUInt32BE(20)]).toEqual([192, 192]);
    const vip = readFileSync(`public${dreamfaceIcons.vip}`);
    expect(vip.subarray(0, 4).toString()).toBe('RIFF');
    expect(vip.subarray(8, 12).toString()).toBe('WEBP');
    expect(vip.readUInt32LE(4) + 8).toBe(vip.length);
  });
  it('八区双语完整、四能力三用途三步骤九FAQ，主体与不可生成身份明确', () => {
    for (const locale of ['en', 'zh-CN'] as const) {
      const content = dreamfaceContent[locale];
      expect(content.sections).toHaveLength(8);
      expect(content.faq).toHaveLength(9);
      expect(content.sections[2].text.length).toBeGreaterThan(18);
      expect(content.sections[4].text.join(' ')).toMatch(/DreamFace/);
      expect(content.faq[5].answer).toMatch(/本项目|this project/);
      expect(content.faq[4].answer).toMatch(/暂不可用|not available/);
    }
  });
  it('四个consumer完整source/poster且只本地映射，分别缺video或poster均不伪装完整', () => {
    expect(dreamfaceMedia).toHaveLength(4);
    for (const media of dreamfaceMedia) {
      expect(completeDreamfaceMedia(media)).toBe(true);
      expect(completeDreamfaceMedia({ ...media, src: null })).toBe(false);
      expect(completeDreamfaceMedia({ ...media, poster: null })).toBe(false);
      expect(media.source).toMatch(/^https:\/\/cdn\.lantaai\.com\//);
      expect(media.src).toMatch(/^\/platform\//);
      expect(media.poster).toMatch(/^\/platform\//);
      expect(existsSync(`public${media.src}`)).toBe(true);
      expect(existsSync(`public${media.poster}`)).toBe(true);
    }
  });
});
