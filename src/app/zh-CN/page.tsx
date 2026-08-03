import { LandingPage } from "@/components/landing-page";
import { getLandingPage } from "@/lib/content";
import { pageSchemas } from "@/lib/seo";

export default function ChineseHomePage() {
  const page = getLandingPage("home", "zh-CN");
  const schemas = pageSchemas(page, "zh-CN", "/");

  return (
    <>
      <LandingPage locale="zh-CN" currentPath="/" page={page} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    </>
  );
}
