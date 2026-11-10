'use client';
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, Clapperboard, Coins, createLucideIcon, Gift, ImagePlus, Music2, Sparkles, Video, X } from 'lucide-react';
import { localizePath, type Locale } from '@/lib/i18n';
import { danceContent } from '@/lib/platform-dance-content';
import { danceMedia, danceDurations, danceTemplateNamesZh } from '@/lib/platform-dance-data';
import { DanceMediaSlot, danceMediaDependencies, type DanceMediaKind } from '@/lib/platform-dance-media-state';
import { SiteShell } from './site-shell';
import { PlatformNavigationLink } from './platform-navigation-link';
import { DanceForm } from './platform-dance-form';
import { DanceVideo } from './platform-dance-video';
import styles from './platform-dance-page.module.css';
const DanceLayers = createLucideIcon('Layers', [
  ['path', { d: 'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z', key: 'top' }],
  ['path', { d: 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', key: 'bottom' }],
  ['path', { d: 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65', key: 'middle' }],
]);
function useDanceSlot(kind: DanceMediaKind) {
  const [slot] = useState(() => new DanceMediaSlot(kind, danceMediaDependencies));
  const state = useSyncExternalStore(slot.subscribe, slot.read, slot.read);
  useEffect(() => { slot.activate(); const leave = () => slot.clear(); window.addEventListener('pagehide', leave); return () => { window.removeEventListener('pagehide', leave); slot.dispose(); }; }, [slot]);
  return [slot, state] as const;
}
export function TemplatePreview({ id, locale, selected, select, close, trigger }: { id: number; locale: Locale; selected: boolean; select: (id: number, focus?: boolean) => void; close: () => void; trigger: HTMLButtonElement | null }) {
  const ref = useRef<HTMLDialogElement>(null), finished = useRef(false), zh = locale === 'zh-CN';
  useEffect(() => { const node = ref.current; if (node && !node.open) node.showModal(); }, []);
  const finish = (useTemplate = false) => {
    if (finished.current) return;
    finished.current = true;
    // 原生 close 同步解除模态；其排队的 close 事件由 finished 拦截，不能重复交接焦点。
    ref.current?.close();
    if (useTemplate) select(id, true);
    else if (trigger?.isConnected) trigger.focus();
    close();
  };
  return <dialog ref={ref} className={styles.dialog} aria-labelledby="dance-preview-title" onCancel={e => { e.preventDefault(); finish(); }} onClose={() => finish()} onClick={e => { if (e.target === e.currentTarget) finish(); }}><div><h2 id="dance-preview-title">{zh ? danceTemplateNamesZh[id - 1] : danceMedia[id].label}</h2><button type="button" className={styles.dialogClose} onClick={() => finish()} aria-label={zh ? '关闭预览' : 'Close preview'}><X /></button><DanceVideo media={danceMedia[id]} /><button type="button" className={styles.cta} aria-pressed={selected} onClick={() => finish(true)}>{selected ? (zh ? '已选择此舞蹈' : 'Dance selected') : (zh ? '使用此舞蹈' : 'Use this dance')}</button></div></dialog>;
}
function DanceAnchor({ children, focusForm }: { children: React.ReactNode; focusForm: () => void }) {
  return <a className={styles.cta} href="#generator" onClick={e => { e.preventDefault(); window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#generator`); focusForm(); }}>{children}<ArrowRight size={18} aria-hidden="true" /></a>;
}
function DanceBody({ locale }: { locale: Locale }) {
  const zh = locale === 'zh-CN', c = danceContent[locale], [photoSlot, photo] = useDanceSlot('photo'), [videoSlot, video] = useDanceSlot('video');
  const [preview, setPreview] = useState<{ id: number; trigger: HTMLButtonElement } | null>(null);
  const focusForm = () => { const heading = document.getElementById('dance-generator-title'); document.getElementById('generator')?.scrollIntoView({ block: 'start', behavior: 'instant' }); heading?.focus({ preventScroll: true }); };
  const selectTemplate = (id: number, focus = false) => { const media = danceMedia[id]; if (id < 1 || id > 6 || !media) return; videoSlot.choose({ source: 'template', id, url: media.src, name: media.label }); if (focus) focusForm(); };
  const source = <p className={styles.source}>{zh ? '来源功能介绍与公开示例：' : 'Source product information and public examples: '}<a href="https://www.lantaai.com/ai-dance" target="_blank" rel="noreferrer">Lanta AI</a>{zh ? '。生成、免费积分与计费为来源说明，Makeup AI 当前仅提供本地预览。' : '. Generation, free credits and pricing describe the source. Makeup AI currently provides local previews.'}</p>;
  const benefitIcons = [ImagePlus, Video, DanceLayers, Coins], useIcons = [Clapperboard, Sparkles, Gift];
  return <main className={styles.page} data-dance-page data-locale={locale}>
    <nav className={styles.breadcrumb} aria-label={zh ? '面包屑导航' : 'Breadcrumb'}><PlatformNavigationLink href={localizePath('/', locale)}>{zh ? '首页' : 'Home'}</PlatformNavigationLink><span aria-hidden="true">›</span><span aria-current="page">{zh ? 'AI 舞蹈生成器' : 'AI Dance Generator'}</span></nav>
    <div className={styles.container}>
      <header className={styles.hero}><h1>{c.hero[0]}</h1><p>{c.hero[1]}</p></header>
      <section id="generator" className={styles.generator} aria-labelledby="dance-generator-title">
        <DanceForm locale={locale} photo={photo} video={video} photoSlot={photoSlot} videoSlot={videoSlot} selectTemplate={selectTemplate} preview={(id, trigger) => setPreview({ id, trigger })} />
        <aside className={styles.showcase}><div><h2>{zh ? '看看照片如何变成舞蹈' : 'Watch a photo become a dance'}</h2><DanceVideo media={danceMedia[0]} autoPlay /><p>{zh ? '看看照片和舞蹈参考如何组合成 AI 舞蹈视频。' : 'See how a photo and a dance reference come together in an AI dance video.'}</p></div></aside>
      </section>
      <section id="dance-templates" className={styles.section} aria-labelledby="dance-templates-title"><div className={styles.heading}><h2 id="dance-templates-title">{c.templates[0]}</h2><p>{c.templates[1]}</p></div><div className={styles.featuredGrid}>{danceMedia.slice(1, 7).map(media => <article key={media.id} className={styles.featuredCard}><div className={styles.featuredMedia}><DanceVideo media={media} /><span>{danceDurations[media.id - 1]}</span></div><div className={styles.featuredCopy}><p>{c.templates[media.id + 1]}</p><button className={styles.cta} type="button" aria-pressed={video.value?.source === 'template' && video.value.id === media.id} aria-label={zh ? `使用此舞蹈：${danceTemplateNamesZh[media.id - 1]}` : `Use this dance: ${media.label}`} onClick={() => selectTemplate(media.id, true)}><Music2 size={16} aria-hidden="true" />{zh ? '使用此舞蹈' : 'Use this dance'}</button></div></article>)}</div></section>
      <section id="how-it-works" className={`${styles.section} ${styles.steps}`} aria-labelledby="dance-how-title"><h2 id="dance-how-title">{c.steps[0]}</h2><ol>{[0, 1, 2].map(i => <li key={i}><span>{i + 1}</span><h3>{c.steps[1 + i * 2]}</h3><p>{c.steps[2 + i * 2]}</p></li>)}</ol><DanceAnchor focusForm={focusForm}>{zh ? '让我的照片跳舞' : 'Make My Photo Dance'}</DanceAnchor></section>
      <section id="dance-styles" className={styles.section} aria-labelledby="dance-styles-title"><div className={styles.heading}><h2 id="dance-styles-title">{c.styles[0]}</h2><p>{c.styles[1]}</p></div><div className={styles.styleList}>{danceMedia.slice(7, 13).map((media, i) => <article key={media.id} className={styles.styleRow} id={`dance-style-${['cat', 'dog', 'sway', 'kpop', 'hiphop', 'shuffle'][i]}`}><div className={styles.styleCopy}><h3>{c.styles[2 + i * 3]}</h3><p>{c.styles[3 + i * 3]}</p><p>{c.styles[4 + i * 3]}</p></div><div className={styles.styleMedia}><DanceVideo media={media} /></div></article>)}</div></section>
      <section id="dance-examples" className={styles.section} aria-labelledby="dance-examples-title"><div className={styles.headingWide}><h2 id="dance-examples-title">{c.examples[0]}</h2><p>{c.examples[1]}</p></div><div className={styles.examples}>{danceMedia.slice(13, 15).map((media, i) => <figure key={media.id}><DanceVideo media={media} /><figcaption><h3>{c.examples[2 + i * 2]}</h3><p>{c.examples[3 + i * 2]}</p></figcaption></figure>)}</div></section>
      <section id="dance-benefits" className={styles.section} aria-labelledby="dance-benefits-title"><h2 id="dance-benefits-title" className={styles.wideTitle}>{c.benefits[0]}</h2><div className={styles.benefits}>{benefitIcons.map((Icon, i) => <article key={i}><span><Icon aria-hidden="true" /></span><h3>{c.benefits[1 + i * 2]}</h3><p>{c.benefits[2 + i * 2]}</p></article>)}</div>{source}</section>
      <section id="dance-use-cases" className={styles.section} aria-labelledby="dance-uses-title"><div className={styles.heading}><h2 id="dance-uses-title">{c.uses[0]}</h2><p>{c.uses[1]}</p></div><div className={styles.uses}>{useIcons.map((Icon, i) => <article key={i}><Icon aria-hidden="true" /><h3>{c.uses[2 + i * 2]}</h3><p>{c.uses[3 + i * 2]}</p></article>)}</div></section>
      <section className={styles.bottom}><Sparkles className={styles.bottomIcon} aria-hidden="true" /><h2>{c.bottom[0]}</h2><p>{c.bottom[1]}</p><DanceAnchor focusForm={focusForm}>{zh ? '创建我的 AI 舞蹈视频' : 'Create My AI Dance Video'}</DanceAnchor><p className={styles.unavailable}>{zh ? '生成尚未开放；可在表单中预览本地照片、视频与模板。' : 'Generation is unavailable. Preview local photos, videos and templates in the form.'}</p>{source}</section>
    </div>
    {preview && <TemplatePreview id={preview.id} locale={locale} selected={video.value?.source === 'template' && video.value.id === preview.id} select={selectTemplate} close={() => setPreview(null)} trigger={preview.trigger} />}
  </main>;
}
function DanceRoute({ locale }: { locale: Locale }) {
  const path = usePathname();
  return path && path !== localizePath('/ai-dance', locale) ? null : <DanceBody key={locale} locale={locale} />;
}
export function PlatformDancePage({ locale }: { locale: Locale }) {
  return <SiteShell locale={locale} currentPath="/ai-dance"><Suspense fallback={null}><DanceRoute locale={locale} /></Suspense></SiteShell>;
}
