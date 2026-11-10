import { PlatformRoutePage, platformRouteMetadata } from "@/components/platform-route-page";
import type { PlatformSearchParams } from "@/lib/platform-homepage";
type PageProps = { params: Promise<{ slug?: string[] }>; searchParams: Promise<PlatformSearchParams> };
export async function generateMetadata({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return platformRouteMetadata(slug?.length ? `/${slug.join("/")}` : "/", "en", query);
}
export default async function PlatformPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return <PlatformRoutePage path={slug?.length ? `/${slug.join("/")}` : "/"} locale="en" searchParams={query}/>;
}
