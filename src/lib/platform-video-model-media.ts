import type { CoreVideoModelPath } from "./platform-generator-data";
import { videoModelContent, type VideoSectionNode } from "./platform-video-model-content-data";

export type VideoModelMedia = Readonly<{ src: string; poster: string; caption: string; section: number }>;

// 每个媒体消费者来自对应页面的固定英文HTML；双语共用同一素材身份。
function mediaForPath(path: CoreVideoModelPath): readonly VideoModelMedia[] {
  const media: VideoModelMedia[] = [];
  for (const section of videoModelContent[path].en) {
    const visit = (node: VideoSectionNode) => {
      if (typeof node === "string") return;
      if (node.media) media.push({ ...node.media, section: section.index, caption: "Public reference example" });
      node.children.forEach(visit);
    };
    visit(section.tree);
  }
  return media;
}

export const videoModelMedia = {
  "/ai-video-models/kling-ai": mediaForPath("/ai-video-models/kling-ai"),
  "/ai-video-models/kling-3-0": mediaForPath("/ai-video-models/kling-3-0"),
  "/ai-video-models/seedance-2-0": mediaForPath("/ai-video-models/seedance-2-0"),
  "/ai-video-models/happy-horse-1-0": mediaForPath("/ai-video-models/happy-horse-1-0"),
} satisfies Record<CoreVideoModelPath, readonly VideoModelMedia[]>;
