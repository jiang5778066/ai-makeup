import { describe, expect, it, vi } from "vitest";
import ChineseCompatibilityPage from "./page";
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("404"); }, redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
describe("zh兼容入口", () => {
  it("首页/home和已知目标使用中文规范路径，完整保留重复参数", async () => {
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["home"] }), searchParams: Promise.resolve({ mode: "image-to-video", tag: ["a", "b"] }) })).rejects.toThrow("REDIRECT:/zh-CN/home?mode=image-to-video&tag=a&tag=b");
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({}), searchParams: Promise.resolve({}) })).rejects.toThrow("REDIRECT:/zh-CN");
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["ai-makeup"] }), searchParams: Promise.resolve({ style: "y2k" }) })).rejects.toThrow("REDIRECT:/zh-CN/ai-makeup?style=y2k");
  });
  it("模板兼容跳转按实际首个模板参数验证并保留重复值", async () => {
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["video-effects", "lab"] }), searchParams: Promise.resolve({ template_id: ["508", "1200"], tag: ["a", "b"] }) })).rejects.toThrow("REDIRECT:/zh-CN/video-effects/lab?template_id=508&template_id=1200&tag=a&tag=b");
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["video-effects", "lab"] }), searchParams: Promise.resolve({ template_id: "unknown" }) })).rejects.toThrow("404");
  });
  it("社区兼容路径保留重复查询，未知子路径仍为 404", async () => {
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["explore"] }), searchParams: Promise.resolve({ tag: ["a+b", "b"] }) })).rejects.toThrow("REDIRECT:/zh-CN/explore?tag=a%2Bb&tag=b");
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["explore", "unknown"] }), searchParams: Promise.resolve({}) })).rejects.toThrow("404");
  });
  it("视频编辑器兼容路径保留重复查询，未知子路径返回 404", async () => {
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["ai-video-editor"] }), searchParams: Promise.resolve({ tag: ["a", "b"] }) })).rejects.toThrow("REDIRECT:/zh-CN/ai-video-editor?tag=a&tag=b");
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["ai-video-editor", "unknown"] }), searchParams: Promise.resolve({}) })).rejects.toThrow("404");
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["tools", "landscape-to-portrait-video-converter-ai"] }), searchParams: Promise.resolve({ tag: ["a", "b"] }) })).rejects.toThrow("REDIRECT:/zh-CN/tools/landscape-to-portrait-video-converter-ai?tag=a&tag=b");
  });
  it("旧中文特效资料路径保留重复查询并使天使光环模板保持独立", async () => {
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["video-effects", "earth-zoom-out"] }), searchParams: Promise.resolve({ tag: ["one", "two"] }) })).rejects.toThrow("REDIRECT:/zh-CN/video-effects/earth-zoom-out?tag=one&tag=two");
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["video-effects", "ai-angel-video-generator"] }), searchParams: Promise.resolve({ tag: ["one", "two"] }) })).rejects.toThrow("REDIRECT:/zh-CN/video-effects/ai-angel-video-generator?tag=one&tag=two");
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["video-effects", "unknown-effect"] }), searchParams: Promise.resolve({}) })).rejects.toThrow("404");
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["video-effects", "lab"] }), searchParams: Promise.resolve({ template_id: "508" }) })).rejects.toThrow("REDIRECT:/zh-CN/video-effects/lab?template_id=508");
  });
  it("未知兼容路径保持404", async () => {
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["unknown"] }), searchParams: Promise.resolve({}) })).rejects.toThrow("404");
  });
  it.each([
    [["image-style-converter"], "image-style-converter"],
    [["image-effects", "old-photo-restoration"], "image-effects/old-photo-restoration"],
  ])("已实现的图片工具兼容跳转保留重复参数 %s", async (slug, path) => {
    await expect(ChineseCompatibilityPage({
      params: Promise.resolve({ slug }),
      searchParams: Promise.resolve({ tab: "image", tag: ["a+b", "b"] }),
    })).rejects.toThrow(`REDIRECT:/zh-CN/${path}?tab=image&tag=a%2Bb&tag=b`);
  });
});
