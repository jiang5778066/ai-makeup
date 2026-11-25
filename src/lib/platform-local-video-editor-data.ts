import type { Metadata } from 'next';
import { alternateLanguagesForPath, localizePath, type Locale } from './i18n';

export const localVideoEditorPath = '/ai-video-editor';

export const localVideoEditorCopy = {
  en: {
    title: 'AI Video Editor',
    description: 'Open a video from your device, set start and end times, and play back the selected section.',
    privacy: 'Your video stays on this device. The preview runs in your browser.',
    scope: 'This workspace previews a selection. Editing and export are unavailable here.',
    choose: 'Choose video', replace: 'Replace video', remove: 'Remove video', file: 'Local video file',
    preview: 'Video preview', formats: 'Choose a video your browser can play, such as MP4 or WebM.',
    checking: 'Opening video…', loading: 'Loading preview…',
    errors: {
      empty: 'This file is empty. Choose another video.',
      decode: 'Your browser could not open this video. Try another file or format.',
      playback: 'The selection could not play. Try again or choose another video.'
    },
    duration: 'Duration', dimensions: 'Dimensions', selection: 'Playback range',
    start: 'Start (seconds)', end: 'End (seconds)', play: 'Play selection', stop: 'Stop selection',
    invalid: 'Enter a start of zero or later and an end after the start, within the video duration.',
    tools: 'More FrameKoi tools', videoTool: 'AI Video Generator', imageTool: 'AI Image Generator'
  },
  'zh-CN': {
    title: 'AI 视频编辑器',
    description: '打开设备上的视频，设置起止时间，再回放选中的片段。',
    privacy: '视频保留在本机，预览由浏览器处理。',
    scope: '当前工作区支持选区预览，暂未开放编辑与导出。',
    choose: '选择视频', replace: '替换视频', remove: '移除视频', file: '本地视频文件',
    preview: '视频预览', formats: '请选择浏览器可播放的视频，例如 MP4 或 WebM。',
    checking: '正在打开视频…', loading: '正在加载预览…',
    errors: {
      empty: '此文件为空，请选择其他视频。',
      decode: '浏览器无法打开此视频，请更换文件或格式。',
      playback: '无法播放此选区，请重试或更换视频。'
    },
    duration: '时长', dimensions: '尺寸', selection: '播放区间',
    start: '起点（秒）', end: '终点（秒）', play: '播放选区', stop: '停止选区',
    invalid: '起点须大于或等于零，终点须晚于起点且不超过视频时长。',
    tools: '更多 FrameKoi 工具', videoTool: 'AI 视频生成器', imageTool: 'AI 图片生成器'
  }
} satisfies Record<Locale, object>;

export function localVideoEditorMetadata(locale: Locale): Metadata {
  const { title, description } = localVideoEditorCopy[locale];
  return {
    title,
    description,
    alternates: {
      canonical: localizePath(localVideoEditorPath, locale),
      languages: { ...alternateLanguagesForPath(localVideoEditorPath), 'x-default': localVideoEditorPath }
    }
  };
}
