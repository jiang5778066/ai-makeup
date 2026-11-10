import {AlbumCoverPage,albumMetadata} from '@/components/platform-album-cover-page';
import {albumQuery} from '@/lib/platform-album-cover-state';
export const metadata=albumMetadata('en');
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AlbumCoverPage locale="en" query={albumQuery(await searchParams)}/>}
