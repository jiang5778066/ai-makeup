import { ArrowRight } from 'lucide-react';
import { localizePath, type Locale } from '@/lib/i18n';
import { localVideoEditorCopy, localVideoEditorPath } from '@/lib/platform-local-video-editor-data';
import { videoReframeCopy, videoReframePath } from '@/lib/platform-video-reframe-data';
import { PlatformNavigationLink } from './platform-navigation-link';
import { SiteShell } from './site-shell';
import { LocalVideoWorkspace } from './platform-local-video-workspace';
import { LocalVideoGuide } from './platform-local-video-guide';
import styles from './platform-local-video-editor.module.css';

export function LocalVideoEditorPage({ locale }: { locale: Locale }) {
  const copy = localVideoEditorCopy[locale];
  return (
    <SiteShell locale={locale} currentPath={localVideoEditorPath}>
      <main className={styles.page}>
        <header className={styles.intro}>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <p className={styles.scope}>{copy.scope}</p>
        </header>
        <LocalVideoWorkspace locale={locale} />
        <div className={styles.afterWorkspace}>
          <nav className={styles.tools} aria-label={copy.tools}>
            <PlatformNavigationLink href={localizePath(videoReframePath, locale)}>
              {videoReframeCopy[locale].title}<ArrowRight size={16} aria-hidden="true" />
            </PlatformNavigationLink>
            <PlatformNavigationLink href={localizePath('/ai-video-generator', locale)}>
              {copy.videoTool}<ArrowRight size={16} aria-hidden="true" />
            </PlatformNavigationLink>
            <PlatformNavigationLink href={localizePath('/ai-image-generator', locale)}>
              {copy.imageTool}<ArrowRight size={16} aria-hidden="true" />
            </PlatformNavigationLink>
          </nav>
        </div>
        <LocalVideoGuide title={copy.guideTitle} steps={copy.steps} />
      </main>
    </SiteShell>
  );
}
