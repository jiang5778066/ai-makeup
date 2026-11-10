import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Link from "next/link";
import { HomepageToolCard } from "./platform-homepage-cards";
import { landingVideoTools, workspaceVideoTools, workspaceImageTools } from "@/lib/platform-homepage-data";
import { HomepageVideo, HomepageImageSequence } from "./platform-homepage-media";

describe("首页公开视频预览", () => {
  let intersections: { node?: Element; emit: (visible: boolean) => void; disconnect: () => void }[];
  let reduced: boolean;
  let preferenceListener: () => void;
  let play: ReturnType<typeof vi.spyOn>;
  let pause: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    intersections = []; reduced = false; preferenceListener = () => {};
    vi.stubGlobal("IntersectionObserver", class {
      record: typeof intersections[number];
      constructor(callback: IntersectionObserverCallback) { this.record = { emit: visible => callback([{ isIntersecting: visible, intersectionRatio: visible ? 1 : 0 } as IntersectionObserverEntry], this as unknown as IntersectionObserver), disconnect: vi.fn() }; intersections.push(this.record); }
      observe(node: Element) { this.record.node = node; }
      disconnect() { this.record.disconnect(); }
    });
    vi.stubGlobal("matchMedia", () => ({ get matches() { return reduced; }, addEventListener: (_: string, listener: () => void) => { preferenceListener = listener; }, removeEventListener: vi.fn() }));
    play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function(this: HTMLMediaElement) { Object.defineProperty(this, "paused", { configurable: true, value: false }); fireEvent.play(this); return Promise.resolve(); });
    pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function(this: HTMLMediaElement) { Object.defineProperty(this, "paused", { configurable: true, value: true }); fireEvent.pause(this); });
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
  const preview = (trigger: "visible" | "hover" = "visible") => <HomepageVideo poster="/poster.jpg" src="/preview.mp4" locale="zh-CN" trigger={trigger} />;

  it("原生控件默认关闭，明确开启后原生暂停不被悬停聚焦改回播放", async () => {
    const view=render(preview());expect(view.container.querySelector("video")).not.toHaveAttribute("controls");view.unmount();
    const current=render(<HomepageVideo poster="/poster.jpg" src="/preview.mp4" locale="en" nativeControls/>);
    const video=current.container.querySelector("video")!;expect(video).toHaveAttribute("controls");
    await act(async()=>intersections.at(-1)!.emit(true));const calls=play.mock.calls.length;
    pause.mock.calls.length=0;video.pause();fireEvent.pointerEnter(video.parentElement!);fireEvent.focusIn(video);
    expect(video.paused).toBe(true);expect(play).toHaveBeenCalledTimes(calls);
    await act(async()=>video.play());expect(video.paused).toBe(false);
    act(()=>intersections.at(-1)!.emit(false));expect(video).not.toHaveAttribute("src");current.unmount();expect(video).not.toHaveAttribute("src");
  });
  it("进入视口才请求视频，离开暂停并释放媒体，卸载清理观察器", async () => {
    const { container, unmount } = render(preview()); const video = container.querySelector("video")!;
    expect(video).not.toHaveAttribute("src");
    await act(async () => intersections[0].emit(true));
    expect(video).toHaveAttribute("src", "/preview.mp4"); expect(play).toHaveBeenCalled(); expect(video.muted).toBe(true); expect(video.loop).toBe(true);
    act(() => intersections[0].emit(false)); expect(pause).toHaveBeenCalled(); expect(video).not.toHaveAttribute("src");
    unmount(); expect(intersections[0].disconnect).toHaveBeenCalled();
  });
  it.each([false, true])("pause 事件缺失或延迟时仍可继续播放（延迟=%s）", async delayed => {
    pause.mockImplementation(function(this: HTMLMediaElement) { Object.defineProperty(this, "paused", { configurable: true, value: true }); });
    const { container } = render(preview());
    const video = container.querySelector("video")!;
    await act(async () => intersections[0].emit(true));
    fireEvent.click(screen.getByRole("button", { name: "暂停展示视频" }));
    expect(video).not.toHaveAttribute("src");
    expect(screen.getByRole("button", { name: "播放展示视频" })).toBeVisible();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "播放展示视频" })));
    if (delayed) fireEvent.pause(video);
    expect(video).toHaveAttribute("src", "/preview.mp4");
    expect(screen.getByRole("button", { name: "暂停展示视频" })).toBeVisible();
    expect(play).toHaveBeenCalledTimes(2);
  });
  it("停止后迟到的 play 事件和 Promise 不得复活状态，旧拒绝不影响新播放", async () => {
    let resolveOld!: () => void;
    play.mockImplementationOnce(function(this: HTMLMediaElement) { Object.defineProperty(this, "paused", { configurable: true, value: false }); fireEvent.play(this); return new Promise<void>(resolve => { resolveOld = resolve; }); });
    pause.mockImplementation(function(this: HTMLMediaElement) { Object.defineProperty(this, "paused", { configurable: true, value: true }); });
    const { container, unmount } = render(preview());
    const video = container.querySelector("video")!;
    await act(async () => intersections[0].emit(true));
    fireEvent.click(screen.getByRole("button", { name: "暂停展示视频" }));
    await act(async () => { fireEvent.play(video); resolveOld(); });
    expect(video).not.toHaveAttribute("src");
    expect(screen.getByRole("button", { name: "播放展示视频" })).toBeVisible();
    let rejectOld!: (error: Error) => void;
    play.mockImplementationOnce(function(this: HTMLMediaElement) { Object.defineProperty(this, "paused", { configurable: true, value: false }); fireEvent.play(this); return new Promise<void>((_, reject) => { rejectOld = reject; }); });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "播放展示视频" })));
    fireEvent.click(screen.getByRole("button", { name: "暂停展示视频" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "播放展示视频" })));
    await act(async () => rejectOld(new Error("迟到的旧请求失败")));
    expect(screen.getByRole("button", { name: "暂停展示视频" })).toBeVisible();
    unmount(); expect(video).not.toHaveAttribute("src");
  });
  it("卸载后才完成的播放仍释放资源", async () => {
    let finish!: () => void;
    play.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
    const { container, unmount } = render(preview()); const video = container.querySelector("video")!;
    await act(async () => intersections[0].emit(true)); unmount();
    await act(async () => finish()); expect(video).not.toHaveAttribute("src");
    expect(pause).toHaveBeenCalled();
  });
  it("工作台悬停才播放，鼠标离开暂停，键盘聚焦同样可预览", async () => {
    const { container } = render(<div data-preview-card><Link href="/target">模型入口</Link>{preview("hover")}</div>);
    await act(async () => intersections[0].emit(true)); expect(play).not.toHaveBeenCalled();
    await act(async () => fireEvent.pointerEnter(container.firstChild!)); expect(play).toHaveBeenCalledTimes(1);
    act(() => fireEvent.pointerLeave(container.firstChild!)); expect(container.querySelector("video")).not.toHaveAttribute("src");
    await act(async () => fireEvent.focusIn(screen.getByRole("link"))); expect(play).toHaveBeenCalledTimes(2);
  });
  it("减少动态时保留海报，手动播放可用，暂停后不会由观察器自动重播", async () => {
    reduced = true; const { container } = render(preview());
    await act(async () => intersections[0].emit(true)); expect(play).not.toHaveBeenCalled(); expect(container.querySelector("img")).toHaveAttribute("src", "/poster.jpg");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "播放展示视频" })));
    expect(play).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "暂停展示视频" }));
    await act(async () => { intersections[0].emit(false); intersections[0].emit(true); }); expect(play).toHaveBeenCalledTimes(1);
  });
  it("自动播放被阻止仍可手动重试，控件不触发卡片导航", async () => {
    play.mockRejectedValueOnce(new DOMException("blocked", "NotAllowedError")); const navigate = vi.fn();
    const { container } = render(<div data-preview-card onClick={navigate}><Link href="/target">入口</Link>{preview()}</div>);
    await act(async () => intersections[0].emit(true));
    const control = screen.getByRole("button", { name: "播放展示视频" }); expect(control.closest("a")).toBeNull();
    await act(async () => fireEvent.click(control)); expect(navigate).not.toHaveBeenCalled(); expect(play).toHaveBeenCalledTimes(2); expect(container.querySelector("img")).toBeVisible();
  });
  it("同时最多三个可见预览取源，空位释放后后续预览开始", async () => {
    const { container } = render(<>{[0,1,2,3].map(i => <div key={i}>{preview()}</div>)}</>);
    await act(async () => intersections.forEach(observer => observer.emit(true)));
    expect([...container.querySelectorAll("video")].filter(v => v.hasAttribute("src"))).toHaveLength(3);
    await act(async () => intersections[0].emit(false)); expect(container.querySelectorAll("video")[3]).toHaveAttribute("src", "/preview.mp4");
  });
  it("观察器回调顺序不改变相同可见比例下的页面播放优先级", async () => {
    const { container } = render(<>{[0,1,2,3].map(i => <div key={i}>{preview()}</div>)}</>);
    await act(async () => [...intersections].reverse().forEach(observer => observer.emit(true)));
    const videos = [...container.querySelectorAll("video")];
    expect(videos.slice(0, 3).every(video => video.hasAttribute("src"))).toBe(true);
    expect(videos[3]).not.toHaveAttribute("src");
  });
  it("动态偏好变更会停止自动播放", async () => {
    const { container } = render(preview()); await act(async () => intersections[0].emit(true));
    reduced = true; act(() => preferenceListener()); expect(container.querySelector("video")).not.toHaveAttribute("src");
  });
  it("宣传唇形同步只有图片，工作台对应卡为已观察视频，图片工具保持图片", () => {
    const landing = renderToStaticMarkup(<HomepageToolCard card={landingVideoTools.find(card => card.id === "lip-sync")!} locale="zh-CN" detailed/>);
    const workspace = renderToStaticMarkup(<HomepageToolCard card={workspaceVideoTools.find(card => card.id === "lip-sync")!} locale="zh-CN"/>);
    const image = renderToStaticMarkup(<HomepageToolCard card={workspaceImageTools[0]} locale="zh-CN"/>);
    expect(landing).not.toContain("<video"); expect(workspace).toContain("<video"); expect(image).not.toContain("<video");
    expect(workspace).toContain('href="/zh-CN/tools/ai-lip-sync-video-generator"');
    expect(workspace).not.toMatch(/<a[^>]*>[^]*<button[^]*<\/a>/);
  });

  it("图片主卡可见时按顺序循环，暂停和卸载会清理计时器", () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<HomepageImageSequence images={["/1.webp", "/2.webp", "/3.webp", "/4.webp"]} locale="zh-CN"/>);
    const sequence = container.firstElementChild!;
    act(() => vi.advanceTimersByTime(2500)); expect(sequence).toHaveAttribute("data-index", "0");
    act(() => intersections[0].emit(true));
    act(() => vi.advanceTimersByTime(2500)); expect(sequence).toHaveAttribute("data-index", "1");
    act(() => vi.advanceTimersByTime(7500)); expect(sequence).toHaveAttribute("data-index", "0");
    fireEvent.click(screen.getByRole("button", { name: "暂停图片轮播" }));
    act(() => intersections[1].emit(true));
    act(() => vi.advanceTimersByTime(5000)); expect(sequence).toHaveAttribute("data-index", "0");
    unmount(); expect(vi.getTimerCount()).toBe(0);
  });
  it("图片主卡尊重减少动态偏好，离开视口停止自动切换", () => {
    vi.useFakeTimers(); reduced = true;
    const { container } = render(<HomepageImageSequence images={["/1.webp", "/2.webp"]} locale="zh-CN"/>);
    act(() => intersections[0].emit(true));
    act(() => vi.advanceTimersByTime(5000)); expect(container.firstElementChild).toHaveAttribute("data-index", "0");
    reduced = false; act(() => preferenceListener());
    act(() => vi.advanceTimersByTime(2500)); expect(container.firstElementChild).toHaveAttribute("data-index", "1");
    act(() => intersections[0].emit(false));
    act(() => vi.advanceTimersByTime(5000)); expect(container.firstElementChild).toHaveAttribute("data-index", "1");
  });
});
