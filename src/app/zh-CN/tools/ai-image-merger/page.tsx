import {CompositionPage,compositionMetadata,compositionQuery} from "@/components/platform-image-composition-page";
export const metadata=compositionMetadata("merger","zh-CN");
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <CompositionPage kind="merger" locale="zh-CN" initialQuery={compositionQuery(await searchParams)}/>;}
