import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomepageEffects, HomepageFaq, HomepageScenes } from "./platform-homepage-interactions";

describe("首页确定性交互", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", class {
      observe() {}
      disconnect() {}
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("特效tab切换替换卡片内容，方向键切换并移动焦点", () => {
    render(<HomepageEffects locale="zh-CN" />);
    expect(screen.getByRole("link", { name: /AI接吻视频生成器/ })).toBeInTheDocument();
    const images = screen.getByRole("tab", { name: "图片特效" });
    fireEvent.click(images);
    expect(screen.queryByRole("link", { name: /AI接吻视频生成器/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /老照片修复/ })).toHaveAttribute("href", "/zh-CN/image-effects/old-photo-restoration");
    fireEvent.keyDown(images, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "视频特效" })).toHaveFocus();
  });
  it("场景选择替换标题、媒体与CTA语义", () => {
    render(<HomepageScenes locale="zh-CN" />);
    const before = screen.getByRole("img").getAttribute("src");
    fireEvent.click(screen.getByRole("button", { name: "产品" }));
    expect(screen.getByRole("heading", { name: "产品与电商" })).toBeInTheDocument();
    expect(screen.getByRole("img").getAttribute("src")).not.toBe(before);
    expect(screen.getByRole("link", { name: /创建产品视频/ })).toHaveAttribute("href", "/zh-CN/ai-video-generator?mode=image-to-video");
  });
  it("FAQ支持展开与收起，并说明报价确认和购买关闭", () => {
    render(<HomepageFaq locale="zh-CN" />);
    const button = screen.getByRole("button", { name: "PictoWink 可以免费使用吗？" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/购买尚未开放；生成需使用已开放模式/)).toBeVisible();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
