export type RootGeneratorAsset = { source: string; kind: string; local: string | null; width: number | null; height: number | null };

// 仅完整传输并解码的原件有本地路径；缺项不热链或静默替换其它素材。
export const rootGeneratorAssets: readonly RootGeneratorAsset[] = [
  {
    "source": "https://cdn.lantaai.com/showcase/3ffa40bf-53d1-439c-9790-0713785e367b.mp4",
    "kind": "video",
    "local": "/platform/root-generators/00-3ffa40bf-53d1-439c-9790-0713785e367b.mp4",
    "width": 1344,
    "height": 768
  },
  {
    "source": "https://cdn.lantaai.com/showcase/3ffa40bf-53d1-439c-9790-0713785e367b.jpg",
    "kind": "image",
    "local": "/platform/root-generators/01-3ffa40bf-53d1-439c-9790-0713785e367b.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/50683b9f-4f1c-464e-90ab-25c410408f1a.mp4",
    "kind": "video",
    "local": "/platform/root-generators/02-50683b9f-4f1c-464e-90ab-25c410408f1a.mp4",
    "width": 960,
    "height": 544
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/50683b9f-4f1c-464e-90ab-25c410408f1a.jpg",
    "kind": "image",
    "local": "/platform/root-generators/03-50683b9f-4f1c-464e-90ab-25c410408f1a.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/38776942-fe5f-4aa7-8da8-9483bfae542b.mp4",
    "kind": "video",
    "local": "/platform/root-generators/04-38776942-fe5f-4aa7-8da8-9483bfae542b.mp4",
    "width": 848,
    "height": 480
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/38776942-fe5f-4aa7-8da8-9483bfae542b.jpg",
    "kind": "image",
    "local": "/platform/root-generators/05-38776942-fe5f-4aa7-8da8-9483bfae542b.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/626d2099-37b4-4845-aacd-5c14928af6ee.mp4",
    "kind": "video",
    "local": "/platform/root-generators/06-626d2099-37b4-4845-aacd-5c14928af6ee.mp4",
    "width": 832,
    "height": 624
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/626d2099-37b4-4845-aacd-5c14928af6ee.jpg",
    "kind": "image",
    "local": "/platform/root-generators/07-626d2099-37b4-4845-aacd-5c14928af6ee.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/afad525d-d316-41dc-8a67-00d06a1e7f2d.mp4",
    "kind": "video",
    "local": "/platform/root-generators/08-afad525d-d316-41dc-8a67-00d06a1e7f2d.mp4",
    "width": 832,
    "height": 624
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/afad525d-d316-41dc-8a67-00d06a1e7f2d.jpg",
    "kind": "image",
    "local": "/platform/root-generators/09-afad525d-d316-41dc-8a67-00d06a1e7f2d.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/8442b1cd-986a-45ab-9961-bdd2d9085bc7.mp4",
    "kind": "video",
    "local": "/platform/root-generators/10-8442b1cd-986a-45ab-9961-bdd2d9085bc7.mp4",
    "width": 832,
    "height": 624
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/8442b1cd-986a-45ab-9961-bdd2d9085bc7.jpg",
    "kind": "image",
    "local": "/platform/root-generators/11-8442b1cd-986a-45ab-9961-bdd2d9085bc7.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/0e3c9369-a6e2-47e4-99c2-069af847edbc.mp4",
    "kind": "video",
    "local": "/platform/root-generators/12-0e3c9369-a6e2-47e4-99c2-069af847edbc.mp4",
    "width": 832,
    "height": 624
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/0e3c9369-a6e2-47e4-99c2-069af847edbc.jpg",
    "kind": "image",
    "local": "/platform/root-generators/13-0e3c9369-a6e2-47e4-99c2-069af847edbc.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/404c22bc-5f29-4f2d-ae18-804cdbcd6ca7.mp4",
    "kind": "video",
    "local": "/platform/root-generators/14-404c22bc-5f29-4f2d-ae18-804cdbcd6ca7.mp4",
    "width": 450,
    "height": 338
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/404c22bc-5f29-4f2d-ae18-804cdbcd6ca7.jpg",
    "kind": "image",
    "local": "/platform/root-generators/15-404c22bc-5f29-4f2d-ae18-804cdbcd6ca7.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/e1a791a1-cf7f-4b65-8279-3422f58b34cc.mp4",
    "kind": "video",
    "local": "/platform/root-generators/16-e1a791a1-cf7f-4b65-8279-3422f58b34cc.mp4",
    "width": 832,
    "height": 624
  },
  {
    "source": "https://cdn.lantaai.com/resources/lora/e1a791a1-cf7f-4b65-8279-3422f58b34cc.jpg",
    "kind": "image",
    "local": "/platform/root-generators/17-e1a791a1-cf7f-4b65-8279-3422f58b34cc.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/61701d0e-4c8a-4793-9e56-82e3bd3c6c7c.png",
    "kind": "image",
    "local": "/platform/root-generators/18-61701d0e-4c8a-4793-9e56-82e3bd3c6c7c.png",
    "width": 600,
    "height": 448
  },
  {
    "source": "https://cdn.lantaai.com/resources/a87cf9e8-0fd5-43c1-a726-b14f909f4ee0.png",
    "kind": "image",
    "local": "/platform/root-generators/19-a87cf9e8-0fd5-43c1-a726-b14f909f4ee0.png",
    "width": 680,
    "height": 510
  },
  {
    "source": "https://cdn.lantaai.com/showcase/c35d51c4-2dbd-4740-8801-d4e1695cf39f.mp4",
    "kind": "video",
    "local": "/platform/root-generators/20-c35d51c4-2dbd-4740-8801-d4e1695cf39f.mp4",
    "width": 1280,
    "height": 720
  },
  {
    "source": "https://cdn.lantaai.com/showcase/c35d51c4-2dbd-4740-8801-d4e1695cf39f.jpg",
    "kind": "image",
    "local": "/platform/root-generators/21-c35d51c4-2dbd-4740-8801-d4e1695cf39f.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/resources/a99412bc-6443-4f20-9b75-7650b811a7bd.jpg",
    "kind": "image",
    "local": "/platform/root-generators/22-a99412bc-6443-4f20-9b75-7650b811a7bd.jpg",
    "width": 592,
    "height": 444
  },
  {
    "source": "https://cdn.lantaai.com/resources/32d0e18a-0dd6-4cd0-bcf6-faaf3c531ff3.jpg",
    "kind": "image",
    "local": "/platform/root-generators/23-32d0e18a-0dd6-4cd0-bcf6-faaf3c531ff3.jpg",
    "width": 904,
    "height": 678
  },
  {
    "source": "https://cdn.lantaai.com/showcase/c7daea9e-271b-4c27-823d-25fa3a45e6e8.jpg",
    "kind": "image",
    "local": "/platform/root-generators/24-c7daea9e-271b-4c27-823d-25fa3a45e6e8.jpg",
    "width": 1344,
    "height": 768
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00001.mp4",
    "kind": "video",
    "local": "/platform/root-generators/25-HunyuanVideo_00001.mp4",
    "width": 1280,
    "height": 720
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00001.jpg",
    "kind": "image",
    "local": "/platform/root-generators/26-HunyuanVideo_00001.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00002.mp4",
    "kind": "video",
    "local": "/platform/root-generators/27-HunyuanVideo_00002.mp4",
    "width": 960,
    "height": 544
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00002.jpg",
    "kind": "image",
    "local": "/platform/root-generators/28-HunyuanVideo_00002.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00003.mp4",
    "kind": "video",
    "local": "/platform/root-generators/29-HunyuanVideo_00003.mp4",
    "width": 960,
    "height": 544
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00003.jpg",
    "kind": "image",
    "local": "/platform/root-generators/30-HunyuanVideo_00003.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00004.mp4",
    "kind": "video",
    "local": "/platform/root-generators/31-HunyuanVideo_00004.mp4",
    "width": 960,
    "height": 544
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00004.jpg",
    "kind": "image",
    "local": "/platform/root-generators/32-HunyuanVideo_00004.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00005.mp4",
    "kind": "video",
    "local": "/platform/root-generators/33-HunyuanVideo_00005.mp4",
    "width": 960,
    "height": 544
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00005.jpg",
    "kind": "image",
    "local": "/platform/root-generators/34-HunyuanVideo_00005.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00006.mp4",
    "kind": "video",
    "local": "/platform/root-generators/35-HunyuanVideo_00006.mp4",
    "width": 1280,
    "height": 720
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00006.jpg",
    "kind": "image",
    "local": "/platform/root-generators/36-HunyuanVideo_00006.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00007.mp4",
    "kind": "video",
    "local": "/platform/root-generators/37-HunyuanVideo_00007.mp4",
    "width": 1280,
    "height": 720
  },
  {
    "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00007.jpg",
    "kind": "image",
    "local": "/platform/root-generators/38-HunyuanVideo_00007.jpg",
    "width": null,
    "height": null
  },
  {
    "source": "https://cdn.lantaai.com/showcase/964f9de2-715c-4087-bd08-dfe86d7bbc85.mp4",
    "kind": "video",
    "local": "/platform/root-generators/39-964f9de2-715c-4087-bd08-dfe86d7bbc85.mp4",
    "width": 856,
    "height": 480
  },
  {
    "source": "https://cdn.lantaai.com/showcase/964f9de2-715c-4087-bd08-dfe86d7bbc85.jpg",
    "kind": "image",
    "local": "/platform/root-generators/40-964f9de2-715c-4087-bd08-dfe86d7bbc85.jpg",
    "width": null,
    "height": null
  }
];

export function rootGeneratorAsset(source: string) {
  return rootGeneratorAssets.find(asset => asset.source === source);
}
