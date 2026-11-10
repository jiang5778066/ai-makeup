import { describe, expect, it } from "vitest";
import { entryHref, isEntryActive, platformEntries, platformEntry, switchPlatformLocale } from "./platform-navigation";

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
});
