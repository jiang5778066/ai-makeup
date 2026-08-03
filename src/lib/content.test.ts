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

  it("describes only capabilities available in the paid beta", () => {
    const englishHome = getLandingPage("home", "en");
    const chineseHome = getLandingPage("home", "zh-CN");
    const englishAdvisor = getLandingPage("what-makeup-suits-my-face-ai", "en");
    const chineseAdvisor = getLandingPage("what-makeup-suits-my-face-ai", "zh-CN");
    const englishFreeAnswer = getLandingPage("ai-makeup", "en").faqs.find((faq) =>
      faq.question.includes("free")
    )?.answer;

    expect(englishHome.description).toContain("nine live makeup effects");
    expect(chineseHome.description).toContain("九种实时妆效");
    expect(englishAdvisor.description).toContain("compare multiple looks");
    expect(chineseAdvisor.description).toContain("比较多种妆容");
    expect(englishFreeAnswer).toContain("Sign in");
    expect(englishFreeAnswer).not.toContain("Guests");
  });
});
