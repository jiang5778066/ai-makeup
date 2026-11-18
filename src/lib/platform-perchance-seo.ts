import { siteUrl } from './brand';
import type { Metadata } from 'next';
import { localizePath, type Locale } from './i18n';
import { perchancePath } from './platform-perchance-state';
export function perchanceMetadata(locale:Locale):Metadata {
 const zh=locale==='zh-CN',title=zh?'Perchance 图片生成器：创意与尺寸预览 | PictoWink':'Perchance Image Generator — Creative Settings Preview | PictoWink',description=zh?'探索 Perchance 图片创作的公开示例、风格与用途，在 PictoWink 本地预览提示词与图片比例。生成尚未开放，可以先了解提示词与设置。':'Explore Perchance public examples, image styles and creative uses. Preview prompts and image sizes locally on PictoWink. Generation is not open yet; explore prompts and settings before you start.';
 const site=siteUrl;
 return {title:{absolute:title},description,alternates:{canonical:site+localizePath(perchancePath,locale),languages:{en:site+perchancePath,'zh-CN':site+localizePath(perchancePath,'zh-CN'),'x-default':site+perchancePath}},openGraph:{title,description,type:'website',siteName:'PictoWink',url:site+localizePath(perchancePath,locale),locale:zh?'zh_CN':'en_US'},twitter:{card:'summary',title,description}};
}
export function perchanceQuery(query:Record<string,string|string[]|undefined>){const params=new URLSearchParams();for(const [key,value] of Object.entries(query))for(const item of Array.isArray(value)?value:value===undefined?[]:[value])params.append(key,item);return params.toString()}
