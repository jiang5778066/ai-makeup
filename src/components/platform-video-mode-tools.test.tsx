import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { PlatformAccount } from "@/lib/platform-account-session";
import ChineseCompatibilityPage from "@/app/zh/[[...slug]]/page";
import sitemap from "@/app/sitemap";
import { platformEntry } from "@/lib/platform-navigation";
import { PlatformRoutePage, platformRouteMetadata } from "./platform-route-page";

vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("404"); },
  redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); }
}));
vi.mock("./site-shell", () => ({
  SiteShell: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
vi.mock("./use-platform-url", () => ({ usePlatformUrl: (path: string) => path }));
const signedOut: PlatformAccount = { status: "signed_out", user: null, epoch: 0 };
let account = signedOut;
vi.mock("@/lib/platform-account-session", () => ({
  usePlatformAccount: () => account,
  getPlatformAccountEpoch: () => account.epoch,
  expirePlatformAccount: vi.fn()
}));
afterEach(() => {
  account = signedOut;
  vi.unstubAllGlobals();
});

const cases = [
  { id: "image-to-video", path: "/tools/ai-image-to-video", opposite: "text-to-video", titles: ["AI Image to Video", "AI 图生视频"] },
  { id: "text-to-video", path: "/tools/ai-text-to-video", opposite: "image-to-video", titles: ["AI Text to Video", "AI 文生视频"] }
] as const;

it.each(cases)("双语工具 $id 固定实际模式并使用自己的规范地址", ({ id, path, opposite, titles }) => {
  for (const [index, locale] of (["en", "zh-CN"] as const).entries()) {
    const zh = locale === "zh-CN";
    const view = render(<PlatformRoutePage path={path} locale={locale} searchParams={{
      mode: [opposite, id],
      tab: [id.startsWith("image") ? "text" : "image", ""],
      model: ["1800", "wan-2-5"]
    }}/>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(titles[index]);
    const workspace = document.getElementById("generator")!;
    expect(workspace).toHaveAttribute("data-generator-model", "grok-imagine");
    expect(within(workspace).getByText(zh
      ? `生成模式 · ${id === "image-to-video" ? "图生视频" : "文生视频"}`
      : `Generation mode · ${id === "image-to-video" ? "Image to Video" : "Text to Video"}`)).toBeVisible();
    const panel = within(workspace).getByRole("region", { name: zh ? "本站生成" : "Site generation" });
    expect(within(panel).getByRole("button", { name: zh ? "获取报价" : "Get quote" })).toBeDisabled();
    expect(document.querySelector('input[type="file"]')?.getAttribute("accept") ?? null)
      .toBe(id === "image-to-video" ? "image/png,image/jpeg,image/webp" : null);
    expect(screen.getByRole("textbox", { name: zh ? "提示词" : "Prompt" })).toHaveAttribute("maxlength", "3800");
    expect(document.querySelector(".platform-generator-video-track")).toBeNull();
    expect(screen.getByRole("link", { name: zh ? "我的作品" : "My Creations" })).toHaveAttribute("href", `${zh ? "/zh-CN" : ""}/my-creations`);
    const metadata = platformRouteMetadata(path, locale, { mode: [opposite, id] });
    expect(metadata.title).toBe(titles[index]);
    expect(metadata.alternates).toMatchObject({
      canonical: zh ? `/zh-CN${path}` : path,
      languages: { en: path, "zh-CN": `/zh-CN${path}`, "x-default": path }
    });
    expect(sitemap().some(entry => new URL(entry.url).pathname === metadata.alternates?.canonical)).toBe(true);
    expect(platformEntry(id).status).toBe("ready");
    view.unmount();
  }
});

it.each(cases)("旧中文工具 $id 保留重复查询", async ({ id, path, opposite }) => {
  await expect(ChineseCompatibilityPage({
    params: Promise.resolve({ slug: path.slice(1).split("/") }),
    searchParams: Promise.resolve({ mode: [opposite, id], model: ["wan-2-5", "1800"], tag: ["a", "b"] })
  })).rejects.toThrow(`REDIRECT:/zh-CN${path}?mode=${opposite}&mode=${id}&model=wan-2-5&model=1800&tag=a&tag=b`);
});

it("首个模型仅支持本地预览时，后续查询值不能打开生成", () => {
  render(<PlatformRoutePage path="/tools/ai-text-to-video" locale="en" searchParams={{ model: ["wan-2-5", "1800"] }}/>);
  expect(document.getElementById("generator")).toHaveAttribute("data-generator-model", "wan-2-5");
  expect(screen.getByRole("button", { name: "Generation not available yet" })).toBeDisabled();
  expect(screen.queryByRole("region", { name: "Site generation" })).toBeNull();
});

it.each(["en", "zh-CN"] as const)("文生视频同意文案只授权提示词（%s）", locale => {
  const zh = locale === "zh-CN";
  render(<PlatformRoutePage path="/tools/ai-text-to-video" locale={locale}/>);
  const checkbox = screen.getByRole("checkbox", { name: zh ? /将提示词发送/ : /send this prompt to/ });
  expect(checkbox).not.toHaveAccessibleName(zh ? /首帧/ : /first frame/);
});

it.each(["en", "zh-CN"] as const)("换号时正在解码的图生首帧和旧预览一并释放（%s）", async locale => {
  const zh = locale === "zh-CN";
  const setUser = (id: string, epoch: number) => {
    account = { status: "signed_in", user: { id, email: null }, epoch };
  };
  const decoded: (() => void)[] = [];
  const revoke = vi.fn();
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL() { return "blob:local-fixture"; }
    static revokeObjectURL = revoke;
  });
  vi.stubGlobal("Image", class {
    onload: (() => void) | null = null;
    set src(_value: string) { decoded.push(() => this.onload?.()); }
  });
  const fetcher = vi.fn(async (_input: RequestInfo | URL) => new Response(JSON.stringify({
    capabilities: [{
      model: "grok-imagine-video-1.5", mode: "image_to_video", enabled: true,
      parameters: { durationSeconds: [1], resolution: ["480p"] }
    }]
  })));
  vi.stubGlobal("fetch", fetcher);
  const form = () => <PlatformRoutePage path="/tools/ai-image-to-video" locale={locale}/>;
  setUser("account-a", 1);
  const view = render(form());
  const fileInput = () => screen.getByLabelText(zh ? "参考图片" : "Reference Images");
  fireEvent.change(fileInput(), { target: { files: [new File(["old"], "old.png", { type: "image/png" })] } });
  expect(screen.getByText("old.png")).toBeInTheDocument();

  account = { status: "loading", user: null, epoch: 2 };
  view.rerender(form());
  expect(screen.queryByLabelText(zh ? "参考图片" : "Reference Images")).toBeNull();
  setUser("account-b", 2);
  view.rerender(form());
  await act(async () => { decoded[0](); });
  expect(screen.queryByAltText("old.png")).toBeNull();
  expect(screen.queryByText("old.png")).toBeNull();
  expect(revoke).toHaveBeenCalledWith("blob:local-fixture");
  expect(screen.getByText(zh ? /账户核验后，请重新选择图片/ : /Choose the image again after the account check/)).toBeVisible();

  fireEvent.click(await screen.findByRole("button", { name: zh ? "使用这些本站参数" : "Use these site settings" }));
  fireEvent.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("button", { name: zh ? "获取报价" : "Get quote" })).toBeDisabled();
  fireEvent.change(fileInput(), { target: { files: [new File(["new"], "new.png", { type: "image/png" })] } });
  await act(async () => { decoded[1](); });
  await waitFor(() => expect(screen.getByAltText("new.png")).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: zh ? "使用这些本站参数" : "Use these site settings" }));
  fireEvent.click(screen.getByRole("checkbox"));
  await waitFor(() => expect(screen.getByRole("button", { name: zh ? "获取报价" : "Get quote" })).toBeEnabled());
  expect(fetcher.mock.calls.every(call => String(call[0]).endsWith("/capabilities"))).toBe(true);
});
