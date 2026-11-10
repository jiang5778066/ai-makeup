// @vitest-environment node
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { beforeEach, expect, it, vi } from 'vitest';
import { unitVideoConfig, normalVideo } from './test-fixtures/media-video';
import { createVideoMediaDecoder, type VideoChildEvent } from './media-video-decoder';

const childState = vi.hoisted(() => ({ calls: [] as { binary: string; args: string[]; options: unknown }[], hold: false, badFrames: false }));
vi.mock('node:child_process', () => ({ spawn: (binary: string, args: string[], options: unknown) => {
  childState.calls.push({ binary, args, options });
  const child = new EventEmitter() as EventEmitter & { stdin: PassThrough; stdout: PassThrough; stderr: PassThrough; kill: ReturnType<typeof vi.fn> };
  child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
  let closed = false;
  const close = (code: number | null, signal: string | null = null) => { if (!closed) { closed = true; child.emit('close', code, signal); } };
  child.kill = vi.fn(() => { setImmediate(() => close(null, 'SIGKILL')); return true; });
  child.stdin.on('finish', () => {
    if (childState.hold) return;
    const output = args.includes('-version') ? `${childState.calls.length % 2 ? 'ffmpeg' : 'ffprobe'} version ${unitVideoConfig.version} fixture` : args.includes('-show_entries')
      ? JSON.stringify({ format: { format_name: 'mov,mp4', duration: '5' }, streams: [{ codec_type: 'video', codec_name: 'h264', width: 480, height: 640, duration: '5', nb_frames: '125', avg_frame_rate: '25/1', r_frame_rate: '25/1', disposition: { attached_pic: 0 } }] })
      : '#dimensions 0: 480x640\n#tb 0: 1/25\n' + Array.from({ length: childState.badFrames ? 123 : 125 }, (_, i) => `0, ${i}, ${i}, 1, 460800, 0x00000000`).join('\n');
    setImmediate(() => { if (!closed) { child.stdout.end(output); close(0); } });
  });
  child.stdin.resume(); return child;
} }));
beforeEach(() => { childState.calls = []; childState.hold = false; childState.badFrames = false; });
it('无外部binary的单元覆盖：身份/容器错误在spawn前拒绝', async () => {
  expect(() => createVideoMediaDecoder({ ...unitVideoConfig, approvalRef: '' })).toThrow('media_decoder_unconfigured');
  expect(() => createVideoMediaDecoder({ ...unitVideoConfig, ffmpeg: { ...unitVideoConfig.ffmpeg, sha256: '0'.repeat(64) } })).toThrow();
  const decode = createVideoMediaDecoder(unitVideoConfig);
  await expect(decode(Buffer.from('invalid'), 'video/mp4')).rejects.toThrow();
  const external = Buffer.from(normalVideo()), dref = external.indexOf(Buffer.from('dref')); external.writeUInt32BE(0, dref + 20);
  await expect(decode(external, 'video/mp4')).rejects.toThrow(); expect(childState.calls).toHaveLength(0);
});
it('受控child完整帧、协议/资源参数、close数量与帧数错误后恢复', async () => {
  const events: VideoChildEvent[] = [], decode = createVideoMediaDecoder(unitVideoConfig, { onLifecycle: event => events.push(event) });
  expect(await decode(normalVideo(), 'video/mp4')).toMatchObject({ width: 480, height: 640, frames: 125, durationMs: 5000 });
  const actual = childState.calls.find(call => call.args.includes('framecrc'))!;
  expect(actual.args).toEqual(expect.arrayContaining(['-protocol_whitelist', 'pipe', '-enable_drefs', '0', '-threads', '1']));
  expect(actual.options).toMatchObject({ shell: false, stdio: ['pipe', 'pipe', 'pipe'] });
  childState.badFrames = true; await expect(decode(normalVideo(), 'video/mp4')).rejects.toThrow('media_decode_rejected');
  childState.badFrames = false; expect((await decode(normalVideo(), 'video/mp4')).frames).toBe(125);
  expect(events.filter(e => e.event === 'close')).toHaveLength(events.filter(e => e.event === 'spawn').length);
});
it('abort与timeout等待close且busy回收后恢复', async () => {
  const events: VideoChildEvent[] = [], abort = new AbortController(), decode = createVideoMediaDecoder(unitVideoConfig, { onLifecycle: event => events.push(event) });
  childState.hold = true; const pending = decode(normalVideo(), 'video/mp4', abort.signal);
  await expect(decode(normalVideo(), 'video/mp4')).rejects.toThrow('media_decoder_busy');
  abort.abort(); await expect(pending).rejects.toThrow('media_decode_aborted');
  expect(events.filter(e => e.event === 'close')).toHaveLength(events.filter(e => e.event === 'spawn').length);
  await expect(createVideoMediaDecoder(unitVideoConfig, { timeoutMs: 5 })(normalVideo(), 'video/mp4')).rejects.toThrow('media_decode_timeout');
  childState.hold = false; expect((await decode(normalVideo(), 'video/mp4')).frames).toBe(125);
});
