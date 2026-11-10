import { beforeEach, expect, it, vi } from "vitest";
const { user } = vi.hoisted(() => ({ user: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ getCurrentUser: user }));
import { GET } from "./route";
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:9"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "not-a-key"); });
it("本人会话最小id/email，不泄漏metadata；成功/未登录/服务失败均no-store", async () => { user.mockResolvedValueOnce({ id: "alice", email: "alice@test.invalid", metadata: { private: true } }).mockResolvedValueOnce(null).mockRejectedValueOnce(new Error("private")); const r = await GET(); expect(await r.json()).toEqual({ user: { id: "alice", email: "alice@test.invalid" } }); expect(r.headers.get("cache-control")).toContain("no-store"); expect((await GET()).status).toBe(401); expect((await GET()).status).toBe(503); });
