import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { createVideoMediaDecoder, type VideoDecoderConfig } from '../media-video-decoder';
import type { MediaDecoder } from '../media-security';

// 真实集成测试必须显式注入各平台已核准的身份；普通单测不发现PATH或读取历史报告。
export const integrationVideoConfig: VideoDecoderConfig | undefined = process.env.TEST_VIDEO_DECODER_CONFIG
  ? JSON.parse(process.env.TEST_VIDEO_DECODER_CONFIG) as VideoDecoderConfig
  : undefined;
const nodePath = realpathSync(new URL('./decoder-stub.cjs', import.meta.url));
const syntheticBinary = { path: nodePath, sha256: createHash('sha256').update(readFileSync(nodePath)).digest('hex') };
// 此配置只供runtime配置解析单测，绝不作为部署默认或真实FFmpeg身份。
export const unitVideoConfig: VideoDecoderConfig = {
  approvalRef: 'synthetic-unit-only', version: '1.0', ffmpeg: syntheticBinary, ffprobe: syntheticBinary
};
export const runtimeVideoConfig = integrationVideoConfig ?? unitVideoConfig;
export const normalVideo = () => readFileSync(new URL('./normal.mp4', import.meta.url));
export const runtimeVideoDecoder = (config: VideoDecoderConfig): MediaDecoder => integrationVideoConfig
  ? createVideoMediaDecoder(config)
  : async (_bytes, mime) => {
    if (mime !== 'video/mp4') throw new Error('media_decode_rejected');
    return { mime, width: 480, height: 640, frames: 125, durationMs: 5000, codec: 'h264', container: 'mp4', streams: 1 };
  };
