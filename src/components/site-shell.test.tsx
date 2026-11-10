import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteShell } from "./site-shell";

afterEach(() => { document.body.style.overflow = ""; window.history.replaceState({}, "", "/"); });

describe("两套平台外壳", () => {
  it("宣传页提供横向导航及可键盘展开的分组功能菜单", () => {
    render(<SiteShell locale="zh-CN" currentPath="/"><main>页面内容</main></SiteShell>);
    expect(screen.getAllByRole("link", { name: "Makeup AI home" })[0]).toHaveAttribute("href", "/zh-CN");
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
    expect(screen.getByRole("link", { name: "登录即可获得3积分" })).toHaveAttribute("href", "/login?next=%2Fzh-CN%2Fai-makeup");
    const scaffold = within(nav).getByRole("link", { name: "AI 视频生成器" });
    expect(scaffold).toHaveAttribute("href", "/zh-CN/ai-video-generator");
    expect(scaffold).not.toHaveAttribute("title", "即将推出");
    const pending = screen.getByRole("link", { name: "AI 创作指南" });
    expect(pending).toHaveAttribute("href", "/zh-CN/guides");
    fireEvent.click(pending);
    expect(screen.getByRole("status")).toHaveTextContent("即将推出");
    expect(screen.getByText("页面内容")).toBeInTheDocument();
  });
  it("抽屉锁定背景、循环焦点，遮罩及 Escape 均关闭并恢复焦点", async () => {
    render(<SiteShell locale="zh-CN" currentPath="/ai-makeup"><button>页面按钮</button></SiteShell>);
    const trigger = screen.getByRole("button", { name: "切换侧边栏" });
    trigger.focus(); fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "导航菜单" });
    expect(document.body.style.overflow).toBe("hidden");
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
