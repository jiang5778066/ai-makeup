import { ArrowRight, ChevronRight } from 'lucide-react';
import { localizePath, type Locale } from '@/lib/i18n';
import { ghibliContent } from '@/lib/platform-ghibli-content';
import { ghibliMedia } from '@/lib/platform-ghibli-media';
import { SiteShell } from './site-shell';
import { PlatformGhibliComparison } from './platform-ghibli-comparison';
import styles from './platform-ghibli-page.module.css';

const path = '/tools/image-to-ghibli-style';
type Cards = readonly { readonly title: string; readonly description: string; readonly icon?: string }[];

function Cta({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <a data-ghibli-cta href={localizePath('/image-style-converter', locale)} target="_blank" rel="noopener noreferrer" className={styles.cta}>{children}<ArrowRight size={18} aria-hidden="true" /></a>;
}
function Heading({ title, description, id }: { title: string; description: string; id: string }) {
  return <div className={styles.sectionHeading}><h2 id={id}>{title}</h2><p>{description}</p></div>;
}
function Source({ locale }: { locale: Locale }) {
  return <p className={styles.source}>{locale === 'zh-CN' ? '来源：Lanta AI 公开对照示例，非本站账户作品。' : 'Source: Lanta AI public comparison examples, not works from Makeup AI accounts.'}</p>;
}
function CardGrid({ cards, kind }: { cards: Cards; kind: 'features' | 'steps' | 'uses' }) {
  return <div className={`${styles.cardGrid} ${styles[kind]}`}>{cards.map((card, i) => <article key={card.title}>
    <div className={styles.icon}>{kind === 'steps' ? i + 1 : <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: card.icon ?? '' }} />}</div><h3>{card.title}</h3><p>{card.description}</p>
  </article>)}</div>;
}

export function PlatformGhibliPage({ locale }: { locale: Locale }) {
  const copy = ghibliContent[locale], zh = locale === 'zh-CN';
  return <SiteShell locale={locale} currentPath={path}><main className={styles.page} data-generation-availability="unavailable" data-ghibli-page={locale}>
    <nav className={styles.breadcrumb} aria-label={zh ? '面包屑导航' : 'Breadcrumb'}><a href={localizePath('/', locale)}>{zh ? '首页' : 'Home'}</a><ChevronRight size={16} /><a href={localizePath('/tools', locale)}>{zh ? '工具' : 'Tools'}</a><ChevronRight size={16} /><span>Image to Ghibli Style</span></nav>
    <section className={styles.hero} aria-labelledby="ghibli-hero"><div className={styles.heroGrid}>
      <div className={styles.heroCopy}><div className={styles.eyebrow}>{copy.hero.eyebrow}</div><h1 id="ghibli-hero">{copy.hero.title}</h1><p>{copy.hero.description}</p><div><Cta locale={locale}>{copy.hero.cta}</Cta></div></div>
      <figure><PlatformGhibliComparison key={`${locale}:hero`} pair={ghibliMedia[0]} locale={locale} name={copy.hero.title} /><figcaption><Source locale={locale} /></figcaption></figure>
    </div></section>
    <section className={styles.examples} aria-labelledby="ghibli-examples"><Heading {...copy.examples} id="ghibli-examples" /><div className={styles.examplesGrid}>{copy.examples.cards.map((card, i) => <figure key={card.title} data-ghibli-example>
      <PlatformGhibliComparison pair={ghibliMedia[i + 1]} locale={locale} name={card.title} /><figcaption><h3>{card.title}</h3><p>{card.description}</p><Source locale={locale} /></figcaption>
    </figure>)}</div></section>
    <section className={styles.section} aria-labelledby="ghibli-features"><Heading {...copy.features} id="ghibli-features" /><CardGrid cards={copy.features.cards} kind="features" /></section>
    <section className={`${styles.section} ${styles.how}`} aria-labelledby="ghibli-steps"><Heading {...copy.steps} id="ghibli-steps" /><CardGrid cards={copy.steps.cards} kind="steps" /><div className={styles.center}><Cta locale={locale}>{copy.steps.cta}</Cta></div></section>
    <section className={styles.usesSection} aria-labelledby="ghibli-uses"><Heading {...copy.uses} id="ghibli-uses" /><CardGrid cards={copy.uses.cards} kind="uses" /></section>
    <section className={styles.comparisonSection} aria-labelledby="ghibli-comparison"><Heading {...copy.comparison} id="ghibli-comparison" /><div className={styles.tableScroll}><table><thead><tr>{copy.comparison.rows[0].map(cell => <th key={cell} scope="col">{cell}</th>)}</tr></thead><tbody>{copy.comparison.rows.slice(1).map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={i === 1 ? styles.positive : i === 2 ? styles.negative : undefined}>{cell}</td>)}</tr>)}</tbody></table></div><p className={styles.serviceNotice}>{zh ? '以上为 Lanta AI 公开功能介绍与对比，非本站已接入能力；Makeup AI 生成服务暂不可用。' : 'The feature descriptions and comparison above come from Lanta AI and do not indicate integrated capabilities. Generation is currently unavailable on Makeup AI.'}</p></section>
    <section className={styles.related} aria-labelledby="ghibli-related"><Heading {...copy.related} id="ghibli-related" /><div>{copy.related.links.map(link => <a key={link.href} href={localizePath(link.href.replace(/^\/zh(?=\/|$)/, ''), locale)} target="_blank" rel="noopener noreferrer">{link.text}<ArrowRight size={16} aria-hidden="true" /></a>)}</div></section>
    <section className={styles.finalCta} aria-labelledby="ghibli-cta"><Heading {...copy.cta} id="ghibli-cta" /><Cta locale={locale}>{copy.cta.button}</Cta><p className={styles.serviceNotice}>{zh ? '公开介绍及示例来自 Lanta AI。当前图片生成暂不可用，美妆体验额度仍为 3 次。' : 'Public descriptions and examples are from Lanta AI. Image generation is currently unavailable; the makeup trial remains 3 uses.'}</p></section>
  </main></SiteShell>;
}
