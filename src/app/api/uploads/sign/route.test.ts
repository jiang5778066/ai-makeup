import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockIsStorageConfigured = vi.fn();
const mockPresignPutUrl = vi.fn();
const mockBuildUploadKey = vi.fn();
const mockRateLimit = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getCurrentUser: () => mockGetCurrentUser()
}));

vi.mock("@/lib/storage", () => ({
  ALLOWED_UPLOAD_MIME: new Set(["image/jpeg", "image/png", "image/webp"]),
  R2_BUCKET_ORIGINALS: "makeup-originals",
  UPLOAD_MAX_BYTES: 12 * 1024 * 1024,
  buildUploadKey: (...args: unknown[]) => mockBuildUploadKey(...args),
  isStorageConfigured: () => mockIsStorageConfigured(),
  presignPutUrl: (...args: unknown[]) => mockPresignPutUrl(...args)
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  requestIp: () => "127.0.0.1"
}));

function jsonRequest(body: unknown, origin: string | null = "https://makeup.example") {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (origin) headers.set("Origin", origin);

  return new Request("https://makeup.example/api/uploads/sign", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  mockGetCurrentUser.mockReset();
  mockIsStorageConfigured.mockReset();
  mockPresignPutUrl.mockReset();
  mockBuildUploadKey.mockReset();
  mockRateLimit.mockReset();

  mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
  mockIsStorageConfigured.mockReturnValue(true);
  mockBuildUploadKey.mockReturnValue("user_test/upload.jpg");
  mockPresignPutUrl.mockResolvedValue("https://uploads.example/signed");
  mockRateLimit.mockResolvedValue({ ok: true, remaining: 19, resetAt: Date.now() + 60_000 });
});

afterEach(() => {
  vi.resetModules();
});

describe("POST /api/uploads/sign", () => {
  it.each([
    ["missing", null],
    ["cross-origin", "https://evil.example"]
  ])("rejects %s Origin before upload signing work", async (_label, origin) => {
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({ contentType: "image/jpeg", contentLength: 1024 }, origin)
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ code: "invalid_origin" });
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
    expect(mockRateLimit).not.toHaveBeenCalled();
    expect(mockPresignPutUrl).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON without presigning", async () => {
    const { POST } = await import("./route");
    const request = new Request("https://makeup.example/api/uploads/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://makeup.example"
      },
      body: "{"
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ code: "invalid_json" });
    expect(mockBuildUploadKey).not.toHaveBeenCalled();
    expect(mockPresignPutUrl).not.toHaveBeenCalled();
  });

  it("rejects a null JSON body without presigning", async () => {
    const { POST } = await import("./route");

    const response = await POST(jsonRequest(null));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ code: "invalid_json" });
    expect(mockBuildUploadKey).not.toHaveBeenCalled();
    expect(mockPresignPutUrl).not.toHaveBeenCalled();
  });

  it("presigns a valid same-origin upload request", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      jsonRequest({ contentType: "image/jpeg", contentLength: 1024, filename: "selfie.jpg" })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      uploadUrl: "https://uploads.example/signed",
      uploadKey: "user_test/upload.jpg",
      expiresInSeconds: 300
    });
    expect(mockPresignPutUrl).toHaveBeenCalledWith({
      bucket: "makeup-originals",
      key: "user_test/upload.jpg",
      contentType: "image/jpeg",
      contentLength: 1024,
      expiresIn: 300
    });
  });
});
