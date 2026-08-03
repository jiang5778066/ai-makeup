import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getCurrentUser: () => mockGetCurrentUser()
}));

vi.mock("@/db/client", () => ({
  db: {
    delete: () => ({
      where: () => ({ returning: () => mockReturning() })
    })
  }
}));

function request(origin: string | null) {
  const headers = new Headers();
  if (origin) headers.set("Origin", origin);
  return new Request("https://makeup.example/api/projects/project_1", {
    method: "DELETE",
    headers
  });
}

beforeEach(() => {
  mockGetCurrentUser.mockReset();
  mockReturning.mockReset();
  mockGetCurrentUser.mockResolvedValue({ id: "user_1" });
  mockReturning.mockResolvedValue([{ id: "project_1" }]);
});

afterEach(() => vi.resetModules());

describe("DELETE /api/projects/:id", () => {
  it("rejects cross-origin deletion", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(request("https://evil.example"), {
      params: Promise.resolve({ id: "project_1" })
    });

    expect(response.status).toBe(403);
    expect(mockReturning).not.toHaveBeenCalled();
  });

  it("deletes an owned project for a same-origin request", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(request("https://makeup.example"), {
      params: Promise.resolve({ id: "project_1" })
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ deleted: true });
  });
});
