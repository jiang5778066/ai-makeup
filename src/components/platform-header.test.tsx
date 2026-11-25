import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlatformHeader } from "./platform-header";

const url = vi.hoisted(() => ({
  pending: undefined as Promise<void> | undefined,
  current: "",
  subscribers: new Set<() => void>(),
}));

vi.mock("./use-platform-url", async () => {
  const { useSyncExternalStore } = await import("react");
  const subscribe = (listener: () => void) => {
    url.subscribers.add(listener);
    return () => { url.subscribers.delete(listener); };
  };
  return { usePlatformUrl: (fallback: string) => {
    if (url.pending) throw url.pending;
    return useSyncExternalStore(subscribe, () => url.current || fallback, () => fallback);
  } };
});
vi.mock("@/lib/platform-account-session", () => ({
  usePlatformAccount: () => ({ status: "signed_out", epoch: 1, user: null }),
}));

beforeEach(() => {
  url.pending = undefined;
  url.current = "";
});

describe("页头地址恢复", () => {
  it.each([
    ["en", "/image-effects/ai-age-progression", "?age=4&ref=x&ref=y#generator", "简体中文", "/zh-CN/image-effects/ai-age-progression"],
    ["zh-CN", "/image-effects/ai-hair-color-changer", "?color=silver&ref=x&ref=y#hair-closing", "English", "/image-effects/ai-hair-color-changer"],
    ["en", "/image-style-converter", "?style=storybook#generator", "简体中文", "/zh-CN/image-style-converter"],
  ] as const)("观察者恢复后保留 %s %s 的语言按钮、菜单与焦点", async (locale, path, suffix, target, alternate) => {
    let resume!: () => void;
    url.pending = new Promise<void>(resolve => { resume = resolve; });
    const current = (locale === "zh-CN" ? "/zh-CN" : "") + path + suffix;
    render(<PlatformHeader locale={locale} currentPath={path} variant="workspace"/>);
    const header = screen.getByRole("banner");
    const button = within(header).getByRole("button", { name: /切换语言|Switch language/ });
    button.focus();
    fireEvent.keyDown(button, { key: "ArrowDown" });
    const menu = within(header).getByRole("menu");
    const first = within(menu).getAllByRole("menuitem")[0];
    await waitFor(() => expect(first).toHaveFocus());
    await act(async () => {
      url.current = current;
      url.pending = undefined;
      resume();
    });
    expect(screen.getByRole("banner")).toBe(header);
    expect(screen.getByRole("menu")).toBe(menu);
    expect(first).toHaveFocus();
    expect(within(menu).getByRole("menuitem", { name: target })).toHaveAttribute("href", alternate + suffix);
    const login = within(header).getByRole("link", { name: /^(登录|Sign in)$/ });
    expect(new URL(login.getAttribute("href")!, "https://example.com").searchParams.get("next")).toBe(current);
    fireEvent.keyDown(first, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(button).toHaveFocus();

    const updated = current.replace("#", "&tag=next#");
    act(() => {
      url.current = updated;
      url.subscribers.forEach(listener => listener());
    });
    expect(button).toHaveFocus();
    expect(new URL(login.getAttribute("href")!, "https://example.com").searchParams.get("next")).toBe(updated);
    fireEvent.keyDown(button, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: target })).toHaveAttribute("href", alternate + suffix.replace("#", "&tag=next#"));
  });
});
