import { describe, expect, it } from "vitest";
import { platformEntries, platformEntry, entryHref, publicPlatformHref } from "./platform-navigation";
import { platformSearchQuery, resolveHomepageRoute } from "./platform-homepage";
import { imageEditContent, imageEditPaths, imageEditPath, imageEditPrompt, resolveImageEditOption } from "./platform-image-edit-data";
import sitemap from "@/app/sitemap";

describe("图片编辑入口", () => {
  it("已实现的图片工具均登记，未知路由仍不匹配", () => {
    expect(imageEditPaths).toHaveLength(10);
    for (const path of imageEditPaths) {
      expect(imageEditPath(path)).toBe(true);
      expect(resolveHomepageRoute(path)).toEqual({ kind: "image-edit", path });
      expect(platformEntries.find(entry => entry.pathname === path)?.status).toBe("ready");
    }
    expect(resolveHomepageRoute("/image-effects/missing-restoration")).toBeNull();
    expect(imageEditPath("/image-effects/missing-restoration")).toBe(false);
  });

  it("目录卡片、语言入口和站点地图都指向双语规范页", () => {
    expect(entryHref(platformEntry("image-styler"), "zh-CN")).toBe("/zh-CN/image-style-converter");
    expect(entryHref(platformEntry("old-photo-restoration"), "zh-CN")).toBe("/zh-CN/image-effects/old-photo-restoration");
    expect(publicPlatformHref("/zh/image-style-converter?tag=a&tag=b#generator", "en"))
      .toBe("/image-style-converter?tag=a&tag=b#generator");
    const urls = sitemap().map(page => page.url);
    for (const path of imageEditPaths) {
      expect(urls).toContain(`https://example.com${path}`);
      expect(urls).toContain(`https://example.com/zh-CN${path}`);
    }
    expect(urls).toContain("https://example.com/image-effects/paper-cutout-collage");
    expect(urls).toContain("https://example.com/zh-CN/image-effects/paper-cutout-collage");
    expect(urls.some(url => url.includes("/ai-south-park"))).toBe(false);
    expect(platformSearchQuery({ tag: ["a", "b"] }).toString()).toBe("tag=a&tag=b");
  });

  it("风格和修复操作产生不同的可核对提交提示词", () => {
    const style = imageEditContent[imageEditPaths[0]].options.find(option => option.id === "pixel")!;
    const repair = imageEditContent[imageEditPaths[1]].options.find(option => option.id === "repair")!;
    expect(imageEditPrompt(imageEditPaths[0], style, "en")).toContain("pixel clusters");
    expect(imageEditPrompt(imageEditPaths[1], repair, "zh-CN")).toContain("修补划痕与污渍");
    expect(resolveImageEditOption(imageEditPaths[0], new URLSearchParams("model=unknown"))).toBeNull();
    expect(resolveImageEditOption(imageEditPaths[0], new URLSearchParams("style=pixel&model=clay"))).toBeNull();
    expect(resolveImageEditOption(imageEditPaths[0], new URLSearchParams("model=ghibli-style"))?.id).toBe("storybook");
    expect(resolveImageEditOption(imageEditPaths[1], new URLSearchParams("operation=colorize"))?.id).toBe("colorize");
    expect(resolveImageEditOption(imageEditPaths[1], new URLSearchParams("model=nano-banana-pro"))).toBeNull();
    expect(resolveImageEditOption(imageEditPaths[1], new URLSearchParams("mode=text-to-image"))).toBeNull();
  });
});
