import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCreationHandlers, type CreationDependencies } from "./platform-creations-service";
import type { CreationDTO } from "./platform-creations-types";
const id = "makeup:00000000-0000-4000-8000-000000000001";
const item: CreationDTO = { version: 1, id, kind: "makeup", mediaType: "image", title: "妆容", status: "done", createdAt: "2026-11-09T00:00:00.000Z", updatedAt: "2026-11-09T00:00:00.000Z", removable: true, result: null };
let deps: CreationDependencies;
beforeEach(() => { deps = { currentUser: vi.fn().mockResolvedValue({ id: "alice" }), ready: () => true, source: { list: vi.fn().mockResolvedValue({ items: [item], nextCursor: null }), read: vi.fn().mockImplementation(async (user, key) => user === "alice" && key === id ? item : null), remove: vi.fn().mockResolvedValue("removed") } }; });
const request = (path = "", method = "GET", origin = "https://studio.test") => new Request(`https://studio.test/api/creations${path}`, { method, headers: { origin } });
describe("作品真实服务边界（隔离依赖）", () => {
  it("未登录401且不调用数据源，所有响应no-store", async () => { deps.currentUser = async () => null; const r = await createCreationHandlers(deps).list(request()); expect(r.status).toBe(401); expect(r.headers.get("cache-control")).toContain("no-store"); expect(deps.source.list).not.toHaveBeenCalled(); });
  it("只传服务端账户，忽略query伪造userId，返回最小DTO", async () => { const r = await createCreationHandlers(deps).list(request("?userId=bob")); expect(r.status).toBe(200); expect(deps.source.list).toHaveBeenCalledWith("alice", expect.objectContaining({ filter: "all", limit: 12 })); expect((await r.json()).items).toEqual([item]); });
  it("跨用户与不存在同404", async () => { deps.currentUser = async () => ({ id: "bob" }); const h = createCreationHandlers(deps); expect((await h.read(request(), id)).status).toBe(404); expect((await h.read(request(), "makeup:00000000-0000-4000-8000-000000000002")).status).toBe(404); });
  it("缺能力503，不调用新数据库查询，不返回假空", async () => { deps.ready = () => false; const r = await createCreationHandlers(deps).list(request()); expect(r.status).toBe(503); expect(deps.source.list).not.toHaveBeenCalled(); });
  it("过滤和分页非法400，有界limit", async () => { const h = createCreationHandlers(deps); for (const q of ["?limit=500", "?filter=other", "?cursor=malformed"]) expect((await h.list(request(q))).status).toBe(400); expect(deps.source.list).not.toHaveBeenCalled(); });
  it("移除强制同源并防跨站", async () => { const h = createCreationHandlers(deps); expect((await h.remove(request("", "DELETE", "https://evil.test"), id)).status).toBe(403); expect(deps.source.remove).not.toHaveBeenCalled(); });
  it("进行中409，终态幂等成功，数据库失败503", async () => { const h = createCreationHandlers(deps); vi.mocked(deps.source.remove).mockResolvedValueOnce("in_progress").mockResolvedValueOnce("removed").mockResolvedValueOnce("removed").mockRejectedValueOnce(new Error("private provider")); expect((await h.remove(request("", "DELETE"), id)).status).toBe(409); expect((await h.remove(request("", "DELETE"), id)).status).toBe(200); expect((await h.remove(request("", "DELETE"), id)).status).toBe(200); const r = await h.remove(request("", "DELETE"), id); expect(r.status).toBe(503); expect(JSON.stringify(await r.json())).not.toContain("private provider"); });
});
