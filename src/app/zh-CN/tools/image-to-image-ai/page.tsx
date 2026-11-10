import {ImageToImagePage,imageToImageMetadata,imageToImageQuery} from '@/components/platform-image-to-image-page';
export const metadata=imageToImageMetadata('zh-CN');
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <ImageToImagePage locale="zh-CN" initialQuery={imageToImageQuery(await searchParams)}/>;}
