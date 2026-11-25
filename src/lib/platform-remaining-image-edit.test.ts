import { describe, expect, it } from "vitest";
import { imageEditContent, imageEditPrompt, portraitImageEditSettings, resolveImageEditOption } from "./platform-image-edit-data";
import {
  baldFilterPath, beardFilterPath, buzzCutFilterPath, eyeColorPath, christmasPhotoPath,
} from "./platform-remaining-image-edit-data";

describe.each([
  [baldFilterPath, "finish", "clipper-shadow", "scalp", "头皮"],
  [beardFilterPath, "style", "boxed-beard", "beard", "胡须"],
  [buzzCutFilterPath, "length", "grade-3", "10 mm", "10 毫米"],
  [eyeColorPath, "color", "hazel", "irises", "虹膜"],
  [christmasPhotoPath, "scene", "winter-window", "evergreen", "常青枝叶"],
] as const)("%s", (path, parameter, id, en, zh) => {
  it("按本站受控参数显示实际双语编辑说明", () => {
    expect(portraitImageEditSettings[path].parameter).toBe(parameter);
    const choice = resolveImageEditOption(path, new URLSearchParams({ mode: "image-to-image", tab: "image", [parameter]: id }));
    expect(choice?.id).toBe(id);
    expect(choice).not.toBeNull();
    expect(imageEditPrompt(path, choice!, "en")).toContain(en);
    expect(imageEditPrompt(path, choice!, "zh-CN")).toContain(zh);
    expect(imageEditPrompt(path, choice!, "en")).toContain("2:3");
    expect(imageEditPrompt(path, choice!, "zh-CN")).toContain("2:3");
    expect(resolveImageEditOption(path, new URLSearchParams())?.id).toBe(imageEditContent[path].options[0].id);
  });

  it.each([
    "mode=text-to-image", "tab=text", "model=other", "mode=image-to-image&mode=image-to-image",
  ])("拒绝与单图编辑契约不符的查询 %s", (query) => {
    expect(resolveImageEditOption(path, new URLSearchParams(query))).toBeNull();
  });

  it("拒绝未知和重复的受控选项", () => {
    expect(resolveImageEditOption(path, new URLSearchParams({ [parameter]: "unknown" }))).toBeNull();
    expect(resolveImageEditOption(path, new URLSearchParams([[parameter, id], [parameter, id]]))).toBeNull();
  });
});
