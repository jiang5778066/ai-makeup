import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { CreationDTO } from "@/lib/platform-creations-types";
import { PlatformCreationsPanel } from "./platform-creations-panel";
import { PlatformCreationsPreview } from "./platform-creations-preview";
const { account } = vi.hoisted(() => ({ account: { status: "signed_in", user: { id: "alice", email: "alice@test.invalid" }, epoch: 1 } }));
vi.mock("@/lib/platform-account-session", () => ({ usePlatformAccount: () => account, expirePlatformAccount: vi.fn(), getPlatformAccountEpoch: () => account.epoch }));
const item: CreationDTO = { version: 1, id: "makeup:original-id", kind: "makeup", mediaType: "image", title: "natural", status: "done", createdAt: "2026-11-09T00:00:00Z", updatedAt: "2026-11-09T00:00:00Z", removable: true, result: { url: "https://test.invalid/a.png", mimeType: "image/png", expiresAt: null } };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); account.epoch = 1; account.user.id = "alice"; });
it("取消移除零请求；确认失败保留卡片并可重试", async () => {
  const fetcher = vi.fn().mockImplementation(async (_url, options) => options?.method === "DELETE" ? json({}, 503) : json({ items: [item], nextCursor: null })); vi.stubGlobal("fetch", fetcher);
  const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValue(true);
  render(<PlatformCreationsPanel locale="zh-CN" initialFilter="all" path="/zh-CN/my-creations" />);
  fireEvent.click(await screen.findByRole("button", { name: "从列表移除" })); expect(fetcher.mock.calls.filter(call => call[1]?.method === "DELETE")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "从列表移除" })); expect(await screen.findByRole("alert")).toHaveTextContent("移除失败"); expect(screen.getByRole("button", { name: "从列表移除" })).toBeEnabled(); expect(confirm).toHaveBeenCalledTimes(2);
});
it("切账户取消旧列表，晚响应不会显示上一账户作品", async () => {
  let resolve!: (r: Response) => void;
  const fetcher = vi.fn().mockImplementationOnce(() => new Promise(r => { resolve = r; })).mockResolvedValue(json({ items: [], nextCursor: null })); vi.stubGlobal("fetch", fetcher);
  const view = render(<PlatformCreationsPanel locale="en" initialFilter="all" path="/my-creations" />); await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
  const signal = fetcher.mock.calls[0][1].signal; account.epoch = 2; account.user.id = "bob"; view.rerender(<PlatformCreationsPanel locale="en" initialFilter="all" path="/my-creations" />);
  await screen.findByText("No creations yet"); resolve(json({ items: [item], nextCursor: null })); await waitFor(() => expect(signal.aborted).toBe(true)); expect(screen.queryByText("natural")).toBeNull();
});
it("预览视频使用video与MIME，Tab循环、Escape关闭并还焦", async () => {
  const close = vi.fn(); const trigger = document.createElement("button"); document.body.append(trigger); trigger.focus();
  const view = render(<PlatformCreationsPreview item={{ ...item, mediaType: "video", kind: "media", result: { url: "/fixture.webm", mimeType: "video/webm", expiresAt: null } }} locale="en" onClose={close} onRefresh={vi.fn()} />);
  const video = document.querySelector("video source"); expect(video).toHaveAttribute("type", "video/webm"); const buttons = within(screen.getByRole("dialog")).getAllByRole("button"); buttons.at(-1)!.focus(); fireEvent.keyDown(document, { key: "Tab" }); expect(document.activeElement).toBe(buttons[0]); fireEvent.keyDown(document, { key: "Escape" }); expect(close).toHaveBeenCalledOnce(); view.unmount(); expect(document.activeElement).toBe(trigger); trigger.remove();
});
it("预览关闭时主动焦点已到外部，不抢回触发器或BODY", () => {
  const trigger = document.createElement("button"), outside = document.createElement("button"); document.body.append(trigger, outside); trigger.focus();
  const view = render(<PlatformCreationsPreview item={item} locale="en" onClose={vi.fn()} onRefresh={vi.fn()}/>); outside.focus(); view.unmount(); expect(document.activeElement).toBe(outside); trigger.remove(); outside.remove();
});
