import { fireEvent, render, screen } from "@testing-library/react";
import { useLayoutEffect } from "react";
import { expect, it, vi } from "vitest";
import { PlatformHeader } from "./platform-header";
const navigation = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({ usePathname: () => "/zh-CN/ai-video-generator", useSearchParams: () => new URLSearchParams(navigation.query) }));
it("同路径客户端查询变化后登录 next 和语言链接保留当前重复参数与锚点", () => {
  window.history.replaceState({}, "", "/zh-CN/ai-video-generator");
  const { rerender } = render(<PlatformHeader locale="zh-CN" currentPath="/ai-video-generator" variant="workspace"/>);
  navigation.query = "model=wan-3-0&mode=text-to-video&tag=a&tag=b";
  const path = `/zh-CN/ai-video-generator?${navigation.query}#preview`;
  window.history.pushState({}, "", path);
  rerender(<PlatformHeader locale="zh-CN" currentPath="/ai-video-generator" variant="workspace"/>);
  expect(screen.getByRole("link", { name: "登录即可获得3积分" })).toHaveAttribute("href", `/login?next=${encodeURIComponent(path)}`);
  fireEvent.click(screen.getByRole("button", { name: "切换语言，当前为 简体中文" }));
  expect(screen.getByRole("menuitem", { name: "English" })).toHaveAttribute("href", `/ai-video-generator?${navigation.query}#preview`);
  navigation.query = ""; window.history.pushState({}, "", "/zh-CN/ai-video-generator");
  rerender(<PlatformHeader locale="zh-CN" currentPath="/ai-video-generator" variant="workspace"/>);
  expect(screen.getByRole("menuitem", { name: "English" })).toHaveAttribute("href", "/ai-video-generator");
});

function CommitHash({ hash }: { hash: string }) {
  useLayoutEffect(() => { window.history.replaceState({}, "", `/zh-CN/ai-video-generator?tag=a&tag=b${hash}`); }, [hash]);
  return null;
}
it("Next仅改hash且history晚于渲染提交时，链接也在提交后同步", () => {
  navigation.query = "tag=a&tag=b";
  window.history.replaceState({}, "", "/zh-CN/ai-video-generator?tag=a&tag=b#before");
  const view = (hash: string) => <><PlatformHeader locale="zh-CN" currentPath="/ai-video-generator" variant="workspace"/><CommitHash hash={hash}/></>;
  const { rerender } = render(view("#before"));
  fireEvent.click(screen.getByRole("button", { name: "切换语言，当前为 简体中文" }));
  rerender(view("#after"));
  expect(screen.getByRole("link", { name: "登录即可获得3积分" })).toHaveAttribute("href", `/login?next=${encodeURIComponent("/zh-CN/ai-video-generator?tag=a&tag=b#after")}`);
  expect(screen.getByRole("menuitem", { name: "English" })).toHaveAttribute("href", "/ai-video-generator?tag=a&tag=b#after");
});
