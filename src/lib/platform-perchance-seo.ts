import type { Metadata } from 'next';
import { localizePath, type Locale } from './i18n';
import { perchancePath } from './platform-perchance-state';
export function perchanceMetadata(locale:Locale):Metadata {
 const zh=locale==='zh-CN',title=zh?'Perchance 图片生成器：创意与尺寸预览 | FrameKoi':'Perchance Image Generator — Creative Settings Preview | FrameKoi',description=zh?'探索 Perchance 图片创作的公开示例、风格与用途，在 FrameKoi 本地预览提示词与图片比例。通用生成暂不可用，保留原有3次美妆体验。':'Explore Perchance public examples, image styles and creative uses. Preview prompts and image sizes locally on FrameKoi. General generation is currently unavailable; the original 3 makeup trials remain.';
 const site=process.env.NEXT_PUBLIC_SITE_URL??'https://www.framekoi.com';
 return {title:{absolute:title},description,alternates:{canonical:site+localizePath(perchancePath,locale),languages:{en:site+perchancePath,'zh-CN':site+localizePath(perchancePath,'zh-CN'),'x-default':site+perchancePath}},openGraph:{title,description,type:'website',siteName:'FrameKoi',url:site+localizePath(perchancePath,locale),locale:zh?'zh_CN':'en_US'},twitter:{card:'summary',title,description}};
}
export function perchanceQuery(query:Record<string,string|string[]|undefined>){const params=new URLSearchParams();for(const [key,value] of Object.entries(query))for(const item of Array.isArray(value)?value:value===undefined?[]:[value])params.append(key,item);return params.toString()}
