import { PlatformPerchancePage } from '@/components/platform-perchance-page';
import { perchanceMetadata, perchanceQuery } from '@/lib/platform-perchance-seo';
export const metadata=perchanceMetadata('zh-CN');
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <PlatformPerchancePage locale="zh-CN" initialQuery={perchanceQuery(await searchParams)}/>}
