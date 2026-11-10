import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { PlatformRootGeneratorPage } from "./platform-root-generator-page";
import * as rootMedia from "@/lib/platform-root-generator-media";
import { rootGeneratorPages, type RootGeneratorPath } from "@/lib/platform-root-generator-data";

vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./platform-navigation-link", () => ({ PlatformNavigationLink: ({ children, href, ...props }: { children: ReactNode; href: string }) => <a href={href} {...props}>{children}</a> }));
vi.mock("./platform-homepage-media", () => ({ HomepageVideo: ({ src, poster }: { src: string; poster: string }) => <div data-local-src={src} data-local-poster={poster}/> }));

describe("介绍页独特正文、语义与入口", () => {
  it("四页双语无表单；准确语言CTA、完整正文和来源边界同时存在", () => {
    for (const locale of ["en", "zh-CN"] as const) for (const path of Object.keys(rootGeneratorPages) as RootGeneratorPath[]) {
      const page = rootGeneratorPages[path], view = render(<PlatformRootGeneratorPage path={path} locale={locale}/>);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(page.title[locale]);
      expect(view.container.querySelectorAll("form,input,textarea,select")).toHaveLength(0);
      expect(screen.getAllByRole("link", { name: page.cta.label[locale] })[0]).toHaveAttribute("href", `${locale === "zh-CN" ? "/zh-CN" : ""}${page.cta.href}`);
      expect(screen.getAllByRole("link", { name: "Lanta AI" }).every(link => link.getAttribute("href") === page.sourceUrl)).toBe(true);
      expect(view.container.textContent).toMatch(/Generation is not available yet|生成服务尚未开放/);
      expect(view.container.textContent).toMatch(/not been independently verified|未独立验证/);
      for (const faq of page.faq) expect(screen.getByRole("button", { name: faq.question[locale] })).toHaveAttribute("type", "button");
      view.unmount();
    }
  });
  it("独立FAQ多开与关闭，不影响其它题，关联region与可聚焦原生按钮", () => {
    render(<PlatformRootGeneratorPage path="/hunyuanvideo-generator" locale="en"/>);
    const page = rootGeneratorPages["/hunyuanvideo-generator"], first = screen.getByRole("button", { name: page.faq[0].question.en }), second = screen.getByRole("button", { name: page.faq[1].question.en });
    expect(first).toHaveAttribute("aria-expanded", "true"); expect(second).toHaveAttribute("aria-expanded", "false");
    second.focus(); expect(second).toHaveFocus(); fireEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "true"); expect(second).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(second.getAttribute("aria-controls")!)!;
    expect(panel).toHaveAttribute("aria-labelledby", second.id); expect(within(panel).getByText(page.faq[1].answer.en)).toBeVisible();
    fireEvent.click(first); expect(second).toHaveAttribute("aria-expanded", "true"); expect(first).toHaveAttribute("aria-expanded", "false");
  });
  it("Hunyuan七段功能在各自正文旁提供准确来源和未独立验证边界", () => {
    const page = rootGeneratorPages["/hunyuanvideo-generator"];
    for (const locale of ["en", "zh-CN"] as const) {
      const view = render(<PlatformRootGeneratorPage path="/hunyuanvideo-generator" locale={locale}/>);
      const articles = view.container.querySelectorAll(".platform-root-generator-features article");
      expect(articles).toHaveLength(7);
      for (const [index, article] of [...articles].entries()) {
        const heading = within(article as HTMLElement).getByRole("heading", { level: 3, name: page.features![index].title[locale] });
        const copy = heading.parentElement!;
        expect(within(copy).getByText(page.features![index].text[locale])).toBeInTheDocument();
        const source = within(copy).getByRole("link", { name: "Lanta AI" });
        expect(source).toHaveAttribute("href", page.sourceUrl);
        expect(source.parentElement).toHaveTextContent(locale === "en" ? "claims have not been independently verified" : "未独立验证");
        expect(source.parentElement).toHaveTextContent(locale === "en" ? "not this project's performance, licensing, pricing or data-security promises" : "不代表本站的性能、许可、费用或数据安全承诺");
      }
      view.unmount();
    }
  });
  it("LoRA八卡均未预选，Mochi保未知身份且使用完整准确本地媒体", () => {
    const view = render(<PlatformRootGeneratorPage path="/hunyuan-video-lora" locale="en"/>);
    const library = screen.getByRole("region", { name: "LoRA style showcases" });
    expect(within(library).getAllByRole("article")).toHaveLength(8);
    for (const link of within(library).getAllByRole("link")) expect(link).toHaveAttribute("href", "/ai-video-generator");
    expect(within(library).getAllByText(/not automatically applied/)).toHaveLength(8);
    view.unmount(); render(<PlatformRootGeneratorPage path="/mochi1-video-generator" locale="en"/>);
    expect(screen.getByText(/original model ID 102/)).toBeInTheDocument();
    expect(screen.queryByText(/not fully available locally/)).not.toBeInTheDocument();
    const media = document.querySelector(".platform-root-generator-hero [data-local-src]");
    expect(media).toHaveAttribute("data-local-src", "/platform/root-generators/39-964f9de2-715c-4087-bd08-dfe86d7bbc85.mp4");
    expect(media).toHaveAttribute("data-local-poster", "/platform/root-generators/40-964f9de2-715c-4087-bd08-dfe86d7bbc85.jpg");
    expect(document.querySelector('[src^="https://cdn.lantaai.com"]')).toBeNull();
  });
  it("任一视频或poster登记缺失仍显示不完整提示，不注入热链", () => {
    const hero = rootGeneratorPages["/mochi1-video-generator"].hero;
    for (const missing of [hero.source, hero.poster]) {
      const lookup = vi.spyOn(rootMedia, "rootGeneratorAsset").mockImplementation(source => source === missing ? undefined : rootMedia.rootGeneratorAssets.find(asset => asset.source === source));
      try {
        const view = render(<PlatformRootGeneratorPage path="/mochi1-video-generator" locale="en"/>);
        expect(screen.getByText(/not fully available locally/)).toBeInTheDocument();
        expect(view.container.querySelector("[data-local-src]")).toBeNull();
        expect(view.container.querySelector('[src^="https://cdn.lantaai.com"]')).toBeNull();
        view.unmount();
      } finally { lookup.mockRestore(); }
    }
  });
});
