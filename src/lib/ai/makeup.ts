import { presignGetUrl, R2_BUCKET_ORIGINALS } from "@/lib/storage";
import { prepareImageSubmission } from "./creative-center";

export type MakeupArgs = {
  requestId: string;
  uploadKey: string;
  styleName: string;
  styleDescription: string;
  intensity: number;
};

export function buildMakeupPrompt(args: Pick<MakeupArgs, "styleName" | "styleDescription" | "intensity">): string {
  return [
    "请编辑参考人像，仅调整妆容，输出一张真实自然的妆容试用效果图。",
    `妆容风格：${args.styleName}。${args.styleDescription}`,
    `妆容强度：${Math.max(20, Math.min(100, args.intensity))}%。`,
    "严格保留原人物身份、五官形状、脸型、肤色、皮肤纹理、表情、姿势、发型、衣着、取景构图、光线和背景。",
    "不要改变年龄、身体或面部结构。不要磨皮，不要添加饰品、水印、文字或其他人物。"
  ].join("\n");
}

export async function prepareMakeup(args: MakeupArgs) {
  return prepareImageSubmission({ requestId: args.requestId, prompt: buildMakeupPrompt(args) });
}

export async function makeupReferenceUrl(uploadKey: string) {
  return presignGetUrl({ bucket: R2_BUCKET_ORIGINALS, key: uploadKey, expiresIn: 60 * 60 });
}
