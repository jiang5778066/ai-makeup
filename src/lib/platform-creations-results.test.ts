import { afterEach, expect, it, vi } from "vitest";
const { sign } = vi.hoisted(() => ({ sign: vi.fn().mockResolvedValue("https://r2.fixture.invalid/signed") }));
vi.mock("@/lib/storage", () => ({ isStorageConfigured: () => true, R2_BUCKET_RESULTS: "results", presignGetUrl: sign }));
import { makeupResultLink } from "./platform-creations-results";
afterEach(() => { vi.unstubAllEnvs(); sign.mockClear(); });
it("任意旧URL不代理也不签名；仅HTTPS显式服务器origin白名单可读", async () => { vi.stubEnv("CREATIONS_LEGACY_RESULT_ORIGINS", "https://legacy.fixture.invalid"); for (const url of ["http://legacy.fixture.invalid/a.png", "https://evil.invalid/a.png", "https://u:p@legacy.fixture.invalid/a.png"]) expect(await makeupResultLink(url)).toBeNull(); expect(sign).not.toHaveBeenCalled(); expect((await makeupResultLink("https://legacy.fixture.invalid/a.png"))?.mimeType).toBe("image/png"); });
it("只签已有图片结果键且有效期15分钟；不以视频后缀伪装美妆", async () => { expect(await makeupResultLink("task.mp4")).toBeNull(); const value = await makeupResultLink("task.webp"); expect(value?.mimeType).toBe("image/webp"); expect(value?.expiresAt).toBeTruthy(); expect(sign).toHaveBeenCalledWith({ bucket: "results", key: "task.webp", expiresIn: 900 }); });
