import { PlatformIceditPage } from '@/components/platform-icedit-page';
import { iceditMetadata, iceditQuery } from '@/lib/platform-icedit-seo';
export const metadata = iceditMetadata('en');
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PlatformIceditPage locale="en" initialQuery={iceditQuery(await searchParams)} />;
}
