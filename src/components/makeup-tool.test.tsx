import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MakeupTool } from "./makeup-tool";

const styles = [{
  id: "natural",
  name: "Natural",
  description: "Natural makeup",
  mood: "Everyday"
}];
const mockRedirectToLogin = vi.fn();

vi.mock("@/lib/client-navigation", () => ({
  redirectToLogin: (...args: unknown[]) => mockRedirectToLogin(...args)
}));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:preview"),
    revokeObjectURL: vi.fn()
  });
  mockRedirectToLogin.mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("MakeupTool", () => {
  it("checks authentication and balance before requesting an upload URL", async () => {
    const { container } = render(<MakeupTool locale="en" styles={styles} cta="Generate" />);
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput!, {
      target: { files: [new File(["portrait"], "portrait.jpg", { type: "image/jpeg" })] }
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith("/api/credits/balance");
    expect(fetch).not.toHaveBeenCalledWith("/api/uploads/sign", expect.anything());
    expect(mockRedirectToLogin).toHaveBeenCalledWith(window.location.pathname);
  });
});
