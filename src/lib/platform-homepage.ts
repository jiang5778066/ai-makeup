import { platformEntry, platformEntries, type PlatformEntry, type PlatformMode } from "./platform-navigation";

import { isWanPath } from "./platform-wan-model-data";

import { isGeneratorPath } from "./platform-generator-data";
import { isVideoModelPath } from "./platform-video-model-data";

import { isDirectoryPath } from "./platform-directory-data";
import { isRootGeneratorPath } from "./platform-root-generator-data";
import { imageEditPath } from "./platform-image-edit-data";
import { localVideoEditorPath } from "./platform-local-video-editor-data";
import { videoReframePath } from "./platform-video-reframe-data";
import { isVideoGuidePath } from "./platform-video-guides";

export function homepageEntry(id: string, options: { mode?: PlatformMode; model?: string; hash?: string } = {}): PlatformEntry {
  const entry = platformEntry(id);
  const query = { ...entry.query, ...(options.mode ? { mode: options.mode } : {}), ...(options.model ? { model: options.model } : {}) };
  return { ...entry, ...options, query };
}

export type PlatformSearchParams = Record<string, string | string[] | undefined>;
export function platformSearchQuery(searchParams: PlatformSearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) query.append(key, item);
  }
  return query;
}

export function resolveHomepageRoute(path: string, searchParams: PlatformSearchParams = {}) {
  if (path === "/") return { kind: "landing" as const };
  if (path === "/home") return { kind: "workspace" as const };
  if (path === "/explore") return { kind: "community" as const };
  if (path === localVideoEditorPath) return { kind: "local-video-editor" as const };
  if (path === videoReframePath) return { kind: "video-reframe" as const, path };
  if (path === "/video-effects/earth-zoom-out" || path === "/video-effects/ai-angel-video-generator") return { kind: "video-effect-guide" as const, path };
  if (isVideoGuidePath(path)) return { kind: "video-guide" as const, path };
  if (isRootGeneratorPath(path)) return { kind: "root-generator" as const, path };
  if (isVideoModelPath(path)) return { kind: "video-model" as const, path };
  if (isWanPath(path)) return { kind: "wan" as const, path };
  if (path === "/ai-video-models/dreamface-ai") return { kind: "dreamface" as const, path };
  if (isGeneratorPath(path)) return { kind: "generator" as const, path };
  if (isDirectoryPath(path)) return { kind: "directory" as const, path };
  if (imageEditPath(path)) return { kind: "image-edit" as const, path };
  const query = platformSearchQuery(searchParams);
  const entry = platformEntries.find((item) => item.pathname === path && item.status === "scaffold" && (!item.templateId || query.get("template_id") === item.templateId));
  return entry ? { kind: "scaffold" as const, entry } : null;
}
