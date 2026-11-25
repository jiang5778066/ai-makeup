'use client';

import { useEffect, useRef } from 'react';
import { Film, FolderOpen, LockKeyhole, Trash2 } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { localVideoEditorCopy } from '@/lib/platform-local-video-editor-data';
import { LocalVideoPlayer } from './platform-local-video-player';
import { useLocalVideoSource } from './platform-local-video-source';
import styles from './platform-local-video-editor.module.css';

export function LocalVideoWorkspace({ locale, portraitPreview = false }: { locale: Locale; portraitPreview?: boolean }) {
  const copy = localVideoEditorCopy[locale];
  const { source, select, clear, failPreview } = useLocalVideoSource();
  const { video, pending, error } = source;
  const input = useRef<HTMLInputElement>(null);
  const choose = useRef<HTMLButtonElement>(null);
  const focusAfterRemove = useRef(false);

  useEffect(() => {
    if (focusAfterRemove.current && !video) {
      focusAfterRemove.current = false;
      choose.current?.focus();
    }
  }, [video]);

  function removeVideo() {
    focusAfterRemove.current = true;
    clear();
  }

  return (
    <section className={styles.workspace} aria-label={copy.preview}>
      <div className={styles.toolbar}>
        <button ref={choose} type="button" className={styles.primary} onClick={() => input.current?.click()}>
          <FolderOpen size={18} aria-hidden="true" />{video ? copy.replace : copy.choose}
        </button>
        <input
          ref={input} type="file" accept="video/*,.mp4,.m4v,.mov,.webm,.ogv,.mkv" tabIndex={-1}
          className={styles.fileInput} aria-label={copy.file}
          onChange={event => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) void select(file);
          }}
        />
        {video && (
          <button type="button" className={styles.secondary} onClick={removeVideo}>
            <Trash2 size={16} aria-hidden="true" />{copy.remove}
          </button>
        )}
      </div>
      <div className={styles.playerSlot}>
        {video ? (
          <LocalVideoPlayer key={video.url} locale={locale} source={video} portraitPreview={portraitPreview} onError={() => failPreview(video.url)} />
        ) : (
          <div className={styles.empty}>
            <Film size={32} strokeWidth={1.5} aria-hidden="true" />
            <p>{copy.formats}</p>
          </div>
        )}
      </div>
      <div className={styles.notes}>
        <p className={styles.privacy}><LockKeyhole size={15} aria-hidden="true" />{copy.privacy}</p>
        {pending && <p role="status">{copy.checking}</p>}
        {error && <p className={styles.error} role="alert">{copy.errors[error]}</p>}
      </div>
    </section>
  );
}
