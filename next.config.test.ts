import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("production security headers", () => {
  it("sets browser security headers on every route", async () => {
    const entries = await nextConfig.headers?.();
    const headers = new Map(
      (entries?.[0]?.headers ?? []).map((header) => [header.key, header.value])
    );

    expect(headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
    expect(headers.get("Strict-Transport-Security")).toContain("includeSubDomains");
  });
});
