import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFalConfig = vi.fn();
const mockFalSubscribe = vi.fn();

vi.mock("@fal-ai/client", () => ({
  fal: {
    config: (...args: unknown[]) => mockFalConfig(...args),
    subscribe: (...args: unknown[]) => mockFalSubscribe(...args)
  }
}));

vi.mock("@/lib/storage", () => ({
  R2_BUCKET_ORIGINALS: "originals",
  presignGetUrl: vi.fn().mockResolvedValue("https://r2.test/input.jpg")
}));

beforeEach(() => {
  vi.resetModules();
  mockFalConfig.mockReset();
  mockFalSubscribe.mockReset();
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

  it("edits one selfie with GPT Image 2 and reads the SDK result envelope", async () => {
    process.env.FAL_KEY = "fal_test_key";
    mockFalSubscribe.mockResolvedValue({
      data: { images: [{ url: "https://fal.test/result.png" }] },
      requestId: "request_1"
    });
    const { generateMakeup } = await import("./fal");

    const result = await generateMakeup({
      uploadKey: "user/image.jpg",
      styleId: "natural",
      intensity: 60,
      styleName: "Natural",
      styleDescription: "Soft makeup"
    });

    expect(mockFalConfig).toHaveBeenCalledWith({ credentials: "fal_test_key" });
    expect(mockFalSubscribe).toHaveBeenCalledWith(
      "openai/gpt-image-2/edit",
      {
        input: expect.objectContaining({
          image_urls: ["https://r2.test/input.jpg"],
          quality: "medium",
          image_size: "auto",
          output_format: "png",
          num_images: 1,
          prompt: expect.stringContaining("natural")
        })
      }
    );
    expect(result).toEqual({
      resultImageUrl: "https://fal.test/result.png",
      beforeImageUrl: "https://r2.test/input.jpg"
    });
  });
});
