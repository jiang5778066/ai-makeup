import { NextResponse } from "next/server";
import { toLocale } from "@/lib/i18n";

export async function POST(request: Request) {
  const body = (await request.json()) as { locale?: string; occasion?: string };
  const locale = toLocale(body.locale);

  return NextResponse.json({
    faceShape: locale === "zh-CN" ? "柔和椭圆脸" : "soft oval",
    skinTone: locale === "zh-CN" ? "中性偏暖" : "neutral warm",
    recommendations:
      locale === "zh-CN"
        ? ["选择柔和腮红提升气色", "使用缎光底妆保留真实皮肤质感", "眼妆重点放在睫毛和眼尾上提"]
        : ["Use soft blush to lift the complexion", "Choose a satin base to preserve skin texture", "Focus eye detail on lashes and outer-corner lift"]
  });
}
