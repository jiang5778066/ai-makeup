import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockExchangeCodeForSession = vi.fn();
const mockGrantSignupCreditsIfNew = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => ({
    auth: { exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args) }
  })
}));

vi.mock("@/lib/credits", () => ({
  grantSignupCreditsIfNew: (...args: unknown[]) => mockGrantSignupCreditsIfNew(...args)
}));

function callbackRequest(next: string) {
  const url = new URL("https://makeup.example/auth/callback");
  url.searchParams.set("code", "auth_code");
  url.searchParams.set("next", next);
  return new NextRequest(url);
}

beforeEach(() => {
  mockExchangeCodeForSession.mockReset();
  mockGrantSignupCreditsIfNew.mockReset();
  mockExchangeCodeForSession.mockResolvedValue({
    data: { user: { id: "user_test" } },
    error: null
  });
  mockGrantSignupCreditsIfNew.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.resetModules();
});

describe("GET /auth/callback", () => {
  it.each([
    "https://evil.example/path",
    "//evil.example/path",
    "@evil.example",
    "\\evil.example/path",
    "/\\evil.example/path",
    "\\\\evil.example/path"
  ])("falls back to dashboard for unsafe next value %s", async (next) => {
    const { GET } = await import("./route");

    const response = await GET(callbackRequest(next));

    expect(response.headers.get("location")).toBe("https://makeup.example/dashboard");
  });

  it("preserves a safe local path with query and fragment", async () => {
    const { GET } = await import("./route");

    const response = await GET(callbackRequest("/settings?tab=billing#credits"));

    expect(response.headers.get("location")).toBe(
      "https://makeup.example/settings?tab=billing#credits"
    );
  });
});
