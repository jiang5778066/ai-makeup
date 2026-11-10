import { describe, expect, it } from "vitest";
import faqSemanticContract from "../../docs/orca-delivery/trials/20261103-lanta-platform-replica/evidence/developer-c-08-faq-semantic-contract.json";
import {
  initializeVideoModel,
  normalizeVideoModelState,
  videoModelSelectionKey,
  videoModelPages,
  coreVideoModelPaths,
  selectableVideoModels,
  videoModelDurationGated,
  changeVideoModelMode,
  changeVideoModelSelection,
} from "./platform-video-model-data";

describe("C2c视频模型专页合同", () => {
  it("分离四个路径身份与实际selector模型默认值", () => {
    expect(videoModelPages["/ai-video-models/kling-ai"].defaultModel).toBe("kling-2-6");
    expect(videoModelPages["/ai-video-models/kling-3-0"].defaultModel).toBe("kling-3-0");
    expect(videoModelPages["/ai-video-models/seedance-2-0"].defaultModel).toBe("seedance-2-0");
    expect(videoModelPages["/ai-video-models/happy-horse-1-0"].defaultModel).toBe("happy-horse-1-0");
    expect(videoModelPages["/ai-video-models/kling-3-0"].title.en).toContain("Kling 3.0");
  });

  it("Kling 3.0图生保留1130，文生按观察回退1120并提示冲突", () => {
    const image = initializeVideoModel("/ai-video-models/kling-3-0", "mode=image-to-video&model=1130");
    expect(image.model).toBe("kling-3-0");
    const text = initializeVideoModel("/ai-video-models/kling-3-0", "mode=text-to-video&model=1130");
    expect(text.model).toBe("kling-2-6");
    expect(text.path).toBe("/ai-video-models/kling-3-0");
    expect(text.issues).toContain("path-model-conflict");
    expect(text.issues).toContain("unsupported-model-mode");
  });

  it("按URL首值严格初始化并报告非法及冲突字段", () => {
    const state = initializeVideoModel("/ai-video-models/seedance-2-0", "duration=8&duration=15&resolution=720P&ratio=9%3A16&sound=false&mode=image-to-video&tab=text");
    expect(state.parameters.duration).toBe(8);
    expect(state.parameters.resolution).toBe("720P");
    expect(state.parameters.ratio).toBeUndefined();
    expect(state.parameters.sound).toBe(false);
    expect(state.issues).toContain("mode-tab-conflict");
    expect(state.issues).toContain("unsupported-parameter:ratio");
    const malformed = initializeVideoModel("/ai-video-models/seedance-2-0", "duration=8x");
    expect(malformed.issues).toContain("invalid-parameter:duration");
  });

  it("只对当前专页的Kling选中模型和模式应用门槛", () => {
    const kling = initializeVideoModel("/ai-video-models/kling-ai", "mode=text-to-video&duration=10");
    expect(kling.parameters.duration).toBe(5);
    expect(kling.issues).toContain("gated-parameter:duration");
    expect(normalizeVideoModelState({ ...kling, parameters: { ...kling.parameters, duration: 10 } }).parameters.duration).toBe(5);
    const seedance = initializeVideoModel("/ai-video-models/seedance-2-0", "mode=text-to-video&duration=15");
    expect(seedance.parameters.duration).toBe(15);
    expect(seedance.issues).not.toContain("gated-parameter:duration");
    const kling3text = initializeVideoModel("/ai-video-models/kling-3-0", "mode=text-to-video&duration=10");
    expect(kling3text.model).toBe("kling-2-6");
    expect(kling3text.parameters.duration).toBe(5);
  });

  it("selection key含已支持参数首值而忽略语言和无关query", () => {
    expect(videoModelSelectionKey("/ai-video-models/seedance-2-0", "duration=8&mode=text-to-video&utm=x#faq"))
      .toBe(videoModelSelectionKey("/ai-video-models/seedance-2-0", "utm=y&mode=text-to-video&duration=8&lang=zh"));
    expect(videoModelSelectionKey("/ai-video-models/seedance-2-0", "duration=8"))
      .not.toBe(videoModelSelectionKey("/ai-video-models/seedance-2-0", "duration=12"));
    expect(videoModelSelectionKey("/ai-video-models/kling-ai", ""))
      .not.toBe(videoModelSelectionKey("/ai-video-models/kling-3-0", ""));
  });

  it("页面正文与38组双语FAQ完整且保留各自开合合同", () => {
    expect(coreVideoModelPaths.map(path => videoModelPages[path]).flatMap((page) => page.faq)).toHaveLength(38);
    expect(videoModelPages["/ai-video-models/kling-ai"].bodySections).toHaveLength(10);
    expect(videoModelPages["/ai-video-models/kling-3-0"].bodySections).toHaveLength(5);
    expect(videoModelPages["/ai-video-models/seedance-2-0"].bodySections).toHaveLength(5);
    expect(videoModelPages["/ai-video-models/happy-horse-1-0"].bodySections).toHaveLength(4);
    for (const page of coreVideoModelPaths.map(path => videoModelPages[path])) {
      expect(page.hero.en.length).toBeGreaterThan(20);
      expect(page.hero["zh-CN"].length).toBeGreaterThan(15);
      expect(page.bodySections.every((section) => section.blocks.length > 0)).toBe(true);
      expect(page.faq.length).toBeGreaterThanOrEqual(8);
      for (const item of page.faq) {
        expect(item.question.en.length).toBeGreaterThan(12);
        expect(item.question["zh-CN"].length).toBeGreaterThan(8);
        expect(item.answer.en).toContain("reference page stated at capture time");
        expect(item.answer["zh-CN"]).toContain("参照页面在采集时称");
      }
    }
    expect(videoModelPages["/ai-video-models/kling-ai"].faqBehavior).toBe("multiple");
    for (const path of ["/ai-video-models/kling-3-0", "/ai-video-models/seedance-2-0", "/ai-video-models/happy-horse-1-0"] as const) {
      expect(videoModelPages[path].faqBehavior).toBe("single");
    }
  });

  it("38题逐题匹配固定英语和简体中文问题、答案命题及外部归因", () => {
    const paths = {
      "kling-ai": "/ai-video-models/kling-ai",
      "kling-3-0": "/ai-video-models/kling-3-0",
      "seedance-2-0": "/ai-video-models/seedance-2-0",
      "happy-horse-1-0": "/ai-video-models/happy-horse-1-0",
    } as const;

    for (const row of faqSemanticContract.rows) {
      const item = videoModelPages[paths[row.page as keyof typeof paths]].faq[row.index - 1];
      expect(item.question.en).toBe(row.questionEn);
      expect(item.question["zh-CN"]).toBe(row.questionZh);
      const proposedEn = row.page === "seedance-2-0" && row.index === 2
        ? `${row.proposedEn.replace(" This project has not independently verified the service claims; generation is not connected here.", "")} Pro is an external FAQ label; this page's selector lists Seedance 2.0 and Seedance 2.0 Fast, not a Pro option. This project has not independently verified the service claims; generation is not connected here.`
        : row.proposedEn;
      const proposedZh = row.page === "seedance-2-0" && row.index === 2
        ? `${row.proposedZh.replace("上述服务主张未经本项目独立验证，本项目未接入生成服务。", "")}Pro 是外部 FAQ 中的称呼；本页选择器列出 Seedance 2.0 和 Seedance 2.0 Fast，没有 Pro 选项。本项目未独立验证上述服务主张，且未接入生成服务。`
        : row.proposedZh;
      expect(item.answer.en).toBe(proposedEn);
      expect(item.answer["zh-CN"]).toBe(proposedZh);
    }
  });

  it("每页仅呈现有观察依据的selector模型，路径标题身份不随选型改变", () => {
    expect(selectableVideoModels("/ai-video-models/kling-ai", "image")).toContain("seedance-2-0");
    expect(selectableVideoModels("/ai-video-models/kling-ai", "text")).not.toContain("seedance-2-0");
    expect(selectableVideoModels("/ai-video-models/kling-3-0", "image")).toEqual(["kling-3-0", "kling-2-6", "lanta-2-1", "wan-3-0", "wan-2-2-spicy", "kling-4-0"]);
    expect(selectableVideoModels("/ai-video-models/kling-3-0", "text")).toEqual(["kling-2-6"]);
    expect(selectableVideoModels("/ai-video-models/seedance-2-0", "image")).toEqual(["seedance-2-0", "seedance-2-0-fast", "lanta-2-1", "wan-3-0", "wan-2-2-spicy", "kling-4-0", "grok-imagine-video-1-5", "minimax-h3"]);
    expect(selectableVideoModels("/ai-video-models/happy-horse-1-0", "text")).toEqual(["happy-horse-1-0", "happy-horse-1-1"]);
    const state = initializeVideoModel("/ai-video-models/kling-3-0", "model=1130");
    expect(normalizeVideoModelState({ ...state, mode: "text" }).model).toBe("kling-2-6");
    expect(videoModelPages["/ai-video-models/kling-3-0"].title.en).toContain("Kling 3.0");
  });

  it("兼容模式切换清除已过期的模型模式错误", () => {
    const state = initializeVideoModel("/ai-video-models/kling-3-0", "mode=text-to-video&model=1130");
    const recovered = changeVideoModelMode({ ...state, issues: [...state.issues, "unsupported-model-mode"] }, "image");
    expect(recovered.model).toBe("kling-2-6");
    expect(recovered.issues).not.toContain("unsupported-model-mode");
  });

  it("Kling门槛仅限获批专页与当前模型模式，HD与相邻模型不受影响", () => {
    expect(videoModelDurationGated({ path: "/ai-video-models/kling-ai", model: "kling-2-6", mode: "image" }, 5)).toBe(true);
    expect(videoModelDurationGated({ path: "/ai-video-models/kling-3-0", model: "kling-3-0", mode: "image" }, 15)).toBe(true);
    expect(videoModelDurationGated({ path: "/ai-video-models/kling-3-0", model: "kling-2-6", mode: "text" }, 10)).toBe(true);
    expect(videoModelDurationGated({ path: "/ai-video-models/seedance-2-0", model: "seedance-2-0", mode: "image" }, 8)).toBe(false);
    expect(videoModelDurationGated({ path: "/ai-video-models/happy-horse-1-0", model: "happy-horse-1-0", mode: "image" }, 10)).toBe(false);
  });
});


describe("C10转换提示的局部失效", () => {
  it("以集合过滤后的最终目标产生fallback，已选mode保持原对象", () => {
    const state=initializeVideoModel("/ai-video-models/seedance-2-0", "model=grok-imagine-video-1-5&duration=bad-c10-data");
    const next=changeVideoModelMode(state, "text");
    expect(next.model).toBe("seedance-2-0");
    expect(next.issues).toContain("model-fallback");
    expect(next.issues).toContain("invalid-parameter:duration");
    expect(changeVideoModelMode(next,"text")).toBe(next);
    const restored=changeVideoModelSelection(next,"seedance-2-0");
    expect(restored.issues).not.toContain("model-fallback");
    expect(restored.issues).toContain("invalid-parameter:duration");
  });
  it("合法mode只清旧模式身份冲突，非法model拒绝不更改参数或文字", () => {
    const state=initializeVideoModel("/ai-video-models/kling-3-0", "mode=text-to-video&model=1130&sound=invalid-c10");
    const changed=changeVideoModelMode({...state,prompt:"仍保留"},"image");
    expect(changed.issues).not.toContain("path-model-conflict");
    expect(changed.issues).not.toContain("unsupported-model-mode");
    expect(changed.issues).toContain("invalid-parameter:sound");
    const rejected=changeVideoModelSelection(changed,"not-a-c10-model");
    expect(rejected.model).toBe(changed.model);expect(rejected.parameters).toEqual(changed.parameters);
    expect(rejected.prompt).toBe("仍保留");expect(rejected.issues).toContain("unsupported-model-mode");
  });
});
