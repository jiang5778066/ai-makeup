import type { Metadata } from 'next';
import { iceditPath } from './platform-icedit-data';
import type { Locale } from './i18n';
import { localizePath } from './i18n';
export function iceditMetadata(locale: Locale): Metadata {
  const zh = locale === 'zh-CN';
  const title = zh ? 'ICEdit AI 图片编辑器：用提示词编辑图片 | Makeup AI' : 'ICEdit AI Image Editor with Prompts | Makeup AI';
  const description = zh ? '探索 ICEdit 单图编辑，上传图片并用文字描述创意。提供本地图片预览与原站公开示例；通用图片生成暂不可用。' : 'Explore ICEdit image editing with prompts, local image previews and public reference examples. General image generation is currently unavailable.';
  return { title: { absolute: title }, description, alternates: { canonical: localizePath(iceditPath, locale), languages: { en: iceditPath, 'zh-CN': `/zh-CN${iceditPath}` } }, openGraph: { title, description, type: 'website', locale: zh ? 'zh_CN' : 'en_US', url: localizePath(iceditPath, locale) } };
}
export function iceditQuery(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, values]) => (Array.isArray(values) ? values : values === undefined ? [] : [values]).forEach(value => query.append(key, value)));
  return query.toString();
}
