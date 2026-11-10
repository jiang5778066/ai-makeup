import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockGetBalance = vi.fn();

vi.mock("@/lib/supabase/server", () => ({ getCurrentUser: () => mockGetCurrentUser() }));
vi.mock("@/lib/credits", () => ({ getBalance: (...args: unknown[]) => mockGetBalance(...args) }));

beforeEach(() => {
  vi.resetModules();
  mockGetCurrentUser.mockReset();
  mockGetBalance.mockReset();
});

describe("GET /api/credits/balance", () => {
  it("returns 401 for a guest", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { GET } = await import("./route");
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns the signed-in user's balance", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_1" });
    mockGetBalance.mockResolvedValue(103);
    const { GET } = await import("./route");
    const response = await GET();
    await expect(response.json()).resolves.toEqual({ userId: "user_1", balance: 103 });
  });
});
