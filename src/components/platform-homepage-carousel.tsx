"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function HomepageCarousel({ children, title, locale, className = "", loop = false }: { children: ReactNode; title: string; locale: Locale; className?: string; loop?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [progress, setProgress] = useState({ left: 0, width: 100 });
  const dragging = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const update = () => {
      setEdges({ start: node.scrollLeft <= 2, end: node.scrollLeft >= node.scrollWidth - node.clientWidth - 2 });
      setProgress({ left: node.scrollWidth ? node.scrollLeft / node.scrollWidth * 100 : 0, width: node.scrollWidth ? node.clientWidth / node.scrollWidth * 100 : 100 });
    };
    const observer = new ResizeObserver(update); observer.observe(node); node.addEventListener("scroll", update, { passive: true }); update();
    return () => { observer.disconnect(); node.removeEventListener("scroll", update); };
  }, []);
  const move = (direction: number) => {
    const node = track.current; if (!node) return;
    const step = node.firstElementChild?.getBoundingClientRect().width ?? node.clientWidth;
    const gap = parseFloat(getComputedStyle(node).columnGap) || 0;
    const max = node.scrollWidth - node.clientWidth;
    const next = loop && direction < 0 && edges.start ? max : loop && direction > 0 && edges.end ? 0 : Math.max(0, Math.min(max, node.scrollLeft + direction * (step + gap)));
    node.scrollTo({ left: next, behavior: typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <div className={`platform-home-carousel ${className}`}>
    <div className="platform-home-carousel-heading">{title && <h2>{title}</h2>}<div className="platform-home-arrows">
      <button type="button" disabled={!loop && edges.start} onClick={() => move(-1)} aria-label={`${locale === "zh-CN" ? "上一组" : "Previous"}${title ? `: ${title}` : ""}`}><ChevronLeft size={20} /></button>
      <button type="button" disabled={!loop && edges.end} onClick={() => move(1)} aria-label={`${locale === "zh-CN" ? "下一组" : "Next"}${title ? `: ${title}` : ""}`}><ChevronRight size={20} /></button>
    </div></div>
    <div ref={track} className="platform-home-track" role="group" aria-label={title || (locale === "zh-CN" ? "模型轮播" : "Model carousel")} tabIndex={0}
      onKeyDown={(event) => { if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return; event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }}
      onPointerDown={(event) => { if (event.pointerType !== "mouse") return; dragging.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false }; }}
      onPointerMove={(event) => { const drag = dragging.current; if (!drag || !(event.buttons & 1)) return; const delta = event.clientX - drag.x; if (Math.abs(delta) > 5) drag.moved = true; if (drag.moved) { event.currentTarget.scrollLeft = drag.left - delta; event.preventDefault(); } }}
      onPointerUp={() => { const drag = dragging.current; if (drag && !drag.moved) dragging.current = null; }}
      onPointerLeave={() => { dragging.current = null; }}
      onClickCapture={(event) => { if (dragging.current?.moved) { event.preventDefault(); event.stopPropagation(); } dragging.current = null; }}
      onDragStart={(event) => event.preventDefault()}>{children}</div>
    <div className="platform-home-scroll-progress" aria-hidden="true"><span style={{ left: `${progress.left}%`, width: `${progress.width}%` }}/></div>
  </div>;
}
