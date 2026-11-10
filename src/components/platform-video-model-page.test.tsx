import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PlatformVideoModelPage } from "./platform-video-model-page";
import { PlatformVideoGeneratorForm } from "./platform-video-generator-form";
import { initializeGenerator } from "@/lib/platform-generator-parameters";

vi.mock("./site-shell", () => ({
  SiteShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("next/navigation", () => ({ usePathname: () => window.location.pathname, useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("./platform-homepage-media", () => ({
  HomepageVideo: ({ poster }: { poster: string }) => <span role="img" aria-label="公开视频海报" data-poster={poster} />,
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => { window.history.replaceState({}, "", "/"); });

function navigate(path: string) { act(() => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }); }

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function close() { this.removeAttribute("open"); };
});

describe("C2c视频模型专页本地表单边界", () => {
  it("四条路径保持各自标题身份并禁用生成", () => {
    const cases = [
      ["/ai-video-models/kling-ai", "Kling AI Video Generator on Lanta AI"],
      ["/ai-video-models/kling-3-0", "Kling 3.0: All-in-One AI Video Generator"],
      ["/ai-video-models/seedance-2-0", "Seedance 2.0 AI Video Generator"],
      ["/ai-video-models/happy-horse-1-0", "HappyHorse 1.0 AI Video Generator"],
    ] as const;

    for (const [path, title] of cases) {
      window.history.replaceState({}, "", path);
      const view = render(<PlatformVideoModelPage path={path} locale="en" />);
      const page = document.querySelector("main.platform-video-model-page")!;
      expect(page).toHaveAttribute("data-generation-availability", "unavailable");
      expect(screen.getByRole("heading", { level: 1 }).textContent?.replace(/\s/g,"" )).toBe(title.replace(/\s/g,""));
      expect(screen.getByRole("button", { name: "Generation not available yet" })).toBeDisabled();
      view.unmount();
    }
  });

  it("Kling本地会员提示关闭后保留原时长且不提交请求", () => {
    const request = vi.spyOn(globalThis, "fetch");
    window.history.replaceState({}, "", "/ai-video-models/kling-ai");
    render(<PlatformVideoModelPage path="/ai-video-models/kling-ai" locale="en" />);
    const duration = screen.getByRole("group", { name: "Duration" });
    fireEvent.click(within(duration).getByRole("button", { name: /^10s/ }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Kling 2.6 at 10 seconds");
    fireEvent.click(screen.getByRole("button", { name: "Back to settings" }));
    expect(within(duration).getByRole("button", { name: /^5s/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(duration).getByRole("button", { name: /^10s/ })).toHaveAttribute("aria-pressed", "false");
    expect(request).not.toHaveBeenCalled();
    request.mockRestore();
  });

  it("真实URL订阅使A8→B12编辑→A分别恢复，无关query和hash不清编辑，语言往返隔离文件生命周期", () => {
    navigate("/ai-video-models/seedance-2-0?duration=8");
    const view = render(<PlatformVideoModelPage path="/ai-video-models/seedance-2-0" locale="en" initialQuery="duration=8"/>);
    fireEvent.change(screen.getByRole("textbox", {name:"Prompt"}), {target:{value:"A edited"}});
    navigate("/ai-video-models/seedance-2-0?duration=12");
    expect(screen.getByRole("button",{name:/^12s/})).toHaveAttribute("aria-pressed","true");
    expect(screen.getByRole("textbox",{name:"Prompt"})).toHaveValue("");
    fireEvent.change(screen.getByRole("textbox",{name:"Prompt"}),{target:{value:"B edited"}});
    fireEvent.click(screen.getByRole("button",{name:/^15s/}));
    navigate("/ai-video-models/seedance-2-0?duration=8&utm_source=preview#examples");
    expect(screen.getByRole("textbox",{name:"Prompt"})).toHaveValue("A edited");
    expect(screen.getByRole("button",{name:/^8s/})).toHaveAttribute("aria-pressed","true");
    navigate("/ai-video-models/seedance-2-0?duration=12&duration=4#other");
    expect(screen.getByRole("textbox",{name:"Prompt"})).toHaveValue("B edited");
    expect(screen.getByRole("button",{name:/^15s/})).toHaveAttribute("aria-pressed","true");
    navigate("/zh-CN/ai-video-models/seedance-2-0?duration=12");
    view.rerender(<PlatformVideoModelPage path="/ai-video-models/seedance-2-0" locale="zh-CN" initialQuery="duration=12"/>);
    expect(screen.getByRole("textbox",{name:"提示词"})).toHaveValue("B edited");
    navigate("/ai-video-models/happy-horse-1-0?duration=12");
    view.rerender(<PlatformVideoModelPage path="/ai-video-models/happy-horse-1-0" locale="en" initialQuery="duration=12"/>);
    expect(screen.getByRole("textbox",{name:"Prompt"})).toHaveValue("");
  });

  it("把无效URL参数原因显示为专页可见状态", () => {
    navigate("/ai-video-models/seedance-2-0?duration=8x&resolution=4K");
    render(<PlatformVideoModelPage path="/ai-video-models/seedance-2-0" locale="en" initialQuery="duration=8x&resolution=4K" />);
    const statusText = screen.getAllByRole("status").map((node) => node.textContent).join(" ");
    expect(statusText).toMatch(/duration/i);
    expect(statusText).toMatch(/quality/i);
    fireEvent.change(screen.getByRole("textbox",{name:"Prompt"}),{target:{value:"preserve URL issues"}});
    expect(screen.getAllByRole("status").map(x=>x.textContent).join(" ")).toMatch(/duration is malformed/);
    fireEvent.click(screen.getByRole("button",{name:/^6s/}));
    expect(screen.getAllByRole("status").map(x=>x.textContent).join(" ")).not.toMatch(/duration is malformed/);
    expect(screen.getAllByRole("status").map(x=>x.textContent).join(" ")).toMatch(/quality/);
  });
  it("中文非法参数与局部门槛分别可见，合法编辑只清对应字段", () => {
    navigate("/zh-CN/ai-video-models/kling-ai?duration=10&sound=maybe");
    render(<PlatformVideoModelPage path="/ai-video-models/kling-ai" locale="zh-CN" initialQuery="duration=10&sound=maybe" />);
    expect(screen.getAllByRole("status").map(x=>x.textContent).join(" ")).toContain("会员条件");
    expect(screen.getAllByRole("status").map(x=>x.textContent).join(" ")).toContain("声音参数格式无效");
    fireEvent.click(screen.getByRole("checkbox", { name: "声音" }));
    const text=screen.getAllByRole("status").map(x=>x.textContent).join(" ");
    expect(text).not.toContain("声音参数格式无效");
    expect(text).toContain("会员条件");
  });
  it("未传本批policy的通用Wan2.5保留10s◇及原门槛，取消仍5s",()=>{
    const state=initializeGenerator("/ai-video-generator","");
    render(<PlatformVideoGeneratorForm state={state} onChange={vi.fn()} onFiles={vi.fn()} locale="en"/>);
    const group=screen.getByRole("group",{name:"Duration"});
    const ten=within(group).getByRole("button",{name:/^10s/});
    expect(ten).toHaveTextContent("◇");
    fireEvent.click(ten);
    expect(screen.getByRole("dialog")).toHaveTextContent("Wan 2.5");
    fireEvent.click(screen.getByRole("button",{name:"Back to settings"}));
    expect(within(group).getByRole("button",{name:/^5s/})).toHaveAttribute("aria-pressed","true");
  });

  it("Kling3切换文生明确回退1120且清理过期模式错误",()=>{
    navigate("/ai-video-models/kling-3-0?model=1130");
    render(<PlatformVideoModelPage path="/ai-video-models/kling-3-0" locale="en" initialQuery="model=1130"/>);
    fireEvent.click(screen.getByRole("tab",{name:"Text to Video"}));
    expect(document.querySelector("#video-model-settings")).toHaveAttribute("data-current-model","kling-2-6");
    const text=screen.getAllByRole("status").map(x=>x.textContent).join(" ");
    expect(text).toContain("switched to Kling 2.6");
    expect(text).not.toMatch(/does not support this mode|unsupported mode/i);
    expect(screen.getByRole("heading",{level:1})).toHaveTextContent("Kling 3.0");
  });

});


describe("C10提示归属与能力转换", () => {
  for (const locale of ["en", "zh-CN"] as const) {
    const zh = locale === "zh-CN";
    it(`${locale}实际Seedance回退、同模式no-op、声音历史和无关非法时长`, () => {
      const query = `model=112&sound=true&duration=invalid-c10-${locale}`;
      navigate(`${zh ? "/zh-CN" : ""}/ai-video-models/seedance-2-0?${query}`);
      render(<PlatformVideoModelPage path="/ai-video-models/seedance-2-0" locale={locale} initialQuery={query}/>);
      const prompt = screen.getByRole("textbox", {name:zh ? "提示词" : "Prompt"});
      fireEvent.change(prompt, {target:{value:"保留本轮编辑"}});
      const textTab = screen.getByRole("tab", {name:zh ? "文生视频" : "Text to Video"});
      fireEvent.click(textTab);
      const statuses = () => screen.queryAllByRole("status").map(x=>x.textContent).join(" ");
      expect(document.querySelector("#video-model-settings")).toHaveAttribute("data-current-model", "seedance-2-0");
      expect(statuses()).toContain(zh ? "切换为 Seedance 2.0" : "switched to Seedance 2.0");
      expect(statuses()).not.toContain("Kling 2.6");
      expect(statuses()).toContain(zh ? "未重新应用" : "has not been reapplied");
      expect(statuses()).not.toContain(zh ? "当前模型或模式不支持" : "unsupported for this model");
      const beforeNoop=statuses();fireEvent.click(textTab);expect(statuses()).toBe(beforeNoop);
      const sound=screen.getByRole("checkbox", {name:zh ? "声音" : "Sound"});
      expect(sound).not.toBeChecked();fireEvent.click(sound);expect(sound).toBeChecked();
      expect(statuses()).not.toMatch(zh ? /URL 声音/ : /URL sound/);
      expect(statuses()).toMatch(zh ? /时长格式无效/ : /duration is malformed/);
      fireEvent.click(screen.getByRole("button", {name:"6s"}));
      expect(statuses()).not.toMatch(zh ? /时长格式无效/ : /duration is malformed/);
      fireEvent.click(screen.getByRole("tab", {name:zh ? "图生视频" : "Image to Video"}));
      fireEvent.click(textTab);
      expect(sound).toBeChecked();expect(statuses()).not.toMatch(zh ? /URL 声音|时长格式无效/ : /URL sound|duration is malformed/);
      expect(prompt).toHaveValue("保留本轮编辑");
    });
    it(`${locale}未知模型与Kling3冲突分别只有一个准确原因`, () => {
      for (const [path, query, name] of [
        ["/ai-video-models/seedance-2-0", `model=unknown-c10-${locale}`, "Seedance 2.0"],
        ["/ai-video-models/kling-3-0", `mode=text-to-video&model=1130&sound=${zh}`, "Kling 2.6"],
      ] as const) {
        navigate(`${zh?"/zh-CN":""}${path}?${query}`);
        const view=render(<PlatformVideoModelPage path={path} locale={locale} initialQuery={query}/>);
        expect(screen.getAllByRole("status")).toHaveLength(1);
        expect(screen.getByRole("status")).toHaveTextContent(name);
        expect(screen.getByRole("status")).not.toHaveTextContent(/No other service has been substituted|Its own model is selected initially|未替换为其它服务|初选仍是本页模型/);
        view.unmount();
      }
    });
  }
  it("默认policy关闭时保留旧通用issue消费者", () => {
    const state=initializeGenerator("/ai-video-generator", "model=unknown-c10-control");
    render(<PlatformVideoGeneratorForm state={state} onChange={vi.fn()} onFiles={vi.fn()} locale="en"/>);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("No other service has been substituted");
  });
});
