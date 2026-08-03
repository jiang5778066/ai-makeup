import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteShell } from "./site-shell";

describe("SiteShell", () => {
  it("renders the competitor-style sidebar shell without changing product actions", () => {
    const { container } = render(
      <SiteShell locale="zh-CN" currentPath="/ai-makeup">
        <div>页面内容</div>
      </SiteShell>
    );

    expect(screen.getByRole("link", { name: "Makeup AI home" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "主导航" })).toBeInTheDocument();
    expect(container.querySelector("aside.marketing-sidebar")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "价格" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "登录领 3 次" })).toBeInTheDocument();
    expect(screen.getByText("页面内容")).toBeInTheDocument();
  });
});
