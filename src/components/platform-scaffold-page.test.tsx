import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { platformEntry } from "@/lib/platform-navigation";
import { PlatformScaffoldPage } from "./platform-scaffold-page";

vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
const navigation = vi.hoisted(() => ({ pathname: "", query: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.query)
}));

function setUrl(url: string, method: "replaceState" | "pushState" = "replaceState") {
  window.history[method]({}, "", url);
  navigation.pathname = window.location.pathname;
  navigation.query = window.location.search;
}

function expectAddress(url: string) {
  expect(window.location.href).toBe(new URL(url, window.location.origin).href);
}

afterEach(() => {
  setUrl("/");
});

describe("占位页文案与导航", () => {
  it.each([
    ["en", "Sample Tool", "Currently unavailable", "Back to workspace", ""],
    ["zh-CN", "示例工具", "当前不可用", "返回工作台", "/zh-CN"]
  ] as const)("%s 直达占位页显示本地化标题和返回入口，地址参数只供导航", (locale, title, unavailable, back, prefix) => {
    const path = "/tools/sample-tool";
    const query = "model=private-model&mode=private-mode&custom=private-value";
    const url = `${prefix}${path}?${query}#generator`;
    setUrl(url);
    const entry = { id: "sample-tool", pathname: path, label: { en: "Sample Tool", "zh-CN": "示例工具" }, status: "scaffold" } as const;
    render(<PlatformScaffoldPage locale={locale} currentPath={path} entry={entry} initialQuery={query}/>);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeVisible();
    expect(screen.getByText(unavailable)).toBeVisible();
    expect(screen.getByRole("link", { name: back })).toHaveAttribute("href", `${prefix}/home`);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "generator");
    expect(main).not.toHaveTextContent(/当前入口|Destination|模型|Model|模式|Mode|private-model|private-mode|private-value|\/tools\/sample-tool/);
    expect(screen.queryByRole("button", { name: /生成|Generate/ })).not.toBeInTheDocument();
    expectAddress(url);
  });

  it("同路径从 1200 更新到 508 时采用第一个模板参数，未知或空首值显示未支持说明", () => {
    const path = "/video-effects/lab";
    const initialUrl = `${path}?template_id=1200#generator`;
    setUrl(initialUrl);
    const page = () => <PlatformScaffoldPage locale="en" currentPath={path} entry={platformEntry("template-1200")} initialQuery="template_id=1200"/>;
    const { rerender } = render(page());
    expect(screen.getByRole("heading", { name: "Christmas(Heart)" })).toBeVisible();

    const nextUrl = `${path}?template_id=508&template_id=1200&tag=a&tag=b#generator`;
    setUrl(nextUrl, "pushState");
    rerender(page());
    expect(screen.getByRole("heading", { name: "AI Angel Halo" })).toBeVisible();
    expect(screen.queryByText("508", { exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole("main")).not.toHaveTextContent(/Destination|template_id|tag=a|#generator/);
    expectAddress(nextUrl);

    for (const query of ["template_id=unknown", "template_id=&template_id=508", ""]) {
      const url = `${path}${query ? `?${query}` : ""}#generator`;
      setUrl(url, "pushState");
      rerender(page());
      expect(screen.getByRole("heading", { name: "Missing or unsupported template" })).toBeVisible();
      expectAddress(url);
    }
  });

  it("原生历史事件更新模板，锚点保留在地址栏", () => {
    const path = "/zh-CN/video-effects/lab";
    setUrl(`${path}?template_id=508#generator`);
    render(<PlatformScaffoldPage locale="zh-CN" currentPath="/video-effects/lab" entry={platformEntry("template-508")}/>);
    expect(screen.getByRole("heading", { name: "AI 天使光环" })).toBeVisible();

    const hashUrl = `${path}?template_id=508#preview`;
    window.history.replaceState({}, "", hashUrl);
    fireEvent(window, new HashChangeEvent("hashchange"));
    expect(screen.getByRole("heading", { name: "AI 天使光环" })).toBeVisible();
    expectAddress(hashUrl);

    const historyUrl = `${path}?template_id=1200&template_id=508#generator`;
    window.history.replaceState({}, "", historyUrl);
    fireEvent(window, new PopStateEvent("popstate"));
    expect(screen.getByRole("heading", { name: "圣诞爱心" })).toBeVisible();
    expect(screen.getByRole("main")).not.toHaveTextContent(/当前入口|template_id|#generator/);
    expectAddress(historyUrl);
  });

  it.each([
    ["en", "", "Christmas(Heart)", "AI Angel Halo", "Currently unavailable"],
    ["zh-CN", "/zh-CN", "圣诞爱心", "AI 天使光环", "当前不可用"]
  ] as const)("%s 同一文档的查询更新、历史后退与前进同步页签标题", async (locale, prefix, first, second, unavailable) => {
    const path = `${prefix}/video-effects/lab`;
    const initialUrl = `${path}?template_id=1200#generator`;
    const nextUrl = `${path}?template_id=508&template_id=1200#generator`;
    const firstTitle = `${first} · ${unavailable} | FrameKoi`;
    const secondTitle = `${second} · ${unavailable} | FrameKoi`;
    setUrl(initialUrl);
    const page = () => <PlatformScaffoldPage locale={locale} currentPath="/video-effects/lab" entry={platformEntry("template-1200")} initialQuery="template_id=1200"/>;
    const { rerender } = render(page());
    const main = screen.getByRole("main");
    expect(screen.getByRole("heading", { name: first })).toBeVisible();
    expect(document.title).toBe(firstTitle);
    expect(document.head.querySelectorAll("title")).toHaveLength(1);

    setUrl(nextUrl, "pushState");
    rerender(page());
    expect(screen.getByRole("heading", { name: second })).toBeVisible();
    expect(document.title).toBe(secondTitle);
    expectAddress(nextUrl);

    window.history.back();
    await waitFor(() => {
      expectAddress(initialUrl);
      expect(screen.getByRole("heading", { name: first })).toBeVisible();
      expect(document.title).toBe(firstTitle);
    });

    window.history.forward();
    await waitFor(() => {
      expectAddress(nextUrl);
      expect(screen.getByRole("heading", { name: second })).toBeVisible();
      expect(document.title).toBe(secondTitle);
      expect(document.head.querySelectorAll("title")).toHaveLength(1);
    });
    expect(screen.getByRole("main")).toBe(main);
  });

  it("缺失或无效首值由原路由处理，离开模板路径后保留目标页签标题", () => {
    const path = "/video-effects/lab";
    setUrl(`${path}?template_id=1200`);
    const page = () => <PlatformScaffoldPage locale="en" currentPath={path} entry={platformEntry("template-1200")}/>;
    const { rerender } = render(page());

    setUrl(`${path}?template_id=508`);
    rerender(page());
    const previousTitle = "AI Angel Halo · Currently unavailable | FrameKoi";
    expect(document.title).toBe(previousTitle);

    setUrl(`${path}?template_id=&template_id=508`);
    rerender(page());
    expect(screen.getByRole("heading", { name: "Missing or unsupported template" })).toBeVisible();
    expect(document.title).toBe(previousTitle);
    expect(document.head.querySelectorAll("title")).toHaveLength(1);

    setUrl("/video-effects?template_id=508");
    const destinationTitle = document.createElement("title");
    destinationTitle.textContent = "Explore Video Effects | FrameKoi";
    document.head.append(destinationTitle);
    rerender(page());
    expect(document.title).toBe("Explore Video Effects | FrameKoi");
    expect([...document.head.querySelectorAll("title")]).toEqual([destinationTitle]);
    destinationTitle.remove();
  });
});
