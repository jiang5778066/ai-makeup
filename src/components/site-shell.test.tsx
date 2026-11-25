import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteShell } from "./site-shell";
import { TrustPage } from "./trust-page";

afterEach(() => { document.body.style.overflow = ""; window.history.replaceState({}, "", "/"); });

describe("两套平台外壳", () => {
  it("横向导航提供社区快捷入口", () => {
    render(<SiteShell locale="en" currentPath="/"><main>Page content</main></SiteShell>);
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(nav).getByRole("link", { name: "Community" })).toHaveAttribute("href", "/explore");
    expect(within(nav).getByRole("link", { name: "Tools" })).toHaveAttribute("href", "/tools");
    expect(within(nav).getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });
  it("功能菜单提供视频选区预览的正式入口", () => {
    render(<SiteShell locale="zh-CN" currentPath="/"><main>页面内容</main></SiteShell>);
    const nav = screen.getByRole("navigation", { name: "主导航" });
    fireEvent.keyDown(within(nav).getByRole("button", { name: "功能" }), { key: "ArrowDown" });
    const menu = screen.getByRole("region", { name: "功能" });
    expect(within(menu).getByRole("link", { name: /视频编辑.*在本机预览视频片段/ })).toHaveAttribute("href", "/zh-CN/ai-video-editor");
    expect(within(menu).getByRole("link", { name: /图片风格转换/ })).toHaveAttribute("href", "/zh-CN/image-style-converter");
    expect(within(menu).getByRole("link", { name: /GPT Image 2/ })).toHaveAttribute("href", "/zh-CN/ai-image-models/gpt-image-2");
  });
  it("宣传页提供横向导航及可键盘展开的分组功能菜单", () => {
    render(<SiteShell locale="zh-CN" currentPath="/"><main>页面内容</main></SiteShell>);
    expect(screen.getAllByRole("link", { name: "FrameKoi 首页" })[0]).toHaveAttribute("href", "/zh-CN");
    const nav = screen.getByRole("navigation", { name: "主导航" });
    expect(within(nav).getByRole("link", { name: "首页" })).toHaveAttribute("href", "/zh-CN/home");
    expect(screen.queryByRole("complementary", { name: "工作台导航" })).not.toBeInTheDocument();
    const trigger = within(nav).getByRole("button", { name: "功能" });
    trigger.focus(); fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const menu = screen.getByRole("region", { name: "功能" });
    expect(within(menu).getByText("视频", { exact: true })).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: /AI 美妆/ })).toHaveAttribute("href", "/zh-CN/ai-makeup");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "功能" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("工作台保留真实额度及精确激活状态，待实现功能不能误导跳转", () => {
    window.history.replaceState({}, "", "/zh-CN/ai-makeup");
    render(<SiteShell locale="zh-CN" currentPath="/ai-makeup"><main>页面内容</main></SiteShell>);
    const nav = screen.getByRole("complementary", { name: "工作台导航" });
    expect(within(nav).getByRole("link", { name: "AI美妆" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "首页" })).not.toHaveAttribute("aria-current");
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "登录" })).toHaveAttribute("href", "/login?next=%2Fzh-CN%2Fai-makeup");
    const scaffold = within(nav).getByRole("link", { name: "AI 视频生成器" });
    expect(scaffold).toHaveAttribute("href", "/zh-CN/ai-video-generator");
    expect(scaffold).not.toHaveAttribute("title", "即将推出");
    expect(within(nav).getByRole("link", { name: "我的作品" })).toHaveAttribute("href", "/zh-CN/my-creations");
    expect(within(nav).getByRole("link", { name: "图片特效" })).toHaveAttribute("href", "/zh-CN/image-effects");
    expect(within(nav).getByRole("link", { name: "图片风格转换" })).toHaveAttribute("href", "/zh-CN/image-style-converter");
    expect(within(nav).getByRole("link", { name: "口型同步" })).toHaveAttribute("href", "/zh-CN/tools/ai-lip-sync-video-generator");
    expect(nav.querySelector('a[href="/zh-CN/ai-age-progression"]')).not.toBeInTheDocument();
    expect(screen.getByText("页面内容")).toBeInTheDocument();
  });
  it.each(["en", "zh-CN"] as const)("%s 页脚保留政策和可读资料页，隐藏尚未开放的分组", (locale) => {
    render(<SiteShell locale={locale} currentPath="/"><main>页面内容</main></SiteShell>);
    const footer = screen.getByRole("contentinfo");
    const prefix = locale === "zh-CN" ? "/zh-CN" : "";
    const paths = [...footer.querySelectorAll("a")].map((link) => link.getAttribute("href"));
    expect(paths).toEqual(expect.arrayContaining(["/login", ...["/about", "/refund", "/content-moderation-policy", "/tools"].map((path) => prefix + path)]));
    for (const path of ["/video-effects/earth-zoom-out", "/video-effects/ai-angel-video-generator"]) expect(paths).toContain(prefix + path);
    expect(paths.some((path) => /\/(guides|blog)(?:[\/#?]|$)/.test(path ?? ""))).toBe(false);
    expect(within(footer).queryByRole("heading", { name: /AI Guides & Learning|AI 指南与学习/ })).not.toBeInTheDocument();
    expect(within(footer).getByRole("heading", { name: locale === "en" ? "Video Effects" : "视频特效" })).toBeInTheDocument();
  });
  it.each(["en", "zh-CN"] as const)("%s 三个政策目标各有独立正文", (locale) => {
    const titles = locale === "zh-CN"
      ? ["关于 FrameKoi", "退款政策", "可接受使用与内容审核政策"]
      : ["About FrameKoi", "Refund Policy", "Acceptable Use & Content Moderation"];
    for (const [index, section] of (["about", "refund", "content-moderation-policy"] as const).entries()) {
      const view = render(<TrustPage section={section} locale={locale}/>);
      const main = screen.getByRole("main");
      expect(within(main).getByRole("heading", { level: 1, name: titles[index] })).toBeInTheDocument();
      expect(main.querySelectorAll("article > p").length).toBeGreaterThan(3);
      view.unmount();
    }
  });
  it("抽屉锁定背景、循环焦点，遮罩及 Escape 均关闭并恢复焦点", async () => {
    render(<SiteShell locale="zh-CN" currentPath="/ai-makeup"><button>页面按钮</button></SiteShell>);
    const trigger = screen.getByRole("button", { name: "切换侧边栏" });
    trigger.focus(); fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "导航菜单" });
    expect(document.body.style.overflow).toBe("hidden");
    expect(within(dialog).getByRole("link", { name: "视频特效" })).toHaveAttribute("href", "/zh-CN/video-effects");
    expect(within(dialog).getByRole("link", { name: "视频编辑" })).toHaveAttribute("href", "/zh-CN/ai-video-editor");
    expect(within(dialog).getByRole("link", { name: "口型同步" })).toHaveAttribute("href", "/zh-CN/tools/ai-lip-sync-video-generator");
    expect(within(dialog).getByRole("link", { name: "社区" })).toHaveAttribute("href", "/zh-CN/explore");
    const close = within(dialog).getByRole("button", { name: "关闭导航" });
    await waitFor(() => expect(close).toHaveFocus());
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(within(dialog).getByRole("link", { name: "价格" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus(); expect(document.body.style.overflow).toBe("");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "关闭导航遮罩" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("语言菜单使用浏览器当前地址保留查询和锚点", () => {
    window.history.replaceState({}, "", "/zh-CN/ai-makeup?style=y2k#try");
    render(<SiteShell locale="zh-CN" currentPath="/ai-makeup"><main>页面内容</main></SiteShell>);
    fireEvent.click(screen.getByRole("button", { name: "切换语言，当前为 简体中文" }));
    const menu = screen.getByRole("menu", { name: "语言" });
    expect(within(menu).getByRole("menuitem", { name: "English" })).toHaveAttribute("href", "/ai-makeup?style=y2k#try");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
