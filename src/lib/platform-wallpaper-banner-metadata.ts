import type { Metadata } from 'next';
import { alternateLanguagesForPath, localizePath, type Locale } from './i18n';
import { wallpaperBannerPaths, type WallpaperBannerKind } from './platform-wallpaper-banner-state';

export const wallpaperBannerTitle = (kind: WallpaperBannerKind, locale: Locale) => kind === 'wallpaper' ? (locale === 'zh-CN' ? 'AI 壁纸生成器' : 'AI Wallpaper Generator') : 'AI YouTube Banner Maker';
export const wallpaperBannerMetadata = (kind: WallpaperBannerKind, locale: Locale): Metadata => {
  const title = wallpaperBannerTitle(kind,locale),path=wallpaperBannerPaths[kind];
  const description = kind === 'wallpaper'
    ? (locale === 'zh-CN' ? '探索手机与桌面壁纸、风格提示词、4K 与设备比例，支持本地参考图片预览；生成暂不可用。' : 'Explore phone and desktop wallpaper ideas, style prompts, 4K settings and screen ratios. Local reference preview; generation is not available yet.')
    : (locale === 'zh-CN' ? '探索 YouTube 频道横幅案例、提示词和多设备安全区规范；支持本地参数预览，生成暂不可用。' : 'Explore YouTube channel banner concepts, reusable prompts, dimensions and safe areas across devices. Preview settings locally; generation is unavailable.');
  return {title,description,alternates:{canonical:localizePath(path,locale),languages:{...alternateLanguagesForPath(path),'x-default':path}},openGraph:{title,description,siteName:'Makeup AI',locale,type:'website'}};
};
