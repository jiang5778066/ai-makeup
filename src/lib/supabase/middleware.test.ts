import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockCreateServerClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args)
}));

beforeEach(() => {
  vi.resetModules();
  mockCreateServerClient.mockReset();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

describe("public middleware without Supabase", () => {
  it("keeps public pages renderable instead of initializing an invalid client", async () => {
    const { updateSession } = await import("./middleware");
    const request = new NextRequest("https://makeup.example/ai-makeup");

    const { user } = await updateSession(request);

    expect(user).toBeNull();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });
});
