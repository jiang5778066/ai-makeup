import { PlatformIceditPage } from '@/components/platform-icedit-page';
import { iceditMetadata, iceditQuery } from '@/lib/platform-icedit-seo';
export const metadata = iceditMetadata('zh-CN');
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PlatformIceditPage locale="zh-CN" initialQuery={iceditQuery(await searchParams)} />;
}
