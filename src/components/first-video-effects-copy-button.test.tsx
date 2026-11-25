import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FirstVideoEffectsCopyButton } from "./first-video-effects-copy-button";

describe("FirstVideoEffectsCopyButton", () => {
  it("播报复制成功", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<FirstVideoEffectsCopyButton prompt="sample prompt" locale="en"/>);
    fireEvent.click(screen.getByRole("button", { name: "Copy sample prompt" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Prompt copied."));
    expect(writeText).toHaveBeenCalledWith("sample prompt");
  });

  it("剪贴板读取受限时引导手动复制", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<FirstVideoEffectsCopyButton prompt="sample prompt" locale="zh-CN"/>);
    fireEvent.click(screen.getByRole("button", { name: "复制示例提示词" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("复制失败，请手动选择并复制提示词。"));
  });

  it.each([
    { prompt: "New prompt", locale: "en" },
    { prompt: "English prompt", locale: "zh-CN" }
  ] as const)("切换到 $locale 的 $prompt 后清除已完成的复制状态", async next => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { rerender } = render(<FirstVideoEffectsCopyButton prompt="English prompt" locale="en"/>);

    fireEvent.click(screen.getByRole("button", { name: "Copy sample prompt" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Prompt copied."));

    rerender(<FirstVideoEffectsCopyButton {...next}/>);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it.each([
    { prompt: "New prompt", locale: "en" },
    { prompt: "Old prompt", locale: "zh-CN" }
  ] as const)("切换到 $locale 的 $prompt 后忽略仍未完成的旧复制操作", async next => {
    let finishCopy: (() => void) | undefined;
    const writeText = vi.fn().mockImplementation(() => new Promise<void>(resolve => { finishCopy = resolve; }));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const { rerender } = render(<FirstVideoEffectsCopyButton prompt="Old prompt" locale="en"/>);

    fireEvent.click(screen.getByRole("button", { name: "Copy sample prompt" }));
    expect(writeText).toHaveBeenCalledWith("Old prompt");

    rerender(<FirstVideoEffectsCopyButton {...next}/>);
    await act(async () => { finishCopy?.(); });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
