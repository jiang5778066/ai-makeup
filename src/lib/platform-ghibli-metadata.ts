import type { Metadata } from 'next';
import { alternateLanguagesForPath, localizePath, type Locale } from './i18n';

export function ghibliMetadata(locale: Locale): Metadata {
  const path = '/tools/image-to-ghibli-style';
  return {
    title: locale === 'zh-CN' ? '在线免费图片转吉卜力风格转换器' : 'Online Free Image to Studio Ghibli Style Converter',
    description: locale === 'zh-CN' ? '探索照片转吉卜力风格的六组公开对照示例、功能介绍与创意用途。示例来自 Lanta AI，Makeup AI 当前生成暂不可用。' : 'Explore six public photo-to-Ghibli comparisons, feature descriptions, and creative uses. Examples are from Lanta AI; generation is currently unavailable on Makeup AI.',
    alternates: { canonical: localizePath(path, locale), languages: alternateLanguagesForPath(path) }
  };
}
