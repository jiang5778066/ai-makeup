import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import EnglishPage, { generateMetadata as englishMetadata } from "@/app/(marketing)/[...slug]/page";
import ChinesePage, { generateMetadata as chineseMetadata } from "@/app/zh-CN/[...slug]/page";
vi.mock("./site-shell", () => ({ SiteShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); }, usePathname: () => null, useSearchParams: () => null }));

describe("模板服务端页面与元数据采用同一实际查询", () => {
  for (const [locale, Page, metadata] of [["en", EnglishPage, englishMetadata], ["zh-CN", ChinesePage, chineseMetadata]] as const) {
    it.each(["508", "1200"])(`${locale} 模板 %s 的SSR标题、字段与metadata一致`, async id => {
      const props = { params: Promise.resolve({ slug: ["video-effects", "lab"] }), searchParams: Promise.resolve({ template_id: id, tag: ["a", "b"] }) };
      const html = renderToStaticMarkup(await Page(props));
      const title = locale === "en" ? `Video Effect ${id}` : `视频特效 ${id}`;
      expect(html).toContain(`<h1>${title}</h1>`); expect(html).toContain(`<dd>${id}</dd>`);
      expect(html).toContain(`template_id=${id}&amp;tag=a&amp;tag=b`);
      expect((await metadata(props)).title).toContain(title);
    });
    it(`${locale} 重复参数采用第一个值，未知及缺失模板404`, async () => {
      const props = { params: Promise.resolve({ slug: ["video-effects", "lab"] }), searchParams: Promise.resolve({ template_id: ["508", "1200"] }) };
      expect((await metadata(props)).title).toContain("508");
      for (const query of [{}, { template_id: "unknown" }, { template_id: ["", "508"] }]) {
        const element = await Page({ ...props, searchParams: Promise.resolve(query) });
        expect(() => renderToStaticMarkup(element)).toThrow("NEXT_NOT_FOUND");
      }
    });
  }
});
