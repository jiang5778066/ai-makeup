import type { ReactNode } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformDirectoryPage } from "./platform-directory-page";
vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./platform-homepage-media", () => ({ HomepageVideo: ({ poster, src, trigger }: { poster: string; src: string; trigger: string }) => <div data-trigger={trigger}><video poster={poster} data-src={src}/><button type="button">播放展示视频</button></div> }));
afterEach(cleanup);
describe("目录真实正文与可访问交互", () => {
  it.each([
    ["en", "Check the tool panel for currently available modes.", "Generation not available yet"],
    ["zh-CN", "请在工具面板查看当前可用模式。", "生成暂不可用"],
  ] as const)("%s 的 GPT Image 2 和 Grok 提示以面板为准，Nano 保留预览状态", (locale, panelHint, previewStatus) => {
    const { container, rerender } = render(<PlatformDirectoryPage path="/ai-image-models" locale={locale}/>);
    const status = (id: string) => container.querySelector(`[data-directory-card="${id}"] .platform-directory-unavailable`);
    expect(status("gpt-image")).toHaveTextContent(panelHint);
    expect(status("nano-banana")).toHaveTextContent(previewStatus);
    expect(container.querySelector(".platform-directory-disclosure")).toHaveTextContent(panelHint);
    rerender(<PlatformDirectoryPage path="/ai-video-models" locale={locale}/>);
    expect(status("grok-imagine")).toHaveTextContent(panelHint);
    expect(status("dreamface-ai")).toHaveTextContent(previewStatus);
    expect(container.querySelector(".platform-directory-disclosure")).toHaveTextContent(panelHint);
  });
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
    expect(screen.getByRole("link", { name: /^圣诞爱心/ })).toHaveAttribute("href", "/zh-CN/video-effects/lab?template_id=1200");
    expect(screen.getByRole("link", { name: /^AI 天使光环/ })).toHaveAttribute("href", "/zh-CN/video-effects/lab?template_id=508");
    unmount(); render(<PlatformDirectoryPage path="/image-effects" locale="en"/>);
    expect(screen.getByRole("heading", { name: "Explore Image Effects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^AI Hairstyle Changer/ })).toHaveAttribute("href", "/image-effects/ai-hair-style-changer");
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
  it.each(["en", "zh-CN"] as const)("%s 视频特效目录只将两项资料卡链接到双语正文", (locale) => {
    const prefix = locale === "zh-CN" ? "/zh-CN" : "";
    const { container } = render(<PlatformDirectoryPage path="/video-effects" locale={locale}/>);
    for (const [id, slug, poster] of [
      ["earth-zoom-out", "earth-zoom-out", "framekoi-earth-zoom-out.webp"],
      ["ai-angel-video-generator", "ai-angel-video-generator", "framekoi-ai-angel-wings.webp"],
    ]) {
      const card = container.querySelector<HTMLElement>(`[data-directory-card="${id}"]`)!;
      expect(within(card).getByRole("link")).toHaveAttribute("href", `${prefix}/video-effects/${slug}`);
      expect(card.querySelector("img")).toHaveAttribute("src", `/platform/directories/${poster}`);
      expect(card.querySelector("video")).toBeNull();
      expect(card).toHaveTextContent(locale === "zh-CN" ? "FrameKoi 示意图" : "FrameKoi illustration");
      expect(card).toHaveTextContent(locale === "zh-CN" ? "专用生成尚未验证" : "Dedicated generation is unverified");
    }
    expect(within(container.querySelector<HTMLElement>('[data-directory-card="template-508"]')!).getByRole("link")).toHaveAttribute("href", `${prefix}/video-effects/lab?template_id=508`);
  });
  it.each(["en", "zh-CN"] as const)("%s 已启用的两张图片特效卡展示 FrameKoi 自制示意", (locale) => {
    const { container } = render(<PlatformDirectoryPage path="/image-effects" locale={locale}/>);
    const prefix = locale === "zh-CN" ? "/zh-CN" : "";
    for (const [id, path, poster] of [
      ["old-photo-restoration", "/image-effects/old-photo-restoration", "photo-restoration"],
      ["image-styler", "/image-style-converter", "image-style"],
    ]) {
      const card = container.querySelector<HTMLElement>(`[data-directory-card="${id}"]`)!;
      expect(within(card).getByRole("link")).toHaveAttribute("href", prefix + path);
      expect(card.querySelector("img")).toHaveAttribute("src", `/platform/directories/framekoi-${poster}-illustration.webp`);
      expect(card).toHaveTextContent(locale === "zh-CN" ? "FrameKoi 示意图" : "FrameKoi illustration");
    }
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
    expect(screen.getByText(/媒体为公开参照展示/)).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });
  it("图片模型使用宽卡说明和CTA，工具使用完整28卡且不混入模型段落", () => {
    const { container, unmount } = render(<PlatformDirectoryPage path="/ai-image-models" locale="zh-CN"/>);
    expect(container.querySelector(".platform-directory-image-models")).toBeInTheDocument();
    expect(screen.getAllByText("探索模型")).toHaveLength(2);
    expect(screen.getAllByText("生成暂不可用")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "GPT Image 2.0" })).toBeInTheDocument();
    unmount(); const tools = render(<PlatformDirectoryPage path="/tools" locale="en"/>);
    expect(tools.container.querySelectorAll("[data-directory-card]")).toHaveLength(28);
    expect(screen.queryByRole("navigation", { name: "Model categories" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AI Text to Video/ })).toHaveAttribute("href", "/tools/ai-text-to-video?mode=text-to-video");
  });
  it.each([
    ["en", "Not available yet", "View tool", "Read guide", ""],
    ["zh-CN", "暂未开放", "查看工具", "查看指南", "/zh-CN"]
  ] as const)("%s 工具卡在导航前区分占位入口和专用页面", (locale, unavailable, viewTool, readGuide, prefix) => {
    const { container } = render(<PlatformDirectoryPage path="/tools" locale={locale}/>);
    const scaffoldCard = within(container.querySelector<HTMLElement>('[data-directory-card="character-animation"]')!);
    const scaffoldLink = scaffoldCard.getByRole("link");
    expect(scaffoldLink).toHaveAttribute("href", `${prefix}/tools/character-animation`);
    expect(scaffoldLink).not.toHaveAttribute("aria-disabled");
    expect(scaffoldCard.getByText(readGuide)).toBeVisible();
    expect(scaffoldCard.queryByText(unavailable)).not.toBeInTheDocument();
    expect(scaffoldLink).not.toHaveTextContent(/Try Now|立即尝试/);
    expect(scaffoldCard.queryByRole("button")).not.toBeInTheDocument();
    scaffoldLink.focus();
    expect(scaffoldLink).toHaveFocus();

    const implementedCard = within(container.querySelector<HTMLElement>('[data-directory-card="image-editor"]')!);
    expect(implementedCard.getByText(viewTool)).toBeVisible();
    expect(implementedCard.queryByText(unavailable)).not.toBeInTheDocument();
    expect(implementedCard.getByRole("link")).toHaveAttribute("href", `${prefix}/tools/icedit-ai-image-editor`);
  });
  it.each([
    ["en", "Not available yet", ""],
    ["zh-CN", "暂未开放", "/zh-CN"]
  ] as const)("%s 图片特效使用正式入口，视频模板展示占位状态", (locale, unavailable, prefix) => {
    const { container, rerender } = render(<PlatformDirectoryPage path="/image-effects" locale={locale}/>);
    const image = within(container.querySelector<HTMLElement>('[data-directory-card="ai-hair-style-changer"]')!);
    expect(image.queryByText(unavailable)).not.toBeInTheDocument();
    expect(image.getByRole("link")).toHaveAttribute("href", `${prefix}/image-effects/ai-hair-style-changer`);
    const album = within(container.querySelector<HTMLElement>('[data-directory-card="ai-album-cover-generator"]')!);
    expect(album.queryByText(unavailable)).not.toBeInTheDocument();
    expect(album.getByRole("link")).toHaveAttribute("href", `${prefix}/image-effects/ai-album-cover-generator`);
    const collage = within(container.querySelector<HTMLElement>('[data-directory-card="ai-south-park"]')!);
    expect(collage.getByRole("link")).toHaveAttribute("href", `${prefix}/image-effects/paper-cutout-collage`);
    expect(collage.queryByText(unavailable)).not.toBeInTheDocument();

    rerender(<PlatformDirectoryPage path="/video-effects" locale={locale}/>);
    const video = within(container.querySelector<HTMLElement>('[data-directory-card="template-508"]')!);
    expect(video.getByText(unavailable)).toBeVisible();
    expect(video.getByRole("link")).toHaveAttribute("href", `${prefix}/video-effects/lab?template_id=508`);
    const videoWithAnchor = within(container.querySelector<HTMLElement>('[data-directory-card="ai-french-kiss-video-generator"]')!);
    expect(videoWithAnchor.getByRole("link")).toHaveAttribute("href", `${prefix}/video-effects/ai-french-kiss-video-generator#generator`);
  });
});
