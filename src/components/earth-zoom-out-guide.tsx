import { CircleAlert } from "lucide-react";
import { FirstVideoEffectsCopyButton } from "@/components/first-video-effects-copy-button";
import { SiteShell } from "@/components/site-shell";
import styles from "@/components/first-video-effects-page.module.css";
import { earthZoomOutGuide } from "@/lib/earth-zoom-out-guide";
import { localizePath, type Locale } from "@/lib/i18n";

export function EarthZoomOutGuide({ locale }: { locale: Locale }) {
  const content = earthZoomOutGuide[locale];

  return <SiteShell locale={locale} currentPath="/video-effects/earth-zoom-out" variant="marketing">
    <main className={styles.page}>
      <article className={styles.earthGuide}>
        <header>
          <a className={styles.back} href={localizePath("/video-effects", locale)}>{content.directoryLink}</a>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
        </header>

        <section aria-labelledby="earth-storyboard">
          <h2 id="earth-storyboard">{content.storyboardTitle}</h2>
          <ol className={styles.earthShots}>
            {content.shots.map(shot => <li key={shot.shot}>
              <h3>{shot.shot}</h3>
              <p><strong>{content.motionLabel}</strong> {shot.motion}</p>
              <p><strong>{content.matchLabel}</strong> {shot.match}</p>
            </li>)}
          </ol>
        </section>

        <section aria-labelledby="earth-prompts">
          <h2 id="earth-prompts">{content.promptsTitle}</h2>
          <p>{content.exampleNotice}</p>
          {content.shots.map(shot => <section key={shot.shot} className={`${styles.prompt} ${styles.earthPrompt}`}>
            <h3>{shot.promptTitle}</h3>
            <p>{shot.prep}</p>
            <blockquote>{shot.prompt}</blockquote>
            <FirstVideoEffectsCopyButton prompt={shot.prompt} locale={locale}/>
          </section>)}
        </section>

        <section aria-labelledby="earth-fixes">
          <h2 id="earth-fixes">{content.fixesTitle}</h2>
          <dl className={styles.earthFixes}>
            {content.fixes.map(({ problem, fix }) => <div key={problem}>
              <dt>{problem}</dt>
              <dd>{fix}</dd>
            </div>)}
          </dl>
        </section>

        <section aria-labelledby="earth-preview">
          <h2 id="earth-preview">{content.previewTitle}</h2>
          <p>{content.preview}</p>
          <ul className={styles.earthLinks}>
            <li><a href={localizePath("/ai-video-editor", locale)}>{content.clipLink}</a></li>
            <li><a href={localizePath("/tools/landscape-to-portrait-video-converter-ai", locale)}>{content.cropLink}</a></li>
          </ul>
          <aside className={styles.status}>
            <CircleAlert size={18} aria-hidden="true"/>
            <div>
              <p>{content.status}</p>
              <a href={localizePath("/tools/ai-image-to-video", locale)}>{content.imageLink}</a>
            </div>
          </aside>
        </section>
      </article>
    </main>
  </SiteShell>;
}
