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


describe("免费预览与风格建议的真实说明", () => {
  it.each(["en", "zh-CN"] as const)("%s 区分本地预览和登录生成额度", (locale) => {
    const page = getLandingPage("ai-makeup", locale);
    const faq = page.faqs.find((faq) => /free|免费/.test(faq.question))!;
    expect(faq.answer).toMatch(locale === "en" ? /local.*preview/i : /本地.*预览/);
    expect(faq.answer).toMatch(locale === "en" ? /sign.*in/i : /登录/);
    expect(faq.answer).not.toMatch(/Guests can try a limited number of generations|游客可获得有限试用次数/);
  });
  it.each(["en", "zh-CN"] as const)("%s 顾问说明不宣称照片个性化分析", (locale) => {
    const page = getLandingPage("what-makeup-suits-my-face-ai", locale);
    expect(page.description).toMatch(locale === "en" ? /general style/i : /通用风格/);
    expect(page.description).toMatch(locale === "en" ? /not.*analy/i : /并非.*分析/);
    expect(page.primaryCta).not.toMatch(/Analyze|分析/);
  });
});
