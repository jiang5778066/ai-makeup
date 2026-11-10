'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Maximize2, Plus, RefreshCw, Sparkles, X } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { danceDurations, danceMedia, danceSamples, danceTemplateNamesZh } from '@/lib/platform-dance-data';
import type { DanceMediaSlot, DanceMediaSnapshot } from '@/lib/platform-dance-media-state';
import { DanceVideo } from './platform-dance-video';
import styles from './platform-dance-page.module.css';
type Props = { locale: Locale; photo: DanceMediaSnapshot; video: DanceMediaSnapshot; photoSlot: DanceMediaSlot; videoSlot: DanceMediaSlot; selectTemplate: (id: number, focus?: boolean) => void; preview: (id: number, trigger: HTMLButtonElement) => void };
export function DanceForm({ locale, photo, video, photoSlot, videoSlot, selectTemplate, preview }: Props) {
  const zh = locale === 'zh-CN', photoInput = useRef<HTMLInputElement>(null), videoInput = useRef<HTMLInputElement>(null), row = useRef<HTMLUListElement>(null);
  const [samplePage, setSamplePage] = useState(0);
  const selectedTemplate = video.value?.source === 'template' ? video.value.id : null;
  useEffect(() => {
    const list = row.current, item = list?.querySelector<HTMLElement>('[data-selected=true]');
    if (list && item && typeof list.scrollTo === 'function') list.scrollTo({ left: item.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft, behavior: 'instant' });
  }, [selectedTemplate]);
  const error = (state: DanceMediaSnapshot, kind: 'photo' | 'video') => !state.error ? null : state.error === 'size' ? (zh ? '照片不能超过 5 MB，已保留原选择。' : 'Photo must be up to 5 MB. Previous selection kept.') : state.error === 'type' ? (zh ? `请选择${kind === 'photo' ? ' JPG / PNG 照片' : ' MP4 / MOV / WebM 视频'}，已保留原选择。` : `Choose ${kind === 'photo' ? 'a JPG or PNG photo' : 'an MP4, MOV or WebM video'}. Previous selection kept.`) : (zh ? '无法读取此文件，已保留原选择。' : 'This file could not be read. Previous selection kept.');
  const templateName = (id: number) => zh ? danceTemplateNamesZh[id - 1] : danceMedia[id].label;
  return <form className={styles.form} onSubmit={e => e.preventDefault()} data-generation-availability="unavailable" data-photo-source={photo.value?.source ?? 'none'} data-video-source={video.value?.source ?? 'none'} data-template-id={video.value?.source === 'template' ? video.value.id : undefined}>
    <h2 id="dance-generator-title" tabIndex={-1}><Sparkles aria-hidden="true" />{zh ? 'AI 舞蹈生成器' : 'AI Dance Generator'}</h2>
    <fieldset><legend className={styles.srOnly}>{zh ? '照片与舞蹈参考' : 'Photo and dance reference'}</legend>
      <label htmlFor="dance-photo" className={styles.label}>{zh ? '参考图片' : 'Reference Image'}</label>
      <div className={styles.photoBox}>
        <button className={styles.photoUpload} type="button" onClick={() => photoInput.current?.click()} aria-describedby="dance-photo-hint dance-photo-error" aria-label={photo.value ? (zh ? '替换照片' : 'Replace photo') : undefined}>
          {photo.value ? <img src={photo.value.url} alt={photo.value.name} className={styles.photoSelected} /> : <><ImagePlus aria-hidden="true" /><span>{zh ? '上传照片' : 'Upload photo'}</span><span id="dance-photo-hint">{zh ? 'JPG 或 PNG · 最大 5 MB' : 'JPG or PNG · Up to 5 MB'}</span></>}
        </button>
        {photo.value && <button type="button" className={styles.removePhoto} onClick={() => { photoSlot.clear(); photoInput.current?.closest('fieldset')?.querySelector<HTMLButtonElement>('button')?.focus(); }} aria-label={zh ? '移除照片' : 'Remove photo'}><X size={16} /></button>}
        <input ref={photoInput} id="dance-photo" className={styles.srOnly} tabIndex={-1} aria-invalid={!!photo.error} type="file" accept="image/jpeg,image/png" aria-label={zh ? '选择本地照片' : 'Choose local photo'} aria-describedby="dance-photo-error" onChange={e => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; void photoSlot.select(file); }} />
        <div className={styles.samples}><span>{zh ? '示例' : 'Examples'}</span><ul aria-label={zh ? '示例照片' : 'Examples'}>{danceSamples.slice(samplePage * 4, samplePage * 4 + 4).map(sample => <li key={sample.url}><button type="button" aria-label={zh ? `使用示例照片：${sample.name}` : `Use sample photo: ${sample.name}`} aria-pressed={photo.value?.url === sample.url} onClick={() => photoSlot.choose({ source: 'sample', ...sample })}><img src={sample.url} alt="" /></button></li>)}</ul><button type="button" aria-label={zh ? '显示更多示例' : 'Show more examples'} onClick={() => setSamplePage((samplePage + 1) % Math.ceil(danceSamples.length / 4))}><RefreshCw size={16} /></button></div>
      </div>
      <p id="dance-photo-error" role={photo.error ? 'alert' : undefined} className={styles.error}>{error(photo, 'photo')}</p>
      {photo.pending && <p className={styles.status} role="status">{zh ? '正在读取照片…' : 'Reading photo…'}</p>}
      <div className={styles.rowLabel}><span className={styles.label} id="dance-video-label">{zh ? '舞蹈视频' : 'Dance video'}</span><div><button type="button" aria-label={zh ? '滚动到上一组舞蹈模板' : 'Scroll to previous dance templates'} onClick={() => row.current?.scrollBy({ left: -172, behavior: 'auto' })}><ChevronLeft size={16} /></button><button type="button" aria-label={zh ? '滚动到下一组舞蹈模板' : 'Scroll to next dance templates'} onClick={() => row.current?.scrollBy({ left: 172, behavior: 'auto' })}><ChevronRight size={16} /></button></div></div>
      <ul className={styles.templateRow} ref={row} tabIndex={0} aria-labelledby="dance-video-label" onKeyDown={e => { if (e.target === e.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); e.currentTarget.scrollBy({ left: e.key === 'ArrowRight' ? 172 : -172 }); } }}>
        <li><button type="button" className={styles.videoUpload} onClick={() => videoInput.current?.click()}><span><Plus /></span>{zh ? '上传视频' : 'Upload video'}</button></li>
        {danceMedia.slice(1, 7).map(media => <li key={media.id}><div className={styles.templateTile} data-selected={video.value?.source === 'template' && video.value.id === media.id}>
          <button type="button" className={styles.templateSelect} aria-label={zh ? `使用舞蹈模板：${templateName(media.id)}` : `Use dance template: ${media.label}`} aria-pressed={video.value?.source === 'template' && video.value.id === media.id} onClick={() => selectTemplate(media.id)}><img src={media.poster} alt="" />{video.value?.source === 'template' && video.value.id === media.id && <DanceVideo media={media} controls={false} autoPlay ratio={4 / 5} />}<span className={styles.duration}>{danceDurations[media.id - 1]}</span></button>
          <button type="button" className={styles.expand} aria-label={zh ? `预览${templateName(media.id)}` : `Preview ${media.label}`} aria-haspopup="dialog" onClick={e => preview(media.id, e.currentTarget)}><Maximize2 size={16} /></button>
        </div></li>)}
      </ul>
      <input ref={videoInput} id="dance-video" className={styles.srOnly} tabIndex={-1} aria-invalid={!!video.error} type="file" accept="video/mp4,video/quicktime,video/webm" aria-label={zh ? '选择本地舞蹈视频' : 'Choose local dance video'} onChange={e => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; void videoSlot.select(file); }} />
      {video.value && <div className={styles.selection}><span>{video.value.source === 'template' ? templateName(video.value.id!) : video.value.name}</span><button type="button" onClick={() => { videoSlot.clear(); row.current?.querySelector<HTMLButtonElement>('button')?.focus(); }} aria-label={zh ? '移除舞蹈选择' : 'Remove dance selection'}><X size={16} /></button></div>}
      {video.value?.source === 'file' && <video className={styles.localVideo} src={video.value.url} controls muted playsInline preload="metadata" aria-label={zh ? '本地舞蹈视频预览' : 'Local dance video preview'} />}
      {video.pending && <p role="status" className={styles.status}>{zh ? '正在读取舞蹈视频…' : 'Reading the motion video…'}</p>}
      <p id="dance-video-error" role={video.error ? 'alert' : undefined} className={styles.error}>{error(video, 'video')}</p>
    </fieldset>
    <button type="submit" disabled className={styles.generate}>{zh ? '生成舞蹈' : 'Generate dance'}<span>·</span><Sparkles size={16} />{zh ? '来源：5 积分 / 秒' : 'Source: 5 credits / 1s'}</button>
    <p className={styles.pricing}>{zh ? '来源计费说明：视频时长取最近半秒，每整秒 5 积分，剩余半秒 3 积分；最终按实测时长计费。' : 'Source pricing: video duration is rounded to the nearest half-second. Each full second costs 5 credits, plus 3 credits for a remaining half-second. Final cost uses the measured video duration.'}</p>
    <p className={styles.unavailable}>{zh ? '本站生成尚未开放。文件仅在本机预览，不会上传或扣费。' : 'Generation is unavailable here. Files stay on your device for preview; no upload or charge.'}</p>
  </form>;
}
