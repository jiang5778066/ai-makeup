'use client';
import { useEffect, useRef } from 'react';
import type { danceMedia } from '@/lib/platform-dance-data';
import styles from './platform-dance-page.module.css';
type Media = (typeof danceMedia)[number];
export function DanceVideo({ media, label, autoPlay = false, controls = true, ratio }: { media: Media; label?: string; autoPlay?: boolean; controls?: boolean; ratio?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      if (visible && !document.hidden) {
        if (!node.hasAttribute('src')) { node.src = media.src; node.load(); }
        if (autoPlay && !preference.matches) void node.play().catch(() => {});
        if (preference.matches && autoPlay) node.pause();
      } else {
        node.pause(); if (node.hasAttribute('src')) { node.removeAttribute('src'); node.load(); }
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .1; update(); }, { threshold: [0, .1] });
    observer.observe(node); preference.addEventListener('change', update); document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); preference.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); node.pause(); node.removeAttribute('src'); node.load(); };
  }, [media, autoPlay]);
  return <video ref={ref} className={styles.video} style={{ aspectRatio: ratio ?? media.ratio }} poster={media.poster} aria-label={label ?? media.label} controls={controls} muted loop playsInline preload="none" />;
}
