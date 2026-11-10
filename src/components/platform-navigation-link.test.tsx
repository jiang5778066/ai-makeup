import { act, fireEvent, render, screen } from "@testing-library/react";
import { startTransition } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PlatformNavigationLink, PlatformNavigationProvider } from "./platform-navigation-link";
import { onRouterTransitionStart } from "../instrumentation-client";

const next = vi.hoisted(() => ({ pathname: "/start" as string | null, query: "", push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => next, usePathname: () => next.pathname, useSearchParams: () => new URLSearchParams(next.query) }));
vi.mock("next/link", () => ({ default: ({ href, onNavigate, onClick, children, replace: _replace, scroll: _scroll, ...props }: React.PropsWithChildren<{ href: string; onNavigate?: (event: { preventDefault: () => void }) => void; onClick?: React.MouseEventHandler<HTMLAnchorElement>; replace?: boolean; scroll?: boolean }>) => <a {...props} href={href} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.currentTarget.target !== "_blank") { event.preventDefault(); onNavigate?.({ preventDefault: () => undefined }); } }}>{children}</a> }));

let finishTransitions: (() => void)[] = [];
async function finishNavigation() {
  await act(async () => { for (const finish of finishTransitions.splice(0)) finish(); });
}
beforeEach(() => {
  document.documentElement.lang = "en";
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  next.pathname = "/start"; next.query = ""; next.push.mockReset(); next.replace.mockReset();
  // Next router 返回 void，但其内部异步 transition 会保持待提交；不能用同步空函数代替生命周期。
  const request = () => {
    onRouterTransitionStart();
    startTransition(async () => { await new Promise<void>(resolve => { finishTransitions.push(resolve); }); });
  };
  next.push.mockImplementation(request); next.replace.mockImplementation(request);
  window.history.replaceState({ marker: "next-state" }, "", "/start");
});
afterEach(finishNavigation);
function view(href: string, replace = false) {
  return <PlatformNavigationProvider><PlatformNavigationLink href={href} replace={replace}>目标</PlatformNavigationLink><main id="generator">生成入口</main></PlatformNavigationProvider>;
}
it("后发原生router同目标无hash提交不能继承共享旧fragment", async () => {
  const { rerender } = render(view("/target?source=native#stale"));
  fireEvent.click(screen.getByText("目标"));
  act(() => next.push("/target?source=native"));
  act(() => { window.history.pushState({}, "", "/target?source=native"); next.pathname = "/target"; next.query = "source=native"; });
  rerender(view("/target?source=native#stale"));
  await finishNavigation();
  expect(location.pathname + location.search + location.hash).toBe("/target?source=native");
});
it("后发原生replace同目标无hash提交不能继承共享旧fragment", async () => {
  const { rerender } = render(view("/target#stale"));
  fireEvent.click(screen.getByText("目标"));
  act(() => next.replace("/target"));
  act(() => { window.history.replaceState({}, "", "/target"); next.pathname = "/target"; });
  rerender(view("/target#stale"));
  await finishNavigation();
  expect(location.pathname + location.hash).toBe("/target");
});
it("缓存多轮导航只将无锚点路由交给Next，提交后精确保留重复query和原始fragment", async () => {
  const route = "/target?tag=a&tag=b"; const href = `${route}#generator#legal`;
  const { rerender } = render(view(href));
  fireEvent.click(screen.getByRole("link", { name: "目标" }));
  expect(next.push).toHaveBeenCalledWith(route, { scroll: false });
  expect(window.location.pathname).toBe("/start");
  act(() => { window.history.pushState({ marker: "committed" }, "", route); next.pathname = "/target"; next.query = "tag=a&tag=b"; });
  rerender(view(href));
  await finishNavigation();
  expect(window.location.pathname + window.location.search + window.location.hash).toBe(href);
  expect(window.history.length).toBeGreaterThan(1);
});
it("仅hash导航只产生一条历史记录并定位和聚焦真实目标", async () => {
  const scroll = vi.fn(); Element.prototype.scrollIntoView = scroll;
  render(view("#generator")); const length = history.length;
  fireEvent.click(screen.getByRole("link", { name: "目标" }));
  expect(location.hash).toBe("#generator"); expect(history.length).toBe(length + 1);
  expect(next.push).not.toHaveBeenCalled(); expect(scroll).toHaveBeenCalled();
  expect(document.activeElement).toBe(document.getElementById("generator"));
  expect(document.getElementById("generator")).toHaveAttribute("tabindex", "-1");
});
it("修饰键、默认阻止和新标签保留浏览器原生链接行为", async () => {
  const { rerender } = render(view("/target#generator"));
  const anchor = screen.getByRole("link", { name: "目标" });
  anchor.addEventListener("click", event => event.preventDefault(), { once: true });
  fireEvent.click(anchor, { ctrlKey: true });
  expect(next.push).not.toHaveBeenCalled();
  rerender(<PlatformNavigationProvider><PlatformNavigationLink href="/target#generator" target="_blank">新标签</PlatformNavigationLink><PlatformNavigationLink href="/target#generator" onClick={event => event.preventDefault()}>拦截</PlatformNavigationLink></PlatformNavigationProvider>);
  fireEvent.click(screen.getByText("新标签")); fireEvent.click(screen.getByText("拦截")); expect(next.push).not.toHaveBeenCalled();
});
it("回退取消未完成的锚点提交，后续路由提交不能覆盖用户历史位置", async () => {
  const { rerender } = render(view("/target#generator")); fireEvent.click(screen.getByText("目标"));
  act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  act(() => { window.history.replaceState({}, "", "/target"); next.pathname = "/target"; }); rerender(view("/target#generator"));
  expect(location.hash).toBe("");
});
it("replace与scroll=false保留调用方语义，未知锚点不截断或规范化", async () => {
  render(<PlatformNavigationProvider><PlatformNavigationLink href="/start#unknown#still-valid" replace scroll={false}>目标</PlatformNavigationLink></PlatformNavigationProvider>);
  const length = history.length; fireEvent.click(screen.getByText("目标"));
  expect(location.hash).toBe("#unknown#still-valid"); expect(history.length).toBe(length);
});
it("快速新目标覆盖未提交目标，旧路由完成不能写入旧片段", async () => {
  let finish!: () => void;
  const transition = new Promise<void>(resolve => { finish = resolve; });
  // 模拟 Next 在共享 transition 内保持待提交，直至最新路由完成。
  next.push.mockImplementation(() => { onRouterTransitionStart(); startTransition(async () => { await transition; }); });
  const { rerender } = render(view("/first#generator")); fireEvent.click(screen.getByText("目标"));
  rerender(view("/second?tag=a&tag=b#unknown#valid")); fireEvent.click(screen.getByText("目标"));
  act(() => { window.history.replaceState({}, "", "/first"); next.pathname = "/first"; }); rerender(view("/second?tag=a&tag=b#unknown#valid"));
  expect(location.hash).toBe("");
  act(() => { window.history.replaceState({}, "", "/second?tag=a&tag=b"); next.pathname = "/second"; next.query = "tag=a&tag=b"; }); rerender(view("/second?tag=a&tag=b#unknown#valid"));
  await act(async () => { finish(); await transition; });
  expect(location.hash).toBe("#unknown#valid");
});
it("jsdom仅hash链接保留尾随井号，非法转义不改变URL（不证明真实Next空fragment）", async () => {
  const { rerender } = render(view("/start#")); fireEvent.click(screen.getByText("目标"));
  expect(location.href.endsWith("/start#")).toBe(true);
  rerender(view("/start#bad%xx#tail")); fireEvent.click(screen.getByText("目标"));
  expect(location.hash).toBe("#bad%xx#tail");
});
it("原生Next不同路由提交会使旧目标失效，重新访问旧路由不能复活fragment", async () => {
  const { rerender } = render(view("/target#stale")); fireEvent.click(screen.getByText("目标"));
  act(() => { onRouterTransitionStart(); window.history.pushState({}, "", "/native-new"); next.pathname = "/native-new"; }); rerender(view("/target#stale"));
  act(() => { window.history.pushState({}, "", "/target"); next.pathname = "/target"; }); rerender(view("/target#stale"));
  expect(location.pathname + location.hash).toBe("/target");
});
it("原生Next取消后再次访问旧路由的新fragment不能被旧值覆盖", async () => {
  const { rerender } = render(view("/target?tag=a&tag=b#stale")); fireEvent.click(screen.getByText("目标"));
  act(() => { onRouterTransitionStart(); window.history.pushState({}, "", "/native-new"); next.pathname = "/native-new"; }); rerender(view("/target?tag=a&tag=b#stale"));
  act(() => { window.history.pushState({}, "", "/target?tag=a&tag=b#latest#legal"); next.pathname = "/target"; next.query = "tag=a&tag=b"; }); rerender(view("/target?tag=a&tag=b#stale"));
  expect(location.pathname + location.search + location.hash).toBe("/target?tag=a&tag=b#latest#legal");
});
it("尚未提交时的来源路由重渲染不能误取消当前请求", async () => {
  const { rerender } = render(view("/target#generator")); fireEvent.click(screen.getByText("目标"));
  rerender(view("/target#generator"));
  act(() => { window.history.pushState({}, "", "/target"); next.pathname = "/target"; }); rerender(view("/target#generator"));
  await finishNavigation();
  expect(location.hash).toBe("#generator");
});
it("同目标路由的原生新hash已提交时尊重新片段", async () => {
  const { rerender } = render(view("/target#stale")); fireEvent.click(screen.getByText("目标"));
  act(() => { onRouterTransitionStart(); window.history.pushState({}, "", "/target#latest"); next.pathname = "/target"; }); rerender(view("/target#stale"));
  expect(location.hash).toBe("#latest");
});
it("同一路由的快速共享请求只消费最新片段", async () => {
  const { rerender } = render(view("/target#first")); fireEvent.click(screen.getByText("目标"));
  rerender(view("/target#latest#legal")); fireEvent.click(screen.getByText("目标"));
  act(() => { window.history.pushState({}, "", "/target"); next.pathname = "/target"; }); rerender(view("/target#latest#legal"));
  await finishNavigation();
  expect(location.hash).toBe("#latest#legal");
});
it("旧共享提交之后的其他原生提交仍使最新pending失效", async () => {
  const { rerender } = render(view("/first#old")); fireEvent.click(screen.getByText("目标"));
  rerender(view("/second#latest")); fireEvent.click(screen.getByText("目标"));
  for (const path of ["/first", "/native-new", "/second"]) {
    act(() => { if (path === "/native-new") onRouterTransitionStart(); window.history.pushState({}, "", path); next.pathname = path; }); rerender(view("/second#latest"));
  }
  expect(location.pathname + location.hash).toBe("/second");
});
it("原生hashchange结束当前请求，重新访问不复活旧片段", async () => {
  const { rerender } = render(view("/target#stale")); fireEvent.click(screen.getByText("目标"));
  act(() => { window.history.pushState({}, "", "/start#native"); window.dispatchEvent(new HashChangeEvent("hashchange")); });
  act(() => { window.history.pushState({}, "", "/target"); next.pathname = "/target"; }); rerender(view("/target#stale"));
  expect(location.pathname + location.hash).toBe("/target");
});
it("原生重访旧共享route也必须取消当前pending，不能仅按route白名单保活", async () => {
  const { rerender } = render(view("/first#old")); fireEvent.click(screen.getByText("目标"));
  rerender(view("/second#stale")); fireEvent.click(screen.getByText("目标"));
  act(() => { onRouterTransitionStart(); window.history.pushState({}, "", "/first"); next.pathname = "/first"; }); rerender(view("/second#stale"));
  await finishNavigation();
  act(() => { window.history.pushState({}, "", "/second"); next.pathname = "/second"; }); rerender(view("/second#stale"));
  expect(location.pathname + location.hash).toBe("/second");
});
it("transition结束仍停在来源路由表示取消，后续访问不能复活pending", async () => {
  const { rerender } = render(view("/target#stale")); fireEvent.click(screen.getByText("目标"));
  await finishNavigation();
  act(() => { window.history.pushState({}, "", "/target"); next.pathname = "/target"; }); rerender(view("/target#stale"));
  expect(location.pathname + location.hash).toBe("/target");
});
it("已提交路由使文档语言en→zh→en，保query和fragment且不发新导航", () => {
  const { rerender } = render(view("/target#generator"));
  for (const [path, language] of [["/zh-CN/ai-video-generator", "zh-CN"], ["/ai-video-generator", "en"], ["/zh-CN/ai-video-generator", "zh-CN"], ["/ai-video-generator", "en"]]) {
    act(() => { window.history.replaceState({}, "", `${path}?tag=a&tag=b#generator#legal`); next.pathname = path; next.query = "tag=a&tag=b"; });
    rerender(view("/target#generator"));
    expect(document.documentElement).toHaveAttribute("lang", language);
    expect(location.search + location.hash).toBe("?tag=a&tag=b#generator#legal");
  }
  expect(next.push).not.toHaveBeenCalled(); expect(next.replace).not.toHaveBeenCalled();
});
it("中文根、子路径及旧美妆兼容为中文，英文login和未知路径为英文", () => {
  const { rerender } = render(view("/target"));
  for (const [path, language] of [["/zh-CN", "zh-CN"], ["/zh-CN/cogvideox-video-generator", "zh-CN"], ["/zh/ai-makeup", "zh-CN"], ["/login", "en"], ["/unknown-route", "en"], ["/zh-CNish", "en"]]) {
    act(() => { window.history.replaceState({}, "", path); next.pathname = path; }); rerender(view("/target"));
    expect(document.documentElement).toHaveAttribute("lang", language);
  }
});
it("拒绝过期pathname后，同pathname的后续合法提交仍恢复语言同步", () => {
  // 首次hook仍报告旧英文路径，而真实URL已进入中文；不得把中文初值改回英文。
  document.documentElement.lang = "zh-CN";
  window.history.replaceState({}, "", "/zh-CN/ai-video-generator");
  const { rerender } = render(view("/target"));
  expect(document.documentElement).toHaveAttribute("lang", "zh-CN");
  // 真实URL恢复为同一个hook路径。pathname依赖没有变化，但新的合法render必须检查。
  act(() => window.history.replaceState({}, "", "/start"));
  rerender(view("/target"));
  expect(document.documentElement).toHaveAttribute("lang", "en");
});
it("pathname为null时保服务端初值，随后合法提交可恢复", () => {
  document.documentElement.lang = "zh-CN"; next.pathname = null;
  const { rerender } = render(view("/target"));
  expect(document.documentElement).toHaveAttribute("lang", "zh-CN");
  act(() => { next.pathname = "/start"; }); rerender(view("/target"));
  expect(document.documentElement).toHaveAttribute("lang", "en");
});
it("服务端初值已正确及query/hash变化时不重复写lang，卸载不回写旧值", () => {
  document.documentElement.lang = "zh-CN"; next.pathname = "/zh-CN";
  window.history.replaceState({}, "", "/zh-CN");
  const setter = vi.spyOn(document.documentElement, "lang", "set");
  try {
    const { rerender, unmount } = render(view("/target"));
    act(() => { window.history.replaceState({}, "", "/zh-CN?tab=text#generator"); next.query = "tab=text"; });
    rerender(view("/target"));
    expect(setter).not.toHaveBeenCalled();
    unmount(); expect(setter).not.toHaveBeenCalled();
  } finally { setter.mockRestore(); }
});
