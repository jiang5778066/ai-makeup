"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageOff, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { CommunityExample } from "@/lib/platform-community-data";
import styles from "./platform-community.module.css";

const detailCopy = {
  en: {
    close: "Close preview",
    unavailable: "Image temporarily unavailable",
    source: "FrameKoi example",
    use: "AI-generated portrait for makeup reference.",
    model: "Generation model",
    quality: "Generation quality"
  },
  "zh-CN": {
    close: "关闭预览",
    unavailable: "图片暂时无法加载",
    source: "FrameKoi 示例",
    use: "AI 虚拟人物妆容示意，仅供妆容参考。",
    model: "生成模型",
    quality: "生成质量"
  }
};

export function CommunityImage({ src, locale, alt, thumbnail = false }: {
  src: string;
  locale: Locale;
  alt: string;
  thumbnail?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const checkImage = useCallback((image: HTMLImageElement | null) => {
    // 补上服务端输出的图片在水合前已加载失败的情况。
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, []);
  return (
    <span className={thumbnail ? styles.thumbnail : styles.previewImage}>
      {failed ? (
        <span className={styles.imageFallback} role={thumbnail ? undefined : "status"}>
          <ImageOff size={22} aria-hidden="true" />
          {detailCopy[locale].unavailable}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 直接读取可核对哈希的本地 WebP。
        <img ref={checkImage} src={src} alt={alt} width={384} height={576} loading={thumbnail ? "lazy" : "eager"} onError={() => setFailed(true)} />
      )}
    </span>
  );
}

export function PlatformCommunityDetail({ item, category, locale, trigger, onClose }: {
  item: CommunityExample;
  category: string;
  locale: Locale;
  trigger: HTMLButtonElement;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closed = useRef(false);
  const copy = detailCopy[locale];

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    closeRef.current?.focus();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const finish = () => {
    if (closed.current) return;
    closed.current = true;
    dialogRef.current?.close();
    if (trigger.isConnected) trigger.focus({ preventScroll: true });
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="community-detail-title"
      aria-describedby="community-detail-description community-detail-use"
      className={styles.dialog}
      onCancel={event => { event.preventDefault(); finish(); }}
      onClose={event => { if (!event.currentTarget.open) finish(); }}
      onClick={event => { if (event.target === event.currentTarget) finish(); }}
      onKeyDown={event => { if (event.key === "Tab") event.preventDefault(); }}
    >
      <div className={styles.dialogBody}>
        <button ref={closeRef} type="button" className={styles.close} aria-label={copy.close} onClick={finish}>
          <X size={22} aria-hidden="true" />
        </button>
        <CommunityImage src={item.image} locale={locale} alt={item.name} />
        <div className={styles.detail}>
          <p className={styles.source}>{copy.source}</p>
          <h2 id="community-detail-title">{item.name}</h2>
          <p className={styles.category}>{category}</p>
          <p id="community-detail-description">{item.description}</p>
          <dl>
            <div><dt>{copy.model}</dt><dd>{item.model}</dd></div>
            <div><dt>{copy.quality}</dt><dd>{item.quality}</dd></div>
          </dl>
          <p id="community-detail-use" className={styles.usage}>{copy.use}</p>
        </div>
      </div>
    </dialog>
  );
}
