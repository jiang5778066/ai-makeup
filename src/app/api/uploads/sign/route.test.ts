import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { POST } from "./route";

const { currentUser, presign, configured } = vi.hoisted(() => ({
  currentUser: vi.fn(),
  presign: vi.fn(),
  configured: vi.fn()
}));
vi.mock("@/lib/supabase/server", () => ({ getCurrentUser: currentUser }));
vi.mock("@/lib/storage", () => ({
  ALLOWED_UPLOAD_MIME: new Set(["image/png"]),
  R2_BUCKET_ORIGINALS: "originals",
  UPLOAD_MAX_BYTES: 1024,
  buildUploadKey: () => "synthetic/photo.png",
  isStorageConfigured: configured,
  presignPutUrl: presign
}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => ({ ok: true }), requestIp: () => "127.0.0.1" }));

function request() {
  return new Request("https://app.invalid/api/uploads/sign", {
    method: "POST",
    body: JSON.stringify({ contentType: "image/png", contentLength: 100 })
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ENABLE_GENERATION", "1");
  vi.stubEnv("DISABLE_GENERATION", "0");
  currentUser.mockResolvedValue({ id: "synthetic" });
  configured.mockReturnValue(true);
  presign.mockResolvedValue("https://objects.invalid/photo.png");
});
afterEach(() => vi.unstubAllEnvs());

it.each([[undefined, "0"], ["1", "1"]])("关闭状态拒绝签名", async (enable, disable) => {
  vi.stubEnv("ENABLE_GENERATION", enable);
  vi.stubEnv("DISABLE_GENERATION", disable);
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ code: "generation_disabled" });
  expect(configured).not.toHaveBeenCalled();
  expect(presign).not.toHaveBeenCalled();
});

it("已登录且开启时返回上传签名", async () => {
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ uploadKey: "synthetic/photo.png" });
  expect(presign).toHaveBeenCalledOnce();
});

it("匿名请求保持 401", async () => {
  currentUser.mockResolvedValue(null);
  const response = await POST(request());
  expect(response.status).toBe(401);
  expect(presign).not.toHaveBeenCalled();
});
