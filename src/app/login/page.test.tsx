import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { signInWithOtp } = vi.hoisted(() => ({ signInWithOtp: vi.fn().mockResolvedValue({ error: null }) }));
vi.mock("@/lib/supabase/client", () => ({ getSupabaseBrowserClient: () => ({ auth: { signInWithOtp } }) }));
import LoginPage from "./page";
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:9"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "d1-non-secret-anon"); });
afterEach(() => { vi.unstubAllEnvs(); cleanup(); vi.clearAllMocks(); window.history.replaceState({}, "", "/"); });
describe("登录续接（邮件服务替身）", () => {
  it("将中文工具路径、查询和锚点传入邮件回调，并显示中文", async () => {
    const next = "/zh-CN/ai-makeup?source=test#try";
    window.history.replaceState({}, "", `/login?next=${encodeURIComponent(next)}`);
    render(<LoginPage />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test@example.com" } });
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);
    await waitFor(() => expect(signInWithOtp).toHaveBeenCalledOnce());
    const redirect = new URL(signInWithOtp.mock.calls[0][0].options.emailRedirectTo);
    expect(redirect.searchParams.get("next")).toBe(next);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("登录");
  });
  it("处理邮件客户端抛错，解除发送状态", async () => {
    signInWithOtp.mockRejectedValueOnce(new Error("local failure"));
    render(<LoginPage />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test@example.com" } });
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not send");
    expect(screen.getByRole("button", { name: "Continue with email" })).toBeEnabled();
  });
});

it("缺认证配置明确不可用，不调用邮件服务", () => { vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ""); render(<LoginPage/>); expect(screen.getByRole("alert")).toHaveTextContent("not configured"); expect(screen.getByRole("button", { name: "Continue with email" })).toBeDisabled(); expect(signInWithOtp).not.toHaveBeenCalled(); });
