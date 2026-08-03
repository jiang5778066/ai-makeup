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

type FalImageEditResult = {
  data: { images?: Array<{ url?: string }> };
  requestId: string;
};

type FalImageEditSubscribe = (
  endpointId: "openai/gpt-image-2/edit",
  options: {
    input: {
      image_urls: string[];
      prompt: string;
      quality: "medium";
      image_size: "auto";
      output_format: "png";
      num_images: 1;
    };
  }
) => Promise<FalImageEditResult>;

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

  // The endpoint is live on fal, but the generated endpoint union in @fal-ai/client 1.10.1
  // has not caught up yet. Keep the narrow local contract aligned with fal's public schema.
  const subscribe = fal.subscribe as unknown as FalImageEditSubscribe;
  const result = await subscribe("openai/gpt-image-2/edit", {
    input: {
      image_urls: [beforeImageUrl],
      prompt: buildPrompt(args),
      quality: "medium",
      image_size: "auto",
      output_format: "png",
      num_images: 1
    }
  });

  const url = result.data.images?.[0]?.url;
  if (!url) throw new Error("fal_no_image_returned");

  return { resultImageUrl: url, beforeImageUrl };
}

export async function generateMakeup(args: GenerateArgs): Promise<GenerateResult> {
  if (!isFalConfigured()) {
    throw new Error("ai_unconfigured");
  }
  return generateWithFal(args);
}
