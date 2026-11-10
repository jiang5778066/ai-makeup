import {ImageToImagePage,imageToImageMetadata,imageToImageQuery} from '@/components/platform-image-to-image-page';
export const metadata=imageToImageMetadata('en');
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <ImageToImagePage locale="en" initialQuery={imageToImageQuery(await searchParams)}/>;}
