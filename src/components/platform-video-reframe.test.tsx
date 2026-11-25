import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalVideoPlayer } from "./platform-local-video-player";
import { LocalVideoWorkspace } from "./platform-local-video-workspace";
import { VideoReframePage } from "./platform-video-reframe-page";

describe("本地竖屏构图", () => {
  it("双语页面说明预览范围并提供本地视频选取", () => {
    render(<VideoReframePage locale="zh-CN" />);
    const content = screen.getByRole("main");
    expect(within(content).getByRole("heading", { name: "横屏转竖屏预览" })).toBeVisible();
    expect(within(content).getByRole("button", { name: "选择视频" })).toBeEnabled();
    expect(within(content).getByText("构图仅在浏览器中预览，原文件保持原样。")).toBeVisible();
  });

  it.each([
    [90, 160, "9:16", "4:5", "Vertical framing"],
    [80, 100, "4:5", "9:16", "Horizontal framing"]
  ] as const)("等比源视频 %i×%i 隐藏无效滑块，换比例恢复可调轴", (width, height, fitFrame, otherFrame, axis) => {
    const source = { width, height, duration: 2, url: "blob:fixture", name: "fixture.mp4" };
    const view = render(<LocalVideoPlayer locale="en" source={source} onError={vi.fn()} portraitPreview />);
    const ratio = screen.getByRole("combobox", { name: "Preview aspect ratio" });
    fireEvent.change(ratio, { target: { value: fitFrame } });
    expect(screen.queryByRole("slider")).toBeNull();
    fireEvent.change(ratio, { target: { value: otherFrame } });
    expect(screen.getByRole("slider", { name: axis })).toBeVisible();
    view.unmount();
  });

  it("普通视频工作区保留已有上传行为", () => {
    render(<LocalVideoWorkspace locale="en" />);
    expect(screen.getByRole("button", { name: "Choose video" })).toBeEnabled();
    expect(screen.queryByRole("combobox", { name: "Output frame" })).toBeNull();
  });
});
