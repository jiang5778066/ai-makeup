import { PlatformWallpaperBannerPage } from '@/components/platform-wallpaper-banner-page';
import { wallpaperBannerMetadata } from '@/lib/platform-wallpaper-banner-metadata';
export const metadata = wallpaperBannerMetadata('wallpaper','zh-CN');
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const params=await searchParams,query=new URLSearchParams();
  for(const [key,value] of Object.entries(params)) for(const item of Array.isArray(value)?value:value===undefined?[]:[value])query.append(key,item);
  return <PlatformWallpaperBannerPage kind="wallpaper" locale="zh-CN" initialQuery={query.toString()}/>;
}
