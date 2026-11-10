import type { Locale } from "./i18n";
import { platformEntry, type PlatformEntry } from "./platform-navigation";

export type DirectoryPath = "/tools" | "/video-effects" | "/image-effects" | "/ai-image-models" | "/ai-video-models";
type Localized = Readonly<Record<Locale, string>>;
export type DirectoryCard = Readonly<{ entryId: string; title: Localized; description?: Localized; mediaKey: string; hash: string | null; badge?: "hot" | "new"; referenceEnglish?: boolean; cta?: Localized }>;
export type DirectorySection = Readonly<{ id: string; title: Localized; description: Localized; cards: readonly DirectoryCard[] }>;
type DirectoryContent = Readonly<{ title: Localized; description: Localized; eyebrow?: Localized; breadcrumb: Localized; layout: "tools" | "video-effects" | "image-effects" | "image-models" | "video-models"; cards: readonly DirectoryCard[]; sections?: readonly DirectorySection[] }>;

// 卡片顺序、媒体身份及目标取自替代空间20的完整公开目录观察。
export const directoryContent: Readonly<Record<DirectoryPath, DirectoryContent>> = {
  "/tools": {
    "title": {
      "en": "Discover Our AI-Powered Tools",
      "zh-CN": "探索我们的 AI驱动 工具"
    },
    "description": {
      "en": "Explore our collection of AI image and video generation tools designed to help you create stunning content effortlessly.",
      "zh-CN": "探索我们的人工智能图像和视频生成工具集合，助您轻松创建惊艳内容。"
    },
    "eyebrow": {
      "en": "Makeup AI Tools",
      "zh-CN": "Makeup AI 工具"
    },
    "breadcrumb": {
      "en": "Tools",
      "zh-CN": "工具"
    },
    "layout": "tools",
    "cards": [
      {
        "entryId": "ai-wallpaper-generator",
        "title": {
          "en": "AI Wallpaper Generator",
          "zh-CN": "AI Wallpaper Generator"
        },
        "mediaKey": "tools-01",
        "hash": null
      },
      {
        "entryId": "dance",
        "title": {
          "en": "AI Dance Generator",
          "zh-CN": "AI Dance Generator"
        },
        "mediaKey": "tools-02",
        "hash": null
      },
      {
        "entryId": "lip-sync",
        "title": {
          "en": "Lip Sync",
          "zh-CN": "唇形同步"
        },
        "mediaKey": "tools-03",
        "hash": null
      },
      {
        "entryId": "character-animation",
        "title": {
          "en": "Character Animation",
          "zh-CN": "角色动画"
        },
        "mediaKey": "tools-04",
        "hash": null
      },
      {
        "entryId": "ai-animate-image-generator",
        "title": {
          "en": "AI Animate Image Generator",
          "zh-CN": "AI动画图像生成器"
        },
        "mediaKey": "tools-05",
        "hash": null
      },
      {
        "entryId": "vheer",
        "title": {
          "en": "Vheer AI Video Generator",
          "zh-CN": "Vheer AI 视频生成器"
        },
        "mediaKey": "tools-06",
        "hash": null
      },
      {
        "entryId": "ai-celebrity-video",
        "title": {
          "en": "AI Celebrity Video Generator",
          "zh-CN": "AI 名人视频生成器"
        },
        "mediaKey": "tools-07",
        "hash": null
      },
      {
        "entryId": "text-to-video",
        "title": {
          "en": "AI Text to Video",
          "zh-CN": "AI 文本生成视频"
        },
        "mediaKey": "tools-08",
        "hash": null
      },
      {
        "entryId": "ai-music-video-generator",
        "title": {
          "en": "AI Music Video Generator",
          "zh-CN": "AI 音乐视频生成器"
        },
        "mediaKey": "tools-09",
        "hash": null
      },
      {
        "entryId": "image-to-video",
        "title": {
          "en": "AI Image to Video",
          "zh-CN": "AI图生视频"
        },
        "mediaKey": "tools-10",
        "hash": null
      },
      {
        "entryId": "landscape-to-portrait-video-converter-ai",
        "title": {
          "en": "Landscape to Portrait Video Converter AI",
          "zh-CN": "AI 横屏转竖屏视频转换器"
        },
        "mediaKey": "tools-11",
        "hash": null
      },
      {
        "entryId": "image-to-image-ai",
        "title": {
          "en": "Image To Image AI",
          "zh-CN": "AI 图生图"
        },
        "mediaKey": "tools-12",
        "hash": null
      },
      {
        "entryId": "ai-image-merger",
        "title": {
          "en": "AI Image Merger",
          "zh-CN": "AI 图片融合器"
        },
        "mediaKey": "tools-13",
        "hash": null
      },
      {
        "entryId": "ai-image-combiner",
        "title": {
          "en": "AI Image Combiner",
          "zh-CN": "AI 图片合成器"
        },
        "mediaKey": "tools-14",
        "hash": null
      },
      {
        "entryId": "ai-animal-generator",
        "title": {
          "en": "AI Animal Generator",
          "zh-CN": "AI 动物生成器"
        },
        "mediaKey": "tools-15",
        "hash": null
      },
      {
        "entryId": "perchance-image-generator",
        "title": {
          "en": "Perchance Image Generator",
          "zh-CN": "Perchance图像生成器"
        },
        "mediaKey": "tools-16",
        "hash": null
      },
      {
        "entryId": "framepack-video-generator",
        "title": {
          "en": "FramePack Video Generator",
          "zh-CN": "FramePack视频生成器"
        },
        "mediaKey": "tools-17",
        "hash": null
      },
      {
        "entryId": "ai-graffiti-generator",
        "title": {
          "en": "AI Graffiti Generator",
          "zh-CN": "AI涂鸦生成器"
        },
        "mediaKey": "tools-18",
        "hash": null
      },
      {
        "entryId": "ai-youtube-banner-maker",
        "title": {
          "en": "AI YouTube Banner Maker",
          "zh-CN": "AI YouTube 横幅生成器"
        },
        "mediaKey": "tools-19",
        "hash": null
      },
      {
        "entryId": "video-to-animation-converter",
        "title": {
          "en": "Video to Animation Converter",
          "zh-CN": "视频转动画转换器"
        },
        "mediaKey": "tools-20",
        "hash": null
      },
      {
        "entryId": "image-to-ghibli-style",
        "title": {
          "en": "Image to Ghibli Style Converter",
          "zh-CN": "图片转吉卜力风格转换器"
        },
        "mediaKey": "tools-21",
        "hash": null
      },
      {
        "entryId": "video-to-ghibli-style",
        "title": {
          "en": "Video to Ghibli Style Converter",
          "zh-CN": "视频转吉卜力风格转换器"
        },
        "mediaKey": "tools-22",
        "hash": null
      },
      {
        "entryId": "hunyuanvideo-avatar",
        "title": {
          "en": "Hunyuanvideo Avatar",
          "zh-CN": "Hunyuanvideo Avatar"
        },
        "mediaKey": "tools-23",
        "hash": null
      },
      {
        "entryId": "image-editor",
        "title": {
          "en": "AI Image Editor",
          "zh-CN": "AI图像编辑器"
        },
        "mediaKey": "tools-24",
        "hash": null
      },
      {
        "entryId": "mochi1-video-generator",
        "title": {
          "en": "Mochi 1 Video Generator",
          "zh-CN": "Mochi 1 视频生成器"
        },
        "mediaKey": "tools-25",
        "hash": null
      },
      {
        "entryId": "cogvideox-video-generator",
        "title": {
          "en": "CogVideoX",
          "zh-CN": "CogVideoX"
        },
        "mediaKey": "tools-26",
        "hash": null
      },
      {
        "entryId": "hunyuanvideo-generator",
        "title": {
          "en": "Hunyuan Video Generator",
          "zh-CN": "混元视频生成器"
        },
        "mediaKey": "tools-27",
        "hash": null
      },
      {
        "entryId": "hunyuan-video-lora",
        "title": {
          "en": "Hunyuan LoRA",
          "zh-CN": "混元LoRA"
        },
        "mediaKey": "tools-28",
        "hash": null
      }
    ]
  },
  "/video-effects": {
    "title": {
      "en": "Explore Video Effects",
      "zh-CN": "探索视频特效"
    },
    "description": {
      "en": "Discover a world of creative possibilities. Choose an effect to start generating your own AI video.",
      "zh-CN": "发现丰富的创意可能性。选择一个特效，开始生成你的专属 AI 视频。"
    },
    "breadcrumb": {
      "en": "Video Effects",
      "zh-CN": "视频特效"
    },
    "layout": "video-effects",
    "cards": [
      {
        "entryId": "template-1200",
        "title": {
          "en": "Christmas(Heart)",
          "zh-CN": "圣诞爱心"
        },
        "mediaKey": "video-effects-01",
        "hash": null,
        "badge": "hot"
      },
      {
        "entryId": "ai-kissing-video-generator",
        "title": {
          "en": "AI Kissing Video Generator",
          "zh-CN": "AI 接吻视频生成器"
        },
        "mediaKey": "video-effects-02",
        "hash": "generator",
        "badge": "hot"
      },
      {
        "entryId": "ai-french-kiss-video-generator",
        "title": {
          "en": "AI French Kiss Video Generator",
          "zh-CN": "AI 法式接吻视频生成器"
        },
        "mediaKey": "video-effects-03",
        "hash": "generator",
        "badge": "hot"
      },
      {
        "entryId": "ai-hug-video-generator",
        "title": {
          "en": "AI Hug Video Generator",
          "zh-CN": "AI 拥抱视频生成器"
        },
        "mediaKey": "video-effects-04",
        "hash": "generator",
        "badge": "new"
      },
      {
        "entryId": "ai-muscle-video",
        "title": {
          "en": "AI Muscle Video",
          "zh-CN": "AI 肌肉视频"
        },
        "mediaKey": "video-effects-05",
        "hash": null,
        "badge": "new"
      },
      {
        "entryId": "earth-zoom-out",
        "title": {
          "en": "Earth Zoom Out",
          "zh-CN": "地球拉远"
        },
        "mediaKey": "video-effects-06",
        "hash": null,
        "badge": "new"
      },
      {
        "entryId": "ai-mermaid-video",
        "title": {
          "en": "AI Mermaid Video Generator",
          "zh-CN": "AI 美人鱼视频生成器"
        },
        "mediaKey": "video-effects-07",
        "hash": null
      },
      {
        "entryId": "ai-angel-video-generator",
        "title": {
          "en": "AI Angel Wings",
          "zh-CN": "AI 天使翅膀"
        },
        "mediaKey": "video-effects-08",
        "hash": null
      },
      {
        "entryId": "template-508",
        "title": {
          "en": "AI Angel Halo",
          "zh-CN": "AI 天使光环"
        },
        "mediaKey": "video-effects-09",
        "hash": null
      }
    ]
  },
  "/image-effects": {
    "title": {
      "en": "Explore Image Effects",
      "zh-CN": "探索图片特效"
    },
    "description": {
      "en": "Turn your photos into amazing image effects with our AI Image Effects tool. Create eye-catching visuals from images in seconds — no editing skills needed!",
      "zh-CN": "使用 AI 图片特效，将照片转化为引人注目的视觉作品。选择特效，查看对应工具入口。"
    },
    "breadcrumb": {
      "en": "Image Effects",
      "zh-CN": "图片特效"
    },
    "layout": "image-effects",
    "cards": [
      {
        "entryId": "ai-hair-style-changer",
        "title": {
          "en": "AI Hair Style Changer",
          "zh-CN": "AI 发型更换"
        },
        "mediaKey": "image-effects-01",
        "hash": null,
        "badge": "new"
      },
      {
        "entryId": "old-photo-restoration",
        "title": {
          "en": "AI Old Photo Restoration",
          "zh-CN": "AI 老照片修复"
        },
        "mediaKey": "image-effects-02",
        "hash": null,
        "badge": "new"
      },
      {
        "entryId": "image-styler",
        "title": {
          "en": "Image Style Converter",
          "zh-CN": "图片风格转换"
        },
        "mediaKey": "image-effects-03",
        "hash": null,
        "badge": "hot"
      },
      {
        "entryId": "age",
        "title": {
          "en": "AI Age Progression",
          "zh-CN": "AI 年龄变化"
        },
        "mediaKey": "image-effects-04",
        "hash": null,
        "badge": "new"
      },
      {
        "entryId": "makeup",
        "title": {
          "en": "AI Makeup",
          "zh-CN": "AI 美妆"
        },
        "mediaKey": "image-effects-05",
        "hash": null,
        "badge": "hot"
      },
      {
        "entryId": "buzz-cut-filter",
        "title": {
          "en": "Buzz Cut Filter",
          "zh-CN": "寸头滤镜"
        },
        "mediaKey": "image-effects-06",
        "hash": null
      },
      {
        "entryId": "ai-hair-color-changer",
        "title": {
          "en": "AI Hair Color Changer",
          "zh-CN": "AI 发色更换"
        },
        "mediaKey": "image-effects-07",
        "hash": null,
        "badge": "new"
      },
      {
        "entryId": "bald-filter",
        "title": {
          "en": "Bald Filter",
          "zh-CN": "光头滤镜"
        },
        "mediaKey": "image-effects-08",
        "hash": null
      },
      {
        "entryId": "beard-filter",
        "title": {
          "en": "Beard Filter",
          "zh-CN": "胡须滤镜"
        },
        "mediaKey": "image-effects-09",
        "hash": null
      },
      {
        "entryId": "ai-south-park",
        "title": {
          "en": "AI South Park Character Creator",
          "zh-CN": "AI 南方公园角色创作"
        },
        "mediaKey": "image-effects-10",
        "hash": null,
        "badge": "new"
      },
      {
        "entryId": "ai-album-cover-generator",
        "title": {
          "en": "AI Album Cover Generator",
          "zh-CN": "AI 专辑封面生成器"
        },
        "mediaKey": "image-effects-11",
        "hash": null,
        "badge": "new"
      },
      {
        "entryId": "change-eye-color",
        "title": {
          "en": "Change Eye Color",
          "zh-CN": "更改眼睛颜色"
        },
        "mediaKey": "image-effects-12",
        "hash": null,
        "badge": "new"
      }
    ]
  },
  "/ai-image-models": {
    "title": {
      "en": "AI Image Models",
      "zh-CN": "AI 图像模型"
    },
    "description": {
      "en": "Explore Makeup AI image model pages. Compare use cases, view examples, and explore each model.",
      "zh-CN": "探索 Makeup AI 的图像模型页面。比较使用场景，查看示例，并了解每个模型。"
    },
    "breadcrumb": {
      "en": "AI Image Models",
      "zh-CN": "AI 图像模型"
    },
    "layout": "image-models",
    "cards": [
      {
        "entryId": "gpt-image",
        "title": {
          "en": "GPT Image 2.0",
          "zh-CN": "GPT Image 2.0"
        },
        "mediaKey": "ai-image-models-01",
        "hash": null,
        "description": {
          "en": "Create text-rich visuals, posters, infographics, UI mockups, and multi-image creative work with stronger prompt following and clearer layout control.",
          "zh-CN": "使用更强的提示词遵循能力和更清晰的版式控制，创作富含文字的视觉图、海报、信息图、UI 设计稿和多图创意作品。"
        },
        "cta": {
          "en": "Explore model",
          "zh-CN": "探索模型"
        }
      },
      {
        "entryId": "nano-banana",
        "title": {
          "en": "Nano Banana Pro",
          "zh-CN": "Nano Banana Pro"
        },
        "mediaKey": "ai-image-models-02",
        "hash": null,
        "description": {
          "en": "Generate and edit high-resolution images with Gemini-powered text rendering, 4K output, and strong multilingual visual creation.",
          "zh-CN": "借助 Gemini 驱动的文字渲染、4K 输出和强大的多语言视觉创作能力，生成并编辑高分辨率图像。"
        },
        "cta": {
          "en": "Explore model",
          "zh-CN": "探索模型"
        }
      }
    ]
  },
  "/ai-video-models": {
    "title": {
      "en": "Discover Our AI-Powered Video Models",
      "zh-CN": "探索我们的 AI 驱动 视频模型"
    },
    "description": {
      "en": "Explore our collection of AI video models to help you create amazing content with ease.",
      "zh-CN": "探索我们的 AI 视频模型集合，帮助您轻松创建令人惊叹的内容。"
    },
    "eyebrow": {
      "en": "Makeup AI Video Models",
      "zh-CN": "Makeup AI 视频模型"
    },
    "breadcrumb": {
      "en": "AI Video Models",
      "zh-CN": "AI 视频模型"
    },
    "layout": "video-models",
    "cards": [],
    "sections": [
      {
        "id": "models-wan",
        "title": {
          "en": "Explore Wan models",
          "zh-CN": "探索 Wan 模型"
        },
        "description": {
          "en": "Compare Wan video creation workflows and learn about Wan FusionX as a related option.",
          "zh-CN": "比较 Wan 视频创作流程，并了解 Wan FusionX 这一相关选择。"
        },
        "cards": [
          {
            "entryId": "wan-2-6",
            "title": {
              "en": "Wan 2.6",
              "zh-CN": "Wan 2.6"
            },
            "mediaKey": "ai-video-models-01",
            "hash": null,
            "description": {
              "en": "Create text or image videos and explore multi-shot image-to-video storytelling.",
              "zh-CN": "从文字或图片生成视频，并探索图生视频中的多镜头叙事。"
            },
            "referenceEnglish": true,
            "cta": {
              "en": "Learn about Wan 2.6",
              "zh-CN": "了解 Wan 2.6"
            }
          },
          {
            "entryId": "wan-3-0",
            "title": {
              "en": "Wan 3.0",
              "zh-CN": "Wan 3.0"
            },
            "mediaKey": "ai-video-models-02",
            "hash": null,
            "description": {
              "en": "Explore text, image and multimodal reference workflows.",
              "zh-CN": "探索文字、图片和多模态参考素材驱动的视频创作流程。"
            },
            "cta": {
              "en": "Learn about Wan 3.0",
              "zh-CN": "了解 Wan 3.0"
            }
          },
          {
            "entryId": "wan-2-5",
            "title": {
              "en": "Wan 2.5",
              "zh-CN": "Wan 2.5"
            },
            "mediaKey": "ai-video-models-03",
            "hash": null,
            "description": {
              "en": "Compare short text-to-video and image-to-video workflows with audio options.",
              "zh-CN": "通过文字或图片创作短视频，并比较音频选项。"
            },
            "referenceEnglish": true,
            "cta": {
              "en": "Learn about Wan 2.5",
              "zh-CN": "了解 Wan 2.5"
            }
          },
          {
            "entryId": "wan-2-2",
            "title": {
              "en": "Wan 2.2",
              "zh-CN": "Wan 2.2"
            },
            "mediaKey": "ai-video-models-04",
            "hash": null,
            "description": {
              "en": "Animate a single image for motion studies and scene previews.",
              "zh-CN": "让单张图片动起来，用于动作测试和场景预览。"
            },
            "cta": {
              "en": "Learn about Wan 2.2",
              "zh-CN": "了解 Wan 2.2"
            }
          },
          {
            "entryId": "wan-fusionX",
            "title": {
              "en": "Wan FusionX",
              "zh-CN": "Wan FusionX"
            },
            "mediaKey": "ai-video-models-05",
            "hash": null,
            "description": {
              "en": "Explore the Wan FusionX page alongside other Wan video workflows.",
              "zh-CN": "了解 Wan FusionX，并比较其他 Wan 视频创作流程。"
            },
            "referenceEnglish": true,
            "cta": {
              "en": "Learn about Wan FusionX",
              "zh-CN": "了解 Wan FusionX"
            }
          }
        ]
      },
      {
        "id": "models-kling",
        "title": {
          "en": "Explore Kling models",
          "zh-CN": "探索 Kling 模型"
        },
        "description": {
          "en": "Compare Kling video creation workflows.",
          "zh-CN": "比较 Kling 视频创作流程。"
        },
        "cards": [
          {
            "entryId": "kling-3-0",
            "title": {
              "en": "Kling 3.0",
              "zh-CN": "Kling 3.0"
            },
            "mediaKey": "ai-video-models-06",
            "hash": null,
            "description": {
              "en": "Compare Kling workflows with audio and multi-shot controls.",
              "zh-CN": "比较提供音频与多镜头控制的 Kling 创作流程。"
            },
            "cta": {
              "en": "Learn about Kling 3.0",
              "zh-CN": "了解 Kling 3.0"
            }
          },
          {
            "entryId": "kling-ai",
            "title": {
              "en": "Kling AI",
              "zh-CN": "Kling AI"
            },
            "mediaKey": "ai-video-models-07",
            "hash": null,
            "description": {
              "en": "Explore Kling 2.6 for text or image videos with optional audio.",
              "zh-CN": "了解 Kling 2.6 的文生视频与图生视频流程，可选生成音频。"
            },
            "cta": {
              "en": "Learn about Kling AI",
              "zh-CN": "了解 Kling AI"
            }
          }
        ]
      },
      {
        "id": "models-other",
        "title": {
          "en": "More AI video models and tools",
          "zh-CN": "更多 AI 视频模型与工具"
        },
        "description": {
          "en": "Explore more ways to create videos with prompts, images, and creative references.",
          "zh-CN": "探索利用提示词、图片和创作参考素材生成视频的其他方式。"
        },
        "cards": [
          {
            "entryId": "seedance",
            "title": {
              "en": "Seedance 2.0",
              "zh-CN": "Seedance 2.0"
            },
            "mediaKey": "ai-video-models-08",
            "hash": null,
            "description": {
              "en": "Explore video creation guided by text, images, video and audio references.",
              "zh-CN": "探索以文字、图片、视频和音频为参考的视频创作。"
            },
            "cta": {
              "en": "Learn about Seedance 2.0",
              "zh-CN": "了解 Seedance 2.0"
            }
          },
          {
            "entryId": "happy-horse",
            "title": {
              "en": "HappyHorse 1.0",
              "zh-CN": "HappyHorse 1.0"
            },
            "mediaKey": "ai-video-models-09",
            "hash": null,
            "description": {
              "en": "Explore multi-image references for short visual stories.",
              "zh-CN": "探索使用多张参考图片创作简短的视觉故事。"
            },
            "cta": {
              "en": "Learn about HappyHorse 1.0",
              "zh-CN": "了解 HappyHorse 1.0"
            }
          },
          {
            "entryId": "grok-imagine",
            "title": {
              "en": "Grok Imagine",
              "zh-CN": "Grok Imagine"
            },
            "mediaKey": "ai-video-models-10",
            "hash": null,
            "description": {
              "en": "Compare text and image video creation with native audio.",
              "zh-CN": "比较带有原生音频的文生视频与图生视频创作。"
            },
            "cta": {
              "en": "Learn about Grok Imagine",
              "zh-CN": "了解 Grok Imagine"
            }
          },
          {
            "entryId": "dreamface-ai",
            "title": {
              "en": "DreamFace AI",
              "zh-CN": "DreamFace AI"
            },
            "mediaKey": "ai-video-models-11",
            "hash": null,
            "description": {
              "en": "Explore talking photos and character animation with DreamFace; generation with this model is not available in this project.",
              "zh-CN": "了解 DreamFace 的照片说话与角色动画功能；本项目暂未提供该模型生成。"
            },
            "referenceEnglish": true,
            "cta": {
              "en": "Learn about DreamFace AI",
              "zh-CN": "了解 DreamFace AI"
            }
          },
          {
            "entryId": "mindvideo-ai",
            "title": {
              "en": "MindVideo AI",
              "zh-CN": "MindVideo AI"
            },
            "mediaKey": "ai-video-models-12",
            "hash": null,
            "description": {
              "en": "Turn a written scene or source image into a short video.",
              "zh-CN": "将文字描述的场景或原始图片转化为短视频。"
            },
            "referenceEnglish": true,
            "cta": {
              "en": "Learn about MindVideo AI",
              "zh-CN": "了解 MindVideo AI"
            }
          },
          {
            "entryId": "vheer",
            "title": {
              "en": "Vheer",
              "zh-CN": "Vheer"
            },
            "mediaKey": "ai-video-models-13",
            "hash": null,
            "description": {
              "en": "Explore image animation for product clips, social videos and visual concepts.",
              "zh-CN": "探索图片动画，用于产品短片、社交视频和视觉构思。"
            },
            "cta": {
              "en": "Learn about Vheer",
              "zh-CN": "了解 Vheer"
            }
          },
          {
            "entryId": "sora-2",
            "title": {
              "en": "Sora 2",
              "zh-CN": "Sora 2"
            },
            "mediaKey": "ai-video-models-14",
            "hash": null,
            "description": {
              "en": "Explore Sora text-to-video and image-to-video workflows.",
              "zh-CN": "了解 Sora 的文生视频与图生视频流程。"
            },
            "referenceEnglish": true,
            "cta": {
              "en": "Learn about Sora 2",
              "zh-CN": "了解 Sora 2"
            }
          },
          {
            "entryId": "veo-3",
            "title": {
              "en": "Veo 3.1 Fast",
              "zh-CN": "Veo 3.1 Fast"
            },
            "mediaKey": "ai-video-models-15",
            "hash": null,
            "description": {
              "en": "Explore Veo 3.1 Fast for short videos with native audio.",
              "zh-CN": "了解 Veo 3.1 Fast，创作带有原生音频的短视频。"
            },
            "referenceEnglish": true,
            "cta": {
              "en": "Learn about Veo 3.1 Fast",
              "zh-CN": "了解 Veo 3.1 Fast"
            }
          }
        ]
      }
    ]
  }
};

export const directoryPaths = Object.keys(directoryContent) as DirectoryPath[];
export function isDirectoryPath(path: string): path is DirectoryPath {
  return Object.prototype.hasOwnProperty.call(directoryContent, path);
}
export function directoryCards(path: DirectoryPath, sectionId?: string): readonly DirectoryCard[] {
  const page = directoryContent[path];
  return sectionId ? page.sections?.find(section => section.id === sectionId)?.cards ?? [] : page.cards;
}
export function directoryEntry(card: DirectoryCard): PlatformEntry {
  const entry = platformEntry(card.entryId);
  return { ...entry, label: card.title, hash: card.hash ?? undefined, query: { ...entry.query, ...(entry.model ? { model: entry.model } : {}), ...(entry.mode ? { mode: entry.mode } : {}) } };
}
