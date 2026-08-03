import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@mediapipe/tasks-vision", () => ({
  FilesetResolver: { forVisionTasks: vi.fn().mockResolvedValue({}) },
  FaceLandmarker: {
    createFromOptions: vi.fn().mockResolvedValue({
      close: vi.fn(),
      setOptions: vi.fn(),
      detect: vi.fn().mockReturnValue({ faceLandmarks: [] }),
      detectForVideo: vi.fn().mockReturnValue({ faceLandmarks: [] })
    })
  }
}));

import { VirtualTryOn } from "./virtual-try-on";

describe("VirtualTryOn", () => {
  it("exposes upload, camera and all nine makeup controls", () => {
    render(<VirtualTryOn locale="en" focusedPart="lipstick" />);

    expect(screen.getByRole("button", { name: "Upload photo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Live camera" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Lipstick" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Foundation" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Blush" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Eyeshadow" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Eyeliner" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Mascara" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Brows" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Contour" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Highlight" })).toBeInTheDocument();
  });
});
