import { isStorageConfigured, presignGetUrl, R2_BUCKET_RESULTS } from "@/lib/storage";
import type { CreationResult } from "./platform-creations-types";
export const makeupResultLink = async (key: string): Promise<CreationResult | null> => {
  const isUrl = /^https?:/i.test(key);
  let extension = key.split(".").pop()?.toLowerCase();
  if (isUrl) {
    const url = new URL(key);
    const origins = (process.env.CREATIONS_LEGACY_RESULT_ORIGINS ?? "").split(",").map(x => x.trim()).filter(Boolean);
    if (url.protocol !== "https:" || url.username || url.password || !origins.includes(url.origin)) return null;
    extension = url.pathname.split(".").pop()?.toLowerCase();
  }
  const mimeType = ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" } as Record<string, string>)[extension ?? ""];
  if (!mimeType) return null;
  if (isUrl) return { url: key, mimeType, expiresAt: null };
  if (!isStorageConfigured()) return null;
  return { url: await presignGetUrl({ bucket: R2_BUCKET_RESULTS, key, expiresIn: 900 }), mimeType, expiresAt: new Date(Date.now() + 900000).toISOString() };
};
