import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import EnglishPage, { generateMetadata as englishMetadata } from "@/app/(marketing)/[...slug]/page";
import ChinesePage, { generateMetadata as chineseMetadata } from "@/app/zh-CN/[...slug]/page";
import { PlatformDirectoryPage } from "./platform-directory-page";
vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); }, usePathname: () => null, useSearchParams: () => null }));

const templates = [
  { id: "508", titles: { en: "AI Angel Halo", "zh-CN": "AI 天使光环" } },
  { id: "1200", titles: { en: "Christmas(Heart)", "zh-CN": "圣诞爱心" } }
] as const;

describe("模板目录卡、服务端正文与元数据", () => {
  for (const [locale, Page, metadata] of [["en", EnglishPage, englishMetadata], ["zh-CN", ChinesePage, chineseMetadata]] as const) {
    it.each(templates)(`${locale} 模板 $id 的目录卡、正文与元数据标题一致，公开正文隐藏调试字段`, async ({ id, titles }) => {
      const directory = document.createElement("div");
      directory.innerHTML = renderToStaticMarkup(<PlatformDirectoryPage path="/video-effects" locale={locale}/>);
      const cardLink = directory.querySelector(`[data-directory-card="template-${id}"] a`);
      const title = cardLink?.querySelector("h2")?.textContent;
      const href = cardLink?.getAttribute("href");
      expect(title).toBe(titles[locale]);
      expect(href).toBe(`${locale === "zh-CN" ? "/zh-CN" : ""}/video-effects/lab?template_id=${id}`);
      const target = new URL(href!, window.location.origin);
      const props = {
        params: Promise.resolve({ slug: ["video-effects", "lab"] }),
        searchParams: Promise.resolve({
          template_id: target.searchParams.get("template_id") ?? undefined,
          model: "debug-model-sentinel",
          mode: "debug-mode-sentinel",
          tag: ["debug-tag-first", "debug-tag-second"]
        })
      };
      const html = renderToStaticMarkup(await Page(props));
      expect(html).toContain(`<h1>${title}</h1>`);
      expect(html.match(/<title>[^<]*<\/title>/g)).toEqual([`<title>${title} · ${locale === "en" ? "Currently unavailable" : "当前不可用"} | FrameKoi</title>`]);
      expect(html).toContain(locale === "en" ? 'href="/video-effects"' : 'href="/zh-CN/video-effects"');
      expect(html).toContain(locale === "en" ? "Framing guidance" : "构图指导");
      expect(html).toContain(locale === "en" ? "Sample prompt" : "示例提示词");
      expect(html).toContain(locale === "en" ? "Copy sample prompt" : "复制示例提示词");
      expect(html).not.toContain(`<dd>${id}</dd>`);
      expect(html).not.toContain("/video-effects/lab");
      expect(html).not.toMatch(/当前入口|Destination|template_id|debug-model-sentinel|debug-mode-sentinel|debug-tag-first|debug-tag-second/);
      const pageMetadata = await metadata(props);
      expect(pageMetadata.title).toBeNull();
      expect(pageMetadata.description).toContain(locale === "en" ? "Dedicated template generation" : "专用模板生成服务尚未开放");
      expect(pageMetadata.robots).toEqual({ index: false, follow: true });
    });
    it(`${locale} 正文和元数据都采用第一个模板值，未知、空值或缺失模板返回 404`, async () => {
      const props = { params: Promise.resolve({ slug: ["video-effects", "lab"] }), searchParams: Promise.resolve({ template_id: ["508", "1200"] }) };
      const title = templates[0].titles[locale];
      expect(renderToStaticMarkup(await Page(props))).toContain(`<h1>${title}</h1>`);
      expect(renderToStaticMarkup(await Page(props))).toContain(`<title>${title} · `);
      expect((await metadata(props)).title).toBeNull();
      for (const query of [{}, { template_id: "unknown" }, { template_id: "" }, { template_id: ["", "508"] }]) {
        const element = await Page({ ...props, searchParams: Promise.resolve(query) });
        expect(() => renderToStaticMarkup(element)).toThrow("NEXT_NOT_FOUND");
      }
    });
  }
});
