import { describe, expect, it } from "vitest";
import {
  alternateLanguagesForPath,
  defaultLocale,
  getLocaleFromSegments,
  localizePath,
  locales,
  stripLocaleFromSegments,
  toLocale
} from "./i18n";

describe("i18n routing", () => {
  it("keeps English as the unprefixed default locale", () => {
    expect(defaultLocale).toBe("en");
    expect(locales).toContain("zh-CN");
    expect(localizePath("/ai-makeup", "en")).toBe("/ai-makeup");
  });

  it("prefixes Simplified Chinese routes with zh-CN", () => {
    expect(localizePath("/ai-makeup", "zh-CN")).toBe("/zh-CN/ai-makeup");
    expect(localizePath("/", "zh-CN")).toBe("/zh-CN");
  });

  it("extracts locale and content segments from URL segments", () => {
    expect(getLocaleFromSegments(["zh-CN", "pricing"])).toBe("zh-CN");
    expect(getLocaleFromSegments(["pricing"])).toBe("en");
    expect(stripLocaleFromSegments(["zh-CN", "pricing"])).toEqual(["pricing"]);
  });

  it("generates hreflang alternates for localized SEO", () => {
    expect(alternateLanguagesForPath("/ai-makeup")).toEqual({
      en: "/ai-makeup",
      "zh-CN": "/zh-CN/ai-makeup"
    });
  });

  it("falls back unsupported locale input to English", () => {
    expect(toLocale("fr")).toBe("en");
    expect(toLocale("zh-CN")).toBe("zh-CN");
  });
});
