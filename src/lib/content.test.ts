import { describe, expect, it } from "vitest";
import { getLandingPage, getStyleLibrary, landingSlugs } from "./content";

describe("localized content model", () => {
  it("includes the primary SEO landing pages for English and Chinese", () => {
    expect(landingSlugs).toContain("ai-makeup");
    expect(getLandingPage("ai-makeup", "en").title).toMatch(/AI Makeup/i);
    expect(getLandingPage("ai-makeup", "zh-CN").title).toContain("AI");
  });

  it("keeps style libraries localized while preserving stable ids", () => {
    const english = getStyleLibrary("en");
    const chinese = getStyleLibrary("zh-CN");

    expect(english.map((style) => style.id)).toEqual(chinese.map((style) => style.id));
    expect(english).toHaveLength(12);
    expect(chinese.find((style) => style.id === "douyin")?.name).toContain("Douyin");
  });
});
