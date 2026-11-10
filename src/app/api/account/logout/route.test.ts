import { beforeEach, expect, it, vi } from "vitest";
const { currentUser, signOut } = vi.hoisted(() => ({ currentUser: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ getCurrentUser: currentUser, getSupabaseServerClient: async () => ({ auth: { signOut } }) }));
import { POST } from "./route";
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:9"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "not-a-key"); currentUser.mockResolvedValue({ id: "alice" }); signOut.mockReset().mockResolvedValue({ error: null }); });
it("跨站拒绝，未登录401，同源退出调用原signOut且no-store", async () => {
  const req = (origin: string) => new Request("https://studio.test/api/account/logout", { method: "POST", headers: { origin } });
  expect((await POST(req("https://evil.test"))).status).toBe(403); expect(signOut).not.toHaveBeenCalled(); currentUser.mockResolvedValueOnce(null); expect((await POST(req("https://studio.test"))).status).toBe(401); const r = await POST(req("https://studio.test")); expect(r.status).toBe(200); expect(signOut).toHaveBeenCalledWith({ scope: "local" }); expect(r.headers.get("cache-control")).toContain("no-store");
});
