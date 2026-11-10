// 公开参照正文按页面族保存；能力段落为外部模型资料，不能视作本项目provider承诺。
export type GeneratorContentCard={title:string;description:string;bullets:string[];image:string;video:string;prompt:string;source:string;href:string;badge?:string;caption?:string;captionDescription?:string;emphasis?:string[]};
export type GeneratorContentSection={title:string;description:string;cards:GeneratorContentCard[];images:{src:string;alt:string}[];table:string[][];tabs:string[];videos:string[]};
export const generatorContent:Record<"image"|"gpt"|"nano"|"video",Record<"en"|"zh-CN",GeneratorContentSection[]>>={
  "image": {
    "en": [
      {
        "title": "AI Image Generator Examples",
        "description": "Public model reference examples across portraits, fantasy scenes, cartoons and posters. These are separate from project generations and user creations.",
        "cards": [],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/7c65880a-9ed8-432d-ab34-81b3ffeb5167.webp",
            "alt": ""
          },
          {
            "src": "https://cdn.lantaai.com/resources/5b4fd341-902b-451a-9ee0-bdf9b691c993/v1/5d258b7b-c74d-482a-852c-5080ebd111b1/w1440.webp",
            "alt": ""
          },
          {
            "src": "https://cdn.lantaai.com/images/3f93cd2a-8834-4664-a984-f584319d71e9.jpg",
            "alt": ""
          },
          {
            "src": "https://cdn.lantaai.com/resources/12516bfd-4128-4e9e-82ba-36787b627b8d.webp",
            "alt": ""
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "AI Image Generator Core Advantages",
        "description": "Explore model choices, settings and prompt ideas. Image generation is not connected here; existing AI Makeup follows actual account rules.",
        "cards": [
          {
            "title": "Advanced Model Lineup",
            "description": "Browse public settings for models including Nano Banana Pro, Flux 2 and Z Image. The lineup describes parameter previews; generation services are not connected.",
            "bullets": [
              "Nano Banana Pro settings",
              "Flux 2 settings",
              "Z Image settings"
            ],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Parameter Preview & Availability",
            "description": "Choose a model, adjust parameters, and preview local images. Image generation is not available yet; AI Makeup continues to use your actual account credits.",
            "bullets": [
              "Local preview uses no credits",
              "Generation is not available",
              "Existing AI Makeup account credits"
            ],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Prompt Inspiration From Community Works",
            "description": "Study prompt structure, styles and composition in the public examples shown here. They are separate from a project community or user gallery.",
            "bullets": [
              "Public image references",
              "Prompt structure ideas",
              "Local parameter exploration"
            ],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "How to Use the  AI Image Generator",
        "description": "Explore the public workflow from choosing a model to writing a prompt and reviewing settings. This page offers local previews only.",
        "cards": [
          {
            "title": "Enter Your Prompt or Upload Photo",
            "description": "Describe the image you want to create using natural language, or upload an existing photo for the image to image AI transformation on Lanta AI. The AI image generator on Lanta AI understands detailed descriptions and creative concepts.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "AI Processing & Generation",
            "description": "Choose a model and settings, then check your prompt and references. This page previews parameters locally and does not send a generation task.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Explore Public Examples",
            "description": "Browse and download attributed public examples. They are not project generations or your account creations. A real generation workflow is not connected yet.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Who Uses Lanta AI's  AI Image Generator?",
        "description": "Common applications described in public model information, for creative planning. They do not establish generation capabilities in this project.",
        "cards": [
          {
            "title": "Social Media Content",
            "description": "Create eye-catching visuals for Instagram, TikTok, Facebook, and other platforms. The AI image generator on Lanta AI helps content creators produce unique, engaging posts that stand out in crowded feeds.\nSocial media graphics, AI content creation",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/abb2b8a3-524e-4c23-8158-163bd1712d74/v1/63eeab08-0ce0-4fd2-8aa2-ef3f9abe3e41/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Marketing & Advertising",
            "description": "Generate professional marketing materials, ad creatives, and promotional images. Use the realistic AI image generator on Lanta AI to create compelling visuals that drive engagement and conversions.\nMarketing visuals, Ad creative generation",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ff5f5ed6-fd06-4c3d-8f57-d7fa441ba4c7/v1/a87b36f5-1796-43e8-81f7-e6d591c25715/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "E-commerce Product Images",
            "description": "Transform product photos or create AI image from photo references for your online store. Generate lifestyle shots, variations, and promotional imagery without expensive photoshoots.\nProduct photography, E-commerce visuals",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/06134395-c121-469f-82cf-714fa019a064/v1/2cb0889b-0b4b-4ac4-bd90-32a9c829c851/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Digital Art & Illustration",
            "description": "Explore your artistic vision with the AI image maker on Lanta AI. Create unique digital art, illustrations, concept art, and creative projects. From anime to oil painting styles, the possibilities are endless.\nDigital art, AI illustration",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/9f7450a4-96d8-478d-a655-70a96cae5130/v1/f9d8fd8a-db08-48b8-8e6e-24e0463949fa/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Game & App Development",
            "description": "Public model use cases include game concepts, characters, backgrounds and application visuals.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/2fcee5f5-a661-4df4-9522-31473072c60a/v1/57b2087b-1c51-4a6a-ba28-134c3ac838a4/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Personal & Fun Projects",
            "description": "Create personalized gifts, custom avatars, unique wallpapers, and fun projects. Turn your imagination into reality with the AI cartoon image generator on Lanta AI and creative tools.\nPersonal projects, Custom creations",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/203dfb5e-7df8-4c3a-8691-7c47d4eaa9f7/v1/01475246-4ffb-475a-9105-141f8bcff0b3/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/abb2b8a3-524e-4c23-8158-163bd1712d74/v1/63eeab08-0ce0-4fd2-8aa2-ef3f9abe3e41/w1440.webp",
            "alt": "Social Media Content"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ff5f5ed6-fd06-4c3d-8f57-d7fa441ba4c7/v1/a87b36f5-1796-43e8-81f7-e6d591c25715/w1440.webp",
            "alt": "Marketing & Advertising"
          },
          {
            "src": "https://cdn.lantaai.com/resources/06134395-c121-469f-82cf-714fa019a064/v1/2cb0889b-0b4b-4ac4-bd90-32a9c829c851/w1440.webp",
            "alt": "E-commerce Product Images"
          },
          {
            "src": "https://cdn.lantaai.com/resources/9f7450a4-96d8-478d-a655-70a96cae5130/v1/f9d8fd8a-db08-48b8-8e6e-24e0463949fa/w1440.webp",
            "alt": "Digital Art & Illustration"
          },
          {
            "src": "https://cdn.lantaai.com/resources/2fcee5f5-a661-4df4-9522-31473072c60a/v1/57b2087b-1c51-4a6a-ba28-134c3ac838a4/w1440.webp",
            "alt": "Game & App Development"
          },
          {
            "src": "https://cdn.lantaai.com/resources/203dfb5e-7df8-4c3a-8691-7c47d4eaa9f7/v1/01475246-4ffb-475a-9105-141f8bcff0b3/w1440.webp",
            "alt": "Personal & Fun Projects"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Frequently Asked Questions About  AI Image Generator",
        "description": "Learn about public model information and the scope of this page. Generation is unavailable and local files are not uploaded.",
        "cards": [
          {
            "title": "What is an AI image generator and how does it work?",
            "description": "Public model information: An AI image generator is a sophisticated machine learning system that creates images from text descriptions or transforms existing photos. The AI image generator on Lanta AI uses advanced neural networks trained on millions of images to understand visual concepts and generate new, unique images based on your input. When you enter a text prompt, the AI interprets your description and creates a corresponding image pixel by pixel, resulting in professional-quality visuals in seconds. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Is your AI image generator really free to use?",
            "description": "This model’s generation is not available in this project. No free quota, generation speed, or commercial image rights are promised here. Local previews use no credits; existing AI Makeup follows its actual account rules.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "What types of images can I create with your AI image maker?",
            "description": "Public model information: The AI image maker on Lanta AI supports an incredible variety of styles and subjects. You can create realistic AI images including portraits, landscapes, and product photos. The AI cartoon image generator on Lanta AI produces anime, comic, and illustration styles. You can also generate abstract art, fantasy scenes, 3D renders, oil paintings, watercolors, and much more. The text to image AI understands complex prompts, allowing you to create virtually any visual you can imagine. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "How do I get the best results from the AI image generator?",
            "description": "Public model information: For optimal results on Lanta AI, use detailed, specific prompts. Instead of 'a dog', try 'a golden retriever puppy playing in autumn leaves, warm sunlight, professional photography'. Include style references like 'realistic', 'cartoon', 'oil painting', or 'anime'. Mention lighting, mood, camera angle, and artistic influences. The best free AI image generator on Lanta AI responds well to descriptive language and artistic direction. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Can I use the image to image AI feature to transform my photos?",
            "description": "Public model information: Absolutely! The image to image AI feature on Lanta AI lets you upload existing photos and transform them into different styles. You can create AI image from photo references, turning portraits into cartoon characters, landscapes into paintings, or product photos into stylized graphics. This feature is perfect for creating variations, applying artistic filters, or reimagining your existing visual content. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "What's the difference between text to image AI and image to image AI?",
            "description": "Public model information: Text to image AI creates entirely new images from written descriptions-you type what you want, and the AI generates it from scratch. Image to image AI takes an existing photo as a starting point and transforms it based on your instructions. Both features use the AI image generator technology on Lanta AI, but they serve different creative purposes. Text to image is ideal for new concepts, while image to image excels at style transfer and photo enhancement. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Are the AI-generated images I create mine to use commercially?",
            "description": "This model’s generation is not available in this project. No free quota, generation speed, or commercial image rights are promised here. Local previews use no credits; existing AI Makeup follows its actual account rules.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "How does your realistic AI image generator compare to others?",
            "description": "Public realism references discuss detail, anatomy and lighting. This project has not verified output quality or connected model generation.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Start Creating with Our AI Image Generator Today",
        "description": "",
        "cards": [],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      }
    ],
    "zh-CN": [
      {
        "title": "AI 图片生成器 示例",
        "description": "以下为公开模型参照示例，展示人像、幻想场景、卡通与海报等视觉方向。不是本项目生成或用户作品。",
        "cards": [],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/7c65880a-9ed8-432d-ab34-81b3ffeb5167.webp",
            "alt": ""
          },
          {
            "src": "https://cdn.lantaai.com/resources/5b4fd341-902b-451a-9ee0-bdf9b691c993/v1/5d258b7b-c74d-482a-852c-5080ebd111b1/w1440.webp",
            "alt": ""
          },
          {
            "src": "https://cdn.lantaai.com/images/3f93cd2a-8834-4664-a984-f584319d71e9.jpg",
            "alt": ""
          },
          {
            "src": "https://cdn.lantaai.com/resources/12516bfd-4128-4e9e-82ba-36787b627b8d.webp",
            "alt": ""
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "AI 图片生成器 核心优势",
        "description": "浏览不同模型、参数与提示词思路。本项目图片生成尚未开放，现有美妆服务继续按真实账户规则运行。",
        "cards": [
          {
            "title": "先进模型矩阵",
            "description": "浏览 Nano Banana Pro、Flux 2 和 Z Image 等公开模型的参数。模型列表只表示可预览的界面，尚未连接生成服务。",
            "bullets": [
              "Nano Banana Pro 参数",
              "Flux 2 参数",
              "Z Image 参数"
            ],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "参数预览与真实可用边界",
            "description": "你可以在此选择模型、调整参数和预览本地图片。图片生成服务尚未开放；已有 AI 美妆继续使用账户实际额度。",
            "bullets": [
              "本地预览不扣额度",
              "生成暂不可用",
              "AI美妆沿原账户额度"
            ],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "社区作品驱动的提示词灵感",
            "description": "从此页公开参照示例了解提示词结构、风格与构图。它们不是本项目社区或用户作品库。",
            "bullets": [
              "公开图片参照",
              "提示词结构参考",
              "本地参数探索"
            ],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "如何使用  AI 图片生成器",
        "description": "从选择模型、编写提示词到预览参数，了解公开图片生成流程。本页面只提供本地预览。",
        "cards": [
          {
            "title": "输入提示词或上传图片",
            "description": "通过自然语言描述想要的画面，或上传参考图进行图生图编辑。系统能够理解细节、风格与创意意图。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "AI 智能处理与生成",
            "description": "选择模型和参数，检查提示词及参考图片。此页面提供本地参数预览，尚未发送生成任务。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "浏览公开示例",
            "description": "浏览并下载标明来源的公开示例。它们不是本项目生成或你的账户作品；未来真实生成接入后另行说明结果流程。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "谁在使用 Lanta AI 的  AI 图片生成器？",
        "description": "公开资料中的常见应用方向，供创意规划参考；不代表本项目具备对应生成能力。",
        "cards": [
          {
            "title": "社交媒体内容",
            "description": "快速生成适用于 Instagram、TikTok、Facebook 等平台的吸睛视觉内容，提升曝光与互动表现。\n社媒视觉, AI 内容创作",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/abb2b8a3-524e-4c23-8158-163bd1712d74/v1/63eeab08-0ce0-4fd2-8aa2-ef3f9abe3e41/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "营销与广告",
            "description": "高效制作营销素材、广告创意与推广主视觉，帮助品牌提升点击率与转化表现。\n营销视觉, 广告素材生成",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ff5f5ed6-fd06-4c3d-8f57-d7fa441ba4c7/v1/a87b36f5-1796-43e8-81f7-e6d591c25715/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "电商商品图片",
            "description": "基于商品图或参考图快速生成场景图、变体图与促销图，减少昂贵拍摄成本。\n商品摄影, 电商视觉",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/06134395-c121-469f-82cf-714fa019a064/v1/2cb0889b-0b4b-4ac4-bd90-32a9c829c851/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "数字艺术与插画",
            "description": "用于概念设计、插画创作与风格实验，从动漫到油画均可高效生成。\n数字艺术, AI 插画",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/9f7450a4-96d8-478d-a655-70a96cae5130/v1/f9d8fd8a-db08-48b8-8e6e-24e0463949fa/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "游戏与应用开发",
            "description": "公开资料中的游戏概念图、角色、场景和应用视觉设计方向。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/2fcee5f5-a661-4df4-9522-31473072c60a/v1/57b2087b-1c51-4a6a-ba28-134c3ac838a4/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "个人创意与趣味项目",
            "description": "可制作个性头像、壁纸、礼物图等创意内容，让想法快速变成可分享的作品。\n个人项目, 定制创作",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/203dfb5e-7df8-4c3a-8691-7c47d4eaa9f7/v1/01475246-4ffb-475a-9105-141f8bcff0b3/w1440.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/abb2b8a3-524e-4c23-8158-163bd1712d74/v1/63eeab08-0ce0-4fd2-8aa2-ef3f9abe3e41/w1440.webp",
            "alt": "社交媒体内容"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ff5f5ed6-fd06-4c3d-8f57-d7fa441ba4c7/v1/a87b36f5-1796-43e8-81f7-e6d591c25715/w1440.webp",
            "alt": "营销与广告"
          },
          {
            "src": "https://cdn.lantaai.com/resources/06134395-c121-469f-82cf-714fa019a064/v1/2cb0889b-0b4b-4ac4-bd90-32a9c829c851/w1440.webp",
            "alt": "电商商品图片"
          },
          {
            "src": "https://cdn.lantaai.com/resources/9f7450a4-96d8-478d-a655-70a96cae5130/v1/f9d8fd8a-db08-48b8-8e6e-24e0463949fa/w1440.webp",
            "alt": "数字艺术与插画"
          },
          {
            "src": "https://cdn.lantaai.com/resources/2fcee5f5-a661-4df4-9522-31473072c60a/v1/57b2087b-1c51-4a6a-ba28-134c3ac838a4/w1440.webp",
            "alt": "游戏与应用开发"
          },
          {
            "src": "https://cdn.lantaai.com/resources/203dfb5e-7df8-4c3a-8691-7c47d4eaa9f7/v1/01475246-4ffb-475a-9105-141f8bcff0b3/w1440.webp",
            "alt": "个人创意与趣味项目"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "关于  AI 图片生成器",
        "description": "了解公开模型资料与此页面的使用范围；生成尚未开放，本地文件不会上传。",
        "cards": [
          {
            "title": "什么是 AI 图片生成器？它如何工作？",
            "description": "公开模型资料：AI 图片生成器是一种基于机器学习的系统，可根据文本描述生成图像，或基于已有图片进行风格与内容转换。Lanta AI 使用经过大规模图像数据训练的神经网络来理解视觉语义，并据此生成新的图像结果。输入提示词后，系统会逐步构建画面细节，在短时间内输出可直接使用的高质量视觉内容。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "这个 AI 图片生成器真的可以免费使用吗？",
            "description": "本项目此模型生成尚未开放，不承诺免费额度、生成速度或生成图片的商用授权。本地文件与参数预览不扣额度；已有AI美妆继续按账户实际规则运行。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "可以生成哪些类型的图片？",
            "description": "公开模型资料：可生成写实人像、风景、商品图、动漫/插画、抽象艺术、幻想场景、3D 渲染、油画、水彩等多种类型。无论是文生图还是图生图，都支持复杂提示词和风格控制。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "如何获得更好的生成效果？",
            "description": "公开模型资料：建议使用更具体的提示词，明确主体、场景、光线、风格、镜头与情绪等信息。例如与其输入“a dog”，不如输入“a golden retriever puppy playing in autumn leaves, warm sunlight, professional photography”。描述越清晰，生成越可控。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "可以用图生图来改造现有照片吗？",
            "description": "公开模型资料：可以。你可以上传已有照片并进行风格转换、变体生成或细节重绘，例如将人像转为卡通风、将风景转为绘画风，或将商品图转为更具营销感的视觉样式。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "文生图和图生图有什么区别？",
            "description": "公开模型资料：文生图是从文字描述直接生成全新图像；图生图则以现有图片为基础，根据指令进行二次创作或风格迁移。两者使用相同的 AI 生成能力，但适用于不同创作场景。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "我生成的图片可以商用吗？",
            "description": "本项目此模型生成尚未开放，不承诺免费额度、生成速度或生成图片的商用授权。本地文件与参数预览不扣额度；已有AI美妆继续按账户实际规则运行。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "你们的写实效果相比其他工具有什么优势？",
            "description": "公开模型的写实风格资料涉及细节、解剖和光照。本项目没有验证其生成质量，模型生成尚未接入。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "立即开始使用 AI 图片生成器 进行创作",
        "description": "",
        "cards": [],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      }
    ]
  },
  "gpt": {
    "en": [
      {
        "title": "Create Images for Real Projects",
        "description": "GPT Image 2 helps you turn ideas into usable visuals for work, content, and creative production. Make product photos, ads, posters, social posts, UI mockups, infographics, characters, and story scenes with clearer typography and more dependable layouts.",
        "cards": [
          {
            "title": "Photography and Photorealism",
            "description": "Create images that feel closer to real photography, with natural light, believable texture, and cleaner visual detail. It works well for product shots, portraits, lifestyle imagery, and cinematic scenes that need a polished finish.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-malibu-road-trip-photo-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "UI and Product Mockups",
            "description": "Turn app or website ideas into visual mockups faster. Use GPT Image 2 to create dashboards, mobile screens, landing page concepts, and interface explorations with readable labels and better composition.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/gpt-image-2-UI-design.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Anime, Manga, and Stylized Art",
            "description": "Create stylized visuals with a stronger sense of direction. Generate anime scenes, manga pages, collage art, mixed-media concepts, and character images that stay more coherent from panel to panel or version to version.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-japanese-manga-page-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Typography and Poster Design",
            "description": "Create visuals where the copy actually matters. GPT Image 2 is especially useful for posters, ads, event graphics, menus, labels, and layouts that need short text to stay readable and visually integrated.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-handmade-market-poster-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Advertising and Social Campaigns",
            "description": "Build campaign-ready visuals for ads, social posts, thumbnails, banners, and launches. GPT Image 2 helps translate marketing ideas into finished-looking assets with tighter text treatment and layouts that fit different channels.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-highway-coffee-billboard-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-malibu-road-trip-photo-v3.webp",
            "alt": "GPT Image 2 example of a cinematic Malibu road trip photo with a couple leaning on a vintage surf wagon at sunset near the coast."
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/gpt-image-2-UI-design.png",
            "alt": "GPT Image 2 example of a clean mobile product interface mockup with dashboards, rounded cards, and readable UI text."
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-japanese-manga-page-v3.webp",
            "alt": "GPT Image 2 example of a black-and-white Japanese manga page with multiple panels, consistent characters, speech bubbles, and detailed rooftop scenes."
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-handmade-market-poster-v3.webp",
            "alt": "GPT Image 2 example of a handmade market poster with readable event text, craft product photos, paper textures, and vintage collage styling."
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-highway-coffee-billboard-v3.webp",
            "alt": "GPT Image 2 example of a realistic highway billboard for Aurora Coffee at sunset, showing a roadside ad integrated into an American driving scene."
          }
        ],
        "table": [],
        "tabs": [
          "Photo",
          "UI",
          "Manga",
          "Posters",
          "Ads"
        ],
        "videos": []
      },
      {
        "title": "It does not just understand your prompt. It makes the idea usable.",
        "description": "",
        "cards": [
          {
            "title": "Better text rendering for complex visual content",
            "description": "GPT Image 2 is much better at handling text-heavy designs and small layout details. Earlier image models could make attractive pictures, but they often broke on poster headlines, product labels, infographic annotations, or multilingual copy.\nThat changes the workflow. GPT Image 2 can render fine print, icons, UI controls, and dense composition details more reliably, which makes it more practical for posters, ads, comics, diagrams, menus, and educational visuals.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-italian-restaurant-menu-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "One idea, adapted to different formats",
            "description": "Start from one creative direction and adapt it to the format you actually need. GPT Image 2 supports aspect ratios from 3:1 to 1:3, so it is easier to create wide website banners, vertical posters, social graphics, presentation covers, and mobile-first layouts from the same concept.\nInstead of rebuilding the image for every channel, you can keep the core idea and specify the format in the prompt. Ask for a wide banner, a tall poster, or a screen-ready composition, and the model can respond with a layout that fits the job.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-historical-battle-panorama-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "The real upgrade is prompt understanding",
            "description": "GPT Image 2 is not only about making images look more realistic. Its bigger upgrade is how closely it follows what you are actually asking for. It reads visual intent better, understands style instructions more deeply, and gets closer to the image you pictured before you generated it.\nThat matters across photography, illustration, comics, pixel art, cinematic scenes, and other stylized formats. It keeps texture, lighting, structure, and detail more consistent, so the result feels more faithful to the original concept rather than just more polished.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-physics-classroom-scene-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Follow detailed instructions and preserve what matters",
            "description": "One of the clearest improvements in GPT Image 2 is how it handles dense prompts with many constraints. It does not stop at the broad concept. It can track more specific instructions about objects, placement, copy, composition, and visual relationships inside the frame.\nWhen you explicitly say that a detail must stay the same, GPT Image 2 is more reliable about keeping it in place. It can help you:\nThat makes image edits and multi-version creative work feel more consistent from one generation to the next.",
            "bullets": [
              "Keep a logo intact",
              "Maintain a specific color",
              "Preserve a character hairstyle or outfit",
              "Retain part of a product structure"
            ],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-monet-museum-poster-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-italian-restaurant-menu-v3.webp",
            "alt": "GPT Image 2 example of a text-rich Italian restaurant menu design with pasta, pizza, risotto, desserts, drinks, and realistic food photography."
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-historical-battle-panorama-v3.webp",
            "alt": "GPT Image 2 example of a large historical battle panorama with cavalry, infantry formations, smoke, flags, and cinematic battlefield detail."
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-physics-classroom-scene-v3.webp",
            "alt": "GPT Image 2 example of a realistic university physics classroom with a professor teaching in front of chalkboards filled with formulas and diagrams."
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-monet-museum-poster-v3.webp",
            "alt": "GPT Image 2 example of a realistic museum gallery scene featuring a large Claude Monet exhibition poster with readable typography and framed artwork."
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Understand GPT Image 1.5 and 2.0 in One Table",
        "description": "See how GPT Image 2 improves prompt following, text rendering, style control, and production-ready visual output.",
        "cards": [],
        "images": [],
        "table": [
          [
            "Comparison Point",
            "GPT Image 1.5",
            "GPT Image 2.0"
          ],
          [
            "Prompt following",
            "Good at understanding the overall direction and staying close to the core idea.",
            "Follows more detailed instructions for text placement, object relationships, format, and design style."
          ],
          [
            "Image editing",
            "Useful for editing existing images while trying to preserve faces, products, logos, or backgrounds.",
            "Can edit images too, but stands out more when building complete visual assets."
          ],
          [
            "Text in images",
            "Can handle short text, but small, long, or dense copy still breaks easily.",
            "Better suited to posters, labels, UI copy, infographics, menus, and comics."
          ],
          [
            "Multilingual text",
            "More stable with English and other Latin-script languages.",
            "Stronger with non-Latin scripts such as Chinese, Japanese, Korean, Hindi, and Bengali."
          ],
          [
            "Format flexibility",
            "Reliable for common image formats.",
            "Adapts better to posters, mobile screens, social crops, and presentation layouts."
          ],
          [
            "Style control",
            "Produces stable realistic images compared with earlier models.",
            "Handles a broader range of looks, including photography, cinematic stills, pixel art, and manga."
          ],
          [
            "Character consistency",
            "Works for simple character images, but identities may drift across variations.",
            "Does a better job keeping characters recognizable across angles and iterations."
          ],
          [
            "Realism",
            "Creates realistic images with dependable output.",
            "Adds more natural lighting, material texture, minor imperfections, and small real-world details."
          ],
          [
            "Complex scenes",
            "Works best with simpler compositions.",
            "Handles denser scenes with more objects, layout logic, and embedded text."
          ],
          [
            "Local edits",
            "Strong for broad edits while preserving the key structure of an image.",
            "Useful for edits too, but tiny local changes may still need retries."
          ]
        ],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Prompt Ideas for GPT Image 2",
        "description": "",
        "cards": [
          {
            "title": "Black-and-White Manga Page",
            "description": "Create a professional black-and-white serialized manga page.\n\nUse 5 panels to tell a tense scene in a rainy city alley:\nPanel 1: A wide establishing shot of a young swordsman facing a mysterious enemy.\nPanel 2: A close-up of the swordsman's serious eyes.\nPanel 3: A close-up of his hand gripping the sword.\nPanel 4: A sudden clash with dramatic speed lines and strong impact.\nPanel 5: A suspenseful final panel showing both fighters standing still after the strike.\n\nStyle:\nBold ink linework, screentone shading, high-contrast black and white, dynamic panel composition, dramatic close-ups, expressive faces, authentic weekly manga aesthetics.\n\nConstraints:\nKeep the character design consistent across all panels. No color, no watermark, no extra text outside speech bubbles or sound effects.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-manga-1.png",
            "video": "",
            "prompt": "Create a professional black-and-white serialized manga page.\n\nUse 5 panels to tell a tense scene in a rainy city alley:\nPanel 1: A wide establishing shot of a young swordsman facing a mysterious enemy.\nPanel 2: A close-up of the swordsman's serious eyes.\nPanel 3: A close-up of his hand gripping the sword.\nPanel 4: A sudden clash with dramatic speed lines and strong impact.\nPanel 5: A suspenseful final panel showing both fighters standing still after the strike.\n\nStyle:\nBold ink linework, screentone shading, high-contrast black and white, dynamic panel composition, dramatic close-ups, expressive faces, authentic weekly manga aesthetics.\n\nConstraints:\nKeep the character design consistent across all panels. No color, no watermark, no extra text outside speech bubbles or sound effects.",
            "source": "",
            "href": ""
          },
          {
            "title": "Product Ad Poster",
            "description": "Create a premium vertical product advertisement poster for a minimalist skincare serum.\n\nMain product:\nA frosted glass serum bottle standing on a smooth stone surface, with soft reflections and subtle water droplets.\n\nVisual style:\nClean luxury skincare photography, warm beige background, soft studio lighting, elegant shadows, high-end editorial composition, generous negative space.\n\nText:\nHeadline at the top: \"GLOW STARTS HERE\"\nSmall subheading below: \"Daily hydration serum\"\nBottom CTA: \"SHOP THE COLLECTION\"\n\nTypography:\nModern sans-serif, clean kerning, black text, centered, highly readable.\n\nConstraints:\nRender the text exactly as written. No extra words. No duplicate text. No watermark. Keep the bottle label clean and realistic.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-product-ad-1.png",
            "video": "",
            "prompt": "Create a premium vertical product advertisement poster for a minimalist skincare serum.\n\nMain product:\nA frosted glass serum bottle standing on a smooth stone surface, with soft reflections and subtle water droplets.\n\nVisual style:\nClean luxury skincare photography, warm beige background, soft studio lighting, elegant shadows, high-end editorial composition, generous negative space.\n\nText:\nHeadline at the top: \"GLOW STARTS HERE\"\nSmall subheading below: \"Daily hydration serum\"\nBottom CTA: \"SHOP THE COLLECTION\"\n\nTypography:\nModern sans-serif, clean kerning, black text, centered, highly readable.\n\nConstraints:\nRender the text exactly as written. No extra words. No duplicate text. No watermark. Keep the bottle label clean and realistic.",
            "source": "",
            "href": ""
          },
          {
            "title": "Mobile App UI Screenshot",
            "description": "Create a high-fidelity mobile app screenshot for a minimalist habit tracker app called \"DAYFLOW\".\n\nScreen:\nPortrait mobile app home screen.\n\nLayout:\nTop status bar shows 9:41 AM.\nHeader title: \"DAYFLOW\"\nSubtitle: \"Today's habits\"\nMain area shows 5 habit cards:\n- Morning Walk\n- Drink Water\n- Deep Work\n- Read 20 Minutes\n- Sleep Early\n\nOne habit is checked off. Include a small progress ring showing 20%.\n\nVisual style:\nClean iOS-style interface, soft cream background, rounded cards, deep navy accent color, simple icons, generous spacing, realistic mobile UI hierarchy.\n\nConstraints:\nAll text must be readable. No watermark. No real app branding. No messy icons.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-app-ui-1.png",
            "video": "",
            "prompt": "Create a high-fidelity mobile app screenshot for a minimalist habit tracker app called \"DAYFLOW\".\n\nScreen:\nPortrait mobile app home screen.\n\nLayout:\nTop status bar shows 9:41 AM.\nHeader title: \"DAYFLOW\"\nSubtitle: \"Today's habits\"\nMain area shows 5 habit cards:\n- Morning Walk\n- Drink Water\n- Deep Work\n- Read 20 Minutes\n- Sleep Early\n\nOne habit is checked off. Include a small progress ring showing 20%.\n\nVisual style:\nClean iOS-style interface, soft cream background, rounded cards, deep navy accent color, simple icons, generous spacing, realistic mobile UI hierarchy.\n\nConstraints:\nAll text must be readable. No watermark. No real app branding. No messy icons.",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-manga-1.png",
            "alt": "Black-and-white manga page with multiple action panels in a rainy alley scene."
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-product-ad-1.png",
            "alt": "Minimalist skincare serum advertisement poster with clean typography and luxury product styling."
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-app-ui-1.png",
            "alt": "Minimalist habit tracker mobile app screen with rounded cards and soft interface styling."
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "External Model Discussions (Public Sources)",
        "description": "",
        "cards": [
          {
            "title": "GPT-Image-2 now reviews its own output before finishing",
            "description": "This user noted that the image took around eleven minutes because the model kept reviewing and iterating on its own result multiple times.",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_2qh8m/styles/communityIcon_hmujz61wdga81.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=9f592f7a2ba405996ce28f084404d0873b09c2b2",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/singularity/comments/1srehi7/gptimage2_now_reviews_its_own_output_and_iterates/",
            "href": "https://www.reddit.com/r/singularity/comments/1srehi7/gptimage2_now_reviews_its_own_output_and_iterates/"
          },
          {
            "title": "The range of styles feels unusually broad",
            "description": "The takeaway here was simple: after experimenting with the model, the user felt it could handle a surprisingly wide variety of looks and outputs.",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_2qh8m/styles/communityIcon_hmujz61wdga81.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=9f592f7a2ba405996ce28f084404d0873b09c2b2",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/singularity/comments/1stt5b1/gpt_images_20_in_genuinely_insane_at_the_variety/",
            "href": "https://www.reddit.com/r/singularity/comments/1stt5b1/gpt_images_20_in_genuinely_insane_at_the_variety/"
          },
          {
            "title": "This feels like a real upgrade, not a minor refresh",
            "description": "The post frames GPT Image 2 as a more noticeable jump, with improvements strong enough to stand out immediately during testing.",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_7hqomg/styles/communityIcon_bzj6d1z1oizc1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=68b20f11a4b9ec4ee78913c295c32481ab7db6d3",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/ChatGPT/comments/1statrb/image_20_is_actually_insane_this_is_not_a_small/",
            "href": "https://www.reddit.com/r/ChatGPT/comments/1statrb/image_20_is_actually_insane_this_is_not_a_small/"
          },
          {
            "title": "Preview examples showed stronger text and layout quality",
            "description": "Users highlighted the preview as an early sign that the model was becoming more useful for finished visuals instead of just rough concept art.",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_3b9u5/styles/communityIcon_xnviax5yoahe1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=32f48580624c4e636ce4d9ff3e1fdb5102d0be98",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/OpenAI/comments/1simerz/gpt_image_2_preview/",
            "href": "https://www.reddit.com/r/OpenAI/comments/1simerz/gpt_image_2_preview/"
          },
          {
            "title": "The official launch widened access to a state-of-the-art model",
            "description": "This reaction focused less on surprise and more on availability: more people could now test a stronger image model directly.",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_7lv9o6/styles/communityIcon_3tz8axqqdq6a1.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=615db4402e23b14497726c5bb4bf9a0ac8ee5780",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/aiwars/comments/1srzo02/chatgpt_image_2_was_launched_officially/",
            "href": "https://www.reddit.com/r/aiwars/comments/1srzo02/chatgpt_image_2_was_launched_officially/"
          },
          {
            "title": "Image-to-image still needs retries in some cases",
            "description": "Not every reaction was fully positive. This post points out that reference-based edits can still be inconsistent, especially when exact character preservation matters.",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_7hqomg/styles/communityIcon_bzj6d1z1oizc1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=68b20f11a4b9ec4ee78913c295c32481ab7db6d3",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/ChatGPT/comments/1srlrs1/gptimage_2s_image_to_image_is_not_good/",
            "href": "https://www.reddit.com/r/ChatGPT/comments/1srlrs1/gptimage_2s_image_to_image_is_not_good/"
          }
        ],
        "images": [
          {
            "src": "https://styles.redditmedia.com/t5_2qh8m/styles/communityIcon_hmujz61wdga81.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=9f592f7a2ba405996ce28f084404d0873b09c2b2",
            "alt": "singularity"
          },
          {
            "src": "https://preview.redd.it/gpt-image-2-now-reviews-its-own-output-and-iterates-until-v0-l1gy51g5bhwg1.png?width=640&crop=smart&auto=webp&s=cc5211f78141d9458bb254b68311a73d14ec80af",
            "alt": "GPT-Image-2 now reviews its own output before finishing"
          },
          {
            "src": "https://styles.redditmedia.com/t5_2qh8m/styles/communityIcon_hmujz61wdga81.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=9f592f7a2ba405996ce28f084404d0873b09c2b2",
            "alt": "singularity"
          },
          {
            "src": "https://preview.redd.it/gpt-images-2-0-in-genuinely-insane-at-the-variety-it-can-do-v0-kys94rtbtzwg1.png?width=640&crop=smart&auto=webp&s=c9478279b5e0465d47b15ade7bf5dacbd22ebaa5",
            "alt": "The range of styles feels unusually broad"
          },
          {
            "src": "https://styles.redditmedia.com/t5_7hqomg/styles/communityIcon_bzj6d1z1oizc1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=68b20f11a4b9ec4ee78913c295c32481ab7db6d3",
            "alt": "ChatGPT"
          },
          {
            "src": "https://preview.redd.it/image-2-0-is-actually-insane-this-is-not-a-small-upgrade-v0-4x8k23jpwvwg1.png?width=640&crop=smart&auto=webp&s=8db26d6a4fdfa49c7e5bcf6e981a1717858a9c29",
            "alt": "This feels like a real upgrade, not a minor refresh"
          },
          {
            "src": "https://styles.redditmedia.com/t5_3b9u5/styles/communityIcon_xnviax5yoahe1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=32f48580624c4e636ce4d9ff3e1fdb5102d0be98",
            "alt": "OpenAI"
          },
          {
            "src": "https://preview.redd.it/gpt-image-2-preview-v0-wz8e2sexzkug1.png?width=640&crop=smart&auto=webp&s=6cc6f066754d28f3096be9afae27c308d6b691f5",
            "alt": "Preview examples showed stronger text and layout quality"
          },
          {
            "src": "https://styles.redditmedia.com/t5_7lv9o6/styles/communityIcon_3tz8axqqdq6a1.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=615db4402e23b14497726c5bb4bf9a0ac8ee5780",
            "alt": "aiwars"
          },
          {
            "src": "https://preview.redd.it/chatgpt-image-2-was-launched-officially-v0-yb9r9vgvrlwg1.png?width=640&crop=smart&auto=webp&s=0f5a95fd6eb83fb3599dc8fe4c95a73f2fc12690",
            "alt": "The official launch widened access to a state-of-the-art model"
          },
          {
            "src": "https://styles.redditmedia.com/t5_7hqomg/styles/communityIcon_bzj6d1z1oizc1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=68b20f11a4b9ec4ee78913c295c32481ab7db6d3",
            "alt": "ChatGPT"
          },
          {
            "src": "https://preview.redd.it/gpt-image-2s-image-to-image-is-not-good-v0-tyheko10ajwg1.png?width=640&crop=smart&auto=webp&s=28ac6b0da53172d7b75efbecf9a5146f860aa644",
            "alt": "Image-to-image still needs retries in some cases"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "GPT Image 2 FAQs",
        "description": "",
        "cards": [
          {
            "title": "What is GPT Image 2?",
            "description": "Public model information: GPT Image 2 is OpenAI's newer image model for both image generation and image editing. It is designed to handle more complex visual tasks with stronger text rendering, cleaner layouts, and more reliable prompt following. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "What can I create with GPT Image 2?",
            "description": "Public model information: You can create posters, ads, social graphics, product visuals, infographics, presentation slides, UI mockups, photorealistic scenes, manga pages, and other polished creative assets. It is especially useful when the output needs to look ready to use, not just exploratory. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Is GPT Image 2 better at generating text inside images?",
            "description": "Public model information: Yes. Better text rendering is one of its most noticeable upgrades. It does a much better job with readable text in posters, menus, labels, diagrams, and other design-heavy images. Very dense or highly specific copy may still need a retry, but the baseline is much stronger. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Can GPT Image 2 create realistic photos?",
            "description": "Public model information: Yes. GPT Image 2 is stronger at realistic scenes with more believable lighting, texture, composition, and fine detail. It works well for portraits, product shots, lifestyle visuals, and cinematic-style imagery. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Does GPT Image 2 support anime, manga, and stylized art?",
            "description": "Public model information: Yes. It captures the overall look and feel of stylized directions better than earlier image models, including anime, manga, comics, collage, and other art-driven outputs. Results usually feel more coherent and closer to the requested style. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Can GPT Image 2 edit an existing image?",
            "description": "Public model information: Yes. GPT Image 2 supports both new image generation and edits to existing images. It can help with changes to lighting, background, styling, layout, and other visual details while preserving the broader direction of the image. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Can GPT Image 2 keep the same character consistent?",
            "description": "Public model information: It is generally better than earlier models at keeping a character recognizable across variations, which makes it more useful for comics, social campaigns, and multi-image creative work. Exact consistency is still not perfect, especially across many scenes. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Does GPT Image 2 work with non-English text?",
            "description": "Public model information: Yes. GPT Image 2 is stronger with non-English copy, including languages that use non-Latin scripts. That makes it more practical for localized posters, ads, UI mockups, and multilingual design work. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Create with GPT Image 2",
        "description": "",
        "cards": [],
        "images": [
          {
            "src": "https://www.lantaai.com/logos/icon-192.png",
            "alt": "Lanta AI logo"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      }
    ],
    "zh-CN": [
      {
        "title": "为真实项目创作可直接使用的图像",
        "description": "GPT Image 2 能把想法转成更接近成品的视觉内容，适合工作、内容创作和商业设计场景。你可以用它生成产品图、广告图、海报、社媒配图、UI 线框稿、信息图、角色图和故事场景，而且文字更清晰，排版更可靠。",
        "cards": [
          {
            "title": "摄影感与写实图像",
            "description": "生成更接近真实摄影的画面，拥有更自然的光线、更可信的材质和更干净的细节表现。很适合产品拍摄、人物肖像、生活方式视觉图和电影感场景。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-malibu-road-trip-photo-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "UI 与产品设计稿",
            "description": "把 App 或网站构想更快转成视觉稿。用 GPT Image 2 生成仪表盘、移动端界面、落地页概念图和产品交互稿时，标签可读性更高，构图也更完整。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/gpt-image-2-UI-design.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "动漫、漫画与风格化艺术",
            "description": "生成风格方向更明确的视觉作品。无论是动漫场景、漫画页面、拼贴风设计、混合媒介概念图还是角色立绘，整体风格与角色一致性都更好。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-japanese-manga-page-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "字体排版与海报设计",
            "description": "当画面里的文字真的很重要时，GPT Image 2 会更有优势。它特别适合做海报、广告图、活动物料、菜单、标签和需要短文案保持可读的版式设计。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-handmade-market-poster-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "广告与社媒营销素材",
            "description": "制作可直接投放的广告视觉图、社媒帖子、缩略图、横幅和新品推广图。GPT Image 2 更适合把营销想法落成成品感更强的素材，文字处理更利落，版式也更贴合不同渠道。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-highway-coffee-billboard-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-malibu-road-trip-photo-v3.webp",
            "alt": "GPT Image 2 示例：日落海岸边，一对情侣倚靠复古冲浪旅行车的马里布公路旅行写实照片。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/gpt-image-2-UI-design.png",
            "alt": "GPT Image 2 示例：包含仪表盘、圆角卡片和清晰 UI 文字的移动产品界面设计稿。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-japanese-manga-page-v3.webp",
            "alt": "GPT Image 2 示例：黑白日漫页面，包含多个分镜、一致的角色形象、对话气泡和细致屋顶场景。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-handmade-market-poster-v3.webp",
            "alt": "GPT Image 2 示例：带有清晰活动文字、手作商品照片、纸张纹理与复古拼贴风格的市集海报。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-highway-coffee-billboard-v3.webp",
            "alt": "GPT Image 2 示例：黄昏公路边的 Aurora Coffee 户外广告牌，与真实美式驾驶场景自然融合。"
          }
        ],
        "table": [],
        "tabs": [
          "摄影",
          "UI",
          "漫画",
          "海报",
          "广告"
        ],
        "videos": []
      },
      {
        "title": "它不只是理解提示词，而是把想法做成更可用的视觉结果。",
        "description": "",
        "cards": [
          {
            "title": "更擅长处理复杂画面里的文字内容",
            "description": "GPT Image 2 在重文字设计和细小版式元素上明显更强。早期图像模型可以做出好看的画面，但一碰到海报标题、产品标签、信息图注释或多语言文案，就很容易拼错、变形或排版失控。\n这会直接改变工作流。GPT Image 2 对小字、图标、UI 控件和密集排版细节的还原更稳，因此更适合海报、广告、漫画、图解、菜单和教育类视觉内容。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-italian-restaurant-menu-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "一个创意方向，适配多种版式",
            "description": "从同一个创意出发，延展到你真正需要的展示格式。GPT Image 2 支持从 3:1 到 1:3 的画幅比例，更适合做网站横幅、竖版海报、社媒长图、演示封面和移动端优先的视觉稿。\n你不必为每个平台重画一次，只要在提示词里明确说明画幅和用途，就能保留核心概念，同时得到更贴合场景的版面结构。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-historical-battle-panorama-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "真正的升级在于更懂你要什么",
            "description": "GPT Image 2 的提升不只是让画面更写实，它更关键的升级是更贴近你的真实意图。它对视觉风格、构图方向和设计要求的理解更深，生成结果也更接近你脑海里的那张图。\n这一点对摄影、插画、漫画、像素艺术、电影感场景和各种风格化内容都成立。它能更稳定地维持纹理、光线、结构与细节，让结果更忠于创意，而不只是更“好看”。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-physics-classroom-scene-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "复杂提示词也能更稳地执行重点约束",
            "description": "GPT Image 2 最明显的进步之一，就是更能处理包含大量限制条件的复杂提示词。它不只抓住大方向，也更能跟住物体位置、文字内容、版面关系和画面结构这类细节要求。\n当你明确写出某个元素必须保留时，它更容易把这些约束真正执行出来。例如，它更擅长：\n这会让同一张图的编辑版本，或者同一创意的多轮迭代，看起来更连贯、更稳定。",
            "bullets": [
              "保留品牌 Logo",
              "维持指定颜色",
              "保留角色发型或服装特征",
              "延续产品结构中的关键部分"
            ],
            "image": "https://cdn.lantaai.com/resources/gpt-image-2-monet-museum-poster-v3.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-italian-restaurant-menu-v3.webp",
            "alt": "GPT Image 2 示例：包含意面、披萨、烩饭、甜品与饮品信息的意大利餐厅菜单设计，文字丰富且配有写实食物摄影。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-historical-battle-panorama-v3.webp",
            "alt": "GPT Image 2 示例：一幅大型历史战场全景图，包含骑兵、步兵阵列、烟雾、旗帜与电影感战场细节。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-physics-classroom-scene-v3.webp",
            "alt": "GPT Image 2 示例：一间写实大学物理课堂，教授站在写满公式与图解的黑板前授课。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/gpt-image-2-monet-museum-poster-v3.webp",
            "alt": "GPT Image 2 示例：写实美术馆场景中，一张带有清晰排版的大型莫奈展览海报陈列在画框与展墙之间。"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "一张表看懂 GPT Image 1.5 和 2.0 的差异",
        "description": "快速比较 GPT Image 2 在提示词遵循、文字渲染、风格控制和成品可用性上的提升。",
        "cards": [],
        "images": [],
        "table": [
          [
            "对比维度",
            "GPT Image 1.5",
            "GPT Image 2.0"
          ],
          [
            "提示词遵循",
            "能理解整体方向，也能基本贴近核心想法。",
            "对文字位置、物体关系、画幅形式和设计风格这类细节要求执行得更到位。"
          ],
          [
            "图像编辑",
            "适合改已有图片，同时尽量保住人脸、产品、Logo 或背景结构。",
            "同样能做编辑，但更突出的优势在于直接生成完整视觉成品。"
          ],
          [
            "图中文字",
            "能处理少量短文案，但小字、长文案或密集文字仍然容易出错。",
            "更适合海报、标签、UI 文案、信息图、菜单和漫画页面。"
          ],
          [
            "多语言文字",
            "对英文和拉丁字母体系语言更稳定。",
            "对中文、日文、韩文、印地语、孟加拉语等非拉丁文字支持更强。"
          ],
          [
            "格式适配",
            "常见画幅表现稳定。",
            "更适合海报、移动端界面、社媒裁切图和演示文稿版式。"
          ],
          [
            "风格控制",
            "相比更早的模型，写实图像更稳定。",
            "能覆盖更广的视觉风格，包括摄影、电影感静帧、像素风和漫画风。"
          ],
          [
            "角色一致性",
            "简单角色图没问题，但多版本之间容易漂移。",
            "在多角度和多轮变化中，更容易让角色保持可辨识度。"
          ],
          [
            "写实程度",
            "可以生成稳定的写实图像。",
            "在自然光感、材质纹理、细小瑕疵和真实世界细节上更进一步。"
          ],
          [
            "复杂场景",
            "更适合结构较简单的构图。",
            "更能处理物体更多、布局更密、还带文字信息的复杂画面。"
          ],
          [
            "局部修改",
            "适合大方向编辑，并保留图像主结构。",
            "同样可用于编辑，但特别细碎的局部改动有时仍需多试几次。"
          ]
        ],
        "tabs": [],
        "videos": []
      },
      {
        "title": "GPT Image 2 提示词灵感",
        "description": "",
        "cards": [
          {
            "title": "黑白漫画页面",
            "description": "创作一页专业的黑白连载日漫漫画页。\n\n使用 5 个分镜讲述雨夜城市小巷中的紧张对峙：\n分镜 1：远景，年轻剑士与神秘敌人正面对峙。\n分镜 2：剑士严肃眼神的特写。\n分镜 3：握剑的手部特写。\n分镜 4：双方突然交锋，配合强烈冲击感与速度线。\n分镜 5：收尾分镜，斩击后双方静止站立，留下悬念。\n\n风格：\n粗犷墨线、网点阴影、高对比黑白、富有张力的分镜构图、戏剧化近景、表情鲜明、真实周刊漫画质感。\n\n约束：\n所有分镜中的角色设计保持一致。不要彩色，不要水印，不要在对白气泡和拟声词之外加入多余文字。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-manga-1.png",
            "video": "",
            "prompt": "创作一页专业的黑白连载日漫漫画页。\n\n使用 5 个分镜讲述雨夜城市小巷中的紧张对峙：\n分镜 1：远景，年轻剑士与神秘敌人正面对峙。\n分镜 2：剑士严肃眼神的特写。\n分镜 3：握剑的手部特写。\n分镜 4：双方突然交锋，配合强烈冲击感与速度线。\n分镜 5：收尾分镜，斩击后双方静止站立，留下悬念。\n\n风格：\n粗犷墨线、网点阴影、高对比黑白、富有张力的分镜构图、戏剧化近景、表情鲜明、真实周刊漫画质感。\n\n约束：\n所有分镜中的角色设计保持一致。不要彩色，不要水印，不要在对白气泡和拟声词之外加入多余文字。",
            "source": "",
            "href": ""
          },
          {
            "title": "产品广告海报",
            "description": "为一款极简风护肤精华创作一张高级竖版产品广告海报。\n\n主产品：\n一只磨砂玻璃精华瓶立在平滑石面上，带有柔和反光和细微水珠。\n\n视觉风格：\n干净高级的护肤摄影，暖米色背景，柔和棚拍光线，优雅阴影，高端编辑感构图，留有充足负空间。\n\n文字：\n顶部主标题：\"GLOW STARTS HERE\"\n下方小标题：\"Daily hydration serum\"\n底部行动按钮文案：\"SHOP THE COLLECTION\"\n\n排版：\n现代无衬线字体，字距干净，黑色文字，居中排版，清晰易读。\n\n约束：\n文字必须严格按原文呈现。不要添加额外词语，不要重复文字，不要水印，并保持瓶身标签干净真实。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-product-ad-1.png",
            "video": "",
            "prompt": "为一款极简风护肤精华创作一张高级竖版产品广告海报。\n\n主产品：\n一只磨砂玻璃精华瓶立在平滑石面上，带有柔和反光和细微水珠。\n\n视觉风格：\n干净高级的护肤摄影，暖米色背景，柔和棚拍光线，优雅阴影，高端编辑感构图，留有充足负空间。\n\n文字：\n顶部主标题：\"GLOW STARTS HERE\"\n下方小标题：\"Daily hydration serum\"\n底部行动按钮文案：\"SHOP THE COLLECTION\"\n\n排版：\n现代无衬线字体，字距干净，黑色文字，居中排版，清晰易读。\n\n约束：\n文字必须严格按原文呈现。不要添加额外词语，不要重复文字，不要水印，并保持瓶身标签干净真实。",
            "source": "",
            "href": ""
          },
          {
            "title": "移动端 App UI 截图",
            "description": "为一款名为 \"DAYFLOW\" 的极简习惯追踪应用创建一张高保真移动端界面截图。\n\n画面：\n竖屏 App 首页。\n\n布局：\n顶部状态栏显示 9:41 AM。\n标题：\"DAYFLOW\"\n副标题：\"Today's habits\"\n主体区域展示 5 张习惯卡片：\n- Morning Walk\n- Drink Water\n- Deep Work\n- Read 20 Minutes\n- Sleep Early\n\n其中一项已完成，并加入一个显示 20% 的小型进度环。\n\n视觉风格：\n干净的 iOS 风界面，柔和奶油色背景，圆角卡片，深海军蓝强调色，简洁图标，留白充足，具有真实移动产品层级感。\n\n约束：\n所有文字必须清晰可读。不要水印，不要真实品牌 Logo，不要凌乱图标。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-app-ui-1.png",
            "video": "",
            "prompt": "为一款名为 \"DAYFLOW\" 的极简习惯追踪应用创建一张高保真移动端界面截图。\n\n画面：\n竖屏 App 首页。\n\n布局：\n顶部状态栏显示 9:41 AM。\n标题：\"DAYFLOW\"\n副标题：\"Today's habits\"\n主体区域展示 5 张习惯卡片：\n- Morning Walk\n- Drink Water\n- Deep Work\n- Read 20 Minutes\n- Sleep Early\n\n其中一项已完成，并加入一个显示 20% 的小型进度环。\n\n视觉风格：\n干净的 iOS 风界面，柔和奶油色背景，圆角卡片，深海军蓝强调色，简洁图标，留白充足，具有真实移动产品层级感。\n\n约束：\n所有文字必须清晰可读。不要水印，不要真实品牌 Logo，不要凌乱图标。",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-manga-1.png",
            "alt": "雨夜小巷场景的黑白漫画页面，包含多个动作分镜。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-product-ad-1.png",
            "alt": "极简护肤精华广告海报，带有清晰排版和高级产品视觉风格。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-image-models/gpt-image-2/prompt-ideas-app-ui-1.png",
            "alt": "极简习惯追踪 App 移动端界面，采用圆角卡片和柔和 UI 风格。"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "外部模型讨论（公开资料）",
        "description": "",
        "cards": [
          {
            "title": "它会先自我检查，再决定是否继续迭代输出",
            "description": "这位用户提到，单张图花了大约 11 分钟，因为模型在结束前会多次自我审查并继续迭代结果。",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_2qh8m/styles/communityIcon_hmujz61wdga81.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=9f592f7a2ba405996ce28f084404d0873b09c2b2",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/singularity/comments/1srehi7/gptimage2_now_reviews_its_own_output_and_iterates/",
            "href": "https://www.reddit.com/r/singularity/comments/1srehi7/gptimage2_now_reviews_its_own_output_and_iterates/"
          },
          {
            "title": "可驾驭的风格范围非常夸张",
            "description": "用户在反复试玩后最大的感受，是它能覆盖的视觉风格种类非常多，而且并不只是“勉强能做”。",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_2qh8m/styles/communityIcon_hmujz61wdga81.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=9f592f7a2ba405996ce28f084404d0873b09c2b2",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/singularity/comments/1stt5b1/gpt_images_20_in_genuinely_insane_at_the_variety/",
            "href": "https://www.reddit.com/r/singularity/comments/1stt5b1/gpt_images_20_in_genuinely_insane_at_the_variety/"
          },
          {
            "title": "这次不像小修小补，更像一次真正的跨代升级",
            "description": "这篇反馈认为 GPT Image 2 的进步是上手就能感受到的，不是那种需要放大看才能发现的轻微更新。",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_7hqomg/styles/communityIcon_bzj6d1z1oizc1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=68b20f11a4b9ec4ee78913c295c32481ab7db6d3",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/ChatGPT/comments/1statrb/image_20_is_actually_insane_this_is_not_a_small/",
            "href": "https://www.reddit.com/r/ChatGPT/comments/1statrb/image_20_is_actually_insane_this_is_not_a_small/"
          },
          {
            "title": "预览图已经能看出更强的文字和版式能力",
            "description": "不少用户把这组预览视为一个信号：它开始更像能直接拿来用的视觉生产工具，而不只是概念图生成器。",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_3b9u5/styles/communityIcon_xnviax5yoahe1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=32f48580624c4e636ce4d9ff3e1fdb5102d0be98",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/OpenAI/comments/1simerz/gpt_image_2_preview/",
            "href": "https://www.reddit.com/r/OpenAI/comments/1simerz/gpt_image_2_preview/"
          },
          {
            "title": "正式发布意味着更多人终于能直接用到顶级图像模型",
            "description": "这条评论的重点不是惊艳，而是可得性提升了。更多普通用户终于可以直接试到更强的模型能力。",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_7lv9o6/styles/communityIcon_3tz8axqqdq6a1.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=615db4402e23b14497726c5bb4bf9a0ac8ee5780",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/aiwars/comments/1srzo02/chatgpt_image_2_was_launched_officially/",
            "href": "https://www.reddit.com/r/aiwars/comments/1srzo02/chatgpt_image_2_was_launched_officially/"
          },
          {
            "title": "图生图在某些场景下仍然需要反复重试",
            "description": "并不是所有反馈都一边倒地正面。这条帖子指出，当你特别在意参考角色严格一致时，图生图仍可能出现不稳定情况。",
            "bullets": [],
            "image": "https://styles.redditmedia.com/t5_7hqomg/styles/communityIcon_bzj6d1z1oizc1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=68b20f11a4b9ec4ee78913c295c32481ab7db6d3",
            "video": "",
            "prompt": "",
            "source": "https://www.reddit.com/r/ChatGPT/comments/1srlrs1/gptimage_2s_image_to_image_is_not_good/",
            "href": "https://www.reddit.com/r/ChatGPT/comments/1srlrs1/gptimage_2s_image_to_image_is_not_good/"
          }
        ],
        "images": [
          {
            "src": "https://styles.redditmedia.com/t5_2qh8m/styles/communityIcon_hmujz61wdga81.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=9f592f7a2ba405996ce28f084404d0873b09c2b2",
            "alt": "singularity"
          },
          {
            "src": "https://preview.redd.it/gpt-image-2-now-reviews-its-own-output-and-iterates-until-v0-l1gy51g5bhwg1.png?width=640&crop=smart&auto=webp&s=cc5211f78141d9458bb254b68311a73d14ec80af",
            "alt": "它会先自我检查，再决定是否继续迭代输出"
          },
          {
            "src": "https://styles.redditmedia.com/t5_2qh8m/styles/communityIcon_hmujz61wdga81.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=9f592f7a2ba405996ce28f084404d0873b09c2b2",
            "alt": "singularity"
          },
          {
            "src": "https://preview.redd.it/gpt-images-2-0-in-genuinely-insane-at-the-variety-it-can-do-v0-kys94rtbtzwg1.png?width=640&crop=smart&auto=webp&s=c9478279b5e0465d47b15ade7bf5dacbd22ebaa5",
            "alt": "可驾驭的风格范围非常夸张"
          },
          {
            "src": "https://styles.redditmedia.com/t5_7hqomg/styles/communityIcon_bzj6d1z1oizc1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=68b20f11a4b9ec4ee78913c295c32481ab7db6d3",
            "alt": "ChatGPT"
          },
          {
            "src": "https://preview.redd.it/image-2-0-is-actually-insane-this-is-not-a-small-upgrade-v0-4x8k23jpwvwg1.png?width=640&crop=smart&auto=webp&s=8db26d6a4fdfa49c7e5bcf6e981a1717858a9c29",
            "alt": "这次不像小修小补，更像一次真正的跨代升级"
          },
          {
            "src": "https://styles.redditmedia.com/t5_3b9u5/styles/communityIcon_xnviax5yoahe1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=32f48580624c4e636ce4d9ff3e1fdb5102d0be98",
            "alt": "OpenAI"
          },
          {
            "src": "https://preview.redd.it/gpt-image-2-preview-v0-wz8e2sexzkug1.png?width=640&crop=smart&auto=webp&s=6cc6f066754d28f3096be9afae27c308d6b691f5",
            "alt": "预览图已经能看出更强的文字和版式能力"
          },
          {
            "src": "https://styles.redditmedia.com/t5_7lv9o6/styles/communityIcon_3tz8axqqdq6a1.jpg?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=615db4402e23b14497726c5bb4bf9a0ac8ee5780",
            "alt": "aiwars"
          },
          {
            "src": "https://preview.redd.it/chatgpt-image-2-was-launched-officially-v0-yb9r9vgvrlwg1.png?width=640&crop=smart&auto=webp&s=0f5a95fd6eb83fb3599dc8fe4c95a73f2fc12690",
            "alt": "正式发布意味着更多人终于能直接用到顶级图像模型"
          },
          {
            "src": "https://styles.redditmedia.com/t5_7hqomg/styles/communityIcon_bzj6d1z1oizc1.png?width=96&height=96&frame=1&auto=webp&crop=96%3A96%2Csmart&s=68b20f11a4b9ec4ee78913c295c32481ab7db6d3",
            "alt": "ChatGPT"
          },
          {
            "src": "https://preview.redd.it/gpt-image-2s-image-to-image-is-not-good-v0-tyheko10ajwg1.png?width=640&crop=smart&auto=webp&s=28ac6b0da53172d7b75efbecf9a5146f860aa644",
            "alt": "图生图在某些场景下仍然需要反复重试"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "GPT Image 2 常见问题",
        "description": "",
        "cards": [
          {
            "title": "GPT Image 2 是什么？",
            "description": "公开模型资料将 GPT Image 2 介绍为 OpenAI 用于图像生成与编辑的新一代图像模型，侧重复杂视觉任务、清晰文字、整洁版式和提示词遵循。本项目尚未接入其生成服务。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "GPT Image 2 能做哪些内容？",
            "description": "公开参照展示的用途包括海报、广告、社交配图、产品视觉、信息图、演示文稿、UI 原型、写实场景和漫画页，重点是更接近可使用成品的创意素材。这些是外部模型示例，不是本项目已验证的生成能力。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "GPT Image 2 在图中文字生成上是不是更强？",
            "description": "公开资料把图中文字渲染列为主要改进之一，示例涉及海报、菜单、标签和图解中的可读文字。密集排版或要求精确的长文案仍可能需要重试与人工校对，不能保证每次文字都正确。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "GPT Image 2 能生成写实照片吗？",
            "description": "公开参照介绍了更自然的光照、纹理、构图和细节，展示人像、产品照、生活方式与电影感场景。写实照片是该模型的公开应用方向；页面示例不代表本项目生成，当前不能在此提交生成。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "GPT Image 2 支持动漫、漫画和风格化艺术吗？",
            "description": "公开参照涵盖动漫、漫画、连环画、拼贴等风格化艺术，描述其能更好地保持整体风格与画面连贯性。具体效果仍依赖提示词与模型输出，本项目尚未接入这些创作功能。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "GPT Image 2 能编辑现有图片吗？",
            "description": "公开资料说明 GPT Image 2 可生成新图，也可编辑现有图片，例如调整光照、背景、风格、版式与局部视觉细节，同时尽量保持原图方向。本页选图仅用于本机预览，不会上传或执行模型编辑。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "GPT Image 2 能保持同一个角色一致吗？",
            "description": "公开资料描述其在多张变化图中维持角色辨识度的能力有所提升，适合漫画、系列宣传和多图创作。但跨大量场景的精确一致性仍不完美，需要逐张检查；本项目不承诺角色一致性或提供该生成服务。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "GPT Image 2 支持非英文文字吗？",
            "description": "公开资料介绍了非英文文字能力，包括使用非拉丁字母的语言，可用于本地化海报、广告、UI 原型和多语言设计。不同语言的准确度仍需人工核对；这些资料不表示本项目已开放多语言图像生成。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "用 GPT Image 2 开始创作",
        "description": "",
        "cards": [],
        "images": [
          {
            "src": "https://www.lantaai.com/logos/icon-192.png",
            "alt": "Lanta AI 标志"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      }
    ]
  },
  "nano": {
    "en": [
      {
        "title": "How to Use Nano Banana Pro",
        "description": "Generate or refine professional visuals in three straightforward steps.",
        "cards": [
          {
            "title": "Step 1 · Describe the image you want",
            "description": "Write a clear prompt with the subject, composition, lighting, style, and any exact text that must appear inside the image.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Step 2 · Generate, edit, and iterate",
            "description": "Choose a model and preview its local settings. Generation is not connected and no generation task is sent.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Step 3 · Browse Public Examples",
            "description": "Browse public examples and their sources. Project-generated results are not available to export.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "What Is Nano Banana Pro?",
        "description": "A Gemini-powered AI image workflow designed for teams and creators who need dependable quality, not just flashy demos.",
        "cards": [
          {
            "title": "Reliable text rendering for image-heavy workflows",
            "description": "Nano Banana Pro is built for one of the hardest image-generation tasks: putting clean, readable text directly into the final visual. Instead of blurry labels or broken typography, the model is better at producing posters, menus, product callouts, UI mockups, and branded social graphics that look intentional.\nBecause the system understands layout, spacing, hierarchy, and context, your AI image editing workflow feels less like prompt roulette and more like working with a production assistant. That matters when a single typo or misaligned headline can make the whole asset unusable.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/12516bfd-4128-4e9e-82ba-36787b627b8d.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "",
            "badge": "Gemini 3 Pro Text Rendering",
            "caption": "Readable Text in the Final Image",
            "captionDescription": "Useful for posters, menus, labels, interfaces, and ad creatives.",
            "emphasis": [
              "Nano Banana Pro",
              "AI image editing workflow"
            ]
          },
          {
            "title": "4K-ready visuals for commercial delivery",
            "description": "Nano Banana Pro can produce detailed images that hold up in polished digital campaigns and print-oriented workflows. When you need packaging mockups, presentation covers, hero banners, or product ads, the model is built to preserve clarity rather than collapsing under higher-detail requests.\nThat makes it a strong fit for teams that cannot afford soft textures, muddy edges, or last-minute rework. With 4K-ready output, you can move from concept to usable asset faster while keeping the final image suitable for stakeholder review and publication.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/f13fa0cf-57eb-40cf-9d5a-f46ba0fa82e9.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "",
            "badge": "High-Resolution Output",
            "caption": "4K-Ready Detail",
            "captionDescription": "Sharper edges, stronger textures, and cleaner upscale results.",
            "emphasis": [
              "Nano Banana Pro",
              "4K-ready output"
            ]
          },
          {
            "title": "Built for global content, not one-language prompts",
            "description": "Nano Banana Pro supports multilingual prompting and visual creation across 100+ languages, which is especially useful when campaigns, storefront images, or educational graphics need to adapt to different regions without rebuilding everything from scratch.\nThat means the workflow is more practical for international teams. Instead of treating language as an afterthought, multilingual image generation becomes part of the creative system itself, helping you localize visuals with better consistency and less manual cleanup.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/f135a2ef-826b-4e16-838f-36276e4a8381.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "",
            "badge": "Multilingual Creation",
            "caption": "Multilingual by Design",
            "captionDescription": "Better support for region-specific visuals, prompts, and text-heavy assets.",
            "emphasis": [
              "Nano Banana Pro",
              "multilingual image generation"
            ]
          },
          {
            "title": "Why teams choose Nano Banana Pro",
            "description": "Nano Banana Pro stands out when the output needs to be usable, not merely interesting. Between stronger typography, 4K-ready image quality, and multilingual creation support, it gives designers, marketers, ecommerce teams, and solo creators a faster path from idea to deliverable.",
            "bullets": [
              "Readable Typography",
              "4K-Ready Quality",
              "100+ Languages",
              "Gemini 3 Pro Powered"
            ],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/12516bfd-4128-4e9e-82ba-36787b627b8d.webp",
            "alt": "Nano Banana Pro example showing accurate text rendering inside a generated marketing visual."
          },
          {
            "src": "https://cdn.lantaai.com/resources/f13fa0cf-57eb-40cf-9d5a-f46ba0fa82e9.webp",
            "alt": "Nano Banana Pro 4K example showing a high-detail visual suitable for print and large-format output."
          },
          {
            "src": "https://cdn.lantaai.com/resources/f135a2ef-826b-4e16-838f-36276e4a8381.webp",
            "alt": "Nano Banana Pro multilingual visual example for campaigns adapted across different languages and regions."
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Nano Banana Pro Features",
        "description": "The core capabilities that make the workflow practical for real production use.",
        "cards": [
          {
            "title": "Text-to-Image Generation",
            "description": "Create polished visuals from a prompt while keeping stronger control over subject, style, layout, and image intent.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "In-Image Text Rendering",
            "description": "Generate posters, labels, and branded visuals with clearer, more dependable typography inside the image.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "4K-Ready Output",
            "description": "Produce images that stay sharp enough for premium digital campaigns, presentations, and print-oriented deliverables.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Multilingual Creation",
            "description": "Work with prompts and visual assets across 100+ languages for localized campaigns and global content needs.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Responsive Workflow",
            "description": "Use the generator comfortably across desktop and mobile when you need quick iterations or client reviews on the go.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Editing and Refinement",
            "description": "Improve composition, fix details, and iterate on the original concept without restarting the full creative process.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Color and Style Control",
            "description": "Guide palette, mood, and finish more precisely so the output better matches brand direction and campaign context.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Batch-Friendly Production",
            "description": "Develop multiple variations for ads, storefront images, or product storytelling with more consistent results.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Fast Cloud Processing",
            "description": "Move from prompt to draft quickly with cloud-based generation designed for shorter iteration cycles.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Where Nano Banana Pro Fits Best",
        "description": "Common workflows where accurate text, higher detail, and multilingual support matter.",
        "cards": [
          {
            "title": "Photography and Retouching Teams",
            "description": "Use Nano Banana Pro to build concept frames, extend existing shots, or generate composite-ready assets before final post-production.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Marketing and Social Teams",
            "description": "Create ad creatives, campaign graphics, and social visuals that depend on readable headlines, branded layouts, and fast iteration.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Ecommerce and Product Content",
            "description": "Generate high-detail product imagery, promotional banners, and text-heavy retail assets that need to stay consistent across catalogs.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Design Studios and Agencies",
            "description": "Accelerate ideation, presentation mockups, and delivery-ready concepts when clients expect fast turnaround without sacrificing polish.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Frequently Asked Questions",
        "description": "Answers to the questions people ask before using Nano Banana Pro in real creative work.",
        "cards": [
          {
            "title": "What is Nano Banana Pro?",
            "description": "Public model information: Nano Banana Pro is an AI image generation and editing workflow powered by Gemini 3 Pro. It is designed for people who need higher-quality visuals, cleaner text rendering, and faster iteration from prompt to final asset. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "What makes Nano Banana Pro different from a standard AI image generator?",
            "description": "Public model information: Its main advantage is practical output quality: stronger text rendering inside images, more reliable detail at higher resolution, and a workflow that is better suited to editing, localization, and commercial asset production. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Can Nano Banana Pro generate images with readable text inside them?",
            "description": "Public model information: Yes. One of the strongest reasons to use Nano Banana Pro is that it handles in-image text more reliably than many general-purpose generators, which is helpful for posters, menus, UI concepts, labels, and ads. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Is Nano Banana Pro suitable for 4K output?",
            "description": "Public model information: Yes. The workflow is positioned for high-detail, 4K-ready image creation, which makes it more practical for premium digital assets, presentations, and print-oriented creative use. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Does Nano Banana Pro support multiple languages?",
            "description": "Public model information: Yes. Nano Banana Pro supports multilingual prompting and visual creation across 100+ languages, making it useful for international campaigns and localized creative work. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Do I need to install software to use Nano Banana Pro?",
            "description": "Public model information: No. Nano Banana Pro runs in the browser, so you can generate and edit images online without installing desktop software. This model is not connected for generation here; these are not verified project capabilities.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Can I use Nano Banana Pro for commercial work?",
            "description": "This model’s generation is not available in this project. No free quota, generation speed, or commercial image rights are promised here. Local previews use no credits; existing AI Makeup follows its actual account rules.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "How fast is the generation workflow?",
            "description": "This model’s generation is not available in this project. No free quota, generation speed, or commercial image rights are promised here. Local previews use no credits; existing AI Makeup follows its actual account rules.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Start Creating with Nano Banana Pro",
        "description": "",
        "cards": [],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      }
    ],
    "zh-CN": [
      {
        "title": "如何使用 Nano Banana Pro",
        "description": "三步完成专业级视觉生成或图片精修。",
        "cards": [
          {
            "title": "步骤 1 · 描述你想要的画面",
            "description": "写清主体、构图、光线、风格，以及需要直接出现在画面里的文字内容。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "步骤 2 · 生成、编辑并反复优化",
            "description": "选择模型和本地参数，检查你的创意描述。生成服务尚未接入，不会发出生成任务。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "步骤 3 · 浏览公开示例",
            "description": "浏览公开示例及来源；当前不能导出本项目生成结果。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "什么是 Nano Banana Pro？",
        "description": "这是一套由 Gemini 驱动的 AI 图像工作流，面向真正需要稳定成片质量的团队与创作者，而不只是“看起来惊艳”的演示效果。",
        "cards": [
          {
            "title": "专为重文字视觉场景优化的图中排版能力",
            "description": "Nano Banana Pro 针对 AI 出图里最难的一类任务做了强化：把清晰、可读、布局合理的文字直接放进最终图片里。相比容易糊字、错字或排版失控的普通模型，它更适合做海报、菜单、商品卖点图、界面原型和品牌社媒素材。\n因为系统对版式、留白、层级和语境的理解更稳，你的 AI 图片编辑工作流 不再像碰运气，而更像在和一位懂设计生产的助手协作。对于一张标题错位就整张报废的商业素材来说，这一点非常关键。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/12516bfd-4128-4e9e-82ba-36787b627b8d.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "",
            "badge": "Gemini 3 Pro 文字渲染",
            "caption": "图片内文字清晰可用",
            "captionDescription": "适合海报、菜单、标签、界面原型和广告创意。",
            "emphasis": [
              "Nano Banana Pro",
              "AI 图片编辑工作流"
            ]
          },
          {
            "title": "面向商业交付的 4K 级画质",
            "description": "Nano Banana Pro 能生成细节充足的图片，适合高质量数字营销和偏印刷类的视觉交付。无论你要做包装提案、演示封面、首页横幅还是商品广告，它都更擅长在高细节要求下保持清晰度，而不是一放大就发虚。\n这让它特别适合不能接受材质发糊、边缘发散或临门一脚返工的团队。借助 4K 级输出，你可以更快从概念走到可评审、可发布的正式素材。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/f13fa0cf-57eb-40cf-9d5a-f46ba0fa82e9.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "",
            "badge": "高分辨率输出",
            "caption": "4K 级细节表现",
            "captionDescription": "边缘更干净，纹理更扎实，放大后依然稳定。",
            "emphasis": [
              "Nano Banana Pro",
              "4K 级输出"
            ]
          },
          {
            "title": "真正适合全球内容团队的多语言工作流",
            "description": "Nano Banana Pro 支持 100+ 语言的多语种提示词与视觉生成。当你的广告、店铺图片或教学图解要面向不同地区时，不必每个市场都从零重做一遍。\n这让它对国际化团队更实用。语言不再只是最后补上的翻译层，而是直接进入创作系统本身，让 多语言图片生成 在一致性和后期整理成本上都更可控。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/f135a2ef-826b-4e16-838f-36276e4a8381.webp",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "",
            "badge": "多语种视觉创作",
            "caption": "从设计之初就支持多语言",
            "captionDescription": "更适合区域化视觉、本地化提示词与重文字素材。",
            "emphasis": [
              "Nano Banana Pro",
              "多语言图片生成"
            ]
          },
          {
            "title": "为什么团队会选择 Nano Banana Pro",
            "description": "Nano Banana Pro 的价值在于它输出的东西真的能拿去用，而不只是“看起来很有意思”。更稳的文字渲染、4K 级图像质量和多语言支持，让设计师、营销团队、电商团队和独立创作者都能更快把想法变成可交付成果。",
            "bullets": [
              "文字清晰可读",
              "4K 级画质",
              "支持 100+ 语言",
              "Gemini 3 Pro 驱动"
            ],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/12516bfd-4128-4e9e-82ba-36787b627b8d.webp",
            "alt": "Nano Banana Pro 示例：在生成的营销视觉中准确呈现图中文字。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/f13fa0cf-57eb-40cf-9d5a-f46ba0fa82e9.webp",
            "alt": "Nano Banana Pro 4K 示例图，展示适合印刷和大尺寸投放的高细节画质。"
          },
          {
            "src": "https://cdn.lantaai.com/resources/f135a2ef-826b-4e16-838f-36276e4a8381.webp",
            "alt": "Nano Banana Pro 多语言视觉示例，展示面向不同语言与地区的本地化创意素材。"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Nano Banana Pro 核心功能",
        "description": "这些能力让它更适合真实生产环境，而不只是做一次性展示图。",
        "cards": [
          {
            "title": "文本生成图片",
            "description": "根据提示词生成更完整、更可控的视觉结果，主体、风格、版式和用途都更容易对齐。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "图中文字渲染",
            "description": "适合海报、标签、品牌物料等场景，图片里的文字更清晰、更稳定。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "4K 级输出",
            "description": "生成适合高规格数字营销、方案演示和印刷类素材的高分辨率图片。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "多语种创作",
            "description": "支持 100+ 语言的提示词和视觉生成，方便做本地化营销与全球内容。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "跨设备工作流",
            "description": "无论桌面端还是移动端，都能快速查看草稿、继续迭代或做客户评审。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "编辑与精修",
            "description": "在已有结果上继续改构图、修细节、调方向，而不必每次都从头重来。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "色彩与风格控制",
            "description": "更精确地控制配色、氛围与质感，让成图更贴近品牌调性和投放场景。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "批量化生产",
            "description": "适合一次生成多版广告图、商品图或内容变体，同时保持更高的一致性。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "云端快速处理",
            "description": "从提示词到初稿的等待更短，更适合高频试错和快速创意迭代。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Nano Banana Pro 最适合哪些场景",
        "description": "当图中文字、细节密度和多语言支持都很重要时，这类工作流会更有优势。",
        "cards": [
          {
            "title": "摄影与后期团队",
            "description": "用于概念草图、已有照片延展，或生成可继续合成的视觉素材，帮助正式修图前更快定方向。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "市场与社媒团队",
            "description": "制作依赖可读标题、品牌版式和快速迭代的广告创意、活动主视觉和社媒图片。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "电商与商品内容团队",
            "description": "生成高细节商品图、促销横幅和重文字零售素材，方便在整套商品目录中保持风格一致。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "设计工作室与代理商",
            "description": "在客户要求节奏快、质量高的情况下，加速提案、概念稿和可交付视觉方案的产出。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "常见问题",
        "description": "在把 Nano Banana Pro 用进正式创意流程之前，大家最常问的几个问题。",
        "cards": [
          {
            "title": "Nano Banana Pro 是什么？",
            "description": "公开模型资料：Nano Banana Pro 是一套由 Gemini 3 Pro 驱动的 AI 图像生成与编辑工作流，适合需要更高成片质量、更稳文字渲染和更快迭代效率的用户。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Nano Banana Pro 和普通 AI 图像生成器有什么区别？",
            "description": "公开模型资料：它的优势在于结果更适合真实使用：图片内文字更稳，高分辨率细节更可靠，也更适合编辑、本地化和商业素材生产。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Nano Banana Pro 能生成带清晰文字的图片吗？",
            "description": "公开模型资料：可以。这正是 Nano Banana Pro 最值得使用的原因之一。对于海报、菜单、界面概念图、标签和广告，它比很多通用模型更擅长处理图中文字。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Nano Banana Pro 适合做 4K 输出吗？",
            "description": "公开模型资料：适合。它面向高细节、4K 级图像创作，更适合高规格数字素材、演示封面和偏印刷类的视觉交付。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Nano Banana Pro 支持多语言吗？",
            "description": "公开模型资料：支持。Nano Banana Pro 支持 100+ 语言的提示词与视觉生成，适合国际化营销和多地区内容创作。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "使用 Nano Banana Pro 需要安装软件吗？",
            "description": "公开模型资料：不需要。Nano Banana Pro 可直接在浏览器中使用，无需安装桌面软件。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Nano Banana Pro 可以用于商业项目吗？",
            "description": "公开模型资料：可以。它的设计目标就是服务市场营销、电商、设计和品牌内容等需要正式交付视觉素材的商业场景。 本项目尚未接入该模型生成，以上不是本项目能力验证。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "生成速度快吗？",
            "description": "本项目此模型生成尚未开放，不承诺免费额度、生成速度或生成图片的商用授权。本地文件与参数预览不扣额度；已有AI美妆继续按账户实际规则运行。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "现在就开始使用 Nano Banana Pro 创作",
        "description": "",
        "cards": [],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      }
    ]
  },
  "video": {
    "en": [
      {
        "title": "Explore Stunning AI-Generated Videos You Can Make",
        "description": "",
        "cards": [],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": [
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-1.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-2.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-3.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-4.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-5.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-6.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-7.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-8.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-9.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-10.mp4"
        ]
      },
      {
        "title": "Key Features of Lanta AI Video Maker",
        "description": "",
        "cards": [
          {
            "title": "Create HD Video Drafts Without Filming",
            "description": "Start with a prompt, reference image, or early concept, and turn it into an HD AI video draft before you move into full production. Use Lanta AI to test the mood, pacing, framing, and visual direction of your idea, whether you’re building a treatment, pitching a concept, or exploring a scene before production.",
            "bullets": [],
            "image": "",
            "video": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-hd-video-drafts.mp4",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Turn Still Images into Smooth Video Motion",
            "description": "Bring product photos, portraits, character art, and concept images into motion with natural camera flow and visual continuity. Instead of leaving a strong image as a static frame, use Lanta AI to see how it works as a moving shot, with motion, atmosphere, and timing shaped around your visual idea.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-image-to-video-motion.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Build Multi-Shot Videos That Flow Better",
            "description": "Create short sequences that feel more connected from shot to shot. Use prompts to guide pacing, transitions, camera direction, and visual progression, so your video feels less like separate AI clips and more like an edited scene. It’s a faster way to test ad concepts, storyboard previews, cinematic drafts, and short-form narrative ideas.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-multi-shot-video-flow.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Keep the Same Character Through the Shot",
            "description": "Keep your person, avatar, or stylized character more consistent as the shot moves. Use Lanta AI to preserve the subject’s visual identity across motion, angle changes, and camera movement, so character-driven videos feel more stable and easier to refine.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-consistent-character-shot.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-image-to-video-motion.png",
            "alt": "Still image turned into smooth cinematic motion with Lanta AI Video Maker"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-multi-shot-video-flow.png",
            "alt": "Multi-shot AI video sequence with smoother pacing and scene transitions"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-consistent-character-shot.png",
            "alt": "Consistent AI character preserved across motion and camera angle changes"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Try Multiple AI Video Models in One Place",
        "description": "Stop switching between different AI video tools. With Lanta AI, you can try multiple video models in one place, compare the results, and choose the video you like best.",
        "cards": [
          {
            "title": "Grok Imagine",
            "description": "Fast Creative Generation",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ad3ef36b-b8fa-4f8a-9587-8c0774cda18f.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Happy Horse 1.0",
            "description": "Cinematic Multi-Reference Video",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Seedance 2.0 Fast",
            "description": "Fast Multimodal Creation",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/aeaf14e8-5cdc-4dad-877d-8d731cbb1333.svg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Wan 2.6",
            "description": "Story Flow & Character Continuity",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Kling 3.0",
            "description": "Director-Level Control",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/95daf4be-14da-4a44-85fd-94662230238b.svg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Lanta 2.1",
            "description": "Fast & Cost-Efficient Creation",
            "bullets": [],
            "image": "https://cdn.lantaai.com/logos/icon-192.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ad3ef36b-b8fa-4f8a-9587-8c0774cda18f.png",
            "alt": "Grok Imagine Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "alt": "Happy Horse 1.0 Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/resources/aeaf14e8-5cdc-4dad-877d-8d731cbb1333.svg",
            "alt": "Seedance 2.0 Fast Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "alt": "Wan 2.6 Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/resources/95daf4be-14da-4a44-85fd-94662230238b.svg",
            "alt": "Kling 3.0 Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/logos/icon-192.png",
            "alt": "Lanta 2.1 Model Logo"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "How to Make AI Videos on Lanta AI",
        "description": "",
        "cards": [
          {
            "title": "Step 1: Choose a Mode",
            "description": "Select Text to Video or Image to Video. Enter a prompt, or upload one or more reference images, then describe the motion, scene, or style you want.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Step 2: Pick a Model and Settings",
            "description": "Choose an AI video model, then set the duration, aspect ratio, and quality based on where you want to use the video.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Step 3: Generate Your Video",
            "description": "Click Generate and let Lanta AI turn your prompt or images into a short AI video.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Step 4: Preview and Download",
            "description": "Review the result in your generation's history. Download the video, redo it, or try another model for a different result.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/choose-a-mode.png",
            "alt": "Choose a mode in Lanta AI video generator"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Popular Ways to Use an AI Video Generator",
        "description": "",
        "cards": [
          {
            "title": "Social Media",
            "description": "Make scroll-stopping clips for TikTok, Reels, Shorts, memes, fan edits, and quick content tests. Start with a prompt, portrait, product image, or character idea, then see how it works as a short video before you spend time editing.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-social-media.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Ads & Marketing",
            "description": "Turn product shots, campaign ideas, and visual concepts into short video drafts for ads and ecommerce. Test product reveals, lifestyle scenes, social hooks, and creative variations before planning a full shoot or paid campaign.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-ads-marketing.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Film & Storytelling",
            "description": "Preview scenes before you build the full sequence. Use Lanta AI to test camera movement, mood lighting, pacing, character moments, and storyboard ideas, so you can see whether a scene works in motion.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-film-storytelling.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Anime & Game",
            "description": "Animate stylized characters, avatars, fantasy worlds, and game-inspired scenes from prompts or reference images. Create character intros, action beats, fan-style edits, or short story moments with a clear visual identity.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-anime-game.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "Music & Dance",
            "description": "Create moving visuals for music videos, dance concepts, lyric backgrounds, and experimental art projects. Explore rhythm, atmosphere, lighting, motion, and abstract visuals without building every frame from scratch.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-music-dance.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-social-media.png",
            "alt": "Social media short-form video examples created with Lanta AI Video Generator"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-ads-marketing.png",
            "alt": "Product ad and marketing video drafts created with Lanta AI Video Generator"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-film-storytelling.png",
            "alt": "Cinematic scene and storyboard preview created with Lanta AI Video Generator"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-anime-game.png",
            "alt": "Anime and game-style character video created with Lanta AI Video Generator"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-music-dance.png",
            "alt": "Music and dance visual concept video created with Lanta AI Video Generator"
          }
        ],
        "table": [],
        "tabs": [
          "Social Media",
          "Ads & Marketing",
          "Film & Storytelling",
          "Anime & Game",
          "Music & Dance"
        ],
        "videos": []
      },
      {
        "title": "Explore More AI Video Tools",
        "description": "",
        "cards": [
          {
            "title": "AI Image to Video",
            "description": "Animate still images into short video scenes with motion, atmosphere, and camera movement.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/user-upload/69134411-f39a-4f81-89f5-e9361166074c.jpg",
            "video": "https://cdn.lantaai.com/videos/62197007-ef38-48d0-a1fb-2a085c05fa82.mp4",
            "prompt": "",
            "source": "",
            "href": "/tools/ai-image-to-video"
          },
          {
            "title": "Video to Animation Converter",
            "description": "Turn real footage into stylized animated visuals with faster iteration for creative concepts.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/videos/4879ec7a-9419-49ed-89cd-8da719630067.jpg",
            "video": "https://cdn.lantaai.com/videos/4879ec7a-9419-49ed-89cd-8da719630067.mp4",
            "prompt": "",
            "source": "",
            "href": "/tools/video-to-animation-converter"
          },
          {
            "title": "Character Animation",
            "description": "Bring stylized characters and avatars into motion from prompts or reference visuals.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/b06c264a-0de1-415e-a2b9-7dde1f401e1d/v1/Character-Animation-tool-preview/poster.jpg",
            "video": "https://cdn.lantaai.com/resources/b06c264a-0de1-415e-a2b9-7dde1f401e1d/v1/Character-Animation-tool-preview/w1280.mp4",
            "prompt": "",
            "source": "",
            "href": "/tools/character-animation"
          },
          {
            "title": "AI Lip Sync Video Generator",
            "description": "Create speaking or singing character videos with synced mouth motion and performance-driven visuals.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/6d8f54f4-4101-45c1-9ef9-3ba2da69df87.webp",
            "video": "https://cdn.lantaai.com/resources/e43c96f4-5d1a-436a-a962-09d3b2fc4b87.mp4",
            "prompt": "",
            "source": "",
            "href": "/tools/ai-lip-sync-video-generator"
          },
          {
            "title": "AI Kissing Video Generator",
            "description": "Create AI kissing videos from one couple photo or two portraits with romantic motion and natural expression.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/videos/51e2dbcd-d34f-43bc-8e4d-a5e01212687f.jpg",
            "video": "https://cdn.lantaai.com/resources/95715f38-1815-4a07-bec3-2da1d852718c/v1/419a5978-28c3-4c28-97e7-9b7fbe2f8501/w1280.mp4",
            "prompt": "",
            "source": "",
            "href": "/tools/ai-kissing-video-generator"
          },
          {
            "title": "AI Hug Video Generator",
            "description": "Turn photos into warm AI hug videos for family memories, friendship moments, and emotional short clips.",
            "bullets": [],
            "image": "https://cdn.lantaai.com/videos/dad2a773-a269-40c6-a9a4-37f6d2c326ac.jpg",
            "video": "https://cdn.lantaai.com/videos/dad2a773-a269-40c6-a9a4-37f6d2c326ac.mp4",
            "prompt": "",
            "source": "",
            "href": "/tools/ai-hug-video-generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/user-upload/69134411-f39a-4f81-89f5-e9361166074c.jpg",
            "alt": "AI Image to Video tool preview"
          },
          {
            "src": "https://cdn.lantaai.com/videos/4879ec7a-9419-49ed-89cd-8da719630067.jpg",
            "alt": "Video to Animation Converter tool preview"
          },
          {
            "src": "https://cdn.lantaai.com/resources/b06c264a-0de1-415e-a2b9-7dde1f401e1d/v1/Character-Animation-tool-preview/poster.jpg",
            "alt": "Character Animation tool preview"
          },
          {
            "src": "https://cdn.lantaai.com/resources/6d8f54f4-4101-45c1-9ef9-3ba2da69df87.webp",
            "alt": "AI Lip Sync Video Generator tool preview"
          },
          {
            "src": "https://cdn.lantaai.com/videos/51e2dbcd-d34f-43bc-8e4d-a5e01212687f.jpg",
            "alt": "AI Kissing Video Generator preview"
          },
          {
            "src": "https://cdn.lantaai.com/videos/dad2a773-a269-40c6-a9a4-37f6d2c326ac.jpg",
            "alt": "AI Hug Video Generator preview"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "AI Video Generation Reviews and Guides",
        "description": "",
        "cards": [
          {
            "title": "Kling 3.0 Review: Better Control for AI Video Generation",
            "description": "",
            "bullets": [],
            "image": "https://cdn.lantaai.com/outputs/83015244-e4cc-47cc-a784-c6622a20ce08.jpg",
            "video": "https://cdn.lantaai.com/resources/ai-video-models/kling-3-0/kling-3-0-cinematic.mp4",
            "prompt": "",
            "source": "",
            "href": "https://www.lantaai.com/blog/kling-3-0-review"
          },
          {
            "title": "HappyHorse 1.0 Review: Can It Reduce Failed AI Videos?",
            "description": "",
            "bullets": [],
            "image": "https://cdn.lantaai.com/outputs/651458cc-2141-439c-8345-74f4937877e2.jpg",
            "video": "https://cdn.lantaai.com/outputs/651458cc-2141-439c-8345-74f4937877e2.mp4",
            "prompt": "",
            "source": "",
            "href": "https://www.lantaai.com/blog/happyhorse-1-0-review"
          },
          {
            "title": "Kling AI in 2026: A Creator's Guide to More Realistic AI Video",
            "description": "",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/dea743f7-905d-42a7-aa51-f02138790fad/v1/kling-2.6-preview/poster.jpg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "https://www.lantaai.com/blog/kling-ai-realistic-ai-video-2026"
          },
          {
            "title": "Text to Video Artificial Intelligence: How It Works",
            "description": "",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/5e0d3054-7d7a-4201-8052-0db438bb84a9/v1/cb4ecf84-da61-49d2-9039-db7e55239bc2/poster.jpg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "https://www.lantaai.com/blog/text-to-video-artificial-intelligence-how-it-works"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/outputs/83015244-e4cc-47cc-a784-c6622a20ce08.jpg",
            "alt": "Kling 3.0 review preview video"
          },
          {
            "src": "https://cdn.lantaai.com/outputs/651458cc-2141-439c-8345-74f4937877e2.jpg",
            "alt": "HappyHorse 1.0 review preview video"
          },
          {
            "src": "https://cdn.lantaai.com/resources/dea743f7-905d-42a7-aa51-f02138790fad/v1/kling-2.6-preview/poster.jpg",
            "alt": "Kling AI realistic video guide cover image"
          },
          {
            "src": "https://cdn.lantaai.com/resources/5e0d3054-7d7a-4201-8052-0db438bb84a9/v1/cb4ecf84-da61-49d2-9039-db7e55239bc2/poster.jpg",
            "alt": "Text to video artificial intelligence guide cover image"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "AI Video Maker FAQs",
        "description": "",
        "cards": [
          {
            "title": "How does Lanta AI Video Generator work?",
            "description": "Public model information: Lanta AI turns text prompts and images into short AI videos. You can start with a written idea, upload an image, choose an AI video model, and generate a clip in minutes. For better results, describe the motion, camera movement, mood, and style you want. Generation is not connected in this project.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Is Lanta AI Video Generator free to try?",
            "description": "This model’s generation is not available in this project. No free quota, generation speed, or commercial image rights are promised here. Local previews use no credits; existing AI Makeup follows its actual account rules.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "How long does it take to generate an AI video?",
            "description": "Public model information: Most videos take 3-5 minutes to generate. The exact time depends on the model, video length, quality, scene complexity, and current processing load. Shorter clips and simpler prompts usually generate faster. Generation is not connected in this project.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Can I generate videos from both text and images?",
            "description": "Public model information: Yes. Use Text to Video to create a scene from a prompt, or Image to Video to animate a product photo, portrait, character image, artwork, or visual concept. You can also use prompts with images to guide motion, style, and camera movement. Generation is not connected in this project.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Which AI video model should I choose?",
            "description": "Public model information: Lanta 2.1: Choose it for quick tests, first drafts, and lower-cost experiments.\n\nGrok Imagine: when you want to turn an idea, prompt, or image into a video quickly.\n\nSeedance 2.0 Fast: when you want to test different inputs, such as text, images, audio, or videos, and creative directions faster.\n\nWan 2.6: when the same person, voice, or story needs to stay more connected across multiple shots.\n\nKling 3.0: when you want cinematic control, stronger camera movement, native audio, and film-like storytelling.\n\nHappy Horse 1.0: when your video needs multiple references, richer scene detail, stronger motion, and a more complete short-film structure. Generation is not connected in this project.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "What types of videos can I create with Lanta AI?",
            "description": "Public model information: You can create social media clips, product videos, ad concepts, cinematic shots, character videos, music visuals, anime-style clips, and storyboard previews. Lanta AI works well for short, visual content made from prompts, product images, portraits, or creative concepts. Generation is not connected in this project.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "How can I get better AI video results?",
            "description": "Public model information: Keep each video focused on one clear idea. Describe the subject, action, camera movement, lighting, mood, and style. If you use an image, make sure the image is clear and let the prompt focus on how you want it to move. For complex ideas, generate shorter clips first and refine from there. Generation is not connected in this project.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "How do I make longer AI videos?",
            "description": "Public model information: The most reliable way is to build longer videos from shorter clips. Break your idea into scenes, generate each part separately, then edit the best clips together. This gives you more control over pacing, camera movement, character consistency, and overall quality. Generation is not connected in this project.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Will failed AI video generations waste my credits?",
            "description": "This model’s generation is not available in this project. No free quota, generation speed, or commercial image rights are promised here. Local previews use no credits; existing AI Makeup follows its actual account rules.",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "Try Lanta AI Video Generator for Free!",
        "description": "",
        "cards": [],
        "images": [
          {
            "src": "https://www.lantaai.com/logos/icon-192.png",
            "alt": "Lanta AI logo"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      }
    ],
    "zh-CN": [
      {
        "title": "探索你可以制作的惊艳 AI 视频",
        "description": "",
        "cards": [],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": [
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-1.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-2.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-3.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-4.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-5.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-6.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-7.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-8.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-9.mp4",
          "https://cdn.lantaai.com/resources/ai-video-generator/ai-video-generator-example-10.mp4"
        ]
      },
      {
        "title": "Lanta AI 视频制作器的核心功能",
        "description": "",
        "cards": [
          {
            "title": "无需拍摄也能创建高清样片",
            "description": "从提示词、参考图或早期创意出发，在正式制作前先生成一版高清 AI 视频样片。借助 Lanta AI，你可以提前测试想法的情绪、节奏、构图和视觉方向，无论你是在做提案、准备概念演示，还是在开拍前预览一个场景。",
            "bullets": [],
            "image": "",
            "video": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-hd-video-drafts.mp4",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "让静态图片变成流畅的视频运动",
            "description": "把产品图、人像、角色插画和概念图转化为带有自然镜头运动和视觉连贯性的视频画面。与其让一张好图停留在静态帧，不如用 Lanta AI 看看它在运动镜头里会呈现出怎样的节奏、氛围与动感。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-image-to-video-motion.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "制作衔接更自然的多镜头视频",
            "description": "创建从一个镜头自然流向下一个镜头的短片序列。你可以通过提示词控制节奏、转场、镜头方向和视觉推进，让视频不再像一段段分离的 AI 片段，而更像经过剪辑的完整场景。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-multi-shot-video-flow.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "在镜头运动中保持同一角色一致",
            "description": "当镜头移动、角度变化或机位切换时，尽量让人物、虚拟形象或风格化角色保持一致。使用 Lanta AI，可以更好地保留主体的视觉身份，让角色驱动的视频更稳定，也更容易继续打磨。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-consistent-character-shot.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-image-to-video-motion.png",
            "alt": "Still image turned into smooth cinematic motion with Lanta AI Video Maker"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-multi-shot-video-flow.png",
            "alt": "Multi-shot AI video sequence with smoother pacing and scene transitions"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-maker-consistent-character-shot.png",
            "alt": "Consistent AI character preserved across motion and camera angle changes"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "在一个地方试用多个 AI 视频模型",
        "description": "不用在不同 AI 视频工具之间来回切换。借助 Lanta AI，你可以在一个页面里试用多个视频模型、对比结果，并挑选你最满意的视频。",
        "cards": [
          {
            "title": "Grok Imagine",
            "description": "快速创意生成",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ad3ef36b-b8fa-4f8a-9587-8c0774cda18f.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Happy Horse 1.0",
            "description": "电影级多参考视频",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Seedance 2.0 Fast",
            "description": "快速多模态创作",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/aeaf14e8-5cdc-4dad-877d-8d731cbb1333.svg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Wan 2.6",
            "description": "故事流动与角色连续性",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Kling 3.0",
            "description": "导演级控制力",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/95daf4be-14da-4a44-85fd-94662230238b.svg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Lanta 2.1",
            "description": "快速且高性价比创作",
            "bullets": [],
            "image": "https://cdn.lantaai.com/logos/icon-192.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ad3ef36b-b8fa-4f8a-9587-8c0774cda18f.png",
            "alt": "Grok Imagine Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "alt": "Happy Horse 1.0 Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/resources/aeaf14e8-5cdc-4dad-877d-8d731cbb1333.svg",
            "alt": "Seedance 2.0 Fast Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "alt": "Wan 2.6 Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/resources/95daf4be-14da-4a44-85fd-94662230238b.svg",
            "alt": "Kling 3.0 Model Logo"
          },
          {
            "src": "https://cdn.lantaai.com/logos/icon-192.png",
            "alt": "Lanta 2.1 Model Logo"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "如何在 Lanta AI 上制作 AI 视频",
        "description": "",
        "cards": [
          {
            "title": "步骤 1：选择模式",
            "description": "选择文生视频或图生视频。输入提示词，或上传一张或多张参考图片，再描述你希望出现的动作、场景或风格。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "步骤 2：选择模型和参数",
            "description": "选择一个 AI 视频模型，然后根据视频用途设置时长、画幅比例和质量。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "步骤 3：生成视频",
            "description": "点击生成，让 Lanta AI 把你的提示词或图片转换成一段 AI 短视频。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "步骤 4：预览并下载",
            "description": "在生成历史中查看结果。你可以下载视频、重新生成，或换一个模型获得不同效果。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/choose-a-mode.png",
            "alt": "Choose a mode in Lanta AI video generator"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "AI 视频生成器的热门用法",
        "description": "",
        "cards": [
          {
            "title": "社交媒体",
            "description": "制作适合 TikTok、Reels、Shorts、梗图、同人剪辑和快速内容测试的吸睛短片。你可以从提示词、人像、产品图或角色概念开始，先看看它变成短视频后的效果，再决定是否投入更多剪辑时间。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-social-media.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "广告与营销",
            "description": "把产品拍摄图、活动创意和视觉概念转成广告或电商用的短视频样片。先测试产品亮相方式、生活方式场景、社媒钩子和创意变体，再决定是否安排完整拍摄或投放。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-ads-marketing.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "电影与叙事",
            "description": "在搭建完整序列之前先预览单个场景。用 Lanta AI 测试镜头运动、情绪灯光、节奏、角色时刻和分镜思路，提前判断一个场景在动态里是否成立。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-film-storytelling.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "动漫与游戏",
            "description": "基于提示词或参考图，为风格化角色、虚拟形象、幻想世界和游戏感场景赋予运动。你可以制作角色开场、动作片段、同人风格剪辑或带有明确视觉身份的短故事时刻。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-anime-game.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          },
          {
            "title": "音乐与舞蹈",
            "description": "为音乐视频、舞蹈概念、歌词背景和实验艺术项目创建动态视觉。无需从零搭建每一帧，也能探索节奏、氛围、灯光、运动和抽象视觉表达。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-music-dance.png",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "#generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-social-media.png",
            "alt": "Social media short-form video examples created with Lanta AI Video Generator"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-ads-marketing.png",
            "alt": "Product ad and marketing video drafts created with Lanta AI Video Generator"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-film-storytelling.png",
            "alt": "Cinematic scene and storyboard preview created with Lanta AI Video Generator"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-anime-game.png",
            "alt": "Anime and game-style character video created with Lanta AI Video Generator"
          },
          {
            "src": "https://cdn.lantaai.com/resources/ai-video-generator/lanta-ai-video-generator-use-case-music-dance.png",
            "alt": "Music and dance visual concept video created with Lanta AI Video Generator"
          }
        ],
        "table": [],
        "tabs": [
          "社交媒体",
          "广告与营销",
          "电影与叙事",
          "动漫与游戏",
          "音乐与舞蹈"
        ],
        "videos": []
      },
      {
        "title": "探索更多 AI 视频工具",
        "description": "",
        "cards": [
          {
            "title": "AI 图片转视频",
            "description": "把静态图片转成带有运动、氛围和镜头移动的短视频场景。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/user-upload/69134411-f39a-4f81-89f5-e9361166074c.jpg",
            "video": "https://cdn.lantaai.com/videos/62197007-ef38-48d0-a1fb-2a085c05fa82.mp4",
            "prompt": "",
            "source": "",
            "href": "/zh/tools/ai-image-to-video"
          },
          {
            "title": "视频转动画转换器",
            "description": "把真实视频快速转成风格化动画视觉，更适合创意方案的快速迭代。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/videos/4879ec7a-9419-49ed-89cd-8da719630067.jpg",
            "video": "https://cdn.lantaai.com/videos/4879ec7a-9419-49ed-89cd-8da719630067.mp4",
            "prompt": "",
            "source": "",
            "href": "/zh/tools/video-to-animation-converter"
          },
          {
            "title": "角色动画",
            "description": "根据提示词或参考素材，让风格化角色和虚拟形象动起来。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/b06c264a-0de1-415e-a2b9-7dde1f401e1d/v1/Character-Animation-tool-preview/poster.jpg",
            "video": "https://cdn.lantaai.com/resources/b06c264a-0de1-415e-a2b9-7dde1f401e1d/v1/Character-Animation-tool-preview/w1280.mp4",
            "prompt": "",
            "source": "",
            "href": "/tools/character-animation"
          },
          {
            "title": "AI 口型同步视频生成器",
            "description": "创建带有口型同步效果的说话或歌唱角色视频，强化表演感和镜头表现。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/6d8f54f4-4101-45c1-9ef9-3ba2da69df87.webp",
            "video": "https://cdn.lantaai.com/resources/e43c96f4-5d1a-436a-a962-09d3b2fc4b87.mp4",
            "prompt": "",
            "source": "",
            "href": "/tools/ai-lip-sync-video-generator"
          },
          {
            "title": "AI 接吻视频生成器",
            "description": "用一张情侣照片或两张单人肖像生成带有浪漫动作和自然表情的 AI 接吻视频。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/videos/51e2dbcd-d34f-43bc-8e4d-a5e01212687f.jpg",
            "video": "https://cdn.lantaai.com/resources/95715f38-1815-4a07-bec3-2da1d852718c/v1/419a5978-28c3-4c28-97e7-9b7fbe2f8501/w1280.mp4",
            "prompt": "",
            "source": "",
            "href": "/zh/tools/ai-kissing-video-generator"
          },
          {
            "title": "AI 拥抱视频生成器",
            "description": "把照片变成温暖的 AI 拥抱视频，适合家庭回忆、友情瞬间和情感短片。",
            "bullets": [],
            "image": "https://cdn.lantaai.com/videos/dad2a773-a269-40c6-a9a4-37f6d2c326ac.jpg",
            "video": "https://cdn.lantaai.com/videos/dad2a773-a269-40c6-a9a4-37f6d2c326ac.mp4",
            "prompt": "",
            "source": "",
            "href": "/zh/tools/ai-hug-video-generator"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/user-upload/69134411-f39a-4f81-89f5-e9361166074c.jpg",
            "alt": "AI Image to Video tool preview"
          },
          {
            "src": "https://cdn.lantaai.com/videos/4879ec7a-9419-49ed-89cd-8da719630067.jpg",
            "alt": "Video to Animation Converter tool preview"
          },
          {
            "src": "https://cdn.lantaai.com/resources/b06c264a-0de1-415e-a2b9-7dde1f401e1d/v1/Character-Animation-tool-preview/poster.jpg",
            "alt": "Character Animation tool preview"
          },
          {
            "src": "https://cdn.lantaai.com/resources/6d8f54f4-4101-45c1-9ef9-3ba2da69df87.webp",
            "alt": "AI Lip Sync Video Generator tool preview"
          },
          {
            "src": "https://cdn.lantaai.com/videos/51e2dbcd-d34f-43bc-8e4d-a5e01212687f.jpg",
            "alt": "AI 接吻视频生成器预览图"
          },
          {
            "src": "https://cdn.lantaai.com/videos/dad2a773-a269-40c6-a9a4-37f6d2c326ac.jpg",
            "alt": "AI 拥抱视频生成器预览图"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "AI 视频生成评测与指南",
        "description": "",
        "cards": [
          {
            "title": "Kling 3.0 评测：更强的 AI 视频控制力",
            "description": "",
            "bullets": [],
            "image": "https://cdn.lantaai.com/outputs/83015244-e4cc-47cc-a784-c6622a20ce08.jpg",
            "video": "https://cdn.lantaai.com/resources/ai-video-models/kling-3-0/kling-3-0-cinematic.mp4",
            "prompt": "",
            "source": "",
            "href": "https://www.lantaai.com/blog/kling-3-0-review"
          },
          {
            "title": "HappyHorse 1.0 评测：它能减少 AI 视频失败吗？",
            "description": "",
            "bullets": [],
            "image": "https://cdn.lantaai.com/outputs/651458cc-2141-439c-8345-74f4937877e2.jpg",
            "video": "https://cdn.lantaai.com/outputs/651458cc-2141-439c-8345-74f4937877e2.mp4",
            "prompt": "",
            "source": "",
            "href": "https://www.lantaai.com/blog/happyhorse-1-0-review"
          },
          {
            "title": "Kling AI 2026 指南：更真实 AI 视频的创作者路线",
            "description": "",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/dea743f7-905d-42a7-aa51-f02138790fad/v1/kling-2.6-preview/poster.jpg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "https://www.lantaai.com/blog/kling-ai-realistic-ai-video-2026"
          },
          {
            "title": "文生视频 AI 的工作原理",
            "description": "",
            "bullets": [],
            "image": "https://cdn.lantaai.com/resources/5e0d3054-7d7a-4201-8052-0db438bb84a9/v1/cb4ecf84-da61-49d2-9039-db7e55239bc2/poster.jpg",
            "video": "",
            "prompt": "",
            "source": "",
            "href": "https://www.lantaai.com/blog/text-to-video-artificial-intelligence-how-it-works"
          }
        ],
        "images": [
          {
            "src": "https://cdn.lantaai.com/outputs/83015244-e4cc-47cc-a784-c6622a20ce08.jpg",
            "alt": "Kling 3.0 review preview video"
          },
          {
            "src": "https://cdn.lantaai.com/outputs/651458cc-2141-439c-8345-74f4937877e2.jpg",
            "alt": "HappyHorse 1.0 review preview video"
          },
          {
            "src": "https://cdn.lantaai.com/resources/dea743f7-905d-42a7-aa51-f02138790fad/v1/kling-2.6-preview/poster.jpg",
            "alt": "Kling AI realistic video guide cover image"
          },
          {
            "src": "https://cdn.lantaai.com/resources/5e0d3054-7d7a-4201-8052-0db438bb84a9/v1/cb4ecf84-da61-49d2-9039-db7e55239bc2/poster.jpg",
            "alt": "Text to video artificial intelligence guide cover image"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "AI 视频制作器常见问题",
        "description": "",
        "cards": [
          {
            "title": "Lanta AI 视频生成器是如何工作的？",
            "description": "公开参照中的视频生成器可以把文字描述或参考图片交给所选模型制作短视频。此页面目前只提供本地提示词、参数与文件预览，不会发送生成任务。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "Lanta AI 视频生成器可以免费试用吗？",
            "description": "本项目此模型生成尚未开放，不承诺免费额度、生成速度或生成图片的商用授权。本地文件与参数预览不扣额度；已有AI美妆继续按账户实际规则运行。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "生成一个 AI 视频需要多久？",
            "description": "本项目此模型生成尚未开放，不承诺免费额度、生成速度或生成图片的商用授权。本地文件与参数预览不扣额度；已有AI美妆继续按账户实际规则运行。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "我可以同时用文本和图片生成视频吗？",
            "description": "你可以在此切换文生视频和图生视频面板，检查对应字段和模型参数；选择的参考文件仅在本机预览。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "我该选择哪个 AI 视频模型？",
            "description": "公开资料将模型分别用于快速创意、多参考、叙事和镜头控制等场景。可浏览Wan、Seedance、Kling、Grok等已观察模型的参数，名称不代表本项目已接入provider。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "我可以用 Lanta AI 生成哪些类型的视频？",
            "description": "公开示例包含社交短片、产品广告、电影分镜、动漫角色、音乐和舞蹈概念。这些只是外部模型的参考展示，不是本项目生成结果。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "怎样才能得到更好的 AI 视频结果？",
            "description": "可先明确主体、动作、场景、镜头、灯光和风格，并使用清晰参考图；复杂任务可先拆短镜头。这些是创作建议，不构成本项目生成质量承诺。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "如何制作更长的 AI 视频？",
            "description": "公开参照可通过模型时长选项或分段创作得到较长内容。已观察Wan2.5的10秒需要会员，本地保留该门槛并维持5秒；不提供购买或解锁。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          },
          {
            "title": "AI 视频生成失败会浪费积分吗？",
            "description": "本项目此模型生成尚未开放，不承诺免费额度、生成速度或生成图片的商用授权。本地文件与参数预览不扣额度；已有AI美妆继续按账户实际规则运行。",
            "bullets": [],
            "image": "",
            "video": "",
            "prompt": "",
            "source": "",
            "href": ""
          }
        ],
        "images": [],
        "table": [],
        "tabs": [],
        "videos": []
      },
      {
        "title": "立即免费体验 Lanta AI 视频生成器！",
        "description": "",
        "cards": [],
        "images": [
          {
            "src": "https://www.lantaai.com/logos/icon-192.png",
            "alt": "Lanta AI logo"
          }
        ],
        "table": [],
        "tabs": [],
        "videos": []
      }
    ]
  }
};
