import { describe, expect, it } from "vitest";
import { platformHomepageMetadata, platformHomepageSchemas } from "./platform-homepage-seo";
import { platformRouteMetadata } from "@/components/platform-route-page";
import { pageSchemas } from "./seo";
import { getLandingPage } from "./content";
import sitemap from "@/app/sitemap";

describe("PictoWink品牌与搜索身份", () => {
  it("首页使用单一品牌且不再承诺旧套餐", () => {
    const m = platformHomepageMetadata("en");
    expect(JSON.stringify(m)).toContain("PictoWink");
    expect(m.description).not.toMatch(/3 makeup|three free|\$8/i);
    expect(platformHomepageSchemas("en")[0]).toMatchObject({ name: "PictoWink" });
    expect(platformHomepageMetadata("zh-CN").openGraph).toMatchObject({ locale: "zh_CN" });
  });
  it("工作台可访问但不作为获客页索引", () => {
    expect(platformHomepageMetadata("en", true).robots).toEqual({ index: false, follow: true });
    expect(sitemap().map(x => new URL(x.url).pathname)).not.toContain("/home");
  });
  it("两个核心生成页去重品牌并保留双语搜索路径", () => {
    for (const path of ["/ai-image-generator", "/ai-video-generator"]) {
      const m = platformRouteMetadata(path, "zh-CN");
      expect(m.alternates?.canonical).toBe(`/zh-CN${path}`);
      expect(m.alternates?.languages).toMatchObject({ en: path, "zh-CN": `/zh-CN${path}`, "x-default": path });
      expect(m.openGraph).toMatchObject({ siteName: "PictoWink", locale: "zh_CN", images: [{ url: "/opengraph-image" }] });
      expect(JSON.stringify(m.title)).not.toMatch(/PictoWink/);
    }
  });
  it("不发布尚未验证的价格和免费生成结构化承诺", () => {
    const application = pageSchemas(getLandingPage("ai-makeup", "en"), "en", "/ai-makeup")[0];
    expect(application).not.toHaveProperty("offers");
    expect(application).not.toHaveProperty("isAccessibleForFree");
  });
  it("sitemap包括核心工具且不用虚构更新时间", () => {
    const entries = sitemap();
    for (const path of ["/", "/ai-image-generator", "/ai-video-generator", "/tools/image-to-image-ai", "/zh-CN/ai-video-generator"]) {
      expect(entries.some(x => new URL(x.url).pathname === path)).toBe(true);
    }
    expect(entries.every(x => !x.lastModified)).toBe(true);
  });
});
