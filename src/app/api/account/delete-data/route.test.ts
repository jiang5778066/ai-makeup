import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockDeleteUserData = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getCurrentUser: () => mockGetCurrentUser()
}));

vi.mock("@/lib/account-deletion", () => ({
  deleteUserData: (...args: unknown[]) => mockDeleteUserData(...args)
}));

function request(origin: string | null) {
  const headers = new Headers();
  if (origin) headers.set("Origin", origin);

  return new Request("https://makeup.example/api/account/delete-data", {
    method: "POST",
    headers
  });
}

beforeEach(() => {
  mockGetCurrentUser.mockReset();
  mockDeleteUserData.mockReset();
  mockGetCurrentUser.mockResolvedValue({ id: "user_test" });
  mockDeleteUserData.mockResolvedValue({ deletedGenerations: 2 });
});

afterEach(() => {
  vi.resetModules();
});

describe("POST /api/account/delete-data", () => {
  it.each([
    ["missing", null],
    ["cross-origin", "https://evil.example"]
  ])("rejects %s Origin before deleting data", async (_label, origin) => {
    const { POST } = await import("./route");

    const response = await POST(request(origin));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ code: "invalid_origin" });
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
    expect(mockDeleteUserData).not.toHaveBeenCalled();
  });

  it("deletes data for a valid same-origin request", async () => {
    const { POST } = await import("./route");

    const response = await POST(request("https://makeup.example"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      deleted: true,
      deletedGenerations: 2
    });
    expect(mockDeleteUserData).toHaveBeenCalledWith("user_test");
  });
});
