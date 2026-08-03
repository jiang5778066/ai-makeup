import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountSettings } from "./account-settings";

const mockFetch = vi.fn();
const mockRedirectAfterAccountDeletion = vi.fn();

vi.mock("@/lib/client-navigation", () => ({
  redirectAfterAccountDeletion: () => mockRedirectAfterAccountDeletion()
}));

beforeEach(() => {
  mockFetch.mockReset();
  mockRedirectAfterAccountDeletion.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});

describe("AccountSettings", () => {
  it("requires a second confirmation before deleting the account", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ deleted: true }) });
    render(<AccountSettings />);

    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));

    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Permanently delete account" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/account/delete-data", { method: "POST" });
    });
    expect(mockRedirectAfterAccountDeletion).toHaveBeenCalledOnce();
  });

  it("keeps the account when deletion fails", async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({ code: "delete_failed" }) });
    render(<AccountSettings />);

    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
    fireEvent.click(screen.getByRole("button", { name: "Permanently delete account" }));

    expect(await screen.findByText("Could not delete your account. Try again or contact privacy support.")).toBeInTheDocument();
    expect(mockRedirectAfterAccountDeletion).not.toHaveBeenCalled();
  });
});
