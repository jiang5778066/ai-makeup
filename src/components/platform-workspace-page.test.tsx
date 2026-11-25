import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { PlatformWorkspacePage } from "./platform-workspace-page";
import { PlatformLandingPage } from "./platform-landing-page";

vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./platform-homepage-carousel", () => ({ HomepageCarousel: ({ children, title }: { children: ReactNode; title: string }) => <div>{title && <h2>{title}</h2>}{children}</div> }));
vi.mock("./platform-homepage-media", () => ({ HomepageVideo: () => <div/>, HomepageImageSequence: () => <div/> }));

describe("工作台展示入口", () => {
  it("宣传页保留工具和真实模式，示例使用所属目录入口", () => {
    render(<PlatformLandingPage locale="en" currentPath="/"/>);
    expect(screen.getByRole("link", { name: "AI Dance Generator" })).toHaveAttribute("href", "/ai-dance");
    expect(screen.getByRole("link", { name: "AI Image to Video" })).toHaveAttribute("href", "/ai-video-generator?mode=image-to-video");
    expect(screen.getByRole("link", { name: "AI Text to Video" })).toHaveAttribute("href", "/ai-video-generator?mode=text-to-video");
    expect(screen.getByRole("link", { name: "View all Video effects" })).toHaveAttribute("href", "/video-effects");
    expect(screen.getByRole("link", { name: "Explore community" })).toHaveAttribute("href", "/explore");
    expect(document.querySelector('a[href="/video-to-video"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="/tools/ai-image-to-video"]')).not.toBeInTheDocument();
  });
  it("保留公开创作参考及通用社区入口，并让地球拉远资料卡可达", () => {
    render(<PlatformWorkspacePage locale="zh-CN" currentPath="/home"/>);
    const section = screen.getByRole("heading", { name: "创作参考" }).closest("section")!;
    expect(within(section).getAllByRole("img")).toHaveLength(20);
    const links = within(section).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent("浏览社区");
    expect(links[0]).toHaveAttribute("href", "/zh-CN/explore");
    expect(screen.getByRole("heading", { name: "视频特效资料" })).toBeInTheDocument();
    const earthCard = screen.getByRole("link", { name: "地球拉远" });
    expect(earthCard).toHaveAttribute("href", "/zh-CN/video-effects/earth-zoom-out");
    expect(earthCard.parentElement?.querySelector("img")).toHaveAttribute("src", "/platform/directories/framekoi-earth-zoom-out.webp");
    expect(earthCard.parentElement).toHaveTextContent("FrameKoi 示意图");
    expect(earthCard).toHaveAccessibleDescription("分镜与提示词资料页。专用生成尚未验证。");
    expect(screen.getByRole("link", { name: "AI图像编辑器" })).toHaveAttribute("href", "/zh-CN/tools/icedit-ai-image-editor#create");
  });
  it("模型卡仍明确不可用并保留具体模型参数，四入口分别映射到本地工具", () => {
    const { container } = render(<PlatformWorkspacePage locale="en" currentPath="/home"/>);
    const seedream = screen.getByRole("link", { name: "Seedream 5.0 Pro" });
    expect(seedream).toHaveAttribute("href", "/ai-image-generator?model=seedream-5-0-pro#generator");
    expect(seedream.closest("[data-preview-card]")).toHaveTextContent("Settings preview · Generation unavailable");
    const primary = container.querySelector(".platform-workspace-primary")!;
    expect([...primary.querySelectorAll("a")].map(a => a.getAttribute("href"))).toEqual(["/ai-video-generator", "/ai-image-generator", "/video-effects", "/image-effects"]);
  });
});
