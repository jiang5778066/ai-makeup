import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { refreshPlatformAccount } from "@/lib/platform-account-session";
import type { CreationDTO } from "@/lib/platform-creations-types";
import { PlatformCreationsPanel } from "./platform-creations-panel";
import { PlatformCreationsPreview } from "./platform-creations-preview";
const item: CreationDTO = { version: 1, id: "makeup:original-id", kind: "makeup", mediaType: "image", title: "natural", status: "done", createdAt: "2026-11-09T00:00:00Z", updatedAt: "2026-11-09T00:00:00Z", removable: true, result: { url: "https://test.invalid/a.png", mimeType: "image/png", expiresAt: null } };
const video: CreationDTO = {
  ...item,
  id: "media:alice-video",
  kind: "media",
  mediaType: "video",
  title: "Alice fixture video",
  result: { url: "/fixture.webm", mimeType: "video/webm", expiresAt: null },
};
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
const session = (id = "alice") => json({ user: { id, email: `${id}@test.invalid` } });
type CreationsFetch = (url: string, options: RequestInit) => Promise<Response>;
const stubCreationsFetch = (fetcher: CreationsFetch, accountResponse = session) => {
  vi.stubGlobal("fetch", async (url: string, options: RequestInit) => {
    if (url === "/api/account/session") return accountResponse();
    if (url.startsWith("/api/creations")) return fetcher(url, options);
    throw new Error(`未配置的测试请求 ${url}`);
  });
};
const videoQuery = "/api/creations?filter=video&limit=12";
const page = (items: CreationDTO[] = [], nextCursor: string | null = null) => json({ version: 1, items, nextCursor });
const videoLocales = [
  {
    locale: "en", path: "/my-creations", videoFilter: "Videos", imageFilter: "Images", makeupFilter: "Makeup category",
    loading: "Loading creations…", empty: "No video creations yet", genericEmpty: "No creations yet",
    unavailable: "Video creations are temporarily unavailable. Please try again.", retry: "Retry loading",
    more: "Load more", preview: "Preview", download: "Download", remove: "Remove from list",
    refreshList: "Refresh list", refreshItem: "Refresh status / link", refreshFailed: "Result check failed. Please retry the original creation.",
    refreshPreview: "Refresh result link", closePreview: "Close preview",
  },
  {
    locale: "zh-CN", path: "/zh-CN/my-creations", videoFilter: "视频", imageFilter: "图片", makeupFilter: "美妆分类",
    loading: "正在读取作品…", empty: "暂无视频作品", genericEmpty: "暂无作品",
    unavailable: "视频作品暂不可用，请重试。", retry: "重试加载",
    more: "加载更多", preview: "预览", download: "下载", remove: "从列表移除",
    refreshList: "刷新列表", refreshItem: "刷新状态/链接", refreshFailed: "结果查询失败，请重试原作品。",
    refreshPreview: "刷新结果链接", closePreview: "关闭预览",
  },
] as const;
const disconnectedCopy = /尚未接入|not connected yet/i;
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it.each(videoLocales)("$locale 视频列表加载后展示作品，支持分页及切换分类", async (copy) => {
  const next = { ...video, id: "media:second-video", title: "Second fixture video" };
  let resolveVideo!: (response: Response) => void;
  const fetcher = vi.fn<CreationsFetch>()
    .mockResolvedValueOnce(page([item]))
    .mockImplementationOnce(() => new Promise(resolve => { resolveVideo = resolve; }))
    .mockResolvedValueOnce(page([video, next]))
    .mockResolvedValueOnce(page([item]))
    .mockResolvedValueOnce(page());
  stubCreationsFetch(fetcher);
  const view = render(<PlatformCreationsPanel locale={copy.locale} initialFilter="all" path={copy.path} />);
  await screen.findByRole("heading", { name: item.title });

  const videoFilter = screen.getByRole("button", { name: copy.videoFilter });
  fireEvent.click(videoFilter);
  expect(videoFilter).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("status")).toHaveTextContent(copy.loading);
  expect(screen.queryByRole("heading", { name: item.title })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: copy.empty })).not.toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await waitFor(() => expect(fetcher).toHaveBeenNthCalledWith(2, videoQuery, expect.objectContaining({ credentials: "same-origin" })));
  await act(async () => { resolveVideo(page([video], "next-page")); });
  expect(screen.getByRole("heading", { name: video.title })).toBeInTheDocument();
  expect(view.container.querySelector("video source")).toHaveAttribute("type", "video/webm");
  expect(view.container.querySelector("video source")).toHaveAttribute("src", video.result?.url);
  expect(screen.getByRole("button", { name: copy.preview })).toBeEnabled();
  expect(screen.getByRole("button", { name: copy.download })).toBeEnabled();
  expect(screen.getByRole("button", { name: copy.remove })).toBeEnabled();
  expect(screen.queryByText(disconnectedCopy)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: copy.more }));
  await screen.findByRole("heading", { name: next.title });
  expect(screen.getAllByRole("heading", { name: video.title })).toHaveLength(1);
  expect(screen.queryByRole("button", { name: copy.more })).not.toBeInTheDocument();
  expect(fetcher).toHaveBeenNthCalledWith(3, `${videoQuery}&cursor=next-page`, expect.anything());

  fireEvent.click(screen.getByRole("button", { name: copy.imageFilter }));
  await screen.findByRole("heading", { name: item.title });
  expect(screen.queryByRole("heading", { name: video.title })).not.toBeInTheDocument();
  expect(fetcher).toHaveBeenNthCalledWith(4, "/api/creations?filter=image&limit=12", expect.anything());
  fireEvent.change(screen.getByRole("combobox", { name: copy.makeupFilter }), { target: { value: "lipstick" } });
  await screen.findByRole("heading", { name: copy.genericEmpty });
  expect(screen.queryByRole("heading", { name: copy.empty })).not.toBeInTheDocument();
  expect(fetcher).toHaveBeenNthCalledWith(5, "/api/creations?filter=lipstick&limit=12", expect.anything());
});

it.each(videoLocales)("$locale 视频接口成功返回空列表时显示空状态", async (copy) => {
  const fetcher = vi.fn<CreationsFetch>().mockResolvedValueOnce(page());
  stubCreationsFetch(fetcher);
  render(<PlatformCreationsPanel locale={copy.locale} initialFilter="video" path={copy.path} />);
  await screen.findByRole("heading", { name: copy.empty });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.queryByText(disconnectedCopy)).not.toBeInTheDocument();
  expect(fetcher).toHaveBeenCalledExactlyOnceWith(videoQuery, expect.anything());
});

it.each(videoLocales)("$locale 视频接口返回 503 时可重试并恢复列表", async (copy) => {
  const fetcher = vi.fn<CreationsFetch>()
    .mockResolvedValueOnce(json({ code: "creations_unavailable", sources: { makeup: "connected", media: "unavailable" } }, 503))
    .mockResolvedValueOnce(json({ code: "creations_unavailable" }, 503))
    .mockResolvedValueOnce(page([video]));
  stubCreationsFetch(fetcher);
  render(<PlatformCreationsPanel locale={copy.locale} initialFilter="video" path={copy.path} />);
  expect(await screen.findByRole("alert")).toHaveTextContent(copy.unavailable);
  expect(screen.queryByRole("heading", { name: copy.empty })).not.toBeInTheDocument();
  expect(screen.queryByText(disconnectedCopy)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: copy.retry }));
  await waitFor(() => expect(screen.getByRole("button", { name: copy.retry })).toBeEnabled());
  expect(screen.getByRole("alert")).toHaveTextContent(copy.unavailable);
  expect(screen.queryByRole("heading", { name: copy.empty })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: copy.retry }));
  await screen.findByRole("heading", { name: video.title });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(fetcher.mock.calls.map(([url]) => url)).toEqual([videoQuery, videoQuery, videoQuery]);
});

it.each(videoLocales)("$locale 单条刷新成功后保留列表失败和旧视频，直到列表重试成功", async (copy) => {
  const updatedVideo = { ...video, title: "Refreshed fixture video" };
  let resolveRetry!: (response: Response) => void;
  const fetcher = vi.fn<CreationsFetch>()
    .mockResolvedValueOnce(page([video]))
    .mockResolvedValueOnce(json({ code: "creations_unavailable" }, 503))
    .mockResolvedValueOnce(json(updatedVideo))
    .mockImplementationOnce(() => new Promise(resolve => { resolveRetry = resolve; }));
  stubCreationsFetch(fetcher);
  render(<PlatformCreationsPanel locale={copy.locale} initialFilter="video" path={copy.path} />);
  await screen.findByRole("heading", { name: video.title });

  fireEvent.click(screen.getByRole("button", { name: copy.refreshList }));
  expect(await screen.findByRole("alert")).toHaveTextContent(copy.unavailable);
  expect(screen.getByRole("heading", { name: video.title })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: copy.refreshItem }));
  await screen.findByRole("heading", { name: updatedVideo.title });
  expect(screen.getByRole("alert")).toHaveTextContent(copy.unavailable);

  fireEvent.click(screen.getByRole("button", { name: copy.retry }));
  expect(screen.getByRole("alert")).toHaveTextContent(copy.unavailable);
  expect(screen.getByRole("button", { name: copy.retry })).toBeDisabled();
  await act(async () => { resolveRetry(page([updatedVideo])); });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: updatedVideo.title })).toBeInTheDocument();
  expect(fetcher.mock.calls.map(([url]) => url)).toEqual([videoQuery, videoQuery, `/api/creations/${encodeURIComponent(video.id)}`, videoQuery]);
});

it.each(videoLocales)("$locale 单条查询与列表先后失败时分别保留重试入口", async (copy) => {
  const retriedVideo = { ...video, title: "Retried fixture video" };
  let resolveItem!: (response: Response) => void;
  let resolveList!: (response: Response) => void;
  const fetcher = vi.fn<CreationsFetch>()
    .mockResolvedValueOnce(page([video]))
    .mockImplementationOnce(() => new Promise(resolve => { resolveItem = resolve; }))
    .mockImplementationOnce(() => new Promise(resolve => { resolveList = resolve; }))
    .mockResolvedValueOnce(page([video]))
    .mockResolvedValueOnce(json(retriedVideo));
  stubCreationsFetch(fetcher);
  render(<PlatformCreationsPanel locale={copy.locale} initialFilter="video" path={copy.path} />);
  await screen.findByRole("heading", { name: video.title });

  fireEvent.click(screen.getByRole("button", { name: copy.refreshItem }));
  fireEvent.click(screen.getByRole("button", { name: copy.refreshList }));
  await act(async () => { resolveItem(json({}, 503)); });
  expect(screen.getByRole("alert")).toHaveTextContent(copy.refreshFailed);
  await act(async () => { resolveList(json({}, 503)); });
  expect(screen.getAllByRole("alert").map(alert => alert.textContent)).toEqual(
    expect.arrayContaining([expect.stringContaining(copy.unavailable), expect.stringContaining(copy.refreshFailed)]),
  );
  expect(screen.getByRole("button", { name: copy.refreshItem })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: copy.retry }));
  await waitFor(() => expect(screen.queryByRole("button", { name: copy.retry })).not.toBeInTheDocument());
  expect(screen.getByRole("alert")).toHaveTextContent(copy.refreshFailed);
  expect(screen.getByRole("heading", { name: video.title })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: copy.refreshItem }));
  await screen.findByRole("heading", { name: retriedVideo.title });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it.each(videoLocales)("$locale 预览内显示单条刷新错误，可重试原作品并保留列表错误", async (copy) => {
  const updatedUrl = "/refreshed.webm";
  const updatedVideo = { ...video, result: { url: updatedUrl, mimeType: "video/webm", expiresAt: null } };
  const otherVideo = { ...video, id: "media:other-video", title: "Other fixture video" };
  const detailQuery = `/api/creations/${encodeURIComponent(video.id)}`;
  const fetcher = vi.fn<CreationsFetch>()
    .mockResolvedValueOnce(page([video, otherVideo]))
    .mockResolvedValueOnce(json({ code: "creations_unavailable" }, 503))
    .mockResolvedValueOnce(json({}, 503))
    .mockResolvedValueOnce(json(updatedVideo));
  stubCreationsFetch(fetcher);
  render(<PlatformCreationsPanel locale={copy.locale} initialFilter="video" path={copy.path} />);
  await screen.findByRole("heading", { name: video.title });
  const [card, otherCard] = screen.getAllByRole("article");
  const preview = within(card).getByRole("button", { name: copy.preview });
  fireEvent.click(screen.getByRole("button", { name: copy.refreshList }));
  const listAlert = await screen.findByRole("alert");
  expect(listAlert).toHaveTextContent(copy.unavailable);

  preview.focus();
  fireEvent.click(preview);
  const dialog = screen.getByRole("dialog");
  const refresh = within(dialog).getByRole("button", { name: copy.refreshPreview });
  expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument();
  refresh.focus();
  fireEvent.click(refresh);
  expect(await within(dialog).findByRole("alert")).toHaveTextContent(copy.refreshFailed);
  expect(refresh).toBeEnabled();
  expect(refresh).toHaveFocus();
  expect(within(card).queryByRole("alert")).not.toBeInTheDocument();
  expect(within(otherCard).queryByRole("alert")).not.toBeInTheDocument();
  expect(listAlert).toHaveTextContent(copy.unavailable);

  fireEvent.keyDown(document, { key: "Escape" });
  expect(dialog).not.toBeInTheDocument();
  expect(preview).toHaveFocus();
  expect(within(card).getByRole("alert")).toHaveTextContent(copy.refreshFailed);
  expect(within(card).getByRole("button", { name: copy.refreshItem })).toBeEnabled();
  fireEvent.click(preview);
  const reopened = screen.getByRole("dialog");
  expect(within(reopened).getByRole("alert")).toHaveTextContent(copy.refreshFailed);
  fireEvent.click(within(reopened).getByRole("button", { name: copy.refreshPreview }));
  await waitFor(() => expect(reopened.querySelector("video source")).toHaveAttribute("src", updatedUrl));
  expect(within(reopened).queryByRole("alert")).not.toBeInTheDocument();
  fireEvent.click(within(reopened).getByRole("button", { name: copy.closePreview }));
  expect(within(card).queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("alert")).toBe(listAlert);
  expect(screen.getByRole("button", { name: copy.retry })).toBeEnabled();
  expect(fetcher.mock.calls.map(([url, options]) => [url, options.method])).toEqual([
    [videoQuery, "GET"], [videoQuery, "GET"], [detailQuery, "GET"], [detailQuery, "GET"],
  ]);
});

it("视频列表刷新遇到登录失效时清除私有作品并引导登录", async () => {
  const fetcher = vi.fn<CreationsFetch>()
    .mockResolvedValueOnce(page([video]))
    .mockResolvedValueOnce(json({ code: "unauthorized" }, 401));
  stubCreationsFetch(fetcher);
  render(<PlatformCreationsPanel locale="zh-CN" initialFilter="video" path="/zh-CN/my-creations" />);
  await screen.findByRole("heading", { name: video.title });
  fireEvent.click(screen.getByRole("button", { name: "刷新列表" }));
  await screen.findByRole("heading", { name: "登录后查看作品" });
  expect(screen.getByRole("link", { name: "使用邮箱登录" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: video.title })).not.toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.queryByText(disconnectedCopy)).not.toBeInTheDocument();
  expect(fetcher.mock.calls.map(([url]) => url)).toEqual([videoQuery, videoQuery]);
});

it("取消移除零请求；确认失败保留卡片并可重试", async () => {
  const fetcher = vi.fn<CreationsFetch>().mockImplementation(async (_url, options) => options.method === "DELETE" ? json({}, 503) : page([item]));
  stubCreationsFetch(fetcher);
  const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValue(true);
  render(<PlatformCreationsPanel locale="zh-CN" initialFilter="all" path="/zh-CN/my-creations" />);
  fireEvent.click(await screen.findByRole("button", { name: "从列表移除" })); expect(fetcher.mock.calls.filter(call => call[1]?.method === "DELETE")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "从列表移除" })); expect(await screen.findByRole("alert")).toHaveTextContent("移除失败"); expect(screen.getByRole("button", { name: "从列表移除" })).toBeEnabled(); expect(confirm).toHaveBeenCalledTimes(2);
});
it("切账户取消旧视频列表，晚响应不会覆盖新账户作品", async () => {
  let user = "alice";
  let resolveOld!: (response: Response) => void;
  const bobVideo = { ...video, id: "media:bob-video", title: "Bob fixture video" };
  const fetcher = vi.fn<CreationsFetch>()
    .mockResolvedValueOnce(page([video]))
    .mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
    .mockResolvedValueOnce(page([bobVideo]));
  stubCreationsFetch(fetcher, () => session(user));
  render(<PlatformCreationsPanel locale="en" initialFilter="video" path="/my-creations" />);
  await screen.findByRole("heading", { name: video.title });
  fireEvent.click(screen.getByRole("button", { name: "Refresh list" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  const signal = fetcher.mock.calls[1][1].signal;
  user = "bob";
  await act(async () => { await refreshPlatformAccount(); });
  await screen.findByRole("heading", { name: bobVideo.title });
  expect(signal?.aborted).toBe(true);
  await act(async () => { resolveOld(page([video])); });
  expect(screen.queryByRole("heading", { name: video.title })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: bobVideo.title })).toBeInTheDocument();
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
