import { PlatformPerchancePage } from '@/components/platform-perchance-page';
import { perchanceMetadata, perchanceQuery } from '@/lib/platform-perchance-seo';
export const metadata=perchanceMetadata('en');
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <PlatformPerchancePage locale="en" initialQuery={perchanceQuery(await searchParams)}/>}
