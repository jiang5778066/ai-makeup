import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { rootGeneratorPages, type RootGeneratorPage } from "./platform-root-generator-data";
import { rootGeneratorAssets } from "./platform-root-generator-media";
import { changeGeneratorModel, generatorConfig, initializeGenerator } from "./platform-generator-parameters";

describe("四根介绍页的内容与真实能力边界", () => {
  it("简洁介绍、风格库和长功能页具有不同结构，不冒充通用工作台", () => {
    const cog = rootGeneratorPages["/cogvideox-video-generator"];
    const mochi = rootGeneratorPages["/mochi1-video-generator"];
    const lora = rootGeneratorPages["/hunyuan-video-lora"];
    const hunyuan = rootGeneratorPages["/hunyuanvideo-generator"];
    expect(cog.bullets).toHaveLength(3); expect(cog.meet.paragraphs).toHaveLength(2); expect(cog.faq).toHaveLength(0);
    expect(mochi.meet.paragraphs).toHaveLength(3); expect(mochi.faq).toHaveLength(0);
    expect(lora.cards.map(card => card.title.en)).toEqual(["AnimeShots", "Ghibli", "Pixelated retro", "Makoto Shinkai", "Rem (Re:Zero)", "Walking Animation", "This Is Fine", "Detailed Skin"]);
    expect(lora.steps).toHaveLength(3); expect(lora.faq).toHaveLength(5);
    expect(hunyuan.features).toHaveLength(7); expect(hunyuan.steps).toHaveLength(3); expect(hunyuan.faq).toHaveLength(5); expect(hunyuan.meet.paragraphs).toHaveLength(3);
    expect(hunyuan.faq[4].answer.en).toMatch(/encrypted and securely stored/);
    expect(cog.meet.paragraphs[1].en).toMatch(/Apache 2.0/);
  });
  it("准确CTA保留未知102；只有用户主动选择才进入合法型号参数", () => {
    expect(rootGeneratorPages["/cogvideox-video-generator"].cta.href).toBe("/ai-video-generator?tab=image");
    expect(rootGeneratorPages["/hunyuan-video-lora"].cta.href).toBe("/ai-video-generator");
    expect(rootGeneratorPages["/hunyuanvideo-generator"].cta.href).toBe("/ai-video-generator");
    const query = new URL(rootGeneratorPages["/mochi1-video-generator"].cta.href, "https://local.invalid").search;
    const state = initializeGenerator("/ai-video-generator", query);
    expect(state.model).toBe("102"); expect(state.mode).toBe("text"); expect(state.issues).toContain("unknown-model"); expect(state.parameters).toEqual({}); expect(generatorConfig(state)).toBeUndefined();
    const selected = changeGeneratorModel(state, "wan-3-0");
    expect(selected.model).toBe("wan-3-0"); expect(selected.issues).not.toContain("unknown-model"); expect(generatorConfig(selected)).toBeDefined();
  });
  it("双语段落与每个消费者有准确素材登记，缺件不会热链或以其它源代替", () => {
    const assets = new Map(rootGeneratorAssets.map(asset => [asset.source, asset]));
    expect(assets.size).toBe(41); expect(rootGeneratorAssets.filter(a => a.kind === "video")).toHaveLength(18);
    for (const page of Object.values(rootGeneratorPages) as RootGeneratorPage[]) {
      const texts = [page.title, ...page.faq.flatMap(f => [f.question, f.answer]), ...(page.bullets ?? []), ...(page.meet?.paragraphs ?? []), ...(page.cards ?? []).flatMap(c => [c.title, c.text]), ...(page.features ?? []).flatMap(c => [c.title, c.text])];
      for (const text of texts) { expect(text.en.length).toBeGreaterThan(0); expect(text["zh-CN"].length).toBeGreaterThan(0); }
      const media = [page.hero, ...(page.cards ?? []).map(c => c.media), ...(page.steps ?? []).map(c => c.media), ...(page.features ?? []).map(c => c.media)].filter(x => x !== undefined);
      for (const item of media) { expect(assets.has(item.source)).toBe(true); if (item.poster) expect(assets.has(item.poster)).toBe(true); }
    }
    for (const asset of rootGeneratorAssets) if (asset.local) {
      expect(asset.local).toMatch(/^\/platform\/root-generators\//);
      expect(readFileSync(`public${asset.local}`).length).toBeGreaterThan(100);
    }
    const lora = rootGeneratorPages["/hunyuan-video-lora"];
    expect(lora.cards.every(card => card.media.displayRatio === "16 / 9")).toBe(true);
    expect(lora.cards[2].media.width / lora.cards[2].media.height).toBeCloseTo(4 / 3);
    expect(lora.steps[2].media.source).toBe(lora.cards[2].media.source);
  });
});
