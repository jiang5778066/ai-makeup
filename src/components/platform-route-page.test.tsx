import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlatformRoutePage, platformRouteMetadata } from "./platform-route-page";
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("./platform-landing-page", () => ({ PlatformLandingPage: () => <h1>平台宣传页</h1> }));
vi.mock("./platform-workspace-page", () => ({ PlatformWorkspacePage: () => <h1>创作工作台</h1> }));
vi.mock("./platform-generator-page", () => ({ PlatformGeneratorPage: ({ path, initialQuery }: {path:string;initialQuery:string}) => <h1>{path}:生成器:{initialQuery}</h1> }));
vi.mock("./platform-wan-model-page", () => ({ PlatformWanModelPage: ({ path, locale, initialQuery }: { path: string; locale: string; initialQuery:string }) => <h1>{locale}:{path}:Wan:{initialQuery}</h1> }));
vi.mock("./platform-directory-page", () => ({ PlatformDirectoryPage: ({ path, locale }: { path: string; locale: string }) => <h1>{locale}:{path}目录正文</h1> }));
vi.mock("./platform-video-model-page", () => ({ PlatformVideoModelPage: ({ path, locale, initialQuery }: {path:string;locale:string;initialQuery:string}) => <h1>{locale}:{path}:VideoModel:{initialQuery}</h1> }));
vi.mock("./landing-page", () => ({ LandingPage: ({ page }: { page: { slug: string } }) => <h1>{page.slug}</h1> }));
vi.mock("./platform-root-generator-page", () => ({ PlatformRootGeneratorPage: ({ path, locale }: { path: string; locale: string }) => <h1>{locale}:{path}:RootIntroduction</h1> }));

it("四根双语介绍独立分发与canonical，不把ready介绍说成已接入型号", () => {
  for (const locale of ["en", "zh-CN"] as const) for (const path of ["/cogvideox-video-generator", "/hunyuan-video-lora", "/hunyuanvideo-generator", "/mochi1-video-generator"]) {
    const view = render(<PlatformRoutePage path={path} locale={locale} searchParams={{ model: ["102", "other"] }}/>);
    expect(screen.getByRole("heading")).toHaveTextContent(`${locale}:${path}:RootIntroduction`);
    const metadata = platformRouteMetadata(path, locale);
    expect(metadata.title).toContain("Makeup AI");
    expect(metadata.description).toMatch(/不代表该型号已接入|does not imply model availability/);
    expect(metadata.alternates?.canonical).toBe(`${locale === "zh-CN" ? "/zh-CN" : ""}${path}`);
    view.unmount();
  }
});
describe("页面实际分发和SEO身份", () => {
  it("根页面呈现平台宣传正文，home独立进入工作台", () => {
    const { unmount } = render(<PlatformRoutePage path="/" locale="zh-CN"/>);
    expect(screen.getByRole("heading", { name: "平台宣传页" })).toBeInTheDocument();
    unmount(); render(<PlatformRoutePage path="/home" locale="zh-CN"/>);
    expect(screen.getByRole("heading", { name: "创作工作台" })).toBeInTheDocument();
  });
  it("美妆仍走已有正文，未知路径触发404", () => {
    render(<PlatformRoutePage path="/ai-makeup" locale="en"/>);
    expect(screen.getByRole("heading", { name: "ai-makeup" })).toBeInTheDocument();
    expect(() => PlatformRoutePage({ path: "/unknown/tool", locale: "en" })).toThrow("NEXT_NOT_FOUND");
  });
  it("五个目录实际分发新正文，双语SEO不再返回不可用或美妆身份", () => {
    for (const locale of ["en", "zh-CN"] as const) for (const path of ["/tools", "/video-effects", "/image-effects", "/ai-image-models", "/ai-video-models"]) {
      const view = render(<PlatformRoutePage path={path} locale={locale}/>);
      expect(screen.getByRole("heading", { name: `${locale}:${path}目录正文` })).toBeInTheDocument();
      const metadata = platformRouteMetadata(path, locale);
      expect(metadata.title).toContain("Makeup AI");
      expect(metadata.title).not.toMatch(/Currently unavailable|当前不可用/);
      expect(metadata.alternates?.canonical).toBe(`${locale === "zh-CN" ? "/zh-CN" : ""}${path}`);
      view.unmount();
    }
  });
  it("首页SEO体现图片视频与真实可用边界，不继承自拍步骤", () => {
    const landing = platformRouteMetadata("/", "zh-CN");
    const home = platformRouteMetadata("/home", "en");
    expect(landing.title).toBe("图片与视频创作平台");
    expect(landing.alternates?.canonical).toMatch(/\/zh-CN$/);
    expect(home.title).toBe("Creative workspace");
    expect(home.alternates?.canonical).toMatch(/\/home$/);
  });
});

it("四专用页面双语分发与SEO准确并传递重复查询",()=>{for(const locale of ["en","zh-CN"]as const)for(const path of ["/ai-image-generator","/ai-video-generator","/ai-image-models/gpt-image-2","/ai-image-models/nano-banana-pro"]){const view=render(<PlatformRoutePage path={path} locale={locale} searchParams={{model:["gpt-image-2","other"]}}/>);expect(screen.getByRole("heading")).toHaveTextContent(`${path}:生成器:model=gpt-image-2&model=other`);const metadata=platformRouteMetadata(path,locale);expect(metadata.title).not.toMatch(/当前不可用|Currently unavailable/);expect(metadata.description).toMatch(path==='/ai-image-generator'||path==='/ai-image-models/gpt-image-2'?/本站图片能力以生成面板为准|Site image availability/:path==='/ai-video-generator'?/本站视频能力以生成面板为准|Site video availability/:/生成服务尚未开放|Generation is not available/);view.unmount();}});

it("Wan五路双语分发身份与URL首值原样交接，未实现模型仍scaffold",()=>{for(const locale of ["en","zh-CN"]as const)for(const slug of ["wan-2-2","wan-2-5","wan-2-6","wan-3-0","wan-fusionX"]){const path="/ai-video-models/"+slug,view=render(<PlatformRoutePage path={path} locale={locale} searchParams={{duration:["10","30"]}}/>);expect(screen.getByRole("heading")).toHaveTextContent(`${locale}:${path}:Wan:duration=10&duration=30`);expect(platformRouteMetadata(path,locale).description).toMatch(/生成暂不可用|generation is not available/);view.unmount();}});


it("C2d五页双语实际分发及SEO以pathname命名，重复model不改介绍身份",()=>{
  for(const locale of ["en","zh-CN"] as const)for(const [slug,title] of [["grok-imagine","Grok"],["mindvideo-ai","Mind"],["sora-2","Sora"],["veo-3","Veo"],["vheer","Vheer"]]){
    const path="/ai-video-models/"+slug,view=render(<PlatformRoutePage path={path} locale={locale} searchParams={{model:["wan-3-0","unknown"],duration:["bad","8"]}}/>);
    expect(screen.getByRole("heading")).toHaveTextContent(`${locale}:${path}:VideoModel:model=wan-3-0&model=unknown&duration=bad&duration=8`);
    const metadata=platformRouteMetadata(path,locale,{model:"wan-3-0"});expect(metadata.title).toContain(title);expect(metadata.title).not.toMatch(/Currently unavailable|当前不可用/);
    expect(metadata.description).toMatch(slug==='grok-imagine'?/本站视频能力以生成面板为准|Site video availability/:/生成服务尚未开放|Generation is not available/);expect(metadata.alternates?.canonical).toBe(`${locale==="zh-CN"?"/zh-CN":""}${path}`);view.unmount();
  }
});

vi.mock("./platform-dreamface-page", () => ({ PlatformDreamfacePage: ({ locale, initialQuery }: {locale:string;initialQuery:string}) => <h1>{locale}:DreamFace:{initialQuery}</h1> }));
it("DreamFace专属分派保重复query和双语metadata，不冒充Lanta provider",()=>{for(const locale of ["en","zh-CN"]as const){const path="/ai-video-models/dreamface-ai",view=render(<PlatformRoutePage path={path} locale={locale} searchParams={{model:["dreamface-ai","112"],tab:"text"}}/>);expect(screen.getByRole("heading")).toHaveTextContent(`${locale}:DreamFace:model=dreamface-ai&model=112&tab=text`);const meta=platformRouteMetadata(path,locale);expect(meta.title).toContain("DreamFace");expect(meta.description).toMatch(/生成服务尚未开放|Generation is not available/);expect(meta.alternates?.canonical).toBe(`${locale==="zh-CN"?"/zh-CN":""}${path}`);view.unmount();}});
