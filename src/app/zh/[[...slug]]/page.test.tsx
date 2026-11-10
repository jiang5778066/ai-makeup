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
  it("未知兼容路径保持404", async () => {
    await expect(ChineseCompatibilityPage({ params: Promise.resolve({ slug: ["unknown"] }), searchParams: Promise.resolve({}) })).rejects.toThrow("404");
  });
});
