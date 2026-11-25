import { describe, expect, it } from "vitest";
import { platformHomepageMetadata, platformHomepageSchemas } from "./platform-homepage-seo";
import { platformRouteMetadata } from "@/components/platform-route-page";
import { pageSchemas } from "./seo";
import { getLandingPage } from "./content";
import { entryHref, footerCandidateEntries, platformEntries } from "./platform-navigation";
import sitemap from "@/app/sitemap";
import { metadata as homeEn } from "@/app/page";
import { metadata as homeZh } from "@/app/zh-CN/page";
import { generateMetadata as routeEn } from "@/app/(marketing)/[...slug]/page";
import { generateMetadata as routeZh } from "@/app/zh-CN/[...slug]/page";
import { metadata as imageToImageEn } from "@/app/(marketing)/tools/image-to-image-ai/page";
import { metadata as imageToImageZh } from "@/app/zh-CN/tools/image-to-image-ai/page";

describe("FrameKoi品牌与搜索身份", () => {
  it("首页使用单一品牌且不再承诺旧套餐", () => {
    const m = platformHomepageMetadata("en");
    expect(JSON.stringify(m)).toContain("FrameKoi");
    expect(m.description).not.toMatch(/3 makeup|three free|\$8/i);
    expect(platformHomepageSchemas("en")[0]).toMatchObject({ name: "FrameKoi" });
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
      expect(m.openGraph).toMatchObject({ siteName: "FrameKoi", locale: "zh_CN", images: [{ url: "/opengraph-image" }] });
      expect(JSON.stringify(m.title)).not.toMatch(/FrameKoi/);
    }
  });
  it.each([
    ["en", homeEn, routeEn, imageToImageEn, /available modes/i],
    ["zh-CN", homeZh, routeZh, imageToImageZh, /可用模式/],
  ] as const)("%s 真实路由搜索和分享摘要指向当前可用模式", async (locale, home, route, imageToImage, hint) => {
    const resolve = (slug: string[], mode?: string) => route({ params: Promise.resolve({ slug }), searchParams: Promise.resolve({ mode }) });
    const workspace = await resolve(["home"]);
    const image = await resolve(["ai-image-generator"], "text-to-image");
    const video = await resolve(["ai-video-generator"], "text-to-video");
    expect(await resolve(["ai-image-generator"], "image-to-image")).toEqual(image);
    expect(await resolve(["ai-video-generator"], "image-to-video")).toEqual(video);
    for (const metadata of [home, workspace, image, video]) {
      expect.soft(metadata.description).toMatch(hint);
      expect.soft(metadata.description).not.toMatch(/尚未开放|not open yet/i);
      expect(metadata.openGraph?.description).toBe(metadata.description);
      expect(metadata.twitter?.description).toBe(metadata.description);
    }
    const [website] = platformHomepageSchemas(locale);
    expect(website).toMatchObject({ "@type": "WebSite", inLanguage: locale, description: home.description });
    expect(workspace.robots).toEqual({ index: false, follow: true });
    expect(workspace.alternates?.canonical).toMatch(locale === "en" ? /\/home$/ : /\/zh-CN\/home$/);
    const previewStatus = locale === "en" ? /not (available|open) yet/i : /尚未开放/;
    const nano = await resolve(["ai-image-models", "nano-banana-pro"]);
    expect(nano.description).toMatch(previewStatus);
    expect(imageToImage.description).toMatch(previewStatus);
    expect(imageToImage.openGraph?.description).toBe(imageToImage.description);
    expect(imageToImage.twitter?.description).toBe(imageToImage.description);
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
  it("站点地图登记两组正式视频特效资料页及对应语言互链", () => {
    const entries = sitemap();
    const paths = ["/video-effects/earth-zoom-out", "/video-effects/ai-angel-video-generator"];
    for (const path of paths) {
      for (const localized of [path, `/zh-CN${path}`]) expect(entries.some(item => new URL(item.url).pathname === localized)).toBe(true);
      const english = entries.find(item => new URL(item.url).pathname === path);
      const languages = english?.alternates?.languages ?? {};
      expect(languages).toMatchObject({ en: expect.stringContaining(path), "zh-CN": expect.stringContaining(`/zh-CN${path}`) });
      expect(languages["x-default"]).toContain(path);
      expect(entries.some(item => new URL(item.url).pathname === `/zh${path}`)).toBe(false);
    }
  });
  it("站点地图延续双语索引策略，保留三项真实政策并排除全部占位与缺失入口", () => {
    const indexed = new Set(sitemap().map(({ url }) => `${new URL(url).pathname}${new URL(url).search}`));
    for (const locale of ["en", "zh-CN"] as const) {
      for (const entry of [...platformEntries, ...footerCandidateEntries]) {
        if (entry.status !== "ready") {
          expect(indexed.has(entryHref(entry, locale).split("#")[0]), entry.id).toBe(false);
        }
      }
      const prefix = locale === "zh-CN" ? "/zh-CN" : "";
      for (const path of ["/about", "/refund", "/content-moderation-policy", "/explore", "/ai-video-editor"]) {
        expect(indexed.has(prefix + path)).toBe(true);
      }
    }
  });
});
