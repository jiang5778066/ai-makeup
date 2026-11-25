import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { slugFromPath } from "./content";
import { resolveHomepageRoute } from "./platform-homepage";
import { entryHref, featureGroups, footerCandidateEntries, footerGroups, isEntryActive, platformEntries, platformEntry, primaryEntryIds, publicPlatformEntry, publicPlatformHref, sidebarGroups, switchPlatformLocale } from "./platform-navigation";

describe("平台入口与语言", () => {
  it("保留模板参数和专用锚点，不替换成美妆入口", () => {
    expect(entryHref(platformEntry("template-1200"), "zh-CN")).toBe("/zh-CN/video-effects/lab?template_id=1200");
    expect(entryHref(platformEntry("template-508"), "en")).toBe("/video-effects/lab?template_id=508");
    expect(entryHref(platformEntry("character-animation"), "zh-CN")).toBe("/zh-CN/tools/character-animation#generator");
    expect(entryHref(platformEntry("image-editor"), "en")).toBe("/tools/icedit-ai-image-editor#create");
  });
  it("图片和视频模式各有正确入口，模型保持其身份", () => {
    expect(platformEntry("text-to-video").mode).toBe("text-to-video");
    expect(entryHref(platformEntry("text-to-video"), "en")).toBe("/tools/ai-text-to-video");
    expect(platformEntry("image-to-video").mode).toBe("image-to-video");
    expect(entryHref(platformEntry("gpt-image"), "en")).toBe("/ai-image-models/gpt-image-2");
    expect(entryHref(platformEntry("video-generator"), "en")).toBe("/ai-video-generator");
    expect(platformEntries.filter((entry) => entry.referencePath)).toHaveLength(77);
    expect(new Set(platformEntries.map((entry) => entry.id)).size).toBe(platformEntries.length);
  });
  it("仅高亮当前路径及匹配模板，避免后缀误选", () => {
    expect(isEntryActive(platformEntry("makeup"), "/zh-CN/ai-makeup?style=y2k#try")).toBe(true);
    expect(isEntryActive(platformEntry("makeup"), "/other/ai-makeup")).toBe(false);
    expect(isEntryActive(platformEntry("home"), "/")).toBe(false);
    expect(isEntryActive(platformEntry("template-508"), "/video-effects/lab?template_id=1200")).toBe(false);
    expect(isEntryActive(platformEntry("template-1200"), "/zh/video-effects/lab?template_id=1200#generator")).toBe(true);
    expect(isEntryActive(platformEntry("price"), "/zh-CN/pricing")).toBe(true);
    expect(isEntryActive(platformEntry("price"), "/zh/price")).toBe(true);
  });
  it("语言切换移除旧前缀，完整保留参数和锚点", () => {
    expect(switchPlatformLocale("/zh-CN/ai-makeup?style=cat%20eye#try", "en")).toBe("/ai-makeup?style=cat%20eye#try");
    expect(switchPlatformLocale("/zh/video-effects/lab?template_id=508#generator", "zh-CN")).toBe("/zh-CN/video-effects/lab?template_id=508#generator");
    expect(switchPlatformLocale("/", "zh-CN")).toBe("/zh-CN");
    expect(switchPlatformLocale("/login?next=%2Fzh-CN%2Fai-makeup%23try", "zh-CN")).toBe("/login?next=%2Fzh-CN%2Fai-makeup%23try");
    expect(entryHref(platformEntry("creations"), "zh-CN")).toBe("/zh-CN/my-creations");
  });
  it("共享候选仅开放有正文的双语目标，目录中的占位路由仍有独立身份", () => {
    const candidates = [
      ...primaryEntryIds,
      ...sidebarGroups.flatMap(({ ids }) => [...ids]),
      ...featureGroups.flatMap(({ ids }) => [...ids]),
      ...footerGroups.flatMap(({ items }) => items.map(({ id }) => id)),
    ];
    const nonReady = new Set(candidates.filter((id) => !publicPlatformEntry(id)));
    expect(nonReady).toEqual(new Set([
      "guides", "image-video-guide", "image-guide", "blog",
    ]));
    expect(publicPlatformEntry("image-to-video")?.pathname).toBe("/tools/ai-image-to-video");
    expect(publicPlatformEntry("text-to-video")?.pathname).toBe("/tools/ai-text-to-video");
    for (const entry of [...platformEntries, ...footerCandidateEntries]) {
      const { pathname, query } = entry;
      const route = resolveHomepageRoute(pathname, query);
      const sourcePath = pathname === "/" ? "" : pathname;
      const staticPages = (existsSync(`src/app${sourcePath}/page.tsx`) || existsSync(`src/app/(marketing)${sourcePath}/page.tsx`))
        && existsSync(`src/app/zh-CN${sourcePath}/page.tsx`);
      const substantive = route ? route.kind !== "scaffold" : staticPages || slugFromPath(pathname) !== null;
      expect(Boolean(publicPlatformEntry(entry.id)), entry.id).toBe(substantive);
      if (entry.status === "scaffold") expect(route, entry.id).toMatchObject({ kind: "scaffold", entry: { id: entry.id } });
    }
    expect(existsSync("src/app/login/page.tsx")).toBe(true);
  });
  it("内容推荐按登记目标筛选，保留别名、双语、重复查询及锚点", () => {
    expect(publicPlatformHref("/zh/price?tag=a&tag=b#plans", "en")).toBe("/pricing?tag=a&tag=b#plans");
    expect(publicPlatformHref("/tools/icedit-ai-image-editor", "zh-CN")).toBe("/zh-CN/tools/icedit-ai-image-editor#create");
    expect(publicPlatformHref("/ai-video-editor", "zh-CN")).toBe("/zh-CN/ai-video-editor");
    expect(publicPlatformHref("/ai-video-generator?mode=text-to-video#generator", "zh-CN")).toBe("/zh-CN/ai-video-generator?mode=text-to-video#generator");
    for (const href of ["", "#generator", "/unknown", "/zh-CN/guides", "/zh/video-effects/lab?template_id=508", "https://example.com/tools", "//example.com/tools"]) {
      expect(publicPlatformHref(href, "en"), href).toBeUndefined();
    }
  });
});
