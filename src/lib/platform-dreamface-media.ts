export type DreamfaceMedia = {source:string;src:string|null;poster:string|null;label:string};
// 来源：C32固定原片窗口及准确已存mountain poster；不使用未证历史作品。
export const dreamfaceMedia: DreamfaceMedia[] = [
  {
    "source": "https://cdn.lantaai.com/resources/ai-video-models/dreamface-ai/_source/44f0b474-7af6-41a7-89d7-30730368098d/talking-photos-dreamface.mp4",
    "src": "/platform/dreamface/talking-photos-dreamface.mp4",
    "poster": "/platform/dreamface/talking-photos-dreamface-poster.jpg",
    "label": "Talking photo animation preview"
  },
  {
    "source": "https://cdn.lantaai.com/resources/ai-video-models/dreamface-ai/_source/aaee5858-404f-4e7c-b363-c3b2161cec7d/pet-dreamface.mp4",
    "src": "/platform/dreamface/pet-dreamface.mp4",
    "poster": "/platform/dreamface/pet-dreamface-poster.jpg",
    "label": "Pet animation preview"
  },
  {
    "source": "https://cdn.lantaai.com/resources/ai-video-models/dreamface-ai/_source/1ba71141-5857-45b6-84d6-ec23d6f33bbc/dance-dreamface.mp4",
    "src": "/platform/dreamface/dance-dreamface.mp4",
    "poster": "/platform/dreamface/dance-dreamface-poster.jpg",
    "label": "Character dance animation preview"
  },
  {
    "source": "https://cdn.lantaai.com/resources/_source/95db92fe-66d9-4fa2-8a4b-0943be594b3d/mountain-clouds-timelapse-video.mp4",
    "src": "/platform/dreamface/mountain-clouds-timelapse-video.mp4",
    "poster": "/platform/video-models/grok-imagine/be3a3d647b8554d3.jpg",
    "label": "Scene illustration: clouds moving through a mountain landscape"
  }
];
export function completeDreamfaceMedia(media:DreamfaceMedia){return !!media.src && !!media.poster;}
export const dreamfaceIcons: {lanta:string|null;vip:string|null} = {lanta:'/platform/dreamface/lanta-icon-192.png',vip:'/platform/dreamface/vip-icon.webp'};
export const dreamfaceRelatedIcons = ['/platform/homepage/86b2613792d2f183.svg','/platform/homepage/bc467983eb9bb707.svg','/platform/homepage/e3bf3dcf1e157e91.svg'] as const;
