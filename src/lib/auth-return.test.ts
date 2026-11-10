import { describe, expect, it } from "vitest";
import { safeReturnPath, loginHref, currentToolPath } from "./auth-return";
describe("站内返回地址校验", () => {
  it.each(["/ai-makeup#try", "/zh-CN/ai-makeup?source=menu#try", "/ai-lipstick-try-on?shade=%E7%BA%A2#try"])("保留有效路径 %s", (path) => {
    expect(safeReturnPath(path)).toBe(path);
    expect(new URL(loginHref(path), "https://studio.test").searchParams.get("next")).toBe(path);
  });
  it.each([undefined, null, 3, {}, "", "https://other.test", "//other.test", "/\\other", "/%5cother", "/%ZZ", "/%E0%A4", "/a\nb"])("异常值回退 %s", (path) => {
    expect(safeReturnPath(path)).toBe("/dashboard");
  });
  it("当前工具地址包含查询和锚点，缺省定位工具", () => {
    window.history.replaceState({}, "", "/zh-CN/ai-makeup?source=local");
    expect(currentToolPath()).toBe("/zh-CN/ai-makeup?source=local#try");
    window.history.replaceState({}, "", "/");
  });
});
