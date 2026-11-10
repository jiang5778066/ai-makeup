import { describe, expect, it, vi } from 'vitest';
import { DanceMediaSlot, type DanceMediaDependencies } from './platform-dance-media-state';
function harness(kind: 'photo' | 'video' = 'photo') {
  let next = 0;
  const jobs: { resolve: (duration?: number) => void; reject: (e: Error) => void; signal: AbortSignal }[] = [];
  const deps: DanceMediaDependencies = {
    create: vi.fn(() => `blob:${++next}`), revoke: vi.fn(),
    probe: vi.fn((_kind, _file, _url, signal) => new Promise<number | undefined>((resolve, reject) => jobs.push({ resolve, reject, signal }))),
  };
  return { slot: new DanceMediaSlot(kind, deps), deps, jobs };
}
const photo = (name: string) => new File(['photo'], name, { type: 'image/png' });
const video = (name: string) => new File(['video'], name, { type: 'video/mp4' });
describe('AI Dance 专属媒体归属', () => {
  it('有效选择、替换和移除分别释放所拥有 URL', async () => {
    const { slot, jobs, deps } = harness();
    const a = slot.select(photo('a.png')); jobs[0].resolve(); await a;
    expect(slot.read().value?.name).toBe('a.png'); expect(deps.revoke).not.toHaveBeenCalled();
    const b = slot.select(photo('b.png')); expect(slot.read().value?.name).toBe('a.png'); jobs[1].resolve(); await b;
    expect(slot.read().value?.name).toBe('b.png'); expect(deps.revoke).toHaveBeenCalledWith('blob:1');
    slot.clear(); expect(slot.read().value).toBeNull(); expect(deps.revoke).toHaveBeenCalledWith('blob:2');
  });
  it('损坏替换保留旧选择并只释放候选 URL', async () => {
    const { slot, jobs, deps } = harness(); const a = slot.select(photo('a.png')); jobs[0].resolve(); await a;
    const b = slot.select(photo('broken.png')); jobs[1].reject(new Error('decode')); await b;
    expect(slot.read().value?.name).toBe('a.png'); expect(slot.read().pending).toBe(false); expect(slot.read().error).toBe('decode');
    expect(deps.revoke).toHaveBeenCalledWith('blob:2'); expect(deps.revoke).not.toHaveBeenCalledWith('blob:1');
  });
  it('首次 A 解码失败迟到，不能删除已替换成功的 B', async () => {
    const { slot, jobs, deps } = harness(); const a = slot.select(photo('a.png')); const b = slot.select(photo('b.png'));
    expect(jobs[0].signal.aborted).toBe(true); jobs[1].resolve(); await b; jobs[0].reject(new Error('late')); await a;
    expect(slot.read().value?.name).toBe('b.png'); expect(slot.read().error).toBeNull();
    expect(deps.revoke).toHaveBeenCalledTimes(1);
  });
  it('旧成功不能复活清除后或更新后的文件', async () => {
    const { slot, jobs } = harness(); const a = slot.select(photo('a.png')); slot.clear(); jobs[0].resolve(); await a;
    expect(slot.read().value).toBeNull(); const b = slot.select(photo('b.png')); slot.choose({ source: 'sample', url: '/sample.webp', name: 'sample' }); jobs[1].resolve(); await b;
    expect(slot.read().value?.source).toBe('sample');
  });
  it('取消不改变选择；类型和超限失败保旧，不创建 URL', async () => {
    const { slot, deps } = harness(); slot.choose({ source: 'sample', url: '/sample.webp', name: 'sample' }); await slot.select();
    expect(slot.read().value?.name).toBe('sample'); await slot.select(new File(['x'], 'x.gif', { type: 'image/gif' })); expect(slot.read().error).toBe('type');
    await slot.select(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })); expect(slot.read().error).toBe('size');
    expect(deps.create).not.toHaveBeenCalled(); expect(slot.read().value?.name).toBe('sample');
  });
  it('照片和视频独立；本地视频失败不撤销模板和照片', async () => {
    const a = harness(), b = harness('video'); a.slot.choose({ source: 'sample', url: '/photo.webp', name: 'photo' }); b.slot.choose({ source: 'template', url: '/dance.mp4', name: 'dance', id: 2 });
    const pending = b.slot.select(video('broken.mp4')); b.jobs[0].reject(new Error('decode')); await pending;
    expect(a.slot.read().value?.name).toBe('photo'); expect(b.slot.read().value?.id).toBe(2);
    const good = b.slot.select(video('ok.mp4')); b.jobs[1].resolve(7.25); await good; expect(b.slot.read().value?.duration).toBe(7.25);
  });
  it('离开/语言卸载释放已选与待解码 URL，迟到任务不能复活', async () => {
    const { slot, deps, jobs } = harness('video'); const a = slot.select(video('a.mp4')); jobs[0].resolve(6); await a;
    const b = slot.select(video('b.mp4')); slot.dispose(); jobs[1].resolve(10); await b;
    expect(slot.read().value).toBeNull(); expect(slot.read().pending).toBe(false); expect(deps.revoke).toHaveBeenCalledTimes(2);
    slot.activate(); expect(slot.read().value).toBeNull();
  });
});
