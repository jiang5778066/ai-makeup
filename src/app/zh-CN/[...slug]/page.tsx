import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { getLandingPage, slugFromPath } from "@/lib/content";
import { metadataForPage, pageSchemas } from "@/lib/seo";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

function pathFromSlug(slug?: string[]) {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = pathFromSlug(slug);
  const landingSlug = slugFromPath(path);

  if (!landingSlug) {
    return {};
  }

  const page = getLandingPage(landingSlug, "zh-CN");
  return metadataForPage(page, "zh-CN", path);
}

export default async function ChineseMarketingPage({ params }: PageProps) {
  const { slug } = await params;
  const path = pathFromSlug(slug);
  const landingSlug = slugFromPath(path);

  if (!landingSlug) {
    notFound();
  }

  const page = getLandingPage(landingSlug, "zh-CN");
  const schemas = pageSchemas(page, "zh-CN", path);

  return (
    <>
      <LandingPage locale="zh-CN" currentPath={path} page={page} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    </>
  );
}
