'use client';

import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Locale } from '@/lib/i18n';
import type { GhibliMediaPair } from '@/lib/platform-ghibli-media';
import styles from './platform-ghibli-page.module.css';

export function PlatformGhibliComparison({ pair, locale, name }: { pair: GhibliMediaPair; locale: Locale; name: string }) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const zh = locale === 'zh-CN';
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width > 0) setPosition(Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)));
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 5 : ['ArrowLeft', 'ArrowDown'].includes(event.key) ? -5 : 0;
    if (delta || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setPosition(value => event.key === 'Home' ? 0 : event.key === 'End' ? 100 : Math.max(0, Math.min(100, value + delta)));
    }
  };
  return <div className={styles.comparisonImage} role="slider" tabIndex={0} aria-label={`${name} · ${zh ? '原图与吉卜力风格对照' : 'Original and Ghibli style comparison'}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(position)} aria-valuetext={`${Math.round(position)}%`} onKeyDown={key}
    onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); move(event); }}
    onPointerMove={event => { if (dragging) move(event); }} onPointerUp={event => { setDragging(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => setDragging(false)} onLostPointerCapture={() => setDragging(false)}>
    {/* 图层顺序保留公开原件：底层为第一张，裁切层为第二张。 */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={pair.original.src} alt={pair.original.alt} width={1200} height={900} draggable={false} />
    <div className={styles.overlay} style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={pair.styled.src} alt={pair.styled.alt} width={1200} height={900} draggable={false} />
    </div>
    <span className={styles.divider} style={{ left: `${position}%` }}><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5 3 10l5 5m8-10 5 5-5 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span></span>
    <span className={styles.originalLabel}>{zh ? '原图' : 'Original'}</span><span className={styles.styledLabel}>{zh ? '吉卜力风格' : 'Ghibli Style'}</span>
  </div>;
}
