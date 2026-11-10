import { afterEach, describe, expect, it, vi } from 'vitest';
import { probeDanceMedia } from './platform-dance-media-state';
function file(type: string, bytes: number[]) {
  const value = new File(['x'], 'test', { type });
  vi.spyOn(value, 'slice').mockReturnValue({ arrayBuffer: async () => new Uint8Array(bytes).buffer } as Blob);
  return value;
}
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
describe('AI Dance 真实探测路径', () => {
  it('伪装 MIME 的损坏文件在创建媒体节点前被拒绝', async () => {
    const create = vi.spyOn(document, 'createElement');
    await expect(probeDanceMedia('video', file('video/mp4', [1, 2, 3]), 'blob:bad', new AbortController().signal)).rejects.toThrow('signature');
    expect(create).not.toHaveBeenCalled();
  });
  it('有效视频元数据与正有限时长可通过，探测节点取源随后释放', async () => {
    const node = document.createElement('video'); vi.spyOn(node, 'pause').mockImplementation(() => {}); vi.spyOn(node, 'load').mockImplementation(() => {});
    Object.defineProperties(node, { duration: { value: 8.5 }, videoWidth: { value: 480 } });
    vi.spyOn(document, 'createElement').mockReturnValue(node);
    const p = probeDanceMedia('video', file('video/mp4', [0, 0, 0, 20, 102, 116, 121, 112]), 'blob:ok', new AbortController().signal);
    await Promise.resolve(); await Promise.resolve(); node.dispatchEvent(new Event('loadedmetadata'));
    await expect(p).resolves.toBe(8.5); expect(node.getAttribute('src')).toBeNull();
  });
  it('传统 MOV 容器首原子为 moov 时仍能进入本地元数据校验', async () => {
    const node = document.createElement('video'); vi.spyOn(node, 'pause').mockImplementation(() => {}); vi.spyOn(node, 'load').mockImplementation(() => {});
    Object.defineProperties(node, { duration: { value: 2 }, videoWidth: { value: 320 } }); vi.spyOn(document, 'createElement').mockReturnValue(node);
    const pending = probeDanceMedia('video', file('video/quicktime', [0, 0, 0, 24, 109, 111, 111, 118]), 'blob:mov', new AbortController().signal);
    const result = expect(pending).resolves.toBe(2); await Promise.resolve(); await Promise.resolve(); node.dispatchEvent(new Event('loadedmetadata')); await result;
  });
  it('无限时长视频、解码错误和超时均失败并释放节点', async () => {
    vi.useFakeTimers(); const node = document.createElement('video'); vi.spyOn(node, 'pause').mockImplementation(() => {}); vi.spyOn(node, 'load').mockImplementation(() => {});
    Object.defineProperties(node, { duration: { value: Infinity }, videoWidth: { value: 480 } }); vi.spyOn(document, 'createElement').mockReturnValue(node);
    const p = probeDanceMedia('video', file('video/mp4', [0, 0, 0, 20, 102, 116, 121, 112]), 'blob:bad', new AbortController().signal); const result = expect(p).rejects.toThrow('decode');
    await Promise.resolve(); await Promise.resolve(); node.dispatchEvent(new Event('loadedmetadata')); await result;
    const q = probeDanceMedia('video', file('video/mp4', [0, 0, 0, 20, 102, 116, 121, 112]), 'blob:timeout', new AbortController().signal); const timeout = expect(q).rejects.toThrow('decode');
    await Promise.resolve(); await Promise.resolve(); await vi.advanceTimersByTimeAsync(15000); await timeout; expect(node.getAttribute('src')).toBeNull();
  });
  it('照片可解码成功，取消探测后清除事件处理器和临时源', async () => {
    const img = new Image(); Object.defineProperties(img, { naturalWidth: { value: 100 }, naturalHeight: { value: 200 } }); vi.stubGlobal('Image', class { constructor() { return img; } });
    const p = probeDanceMedia('photo', file('image/png', [137, 80, 78, 71]), 'blob:photo', new AbortController().signal);
    await Promise.resolve(); await Promise.resolve(); img.dispatchEvent(new Event('load')); await expect(p).resolves.toBeUndefined();
    const controller = new AbortController(), q = probeDanceMedia('photo', file('image/png', [137, 80, 78, 71]), 'blob:cancel', controller.signal); const canceled = expect(q).rejects.toThrow('decode');
    await Promise.resolve(); await Promise.resolve(); controller.abort(); await canceled; expect(img.onload).toBeNull(); vi.unstubAllGlobals();
  });
});
