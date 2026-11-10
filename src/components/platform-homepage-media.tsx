"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type PreviewRequest = { priority: number; setActive: (active: boolean) => void };
// 只让三个可见预览同时取源；手动操作和悬停优先，离开后让出名额。
const previewRequests = new Map<HTMLVideoElement, PreviewRequest>();
function schedulePreviews() {
  const selected = new Set([...previewRequests.entries()].sort((a, b) => b[1].priority - a[1].priority || (a[0].compareDocumentPosition(b[0]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)).slice(0, 3).map(([node]) => node));
  previewRequests.forEach((request, node) => request.setActive(selected.has(node)));
}

type Props = { poster: string; src: string; locale: Locale; hero?: boolean; trigger?: "visible" | "hover"; nativeControls?: boolean };
export function HomepageVideo({ poster, src, locale, hero = false, trigger = "visible", nativeControls = false }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const generation = useRef(0);
  const manual = useRef<((play: boolean) => void) | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const node = video.current;
    if (!node) return;
    const owner = ++generation.current;
    const preference = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const card = node.closest<HTMLElement>("[data-preview-card]") ?? node.parentElement!;
    let visible = false, visibleRatio = 0, hovered = false, focused = false, manualPlay = false, manualPause = false, active = false, disposed = false;
    let attempt = 0;
    const release = () => {
      node.pause(); node.removeAttribute("src"); node.load();
    };
    const stop = () => {
      active = false; attempt += 1;
      // pause/load 的事件可能延后或缺失，控件必须随停止意图立即复位。
      if (!disposed) setPlaying(false);
      if (node.hasAttribute("src")) release();
    };
    const onPlay = () => {
      if (!disposed && active && node.hasAttribute("src") && !node.paused) setPlaying(true);
    };
    const onPause = () => {
      // 旧 pause 事件可能在下一次播放之后到达，以当前媒体状态为准。
      if (!disposed && (!active || node.paused)) setPlaying(false);
    };
    node.addEventListener("play", onPlay); node.addEventListener("pause", onPause);
    const request: PreviewRequest = { priority: 0, setActive: allowed => {
      if (!allowed) { if (active) stop(); return; }
      if (active || disposed) return;
      active = true; const currentAttempt = ++attempt;
      node.muted = true; node.src = src;
      void node.play().then(() => {
        if (owner !== generation.current) return;
        if (disposed || !active) { if (node.hasAttribute("src")) release(); return; }
        if (currentAttempt === attempt && !node.paused) setPlaying(true);
      }).catch(() => {
        if (!disposed && owner === generation.current && currentAttempt === attempt) setPlaying(false);
      });
    } };
    const update = () => {
      const automatic = !preference?.matches && !manualPause && (trigger === "visible" || hovered || focused);
      if (!document.hidden && visible && (manualPlay || automatic)) {
        request.priority = manualPlay ? 3 : hovered || focused ? 2 : visibleRatio;
        previewRequests.set(node, request);
      } else { previewRequests.delete(node); stop(); }
      schedulePreviews();
    };
    manual.current = play => {
      manualPlay = play; manualPause = !play;
      // 自动播放被拒绝后，显式点击在同一个用户手势里重新请求播放。
      if (play && active) { active = false; }
      update();
    };
    const enter = () => { hovered = true; update(); };
    const leave = () => { hovered = false; update(); };
    const focus = () => { focused = true; update(); };
    const blur: EventListener = event => { if (!card.contains((event as FocusEvent).relatedTarget as Node | null)) { focused = false; update(); } };
    const visibility = () => { if (document.hidden) { previewRequests.delete(node); stop(); schedulePreviews(); } else update(); };
    const observer = new IntersectionObserver(([entry]) => {
      visibleRatio = entry.intersectionRatio;
      visible = entry.isIntersecting && visibleRatio >= .15;
      if (!visible) manualPlay = false;
      update();
    }, { threshold: [0, .15, .5, .75, 1] });
    observer.observe(node); preference?.addEventListener("change", update);
    card.addEventListener("pointerenter", enter); card.addEventListener("pointerleave", leave);
    card.addEventListener("focusin", focus); card.addEventListener("focusout", blur);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true; manual.current = null;
      node.removeEventListener("play", onPlay); node.removeEventListener("pause", onPause); observer.disconnect(); preference?.removeEventListener("change", update);
      card.removeEventListener("pointerenter", enter); card.removeEventListener("pointerleave", leave);
      card.removeEventListener("focusin", focus); card.removeEventListener("focusout", blur);
      document.removeEventListener("visibilitychange", visibility);
      previewRequests.delete(node); stop(); schedulePreviews();
    };
  }, [src, trigger]);
  return <div className={hero ? "platform-home-video platform-home-video-hero" : "platform-home-video"} data-playing={playing}>
    {/* 海报在未取源、减少动态或播放被阻止时保持可见。控件与导航链接并列，避免嵌套交互。 */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={poster} alt="" aria-hidden="true" loading={hero ? "eager" : "lazy"} draggable={false} />
    <video ref={video} poster={poster} controls={nativeControls} muted loop playsInline preload="none" aria-label={locale === "zh-CN" ? "公开参照展示视频" : "Public reference showcase video"} />
    <button type="button" className="platform-home-play" aria-label={playing ? (locale === "zh-CN" ? "暂停展示视频" : "Pause showcase video") : (locale === "zh-CN" ? "播放展示视频" : "Play showcase video")} onClick={event => {
      event.preventDefault(); event.stopPropagation(); manual.current?.(!playing);
    }}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
  </div>;
}

export function HomepageImageSequence({ images, locale }: { images: readonly string[]; locale: Locale }) {
  const container = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const node = container.current;
    if (!node || images.length < 2) return;
    const preference = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      clearInterval(timer);
      timer = undefined;
      if (visible && !document.hidden && !preference?.matches && !paused) {
        timer = setInterval(() => setIndex(current => (current + 1) % images.length), 2500);
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(node);
    preference?.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(timer); observer.disconnect();
      preference?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [images.length, paused]);
  return <div ref={container} className="platform-home-image-sequence" data-index={index}>
    {images.map((src, i) => <img key={src} src={src} alt="" aria-hidden={i !== index} data-active={i === index} loading="lazy" draggable={false} />) /* eslint-disable-line @next/next/no-img-element */}
    <button type="button" className="platform-home-play" aria-label={paused ? (locale === "zh-CN" ? "继续图片轮播" : "Resume image slideshow") : (locale === "zh-CN" ? "暂停图片轮播" : "Pause image slideshow")} onClick={() => setPaused(current => !current)}>{paused ? <Play size={14}/> : <Pause size={14}/>}</button>
  </div>;
}
