import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
});

describe("mandatory AWS moderation", () => {
  it("fails closed when Rekognition credentials are unavailable", async () => {
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_REGION;
    const { moderateImage } = await import("./moderation");

    await expect(moderateImage("user/photo.jpg")).rejects.toThrow(
      "moderation_unconfigured"
    );
  });
});
