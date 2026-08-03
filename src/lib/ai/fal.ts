import { fal } from "@fal-ai/client";
import { presignGetUrl, R2_BUCKET_ORIGINALS } from "@/lib/storage";

export type GenerateArgs = {
  uploadKey: string;
  styleId: string;
  intensity: number;
  styleName: string;
  styleDescription: string;
};

export type GenerateResult = {
  resultImageUrl: string;
  beforeImageUrl: string;
};

export function isFalConfigured() {
  return Boolean(process.env.FAL_KEY);
}

function buildPrompt(args: GenerateArgs): string {
  const intensity = Math.max(20, Math.min(100, args.intensity));
  return [
    `Professional ${args.styleName.toLowerCase()} makeup look applied to the person in the photo.`,
    args.styleDescription,
    `Intensity ${intensity}%. Preserve identity, face shape, and skin texture.`,
    "Editorial beauty photography, clean studio lighting, no plastic skin."
  ].join(" ");
}

async function generateWithFal(args: GenerateArgs): Promise<GenerateResult> {
  fal.config({ credentials: process.env.FAL_KEY });

  const beforeImageUrl = await presignGetUrl({
    bucket: R2_BUCKET_ORIGINALS,
    key: args.uploadKey,
    expiresIn: 60 * 10
  });

  // PhotoMaker preserves identity from a reference image; swap to another fal model if preferred.
  const result = (await fal.subscribe("fal-ai/photomaker", {
    input: {
      image_archive_url: beforeImageUrl,
      prompt: buildPrompt(args),
      num_inference_steps: 30,
      style_strength: Math.round((args.intensity / 100) * 50) + 10,
      num_images: 1
    }
  })) as { images?: Array<{ url: string }> };

  const url = result.images?.[0]?.url;
  if (!url) throw new Error("fal_no_image_returned");

  return { resultImageUrl: url, beforeImageUrl };
}

export async function generateMakeup(args: GenerateArgs): Promise<GenerateResult> {
  if (!isFalConfigured()) {
    throw new Error("ai_unconfigured");
  }
  return generateWithFal(args);
}
