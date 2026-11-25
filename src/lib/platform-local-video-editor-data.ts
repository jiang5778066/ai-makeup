import type { Metadata } from 'next';
import { alternateLanguagesForPath, localizePath, type Locale } from './i18n';

export const localVideoEditorPath = '/ai-video-editor';
export const localVideoSamplePath = '/videos/local-preview/framing-sample.mp4';

export const localVideoEditorCopy = {
  en: {
    title: 'Video Clip Preview Online',
    description: 'Set start and end times and play the selected part of a video in your browser. Your file stays on your device.',
    sample: 'Try sample video',
    sampleName: 'Cyclist on a riverside path',
    guideTitle: 'How to preview part of a video',
    steps: [
      'Choose a local video or try the six-second sample.',
      'Enter the start and end time in seconds. For the sample, try 2 to 5 seconds.',
      'Select Play selection. Playback stops at the end time you set.'
    ],
    privacy: 'Your video stays on this device. The preview runs in your browser.',
    scope: 'Browser preview only. Video editing and export are unavailable.',
    choose: 'Choose video', replace: 'Replace video', remove: 'Remove video', file: 'Local video file',
    preview: 'Video preview', formats: 'Choose a video your browser can play, such as MP4 or WebM.',
    checking: 'Opening video…', loading: 'Loading preview…',
    errors: {
      sample: 'The sample could not be opened. Try again or choose a local video.',
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
    title: '在线视频选段预览',
    description: '设置视频的起止时间，在浏览器中回放指定片段。视频文件保留在本机。',
    sample: '试用样片',
    sampleName: '河边小径上的骑行者',
    guideTitle: '如何预览视频中的一段',
    steps: [
      '选择本机视频，或试用这段 6 秒样片。',
      '以秒为单位输入起点和终点。使用样片时，可以试试第 2 秒到第 5 秒。',
      '点击「播放选区」。播放到设定的终点时会自动停止。'
    ],
    privacy: '视频保留在本机，预览由浏览器处理。',
    scope: '仅支持浏览器内预览，暂不支持编辑和导出。',
    choose: '选择视频', replace: '替换视频', remove: '移除视频', file: '本地视频文件',
    preview: '视频预览', formats: '请选择浏览器可播放的视频，例如 MP4 或 WebM。',
    checking: '正在打开视频…', loading: '正在加载预览…',
    errors: {
      sample: '无法打开样片。请重试，或选择本机视频。',
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
