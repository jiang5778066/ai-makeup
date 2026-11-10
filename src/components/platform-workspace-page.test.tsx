import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { PlatformWorkspacePage } from "./platform-workspace-page";

vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./platform-homepage-carousel", () => ({ HomepageCarousel: ({ children, title }: { children: ReactNode; title: string }) => <div>{title && <h2>{title}</h2>}{children}</div> }));
vi.mock("./platform-homepage-community", () => ({ HomepageCommunity: () => <div data-testid="community-examples">公开示例</div> }));
vi.mock("./platform-homepage-media", () => ({ HomepageVideo: () => <div/>, HomepageImageSequence: () => <div/> }));

describe("工作台展示入口", () => {
  it("社区说明保持真实，查看更多在作品之后并到达本地社区目标", () => {
    render(<PlatformWorkspacePage locale="zh-CN" currentPath="/home"/>);
    const section = screen.getByRole("heading", { name: "社区作品" }).closest("section")!;
    expect(within(section).getByText(/非本项目用户作品/)).toBeInTheDocument();
    const more = within(section).getByRole("link", { name: "查看更多" });
    expect(more).toHaveAttribute("href", "/zh-CN/explore");
    expect(within(section).getByTestId("community-examples").compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it("模型卡仍明确不可用并保留具体模型参数，四入口分别映射到本地工具", () => {
    const { container } = render(<PlatformWorkspacePage locale="en" currentPath="/home"/>);
    expect(screen.getByRole("link", { name: "Seedream 5.0 Pro" })).toHaveAttribute("href", "/ai-image-generator?model=seedream-5-0-pro#generator");
    expect(screen.getAllByText("Showcase · Unavailable").length).toBeGreaterThan(0);
    const primary = container.querySelector(".platform-workspace-primary")!;
    expect([...primary.querySelectorAll("a")].map(a => a.getAttribute("href"))).toEqual(["/ai-video-generator", "/ai-image-generator", "/video-effects", "/video-to-video"]);
  });
});
