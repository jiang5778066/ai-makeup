import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformScaffoldPage } from "./platform-scaffold-page";
import { platformEntry } from "@/lib/platform-navigation";
vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
const navigation = vi.hoisted(() => ({ pathname: "/zh-CN/ai-video-generator", query: "" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useSearchParams: () => new URLSearchParams(navigation.query) }));
afterEach(() => { navigation.pathname = "/zh-CN/ai-video-generator"; navigation.query = ""; });
describe("工具预览入口", () => {
  it("保留全部查询和锚点，明确不可用而不提供生成按钮", () => {
    window.history.replaceState({}, "", "/zh/ai-video-generator?model=wan-3-0&mode=image-to-video&custom=keep#generator");
    render(<PlatformScaffoldPage locale="zh-CN" currentPath="/ai-video-generator" entry={platformEntry("video-generator")}/>);
    expect(screen.getByText("wan-3-0")).toBeVisible();
    expect(screen.getByText("image-to-video")).toBeVisible();
    expect(screen.getByText(/custom=keep#generator/)).toBeVisible();
    expect(screen.getByText("当前不可用")).toBeVisible();
    expect(screen.queryByRole("button", { name: /生成/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /返回工作台/ })).toHaveAttribute("href", "/zh-CN/home");
  });
  it("同 pathname 添加与移除查询时，入口及字段跟随客户端导航而非初始 props", () => {
    window.history.replaceState({}, "", "/zh-CN/ai-video-generator");
    const { rerender } = render(<PlatformScaffoldPage locale="zh-CN" currentPath="/ai-video-generator" entry={platformEntry("video-generator")}/>);
    const next = "/zh-CN/ai-video-generator?model=wan-3-0&mode=image-to-video&tag=a&tag=b#preview";
    window.history.pushState({}, "", next); navigation.query = "model=wan-3-0&mode=image-to-video&tag=a&tag=b";
    rerender(<PlatformScaffoldPage locale="zh-CN" currentPath="/ai-video-generator" entry={platformEntry("video-generator")}/>);
    expect(screen.getByText(next)).toBeVisible(); expect(screen.getByText("wan-3-0")).toBeVisible();
    expect(screen.getByText("image-to-video")).toBeVisible();
    window.history.pushState({}, "", "/zh-CN/ai-video-generator"); navigation.query = "";
    rerender(<PlatformScaffoldPage locale="zh-CN" currentPath="/ai-video-generator" entry={platformEntry("video-generator")}/>);
    expect(screen.queryByText("wan-3-0")).not.toBeInTheDocument(); expect(screen.queryByText("image-to-video")).not.toBeInTheDocument();
  });
  it("仅锚点与原生历史事件也更新当前入口", () => {
    window.history.replaceState({}, "", "/zh-CN/ai-video-generator?tag=a&tag=b");
    navigation.query = "tag=a&tag=b";
    render(<PlatformScaffoldPage locale="zh-CN" currentPath="/ai-video-generator" entry={platformEntry("video-generator")}/>);
    window.history.pushState({}, "", "/zh-CN/ai-video-generator?tag=a&tag=b#after");
    fireEvent(window, new HashChangeEvent("hashchange"));
    expect(screen.getByText("/zh-CN/ai-video-generator?tag=a&tag=b#after")).toBeVisible();
    window.history.replaceState({}, "", "/zh-CN/ai-video-generator?tag=a&tag=b#before");
    fireEvent(window, new PopStateEvent("popstate"));
    expect(screen.getByText("/zh-CN/ai-video-generator?tag=a&tag=b#before")).toBeVisible();
  });
  it("同路径客户端模板变化时标题与字段采用同一首值规则，不沿用旧模板", () => {
    navigation.pathname = "/video-effects/lab"; navigation.query = "template_id=1200";
    window.history.replaceState({}, "", "/video-effects/lab?template_id=1200");
    const { rerender } = render(<PlatformScaffoldPage locale="en" currentPath="/video-effects/lab" entry={platformEntry("template-1200")}/>);
    navigation.query = "template_id=508&template_id=1200"; window.history.pushState({}, "", `/video-effects/lab?${navigation.query}`);
    rerender(<PlatformScaffoldPage locale="en" currentPath="/video-effects/lab" entry={platformEntry("template-1200")}/>);
    expect(screen.getByRole("heading", { name: "Video Effect 508" })).toBeVisible(); expect(screen.getByText("508", { exact: true })).toBeVisible();
    navigation.query = "template_id=unknown"; window.history.pushState({}, "", `/video-effects/lab?${navigation.query}`);
    rerender(<PlatformScaffoldPage locale="en" currentPath="/video-effects/lab" entry={platformEntry("template-1200")}/>);
    expect(screen.getByRole("heading", { name: "Missing or unsupported template" })).toBeVisible();
  });
  it("模板参数不会被通用外壳丢弃", () => {
    window.history.replaceState({}, "", "/video-effects/lab?template_id=508#preview");
    render(<PlatformScaffoldPage locale="en" currentPath="/video-effects/lab" entry={platformEntry("template-508")}/>);
    expect(screen.getByText("508")).toBeVisible();
    expect(screen.getByText("Currently unavailable")).toBeVisible();
  });
});
