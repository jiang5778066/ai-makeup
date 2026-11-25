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
    expect(screen.getByRole("heading", { name: "亲吻场景" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /亲吻场景/ })).toHaveAttribute("href", "/zh-CN/tools/ai-kissing-video-generator#generator");
    for (const [label, path, image] of [
      ["地球拉远", "/video-effects/earth-zoom-out", "/platform/directories/framekoi-earth-zoom-out.webp"],
      ["AI 天使翅膀", "/video-effects/ai-angel-video-generator", "/platform/directories/framekoi-ai-angel-wings.webp"],
    ]) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", `/zh-CN${path}`);
      expect(link.parentElement?.querySelector("img")).toHaveAttribute("src", image);
      expect(link.parentElement).toHaveTextContent("FrameKoi 示意图");
      expect(link).toHaveAccessibleDescription("分镜与提示词资料页。专用生成尚未验证。");
      expect(link.parentElement?.querySelector("video")).toBeNull();
    }
    expect(screen.getByRole("link", { name: "查看全部视频特效" })).toHaveAttribute("href", "/zh-CN/video-effects");
    const images = screen.getByRole("tab", { name: "图片特效" });
    fireEvent.click(images);
    expect(screen.queryByRole("heading", { name: "亲吻场景" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /老照片修复/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "老照片修复" })).toHaveAttribute("href", "/zh-CN/image-effects/old-photo-restoration");
    expect(screen.getByRole("link", { name: "图像风格转换器" })).toHaveAttribute("href", "/zh-CN/image-style-converter");
    expect(screen.getByRole("heading", { name: "AI 发型更换" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "AI 发型更换" })).toHaveAttribute("href", "/zh-CN/image-effects/ai-hair-style-changer");
    expect(screen.getAllByText("FrameKoi 示意图")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "查看全部图片特效" })).toHaveAttribute("href", "/zh-CN/image-effects");
    fireEvent.keyDown(images, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "视频特效" })).toHaveFocus();
  });
  it("英文首页两张已启用图片卡使用本地示意和各自的实链", () => {
    const { container } = render(<HomepageEffects locale="en" />);
    fireEvent.click(screen.getByRole("tab", { name: /image effects/i }));
    for (const [label, path, poster] of [
      ["Old Photo Restoration", "/image-effects/old-photo-restoration", "photo-restoration"],
      ["Image Style Converter", "/image-style-converter", "image-style"],
    ]) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", path);
      expect(link.parentElement?.querySelector("img")).toHaveAttribute("src", `/platform/directories/framekoi-${poster}-illustration.webp`);
      expect(link.parentElement).toHaveTextContent("FrameKoi illustration");
    }
    expect(container.querySelector('img[src*="3ebc265f39999230"], img[src*="a40193c2818693a7"]')).toBeNull();
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
    const button = screen.getByRole("button", { name: "FrameKoi 可以免费使用吗？" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/购买尚未开放；生成需使用已开放模式/)).toBeVisible();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
