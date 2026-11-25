import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FirstVideoEffectPage, firstVideoEffectMetadata } from "./first-video-effects-page";

describe("首批视频特效资料页", () => {
  it.each([
    ["earth-zoom-out", "en", "Earth Zoom Out", "/video-effects/earth-zoom-out"],
    ["earth-zoom-out", "zh-CN", "地球拉远", "/zh-CN/video-effects/earth-zoom-out"],
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
});
