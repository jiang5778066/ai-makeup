import { getLandingPage } from "@/lib/content";
import { LandingPage } from "@/components/landing-page";
import { metadataForPage, pageSchemas } from "@/lib/seo";

const page = getLandingPage("home", "en");

export const metadata = metadataForPage(page, "en", "/");

export default function HomePage() {
  const schemas = pageSchemas(page, "en", "/");

  return (
    <>
      <LandingPage locale="en" currentPath="/" page={page} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    </>
  );
}
