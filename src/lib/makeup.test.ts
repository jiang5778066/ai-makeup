import { describe, expect, it } from "vitest";
import {
  MAKEUP_LAYER_ORDER,
  MAKEUP_PARTS,
  normalizeMakeupConfig
} from "./makeup";

describe("virtual try-on contract", () => {
  it("defines all nine parts in a stable rendering order", () => {
    expect(MAKEUP_PARTS).toHaveLength(9);
    expect(MAKEUP_LAYER_ORDER).toEqual([
      "foundation",
      "contour",
      "blush",
      "highlight",
      "eyeshadow",
      "eyeliner",
      "mascara",
      "brows",
      "lipstick"
    ]);
  });

  it("normalizes untrusted layer settings and drops unknown parts", () => {
    expect(
      normalizeMakeupConfig({
        lipstick: {
          enabled: true,
          presetId: "classic-red",
          color: "#C93445",
          intensity: 140
        },
        unknown: { enabled: true }
      })
    ).toEqual({
      lipstick: {
        enabled: true,
        presetId: "classic-red",
        color: "#c93445",
        intensity: 100
      }
    });
  });
});
