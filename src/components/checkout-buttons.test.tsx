import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutButtons } from "./checkout-buttons";

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});

describe("CheckoutButtons", () => {
  it("starts only a Creem checkout", async () => {
    mockFetch.mockResolvedValue({
      status: 502,
      ok: false,
      json: async () => ({ message: "test stop" })
    });
    render(<CheckoutButtons planId="credits_100" cta="Buy 100 credits with Creem" />);

    fireEvent.click(screen.getByRole("button", { name: "Buy 100 credits with Creem" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/billing/checkout",
        expect.objectContaining({
          body: JSON.stringify({ planId: "credits_100", provider: "creem" })
        })
      );
    });
  });
});
