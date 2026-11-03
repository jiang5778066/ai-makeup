import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fal-ai/client", () => ({
  fal: {
    config: vi.fn(),
    subscribe: vi.fn()
  }
}));

vi.mock("@/lib/storage", () => ({
  R2_BUCKET_ORIGINALS: "originals",
  presignGetUrl: vi.fn(),
  putObject: vi.fn().mockResolvedValue(undefined)
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("FAL_KEY", undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("generateMakeup", () => {
  it("uploads a ZIP readable by Python zipfile and passes its signed URL to fal", async () => {
    vi.stubEnv("FAL_KEY", "unit-test-placeholder");
    const { fal } = await import("@fal-ai/client");
    const { presignGetUrl, putObject } = await import("@/lib/storage");
    vi.mocked(presignGetUrl)
      .mockResolvedValueOnce("https://r2.test/input.jpg")
      .mockResolvedValueOnce("https://r2.test/input.zip");
    vi.mocked(fal.subscribe).mockResolvedValue({
      data: { images: [{ url: "https://fal.test/result.jpg" }] }
    } as Awaited<ReturnType<typeof fal.subscribe>>);
    const bytes = Uint8Array.from([0, 255, 1, 2, 128, 13, 10]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(bytes)));
    const { generateMakeup } = await import("./fal");

    const result = await generateMakeup({
      uploadKey: "user/image.jpg", styleId: "natural", intensity: 60,
      styleName: "Natural", styleDescription: "Soft makeup"
    });

    expect(putObject).toHaveBeenCalledOnce();
    const upload = vi.mocked(putObject).mock.calls[0][0];
    expect(upload).toMatchObject({
      bucket: "originals", key: "user/image.jpg.zip", contentType: "application/zip"
    });
    const parsed = JSON.parse(execFileSync("python3", ["-c", [
      "import sys, io, zipfile, json",
      "with zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())) as archive:",
      "    assert archive.testzip() is None",
      "    print(json.dumps({name: list(archive.read(name)) for name in archive.namelist()}))"
    ].join("\n")], { input: Buffer.from(upload.body), encoding: "utf8" }));
    expect(parsed).toEqual({ image: Array.from(bytes) });
    expect(fal.subscribe).toHaveBeenCalledWith("fal-ai/photomaker", expect.objectContaining({
      input: expect.objectContaining({ image_archive_url: "https://r2.test/input.zip" })
    }));
    expect(result).toEqual({
      beforeImageUrl: "https://r2.test/input.jpg", resultImageUrl: "https://fal.test/result.jpg"
    });
  });
  it("fails fast when fal is not configured", async () => {
    const { generateMakeup } = await import("./fal");

    await expect(
      generateMakeup({
        uploadKey: "user/image.jpg",
        styleId: "natural",
        intensity: 60,
        styleName: "Natural",
        styleDescription: "Soft makeup"
      })
    ).rejects.toThrow("ai_unconfigured");
  });
});
