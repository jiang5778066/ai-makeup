import { afterEach, describe, expect, it, vi } from "vitest";
import { isGenerationEnabled } from "./launch-flags";

afterEach(() => vi.unstubAllEnvs());

describe("isGenerationEnabled", () => {
  it.each([
    [undefined, undefined, false],
    [undefined, "0", false],
    ["", "", false],
    ["0", "0", false],
    ["true", "0", false],
    [" 1", "0", false],
    ["1", undefined, true],
    ["1", "0", true],
    ["1", "1", false]
  ])("生成开关 %s / %s 返回 %s", (enable, disable, expected) => {
    vi.stubEnv("ENABLE_GENERATION", enable);
    vi.stubEnv("DISABLE_GENERATION", disable);
    expect(isGenerationEnabled()).toBe(expected);
  });
});
