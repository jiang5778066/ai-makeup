import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlatformImageEditWorkspace } from "./platform-image-edit-workspace";
import { decodeLocalPreview } from "@/lib/platform-generator-upload";
import type { PlatformAccount } from "@/lib/platform-account-session";

const account = vi.hoisted(() => ({
  value: { status: "signed_in", epoch: 1, user: { id: "fixture-a", email: null } } as PlatformAccount,
}));
vi.mock("@/lib/platform-account-session", () => ({ usePlatformAccount: () => account.value }));

vi.mock("@/lib/platform-generator-upload", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/platform-generator-upload")>(),
  decodeLocalPreview: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./use-platform-url", async () => {
  const { useSyncExternalStore } = await import("react");
  const subscribe = (listener: () => void) => {
    const events = ["platform:navigation", "hashchange", "popstate"];
    events.forEach(event => window.addEventListener(event, listener));
    return () => events.forEach(event => window.removeEventListener(event, listener));
  };
  return {
    usePlatformUrl: (path: string) => useSyncExternalStore(subscribe, () => {
      const location = window.location;
      return location.pathname === new URL(path, "https://framekoi.invalid").pathname
        ? location.pathname + location.search + location.hash : path;
    }, () => path),
  };
});
vi.mock("./media-generation-panel", () => ({
  MediaGenerationPanel: ({ draft, currentPath }: { currentPath: string; draft: { prompt: string; files: File[]; selectionVersion: number; sourceSelection?: string } }) =>
    <output data-testid="media-draft" data-current-path={currentPath} data-file-count={draft.files.length}
      data-selection-version={draft.selectionVersion} data-source-selection={draft.sourceSelection}>{draft.prompt}</output>,
}));

let nextBlob = 0;
beforeEach(() => {
  account.value = { status: "signed_in", epoch: 1, user: { id: "fixture-a", email: null } };
  nextBlob = 0;
  vi.mocked(decodeLocalPreview).mockReset().mockResolvedValue(undefined);
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = vi.fn(() => `blob:image-edit-${++nextBlob}`);
    static revokeObjectURL = vi.fn();
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("图片编辑工作区", () => {
  it("提示风格和修复的实际提示词，改选项使媒体选择身份更新", () => {
    window.history.replaceState({}, "", "/image-style-converter");
    const { rerender } = render(<PlatformImageEditWorkspace path="/image-style-converter" locale="en" initialQuery=""/>);
    const draft = screen.getByTestId("media-draft");
    expect(draft).toHaveTextContent("Holiday illustration");
    expect(document.getElementById("image-style-history")).toBeInTheDocument();
    const firstSelection = draft.getAttribute("data-source-selection");
    fireEvent.click(screen.getByRole("radio", { name: /Pixel art/ }));
    expect(draft).toHaveTextContent("crisp pixel clusters");
    expect(draft.getAttribute("data-source-selection")).not.toBe(firstSelection);
    window.history.replaceState({}, "", "/zh-CN/image-effects/old-photo-restoration");
    rerender(<PlatformImageEditWorkspace path="/image-effects/old-photo-restoration" locale="zh-CN" initialQuery=""/>);
    expect(screen.getByRole("radio", { name: /修补划痕与污渍/ })).toBeChecked();
    expect(screen.getByTestId("media-draft")).toHaveTextContent("修复参考照片");
    expect(screen.getByText(/gpt-image-2 · 图生图 · 1k · 2:3 · 单张/)).toBeInTheDocument();
  });

  it("无效查询先阻断编辑，选择有效操作后恢复；文件更换和撤回更新就绪输入", async () => {
    const fileA = new File(["fixture-a"], "portrait.png", { type: "image/png" });
    const fileB = new File(["fixture-b"], "portrait.webp", { type: "image/webp" });
    window.history.replaceState({}, "", "/image-effects/old-photo-restoration?operation=unknown");
    const { rerender } = render(<PlatformImageEditWorkspace path="/image-effects/old-photo-restoration"
      locale="en" initialQuery="operation=unknown"/>);
    expect(screen.getByRole("alert")).toHaveTextContent("unsupported");
    expect(screen.queryByLabelText("Image file")).not.toBeInTheDocument();
    expect(screen.queryByTestId("media-draft")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Recover faded tones/ }));
    expect(screen.getByTestId("media-draft")).toHaveTextContent("Rebalance faded contrast");
    expect(document.getElementById("generator")).toBeInTheDocument();
    const filePicker = screen.getByLabelText("Image file");
    fireEvent.change(filePicker, { target: { files: [fileA] } });
    await waitFor(() => expect(screen.getByRole("img")).toHaveAttribute("alt", "portrait.png"));
    expect(screen.getByTestId("media-draft")).toHaveAttribute("data-file-count", "1");
    fireEvent.click(screen.getByRole("button", { name: "Replace portrait.png" }));
    fireEvent.change(filePicker, { target: { files: [fileB] } });
    await waitFor(() => expect(screen.getByRole("img")).toHaveAttribute("alt", "portrait.webp"));
    expect(screen.getByTestId("media-draft")).toHaveAttribute("data-file-count", "1");
    const replacedSelection = screen.getByTestId("media-draft").getAttribute("data-selection-version");
    fireEvent.click(screen.getByRole("button", { name: "Remove portrait.webp" }));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("media-draft")).toHaveAttribute("data-file-count", "0"));
    expect(screen.getByTestId("media-draft").getAttribute("data-selection-version")).not.toBe(replacedSelection);
    window.history.replaceState({}, "", "/image-style-converter?model=unknown&tag=a&tag=b#generator");
    rerender(<PlatformImageEditWorkspace path="/image-style-converter" locale="en"
      initialQuery="model=unknown&tag=a&tag=b#generator"/>);
    expect(screen.getByRole("alert")).toHaveTextContent("unsupported");
  });

  it("人像选项写入历史，深链和媒体草稿随当前查询更新", async () => {
    const path = "/image-effects/ai-age-progression";
    const oldLocation = path + "?age=5&mode=image-to-image&ref=x&ref=y#generator";
    window.history.replaceState({}, "", oldLocation);
    render(<PlatformImageEditWorkspace path={path} locale="en" initialQuery="age=5&mode=image-to-image&ref=x&ref=y"/>);
    const picker = screen.getByLabelText("Image file");
    fireEvent.change(picker, {
      target: { files: [new File(["fixture"], "portrait.png", { type: "image/png" })] },
    });
    const draft = screen.getByTestId("media-draft");
    await waitFor(() => expect(draft).toHaveAttribute("data-file-count", "1"));
    const historyLength = window.history.length;
    fireEvent.click(screen.getByRole("radio", { name: /Child \(around 10\)/ }));
    const updated = path + "?age=1&mode=image-to-image&ref=x&ref=y#generator";
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(updated);
    expect(window.history.length).toBe(historyLength + 1);
    expect(draft).toHaveAttribute("data-current-path", updated);
    expect(draft).toHaveTextContent("Child (around 10)");
    expect(draft).toHaveAttribute("data-file-count", "1");
    window.history.back();
    await waitFor(() => expect(draft).toHaveAttribute("data-current-path", oldLocation));
    expect(draft).toHaveTextContent("Older adult (around 60)");
    expect(draft).toHaveAttribute("data-file-count", "1");
  });

  it("账户切换后释放本地图片并清空媒体草稿文件", async () => {
    const view = <PlatformImageEditWorkspace path="/image-style-converter" locale="en" initialQuery=""/>;
    window.history.replaceState({}, "", "/image-style-converter");
    const { rerender } = render(view);
    fireEvent.change(screen.getByLabelText("Image file"), {
      target: { files: [new File(["fixture"], "portrait.png", { type: "image/png" })] },
    });
    await waitFor(() => expect(screen.getByTestId("media-draft")).toHaveAttribute("data-file-count", "1"));
    account.value = { status: "signed_in", epoch: 2, user: { id: "fixture-b", email: null } };
    rerender(<PlatformImageEditWorkspace path="/image-style-converter" locale="en" initialQuery=""/>);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByTestId("media-draft")).toHaveAttribute("data-file-count", "0");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:image-edit-1");
  });
});
    window.history.replaceState({}, "", "/image-effects/old-photo-restoration?operation=unknown");
