import Link from "next/link";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomepageCarousel } from "./platform-homepage-carousel";

describe("首页横滑行为", () => {
  let disconnect: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    disconnect = vi.fn();
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect = disconnect; });
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
  });
  afterEach(() => vi.unstubAllGlobals());
  function setup(loop = false) {
    const result = render(<HomepageCarousel title="视频工具" locale="zh-CN" loop={loop}><Link href="/first">第一个</Link><Link href="/second">第二个</Link></HomepageCarousel>);
    const track = screen.getByRole("group", { name: "视频工具" });
    Object.defineProperties(track, { scrollWidth: { value: 900 }, clientWidth: { value: 300 } });
    vi.spyOn(track.firstElementChild!, "getBoundingClientRect").mockReturnValue({ width: 200 } as DOMRect);
    const scroll = vi.fn(({ left }: { left: number }) => { track.scrollLeft = left; fireEvent.scroll(track); });
    Object.defineProperty(track, "scrollTo", { value: scroll });
    act(() => fireEvent.scroll(track));
    return { ...result, track, scroll };
  }
  it("箭头真正滚动，边界禁用且键盘可到达末端", () => {
    const { track, scroll, unmount } = setup();
    expect(screen.getByRole("button", { name: "上一组: 视频工具" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "下一组: 视频工具" }));
    expect(scroll).toHaveBeenCalledWith({ left: 200, behavior: "instant" });
    fireEvent.keyDown(track, { key: "ArrowRight" });
    fireEvent.keyDown(track, { key: "ArrowRight" });
    expect(track.scrollLeft).toBe(600);
    expect(screen.getByRole("button", { name: "下一组: 视频工具" })).toBeDisabled();
    unmount(); expect(disconnect).toHaveBeenCalled();
  });
  it("循环轮播在末端回到开头", () => {
    const { track } = setup(true);
    track.scrollLeft = 600; fireEvent.scroll(track);
    fireEvent.click(screen.getByRole("button", { name: "下一组: 视频工具" }));
    expect(track.scrollLeft).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "上一组: 视频工具" }));
    expect(track.scrollLeft).toBe(600);
  });
});
