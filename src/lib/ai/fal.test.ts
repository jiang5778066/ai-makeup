import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fal-ai/client", () => ({
  fal: {
    config: vi.fn(),
    subscribe: vi.fn()
  }
}));

vi.mock("@/lib/storage", () => ({
  R2_BUCKET_ORIGINALS: "originals",
  presignGetUrl: vi.fn().mockResolvedValue("https://r2.test/input.jpg")
}));

beforeEach(() => {
  vi.resetModules();
  delete process.env.FAL_KEY;
});

describe("generateMakeup", () => {
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
