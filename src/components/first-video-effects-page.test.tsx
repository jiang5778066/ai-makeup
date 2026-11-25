import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FirstVideoEffectPage, firstVideoEffectMetadata } from "./first-video-effects-page";

describe("首批视频特效资料页", () => {
  it.each([
    ["ai-angel-video-generator", "en", "AI Angel Wings", "/video-effects/ai-angel-video-generator"],
    ["ai-angel-video-generator", "zh-CN", "AI 天使翅膀", "/zh-CN/video-effects/ai-angel-video-generator"]
  ] as const)("渲染 %s 的 %s 页面", (id, locale, title, canonical) => {
    render(<FirstVideoEffectPage id={id} locale={locale}/>);
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeTruthy();
    expect(screen.getByRole("link", { name: /general image-to-video entry|通用图生视频入口/ })).toHaveAttribute("href", expect.stringMatching(/mode=image-to-video&model=grok-imagine$/));
    expect(screen.getByText(/1 second at 480p|1 秒、480p/)).toBeTruthy();
    expect(screen.getByText(/Shot framing sketch|镜头构图示意/)).toBeVisible();
    expect(firstVideoEffectMetadata(id, locale).alternates).toMatchObject({ canonical: expect.stringContaining(canonical) });
  });
  it.each([
    ["en", "Earth Zoom Out Prompt and Storyboard", "Three shots from the coast to orbit", "Copy sample prompt", "Video clip preview", "Landscape to portrait preview", "View image-to-video settings", ""],
    ["zh-CN", "地球拉远提示词与三段分镜", "从海岸到地球轨道的三段分镜", "复制示例提示词", "视频选段预览", "横屏转竖屏预览", "查看图生视频参数", "/zh-CN"],
  ] as const)("渲染 %s 的地球拉远教程", (locale, title, storyboard, copy, clip, crop, generator, prefix) => {
    render(<FirstVideoEffectPage id="earth-zoom-out" locale={locale}/>);
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: storyboard })).toBeVisible();
    expect(screen.getAllByRole("button", { name: copy })).toHaveLength(3);
    expect(screen.getByText(/Generation is currently unavailable|生成服务暂未开放/)).toBeVisible();
    expect(screen.getByRole("link", { name: clip })).toHaveAttribute("href", `${prefix}/ai-video-editor`);
    expect(screen.getByRole("link", { name: crop })).toHaveAttribute("href", `${prefix}/tools/landscape-to-portrait-video-converter-ai`);
    expect(screen.getByRole("link", { name: generator })).toHaveAttribute("href", `${prefix}/tools/ai-image-to-video`);
    expect(firstVideoEffectMetadata("earth-zoom-out", locale)).toMatchObject({
      title,
      alternates: { canonical: expect.stringContaining(`${prefix}/video-effects/earth-zoom-out`) },
    });
  });
});
