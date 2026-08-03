import { describe, expect, it } from "vitest";
import { generationMatchesFilter } from "./generation-filter";

describe("creation filters", () => {
  it("matches full-face and enabled virtual makeup parts", () => {
    expect(generationMatchesFilter({ mode: "full_face", makeupConfig: null }, "full_face")).toBe(true);
    expect(
      generationMatchesFilter(
        { mode: "virtual_try_on", makeupConfig: { lipstick: { enabled: true } } },
        "lipstick"
      )
    ).toBe(true);
    expect(
      generationMatchesFilter(
        { mode: "virtual_try_on", makeupConfig: { lipstick: { enabled: true } } },
        "foundation"
      )
    ).toBe(false);
  });
});
