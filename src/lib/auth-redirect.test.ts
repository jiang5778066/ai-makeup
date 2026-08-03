import { describe, expect, it } from "vitest";
import { loginRedirectUrl, safeNextPath, withTryFragment } from "./auth-redirect";

describe("auth redirects", () => {
  it("rejects external or malformed next paths", () => {
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
  });

  it("preserves a local path and puts the try fragment on the return target", () => {
    expect(withTryFragment("/zh-CN/ai-makeup?style=douyin")).toBe(
      "/zh-CN/ai-makeup?style=douyin#try"
    );
    expect(loginRedirectUrl("/zh-CN/ai-makeup")).toBe(
      "/login?next=%2Fzh-CN%2Fai-makeup%23try"
    );
  });
});
