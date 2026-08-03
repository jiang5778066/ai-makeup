import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecute = vi.fn();

vi.mock("@/db/client", () => ({
  db: { execute: (...args: unknown[]) => mockExecute(...args) }
}));

beforeEach(() => {
  vi.resetModules();
  mockExecute.mockReset();
});

describe("persistent rate limit", () => {
  it("uses the database count returned by the atomic fixed-window update", async () => {
    const resetAt = new Date("2026-08-04T00:00:00.000Z");
    mockExecute.mockResolvedValue([{ count: 2, reset_at: resetAt }]);
    const { rateLimit } = await import("./rate-limit");

    const result = await rateLimit("generation:user_1:127.0.0.1", 3, 60_000);

    expect(mockExecute).toHaveBeenCalledOnce();
    expect(result).toEqual({ ok: true, remaining: 1, resetAt: resetAt.getTime() });
  });

  it("rejects requests whose persisted count exceeds the limit", async () => {
    const resetAt = new Date("2026-08-04T00:00:00.000Z");
    mockExecute.mockResolvedValue([{ count: 4, reset_at: resetAt }]);
    const { rateLimit } = await import("./rate-limit");

    const result = await rateLimit("generation:user_1:127.0.0.1", 3, 60_000);

    expect(result).toEqual({ ok: false, remaining: 0, resetAt: resetAt.getTime() });
  });
});
