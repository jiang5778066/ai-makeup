'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Upload, X, RefreshCw } from 'lucide-react';
import { GeneratorUploadStore, decodeLocalPreview, type PreviewConfig } from '@/lib/platform-generator-upload';
import type { Locale } from '@/lib/i18n';
import styles from './platform-icedit-page.module.css';

export function PlatformIceditUpload({ config, locale, onFiles }: { config: PreviewConfig; locale: Locale; onFiles: () => void }) {
  const zh = locale === 'zh-CN';
  const input = useRef<HTMLInputElement>(null);
  const replace = useRef<number | null>(null);
  const [store] = useState(() => new GeneratorUploadStore(config, { create: file => URL.createObjectURL(file), revoke: url => URL.revokeObjectURL(url), decode: decodeLocalPreview }));
  const slots = useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);
  useEffect(() => { store.activate(); return () => store.dispose(); }, [store]);
  useEffect(() => {
    const element = input.current;
    const cancel = () => { replace.current = null; };
    element?.addEventListener('cancel', cancel);
    return () => element?.removeEventListener('cancel', cancel);
  }, []);
  const accept = (files: File[]) => {
    const target = replace.current;
    replace.current = null;
    if (target !== null && files[0] && store.snapshot().some(slot => slot.id === target)) store.replace(target, files[0]); else store.add(files);
    if (files.length) onFiles();
    if (input.current) input.current.value = '';
  };
  const errors: Record<string, string> = zh ? { type: '请选择图片文件。', size: '图片超过本站本地预览的10MiB限制。', count: '每次仅能选择一张图片。', decode: '图片无法解码，请选择有效图片。' } : { type: 'Choose an image file.', size: 'Image exceeds the local 10MiB preview limit.', count: 'Choose one image at a time.', decode: 'Unable to decode this image. Choose a valid image.' };
  return <div className={styles.uploadField}>
    <label htmlFor="icedit-image"><Upload size={23} aria-hidden="true" />{zh ? '上传你的图片' : 'Upload Your Image'}</label>
    <div className={styles.drop} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); replace.current = null; accept([...e.dataTransfer.files]); }}>
      {slots.length ? slots.map(slot => <div key={slot.id} className={styles.preview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {slot.status === 'ready' ? <img src={slot.url} alt={slot.file.name} /> : <p role="status">{zh ? '正在读取图片…' : 'Reading image…'}</p>}
        <p>{slot.file.name}</p><button type="button" aria-label={zh ? '替换图片' : 'Replace image'} onClick={() => { replace.current = slot.id; input.current?.click(); }}><RefreshCw size={17} /></button>
        <button type="button" aria-label={zh ? '移除图片' : 'Remove image'} onClick={() => { if (replace.current === slot.id) replace.current = null; store.remove(slot.id); }}><X size={17} /></button>
      </div>) : <><span className={styles.uploadIcon}><Upload size={38} aria-hidden="true" /></span><strong>{zh ? '拖放图片到这里，或点击选择' : 'Drop your image here or click to browse'}</strong><button type="button" onClick={() => { replace.current = null; input.current?.click(); }}>{zh ? '📁 选择图片' : '📁 Select Image'}</button></>}
      <input hidden ref={input} id="icedit-image" name="image" type="file" accept="image/*" onChange={e => accept([...e.currentTarget.files ?? []])} />
    </div>
    <small>{zh ? '仅在本机预览 · 单图最多10MiB（本站限制）' : 'Local preview only · One image, up to 10MiB (site limit)'}</small>
    {store.error && <p role="alert">{errors[store.error]}</p>}
  </div>;
}
