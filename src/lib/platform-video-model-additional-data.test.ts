import sourceContract from "../../docs/orca-delivery/trials/20261103-lanta-platform-replica/evidence/developer-c-12-source-contract-v2.json";
import { describe, it, expect } from "vitest";
import { isVideoModelPath, initializeVideoModel, changeVideoModelMode, changeVideoModelSelection, normalizeVideoModelState, selectableVideoModels, videoModelDurationGated, restoreVideoModel, describeVideoModelIssues } from "./platform-video-model-data";

const vheer = "/ai-video-models/vheer";
const mind = "/ai-video-models/mindvideo-ai";
const sora = "/ai-video-models/sora-2";
describe("C2d核准的五页局部状态合同", () => {
  it("仅把五条准确专页接为生成不可用的真实路径", () => {
    for (const id of ["grok-imagine", "mindvideo-ai", "sora-2", "veo-3", "vheer"]) expect(isVideoModelPath(`/ai-video-models/${id}`)).toBe(true);
    expect(isVideoModelPath("/ai-video-models/sora-3")).toBe(false);
  });
  it("Sora空选有独立1000字配置而非虚假provider，未知URL仍拒绝", async () => {
    const { videoModelConfig } = await import("./platform-video-model-data");
    const state = initializeVideoModel(sora, "");
    expect(state.model).toBe(""); expect(state.issues).not.toContain("unknown-model");
    expect(videoModelConfig(state)).toMatchObject({promptLimit:1000,durations:[10,15]});
    expect(state.parameters.duration).toBe(10);
    expect(initializeVideoModel(sora,"model=700&duration=15").issues).toEqual(expect.arrayContaining(["unknown-model","gated-parameter:duration"]));
    const text=changeVideoModelMode({...state,prompt:"keep"},"text");
    expect(text.model).toBe(""); expect(text.prompt).toBe("keep");
    expect(videoModelConfig(text)?.reference).toBeUndefined();
    expect(videoModelConfig(text)?.ratios).toEqual(["9:16","16:9"]);
    const selected=changeVideoModelSelection(text,"veo-3-1-fast");
    expect(selected.model).toBe("veo-3-1-fast");
    const restored=changeVideoModelSelection(selected,restoreVideoModel(sora,"text"));
    expect(restored.model).toBe(""); expect(restored.prompt).toBe("keep");
  });
  it("Vheer只在不支持目标模式时回退900，双模式合法编辑不重置", () => {
    const image=initializeVideoModel(vheer, "duration=bad");
    expect(image.model).toBe("lanta-2-1"); expect(image.parameters).toMatchObject({duration:3,resolution:"540P"});
    const text=changeVideoModelMode({...image,prompt:"original"},"text");
    expect(text.model).toBe("veo-3-1-fast"); expect(text.issues).toEqual(expect.arrayContaining(["model-fallback","invalid-parameter:duration"]));
    expect(changeVideoModelMode(text,"text")).toBe(text);
    const chosen=changeVideoModelSelection({...text,parameters:{...text.parameters,ratio:"9:16"}},"wan-3-0");
    expect(changeVideoModelMode(chosen,"image")).toMatchObject({model:"wan-3-0",parameters:{ratio:"9:16"},prompt:"original"});
    expect(restoreVideoModel(vheer,"image")).toBe("lanta-2-1"); expect(restoreVideoModel(vheer,"text")).toBe("veo-3-1-fast");
  });
  it("Mind首次图文均805并采用核定本地参数，只初始化时回默认", () => {
    for (const query of ["", "tab=text"]) expect(initializeVideoModel(mind,query)).toMatchObject({model:"wan-3-0",parameters:{duration:5,ratio:"1:1",resolution:"480P",sound:true}});
    const edited=initializeVideoModel(mind,"tab=text&duration=12&ratio=9%3A16&resolution=1080P&sound=false");
    const next=changeVideoModelMode({...edited,prompt:"retain"},"image");
    expect(next.parameters).toMatchObject({duration:12,ratio:"9:16",resolution:"1080P",sound:false});
    expect(next.prompt).toBe("retain");
  });
  it("五页同24图/19文真实白名单，不接受伪型号或图片模型", () => {
    for(const path of [vheer,mind,sora,"/ai-video-models/grok-imagine","/ai-video-models/veo-3"] as const){
      expect(selectableVideoModels(path,"image")).toEqual(sourceContract.modelMap["图生"].map(row=>row.local.id));expect(selectableVideoModels(path,"text")).toEqual(sourceContract.modelMap["文生"].map(row=>row.local.id));
      expect(selectableVideoModels(path,"image")).toHaveLength(24);expect(selectableVideoModels(path,"text")).toHaveLength(19);
      expect(selectableVideoModels(path,"text")).not.toContain("lanta-2-1");
      expect(selectableVideoModels(path,"image")).not.toContain("sora-2");
      expect(selectableVideoModels(path,"image")).not.toContain("gpt-image-2");
    }
  });
  it("门槛按本批实际状态限定，900默认8不被清除，Mind质量不作时长门槛", () => {
    const veo=initializeVideoModel("/ai-video-models/veo-3","");
    expect(veo.parameters.duration).toBe(8);expect(normalizeVideoModelState(veo).parameters.duration).toBe(8);
    expect(videoModelDurationGated(veo,8)).toBe(true);
    expect(videoModelDurationGated(initializeVideoModel(vheer,""),8)).toBe(true);
    expect(videoModelDurationGated(initializeVideoModel(sora,"tab=text"),15)).toBe(true);
    expect(videoModelDurationGated(initializeVideoModel(mind,""),8)).toBe(false);
    expect(videoModelDurationGated(changeVideoModelSelection(veo,"wan-3-0"),8)).toBe(false);
    expect(videoModelDurationGated({path:"/ai-video-models/seedance-2-0",model:"veo-3-1-fast",mode:"image"},8)).toBe(false);
  });
  it("声音历史说明不重放URL、不复活已清原因，无关非法时长保持", () => {
    const raw="sound=true&duration=bad";const initial=initializeVideoModel(vheer,raw);
    const chosen=changeVideoModelSelection(initial,"seedance-2-0");
    expect(chosen.parameters.sound).toBe(false);
    expect(describeVideoModelIssues(chosen,raw)).toEqual(expect.arrayContaining([{code:"unsupported-parameter:sound",field:"sound",availability:"available"}]));
    const cleared={...chosen,parameters:{...chosen.parameters,sound:true},issues:chosen.issues.filter(x=>!x.endsWith(":sound"))};
    const returned=changeVideoModelSelection(changeVideoModelSelection(cleared,"lanta-2-1"),"seedance-2-0");
    expect(returned.parameters.sound).toBe(false);expect(returned.issues).toContain("invalid-parameter:duration");expect(returned.issues).not.toContain("unsupported-parameter:sound");
  });
});
