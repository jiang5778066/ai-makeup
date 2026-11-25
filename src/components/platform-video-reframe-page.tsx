import { ArrowRight } from "lucide-react";
import { SiteShell } from "./site-shell";
import { LocalVideoWorkspace } from "./platform-local-video-workspace";
import { PlatformNavigationLink } from "./platform-navigation-link";
import { localVideoEditorPath } from "@/lib/platform-local-video-editor-data";
import { localizePath, type Locale } from "@/lib/i18n";
import { videoReframeCopy, videoReframePath } from "@/lib/platform-video-reframe-data";
import styles from "./platform-local-video-editor.module.css";

export function VideoReframePage({ locale }: { locale: Locale }) {
  const copy = videoReframeCopy[locale];
  return (
    <SiteShell locale={locale} currentPath={videoReframePath}>
      <main className={styles.page}>
        <header className={styles.intro}>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </header>
        <div id="generator">
          <LocalVideoWorkspace locale={locale} portraitPreview />
        </div>
        <div className={styles.afterWorkspace}>
          <p>{copy.scope}</p>
          <nav className={styles.tools} aria-label={locale === "zh-CN" ? "相关工具" : "Related tools"}>
            <PlatformNavigationLink href={localizePath(localVideoEditorPath, locale)}>
              {copy.playback}<ArrowRight size={16} aria-hidden="true" />
            </PlatformNavigationLink>
          </nav>
        </div>
      </main>
    </SiteShell>
  );
}
