import { describe, expect, it } from "vitest";
import { imageEditContent, imageEditPrompt, resolveImageEditOption, type ImageEditPath } from "./platform-image-edit-data";

const age = "/image-effects/ai-age-progression";
const color = "/image-effects/ai-hair-color-changer";
const style = "/image-effects/ai-hair-style-changer";

function resolve(path: ImageEditPath, query: string) {
  return resolveImageEditOption(path, new URLSearchParams(query));
}

describe("人像图片编辑参数", () => {
  it.each(["infant", "child", "young-adult", "adult", "middle-aged", "older-adult", "elderly", "centenarian"])(
    "按原候选索引还原年龄组 %s", (id) => {
      const index = imageEditContent[age].options.findIndex(option => option.id === id);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(resolve(age, `age=${index}&tag=a&tag=b`)?.id).toBe(id);
    },
  );

  it("保持原候选索引的年龄含义和默认值", () => {
    expect(["0", "1", "2", "3", "4", "5", "6", "7"].map(index => resolve(age, `age=${index}`)?.id))
      .toEqual(["infant", "child", "young-adult", "adult", "middle-aged", "older-adult", "elderly", "centenarian"]);
    expect(resolve(age, "")?.id).toBe("infant");
    for (const query of ["age=8", "age=-1", "age=01", "age=", "age=1&age=1", "mode=text-to-image", "model=older-model"]) {
      expect(resolve(age, query), query).toBeNull();
    }
  });

  it("只接受受控颜色或发型参数", () => {
    expect(resolve(color, "color=copper")?.id).toBe("copper");
    expect(resolve(style, "style=short-bob")?.id).toBe("short-bob");
    expect(resolve(color, "color=pink")?.id).toBe("pink");
    for (const query of ["color=__proto__", "color=pink&color=copper", "mode=text-to-image", "model=1000", "tab=video"]) {
      expect(resolve(color, query), query).toBeNull();
    }
    expect(resolve(style, "style=short-bob&style=box-braids")).toBeNull();
  });

  it.each([
    [age, "age=5", "age-related appearance", "年龄特征"],
    [color, "color=copper", "only the hair color", "仅调整发色"],
    [style, "style=short-bob", "only the hairstyle", "仅调整发型"],
  ] as const)("为 %s 生成限定目标的双语说明", (path, query, en, zh) => {
    const option = resolve(path, query)!;
    expect(imageEditPrompt(path, option, "en")).toContain(en);
    expect(imageEditPrompt(path, option, "en")).toMatch(/facial identity.*background.*lighting/i);
    expect(imageEditPrompt(path, option, "zh-CN")).toContain(zh);
    expect(imageEditPrompt(path, option, "zh-CN")).toMatch(/五官.*背景.*光线/);
  });
});
