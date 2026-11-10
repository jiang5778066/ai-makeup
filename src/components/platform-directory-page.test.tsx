import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformDirectoryPage } from "./platform-directory-page";
vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./platform-homepage-media", () => ({ HomepageVideo: ({ poster, src, trigger }: { poster: string; src: string; trigger: string }) => <div data-trigger={trigger}><video poster={poster} data-src={src}/><button type="button">播放展示视频</button></div> }));
afterEach(cleanup);
describe("目录真实正文与可访问交互", () => {
  it("DreamFace双语介绍保留功能身份并明确尚未开放，不引导到竞品或承诺本项目可生成", () => {
    for (const locale of ["en", "zh-CN"] as const) {
      const view = render(<PlatformDirectoryPage path="/ai-video-models" locale={locale}/>);
      const card = view.container.querySelector('[data-directory-card="dreamface-ai"]')!;
      const description = card.querySelector("p")!.textContent!;
      expect(description).toContain("DreamFace");
      expect(description).toMatch(locale === "en" ? /talking photos and character animation/ : /照片说话与角色动画/);
      expect(description).toMatch(locale === "en" ? /not available in this project/ : /本项目暂未提供该模型生成/);
      expect(description).not.toMatch(/Lanta AI|create videos on|使用.*创作视频/i);
      expect(card.querySelector("a")).toHaveAttribute("href", `${locale === "en" ? "" : "/zh-CN"}/ai-video-models/dreamface-ai`);
      expect(card.querySelector(".platform-directory-unavailable")).toHaveTextContent(locale === "en" ? "Generation not available yet" : "生成暂不可用");
      view.unmount();
    }
  });
  it("两种特效各有自己的完整内容，链接与播放按钮并列", () => {
    const { container, unmount } = render(<PlatformDirectoryPage path="/video-effects" locale="zh-CN"/>);
    expect(screen.getByRole("heading", { level: 1, name: "探索视频特效" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-directory-card]")).toHaveLength(9);
    expect(container.querySelectorAll("a button")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "圣诞爱心" })).toHaveAttribute("href", "/zh-CN/video-effects/lab?template_id=1200");
    expect(screen.getByRole("link", { name: "AI 天使光环" })).toHaveAttribute("href", "/zh-CN/video-effects/lab?template_id=508");
    unmount(); render(<PlatformDirectoryPage path="/image-effects" locale="en"/>);
    expect(screen.getByRole("heading", { name: "Explore Image Effects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "AI Hair Style Changer" })).toHaveAttribute("href", "/image-effects/ai-hair-style-changer");
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
  it("视频模型段落锚点与标题对应，中文内容和15个准确模型各自保留", () => {
    const { container } = render(<PlatformDirectoryPage path="/ai-video-models" locale="zh-CN"/>);
    expect(screen.getByRole("navigation", { name: "模型分类" })).toBeInTheDocument();
    for (const [name, id] of [["探索 Wan 模型", "models-wan"], ["探索 Kling 模型", "models-kling"], ["更多 AI 视频模型与工具", "models-other"]]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", `#${id}`);
      expect(container.querySelector(`#${id}`)).toHaveAttribute("aria-labelledby", `${id}-title`);
    }
    expect(container.querySelectorAll("[data-directory-card]")).toHaveLength(15);
    expect(screen.getByRole("heading", { name: "Wan 2.5" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Wan FusionX" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DreamFace AI" })).toBeInTheDocument();
    expect(screen.getByText(/模型与专用工具生成暂未开放/)).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });
  it("图片模型使用宽卡说明和CTA，工具使用完整28卡且不混入模型段落", () => {
    const { container, unmount } = render(<PlatformDirectoryPage path="/ai-image-models" locale="zh-CN"/>);
    expect(container.querySelector(".platform-directory-image-models")).toBeInTheDocument();
    expect(screen.getAllByText("探索模型")).toHaveLength(2);
    expect(screen.getAllByText("生成暂不可用")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "GPT Image 2.0" })).toBeInTheDocument();
    unmount(); const tools = render(<PlatformDirectoryPage path="/tools" locale="en"/>);
    expect(tools.container.querySelectorAll("[data-directory-card]")).toHaveLength(28);
    expect(screen.queryByRole("navigation", { name: "Model categories" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AI Text to Video/ })).toHaveAttribute("href", "/tools/ai-text-to-video?mode=text-to-video");
  });
});
