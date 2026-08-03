import { getLandingPage } from "@/lib/content";
import { LandingPage } from "@/components/landing-page";
import { pageSchemas } from "@/lib/seo";

export default function HomePage() {
  const page = getLandingPage("home", "en");
  const schemas = pageSchemas(page, "en", "/");

  return (
    <>
      <LandingPage locale="en" currentPath="/" page={page} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    </>
  );
}
