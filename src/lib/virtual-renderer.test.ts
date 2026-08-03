import { describe, expect, it } from "vitest";
import { buildMakeupDrawPlan } from "./virtual-renderer";

describe("virtual makeup renderer", () => {
  it("draws only enabled layers in the stable face-safe order", () => {
    const plan = buildMakeupDrawPlan({
      lipstick: {
        enabled: true,
        presetId: "classic-red",
        color: "#c93445",
        intensity: 70
      },
      foundation: {
        enabled: true,
        presetId: "natural",
        color: "#d8a47f",
        intensity: 35
      },
      blush: {
        enabled: false,
        presetId: "soft-rose",
        color: "#d77b83",
        intensity: 50
      }
    });

    expect(plan.map((item) => item.part)).toEqual(["foundation", "lipstick"]);
  });
});
