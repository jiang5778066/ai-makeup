import { StrictMode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Explore, { metadata as englishMetadata } from "@/app/(marketing)/explore/page";
import ChineseExplore, { metadata as chineseMetadata } from "@/app/zh-CN/explore/page";

vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) { this.open = true; }
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) { this.open = false; }
  });
});

afterEach(() => { vi.restoreAllMocks(); });

it("两个正式入口提供各自的标题、canonical 和语言互链", () => {
  const alternates = { en: "/explore", "zh-CN": "/zh-CN/explore", "x-default": "/explore" };
  expect(englishMetadata.alternates).toEqual({ canonical: "/explore", languages: alternates });
  expect(chineseMetadata.alternates).toEqual({ canonical: "/zh-CN/explore", languages: alternates });
  expect(englishMetadata.robots).toBeUndefined();
  expect(chineseMetadata.robots).toBeUndefined();
  const { unmount } = render(<Explore />);
  expect(screen.getByRole("heading", { level: 1, name: "Community showcase" })).toBeVisible();
  unmount();
  render(<ChineseExplore />);
  expect(screen.getByRole("heading", { level: 1, name: "社区作品展示" })).toBeVisible();
});

it("每个分类筛选都有作品，切回全部恢复 12 张独立妆容图", () => {
  render(<ChineseExplore />);
  const gallery = screen.getByRole("region", { name: "妆容示例" });
  const filters = screen.getByRole("group", { name: "按妆容场景筛选" });
  const all = within(filters).getByRole("button", { name: "全部" });
  expect(within(gallery).getAllByRole("button")).toHaveLength(12);
  for (const label of ["日常", "特别场合", "创意"]) {
    const filter = within(filters).getByRole("button", { name: label });
    fireEvent.click(filter);
    expect(filter).toHaveAttribute("aria-pressed", "true");
    expect(all).toHaveAttribute("aria-pressed", "false");
    expect(within(gallery).getAllByRole("button")).toHaveLength(4);
  }
  fireEvent.click(all);
  expect(within(gallery).getAllByRole("button")).toHaveLength(12);
  expect(document.querySelector("video, input[type=file]")).toBeNull();
});

it.each(["escape", "button", "backdrop"])("以 %s 关闭详情后回到对应卡片", method => {
  render(<StrictMode><Explore /></StrictMode>);
  const trigger = screen.getByRole("button", { name: "Natural" });
  fireEvent.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "Natural" });
  const close = within(dialog).getByRole("button", { name: "Close preview" });
  expect(dialog).toHaveAttribute("open");
  expect(close).toHaveFocus();
  expect(within(dialog).getByText("FrameKoi example")).toBeVisible();
  expect(within(dialog).getByText("gpt-image-2")).toBeVisible();
  expect(within(dialog).getByText("1k")).toBeVisible();
  expect(within(dialog).queryByText(/prompt|published|author/i)).toBeNull();
  if (method === "escape") fireEvent(dialog, new Event("cancel", { cancelable: true }));
  else fireEvent.click(method === "button" ? close : dialog);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(trigger).toHaveFocus();
  expect(document.body.style.overflow).toBe("");
});

it("卡片缩略图和中文详情失败时显示可读状态，并可关闭详情", () => {
  render(<ChineseExplore />);
  const trigger = screen.getByRole("button", { name: "自然妆" });
  fireEvent.error(trigger.querySelector("img")!);
  expect(within(trigger).getByText("图片暂时无法加载")).toBeVisible();
  fireEvent.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "自然妆" });
  fireEvent.error(within(dialog).getByRole("img"));
  expect(within(dialog).getByText("图片暂时无法加载")).toBeVisible();
  expect(within(dialog).getByText("FrameKoi 示例")).toBeVisible();
  fireEvent.click(within(dialog).getByRole("button", { name: "关闭预览" }));
  expect(trigger).toHaveFocus();
});
