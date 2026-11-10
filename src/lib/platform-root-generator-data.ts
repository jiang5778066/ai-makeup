import type { Locale } from "./i18n";

export type RootCopy = Readonly<Record<Locale, string>>;
export type RootVisual = { source: string; poster: string | null; width: number; height: number; displayRatio: string };
export type RootSection = { title: RootCopy; text: RootCopy; media: RootVisual };
export type RootGeneratorPage = {
  key: string; sourceUrl: string; title: RootCopy; cta: { label: RootCopy; href: string };
  faq: { question: RootCopy; answer: RootCopy }[];
  hero?: RootVisual; bullets?: RootCopy[]; subtitle?: RootCopy;
  cards?: RootSection[]; stepsTitle?: RootCopy; steps?: RootSection[];
  featuresTitle?: RootCopy; features?: RootSection[];
  meet?: { title: RootCopy; paragraphs: RootCopy[] };
};

// 准确公开正文与完整拟译；模型与原站服务主张由组件在对应段落邻近归因。
export const rootGeneratorPages = {
  "/cogvideox-video-generator": {
    "key": "cog",
    "sourceUrl": "https://www.lantaai.com/cogvideox-video-generator",
    "title": {
      "en": "CogVideoX AI Video Generator",
      "zh-CN": "CogVideoX AI 视频生成器"
    },
    "cta": {
      "label": {
        "en": "Try it now",
        "zh-CN": "立即试用"
      },
      "href": "/ai-video-generator?tab=image"
    },
    "faq": [],
    "hero": {
      "source": "https://cdn.lantaai.com/showcase/3ffa40bf-53d1-439c-9790-0713785e367b.mp4",
      "poster": "https://cdn.lantaai.com/showcase/3ffa40bf-53d1-439c-9790-0713785e367b.jpg",
      "width": 1344,
      "height": 768,
      "displayRatio": "1344 / 768"
    },
    "bullets": [
      {
        "en": "Create stunning AI videos from text and images",
        "zh-CN": "通过文字和图片创作精彩的 AI 视频"
      },
      {
        "en": "Smooth motion at 30 frames per second.",
        "zh-CN": "以每秒30帧呈现流畅运动。"
      },
      {
        "en": "Understand the scene, action, light, environment in the text.",
        "zh-CN": "理解文字中的场景、动作、光线与环境。"
      }
    ],
    "meet": {
      "title": {
        "en": "Meet CogVideoX: Revolutionizing AI Video Generation",
        "zh-CN": "认识 CogVideoX：革新 AI 视频生成"
      },
      "paragraphs": [
        {
          "en": "CogVideoX is an open-source AI model by THUDM (Tsinghua University) that turns text descriptions into high-quality, dynamic videos. With its massive architecture and billions of parameters, CogVideoX generates smooth, lifelike motion at 30 FPS, offering impressive video quality. It supports both text and image inputs, making it highly versatile for creators, developers, and researchers.",
          "zh-CN": "CogVideoX 是 THUDM（清华大学）推出的开源 AI 模型，可将文字描述转化为高质量动态视频。凭借庞大的架构和数十亿参数，CogVideoX 可生成30 FPS的流畅逼真运动，呈现出色的视频画质。它支持文字和图像输入，适合创作者、开发者与研究人员的多种用途。"
        },
        {
          "en": "Open-source under the Apache 2.0 license, CogVideoX is a powerful tool for transforming ideas into video content quickly and efficiently, with endless creative possibilities.",
          "zh-CN": "CogVideoX 按 Apache 2.0 许可证开源，可快速高效地将想法转化为视频内容，提供丰富的创作可能。"
        }
      ]
    }
  },
  "/hunyuan-video-lora": {
    "key": "lora",
    "sourceUrl": "https://www.lantaai.com/hunyuan-video-lora",
    "title": {
      "en": "Hunyuan LoRA Library",
      "zh-CN": "Hunyuan LoRA 素材库"
    },
    "cta": {
      "label": {
        "en": "Create with LORAs",
        "zh-CN": "使用 LoRA 创作"
      },
      "href": "/ai-video-generator"
    },
    "faq": [
      {
        "question": {
          "en": "What is the Hunyuan LoRA?",
          "zh-CN": "什么是 Hunyuan LoRA？"
        },
        "answer": {
          "en": "Hunyuan LoRA (Low-Rank Adaptation) is a collection of AI-powered models specifically designed for text-to-video or image-to-video generation using advanced machine learning techniques. These LoRA models allow users to apply various artistic and thematic styles—such as Studio Ghibli, anime, pixel art, and Makoto Shinkai—to their video creations. By fine-tuning pre-trained AI models, Hunyuan LoRA enables high-quality video transformations that are both visually stunning and easy to use, making it a powerful tool for creators and developers alike.",
          "zh-CN": "Hunyuan LoRA（低秩适配）是一组使用先进机器学习技术、面向文生视频或图生视频的 AI 模型。这些 LoRA 模型可为视频应用吉卜力工作室、动漫、像素艺术及新海诚等艺术与主题风格。通过微调预训练 AI 模型，Hunyuan LoRA 实现高质量且易用的视频转换，为创作者和开发者提供工具。"
        }
      },
      {
        "question": {
          "en": "What is the Hunyuan LoRA Library?",
          "zh-CN": "什么是 Hunyuan LoRA 素材库？"
        },
        "answer": {
          "en": "The Hunyuan LoRA Library is a curated collection of AI-powered LoRA models designed for video generation. These models allow creators to apply unique styles, such as Studio Ghibli, pixel art, anime, and Makoto Shinkai, to their video projects.",
          "zh-CN": "Hunyuan LoRA 素材库是一组精选的 AI 视频生成 LoRA 模型，创作者可将吉卜力工作室、像素艺术、动漫及新海诚等独特风格用于视频项目。"
        }
      },
      {
        "question": {
          "en": "How can I use the LoRA models on this website?",
          "zh-CN": "如何使用此网站上的 LoRA 模型？"
        },
        "answer": {
          "en": "You can easily use the LoRA models by clicking the ‘Create with LoRA’ button on the desired style. And select the Hunyuan LoRA when generating the video",
          "zh-CN": "在所需风格上点击“使用此 LoRA 创作”，然后在生成视频时选择 Hunyuan LoRA。"
        }
      },
      {
        "question": {
          "en": "What video styles are available in the Hunyuan LoRA Library?",
          "zh-CN": "Hunyuan LoRA 素材库有哪些视频风格？"
        },
        "answer": {
          "en": "Our library includes popular styles such as: 1.Studio Ghibli Style: Classic animation visuals inspired by Ghibli films. 2.Pixelated Retro Style: Nostalgic 8-bit and 16-bit pixel art. 3.Makoto Shinkai Style: High-quality, vibrant visuals inspired by the works of Makoto Shinkai. 4.AnimeShots Style: Bright and colorful anime-inspired motions.",
          "zh-CN": "素材库包含：1.吉卜力工作室风格：受吉卜力电影启发的经典动画视觉。2.复古像素风格：怀旧的8位与16位像素艺术。3.新海诚风格：受新海诚作品启发的高质量鲜明视觉。4.AnimeShots风格：明亮丰富的动漫运动画面。"
        }
      },
      {
        "question": {
          "en": "Do LORAs cost extra credits?",
          "zh-CN": "LoRA 会额外消耗积分吗？"
        },
        "answer": {
          "en": "No, using LORAs doesn't require additional credits. You can use them with your regular video generations at no extra cost.",
          "zh-CN": "不会。参照站称使用 LoRA 无需额外积分，可在常规视频生成中使用而不增加费用。"
        }
      }
    ],
    "subtitle": {
      "en": "Explore a curated collection of Hunyuan Video LoRA models to bring your creative visions to life!",
      "zh-CN": "探索精选 Hunyuan Video LoRA 模型，让创意构想成为现实！"
    },
    "cards": [
      {
        "title": {
          "en": "AnimeShots",
          "zh-CN": "AnimeShots"
        },
        "text": {
          "en": "An anime-style lora trained on anime screencaps and illustrations, aimed to create vibrant, bright and colorful anime style motions.",
          "zh-CN": "使用动画截图和插画训练的动漫风格 LoRA，旨在生成生动、明亮且色彩丰富的动漫运动画面。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/lora/50683b9f-4f1c-464e-90ab-25c410408f1a.mp4",
          "poster": "https://cdn.lantaai.com/resources/lora/50683b9f-4f1c-464e-90ab-25c410408f1a.jpg",
          "width": 960,
          "height": 544,
          "displayRatio": "16 / 9"
        }
      },
      {
        "title": {
          "en": "Ghibli",
          "zh-CN": "Ghibli"
        },
        "text": {
          "en": "Studio Ghibli Style Lora for Hunyuan Video. Experience classic Ghibli animation visuals!",
          "zh-CN": "适用于 Hunyuan Video 的吉卜力工作室风格 LoRA，体验经典吉卜力动画视觉效果！"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/lora/38776942-fe5f-4aa7-8da8-9483bfae542b.mp4",
          "poster": "https://cdn.lantaai.com/resources/lora/38776942-fe5f-4aa7-8da8-9483bfae542b.jpg",
          "width": 848,
          "height": 480,
          "displayRatio": "16 / 9"
        }
      },
      {
        "title": {
          "en": "Pixelated retro",
          "zh-CN": "复古像素"
        },
        "text": {
          "en": "Relive the charm of classic pixel art!",
          "zh-CN": "重温经典像素艺术的魅力！"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/lora/626d2099-37b4-4845-aacd-5c14928af6ee.mp4",
          "poster": "https://cdn.lantaai.com/resources/lora/626d2099-37b4-4845-aacd-5c14928af6ee.jpg",
          "width": 832,
          "height": 624,
          "displayRatio": "16 / 9"
        }
      },
      {
        "title": {
          "en": "Makoto Shinkai",
          "zh-CN": "Makoto Shinkai"
        },
        "text": {
          "en": "Makoto Shinkai Style Lora for Hunyuan Video. Experience classic Makoto Shinkai animation visuals!",
          "zh-CN": "适用于 Hunyuan Video 的新海诚风格 LoRA，体验经典新海诚动画视觉效果！"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/lora/afad525d-d316-41dc-8a67-00d06a1e7f2d.mp4",
          "poster": "https://cdn.lantaai.com/resources/lora/afad525d-d316-41dc-8a67-00d06a1e7f2d.jpg",
          "width": 832,
          "height": 624,
          "displayRatio": "16 / 9"
        }
      },
      {
        "title": {
          "en": "Rem (Re:Zero)",
          "zh-CN": "蕾姆（Re:Zero）"
        },
        "text": {
          "en": "This lora depicts the character Rem from Re:Zero.",
          "zh-CN": "此 LoRA 描绘《Re:Zero》中的蕾姆。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/lora/8442b1cd-986a-45ab-9961-bdd2d9085bc7.mp4",
          "poster": "https://cdn.lantaai.com/resources/lora/8442b1cd-986a-45ab-9961-bdd2d9085bc7.jpg",
          "width": 832,
          "height": 624,
          "displayRatio": "16 / 9"
        }
      },
      {
        "title": {
          "en": "Walking Animation",
          "zh-CN": "行走动画"
        },
        "text": {
          "en": "Specifically trained to generate walking animations for characters, suitable for various characters and subjects.",
          "zh-CN": "专门训练用于生成人物行走动画，适合不同角色与主体。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/lora/0e3c9369-a6e2-47e4-99c2-069af847edbc.mp4",
          "poster": "https://cdn.lantaai.com/resources/lora/0e3c9369-a6e2-47e4-99c2-069af847edbc.jpg",
          "width": 832,
          "height": 624,
          "displayRatio": "16 / 9"
        }
      },
      {
        "title": {
          "en": "This Is Fine",
          "zh-CN": "This Is Fine"
        },
        "text": {
          "en": "Add iconic internet humor to your video creations! This Lora integrates the classic \"This Is Fine\" scene into your videos.",
          "zh-CN": "为视频创作加入标志性网络幽默！此 LoRA 将经典的“This Is Fine”场景融入视频。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/lora/404c22bc-5f29-4f2d-ae18-804cdbcd6ca7.mp4",
          "poster": "https://cdn.lantaai.com/resources/lora/404c22bc-5f29-4f2d-ae18-804cdbcd6ca7.jpg",
          "width": 450,
          "height": 338,
          "displayRatio": "16 / 9"
        }
      },
      {
        "title": {
          "en": "Detailed Skin",
          "zh-CN": "细腻皮肤"
        },
        "text": {
          "en": "Add refined portrait details to your videos, showcasing clear pores, hair strands, and skin texture!",
          "zh-CN": "为视频增添精细的人像细节，展现清晰的毛孔、发丝和皮肤纹理！"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/lora/e1a791a1-cf7f-4b65-8279-3422f58b34cc.mp4",
          "poster": "https://cdn.lantaai.com/resources/lora/e1a791a1-cf7f-4b65-8279-3422f58b34cc.jpg",
          "width": 832,
          "height": 624,
          "displayRatio": "16 / 9"
        }
      }
    ],
    "stepsTitle": {
      "en": "How to use Hunyuan LoRA",
      "zh-CN": "如何使用 Hunyuan LoRA"
    },
    "steps": [
      {
        "title": {
          "en": "Step 1",
          "zh-CN": "步骤1"
        },
        "text": {
          "en": "Type your prompt to describe the video.",
          "zh-CN": "输入提示词，描述所需视频。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/61701d0e-4c8a-4793-9e56-82e3bd3c6c7c.png",
          "poster": null,
          "width": 600,
          "height": 448,
          "displayRatio": "4 / 3"
        }
      },
      {
        "title": {
          "en": "Step 2",
          "zh-CN": "步骤2"
        },
        "text": {
          "en": "Adjust the HunYuan Video model, and then Choose the LoRA.",
          "zh-CN": "调整 HunYuan Video 模型，然后选择 LoRA。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/a87cf9e8-0fd5-43c1-a726-b14f909f4ee0.png",
          "poster": null,
          "width": 680,
          "height": 510,
          "displayRatio": "4 / 3"
        }
      },
      {
        "title": {
          "en": "Step 3",
          "zh-CN": "步骤3"
        },
        "text": {
          "en": "Click \"Generate\" to create and preview your video instantly.",
          "zh-CN": "点击“生成”，即可创建并即时预览视频。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/lora/626d2099-37b4-4845-aacd-5c14928af6ee.mp4",
          "poster": "https://cdn.lantaai.com/resources/lora/626d2099-37b4-4845-aacd-5c14928af6ee.jpg",
          "width": 832,
          "height": 624,
          "displayRatio": "4 / 3"
        }
      }
    ]
  },
  "/hunyuanvideo-generator": {
    "key": "hunyuan",
    "sourceUrl": "https://www.lantaai.com/hunyuanvideo-generator",
    "title": {
      "en": "Hunyuan Video AI Video Generator",
      "zh-CN": "Hunyuan Video AI 视频生成器"
    },
    "cta": {
      "label": {
        "en": "Generate Video",
        "zh-CN": "生成视频"
      },
      "href": "/ai-video-generator"
    },
    "faq": [
      {
        "question": {
          "en": "What is HunyuanVideo and how does it work?",
          "zh-CN": "HunyuanVideo 是什么，如何工作？"
        },
        "answer": {
          "en": "HunyuanVideo is an advanced AI-powered video generation framework developed by Tencent. It uses cutting-edge deep learning models to convert text, images, and other media into high-quality videos in real-time. By leveraging AI, HunyuanVideo offers seamless video editing and enhancement capabilities for developers and businesses looking to integrate smart video features into their applications.",
          "zh-CN": "HunyuanVideo 是腾讯开发的先进 AI 视频生成框架，使用深度学习将文字、图片及其它媒体实时转为高质量视频，并提供视频编辑和增强功能，面向希望在应用中集成智能视频能力的开发者与企业。"
        }
      },
      {
        "question": {
          "en": "How can I use HunyuanVideo to create videos?",
          "zh-CN": "如何使用 HunyuanVideo 创建视频？"
        },
        "answer": {
          "en": "To create videos with HunyuanVideo, simply upload your content, such as text or images, and our platform will generate professional-grade videos for you. The AI engine processes your inputs in real-time and creates dynamic, engaging video content that meets your specific needs. Our platform is designed to be user-friendly, even for beginners!",
          "zh-CN": "参照站说明可上传文字或图片等内容，由其平台生成专业级视频。AI 引擎实时处理输入，生成符合需求的动态视频；平台旨在让初学者也易于使用。"
        }
      },
      {
        "question": {
          "en": "Is HunyuanVideo suitable for businesses and developers?",
          "zh-CN": "HunyuanVideo 适合企业和开发者吗？"
        },
        "answer": {
          "en": "Yes, HunyuanVideo is designed for both businesses and developers. Whether you’re creating marketing videos, educational content, or social media posts, HunyuanVideo provides an easy-to-use platform for generating high-quality videos. It’s a great solution for enhancing video production workflows with AI-driven automation.",
          "zh-CN": "适合。无论制作营销、教育还是社交媒体视频，HunyuanVideo 都提供易用的视频生成平台，以 AI 自动化增强视频制作流程。"
        }
      },
      {
        "question": {
          "en": "How does HunyuanVideo compare to other video generation tools?",
          "zh-CN": "HunyuanVideo 与其它视频生成工具相比如何？"
        },
        "answer": {
          "en": "HunyuanVideo stands out due to its advanced AI technology, offering real-time video generation and AI-driven video enhancements. Unlike other video tools, HunyuanVideo offers deep learning models that can generate videos from text or images, making it a more versatile and intelligent solution for content creation. It also supports high-performance video rendering for professional-grade results.",
          "zh-CN": "参照站强调其先进 AI 技术、实时视频生成和 AI 视频增强；深度学习模型可从文字或图片生成视频，并支持面向专业效果的高性能视频渲染。"
        }
      },
      {
        "question": {
          "en": "How secure is my data when using HunyuanVideo?",
          "zh-CN": "使用 HunyuanVideo 时数据有多安全？"
        },
        "answer": {
          "en": "We take privacy and security seriously. All data uploaded to our platform is encrypted and securely stored. We also ensure that your content is processed in compliance with industry best practices, so you can trust that your videos and information are safe.",
          "zh-CN": "参照站声称重视隐私和安全，上传至其平台的数据会加密并安全存储，内容处理遵循行业最佳实践。这是 Lanta AI 的声明，尚未由本项目验证，也不是本项目存储或安全承诺。"
        }
      }
    ],
    "hero": {
      "source": "https://cdn.lantaai.com/showcase/c35d51c4-2dbd-4740-8801-d4e1695cf39f.mp4",
      "poster": "https://cdn.lantaai.com/showcase/c35d51c4-2dbd-4740-8801-d4e1695cf39f.jpg",
      "width": 1280,
      "height": 720,
      "displayRatio": "1280 / 720"
    },
    "bullets": [
      {
        "en": "Transform your words into stunning AI-generated videos.",
        "zh-CN": "将文字转化为精彩的 AI 视频。"
      },
      {
        "en": "Enjoy seamless, cinematic motion at 30 frames per second.",
        "zh-CN": "以每秒30帧享受连贯、具有电影感的运动。"
      },
      {
        "en": "Capture the perfect scene, action, and lighting.",
        "zh-CN": "捕捉理想的场景、动作与光线。"
      }
    ],
    "meet": {
      "title": {
        "en": "Meet Hunyuan Video: Pioneering AI-Driven Video Creation",
        "zh-CN": "认识 Hunyuan Video：开创 AI 驱动的视频创作"
      },
      "paragraphs": [
        {
          "en": "Hunyuan Video, developed by Tencent, is an advanced open-source video processing framework designed for building high-quality video applications with AI-driven enhancements. Available on GitHub at Hunyuan Video, this powerful library leverages deep learning technologies to enable real-time video generation, editing, and enhancement, making it an ideal solution for developers looking to integrate intelligent video capabilities into their apps.",
          "zh-CN": "Hunyuan Video 由腾讯开发，是先进的开源视频处理框架，借助 AI 增强构建高质量视频应用。该项目可在 GitHub 的 Hunyuan Video 获取，利用深度学习实现实时视频生成、编辑与增强，面向希望在应用中集成智能视频能力的开发者。"
        },
        {
          "en": "Key features of Hunyuan Video include real-time video generation based on text, image-to-video transformation, and other AI-powered tools for video editing. It is highly scalable, supporting high-performance video processing with flexible APIs and various pre-built models. Whether you're building a video platform, a multimedia app, or an AI-enhanced video service, Hunyuan Video provides a comprehensive toolkit for seamless video production.",
          "zh-CN": "Hunyuan Video 的主要功能包括根据文字实时生成视频、图像转视频，以及其它 AI 视频编辑工具。它具备可扩展性，支持高性能视频处理、灵活的 API 和多种预训练模型。无论构建视频平台、多媒体应用还是 AI 增强视频服务，它都提供一套完整的视频制作工具。"
        },
        {
          "en": "Hunyuan Video is a game-changer for anyone developing applications that require cutting-edge video capabilities, combining Tencent's expertise in AI with the flexibility of open-source development.",
          "zh-CN": "Hunyuan Video 结合腾讯的 AI 经验与开源开发的灵活性，为需要先进视频能力的应用开发者提供新工具。"
        }
      ]
    },
    "stepsTitle": {
      "en": "How to use Hunyuan Video Generator by Lanta AI",
      "zh-CN": "如何使用 Lanta AI 的 Hunyuan Video 生成器"
    },
    "steps": [
      {
        "title": {
          "en": "Step 1",
          "zh-CN": "步骤1"
        },
        "text": {
          "en": "Type your prompt to describe the video.",
          "zh-CN": "输入提示词，描述所需视频。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/a99412bc-6443-4f20-9b75-7650b811a7bd.jpg",
          "poster": null,
          "width": 592,
          "height": 444,
          "displayRatio": "592 / 444"
        }
      },
      {
        "title": {
          "en": "Step 2",
          "zh-CN": "步骤2"
        },
        "text": {
          "en": "Adjust the model, duration, ratio, and motion settings.",
          "zh-CN": "调整模型、时长、比例与运动设置。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/resources/32d0e18a-0dd6-4cd0-bcf6-faaf3c531ff3.jpg",
          "poster": null,
          "width": 904,
          "height": 678,
          "displayRatio": "904 / 678"
        }
      },
      {
        "title": {
          "en": "Step 3",
          "zh-CN": "步骤3"
        },
        "text": {
          "en": "Click \"Generate\" to create and preview your video instantly.",
          "zh-CN": "点击“生成”，即可创建并即时预览视频。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/showcase/c7daea9e-271b-4c27-823d-25fa3a45e6e8.jpg",
          "poster": null,
          "width": 1344,
          "height": 768,
          "displayRatio": "1344 / 768"
        }
      }
    ],
    "featuresTitle": {
      "en": "Hunyuan Video Generator Features",
      "zh-CN": "Hunyuan Video 生成器功能"
    },
    "features": [
      {
        "title": {
          "en": "Unmatched visual quality",
          "zh-CN": "出众的视觉质量"
        },
        "text": {
          "en": "Achieve stunning picture quality with Hunyuan Video, offering hyperrealistic visuals that effortlessly transition between real and virtual worlds.",
          "zh-CN": "Hunyuan Video 提供令人惊叹的画质，以超写实视觉效果在现实与虚拟世界间自然过渡。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00001.mp4",
          "poster": "https://cdn.lantaai.com/showcase/HunyuanVideo_00001.jpg",
          "width": 1280,
          "height": 720,
          "displayRatio": "1280 / 720"
        }
      },
      {
        "title": {
          "en": "Fluid movement",
          "zh-CN": "流畅运动"
        },
        "text": {
          "en": "Overcoming the constraints of dynamic visuals, Hunyuan Video flawlessly captures the fluidity and continuity of every action.",
          "zh-CN": "突破动态视觉的限制，Hunyuan Video 捕捉每个动作的流畅性与连续性。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00002.mp4",
          "poster": "https://cdn.lantaai.com/showcase/HunyuanVideo_00002.jpg",
          "width": 960,
          "height": 544,
          "displayRatio": "960 / 544"
        }
      },
      {
        "title": {
          "en": "Uninterrupted motion",
          "zh-CN": "连续不断的动作"
        },
        "text": {
          "en": "Vivid semantic depth, with sequential actions seamlessly unfolding to completion.",
          "zh-CN": "丰富的语义深度，让连续动作顺畅展开直至完成。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00003.mp4",
          "poster": "https://cdn.lantaai.com/showcase/HunyuanVideo_00003.jpg",
          "width": 960,
          "height": 544,
          "displayRatio": "960 / 544"
        }
      },
      {
        "title": {
          "en": "Visual artistry",
          "zh-CN": "视觉艺术表现"
        },
        "text": {
          "en": "Move beyond a single lens, achieving seamless, director-level cinematography.",
          "zh-CN": "突破单一镜头，实现流畅的导演级电影摄影。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00004.mp4",
          "poster": "https://cdn.lantaai.com/showcase/HunyuanVideo_00004.jpg",
          "width": 960,
          "height": 544,
          "displayRatio": "960 / 544"
        }
      },
      {
        "title": {
          "en": "Concept generalization",
          "zh-CN": "概念泛化"
        },
        "text": {
          "en": "With the most realistic effect, show the most fantastic scene.",
          "zh-CN": "以逼真效果呈现奇幻场景。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00005.mp4",
          "poster": "https://cdn.lantaai.com/showcase/HunyuanVideo_00005.jpg",
          "width": 960,
          "height": 544,
          "displayRatio": "960 / 544"
        }
      },
      {
        "title": {
          "en": "Generalized understanding",
          "zh-CN": "泛化理解"
        },
        "text": {
          "en": "Showcasing the most breathtaking scenes with unparalleled realism.",
          "zh-CN": "以出色的真实感呈现令人惊叹的场景。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00006.mp4",
          "poster": "https://cdn.lantaai.com/showcase/HunyuanVideo_00006.jpg",
          "width": 1280,
          "height": 720,
          "displayRatio": "1280 / 720"
        }
      },
      {
        "title": {
          "en": "Alignment with physical laws",
          "zh-CN": "符合物理规律"
        },
        "text": {
          "en": "The motion adheres to physical laws.",
          "zh-CN": "运动遵循物理规律。"
        },
        "media": {
          "source": "https://cdn.lantaai.com/showcase/HunyuanVideo_00007.mp4",
          "poster": "https://cdn.lantaai.com/showcase/HunyuanVideo_00007.jpg",
          "width": 1280,
          "height": 720,
          "displayRatio": "1280 / 720"
        }
      }
    ]
  },
  "/mochi1-video-generator": {
    "key": "mochi",
    "sourceUrl": "https://www.lantaai.com/mochi1-video-generator",
    "title": {
      "en": "Mochi 1 AI Video Generator",
      "zh-CN": "Mochi 1 AI 视频生成器"
    },
    "cta": {
      "label": {
        "en": "Try it now",
        "zh-CN": "立即试用"
      },
      "href": "/ai-video-generator?tab=text&model=102"
    },
    "faq": [],
    "hero": {
      "source": "https://cdn.lantaai.com/showcase/964f9de2-715c-4087-bd08-dfe86d7bbc85.mp4",
      "poster": "https://cdn.lantaai.com/showcase/964f9de2-715c-4087-bd08-dfe86d7bbc85.jpg",
      "width": 856,
      "height": 480,
      "displayRatio": "856 / 480"
    },
    "bullets": [
      {
        "en": "Creates stunning high-quality videos from simple text prompts.",
        "zh-CN": "通过简单文字提示词创作高质量视频。"
      },
      {
        "en": "Mochi 1 features a massive 10 billion parameter architecture.",
        "zh-CN": "Mochi 1 具有100亿参数的大型架构。"
      },
      {
        "en": "Mochi 1 delivers smooth and realistic motion at 30 FPS.",
        "zh-CN": "Mochi 1 以30 FPS呈现流畅逼真的运动。"
      }
    ],
    "meet": {
      "title": {
        "en": "Meet Mochi 1: The Future of AI-Driven Video Generation",
        "zh-CN": "认识 Mochi 1：AI 驱动视频生成的未来"
      },
      "paragraphs": [
        {
          "en": "Mochi 1 is a revolutionary open-source AI model that is transforming the landscape of video generation. Far beyond just another tool, it is a powerhouse capable of turning simple text prompts into breathtaking, high-quality videos.",
          "zh-CN": "Mochi 1 是一种创新的开源 AI 模型，正在改变视频生成领域。它不仅是一款工具，还能将简单文字提示词转化为高质量视频。"
        },
        {
          "en": "Boasting a robust architecture with 10 billion parameters, Mochi 1 delivers fluid, realistic motion at an impressive 30 frames per second, bringing your creative visions to life in mere seconds. It's like having an entire professional video production team at your fingertips.",
          "zh-CN": "Mochi 1 采用100亿参数的架构，以每秒30帧呈现流畅逼真的运动，让创意构想在数秒内成形，仿佛专业视频制作团队随时可用。"
        },
        {
          "en": "Whether you're a researcher exploring the cutting edge of AI, a developer building the next breakthrough app, or a creative seeking new ways to express your ideas, Mochi 1 offers the versatility and power you need. Best of all, it's open-source under the Apache 2.0 license, empowering the global community to innovate and collaborate.",
          "zh-CN": "无论是探索 AI 前沿的研究人员、开发下一款应用的开发者，还是寻找新表达方式的创作者，Mochi 1 都提供多用途能力。它按 Apache 2.0 许可证开源，支持全球社区创新与协作。"
        }
      ]
    }
  }
} satisfies Record<string, RootGeneratorPage>;

export type RootGeneratorPath = keyof typeof rootGeneratorPages;
export function isRootGeneratorPath(path: string): path is RootGeneratorPath {
  return Object.prototype.hasOwnProperty.call(rootGeneratorPages, path);
}
