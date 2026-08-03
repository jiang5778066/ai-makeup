import { LandingPage } from "@/components/landing-page";
import { getLandingPage } from "@/lib/content";
import { metadataForPage, pageSchemas } from "@/lib/seo";

const page = getLandingPage("home", "zh-CN");

export const metadata = metadataForPage(page, "zh-CN", "/");

export default function ChineseHomePage() {
  const schemas = pageSchemas(page, "zh-CN", "/");

  return (
    <>
      <LandingPage locale="zh-CN" currentPath="/" page={page} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    </>
  );
}
