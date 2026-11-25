import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { getCommunityExamples } from "./platform-community-data";

const directory = resolve("public/images/makeup-demo");
const sources = JSON.parse(readFileSync(resolve(directory, "来源记录.json"), "utf8")) as {
  file: string;
  sha256: string;
  source: string;
  usage_note: string;
  model: string;
  quality: string;
}[];

it("13 项源文件的哈希、创作来源和使用范围与记录一致", () => {
  expect(sources).toHaveLength(13);
  for (const source of sources) {
    expect(createHash("sha256").update(readFileSync(resolve(directory, source.file))).digest("hex")).toBe(source.sha256);
    expect(source.source).toBe("用户授权，通过RouterTeam创作中心生成的原创AI虚拟人物示意");
    expect(source.usage_note).toBe("妆容示意，非真实产品效果");
  }
});

it("双语作品共用 12 条单幅来源，详情仅携带有证据的生成字段", () => {
  const en = getCommunityExamples("en");
  const zh = getCommunityExamples("zh-CN");
  expect(en).toHaveLength(12);
  expect(zh.map(item => item.image)).toEqual(en.map(item => item.image));
  expect(new Set(en.map(item => item.image)).size).toBe(en.length);
  expect(en.map(item => item.image.split("/").at(-1)).sort()).toEqual(
    sources.map(source => source.file).filter(file => file !== "hero-pair.webp").sort()
  );
  for (const item of [...en, ...zh]) {
    const source = sources.find(entry => item.image === `/images/makeup-demo/${entry.file}`);
    expect(source).toBeDefined();
    expect(item).toEqual({ id: expect.any(String), image: expect.any(String), category: expect.any(String),
      name: expect.any(String), description: expect.any(String), model: source?.model, quality: source?.quality });
  }
});
