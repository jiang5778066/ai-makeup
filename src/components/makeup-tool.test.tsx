import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStyleLibrary } from "@/lib/content";
import { MakeupTool } from "./makeup-tool";

const styles = getStyleLibrary("en");
let generationStatus: "running" | "failed" | "done";
let pollFails: boolean;
let downloadResponse: { ok: boolean; blob: () => Promise<Blob> };
let clickDownload: ReturnType<typeof vi.spyOn>;

function mount() {
  const view = render(<MakeupTool locale="en" styles={styles} cta="Generate makeup" />);
  const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(["local fixture"], "selfie.png", { type: "image/png" });
  fireEvent.change(input, { target: { files: [file] } });
  fireEvent.click(screen.getByRole("checkbox"));
  return { ...view, input };
}

async function generate() {
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Generate makeup|Try again/ })); });
}

async function poll() {
  await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
}

beforeEach(() => {
  vi.useFakeTimers();
  generationStatus = "running";
  pollFails = false;
  downloadResponse = { ok: true, blob: async () => new Blob(["local fixture"], { type: "image/png" }) };
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = vi.fn(() => "blob:local-fixture");
    static revokeObjectURL = vi.fn();
  });
  clickDownload = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url === "/api/uploads/sign") return { ok: true, json: async () => ({ uploadUrl: "/local-upload", uploadKey: "local-only" }) };
    if (url === "/local-upload") return { ok: true };
    if (url === "/api/makeup/generate") return { ok: true, json: async () => ({ generationId: "local-only" }) };
    if (url.startsWith("/api/generations/")) {
      if (pollFails) throw new Error("Local status failure");
      return { ok: true, json: async () => ({
        id: "local-only", status: generationStatus, resultUrl: "/local-result.png", beforeUrl: "/local-before.png",
        fitNotes: [], styleName: "Local mock — not a makeup result", error: generationStatus === "failed" ? "Local generation failure" : null
      }) };
    }
    if (url === "/local-result.png") return downloadResponse;
    throw new Error(`Unexpected request: ${url}`);
  }));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MakeupTool local UI regressions (no real generation)", () => {
  it("preserves a valid upload on cancellation and invalid/oversize replacement", () => {
    const { input } = mount();
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.getByAltText("Selected selfie preview")).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [new File(["bad"], "bad.gif", { type: "image/gif" })] } });
    expect(screen.getByRole("alert")).toHaveTextContent("Use a JPG");
    const tooLarge = new File(["fixture"], "large.png", { type: "image/png" });
    Object.defineProperty(tooLarge, "size", { value: 13 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [tooLarge] } });
    expect(screen.getByRole("alert")).toHaveTextContent("12MB");
    expect(screen.getByAltText("Selected selfie preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate makeup" })).toBeEnabled();
  });

  it("does not open the picker when keyboard events bubble from remove", () => {
    const { input } = mount();
    const picker = vi.spyOn(input, "click");
    const remove = screen.getByRole("button", { name: "Remove image" });
    fireEvent.keyDown(remove, { key: "Enter" });
    fireEvent.click(remove);
    expect(picker).not.toHaveBeenCalled();
    expect(screen.queryByAltText("Selected selfie preview")).not.toBeInTheDocument();
  });

  it("locks inputs while generating, retries failure, and preserves the result style", async () => {
    const { container } = mount();
    await generate();
    expect(screen.getByRole("status")).toHaveTextContent("Generating");
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove image" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Natural/ })).toBeDisabled();
    await poll();
    generationStatus = "failed";
    await poll();
    expect(screen.getByRole("alert")).toHaveTextContent("Local generation failure");
    await generate();
    generationStatus = "done";
    await poll();
    const range = screen.getByRole("slider", { name: "Before and after comparison" });
    fireEvent.change(range, { target: { value: "75" } });
    expect(container.querySelector(".comparison-before")).toHaveStyle({ clipPath: "inset(0 25% 0 0)" });
    fireEvent.click(screen.getByRole("button", { name: /Soft Glam/ }));
    expect(container.querySelector(".result-card > p")).toHaveTextContent(styles[0].description);
    expect(screen.getByRole("button", { name: "Download preview" })).toBeEnabled();
  });

  it("recovers a failed status request instead of remaining busy", async () => {
    mount();
    await generate();
    pollFails = true;
    await poll();
    expect(screen.getByRole("alert")).toHaveTextContent("Could not retrieve your result");
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
  });

  it("recovers HTTP and invalid-image download failures without losing the result", async () => {
    mount();
    await generate();
    generationStatus = "done";
    await poll();
    const download = screen.getByRole("button", { name: "Download preview" });
    for (const response of [
      { ok: false, blob: async () => new Blob() },
      { ok: true, blob: async () => new Blob(["not an image"], { type: "text/html" }) },
      { ok: true, blob: async () => new Blob([], { type: "image/png" }) }
    ]) {
      downloadResponse = response;
      await act(async () => { fireEvent.click(download); });
      expect(screen.getByRole("alert")).toHaveTextContent("Could not download");
      expect(download).toBeEnabled();
    }
    downloadResponse = { ok: true, blob: async () => new Blob(["fixture"], { type: "image/png" }) };
    await act(async () => { fireEvent.click(download); });
    expect(clickDownload).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Before and after comparison" })).toBeInTheDocument();
  });
});
