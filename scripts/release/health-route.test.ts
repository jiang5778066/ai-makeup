// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { GET } from "../../src/app/api/health/route";
afterEach(() => vi.unstubAllEnvs());
it("缺少发布身份时返回 503 且无敏感字段", async () => {
  vi.stubEnv("RELEASE_SHA", ""); vi.stubEnv("DATABASE_URL", "不应泄露的连接");
  const response = await GET(); expect(response.status).toBe(503); expect(await response.json()).toEqual({ status: "unavailable" });
});
it("仅返回部署身份并禁用缓存", async () => {
  vi.stubEnv("RELEASE_SHA", "a".repeat(40)); vi.stubEnv("RELEASE_PROJECT_ID", "project"); vi.stubEnv("VERCEL_URL", "candidate.vercel.app");
  const response = await GET(); expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual({ status: "ready", sha: "a".repeat(40), project: "project", deployment: "candidate.vercel.app" });
});
