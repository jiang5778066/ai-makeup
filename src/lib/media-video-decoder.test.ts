// @vitest-environment node
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { beforeEach, expect, it, vi } from 'vitest';
import { unitVideoConfig, normalVideo } from './test-fixtures/media-video';
import { createVideoMediaDecoder, type VideoChildEvent } from './media-video-decoder';

const childState = vi.hoisted(() => ({ calls: [] as { binary: string; args: string[]; options: unknown }[], hold: false, badFrames: false, extraTracks: [] as unknown[] }));
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
      ? JSON.stringify({ format: { format_name: 'mov,mp4', duration: '1' }, streams: [{ index:0, codec_type: 'video', codec_name: 'h264', width: 480, height: 640, duration: '1', nb_frames: '25', avg_frame_rate: '25/1', r_frame_rate: '25/1', disposition: { attached_pic: 0 } },...childState.extraTracks] })
      : '#dimensions 0: 480x640\n#tb 0: 1/25\n' + Array.from({ length: childState.badFrames ? 23 : 25 }, (_, i) => `0, ${i}, ${i}, 1, 460800, 0x00000000`).join('\n');
    setImmediate(() => { if (!closed) { child.stdout.end(output); close(0); } });
  });
  child.stdin.resume(); return child;
} }));
beforeEach(() => { childState.calls = []; childState.hold = false; childState.badFrames = false; childState.extraTracks=[]; });
function insertMoovChild(source: Buffer, extra: Buffer) {
  const boxes: { at: number; size: number; type: string }[] = [];
  for (let at = 0; at < source.length;) {
    const size = source.readUInt32BE(at);
    boxes.push({ at, size, type: source.toString('ascii', at + 4, at + 8) });
    at += size;
  }
  const moov = boxes.find(box => box.type === 'moov')!;
  const result = Buffer.concat([source.subarray(0, moov.at + moov.size), extra, source.subarray(moov.at + moov.size)]);
  result.writeUInt32BE(moov.size + extra.length, moov.at);
  for (let at = 0; (at = result.indexOf(Buffer.from('stco'), at)) !== -1; at += 4) {
    const count = result.readUInt32BE(at + 8);
    for (let index = 0; index < count; index++) {
      const entry = at + 12 + index * 4;
      result.writeUInt32BE(result.readUInt32BE(entry) + extra.length, entry);
    }
  }
  return result;
}
function unknownUuid() {
  const box = Buffer.alloc(32);
  box.writeUInt32BE(32);
  box.write('uuid', 4);
  box.fill(0x55, 8, 24);
  return box;
}
it('无外部binary的单元覆盖：身份/容器错误在spawn前拒绝', async () => {
  expect(() => createVideoMediaDecoder({ ...unitVideoConfig, approvalRef: '' })).toThrow('media_decoder_unconfigured');
  expect(() => createVideoMediaDecoder({ ...unitVideoConfig, ffmpeg: { ...unitVideoConfig.ffmpeg, sha256: '0'.repeat(64) } })).toThrow();
  const decode = createVideoMediaDecoder(unitVideoConfig);
  await expect(decode(Buffer.from('invalid'), 'video/mp4')).rejects.toThrow();
  const external = Buffer.from(normalVideo()), dref = external.indexOf(Buffer.from('dref')); external.writeUInt32BE(0, dref + 20);
  await expect(decode(external, 'video/mp4')).rejects.toThrow(); expect(childState.calls).toHaveLength(0);
});
it('只允许轨内规范路径上的dref/stsd，并拒绝未批准的嵌套UUID', async () => {
  const original = normalVideo();
  const drefAt = original.indexOf(Buffer.from('dref')) - 4;
  const relocated = Buffer.from(original);
  const copiedDref = Buffer.from(original.subarray(drefAt, drefAt + original.readUInt32BE(drefAt)));
  relocated.write('free', drefAt + 4);
  const misplacedDref = insertMoovChild(relocated, copiedDref);
  const nestedUuid = insertMoovChild(original, unknownUuid());
  const topUuid = Buffer.concat([original, unknownUuid()]);
  const truncated = original.subarray(0, original.length - 1);
  const decode = createVideoMediaDecoder(unitVideoConfig);

  childState.calls = [];
  await expect(decode(misplacedDref, 'video/mp4')).rejects.toThrow('media_decode_rejected');
  await expect(decode(nestedUuid, 'video/mp4')).rejects.toThrow('media_decode_rejected');
  await expect(decode(topUuid, 'video/mp4')).rejects.toThrow('media_decode_rejected');
  await expect(decode(truncated, 'video/mp4')).rejects.toThrow('media_decode_rejected');
  expect(childState.calls).toHaveLength(0);
  expect((await decode(original, 'video/mp4')).frames).toBe(25);
});
it('受控child完整帧、协议/资源参数、close数量与帧数错误后恢复', async () => {
  const events: VideoChildEvent[] = [], decode = createVideoMediaDecoder(unitVideoConfig, { onLifecycle: event => events.push(event) });
  expect(await decode(normalVideo(), 'video/mp4')).toMatchObject({ width: 480, height: 640, frames: 25, durationMs: 1000 });
  const actual = childState.calls.find(call => call.args.includes('framecrc'))!;
  expect(actual.args).toEqual(expect.arrayContaining(['-protocol_whitelist', 'pipe', '-enable_drefs', '0', '-threads', '1']));
  expect(actual.options).toMatchObject({ shell: false, stdio: ['pipe', 'pipe', 'pipe'] });
  childState.badFrames = true; await expect(decode(normalVideo(), 'video/mp4')).rejects.toThrow('media_decode_rejected');
  childState.badFrames = false; expect((await decode(normalVideo(), 'video/mp4')).frames).toBe(25);
  expect(events.filter(e => e.event === 'close')).toHaveLength(events.filter(e => e.event === 'spawn').length);
});
it('abort与timeout等待close且busy回收后恢复', async () => {
  const events: VideoChildEvent[] = [], abort = new AbortController(), decode = createVideoMediaDecoder(unitVideoConfig, { onLifecycle: event => events.push(event) });
  childState.hold = true; const pending = decode(normalVideo(), 'video/mp4', abort.signal);
  await expect(decode(normalVideo(), 'video/mp4')).rejects.toThrow('media_decoder_busy');
  abort.abort(); await expect(pending).rejects.toThrow('media_decode_aborted');
  expect(events.filter(e => e.event === 'close')).toHaveLength(events.filter(e => e.event === 'spawn').length);
  await expect(createVideoMediaDecoder(unitVideoConfig, { timeoutMs: 5 })(normalVideo(), 'video/mp4')).rejects.toThrow('media_decode_timeout');
  childState.hold = false; expect((await decode(normalVideo(), 'video/mp4')).frames).toBe(25);
});

it('未知字幕/数据/第二视频/超限音轨不得被显式map掩盖',async()=>{
 const decode=createVideoMediaDecoder(unitVideoConfig);
 for(const track of [
 {index:1,codec_type:'subtitle',codec_name:'mov_text'},
 {index:1,codec_type:'video',codec_name:'h264',disposition:{attached_pic:0}},
 {index:1,codec_type:'audio',codec_name:'aac',channels:8,sample_rate:'48000',duration:'1',nb_frames:'48',disposition:{attached_pic:0}},
 {index:1,codec_type:'video',codec_name:'mjpeg',width:10000,height:480,disposition:{attached_pic:1}}]){
  childState.calls=[];childState.extraTracks=[track];await expect(decode(normalVideo(),'video/mp4')).rejects.toThrow('media_decode_rejected');
 }
});
