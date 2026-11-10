import { beforeEach, expect, it, vi } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import { createMakeupSource } from "./platform-creations-source";
import { createCreationHandlers } from "./platform-creations-service";
import { encodeCreationCursor } from "./platform-creations-query";
const alice = "00000000-0000-4000-8000-00000000000a", bob = "00000000-0000-4000-8000-00000000000b";
const id = "00000000-0000-4000-8000-000000000002", at = "2026-11-09T00:00:00.123900Z";
let boundary: boolean;
const unsafe = vi.fn();
beforeEach(() => { boundary = true; unsafe.mockReset().mockImplementation((query: string) => ({ values: async () => query.includes('to_char(') ? [] : boundary ? [[id]] : [] })); });
const handler = (user: string) => createCreationHandlers({ currentUser: async () => ({ id: user }), ready: () => true, source: createMakeupSource(async () => drizzle({ options: { parsers: {}, serializers: {} }, unsafe } as never)) });
const req = (cursor = encodeCreationCursor("all", at, id), filter = "all") => new Request(`https://studio.test/api/creations?limit=1&filter=${filter}&cursor=${cursor}`);
it("本人游标先执行实际归属SQL，精确时间绑定，已移除边界不排除", async () => {
  const response = await handler(alice).list(req()); expect(response.status).toBe(200); expect(unsafe).toHaveBeenCalledTimes(2);
  const [sql, params] = unsafe.mock.calls[0]; expect(sql).toContain('"user_id"'); expect(sql).toContain('"created_at"'); expect(sql).not.toContain('"deleted_at"'); expect(sql).toContain("limit"); expect(params).toEqual(expect.arrayContaining([alice, id, at])); expect(sql).not.toContain(at);
  const [listSql, listParams] = unsafe.mock.calls[1]; expect(listSql).toContain('"deleted_at" is null'); expect(listParams).toEqual(expect.arrayContaining([alice, at, id]));
});
it("跨账户、缺失与时间篡改均同400，不执行列表或签名", async () => {
  boundary = false;
  for (const cursor of [encodeCreationCursor("all", at, id), encodeCreationCursor("all", "2026-11-09T00:00:00.123901Z", id), encodeCreationCursor("all", at, "00000000-0000-4000-8000-000000000099")]) {
    const response = await handler(bob).list(req(cursor)); expect(response.status).toBe(400); expect(await response.json()).toEqual({ code: "invalid_cursor" }); expect(response.headers.get("cache-control")).toContain("no-store");
  }
  expect(unsafe.mock.calls.every(call => !call[0].includes("to_char("))).toBe(true); expect(unsafe.mock.calls.every(call => call[1].includes(bob))).toBe(true);
});
it("filter不匹配/畸形/过长/未知版本先拒绝，不能访问数据库", async () => {
  const bad = [req(undefined, "image"), req("a".repeat(513)), req(Buffer.from(JSON.stringify({ v: 2, filter: "all", at, id })).toString("base64url"))];
  for (const request of bad) expect((await handler(alice).list(request)).status).toBe(400); expect(unsafe).not.toHaveBeenCalled();
});
it("无归属验证能力的数据源拒绝游标而非返回伪空成功", async () => {
  const list = vi.fn(); const response = await createCreationHandlers({ currentUser: async () => ({ id: bob }), ready: () => true, source: { list, read: vi.fn(), remove: vi.fn() } }).list(req()); expect(response.status).toBe(400); expect(list).not.toHaveBeenCalled();
});
