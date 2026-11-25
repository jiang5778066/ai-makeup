import styles from './platform-local-video-editor.module.css';

export function LocalVideoGuide({ title, steps, comparison }: {
  title: string;
  steps: readonly string[];
  comparison?: {
    comparisonTitle: string;
    comparisonDescription: string;
    original: string;
    frameDescription: string;
  };
}) {
  return (
    <section className={styles.guide}>
      <h2>{title}</h2>
      <ol>{steps.map(step => <li key={step}>{step}</li>)}</ol>
      {comparison && (
        <div className={styles.comparison}>
          <h3>{comparison.comparisonTitle}</h3>
          <p>{comparison.comparisonDescription}</p>
          <div className={styles.frames}>
            {([
              ['original', comparison.original, 400, 225],
              ['9-16', '9:16', 126, 224],
              ['4-5', '4:5', 180, 225]
            ] as const).map(([image, caption, width, height]) => (
              <figure key={image}>
                {/* 原始尺寸足够用于对比，图片延迟加载。 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/videos/local-preview/framing-${image}.webp`}
                  alt={comparison.frameDescription}
                  width={width} height={height} loading="lazy" decoding="async"
                />
                <figcaption>{caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
