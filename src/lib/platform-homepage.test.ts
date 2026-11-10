import { describe, expect, it } from "vitest";
import { entryHref, platformEntry } from "./platform-navigation";
import { homepageEntry, resolveHomepageRoute } from "./platform-homepage";
import { communityColumnOrder, communityExamples } from "./platform-homepage-data";
import { rootGeneratorPages, type RootGeneratorPath } from "./platform-root-generator-data";

it("四根介绍页独立分派，不以查询伪造provider或解锁其它scaffold", () => {
  for (const path of Object.keys(rootGeneratorPages) as RootGeneratorPath[]) {
    expect(resolveHomepageRoute(path, { model: ["102", "wan-3-0"] })).toEqual({ kind: "root-generator", path });
    expect(platformEntry(path.slice(1)).status).toBe("ready");
    expect(platformEntry(path.slice(1)).model).toBeUndefined();
    expect(entryHref(homepageEntry(path.slice(1)), "zh-CN")).toBe(`/zh-CN${path}`);
  }
  expect(resolveHomepageRoute("/hunyuanvideo-generator-unknown")).toBeNull();
  expect(resolveHomepageRoute("/tools/ai-animal-generator")).toBeNull();
  expect(resolveHomepageRoute("/tools/ai-animate-image-generator")).toMatchObject({ kind: "scaffold" });
});

describe("平台首页入口与路由身份", () => {
  it("各响应式瀑布流保留全部公开案例，避免换列时重复或丢失目标", () => {
    const expected = communityExamples.map(item => item.id).sort();
    for (const groups of Object.values(communityColumnOrder)) {
      expect(groups.flat().sort()).toEqual(expected);
    }
  });
  it("宣传、工作台和美妆保持独立，未知路径仍无匹配", () => {
    expect(resolveHomepageRoute("/")).toEqual({ kind: "landing" });
    expect(resolveHomepageRoute("/home")).toEqual({ kind: "workspace" });
    for (const path of ["/tools", "/video-effects", "/image-effects", "/ai-image-models", "/ai-video-models"]) expect(resolveHomepageRoute(path)).toMatchObject({ kind: "directory", path });
    expect(resolveHomepageRoute("/ai-makeup")).toBeNull();
    expect(resolveHomepageRoute("/made-up-tool")).toBeNull();
  });
  it("已建立外壳能到达但仍明确未完成，不能把所有pending解锁", () => {
    expect(platformEntry("home").status).toBe("ready");
    expect(platformEntry("video-generator").status).toBe("ready");
    expect(platformEntry("video-editor").status).toBe("pending");
    expect(platformEntry("vheer").status).toBe("ready");
    expect(resolveHomepageRoute("/ai-video-generator")).toMatchObject({ kind: "generator", path: "/ai-video-generator" });
  });
  it("模板身份按真实首个查询值解析，未知和缺失模板不冒充1200", () => {
    expect(resolveHomepageRoute("/video-effects/lab", { template_id: "508" })).toMatchObject({ kind: "scaffold", entry: { id: "template-508" } });
    expect(resolveHomepageRoute("/video-effects/lab", { template_id: ["1200", "508"] })).toMatchObject({ entry: { id: "template-1200" } });
    expect(resolveHomepageRoute("/video-effects/lab", { template_id: ["508", "1200"] })).toMatchObject({ entry: { id: "template-508" } });
    expect(resolveHomepageRoute("/video-effects/lab", { template_id: "unknown" })).toBeNull();
    expect(resolveHomepageRoute("/video-effects/lab")).toBeNull();
  });
  it("模式、模型和模板选择进入正确本地目标并保留锚点", () => {
    expect(entryHref(homepageEntry("video-generator", { mode: "image-to-video" }), "zh-CN")).toBe("/zh-CN/ai-video-generator?mode=image-to-video");
    expect(entryHref(homepageEntry("image-generator", { model: "seedream-5-0-pro", hash: "generator" }), "en")).toBe("/ai-image-generator?model=seedream-5-0-pro#generator");
    expect(entryHref(homepageEntry("template-508"), "zh-CN")).toBe("/zh-CN/video-effects/lab?template_id=508");
  });
});

it("既有生成器与Wan保持原路由，C2c四页与C2d五页分别保留专页身份",()=>{for(const path of ["/ai-image-generator","/ai-video-generator","/ai-image-models/gpt-image-2","/ai-image-models/nano-banana-pro"])expect(resolveHomepageRoute(path)).toMatchObject({kind:"generator",path});for(const slug of ["wan-2-2","wan-2-5","wan-2-6","wan-3-0","wan-fusionX"])expect(resolveHomepageRoute("/ai-video-models/"+slug)).toMatchObject({kind:"wan",path:"/ai-video-models/"+slug});for(const slug of ["kling-ai","kling-3-0","seedance-2-0","happy-horse-1-0"])expect(resolveHomepageRoute("/ai-video-models/"+slug)).toMatchObject({kind:"video-model",path:"/ai-video-models/"+slug});for(const slug of ["grok-imagine","mindvideo-ai","sora-2","veo-3","vheer"])expect(resolveHomepageRoute("/ai-video-models/"+slug)).toMatchObject({kind:"video-model",path:"/ai-video-models/"+slug});expect(resolveHomepageRoute("/ai-video-models/dreamface-ai")).toEqual({kind:"dreamface",path:"/ai-video-models/dreamface-ai"});expect(resolveHomepageRoute("/ai-image-models/unknown")).toBeNull();});


it("C2d入口只用实际型号，Sora保持空选且不创建虚构provider参数",()=>{
  const expected={"grok-imagine":"grok-imagine","mindvideo-ai":"wan-3-0","sora-2":undefined,"veo-3":"veo-3-1-fast","vheer":"lanta-2-1"};
  for(const [id,model] of Object.entries(expected)){
    const entry=platformEntry(id);expect(entry.status).toBe("ready");expect(entry.model).toBe(model);
    expect(entryHref(homepageEntry(id),"zh-CN")).not.toMatch(/model=(mindvideo-ai|sora-2|veo-3(?:&|$)|vheer)/);
  }
});

it("DreamFace独立ready且入口不伪选provider，未知邻路不放开",()=>{expect(platformEntry("dreamface-ai").status).toBe("ready");expect(platformEntry("dreamface-ai").model).toBeUndefined();expect(entryHref(homepageEntry("dreamface-ai"),"zh-CN")).toBe("/zh-CN/ai-video-models/dreamface-ai");expect(resolveHomepageRoute("/ai-video-models/dreamface-ai-other")).toBeNull();});
