import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
const { exchangeCodeForSession, grantSignupCreditsIfNew } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn().mockResolvedValue({ data: { user: { id: "fixture-user" } }, error: null }),
  grantSignupCreditsIfNew: vi.fn()
}));
vi.mock("@/lib/supabase/server", () => ({ getSupabaseServerClient: async () => ({ auth: { exchangeCodeForSession } }) }));
vi.mock("@/lib/credits", () => ({ grantSignupCreditsIfNew }));
import { GET } from "./route";
describe("认证回调", () => {
  it("成功登录返回原中文路径和锚点", async () => {
    const next = "/zh-CN/ai-makeup?source=test#try";
    const response = await GET(new NextRequest(`https://studio.test/auth/callback?code=test&next=${encodeURIComponent(next)}`));
    expect(response.headers.get("location")).toBe(`https://studio.test${next}`);
  });
  it("缺少 code 时保留安全的 next 以便重新登录", async () => {
    const next = "/zh-CN/virtual-makeup-try-on#try";
    const response = await GET(new NextRequest(`https://studio.test/auth/callback?next=${encodeURIComponent(next)}`));
    const redirect = new URL(response.headers.get("location")!);
    expect(redirect.pathname).toBe("/login");
    expect(redirect.searchParams.get("next")).toBe(next);
  });
});
