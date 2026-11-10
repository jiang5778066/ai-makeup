import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformVideoModelContent } from "./platform-video-model-content";
import { videoModelPages, coreVideoModelPaths } from "@/lib/platform-video-model-data";
import { VideoModelReferenceBody } from "./platform-video-model-sections";

vi.mock("./platform-homepage-media", () => ({
  HomepageVideo: ({ poster }: { poster: string }) => <span role="img" aria-label="公开参照视频海报" data-poster={poster} />,
}));

afterEach(cleanup);

describe("C2c视频模型专页正文与FAQ", () => {
  it("实际Seedance评分SVG保留文本字号且不输出非法React属性", () => {
    const errors = vi.spyOn(console, "error");
    try {
      render(<VideoModelReferenceBody path="/ai-video-models/seedance-2-0" locale="en" />);
      const chart = [...document.querySelectorAll('svg[data-video-model-chart]')];
      expect(chart).toHaveLength(2);
      for (const svg of chart) {
        expect(svg.parentElement).toHaveStyle({ width: "100%", height: "100%" });
        expect(svg.parentElement?.parentElement).toHaveStyle({ width: "100%", height: "100%" });
      }
      expect(chart[1]).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");
      expect(chart[0].querySelectorAll("line")).toHaveLength(13);
      const text = chart.flatMap(element => [...element.querySelectorAll("text")]);
      expect(text.some(element => element.textContent === "Style Fidelity")).toBe(true);
      expect(text.some(element => element.getAttribute("font-size") === "10")).toBe(true);
      expect(errors.mock.calls).toEqual([]);
    } finally { errors.mockRestore(); }
  });
  it("四页每个正文段落使用明确双语标题，不从正文首句截标题", () => {
    expect(coreVideoModelPaths).toHaveLength(4);
    for (const path of coreVideoModelPaths) {
      const page = videoModelPages[path];
      expect(page.bodySections.length).toBeGreaterThanOrEqual(4);
      expect(page.hero.en.length).toBeGreaterThan(20);
      expect(page.hero["zh-CN"].length).toBeGreaterThan(15);
      for (const section of page.bodySections) {
        expect(section.heading.en.length).toBeGreaterThan(3);
        expect(section.heading["zh-CN"].length).toBeGreaterThan(2);
      }
    }
  });

  it("逐页展示固定中英题目并展开完整、带外部主体归因的答案", () => {
    expect(coreVideoModelPaths).toHaveLength(4);
    for (const path of coreVideoModelPaths) {
      const page = videoModelPages[path];
      for (const locale of ["en", "zh-CN"] as const) {
        const view = render(<PlatformVideoModelContent page={page} locale={locale} />);
        const faq = document.querySelector<HTMLElement>(".platform-video-model-faq")!;
        expect(within(faq).getAllByRole("button")).toHaveLength(page.faq.length);
        const item = page.faq[0];
        const trigger = screen.getByRole("button", { name: item.question[locale] });
        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText(item.answer[locale])).toBeInTheDocument();
        expect(screen.getByText(item.answer[locale])).toHaveAttribute("id", `${page.catalogId}-faq-answer-1`);
        expect(item.answer[locale]).toContain(locale === "en" ? "reference page stated at capture time" : "参照页面在采集时称");
        view.unmount();
      }
    }
  });

  it("Kling AI保持多开，Kling 3.0、Seedance和HappyHorse保持单开", () => {
    expect(coreVideoModelPaths).toHaveLength(4);
    for (const path of coreVideoModelPaths) {
      const page = videoModelPages[path];
      render(<PlatformVideoModelContent page={page} locale="en" />);
      const faq = document.querySelector<HTMLElement>(".platform-video-model-faq")!;
      const triggers = within(faq).getAllByRole("button");
      fireEvent.click(triggers[0]);
      fireEvent.click(triggers[1]);
      if (path === "/ai-video-models/kling-ai") {
        expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
        expect(triggers[1]).toHaveAttribute("aria-expanded", "true");
      } else {
        expect(triggers[0]).toHaveAttribute("aria-expanded", "false");
        expect(triggers[1]).toHaveAttribute("aria-expanded", "true");
      }
      expect(screen.getAllByRole("img", { name: "公开参照视频海报" }).length).toBeGreaterThan(0);
      expect(document.querySelectorAll('a[href="#video-model-settings"]').length).toBeGreaterThan(0);
      cleanup();
    }
  });

  it("按完整原始HTML保留四页层级、图文段落和交互控件数量", () => {
    const kling = videoModelPages["/ai-video-models/kling-3-0"];
    const horse = videoModelPages["/ai-video-models/happy-horse-1-0"];
    const seedance = videoModelPages["/ai-video-models/seedance-2-0"];
    render(<PlatformVideoModelContent page={kling} locale="en"/>);
    expect(document.querySelectorAll('[data-video-model-rail] .platform-video-model-reference-video')).toHaveLength(5);
    expect(document.querySelectorAll('[data-reference-section="5"] .platform-video-model-reference-video')).toHaveLength(6);
    expect(within(document.querySelector('[data-reference-section="5"]') as HTMLElement).getAllByRole("link",{name:/Try Kling 3.0/})).toHaveLength(6);
    cleanup();
    render(<PlatformVideoModelContent page={seedance} locale="en"/>);
    expect(screen.getAllByRole("button",{name:/Copy example/})).toHaveLength(5);
    expect(document.querySelectorAll('[data-video-model-rail] .platform-video-model-reference-video')).toHaveLength(6);
    expect(document.querySelectorAll('[data-reference-section="4"] .platform-video-model-reference-video')).toHaveLength(3);
    expect(document.querySelectorAll('[data-reference-section="6"] table')).toHaveLength(1);
    expect(document.querySelectorAll('[data-reference-section="6"] [data-video-model-chart]')).toHaveLength(2);
    expect(document.querySelector('[data-reference-section="5"] pre')?.textContent).toContain("[camera movement]");
    cleanup();
    render(<PlatformVideoModelContent page={horse} locale="en"/>);
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    expect(screen.getByRole("tabpanel").textContent).toContain("Social Media");
    fireEvent.click(screen.getByRole("tab",{name:"Character"}));
    expect(screen.getByRole("tabpanel").textContent).toContain("Character and IP");
    expect(within(document.querySelector('[data-reference-section="5"]') as HTMLElement).getAllByRole("link",{name:/Try HappyHorse/})).toHaveLength(5);
    expect(document.querySelectorAll('[data-reference-section="5"] .platform-video-model-reference-video')).toHaveLength(5);
  });

  it("完整保留Kling AI提示词示例、双CTA和模型功能结构",()=>{
    const page=videoModelPages["/ai-video-models/kling-ai"];
    render(<PlatformVideoModelContent page={page} locale="en"/>);
    expect(document.querySelector('[data-reference-section="3"]')?.textContent).toContain("Clip and audio options");
    expect(document.querySelector('[data-reference-section="3"]')?.textContent).toContain("Style consistency");
    expect(document.querySelectorAll('[data-reference-section="5"] pre').length).toBe(1);
    expect(document.querySelector('[data-reference-section="5"] pre')?.textContent).toContain("electric scooter");
    expect(document.querySelectorAll('a[href="#video-model-settings"]').length).toBeGreaterThan(0);
  });

  it("明确标示公开素材归属与生成未开放状态", () => {
    const page = videoModelPages["/ai-video-models/seedance-2-0"];
    render(<PlatformVideoModelContent page={page} locale="zh-CN" />);
    expect(screen.getAllByText(/本区为 Lanta AI 公开参照/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/示例不是本站生成结果/).length).toBeGreaterThan(0);
  });

  it("保留Seedance五类提示词模板、四模型比较和Horse用途入口语义", () => {
    const seedance = videoModelPages["/ai-video-models/seedance-2-0"];
    const horse = videoModelPages["/ai-video-models/happy-horse-1-0"];
    expect(seedance.bodySections.map((section) => section.heading.en)).toContain("How to write prompts for Seedance 2.0? Most Practical Seedance 2.0 Prompt Templates");
    expect(seedance.bodySections.map((section) => section.heading["zh-CN"])).toContain("如何为 Seedance 2.0 编写提示词？最实用的 Seedance 2.0 提示词模板");
    expect(seedance.faq[1].answer.en).toContain("Fast");
    expect(seedance.faq[1].answer.en).toContain("Pro");
    expect(seedance.faq[1].answer.en).toContain("not a Pro option");
    expect(horse.bodySections.map((section) => section.heading.en)).toContain("Explore HappyHorse 1.0 Use Cases");
    expect(horse.faq[8].answer["zh-CN"]).toContain("商业使用授权");
  });

  it("正文保留固定原件中的模板步骤、比较行和逐段外部来源说明", () => {
    const seedance = videoModelPages["/ai-video-models/seedance-2-0"];
    render(<PlatformVideoModelContent page={seedance} locale="en" />);
    expect(screen.getAllByText(/Template 5: Audio Reference & Lip Sync/)).toHaveLength(1);
    expect(document.querySelectorAll("table tbody tr")).toHaveLength(5);
    expect(screen.getByRole("cell", { name: "Edge Stability" })).toBeInTheDocument();
    expect(screen.getAllByText("8.2").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Source: Lanta AI public reference at capture time/).length).toBeGreaterThan(5);
  });

  it("复制固定完整例文，失败时提供可见反馈而不假报成功", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<PlatformVideoModelContent page={videoModelPages["/ai-video-models/seedance-2-0"]} locale="en" />);
    const button = screen.getByRole("button", { name: /^Copy example 5 Create an 8-second/ });
    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveTextContent("Copied"));
    expect(writeText).toHaveBeenCalledWith("Create an 8-second cute cinematic pet video of a fluffy orange cat cooking in a cozy home kitchen. The cat stands on a small stool in front of the counter, wearing a tiny chef hat and gently stirring a bowl of pancake batter with both paws. Use a medium close-up shot with a slow push-in camera movement, keeping the cat centered while showing the warm kitchen background. The motion should include the cat blinking, moving its paws naturally, tilting its head with curiosity, and carefully stirring the bowl without changing its position. The visual style should be warm, realistic, soft, and charming, with morning sunlight, creamy kitchen colors, detailed fur texture, and a playful family-friendly mood. Add light kitchen ambience, soft cheerful background music, gentle bowl-stirring sounds, and a cute little meow near the end. Keep the cat’s appearance, chef hat, bowl, kitchen setting, and cozy visual style consistent throughout the video.");
    writeText.mockRejectedValueOnce(new Error("clipboard unavailable"));
    fireEvent.click(screen.getByRole("button", { name: /^Copy example 5 Use the two people/ }));
    expect(await screen.findByRole("status")).toHaveTextContent("Copy did not complete");
  });

  it("Horse键盘选择切换对应面板，轮播按钮仅滚动自己的轨道", () => {
    render(<PlatformVideoModelContent page={videoModelPages["/ai-video-models/happy-horse-1-0"]} locale="en" />);
    const first = screen.getByRole("tab", { name: "Social Media" });
    fireEvent.keyDown(first, { key: "End" });
    expect(screen.getByRole("tab", { name: "Cinematic" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Cinematic");
    expect(screen.getByRole("tab", { name: "Cinematic" })).toHaveFocus();
    cleanup();
    render(<PlatformVideoModelContent page={videoModelPages["/ai-video-models/kling-3-0"]} locale="en" />);
    const rail = document.querySelector<HTMLElement>('[data-video-model-rail]')!;
    const scroll = vi.fn();
    rail.scrollBy = scroll;
    Object.defineProperty(rail, "clientWidth", { value: 600 });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(scroll).toHaveBeenLastCalledWith({ left: 480, behavior: "smooth" });
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(scroll).toHaveBeenLastCalledWith({ left: -480, behavior: "smooth" });
  });
});
