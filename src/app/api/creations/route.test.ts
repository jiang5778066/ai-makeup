import { beforeEach, expect, it, vi } from "vitest";
const { currentUser, list, read, remove } = vi.hoisted(() => ({ currentUser: vi.fn(), list: vi.fn(), read: vi.fn(), remove: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ getCurrentUser: currentUser }));
vi.mock("@/lib/media-creations-source", () => ({ createUnifiedCreationSource: () => ({ list, read, remove }) }));
import { GET } from "./route";
import { GET as detail, DELETE } from "./[id]/route";
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:9"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "not-a-key"); vi.stubEnv("DATABASE_URL", "postgres://127.0.0.1:9/no-business"); vi.stubEnv("CREATIONS_VISIBILITY_V1", "1"); currentUser.mockReset().mockResolvedValue({ id: "alice" }); list.mockReset().mockResolvedValue({ items: [], nextCursor: null }); read.mockReset().mockResolvedValue(null); remove.mockReset().mockResolvedValue("not_found"); });
it("真实路由401/404归属和门禁503，私有响应no-store", async () => {
  const req = new Request("https://studio.test/api/creations?userId=bob"); const context = { params: Promise.resolve({ id: "makeup:00000000-0000-4000-8000-000000000001" }) };
  currentUser.mockResolvedValueOnce(null); expect((await GET(req)).status).toBe(401); expect(list).not.toHaveBeenCalled();
  const r = await GET(req); expect(r.status).toBe(200); expect(list).toHaveBeenCalledWith("alice", expect.anything()); expect(r.headers.get("cache-control")).toContain("no-store");
  expect((await detail(req, context)).status).toBe(404); expect(read).toHaveBeenCalledWith("alice", "makeup:00000000-0000-4000-8000-000000000001");
  expect((await DELETE(new Request(req, { method: "DELETE", headers: { origin: "https://studio.test" } }), context)).status).toBe(404);
  vi.stubEnv("CREATIONS_VISIBILITY_V1", "0"); expect((await GET(req)).status).toBe(503);
});
