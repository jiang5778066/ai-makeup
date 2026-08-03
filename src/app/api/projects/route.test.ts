import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockInsertValues = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getCurrentUser: () => mockGetCurrentUser()
}));

vi.mock("@/db/client", () => ({
  db: {
    insert: () => ({
      values: (values: unknown) => {
        mockInsertValues(values);
        return { returning: async () => [{ id: "project_1", ...values as object }] };
      }
    })
  }
}));

function request(body: unknown, origin: string | null = "https://makeup.example") {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (origin) headers.set("Origin", origin);
  return new Request("https://makeup.example/api/projects", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  mockGetCurrentUser.mockReset();
  mockInsertValues.mockReset();
  mockGetCurrentUser.mockResolvedValue({ id: "user_1" });
});

afterEach(() => vi.resetModules());

describe("POST /api/projects", () => {
  it("rejects cross-origin project creation", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ name: "Lookbook" }, "https://evil.example"));

    expect(response.status).toBe(403);
    expect(mockInsertValues).not.toHaveBeenCalled();
  });

  it("rejects a non-object body and an overlong name", async () => {
    const { POST } = await import("./route");
    expect((await POST(request(null))).status).toBe(400);
    expect((await POST(request({ name: "x".repeat(101) }))).status).toBe(400);
    expect(mockInsertValues).not.toHaveBeenCalled();
  });

  it("creates a trimmed project for the signed-in user", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ name: "  Launch looks  " }));

    expect(response.status).toBe(201);
    expect(mockInsertValues).toHaveBeenCalledWith({
      userId: "user_1",
      name: "Launch looks"
    });
  });
});
