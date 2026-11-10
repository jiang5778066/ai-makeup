'use client';
import { Suspense } from 'react';
import Image from 'next/image';
import { ArrowRight, Type, Palette, Layers, Zap, Globe, Share2, ChevronDown } from 'lucide-react';
import { localizePath, type Locale } from '@/lib/i18n';
import { iceditCreators, iceditFaq, iceditFeatures, iceditPath, iceditRelated, iceditSource, iceditText } from '@/lib/platform-icedit-data';
import { PlatformNavigationLink } from './platform-navigation-link';
import { SiteShell } from './site-shell';
import { usePlatformUrl } from './use-platform-url';
import { PlatformIceditSession } from './platform-icedit-session';
import styles from './platform-icedit-page.module.css';

function Source({ locale }: { locale: Locale }) { return <p className={styles.source}>{iceditText(locale, 'Public examples and feature descriptions from ', '公开示例与功能介绍来源：')}<a href={iceditSource} target="_blank" rel="noreferrer">Lanta AI</a>{iceditText(locale, '. Not works from accounts on this site; generation is not connected.', '。非本站账户作品，本站生成服务尚未接通。')}</p>; }
function Body({ locale, initialQuery = '' }: { locale: Locale; initialQuery?: string }) {
  const zh = locale === 'zh-CN', text = (en: string, cn: string) => iceditText(locale, en, cn);
  const url = usePlatformUrl(`${localizePath(iceditPath, locale)}${initialQuery ? `?${initialQuery}` : ''}`), parsed = new URL(url, 'https://local.invalid');
  const active = parsed.pathname === localizePath(iceditPath, locale), icons = [Type, Palette, Layers, Zap, Globe, Share2];
  return <SiteShell locale={locale} currentPath={iceditPath}><main className={styles.page} data-icedit-page>
    <nav className={styles.breadcrumb} aria-label={text('Breadcrumb', '面包屑导航')}><PlatformNavigationLink href={localizePath('/', locale)}>{text('Home', '首页')}</PlatformNavigationLink><span>›</span><PlatformNavigationLink href={localizePath('/tools', locale)}>{text('Tools', '工具')}</PlatformNavigationLink><span>›</span><span>ICEdit AI Image Editor</span></nav>
    <header className={styles.hero}><div><span className={styles.badge}>● {text('Free Online AI Image Editor', '在线 AI 图片编辑器')}</span><h1>ICEdit - {text('AI Image Editor', 'AI 图片编辑器')}<span>{text('Powered by Prompts', '用提示词表达创意')}</span></h1><p>{text('Transform your images instantly with our ', '借助')}<strong>{text('revolutionary AI technology', 'AI 图像技术')}</strong>{text('. Edit photos using simple text prompts - no complex tools needed.', '探索图片编辑。用简单的文字提示描述照片修改，无需复杂工具。')}</p></div><figure className={styles.heroMedia}>
      <Image unoptimized src="/platform/c3e/icedit-1.jpg" width={1064} height={1032} alt={text('ICEdit reference: original portrait and five prompt edits', 'ICEdit原站示例：原始人像及五种提示词编辑')} /><figcaption><Source locale={locale}/></figcaption></figure></header>
    {active && <PlatformIceditSession key={parsed.search} locale={locale} query={parsed.search.slice(1)} />}
    <section className={styles.examples} id="icedit-examples"><h2>{text('See ICEdit Examples', '查看 ICEdit 示例')}</h2><p>{text('Real examples of AI-powered image editing with simple text prompts', '通过简单文字提示编辑图片的原站公开示例')}</p><Source locale={locale}/>
      <figure><Image unoptimized src="/platform/c3e/icedit-2.jpg" width={3028} height={2022} alt={text('Lanta ICEdit image editing examples, first comparison sheet', 'Lanta ICEdit 图像编辑示例：第一组对比图')} /><figcaption><Source locale={locale}/></figcaption></figure>
      <figure><Image unoptimized src="/platform/c3e/icedit-3.jpg" width={1116} height={1024} alt={text('Lanta ICEdit image editing examples, second comparison sheet', 'Lanta ICEdit 图像编辑示例：第二组对比图')} /><figcaption><Source locale={locale}/></figcaption></figure>
    </section>
    <section className={styles.section} id="icedit-features"><h2>{text('Revolutionary Features', '图像编辑功能')}</h2><p>{text('Everything you need for professional image editing, powered by cutting-edge AI technology', '原站介绍的 AI 图像编辑功能，供了解工具用途')}</p><Source locale={locale}/><div className={styles.features}>{iceditFeatures.map((f, i) => { const Icon = icons[i]; return <article key={f[0]}><span className={styles.featureIcon}><Icon size={30} aria-hidden="true"/></span><h3>{f[zh ? 2 : 0]}</h3><p>{f[zh ? 3 : 1]}</p></article>; })}</div></section>
    <section className={styles.section} id="icedit-creators"><h2>{text('For Every Creator', '适合不同创作者')}</h2><p>{text('From social media influencers to professional designers, ICEdit adapts to your creative needs', '从社交媒体内容到专业设计，了解 ICEdit 的创作用途')}</p><Source locale={locale}/><div className={styles.creators}>{iceditCreators.map(c => <article key={c[1]}><span aria-hidden="true">{c[0]}</span><h3>{c[zh ? 3 : 1]}</h3><p>{c[zh ? 4 : 2]}</p></article>)}</div></section>
    <section className={styles.section} id="icedit-faq"><h2>{text('Frequently Asked Questions', '常见问题')}</h2><p>{text("Everything you need to know about ICEdit's revolutionary AI capabilities", '保留原站已保存的英文问题，答案暂缓核实。')}</p><div className={styles.faq}>{iceditFaq.map(q => <div key={q}><h3>{q}</h3><ChevronDown size={18} aria-hidden="true"/></div>)}</div><p className={styles.note}>{text('Saved questions only. Answers are awaiting verification.', '仅展示已保存问题；答案未采集，暂不展开。')}</p><div className={styles.support}><h3>{text('Still have questions?', '仍有疑问？')}</h3><p>{text('Our AI experts are here to help you create amazing images', '使用前请先确认功能可用性与服务说明。')}</p><PlatformNavigationLink href={localizePath('/about', locale)}>{text('💬 Contact Support', '💬 联系支持')}</PlatformNavigationLink></div></section>
    <section className={styles.section} id="icedit-related"><h2>{text('Explore Related Tools', '探索相关工具')}</h2><p>{text('Discover more AI tools for image, video, and creative generation workflows.', '发现更多图片、视频及创意生成工具。')}</p><div className={styles.related}>{iceditRelated.map(r => <PlatformNavigationLink key={r[0]} href={localizePath(r[0], locale)}>{r[zh ? 2 : 1]}<ArrowRight size={18} aria-hidden="true"/></PlatformNavigationLink>)}</div></section>
    <section className={`${styles.section} ${styles.cta}`} id="icedit-start"><span className={styles.badge}>{text('🎉 Join the Revolution', '🎉 开始创意探索')}</span><h2>{text('Ready to Create Something Amazing?', '准备好创造精彩图片了吗？')}</h2><p>{text('Join thousands of creators who trust ICEdit as their go-to AI image editor. Start your creative journey today!', '从一张图片和一段文字开始，探索你的创作想法。')}</p><Source locale={locale}/><a href="#create">{text('Start Creating Now', '立即开始创作')}<ArrowRight size={21} aria-hidden="true"/></a></section>
  </main></SiteShell>;
}
export function PlatformIceditPage(props: { locale: Locale; initialQuery?: string }) { return <Suspense><Body {...props}/></Suspense>; }
