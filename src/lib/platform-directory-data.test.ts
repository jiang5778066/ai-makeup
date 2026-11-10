import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { directoryCards, directoryContent, directoryEntry, directoryPaths } from "./platform-directory-data";
import { directoryMedia } from "./platform-directory-media";
import { entryHref, platformEntry } from "./platform-navigation";
import { resolveHomepageRoute } from "./platform-homepage";

const allCards = directoryPaths.flatMap(path => [...directoryCards(path), ...(directoryContent[path].sections?.flatMap(section => section.cards) ?? [])]);
describe("目录内容、精确目标与完成边界", () => {
  it("完整列表互不混用，视频模型保留三段5/2/8而非错误13张", () => {
    expect(directoryCards("/tools")).toHaveLength(28);
    expect(directoryCards("/video-effects")).toHaveLength(9);
    expect(directoryCards("/image-effects")).toHaveLength(12);
    expect(directoryCards("/ai-image-models")).toHaveLength(2);
    expect(directoryContent["/ai-video-models"].sections?.map(section => [section.id, section.cards.length])).toEqual([["models-wan", 5], ["models-kling", 2], ["models-other", 8]]);
    expect(allCards).toHaveLength(66);
    expect(new Set(allCards.map(card => card.mediaKey)).size).toBe(66);
  });
  it("所有观察卡可到达自己的本地正文或准确不可用外壳，四专用生成器与五Wan正文及目录ready，剩余目标仍准确scaffold", () => {
    for (const path of directoryPaths) expect(resolveHomepageRoute(path)).toEqual({ kind: "directory", path });
    for (const card of allCards) {
      const entry = directoryEntry(card);
      const generator = ["image-generator", "video-generator", "gpt-image", "nano-banana"].includes(entry.id);
      const wan = ["wan-2-2", "wan-2-5", "wan-2-6", "wan-3-0", "wan-fusionX"].includes(entry.id);
      const videoModel = ["kling-ai", "kling-3-0", "seedance", "happy-horse", "grok-imagine", "mindvideo-ai", "sora-2", "veo-3", "vheer"].includes(entry.id);
      const rootGenerator = ["cogvideox-video-generator", "hunyuan-video-lora", "hunyuanvideo-generator", "mochi1-video-generator"].includes(entry.id);
      const physicalPage = ["dance", "ai-album-cover-generator", "image-to-image-ai", "image-to-ghibli-style", "perchance-image-generator", "image-editor", "ai-image-combiner", "ai-image-merger", "ai-animal-generator", "ai-graffiti-generator", "ai-wallpaper-generator", "ai-youtube-banner-maker"].includes(entry.id);
      expect(entry.status).toBe(entry.id === "makeup" || physicalPage || generator || wan || videoModel || rootGenerator || entry.id === "dreamface-ai" ? "ready" : "scaffold");
      expect(entryHref(entry, "en")).toMatch(/^\/(?!\/)/);
      if (generator) expect(resolveHomepageRoute(entry.pathname, entry.query)).toMatchObject({ kind: "generator", path: entry.pathname });
      else if (wan) expect(resolveHomepageRoute(entry.pathname, entry.query)).toMatchObject({ kind: "wan", path: entry.pathname });
      else if (videoModel) expect(resolveHomepageRoute(entry.pathname, entry.query)).toMatchObject({ kind: "video-model", path: entry.pathname });
      else if (rootGenerator) expect(resolveHomepageRoute(entry.pathname, entry.query)).toMatchObject({ kind: "root-generator", path: entry.pathname });
      else if (entry.id === "dreamface-ai") expect(resolveHomepageRoute(entry.pathname, entry.query)).toEqual({ kind: "dreamface", path: entry.pathname });
      else if (physicalPage) {
        expect(resolveHomepageRoute(entry.pathname, entry.query)).toBeNull();
        expect(existsSync(`src/app/(marketing)${entry.pathname}/page.tsx`)).toBe(true);
        expect(existsSync(`src/app/zh-CN${entry.pathname}/page.tsx`)).toBe(true);
      }
      else if (entry.id !== "makeup") expect(resolveHomepageRoute(entry.pathname, entry.query)).toMatchObject({ kind: "scaffold", entry: { id: entry.id } });
    }
    expect(platformEntry("video-editor").status).toBe("pending");
    expect(resolveHomepageRoute("/ai-video-models/unknown")).toBeNull();
    expect(resolveHomepageRoute("/tools/ai-wallpaper-generator/unknown")).toBeNull();
  });
  it("模式、模型、模板和原始锚点序列化正确，不把Wan2.5借名映射到2.2", () => {
    const href = (id: string) => entryHref(directoryEntry(allCards.find(card => card.entryId === id)!), "zh-CN");
    expect(href("image-to-video")).toBe("/zh-CN/tools/ai-image-to-video?mode=image-to-video");
    expect(href("text-to-video")).toBe("/zh-CN/tools/ai-text-to-video?mode=text-to-video");
    expect(href("template-1200")).toBe("/zh-CN/video-effects/lab?template_id=1200");
    expect(href("template-508")).toBe("/zh-CN/video-effects/lab?template_id=508");
    expect(href("ai-french-kiss-video-generator")).toBe("/zh-CN/video-effects/ai-french-kiss-video-generator#generator");
    expect(href("ai-kissing-video-generator")).toMatch(/#generator$/);
    expect(href("lip-sync")).not.toContain("#");
    expect(href("wan-2-5")).toBe("/zh-CN/ai-video-models/wan-2-5?model=wan-2-5");
    expect(href("wan-fusionX")).toBe("/zh-CN/ai-video-models/wan-fusionX?model=wan-fusionX");
    expect(href("mindvideo-ai")).toBe("/zh-CN/ai-video-models/mindvideo-ai?model=wan-3-0");
    expect(href("sora-2")).toBe("/zh-CN/ai-video-models/sora-2");
    expect(href("veo-3")).toBe("/zh-CN/ai-video-models/veo-3?model=veo-3-1-fast");
    expect(href("vheer")).toBe("/zh-CN/ai-video-models/vheer?model=lanta-2-1");
    expect(href("dreamface-ai")).toBe("/zh-CN/ai-video-models/dreamface-ai");
    expect(href("gpt-image")).toBe("/zh-CN/ai-image-models/gpt-image-2?model=gpt-image-2");
  });
  it("每卡展示精确本地媒体，静态特效不伪装成可拖动对比或视频", () => {
    for (const card of allCards) {
      const media = directoryMedia[card.mediaKey];
      expect(media.poster).toMatch(/^\/platform\/directories\//);
      expect(existsSync(`public${media.poster}`)).toBe(true);
      if (media.src) expect(existsSync(`public${media.src}`)).toBe(true);
    }
    expect(directoryMedia["image-effects-01"].src).toBeUndefined();
    expect(directoryMedia["video-effects-01"].src).toBe("/platform/directories/video-effects-01.mp4");
    expect(directoryMedia["tools-01"].poster).toBe("/platform/directories/tools-01.webp");
  });
});
