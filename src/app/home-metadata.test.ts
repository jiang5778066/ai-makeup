import type { Metadata } from "next";
import { describe, expect, it } from "vitest";

describe("localized home metadata", () => {
  it("exports canonical and language alternates for both home routes", async () => {
    const englishModule = (await import("./page")) as { metadata?: Metadata };
    const chineseModule = (await import("./zh-CN/page")) as { metadata?: Metadata };

    expect(englishModule.metadata?.alternates?.canonical).toBe("https://example.com/");
    expect(englishModule.metadata?.alternates?.languages).toMatchObject({
      en: "https://example.com/",
      "zh-CN": "https://example.com/zh-CN",
      "x-default": "https://example.com/"
    });
    expect(chineseModule.metadata?.alternates?.canonical).toBe("https://example.com/zh-CN");
  });
});
