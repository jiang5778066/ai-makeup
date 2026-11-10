import { NextRequest, NextResponse } from "next/server";
import { expect, it, vi } from "vitest";
vi.mock("@/lib/supabase/middleware", () => ({ updateSession: async () => ({ response: NextResponse.next(), user: null }) }));
import { proxy } from "@/proxy";
it("仅两个精确账户接口代理401有私有no-store，负向路径行为不扩", async () => {
  for (const path of ["/api/account/session", "/api/account/logout"]) { const response = await proxy(new NextRequest(`https://studio.test${path}`)); expect(response.status).toBe(401); expect(await response.json()).toEqual({ code: "unauthorized", message: "Sign in required." }); expect(response.headers.get("cache-control")).toBe("private, no-store"); expect(response.headers.get("vary")).toContain("Cookie"); }
  for (const path of ["/api/account/session/child", "/api/account/session-other", "/api/account/delete-data", "/api/projects"]) { const response = await proxy(new NextRequest(`https://studio.test${path}`)); expect(response.status).toBe(401); expect(response.headers.get("cache-control")).toBeNull(); }
});
