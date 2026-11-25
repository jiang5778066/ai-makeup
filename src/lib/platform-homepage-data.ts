import type { Locale } from "./i18n";
import type { PlatformMode } from "./platform-navigation";
export type HomepageCard = { id: string; label: Record<Locale, string>; image: string; illustration?: boolean; referenceGuide?: boolean; icon?: string; description: Record<Locale, string>; videoMode?: Extract<PlatformMode, "image-to-video" | "text-to-video"> };
export const heroPoster = "/platform/homepage/0dabbc3e546fa297.jpg";
export const heroVideo = "/platform/homepage/c4774ab8e6578381.mp4";
export const generatorImages = [
  "/platform/homepage/aa6c4bd9f0fa5247.jpg",
  "/platform/homepage/fe98b430e05f02e0.webp",
  "/platform/homepage/7285727ab72018e1.webp",
  "/platform/homepage/78b04c479992f4e6.webp",
  "/platform/homepage/85391184c73fcca6.webp"
];
export const creatorExamples = [
  {
    "image": "/platform/homepage/b1097a558865c239.jpg",
    "caption": {
      "zh-CN": "孤独宇航员回望地球",
      "en": "Astronaut looking back at Earth"
    }
  },
  {
    "image": "/platform/homepage/a3cf8a70232157d6.jpg",
    "caption": {
      "zh-CN": "猫咪挑战跑步机",
      "en": "Cat on a treadmill"
    }
  },
  {
    "image": "/platform/homepage/c55fc6c4b9d99641.jpg",
    "caption": {
      "zh-CN": "鲸鱼从深海跃起",
      "en": "Whale breaching"
    }
  },
  {
    "image": "/platform/homepage/d21b3bd1a48c6eee.jpg",
    "caption": {
      "zh-CN": "贴纸艺术变成真实城市",
      "en": "Sticker art becomes a city"
    }
  },
  {
    "image": "/platform/homepage/732cf7c90886c1ca.jpg",
    "caption": {
      "zh-CN": "魔方自己复原",
      "en": "A cube solves itself"
    }
  }
];
export const homepageModels: HomepageCard[] = [
  {
    "id": "grok-imagine",
    "label": {
      "zh-CN": "Grok Imagine",
      "en": "Grok Imagine"
    },
    "image": "/platform/homepage/e8062252d7f963d0.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/d7904f0972b24cb7.png"
  },
  {
    "id": "happy-horse",
    "label": {
      "zh-CN": "Happy Horse 1.0",
      "en": "Happy Horse 1.0"
    },
    "image": "/platform/homepage/1c2228ef436d441e.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/2a89c72516e251a5.png"
  },
  {
    "id": "seedance",
    "label": {
      "zh-CN": "Seedance 2.0",
      "en": "Seedance 2.0"
    },
    "image": "/platform/homepage/4b518133ff5ec247.png",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/e3bf3dcf1e157e91.svg"
  },
  {
    "id": "wan-2-6",
    "label": {
      "zh-CN": "Wan 2.6",
      "en": "Wan 2.6"
    },
    "image": "/platform/homepage/cf1b735421cfac25.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/86b2613792d2f183.svg"
  },
  {
    "id": "kling-3-0",
    "label": {
      "zh-CN": "Kling 3.0",
      "en": "Kling 3.0"
    },
    "image": "/platform/homepage/67f50c53028d35b1.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/bc467983eb9bb707.svg"
  },
  {
    "id": "wan-3-0",
    "label": {
      "zh-CN": "Wan 3.0",
      "en": "Wan 3.0"
    },
    "image": "/platform/homepage/b503210e3e177e0f.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/86b2613792d2f183.svg"
  },
  {
    "id": "gpt-image",
    "label": {
      "zh-CN": "GPT Image 2",
      "en": "GPT Image 2"
    },
    "image": "/platform/homepage/2b25e0c7475061af.webp",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/391d9c14feff17c7.svg"
  },
  {
    "id": "nano-banana",
    "label": {
      "zh-CN": "Nano Banana Pro",
      "en": "Nano Banana Pro"
    },
    "image": "/platform/homepage/d2d64b1ab799a73e.webp",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/e7bf7960a1513340.svg"
  }
];
export const landingVideoTools: HomepageCard[] = [
  {
    "id": "dance",
    "label": {
      "zh-CN": "AI Dance Generator",
      "en": "AI Dance Generator"
    },
    "image": "/platform/homepage/83802524b8975b04.jpg",
    "description": {
      "zh-CN": "使用舞蹈模板或自选动作，将照片变成 AI 舞蹈视频。",
      "en": "Explore photo animation with dance templates."
    }
  },
  {
    "id": "image-to-video",
    "videoMode": "image-to-video",
    "label": {
      "zh-CN": "AI图生视频",
      "en": "AI Image to Video"
    },
    "image": "/platform/homepage/07ffbc01ba2fa472.jpg",
    "description": {
      "zh-CN": "查看用于静态图片动效和镜头运动的模式与参数。",
      "en": "Explore movement and cinematic camera motion for still images."
    }
  },
  {
    "id": "text-to-video",
    "videoMode": "text-to-video",
    "label": {
      "zh-CN": "AI文生视频",
      "en": "AI Text to Video"
    },
    "image": "/platform/homepage/70a4674483891494.jpg",
    "description": {
      "zh-CN": "通过文字提示词探索故事、广告和社交媒体的视频创意。",
      "en": "Explore video ideas for stories, ads and social media from text."
    }
  },
  {
    "id": "video-styler",
    "label": {
      "zh-CN": "视频转视频",
      "en": "Video to Video"
    },
    "image": "/platform/homepage/028662e96455c464.jpg",
    "description": {
      "zh-CN": "探索保留原有动作的视频风格转换。",
      "en": "Explore video style transfer while preserving movement."
    }
  },
  {
    "id": "lip-sync",
    "label": {
      "zh-CN": "AI 对口型视频生成器",
      "en": "AI Lip Sync Video Generator"
    },
    "image": "/platform/homepage/21b089f16ed02c9e.webp",
    "description": {
      "zh-CN": "探索口型与音频同步的虚拟人物视频。",
      "en": "Explore talking characters with synchronized audio."
    }
  },
  {
    "id": "landscape-to-portrait-video-converter-ai",
    "label": {
      "zh-CN": "横屏转竖屏预览",
      "en": "Landscape to portrait preview"
    },
    "image": "",
    "description": {
      "zh-CN": "用本地视频预览 9:16 或 4:5 的竖屏构图。",
      "en": "Preview 9:16 or 4:5 framing with a local video."
    }
  }
];
export const videoEffects: HomepageCard[] = [
  {
    "id": "ai-kissing-video-generator",
    "label": {
      "zh-CN": "AI接吻视频生成器",
      "en": "AI Kissing Video"
    },
    "image": "/platform/homepage/8fc1c6550844869e.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "ai-hug-video-generator",
    "label": {
      "zh-CN": "AI拥抱视频",
      "en": "AI Hug Video"
    },
    "image": "/platform/homepage/642924f3f7008e08.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "earth-zoom-out",
    "label": {
      "zh-CN": "地球拉远",
      "en": "Earth Zoom Out"
    },
    "image": "/platform/directories/framekoi-earth-zoom-out.webp",
    "illustration": true,
    "referenceGuide": true,
    "description": {
      "zh-CN": "分镜与提示词资料页。专用生成尚未验证。",
      "en": "Storyboard and prompt guide. Dedicated generation is unverified."
    }
  },
  {
    "id": "ai-mermaid-video",
    "label": {
      "zh-CN": "AI美人鱼视频生成器",
      "en": "AI Mermaid Video"
    },
    "image": "/platform/homepage/645bbd55fae4162a.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "ai-muscle-video",
    "label": {
      "zh-CN": "AI肌肉视频",
      "en": "AI Muscle Video"
    },
    "image": "/platform/homepage/ae580270479931f1.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "ai-angel-video-generator",
    "label": {
      "zh-CN": "AI 天使翅膀",
      "en": "AI Angel Wings"
    },
    "image": "/platform/directories/framekoi-ai-angel-wings.webp",
    "illustration": true,
    "referenceGuide": true,
    "description": {
      "zh-CN": "分镜与提示词资料页。专用生成尚未验证。",
      "en": "Storyboard and prompt guide. Dedicated generation is unverified."
    }
  }
];
export const imageEffects: HomepageCard[] = [
  {
    "id": "ai-hair-style-changer",
    "label": {
      "zh-CN": "AI 发型更换",
      "en": "AI Hairstyle Changer"
    },
    "image": "/platform/directories/framekoi-hair-style-illustration.webp",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "illustration": true
  },
  {
    "id": "old-photo-restoration",
    "label": {
      "zh-CN": "老照片修复",
      "en": "Old Photo Restoration"
    },
    "image": "/platform/directories/framekoi-photo-restoration-illustration.webp",
    "illustration": true,
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "image-styler",
    "label": {
      "zh-CN": "图像风格转换器",
      "en": "Image Style Converter"
    },
    "image": "/platform/directories/framekoi-image-style-illustration.webp",
    "illustration": true,
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "makeup",
    "label": {
      "zh-CN": "AI 美妆",
      "en": "AI Makeup"
    },
    "image": "/platform/homepage/3073b9eda0b69456.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "ai-hair-color-changer",
    "label": {
      "zh-CN": "AI 发色更换",
      "en": "AI Hair Color Changer"
    },
    "image": "/platform/directories/framekoi-hair-color-illustration.webp",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "illustration": true
  },
  {
    "id": "beard-filter",
    "label": {
      "zh-CN": "胡须滤镜",
      "en": "Beard Filter"
    },
    "image": "/platform/directories/framekoi-beard-filter-illustration.webp",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "illustration": true
  }
];
export const workspaceModels: HomepageCard[] = [
  {
    "id": "image-generator",
    "label": {
      "zh-CN": "Seedream 5.0 Pro",
      "en": "Seedream 5.0 Pro"
    },
    "image": "/platform/homepage/530b01f3c16979ef.webp",
    "description": {
      "zh-CN": "将灵感与参考图转化为电影感视觉的公开展示。",
      "en": "A public showcase of cinematic visuals from ideas and reference images."
    }
  },
  {
    "id": "grok-imagine",
    "label": {
      "zh-CN": "Grok Imagine",
      "en": "Grok Imagine"
    },
    "image": "/platform/homepage/4568ae38b907a261.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/d7904f0972b24cb7.png"
  },
  {
    "id": "happy-horse",
    "label": {
      "zh-CN": "Happy Horse 1.0",
      "en": "Happy Horse 1.0"
    },
    "image": "/platform/homepage/1c2228ef436d441e.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/2a89c72516e251a5.png"
  },
  {
    "id": "kling-3-0",
    "label": {
      "zh-CN": "Kling 3.0",
      "en": "Kling 3.0"
    },
    "image": "/platform/homepage/67f50c53028d35b1.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/bc467983eb9bb707.svg"
  },
  {
    "id": "seedance",
    "label": {
      "zh-CN": "Seedance 2.0",
      "en": "Seedance 2.0"
    },
    "image": "/platform/homepage/4b518133ff5ec247.png",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "icon": "/platform/homepage/e3bf3dcf1e157e91.svg"
  }
];
export const workspaceVideoTools: HomepageCard[] = [
  {
    "id": "ai-kissing-video-generator",
    "label": {
      "zh-CN": "AI接吻视频生成器",
      "en": "AI Kissing Video"
    },
    "image": "/platform/homepage/b144b807522dedb9.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "character-animation",
    "label": {
      "zh-CN": "角色动画",
      "en": "Character Animation"
    },
    "image": "/platform/homepage/e3d6e4020f547d13.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "lip-sync",
    "label": {
      "zh-CN": "AI 对口型视频生成器",
      "en": "AI Lip Sync Video Generator"
    },
    "image": "/platform/homepage/21b089f16ed02c9e.webp",
    "description": {
      "zh-CN": "探索口型与音频同步的虚拟人物视频。",
      "en": "Explore talking characters with synchronized audio."
    }
  },
  {
    "id": "video-styler",
    "label": {
      "zh-CN": "视频转视频",
      "en": "Video to Video"
    },
    "image": "/platform/homepage/326083b8db576559.jpg",
    "description": {
      "zh-CN": "探索保留原有动作的视频风格转换。",
      "en": "Explore video style transfer while preserving movement."
    }
  },
  {
    "id": "earth-zoom-out",
    "label": {
      "zh-CN": "地球拉远",
      "en": "Earth Zoom Out"
    },
    "image": "/platform/directories/framekoi-earth-zoom-out.webp",
    "illustration": true,
    "referenceGuide": true,
    "description": {
      "zh-CN": "分镜与提示词资料页。专用生成尚未验证。",
      "en": "Storyboard and prompt guide. Dedicated generation is unverified."
    }
  }
];
export const workspaceImageTools: HomepageCard[] = [
  {
    "id": "nano-banana",
    "label": {
      "zh-CN": "Nano Banana Pro",
      "en": "Nano Banana Pro"
    },
    "image": "/platform/homepage/ce1f22c1b9c4246f.webp",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "change-eye-color",
    "label": {
      "zh-CN": "瞳色更换",
      "en": "Eye Color Changer"
    },
    "image": "/platform/directories/framekoi-eye-color-illustration.webp",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "illustration": true
  },
  {
    "id": "image-editor",
    "label": {
      "zh-CN": "AI图像编辑器",
      "en": "AI Image Editor"
    },
    "image": "/platform/homepage/a8bc681ced95882c.png",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "image-styler",
    "label": {
      "zh-CN": "图片风格转换",
      "en": "Image Style Converter"
    },
    "image": "/platform/directories/framekoi-image-style-illustration.webp",
    "illustration": true,
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "makeup",
    "label": {
      "zh-CN": "AI化妆",
      "en": "AI Makeup"
    },
    "image": "/platform/homepage/3073b9eda0b69456.jpg",
    "description": {
      "zh-CN": "",
      "en": ""
    }
  },
  {
    "id": "christmas-ai-photo-generator",
    "label": {
      "zh-CN": "AI 圣诞照片生成器",
      "en": "Christmas AI Photo Generator"
    },
    "image": "/platform/directories/framekoi-christmas-photo-illustration.webp",
    "description": {
      "zh-CN": "",
      "en": ""
    },
    "illustration": true
  }
];
export const homepageScenes = [
  {
    "label": {
      "zh-CN": "社交媒体",
      "en": "Social media"
    },
    "title": {
      "zh-CN": "社交媒体",
      "en": "Social media"
    },
    "description": {
      "zh-CN": "为 TikTok、Reels 和 Shorts 构思吸睛短片。通过人物、动作、镜头和节奏的公开示例寻找灵感，规划你自己的社交内容。",
      "en": "Explore eye-catching short video ideas for TikTok, Reels and Shorts."
    },
    "image": "/platform/homepage/a7d3d4ff0967f6f8.webp",
    "caption": {
      "zh-CN": "一个年轻人在城市小巷里低身蹲下，朝镜头用双手比出爱心形状。",
      "en": "Social media public reference example"
    }
  },
  {
    "label": {
      "zh-CN": "产品",
      "en": "Products"
    },
    "title": {
      "zh-CN": "产品与电商",
      "en": "Products"
    },
    "description": {
      "zh-CN": "用产品参考图探索背景、细节与动态展示。",
      "en": "Explore backgrounds, details and motion using product references."
    },
    "image": "/platform/homepage/3988da1e5438696b.webp",
    "caption": {
      "zh-CN": "一支黄色护肤品软管直立在阳光下的沙滩上，旁边是飞溅的海水和热带花朵。",
      "en": "Products public reference example"
    }
  },
  {
    "label": {
      "zh-CN": "广告",
      "en": "Advertising"
    },
    "title": {
      "zh-CN": "广告与活动",
      "en": "Advertising"
    },
    "description": {
      "zh-CN": "从创意提示词开始构思品牌活动与广告画面。",
      "en": "Develop campaign concepts and advertising visuals from a prompt."
    },
    "image": "/platform/homepage/253386c7a3ddbc57.webp",
    "caption": {
      "zh-CN": "奥利奥饼干穿过戏剧性的牛奶飞溅，液滴凝固在深色背景的半空中。",
      "en": "Advertising public reference example"
    }
  },
  {
    "label": {
      "zh-CN": "故事叙述",
      "en": "Storytelling"
    },
    "title": {
      "zh-CN": "故事叙述",
      "en": "Storytelling"
    },
    "description": {
      "zh-CN": "探索角色、镜头和情节，用画面表达你的故事。",
      "en": "Explore characters, shots and scenes to tell your story."
    },
    "image": "/platform/homepage/9d0f64ff71bcc12c.webp",
    "caption": {
      "zh-CN": "一个男人在狭窄厨房中倒挂下坠，背景里一名女性正伸手向他靠近。",
      "en": "Storytelling public reference example"
    }
  },
  {
    "label": {
      "zh-CN": "教育内容",
      "en": "Education"
    },
    "title": {
      "zh-CN": "教育内容",
      "en": "Education"
    },
    "description": {
      "zh-CN": "通过动画角色和示范画面解释你的想法。",
      "en": "Explain ideas through animated characters and visual demonstrations."
    },
    "image": "/platform/homepage/a1fbee8629ee8919.webp",
    "caption": {
      "zh-CN": "一个色彩鲜艳的卡通穴居人角色微笑着举起双手，置身俏皮的丛林漫画场景。",
      "en": "Education public reference example"
    }
  }
];
export const homepageCapabilities = [
  {
    "title": {
      "zh-CN": "控制镜头，而不只是提示词",
      "en": "Control the shot, beyond the prompt"
    },
    "description": {
      "zh-CN": "从公开参考视频中观察景别、角度、镜头运动和场景节奏。生成模式以视频工具面板为准。",
      "en": "Explore framing, angles, camera movement and pacing in public reference videos. Check the video tool for available generation modes."
    },
    "image": "/platform/homepage/33bda2cf01709537.jpg"
  },
  {
    "title": {
      "zh-CN": "让角色在每一帧都保持一致",
      "en": "Keep characters consistent"
    },
    "description": {
      "zh-CN": "探索角色从第一帧到最后一帧的连续性：观察面部特征、发型、服装与体型如何在不同镜头、角度和场景中保持一致。下方为公开参照，本项目尚未接通该生成能力。",
      "en": "Explore examples of character, wardrobe and visual continuity."
    },
    "image": "/platform/homepage/0afb703e855a2641.jpg"
  },
  {
    "title": {
      "zh-CN": "一体化图片与视频工作流",
      "en": "An image and video workflow"
    },
    "description": {
      "zh-CN": "了解首帧、尾帧与分镜参考图如何辅助视频构思，观察静态图片到动态画面的衔接方式。下方为公开参照，相关图片编辑与视频工具尚未开放生成。",
      "en": "Plan ideas using first frames, last frames and storyboards. Generation in these tools is not available yet."
    },
    "image": "/platform/homepage/9ee157674c347cda.jpg"
  },
  {
    "title": {
      "zh-CN": "模拟 AI 视频中的物理真实感",
      "en": "Explore realistic motion"
    },
    "description": {
      "zh-CN": "观察奔跑、跳跃、飞行与落地动作的公开示例，比较运动节奏、重心、平衡和场景之间的联系。这些是创作方向展示，本项目尚不提供相关生成。",
      "en": "Discover public examples of running, jumping, flight and landing."
    },
    "image": "/platform/homepage/510ccec3efdfd418.jpg"
  },
  {
    "title": {
      "zh-CN": "原生音频与音效",
      "en": "Audio and sound effects"
    },
    "description": {
      "zh-CN": "探索环境声、对白、音乐与画面配合的创作方向，了解声音如何营造空间、节奏和人物情绪。下方为公开静音视频预览，本项目尚不提供音频生成。",
      "en": "Explore how ambience and dialogue work with visuals. Audio generation is not currently available."
    },
    "image": "/platform/homepage/c02eca414fa1188c.jpg"
  }
];
export const communityExamples = [
  {
    "image": "/platform/homepage/be15d50d32172292.jpg",
    "id": "19"
  },
  {
    "image": "/platform/homepage/9501bc5100b513b8.jpg",
    "id": "20"
  },
  {
    "image": "/platform/homepage/dbb8f9795e27301a.jpg",
    "id": "21"
  },
  {
    "image": "/platform/homepage/267507596b458667.jpg",
    "id": "22"
  },
  {
    "image": "/platform/homepage/9be44f04eaa3e251.jpg",
    "id": "23"
  },
  {
    "image": "/platform/homepage/346b41f04010b16a.jpg",
    "id": "24"
  },
  {
    "image": "/platform/homepage/b1032a4b27248b59.jpg",
    "id": "25"
  },
  {
    "image": "/platform/homepage/5e200a7546913c20.jpg",
    "id": "26"
  },
  {
    "image": "/platform/homepage/b31ec11beeb20612.jpg",
    "id": "27"
  },
  {
    "image": "/platform/homepage/3c733be8af5f158f.jpg",
    "id": "28"
  },
  {
    "image": "/platform/homepage/1f4854531fdc0d7e.png",
    "id": "29"
  },
  {
    "image": "/platform/homepage/ac2c714b8eb78d2e.jpg",
    "id": "30"
  },
  {
    "image": "/platform/homepage/b9746124e63bae57.jpg",
    "id": "31"
  },
  {
    "image": "/platform/homepage/bbe379f934671735.jpg",
    "id": "32"
  },
  {
    "image": "/platform/homepage/c03444a47024720a.jpg",
    "id": "33"
  },
  {
    "image": "/platform/homepage/d23c0909f0d99192.jpg",
    "id": "34"
  },
  {
    "image": "/platform/homepage/c74b8610acf9a7d1.jpg",
    "id": "35"
  },
  {
    "image": "/platform/homepage/448f4bcadfb044b7.jpg",
    "id": "36"
  },
  {
    "image": "/platform/homepage/f305a4c2edda57fd.jpg",
    "id": "37"
  },
  {
    "image": "/platform/homepage/3df17d8da2b77be8.jpg",
    "id": "38"
  }
];

// 公开参照在各列数下的瀑布流顺序，保持素材及纵向节奏对应。
export const communityColumnOrder: Record<number, readonly (readonly string[])[]> = {
  "3": [
    [
      "19",
      "35",
      "20",
      "32",
      "25",
      "22",
      "29"
    ],
    [
      "23",
      "31",
      "28",
      "21",
      "38",
      "34"
    ],
    [
      "27",
      "30",
      "36",
      "24",
      "37",
      "33",
      "26"
    ]
  ],
  "4": [
    [
      "19",
      "36",
      "32",
      "21",
      "26"
    ],
    [
      "23",
      "28",
      "33",
      "29"
    ],
    [
      "27",
      "31",
      "24",
      "37",
      "22",
      "34"
    ],
    [
      "30",
      "35",
      "20",
      "25",
      "38"
    ]
  ],
  "5": [
    [
      "19",
      "20",
      "21",
      "22"
    ],
    [
      "23",
      "24",
      "25",
      "26"
    ],
    [
      "27",
      "28",
      "29"
    ],
    [
      "30",
      "31",
      "32",
      "33",
      "34"
    ],
    [
      "35",
      "36",
      "37",
      "38"
    ]
  ]
};
