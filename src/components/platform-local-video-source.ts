'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type VideoMetadata = { duration: number; width: number; height: number };
type VideoSource = { url: string; name: string; sample?: true };
export type LocalVideo = VideoMetadata & VideoSource;
type SourceState = { video: LocalVideo | null; pending: boolean; error: 'empty' | 'decode' | 'sample' | null };
type Probe = { source: VideoSource; controller: AbortController };

const initialSource: SourceState = { video: null, pending: false, error: null };

function decodeVideo(url: string, signal: AbortSignal): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    function finish(metadata?: VideoMetadata) {
      clearTimeout(timeout);
      signal.removeEventListener('abort', fail);
      video.removeEventListener('error', fail);
      video.removeEventListener('loadeddata', ready);
      video.removeEventListener('canplay', ready);
      video.removeAttribute('src');
      video.load();
      if (metadata) resolve(metadata);
      else reject(new Error('Video decode failed'));
    }
    const fail = () => finish();
    const ready = () => {
      const { duration, videoWidth: width, videoHeight: height } = video;
      if (Number.isFinite(duration) && duration > 0 && width > 0 && height > 0) finish({ duration, width, height });
      else fail();
    };
    const timeout = window.setTimeout(fail, 15000);
    // 首帧解码成功才接收候选文件，保留原预览直至替换成功。
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    signal.addEventListener('abort', fail, { once: true });
    video.addEventListener('error', fail);
    video.addEventListener('loadeddata', ready);
    video.addEventListener('canplay', ready);
    video.src = url;
    video.load();
  });
}

function releaseUrl(source: VideoSource | null) {
  if (source && !source.sample) URL.revokeObjectURL(source.url);
}

function cancelProbe(probe: Probe | null) {
  if (!probe) return;
  probe.controller.abort();
  releaseUrl(probe.source);
}

export function useLocalVideoSource() {
  const [source, setSource] = useState(initialSource);
  const active = useRef<LocalVideo | null>(null);
  const pending = useRef<Probe | null>(null);

  const release = useCallback(() => {
    cancelProbe(pending.current);
    pending.current = null;
    releaseUrl(active.current);
    active.current = null;
  }, []);

  const clear = useCallback(() => {
    release();
    setSource(initialSource);
  }, [release]);

  useEffect(() => {
    window.addEventListener('pagehide', clear);
    return () => {
      window.removeEventListener('pagehide', clear);
      release();
    };
  }, [clear, release]);

  async function select(input: File | (VideoSource & { sample: true })) {
    cancelProbe(pending.current);
    pending.current = null;
    const isFile = input instanceof File;
    if (isFile && !input.size) {
      setSource({ video: active.current, pending: false, error: 'empty' });
      return;
    }

    let candidate: Probe | null = null;
    try {
      const next = isFile ? { url: URL.createObjectURL(input), name: input.name } : input;
      candidate = { controller: new AbortController(), source: next };
      pending.current = candidate;
      setSource({ video: active.current, pending: true, error: null });
      const metadata = await decodeVideo(next.url, candidate.controller.signal);
      if (pending.current !== candidate) return;

      pending.current = null;
      releaseUrl(active.current);
      active.current = { ...metadata, ...next };
      setSource({ video: active.current, pending: false, error: null });
    } catch {
      if (pending.current !== candidate) return;
      if (candidate) releaseUrl(candidate.source);
      pending.current = null;
      setSource({ video: active.current, pending: false, error: isFile ? 'decode' : 'sample' });
    }
  }

  function failPreview(url: string) {
    if (active.current?.url !== url) return;
    const error = active.current.sample ? 'sample' : 'decode';
    releaseUrl(active.current);
    active.current = null;
    setSource({ video: null, pending: Boolean(pending.current), error });
  }

  return { source, select, clear, failPreview };
}
