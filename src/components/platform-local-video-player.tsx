'use client';

import { track } from '@vercel/analytics';
import { useEffect, useId, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { videoReframeCopy } from '@/lib/platform-video-reframe-data';
import type { Locale } from '@/lib/i18n';
import { localVideoEditorCopy } from '@/lib/platform-local-video-editor-data';
import type { LocalVideo } from './platform-local-video-source';
import styles from './platform-local-video-editor.module.css';

type PlaybackRange = { start: number; end: number };

const portraitFrames = {
  "9:16": { width: 9, height: 16 },
  "4:5": { width: 4, height: 5 }
} as const;
type PortraitFrame = keyof typeof portraitFrames;

export function LocalVideoPlayer({ locale, source, onError, portraitPreview = false }: {
  locale: Locale;
  source: LocalVideo;
  onError: () => void;
  portraitPreview?: boolean;
}) {
  const copy = localVideoEditorCopy[locale];
  const errorId = useId();
  const reframe = videoReframeCopy[locale];
  const [portraitFrame, setPortraitFrame] = useState<PortraitFrame>("9:16");
  const [horizontal, setHorizontal] = useState(50);
  const [vertical, setVertical] = useState(50);
  const { width: frameWidth, height: frameHeight } = portraitFrames[portraitFrame];
  const frameRatio = frameWidth / frameHeight;
  const aspectDifference = source.width * frameHeight - source.height * frameWidth;
  const cropHorizontally = aspectDifference > 0;
  const player = useRef<HTMLVideoElement>(null);
  const playingRange = useRef<PlaybackRange | null>(null);
  const frame = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [startText, setStartText] = useState('0');
  const [endText, setEndText] = useState(() => String(source.duration));
  const start = Number(startText);
  const end = Number(endText);
  const startInvalid = startText === '' || !Number.isFinite(start) || start < 0 || start >= source.duration;
  const endInvalid = endText === '' || !Number.isFinite(end) || end <= start || end > source.duration;
  const valid = !startInvalid && !endInvalid;
  const duration = new Intl.NumberFormat(locale, { style: 'unit', unit: 'second', maximumFractionDigits: 3 }).format(source.duration);

  useEffect(() => {
    const video = player.current;
    if (!video) return;
    video.src = source.url;
    return () => {
      playingRange.current = null;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [source.url]);

  function stopSelection(video: HTMLVideoElement, position?: number) {
    if (!playingRange.current) return;
    playingRange.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    video.pause();
    if (position !== undefined) video.currentTime = position;
    setPlaying(false);
  }

  function checkEnd(video: HTMLVideoElement) {
    const range = playingRange.current;
    if (range && video.currentTime >= range.end) stopSelection(video, range.end);
  }

  async function playSelection() {
    const video = player.current;
    if (!video || !ready || !valid) return;
    if (playingRange.current) {
      stopSelection(video);
      return;
    }
    const range = { start, end };
    playingRange.current = range;
    setPlaybackError(false);
    setPlaying(true);
    const monitor = () => {
      checkEnd(video);
      if (playingRange.current === range) frame.current = requestAnimationFrame(monitor);
    };
    try {
      video.currentTime = range.start;
      frame.current = requestAnimationFrame(monitor);
      await video.play();
    } catch {
      if (playingRange.current !== range) return;
      stopSelection(video);
      setPlaybackError(true);
      return;
    }
    if (playingRange.current === range) {
      track(portraitPreview ? 'portrait_preview_played' : 'video_selection_played', {
        locale,
        source: source.sample ? 'sample' : 'local'
      });
    }
  }

  function changeBoundary(update: (value: string) => void, value: string) {
    if (player.current) stopSelection(player.current);
    setPlaybackError(false);
    update(value);
  }

  return (
    <div className={styles.session}>
      <div className={styles.stage} data-portrait-preview={portraitPreview || undefined}>
        <video
          ref={player} controls playsInline preload="auto" aria-label={copy.preview}
          style={portraitPreview ? {
            aspectRatio: `${frameWidth} / ${frameHeight}`,
            width: `min(100%, clamp(${210 * frameRatio}px, ${50 * frameRatio}svh, ${520 * frameRatio}px))`,
            objectPosition: `${horizontal}% ${vertical}%`
          } : undefined}
          onLoadedData={() => setReady(true)} onCanPlay={() => setReady(true)} onError={onError}
          onTimeUpdate={event => checkEnd(event.currentTarget)}
          onSeeking={event => {
            const video = event.currentTarget;
            const range = playingRange.current;
            if (range && video.currentTime < range.start - 0.001) stopSelection(video, range.start);
            else checkEnd(video);
          }}
          onPause={event => {
            const video = event.currentTarget;
            if (video.paused) {
              checkEnd(video);
              stopSelection(video);
            }
          }}
          onEnded={event => stopSelection(event.currentTarget)}
        />
      </div>
      <div className={styles.details}>
        <p className={styles.filename}>{source.name}</p>
        <dl className={styles.metadata}>
          <div><dt>{copy.duration}</dt><dd>{duration}</dd></div>
          <div><dt>{copy.dimensions}</dt><dd>{source.width} × {source.height} px</dd></div>
        </dl>
        {portraitPreview && (
          <div className={styles.framing}>
            <label>{reframe.frame}
              <select value={portraitFrame} onChange={event => {
                const value = event.currentTarget.value;
                if (value === "9:16" || value === "4:5") setPortraitFrame(value);
              }}>
                <option value="9:16">9:16</option>
                <option value="4:5">4:5</option>
              </select>
            </label>
            {aspectDifference !== 0 && <label>
              {cropHorizontally ? reframe.horizontal : reframe.vertical}
              <input type="range" min={0} max={100} step={1}
                value={cropHorizontally ? horizontal : vertical}
                onChange={event => {
                  const value = event.currentTarget.valueAsNumber;
                  if (cropHorizontally) setHorizontal(value);
                  else setVertical(value);
                }}
              />
            </label>}
          </div>
        )}
        <fieldset className={styles.range}>
          <legend>{copy.selection}</legend>
          <div className={styles.fields}>
            <label>
              {copy.start}
              <input
                type="number" min="0" max={source.duration} step="any" value={startText}
                aria-invalid={startInvalid || undefined} aria-describedby={!valid ? errorId : undefined}
                onChange={event => changeBoundary(setStartText, event.currentTarget.value)}
              />
            </label>
            <label>
              {copy.end}
              <input
                type="number" min="0" max={source.duration} step="any" value={endText}
                aria-invalid={endInvalid || undefined} aria-describedby={!valid ? errorId : undefined}
                onChange={event => changeBoundary(setEndText, event.currentTarget.value)}
              />
            </label>
          </div>
          {!valid && <p className={styles.error} id={errorId} role="alert">{copy.invalid}</p>}
          {!ready && <p role="status">{copy.loading}</p>}
          <button type="button" className={styles.primary} onClick={playSelection} disabled={!ready || !valid}>
            {playing ? <Square size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {playing ? copy.stop : copy.play}
          </button>
          {playbackError && <p className={styles.error} role="alert">{copy.errors.playback}</p>}
        </fieldset>
      </div>
    </div>
  );
}
