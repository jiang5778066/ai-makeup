import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BeforeAfterSlider } from "./before-after-slider";

describe("BeforeAfterSlider", () => {
  it("renders both images and an accessible comparison slider", () => {
    render(<BeforeAfterSlider beforeUrl="/before.jpg" afterUrl="/after.jpg" beforeLabel="Before" afterLabel="After" />);
    expect(screen.getByAltText("Before")).toBeInTheDocument();
    expect(screen.getByAltText("After")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Before and after comparison" })).toBeInTheDocument();
  });
});
