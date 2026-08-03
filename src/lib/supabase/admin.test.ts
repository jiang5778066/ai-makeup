import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateClient = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args)
}));

beforeEach(() => {
  vi.resetModules();
  mockCreateClient.mockReset();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
});

describe("getSupabaseAdminClient", () => {
  it("creates a non-persistent service-role client", async () => {
    mockCreateClient.mockReturnValue({ auth: { admin: {} } });
    const { getSupabaseAdminClient } = await import("./admin");

    getSupabaseAdminClient();

    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "service-role-key",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  });

  it("fails closed when the service role is not configured", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { getSupabaseAdminClient } = await import("./admin");

    expect(() => getSupabaseAdminClient()).toThrow("supabase_admin_unconfigured");
  });
});
