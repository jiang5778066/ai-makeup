import {PlatformAnimalGraffitiPage} from '@/components/platform-animal-graffiti-page';
import {animalGraffitiMetadata} from '@/lib/platform-animal-graffiti-metadata';
import {platformSearchQuery,type PlatformSearchParams} from '@/lib/platform-homepage';
export const metadata=animalGraffitiMetadata('graffiti','en');
export default async function Page({searchParams}:{searchParams:Promise<PlatformSearchParams>}){const query=await searchParams;return <PlatformAnimalGraffitiPage tool="graffiti" locale="en" initialQuery={platformSearchQuery(query).toString()}/>;}
