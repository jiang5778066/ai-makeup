import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { siteUrl } from "@/lib/brand";
import { resolveHomepageRoute } from "@/lib/platform-homepage";
import { platformRouteMetadata, PlatformRoutePage } from "./platform-route-page";

describe("视频工具指南", () => {
  const cases = [
    ["/video-to-video", "Video to video"],
    ["/tools/ai-animate-image-generator", "Animate a still image"],
    ["/tools/ai-celebrity-video", "Create a fictional presenter"],
    ["/tools/ai-hug-video-generator", "Hug scene"],
    ["/tools/ai-kissing-video-generator", "Kiss scene"],
    ["/tools/ai-lip-sync-video-generator", "Lip sync"],
    ["/tools/ai-music-video-generator", "Music video"],
    ["/tools/character-animation", "Character animation"],
    ["/tools/framepack-video-generator", "FramePack"],
    ["/tools/hunyuanvideo-avatar", "HunyuanVideo Avatar"],
    ["/tools/video-to-animation-converter", "Video to animation"],
    ["/tools/video-to-ghibli-style", "Hand-painted animation"],
    ["/video-effects/ai-french-kiss-video-generator", "French kiss scene"],
    ["/video-effects/ai-mermaid-video", "Mermaid effect"],
    ["/video-effects/ai-muscle-video", "Muscle effect"]
  ] as const;

  it.each(cases)("%s 将双语目录地址解析为正式指南", (path, title) => {
    expect(resolveHomepageRoute(path)).toMatchObject({ kind: "video-guide", path });
    expect(platformRouteMetadata(path, "en")).toMatchObject({ title });
    expect(platformRouteMetadata(path, "zh-CN")).toMatchObject({ alternates: { canonical: `/zh-CN${path}` } });
    expect(sitemap().map(entry => entry.url)).toContain(`${siteUrl}${path}`);
  });

  it("当前只接收图片和文字，视频重制指南提供本地回放入口", () => {
    const html = renderToStaticMarkup(<PlatformRoutePage path="/video-to-video" locale="zh-CN" />);
    expect(html).toContain("选择一段动作清楚的源视频");
    expect(html).toContain('href="/zh-CN/ai-video-editor"');
    expect(html).not.toContain('type="file"');
  });

  it("不存在的相邻路径不会被识别为指南", () => {
    expect(resolveHomepageRoute("/tools/ai-hug-video-generator/missing")).toBeNull();
  });
});
