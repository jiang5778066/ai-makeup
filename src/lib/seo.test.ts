import { describe, expect, it } from "vitest";
import { getLandingPage } from "./content";
import { metadataForPage, pageSchemas } from "./seo";

describe("SEO helpers", () => {
  it("creates canonical and language alternates for localized pages", () => {
    const page = getLandingPage("ai-makeup", "zh-CN");
    const metadata = metadataForPage(page, "zh-CN", "/ai-makeup");

    expect(metadata.alternates?.canonical).toBe("https://example.com/zh-CN/ai-makeup");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "https://example.com/ai-makeup",
      "zh-CN": "https://example.com/zh-CN/ai-makeup",
      "x-default": "https://example.com/ai-makeup"
    });
  });

  it("emits software, faq, how-to, and breadcrumb schema", () => {
    const page = getLandingPage("ai-makeup", "en");
    const schemas = pageSchemas(page, "en", "/ai-makeup");

    expect(schemas.map((schema) => schema["@type"])).toEqual([
      "WebApplication",
      "FAQPage",
      "HowTo",
      "BreadcrumbList"
    ]);
    expect(schemas[0]).toMatchObject({
      offers: [
        { price: "0", priceCurrency: "USD" },
        { price: "8", priceCurrency: "USD" }
      ]
    });
    expect(schemas[2]).toMatchObject({
      step: expect.arrayContaining([
        expect.objectContaining({ text: expect.any(String) })
      ])
    });
  });
});
