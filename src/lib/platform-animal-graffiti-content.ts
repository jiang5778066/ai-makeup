import type { Locale } from './i18n';
export type AnimalGraffitiTool = 'animal' | 'graffiti';
export type AnimalGraffitiCard = {title:string;paragraphs:string[];bullets:string[];image?:string};
export type AnimalGraffitiSection = {kind:string;title:string;intro:string[];cards:AnimalGraffitiCard[];links:{title:string;path:string}[];body?:string};
export type AnimalGraffitiContent = {title:string;paragraphs:string[];sections:AnimalGraffitiSection[];faq:{q:string;a:string;observed:boolean}[]};
// 正文来自45、48公开参照及本批有界观察；FAQ逐题保留实观/拟译身份。
export const animalGraffitiContent:Record<AnimalGraffitiTool,Record<Locale,AnimalGraffitiContent>> = {
  "animal": {
    "en": {
      "title": "AI Animal Generator",
      "paragraphs": [
        "Create realistic wildlife, cute cartoon pets, animal characters, fantasy creatures, and more from a text prompt or reference image."
      ],
      "sections": [
        {
          "kind": "intro",
          "title": "What Is an AI Animal Generator?",
          "intro": [
            "An AI Animal Generator is a tool that helps you create animal images automatically using artificial intelligence. You can either describe the image you want with text or upload a reference image to guide the result.",
            "This makes it easy to create many kinds of animal visuals, including realistic animal portraits, stylized pet art, cartoon animals, anime creatures, fantasy hybrids, and more."
          ],
          "cards": [],
          "links": []
        },
        {
          "kind": "steps",
          "title": "How to Use the AI Animal Generator",
          "intro": [
            "Creating animal images with AI is simple. Follow these three steps."
          ],
          "cards": [
            {
              "title": "Choose Text to Image or Image to Image",
              "paragraphs": [
                "Start with the mode that fits your idea. Use Text to Image if you want to create an animal from a written prompt. Use Image to Image if you want to upload a reference image and transform it."
              ],
              "bullets": []
            },
            {
              "title": "Enter your prompt or upload your image",
              "paragraphs": [
                "Describe the animal you want to create, or upload an image and add instructions to guide the result. You can create anything from a realistic tiger to a cute cartoon bunny or a fantasy fox."
              ],
              "bullets": []
            },
            {
              "title": "Generate and download",
              "paragraphs": [
                "Click generate, review the result, and download your animal image when it looks right. You can also refine the prompt or try another input image to improve the output."
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "styles",
          "title": "Create Animal Images in Different Styles",
          "intro": [
            "Our AI Animal Generator supports many creative directions depending on your prompt or reference image."
          ],
          "cards": [
            {
              "title": "Realistic Animal Images",
              "paragraphs": [
                "Generate lifelike animals with natural fur, lighting, texture, and environment details. Perfect for wildlife-themed content, wallpapers, and professional visuals."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/eb088737-9733-4c53-b45b-da6df533b850.jpeg"
            },
            {
              "title": "Cute & Cartoon Animals",
              "paragraphs": [
                "Create charming and playful animal visuals for stickers, social posts, gifts, and casual content. Make clean, colorful illustrations for kids' content, mascots, and branding."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/fa167ab5-ef67-4fb1-b78e-200af7ab0a2c.jpeg"
            },
            {
              "title": "Anime & Fantasy Creatures",
              "paragraphs": [
                "Design expressive fantasy animals and stylized creature art inspired by anime aesthetics. Perfect for character concepts, fantasy art, and storytelling projects."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/8df9afc0-3592-42d4-8b9a-9b600947412c.jpeg"
            },
            {
              "title": "3D & Pixel Art Animals",
              "paragraphs": [
                "Create polished 3D-style animals for mascots, concept design, and modern visual content. Generate retro-inspired pixel art for games, icons, and nostalgic design projects."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/1c88e655-bd3c-487e-8b1d-61d735ef7b45.jpeg"
            }
          ],
          "links": []
        },
        {
          "kind": "gallery",
          "title": "Example Animal Images You Can Create",
          "intro": [
            "See what is possible with our AI Animal Generator. Hover over each example to see and copy the prompt."
          ],
          "cards": [
            {
              "title": "Realistic",
              "image": "https://cdn.lantaai.com/images/2b290005-5133-42ba-b79b-06b6805a07be.jpeg",
              "paragraphs": [
                "A majestic lion standing on a rocky cliff at sunrise, detailed fur, cinematic lighting",
                "Wildlife content, wallpapers, blog visuals"
              ],
              "bullets": []
            },
            {
              "title": "Cute Cartoon",
              "image": "https://cdn.lantaai.com/images/e598d7b5-5975-4f08-8d28-504e34883923.png",
              "paragraphs": [
                "A happy baby panda holding bamboo in a pastel forest, soft rounded shapes, adorable expression",
                "Kids' content, stickers, social media"
              ],
              "bullets": []
            },
            {
              "title": "Anime",
              "image": "https://cdn.lantaai.com/images/8ae37a14-55c7-44d8-9ccb-e8b9ce677154.jpeg",
              "paragraphs": [
                "A mystical white fox with glowing blue eyes under the moon, fantasy anime atmosphere",
                "Character concepts, fantasy art, profiles"
              ],
              "bullets": []
            },
            {
              "title": "3D Render",
              "image": "https://cdn.lantaai.com/images/201ebcf8-2423-43cb-8c44-38f86ebb56ce.jpeg",
              "paragraphs": [
                "A playful corgi wearing a tiny backpack, polished 3D render, soft studio lighting",
                "Mascot concepts, ads, branding"
              ],
              "bullets": []
            },
            {
              "title": "Pixel Art",
              "image": "https://cdn.lantaai.com/images/699a1188-e2c1-42e5-b08f-c461d680ac06.jpeg",
              "paragraphs": [
                "A pixel-style orange fox in a forest clearing, retro game look, clean block detail",
                "Indie games, icons, retro assets"
              ],
              "bullets": []
            },
            {
              "title": "Pet Portrait",
              "image": "https://cdn.lantaai.com/images/71bdb9ee-4b2d-4b30-aa61-3f0826daab2b.jpeg",
              "paragraphs": [
                "A golden retriever sitting in a garden, warm natural light, ultra-detailed eyes and fur",
                "Pet art, gifts, keepsakes"
              ],
              "bullets": []
            },
            {
              "title": "Fantasy Creature",
              "image": "https://cdn.lantaai.com/images/e0b36b49-badb-4656-af0d-28bed0fe961c.jpeg",
              "paragraphs": [
                "A dragon-wolf hybrid running through glowing mountains, epic fantasy illustration",
                "Worldbuilding, concept art, stories"
              ],
              "bullets": []
            },
            {
              "title": "Cute Chibi",
              "image": "https://cdn.lantaai.com/images/cc37887c-0e7e-40dd-8968-2a65704fbd3d.jpeg",
              "paragraphs": [
                "A tiny penguin wearing a scarf, snowy background, cheerful colors",
                "Merch, avatars, seasonal content"
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "features",
          "title": "Why Use Our AI Animal Generator?",
          "intro": [],
          "cards": [
            {
              "title": "Text to animal image creation",
              "paragraphs": [
                "Turn simple ideas into animal images in seconds. Just enter a prompt and let the AI generate the result."
              ],
              "bullets": []
            },
            {
              "title": "Image to animal transformation",
              "paragraphs": [
                "Upload a reference image and use AI to turn it into a new animal-style image. Useful for stylized reinterpretation and creative exploration."
              ],
              "bullets": []
            },
            {
              "title": "Multiple visual styles",
              "paragraphs": [
                "Create realistic, cartoon, cute, anime, 3D, and pixel animal images. Wide range of creative directions supported."
              ],
              "bullets": []
            },
            {
              "title": "Fast online workflow",
              "paragraphs": [
                "Generate animal images directly in your browser without complex editing software. Quick and efficient."
              ],
              "bullets": []
            },
            {
              "title": "Easy for beginners",
              "paragraphs": [
                "You do not need design experience to create good-looking animal images. A clear prompt or reference image is enough."
              ],
              "bullets": []
            },
            {
              "title": "Great for creative projects",
              "paragraphs": [
                "Use AI-generated animal images for storytelling, social media, branding ideas, educational content, and character design."
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "tips",
          "title": "How to Get Better Results",
          "intro": [],
          "cards": [],
          "links": [],
          "body": "A stronger prompt usually leads to a better image. Try to include these elements.\n\nInclude in your prompt:\nAnimal type(fox, lion, bunny, owl)\nVisual style(realistic, cartoon, anime, 3D)\nPose or action(sitting, running, sleeping, flying)\nBackground(forest, studio, clouds, flower field)\nMood or lighting(soft morning light, dramatic, cozy)\nLevel of detail(ultra-detailed, simple, minimalist)\nExample comparison:\n\nInstead of:\n\n\"fox\"\n\nTry:\n\n\"A cute orange fox sitting in a flower field, soft morning light, cartoon illustration, bright colors\""
        },
        {
          "kind": "usecases",
          "title": "Use Cases for AI-Generated Animals",
          "intro": [
            "Discover how creators use AI animal images in their projects."
          ],
          "cards": [
            {
              "title": "Social Media Content",
              "paragraphs": [
                "Create eye-catching animal images for posts, covers, stories, and short-form campaigns that stand out in feeds."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/e13c2679-f79c-4e3b-a70b-55e5c7ef2ee8.jpeg"
            },
            {
              "title": "Storytelling & Education",
              "paragraphs": [
                "Generate visuals for children's books, educational materials, visual explainers, and themed storytelling projects."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/ce4cff79-b919-4f03-8a8a-1e670e20daa4.png"
            },
            {
              "title": "Character & Mascot Design",
              "paragraphs": [
                "Explore animal ideas for mascots, logos, brand characters, and creative marketing campaigns."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/1763035d-14ba-4f70-9675-be0d7bb8d86c.jpeg"
            },
            {
              "title": "Game & Creative Design",
              "paragraphs": [
                "Use AI-generated animals as concept references for games, virtual worlds, collectible art, and illustrations."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/6208893d-5d52-4f5c-976a-486f05cc9f31.jpeg"
            },
            {
              "title": "Pet-Inspired Art",
              "paragraphs": [
                "Turn prompts or reference photos into creative animal portraits and stylized pet visuals for personal keepsakes."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/bf637dde-a5fa-48e7-95ec-872e1d22cd06.jpeg"
            },
            {
              "title": "Artistic Exploration",
              "paragraphs": [
                "Experiment with different art styles, from watercolor to cyberpunk, creating unique animal artwork for portfolios."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/2338bcf0-6ce7-4009-af30-f1e12443ac17.jpeg"
            }
          ],
          "links": []
        },
        {
          "kind": "benefits",
          "title": "Why People Use AI to Generate Animals",
          "intro": [],
          "cards": [],
          "links": [],
          "body": "Using AI to create animal images gives users a faster and more flexible way to explore ideas.\n\nIt saves time compared with drawing from scratch\n\nIt helps non-designers create strong visual concepts\n\nIt supports both text-based and image-based creation\n\nIt makes it easier to test different animal styles\n\nIt works well for fun, inspiration, and practical creative work\n\nIf you want to generate animals with AI free, an online tool like this is one of the easiest ways to turn ideas into images.\n\nFAQ"
        },
        {
          "kind": "faq",
          "title": "Frequently Asked Questions",
          "intro": [],
          "cards": [
            {
              "title": "什么是 AI 动物生成器？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "这个 AI 动物生成器可以免费使用吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "我可以只用文字让 AI 生成动物吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "我可以上传照片来创建动物图像吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "我可以创建哪些类型的动物图像？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "这个工具适合生成真实动物图像吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "我可以用 AI 创建卡通或可爱动物吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "使用这个工具需要设计经验吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "什么样的提示词更适合 AI 动物生成器？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "AI 生成的动物图像可以用来做什么？",
              "paragraphs": [],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "related",
          "title": "Explore More AI Tools",
          "intro": [
            "You may also like these related tools for your creative projects."
          ],
          "cards": [],
          "links": [
            {
              "title": "AI Image Generator",
              "path": "/ai-image-generator"
            },
            {
              "title": "AI Wallpaper Generator",
              "path": "/tools/ai-wallpaper-generator"
            },
            {
              "title": "AI Image to Video",
              "path": "/tools/ai-image-to-video"
            },
            {
              "title": "AI Graffiti Generator",
              "path": "/tools/ai-graffiti-generator"
            },
            {
              "title": "Image to Ghibli Style",
              "path": "/image-style-converter"
            },
            {
              "title": "AI Animate Image Generator",
              "path": "/tools/ai-animate-image-generator"
            },
            {
              "title": "AI Text to Video",
              "path": "/tools/ai-text-to-video"
            },
            {
              "title": "Nano Banana Pro",
              "path": "/ai-image-models/nano-banana-pro"
            }
          ]
        },
        {
          "kind": "cta",
          "title": "Start Creating Animal Images with AI",
          "intro": [
            "Create realistic animals, cute pets, cartoon characters, anime creatures, fantasy beasts, and more with our AI Animal Generator. Start from a text prompt or transform an existing image into a new animal-style creation in just a few clicks."
          ],
          "cards": [],
          "links": [
            {
              "title": "生成动物图像",
              "path": "#generator"
            }
          ]
        }
      ],
      "faq": [
        {
          "q": "What is an AI Animal Generator?",
          "a": "An AI Animal Generator creates animal images from a text prompt or reference image, including realistic, cartoon, cute, anime, 3D, and pixel art styles.",
          "observed": false
        },
        {
          "q": "Can I use this AI Animal Generator for free?",
          "a": "It is free to try for exploring ideas, testing prompts, and creating animal images online.",
          "observed": false
        },
        {
          "q": "Can I generate animals with AI from text?",
          "a": "Yes. Text to Image creates an animal image from your description.",
          "observed": false
        },
        {
          "q": "Can I upload a photo to create an animal image?",
          "a": "Yes. Image to Image transforms an uploaded reference into a new animal-style image.",
          "observed": false
        },
        {
          "q": "What kinds of animal images can I create?",
          "a": "You can create realistic animals, cute illustrations, cartoon animals, anime creatures, 3D renders, pixel animals, and fantasy concepts.",
          "observed": false
        },
        {
          "q": "Is this good for realistic animal images?",
          "a": "Yes. Detailed prompts help with realistic fur, lighting, anatomy, and natural environments.",
          "observed": false
        },
        {
          "q": "Can I make cartoon or cute animals with AI?",
          "a": "Yes. Cute and cartoon animal images are popular uses of an AI animal generator.",
          "observed": false
        },
        {
          "q": "Do I need design skills to use this tool?",
          "a": "No. The tool is designed to make animal image creation approachable for beginners.",
          "observed": false
        },
        {
          "q": "What makes a good prompt for an AI Animal Generator?",
          "a": "A good prompt includes the animal type, visual style, setting, lighting, mood, and any important details you want the AI to follow.",
          "observed": true
        },
        {
          "q": "What can I use AI-generated animal images for?",
          "a": "They can be used for social media, concept design, education, branding ideas, storytelling, personal projects, and creative inspiration, depending on your usage needs.",
          "observed": true
        }
      ]
    },
    "zh-CN": {
      "title": "AI 动物生成器",
      "paragraphs": [
        "从文本提示词或参考图片生成真实野生动物、可爱卡通宠物、动物角色、奇幻生物等多种图像。"
      ],
      "sections": [
        {
          "kind": "intro",
          "title": "什么是 AI 动物生成器？",
          "intro": [
            "AI 动物生成器是一种使用人工智能自动创建动物图像的工具。你可以直接用文字描述想要的画面，也可以上传参考图片来引导生成结果。",
            "它能帮助你快速创建多种动物视觉内容，包括真实动物肖像、风格化宠物艺术、卡通动物、动漫生物、奇幻混种动物等。"
          ],
          "cards": [],
          "links": []
        },
        {
          "kind": "steps",
          "title": "如何使用 AI 动物生成器",
          "intro": [
            "用 AI 创建动物图像非常简单，按照以下三个步骤即可。"
          ],
          "cards": [
            {
              "title": "选择文生图或图生图",
              "paragraphs": [
                "根据你的创意选择合适模式。如果你想从文字描述开始生成动物图像，使用文生图；如果你想上传参考图并进行变换，使用图生图。"
              ],
              "bullets": []
            },
            {
              "title": "输入提示词或上传图片",
              "paragraphs": [
                "描述你想创建的动物，或上传一张图片并补充说明来引导结果。你可以生成真实老虎、可爱卡通兔子，或者奇幻狐狸等各种形象。"
              ],
              "bullets": []
            },
            {
              "title": "生成并下载",
              "paragraphs": [
                "点击生成，查看结果满意后即可下载。如果还想优化效果，也可以继续修改提示词或更换参考图。"
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "styles",
          "title": "以不同风格创建 动物图像",
          "intro": [
            "我们的 AI 动物生成器支持多种创作方向，具体效果取决于你的提示词或参考图。"
          ],
          "cards": [
            {
              "title": "真实动物图像",
              "paragraphs": [
                "生成带有自然毛发、光线、质感和环境细节的逼真动物图像，适合野生动物内容、壁纸和专业视觉素材。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/eb088737-9733-4c53-b45b-da6df533b850.jpeg"
            },
            {
              "title": "可爱与卡通动物",
              "paragraphs": [
                "创建适合贴纸、社交媒体、礼物和日常内容的可爱动物画面，也能为儿童内容、吉祥物和品牌图形制作干净明快的插画。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/fa167ab5-ef67-4fb1-b78e-200af7ab0a2c.jpeg"
            },
            {
              "title": "动漫与奇幻生物",
              "paragraphs": [
                "设计带有动漫氛围的幻想动物和风格化生物图像，适合角色概念图、奇幻艺术和故事项目。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/8df9afc0-3592-42d4-8b9a-9b600947412c.jpeg"
            },
            {
              "title": "3D 与像素风动物",
              "paragraphs": [
                "创建适合吉祥物、概念设计和现代视觉内容的 3D 动物图像，也能生成复古像素风动物，用于游戏、图标和怀旧设计项目。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/1c88e655-bd3c-487e-8b1d-61d735ef7b45.jpeg"
            }
          ],
          "links": []
        },
        {
          "kind": "gallery",
          "title": "你可以创建的动物图像 示例效果",
          "intro": [
            "看看我们的 AI 动物生成器可以实现哪些效果。将鼠标悬停在图片上即可查看并复制提示词。"
          ],
          "cards": [
            {
              "title": "真实风格",
              "image": "https://cdn.lantaai.com/images/2b290005-5133-42ba-b79b-06b6805a07be.jpeg",
              "paragraphs": [
                "一只雄伟的狮子站在日出时分的岩石悬崖上，毛发细节丰富，电影感光线",
                "野生动物内容、壁纸、博客配图"
              ],
              "bullets": []
            },
            {
              "title": "可爱卡通",
              "image": "https://cdn.lantaai.com/images/e598d7b5-5975-4f08-8d28-504e34883923.png",
              "paragraphs": [
                "一只快乐的小熊猫抱着竹子，置身柔和粉彩森林中，圆润造型，可爱表情",
                "儿童内容、贴纸、社交媒体"
              ],
              "bullets": []
            },
            {
              "title": "动漫风",
              "image": "https://cdn.lantaai.com/images/8ae37a14-55c7-44d8-9ccb-e8b9ce677154.jpeg",
              "paragraphs": [
                "一只白色神秘狐狸站在月光下，拥有发光的蓝色眼睛，奇幻动漫氛围",
                "角色设定、奇幻艺术、头像"
              ],
              "bullets": []
            },
            {
              "title": "3D 渲染",
              "image": "https://cdn.lantaai.com/images/201ebcf8-2423-43cb-8c44-38f86ebb56ce.jpeg",
              "paragraphs": [
                "一只活泼的柯基犬背着小背包，精致 3D 渲染，柔和棚拍光线",
                "吉祥物概念、广告、品牌视觉"
              ],
              "bullets": []
            },
            {
              "title": "像素风",
              "image": "https://cdn.lantaai.com/images/699a1188-e2c1-42e5-b08f-c461d680ac06.jpeg",
              "paragraphs": [
                "一只像素风橙色狐狸站在森林空地中，复古游戏画面，方块细节清晰",
                "独立游戏、图标、复古素材"
              ],
              "bullets": []
            },
            {
              "title": "宠物肖像",
              "image": "https://cdn.lantaai.com/images/71bdb9ee-4b2d-4b30-aa61-3f0826daab2b.jpeg",
              "paragraphs": [
                "一只金毛犬坐在花园里，温暖自然光，眼睛和毛发细节极其丰富",
                "宠物艺术、礼物、纪念图像"
              ],
              "bullets": []
            },
            {
              "title": "奇幻生物",
              "image": "https://cdn.lantaai.com/images/e0b36b49-badb-4656-af0d-28bed0fe961c.jpeg",
              "paragraphs": [
                "一只龙与狼的混种生物奔跑在发光山脉之间，史诗级奇幻插画",
                "世界观设定、概念艺术、故事创作"
              ],
              "bullets": []
            },
            {
              "title": "可爱 Q 版",
              "image": "https://cdn.lantaai.com/images/cc37887c-0e7e-40dd-8968-2a65704fbd3d.jpeg",
              "paragraphs": [
                "一只围着围巾的小企鹅，背景是雪景，色彩明快 cheerful",
                "周边商品、头像、季节性内容"
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "features",
          "title": "为什么使用我们的 AI 动物生成器？",
          "intro": [],
          "cards": [
            {
              "title": "文本生成动物图像",
              "paragraphs": [
                "把简单想法快速变成动物图像。只需输入提示词，AI 就能自动生成结果。"
              ],
              "bullets": []
            },
            {
              "title": "图片转动物风格",
              "paragraphs": [
                "上传参考图片，利用 AI 将其转换成新的动物风格图像，适合做风格重构和创意探索。"
              ],
              "bullets": []
            },
            {
              "title": "支持多种视觉风格",
              "paragraphs": [
                "可生成真实、卡通、可爱、动漫、3D、像素等多种动物图像，创作方向更灵活。"
              ],
              "bullets": []
            },
            {
              "title": "高效在线工作流",
              "paragraphs": [
                "直接在浏览器中生成动物图像，无需复杂的图像编辑软件，流程快速高效。"
              ],
              "bullets": []
            },
            {
              "title": "新手也能轻松使用",
              "paragraphs": [
                "无需设计经验也能做出好看的动物图像，一段清晰提示词或一张参考图就足够。"
              ],
              "bullets": []
            },
            {
              "title": "适合创意项目",
              "paragraphs": [
                "可将 AI 生成的动物图像用于故事创作、社交媒体、品牌灵感、教育内容和角色设计。"
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "tips",
          "title": "如何获得 更好的结果",
          "intro": [],
          "cards": [],
          "links": [],
          "body": "更完整的提示词通常会带来更好的图像结果。建议尽量包含以下元素。\n\n建议包含在提示词中的内容：\n动物类型(狐狸、狮子、兔子、猫头鹰)\n视觉风格(真实、卡通、动漫、3D)\n姿势或动作(坐着、奔跑、睡觉、飞行)\n背景环境(森林、摄影棚、云层、花田)\n情绪或光线(晨光柔和、戏剧化、温馨)\n细节程度(超细节、简洁、极简)\n示例对比：\n\n不要只写：\n\n\"fox\"\n\n可以改成：\n\n\"一只可爱的橙色狐狸坐在花田里，清晨柔和光线，卡通插画风格，色彩鲜明\""
        },
        {
          "kind": "usecases",
          "title": "AI 动物图像的 使用场景",
          "intro": [
            "看看创作者如何在实际项目中使用 AI 动物图像。"
          ],
          "cards": [
            {
              "title": "社交媒体内容",
              "paragraphs": [
                "为帖子、封面、故事和短内容营销活动创建更吸睛的动物图像。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/e13c2679-f79c-4e3b-a70b-55e5c7ef2ee8.jpeg"
            },
            {
              "title": "故事与教育内容",
              "paragraphs": [
                "为儿童读物、教育材料、视觉化讲解和主题故事项目生成插图。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/ce4cff79-b919-4f03-8a8a-1e670e20daa4.png"
            },
            {
              "title": "角色与吉祥物设计",
              "paragraphs": [
                "为吉祥物、Logo、品牌角色和营销创意探索动物形象灵感。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/1763035d-14ba-4f70-9675-be0d7bb8d86c.jpeg"
            },
            {
              "title": "游戏与创意设计",
              "paragraphs": [
                "将 AI 生成的动物作为游戏、虚拟世界、收藏艺术和插画的概念参考。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/6208893d-5d52-4f5c-976a-486f05cc9f31.jpeg"
            },
            {
              "title": "宠物灵感艺术",
              "paragraphs": [
                "把提示词或宠物参考照片变成创意动物肖像和风格化宠物作品，用于纪念或收藏。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/bf637dde-a5fa-48e7-95ec-872e1d22cd06.jpeg"
            },
            {
              "title": "艺术风格探索",
              "paragraphs": [
                "尝试从水彩到赛博朋克等不同艺术风格，为作品集打造独特的动物艺术图像。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/2338bcf0-6ce7-4009-af30-f1e12443ac17.jpeg"
            }
          ],
          "links": []
        },
        {
          "kind": "benefits",
          "title": "为什么人们会用 AI 生成动物图像",
          "intro": [],
          "cards": [],
          "links": [],
          "body": "使用 AI 创建动物图像，能让创作者以更快、更灵活的方式探索视觉想法。\n\n相比从零绘制，更节省时间\n\n帮助非设计用户快速形成明确的视觉概念\n\n同时支持文生图和图生图两种创作方式\n\n更容易测试不同动物风格和方向\n\n既适合娱乐灵感，也适合实际创意工作\n\n如果你想免费用 AI 生成动物图像，这类在线工具是把想法快速变成画面的最简单方式之一。\n\n常见问题"
        },
        {
          "kind": "faq",
          "title": "常见 问题",
          "intro": [],
          "cards": [
            {
              "title": "什么是 AI 动物生成器？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "这个 AI 动物生成器可以免费使用吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "我可以只用文字让 AI 生成动物吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "我可以上传照片来创建动物图像吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "我可以创建哪些类型的动物图像？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "这个工具适合生成真实动物图像吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "我可以用 AI 创建卡通或可爱动物吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "使用这个工具需要设计经验吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "什么样的提示词更适合 AI 动物生成器？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "AI 生成的动物图像可以用来做什么？",
              "paragraphs": [],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "related",
          "title": "探索更多 AI 工具",
          "intro": [
            "这些相关工具也许会对你的创意项目有帮助。"
          ],
          "cards": [],
          "links": [
            {
              "title": "AI图像生成",
              "path": "/ai-image-generator"
            },
            {
              "title": "AI Wallpaper Generator",
              "path": "/tools/ai-wallpaper-generator"
            },
            {
              "title": "AI图生视频",
              "path": "/tools/ai-image-to-video"
            },
            {
              "title": "AI涂鸦生成器",
              "path": "/tools/ai-graffiti-generator"
            },
            {
              "title": "图片转吉卜力风格",
              "path": "/image-style-converter"
            },
            {
              "title": "AI图像动画生成器",
              "path": "/tools/ai-animate-image-generator"
            },
            {
              "title": "AI文生视频",
              "path": "/tools/ai-text-to-video"
            },
            {
              "title": "Nano Banana Pro",
              "path": "/ai-image-models/nano-banana-pro"
            }
          ]
        },
        {
          "kind": "cta",
          "title": "开始用 AI 创建 动物图像",
          "intro": [
            "使用 AI 动物生成器创建真实动物、可爱宠物、卡通角色、动漫生物、奇幻野兽等图像。你既可以从文本提示词开始，也可以把现有图片转换成新的动物风格作品。",
            "可免费试用 · 无需信用卡 · 即刻开始"
          ],
          "cards": [],
          "links": [
            {
              "title": "生成动物图像",
              "path": "#generator"
            }
          ]
        }
      ],
      "faq": [
        {
          "q": "什么是 AI 动物生成器？",
          "a": "AI 动物生成器是一种可以根据文本提示词或参考图片生成动物图像的工具。它能创建真实、卡通、可爱、动漫、3D、像素等多种风格的动物艺术图。",
          "observed": true
        },
        {
          "q": "这个 AI 动物生成器可以免费使用吗？",
          "a": "可以免费试用。它适合用来探索创意、测试提示词，并在线创建动物图像。",
          "observed": true
        },
        {
          "q": "我可以只用文字让 AI 生成动物吗？",
          "a": "可以。通过文生图模式，你只需要描述想要的动物，AI 就会根据提示词生成图像。",
          "observed": true
        },
        {
          "q": "我可以上传照片来创建动物图像吗？",
          "a": "可以。通过图生图模式，你可以上传参考图片，让 AI 将其转换为新的动物风格图像。",
          "observed": true
        },
        {
          "q": "我可以创建哪些类型的动物图像？",
          "a": "你可以生成真实动物、可爱动物插画、卡通动物、动漫生物、3D 动物渲染图、像素动物和奇幻动物概念图等。",
          "observed": true
        },
        {
          "q": "这个工具适合生成真实动物图像吗？",
          "a": "适合。更详细的提示词能帮助 AI 更好地生成真实毛发、光线、解剖结构和自然环境。",
          "observed": true
        },
        {
          "q": "我可以用 AI 创建卡通或可爱动物吗？",
          "a": "当然可以。可爱风和卡通风动物图像正是 AI 动物图像生成器最受欢迎的使用场景之一。",
          "observed": true
        },
        {
          "q": "使用这个工具需要设计经验吗？",
          "a": "不需要。这个工具对新手友好，目标就是让动物图像创作变得更简单、更容易上手。",
          "observed": true
        },
        {
          "q": "什么样的提示词更适合 AI 动物生成器？",
          "a": "好的提示词通常会包含动物类型、视觉风格、场景、光线、氛围以及你希望 AI 遵循的重要细节。",
          "observed": true
        },
        {
          "q": "AI 生成的动物图像可以用来做什么？",
          "a": "你可以将它们用于社交媒体、概念设计、教育内容、品牌灵感、故事创作、个人项目和创意参考等场景。",
          "observed": true
        }
      ]
    }
  },
  "graffiti": {
    "en": {
      "title": "AI Graffiti Generator",
      "paragraphs": [
        "Type your idea and instantly turn it into bold graffiti text, logo concepts, and street-art visuals.",
        "Start free, iterate fast, and generate multiple high-impact directions for merch, posters, social content, and brand concepts."
      ],
      "sections": [
        {
          "kind": "steps",
          "title": "How to Use AI Graffiti Generator in 3 Steps",
          "intro": [
            "No spray painting skills required. Our AI tool understands your imagination and delivers professional-grade results in seconds."
          ],
          "cards": [
            {
              "title": "Select Mode or Upload",
              "paragraphs": [
                "Choose 'Text to Image' to create directly, or upload a photo to apply a 'Image to Image' graffiti transformation."
              ],
              "bullets": []
            },
            {
              "title": "Enter Text & Style",
              "paragraphs": [
                "Write your graffiti wording or core theme, then describe your preferred colors, textures, or street art styles."
              ],
              "bullets": []
            },
            {
              "title": "Get AI-Generated Result",
              "paragraphs": [
                "Click generate, and our AI tool will deliver high-impact graffiti artwork in seconds."
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "features",
          "title": "Why Creators Choose This Tool",
          "intro": [
            "Powered by advanced generative models and a massive street art training set, ensuring every digital stroke feels authentically urban."
          ],
          "cards": [
            {
              "title": "Realistic Spray Simulation",
              "paragraphs": [
                "Accurately recreate the grain, drips, and overspray behavior on surfaces like brick and concrete for a tactile analog feel."
              ],
              "bullets": [
                "Dynamic drip and grain particles",
                "Physical shadow and depth",
                "Custom pressure and flow control"
              ]
            },
            {
              "title": "Wildstyle Text Deconstruction",
              "paragraphs": [
                "Understand the logic of graffiti letter deformation, from retro 3D bubble fonts to complex interwoven wildstyle pieces."
              ],
              "bullets": [
                "Smart 3D perspective warping",
                "Intricate outlining details",
                "Fluid stroke logic integration"
              ]
            },
            {
              "title": "Massive Style Library",
              "paragraphs": [
                "Trained on millions of real-world murals, capturing the rhythm of everything from Old School classics to modern surrealism."
              ],
              "bullets": [
                "Cross-genre style blending",
                "Color psychology suggestions",
                "Custom graphic element extras"
              ]
            },
            {
              "title": "Character & Scene Integration",
              "paragraphs": [
                "Generate recognizable street mascots or abstract characters alongside your text to add narrative depth and visual identity."
              ],
              "bullets": [
                "Text-character synergy",
                "Urban mascot concepts",
                "Deep urban scene mapping"
              ]
            },
            {
              "title": "Extreme Color & Contrast",
              "paragraphs": [
                "Produce high-impact neon, liquid metal, and high-contrast palettes that make your work pop on social media or in pitch decks."
              ],
              "bullets": [
                "Electric gradients & metals",
                "Auto-balance color theory",
                "Custom palette imports"
              ]
            },
            {
              "title": "Production-Grade HD Output",
              "paragraphs": [
                "Support lossless high-definition exports, perfectly suited for streetwear printing, high-res posters, or commercial mockups."
              ],
              "bullets": [
                "Up to 8K resolution rendering",
                "Clean layer-oriented export",
                "Seamless design flow integration"
              ]
            }
          ],
          "links": []
        },
        {
          "kind": "prompts",
          "title": "Prompt Ideas for Text and Logos",
          "intro": [
            "Copy these starting points to generate high-energy graffiti concepts in seconds."
          ],
          "cards": [
            {
              "title": "",
              "image": "https://cdn.lantaai.com/images/aa0f5944-b6e6-4a7a-9843-d00fae6b47c7.jpg",
              "paragraphs": [
                "Wukong-style Monkey King, dynamic kung fu pose, silk robes with gold embroidery, ink graffiti swirls, dragon scale textures, black ink wash with gold spray, high-impact motion."
              ],
              "bullets": []
            },
            {
              "title": "",
              "image": "https://cdn.lantaai.com/images/b907c66a-d55a-42f5-b478-1e519085484b.jpg",
              "paragraphs": [
                "Steampunk graffiti word, bubble letters in brass and copper, gear shadows, cyan glowing highlights, abandoned factory backdrop, ultra-highly detailed textures."
              ],
              "bullets": []
            },
            {
              "title": "",
              "image": "https://cdn.lantaai.com/images/84bd3824-2030-4f60-af53-f6d182d9567a.png",
              "paragraphs": [
                "Psychedelic dreamscape graffiti, rainbow gradient flowing glyphs, floating geometry, intense artistic splatters, fantasy urban landscape, high-contrast expression."
              ],
              "bullets": []
            },
            {
              "title": "",
              "image": "https://cdn.lantaai.com/images/cdbb4f60-708f-4015-817f-2268b474eab5.png",
              "paragraphs": [
                "Cyberpunk anime character, techwear, standing in front of bright graffiti wall, metallic wildstyle letters, neon liquid drips, street fashion vibes, fine 3D spray painting style."
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "usecases",
          "title": "Best Use Cases for AI Graffiti Creator",
          "intro": [
            "Unlock your urban creative energy. From high-end commercial mockups to personal branding, AI graffiti fuels infinite possibilities."
          ],
          "cards": [
            {
              "title": "Streetwear & Merch Previews",
              "paragraphs": [
                "Move beyond flat concepts. Preview how your designs look on hoodies, skateboards, or accessories with realistic spray textures in seconds."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/5180d1fb-9c99-4dfe-bee2-e8de2f70cbb4.png"
            },
            {
              "title": "Independent Music Visuals",
              "paragraphs": [
                "Drafting a hip-hop album cover or tour posters? High-impact AI graffiti perfectly captures avant-garde attitudes and amplifies visual energy."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/5a39f092-313b-49ab-bdd4-af622caea211.jpg"
            },
            {
              "title": "Spatial & Mural Simulations",
              "paragraphs": [
                "Test your vision under different lighting and perspectives before touching a wall. Simulate real-world results to make your mural proposals undeniable."
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/05afe04a-0199-4315-a8b8-a0cfe22c06e7.jpg"
            }
          ],
          "links": []
        },
        {
          "kind": "faq",
          "title": "Frequently Asked Questions",
          "intro": [
            "Practical answers for creators using AI to generate graffiti text, logos, and street-art concepts."
          ],
          "cards": [
            {
              "title": "Can AI Graffiti Generator render exact words or names?",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "What styles can an AI Graffiti Art Generator create?",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "How do I get better results from an ai graffiti logo generator?",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "Can I ai generate graffiti from a photo?",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "Is this different from basic graffiti ai or an ai graffiti maker app?",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "Can I use results for commercial projects?",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "Is AI Graffiti Generator free to start?",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "What is a good prompt formula for an ai graffiti creator?",
              "paragraphs": [],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "related",
          "title": "Related AI Image Tools",
          "intro": [
            "Explore more AI creativity tools to level up your visual production."
          ],
          "cards": [],
          "links": [
            {
              "title": "AI Image Generator",
              "path": "/ai-image-generator"
            },
            {
              "title": "AI Image to Video",
              "path": "/tools/ai-image-to-video"
            },
            {
              "title": "AI Image Editor",
              "path": "/tools/icedit-ai-image-editor"
            },
            {
              "title": "Perchance Image Generator",
              "path": "/tools/perchance-image-generator"
            },
            {
              "title": "Image to Ghibli Style",
              "path": "/image-style-converter"
            },
            {
              "title": "AI Animate Image Generator",
              "path": "/tools/ai-animate-image-generator"
            },
            {
              "title": "AI Text to Video",
              "path": "/tools/ai-text-to-video"
            }
          ]
        },
        {
          "kind": "cta",
          "title": "Create Graffiti Art Start Free",
          "intro": [
            "Upload your concept and let AI generate high-impact urban art in seconds.",
            "Instant Creation · Privacy-Focused · AI-Powered"
          ],
          "cards": [],
          "links": [
            {
              "title": "Try AI Graffiti Generator Now",
              "path": "#generator"
            }
          ]
        }
      ],
      "faq": [
        {
          "q": "Can AI Graffiti Generator render exact words or names?",
          "a": "Yes. Add the exact text in your prompt and keep style instructions short. For complex wildstyle, generate a few variations and pick the most readable one.",
          "observed": true
        },
        {
          "q": "What styles can an AI Graffiti Art Generator create?",
          "a": "You can create bubble letters, stencil looks, 3D graffiti, wildstyle, and clean logo-focused layouts. You can also mix references like cyberpunk, retro, or streetwear.",
          "observed": true
        },
        {
          "q": "How do I get better results from an ai graffiti logo generator?",
          "a": "Use prompts like \"clean outline, centered wordmark, high contrast, minimal overspray.\" Then iterate with small changes to stroke width, shadow depth, and background simplicity.",
          "observed": true
        },
        {
          "q": "Can I ai generate graffiti from a photo?",
          "a": "Yes. Switch to Image to Image mode, upload a reference photo, and describe the final wall texture, color palette, and letter style you want.",
          "observed": true
        },
        {
          "q": "Is this different from basic graffiti ai or an ai graffiti maker app?",
          "a": "This tool is optimized for stronger typography control, cleaner prompt-to-result consistency, and realistic spray texture details for concept work.",
          "observed": true
        },
        {
          "q": "Can I use results for commercial projects?",
          "a": "Yes for concepting and digital assets. For final production, review licensing terms and run a design QA pass before print or public campaigns.",
          "observed": true
        },
        {
          "q": "Is AI Graffiti Generator free to start?",
          "a": "Yes. You can start with limited free credits, then upgrade when you need more generations, faster workflows, or higher-volume output.",
          "observed": true
        },
        {
          "q": "What is a good prompt formula for an ai graffiti creator?",
          "a": "Use this structure: subject text + style + color palette + surface + lighting + mood. Example: \"LANTA, bold 3D graffiti, cyan-magenta palette, brick wall, night neon light, gritty urban mood.\"",
          "observed": true
        }
      ]
    },
    "zh-CN": {
      "title": "AI 涂鸦生成器",
      "paragraphs": [
        "输入一句想法，立即生成有冲击力的涂鸦文字、Logo 概念和街头风视觉。",
        "免费开始，快速迭代，批量生成适用于周边、海报、社媒和品牌创意的高冲击力方案。"
      ],
      "sections": [
        {
          "kind": "steps",
          "title": "如何使用 AI 涂鸦生成器： 3 步完成",
          "intro": [
            "无需专业喷绘技巧。我们的 AI 涂鸦工具能读懂你的所有天马行空，几秒内为你呈现高水平作品。"
          ],
          "cards": [
            {
              "title": "选择或上传参考图",
              "paragraphs": [
                "选择“文字生成”直接开启创作，或者上传一张现成照片，通过“图生图”进行涂鸦化的艺术转换。"
              ],
              "bullets": []
            },
            {
              "title": "输入文案并描述风格",
              "paragraphs": [
                "写下你想呈现的涂鸦文字或主题，并描述心仪的色彩、材质（如金属或霓虹）或艺术流派。"
              ],
              "bullets": []
            },
            {
              "title": "获取 AI 生成结果",
              "paragraphs": [
                "点击生成按钮，我们的 AI 涂鸦工具将在几秒内为你呈现充满冲击力的高清大作。"
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "features",
          "title": "为什么创作者选择 这款工具",
          "intro": [
            "依托先进的生成模型与海量街头艺术训练集，在数字画布上精准重现喷漆艺术的每一个细腻瞬间。"
          ],
          "cards": [
            {
              "title": "真实喷漆质感模拟",
              "paragraphs": [
                "精准重现喷漆在砖墙、混凝土等表面上的颗粒感、下流挂滴落效果和过喷边缘，让数字作品拥有街头艺术的触觉质感。"
              ],
              "bullets": [
                "动态流挂与滴落颗粒",
                "真实物理阴影与厚度",
                "自定义喷压与覆盖率控制"
              ]
            },
            {
              "title": "狂野字风动态解构",
              "paragraphs": [
                "深入理解街头艺术的文字变形逻辑，无论是复古 3D 泡泡字还是交织复杂的狂野字风，都能保持极高的流线感与张力。"
              ],
              "bullets": [
                "智能 3D 透视形变",
                "连笔刻画与勾勒细节",
                "流体线条逻辑加持"
              ]
            },
            {
              "title": "百万级艺术风格库",
              "paragraphs": [
                "模型通过海量真实大作训练，能捕捉从 Old School 经典到现代超现实主义的独特韵律，让 AI 真正“懂”街头。"
              ],
              "bullets": [
                "跨流派风格融合",
                "色彩心理学配色建议",
                "定制化图形元素扩展"
              ]
            },
            {
              "title": "角色与场景化创作",
              "paragraphs": [
                "不仅支持字体生成，还能同步构建具有辨识度的街头吉祥物或抽象角色，极大提升画面的叙事深度与视觉识别度。"
              ],
              "bullets": [
                "角色与字体一键联动",
                "内置海量潮流吉祥物概念",
                "支持城市场景深度映射"
              ]
            },
            {
              "title": "极致色彩与对比度",
              "paragraphs": [
                "生成冲击力极强的霓虹、液态金属及高对比度配色方案，确保你的作品在社交媒体或商业物料中瞬间脱颖而出。"
              ],
              "bullets": [
                "电光渐变与液态金属",
                "自动补色与对比平衡",
                "支持自定义调色板导入"
              ]
            },
            {
              "title": "面向生产的高清流",
              "paragraphs": [
                "支持无损高清导出，生成的视觉方案可直接适配潮牌服饰印花、大型海报背景或商业空间提案等高标准交付场景。"
              ],
              "bullets": [
                "最高支持 8K 级渲染",
                "更纯净的图层化导向",
                "无缝对接后期设计流程"
              ]
            }
          ],
          "links": []
        },
        {
          "kind": "prompts",
          "title": "提示词：适用于 文字与 Logo",
          "intro": [
            "参考这些实用的示例，帮你稳定、快速地生成充满张力的涂鸦大作。"
          ],
          "cards": [
            {
              "title": "",
              "image": "https://cdn.lantaai.com/images/aa0f5944-b6e6-4a7a-9843-d00fae6b47c7.jpg",
              "paragraphs": [
                "武术风猴王，动态功夫姿势，金线刺绣丝绸长袍，墨迹涂鸦旋涡，龙鳞纹理，黑色泼墨与金色喷溅，高冲击力动感。"
              ],
              "bullets": []
            },
            {
              "title": "",
              "image": "https://cdn.lantaai.com/images/b907c66a-d55a-42f5-b478-1e519085484b.jpg",
              "paragraphs": [
                "蒸汽朋克涂鸦字，黄铜与铜色泡泡字，齿轮阴影，亮青色高光，废弃工厂背景，超高细节质感。"
              ],
              "bullets": []
            },
            {
              "title": "",
              "image": "https://cdn.lantaai.com/images/84bd3824-2030-4f60-af53-f6d182d9567a.png",
              "paragraphs": [
                "迷幻梦境涂鸦，彩虹渐变流动字形，漂浮几何体，强烈艺术泼溅，幻想城市场景，高对比度表现。"
              ],
              "bullets": []
            },
            {
              "title": "",
              "image": "https://cdn.lantaai.com/images/cdbb4f60-708f-4015-817f-2268b474eab5.png",
              "paragraphs": [
                "赛博朋克动漫角色，科技穿搭，站在明亮涂鸦墙前，金属狂野字风，霓虹液态滴落，时尚都市氛围，精细 3D 喷绘风格。"
              ],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "usecases",
          "title": "AI 涂鸦创作工具的 热门应用场景",
          "intro": [
            "释放你的街头创意能量。从商业设计预览到个人品牌建设，AI 涂鸦为您提供源源不断的艺术方案。"
          ],
          "cards": [
            {
              "title": "街头潮牌与衍生品预览",
              "paragraphs": [
                "不再局限于平面构想。无论是卫衣印花、滑板面板还是周边衍生品，几秒内即可预览带有真实涂鸦质感的潮流生产效果。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/5180d1fb-9c99-4dfe-bee2-e8de2f70cbb4.png"
            },
            {
              "title": "独立音乐人视觉方案",
              "paragraphs": [
                "筹备说唱专辑封面、Livehouse 海报或社媒宣传？自带张力的 AI 涂鸦能完美契合先锋态度，提升作品的视觉爆发力。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/5a39f092-313b-49ab-bdd4-af622caea211.jpg"
            },
            {
              "title": "城市空间与墙绘模拟",
              "paragraphs": [
                "在正式动笔喷绘前，先在不同光影、透视条件下测试方案。通过 AI 模拟建筑墙面的落地质感，让你的空间改造提案更具说服力。"
              ],
              "bullets": [],
              "image": "https://cdn.lantaai.com/images/05afe04a-0199-4315-a8b8-a0cfe22c06e7.jpg"
            }
          ],
          "links": []
        },
        {
          "kind": "faq",
          "title": "常见 问题",
          "intro": [
            "围绕 AI 生成涂鸦文字、Logo 与街头风视觉的实用解答。"
          ],
          "cards": [
            {
              "title": "AI 涂鸦生成器能准确生成指定词语或名字吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "AI 涂鸦艺术生成器支持哪些风格？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "如何用 AI 涂鸦 Logo 生成器做出更可用的结果？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "可以通过 AI 从照片生成涂鸦吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "相比基础 AI 涂鸦工具，有什么差别？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "生成结果可以用于商业项目吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "AI 涂鸦生成器可以免费开始吗？",
              "paragraphs": [],
              "bullets": []
            },
            {
              "title": "AI 涂鸦生成的提示词公式怎么写更稳？",
              "paragraphs": [],
              "bullets": []
            }
          ],
          "links": []
        },
        {
          "kind": "related",
          "title": "相关 AI 图像工具",
          "intro": [
            "探索更多好玩的 AI 工具，把你的创意工作流玩出更多花样。"
          ],
          "cards": [],
          "links": [
            {
              "title": "AI图像生成",
              "path": "/ai-image-generator"
            },
            {
              "title": "AI图生视频",
              "path": "/tools/ai-image-to-video"
            },
            {
              "title": "AI图像编辑器",
              "path": "/tools/icedit-ai-image-editor"
            },
            {
              "title": "Perchance图像生成器",
              "path": "/tools/perchance-image-generator"
            },
            {
              "title": "图片转吉卜力风格",
              "path": "/image-style-converter"
            },
            {
              "title": "AI图像动画生成器",
              "path": "/tools/ai-animate-image-generator"
            },
            {
              "title": "AI文生视频",
              "path": "/tools/ai-text-to-video"
            }
          ]
        },
        {
          "kind": "cta",
          "title": "生成涂鸦作品 立即免费开始",
          "intro": [
            "上传你的想法，让 AI 在几秒内为你生成视觉张力爆棚的涂鸦大作。",
            "即时生成 · 隐私保护 · AI 驱动"
          ],
          "cards": [],
          "links": [
            {
              "title": "免费试用 AI 涂鸦生成器",
              "path": "#generator"
            }
          ]
        }
      ],
      "faq": [
        {
          "q": "AI 涂鸦生成器能准确生成指定词语或名字吗？",
          "a": "可以。在提示词里写出准确文字，并保持风格描述简洁。复杂狂野字风建议生成多个版本，再选择最易读的一张。",
          "observed": false
        },
        {
          "q": "AI 涂鸦艺术生成器支持哪些风格？",
          "a": "可以创建泡泡字、模板喷绘、3D 涂鸦、狂野字风和简洁的 Logo 构图，也能融合赛博朋克、复古或街头潮牌风格。",
          "observed": false
        },
        {
          "q": "如何用 AI 涂鸦 Logo 生成器做出更可用的结果？",
          "a": "可尝试“清晰轮廓、居中文字标、高对比、少量过喷”等描述，再逐步调整笔画粗细、阴影深度和背景复杂度。",
          "observed": false
        },
        {
          "q": "可以通过 AI 从照片生成涂鸦吗？",
          "a": "可以。切换图生图模式，上传参考照片，并描述目标墙面质感、配色和字体风格。",
          "observed": false
        },
        {
          "q": "相比基础 AI 涂鸦工具，有什么差别？",
          "a": "参照工具强调字体控制、提示词与结果的一致性，以及用于概念设计的真实喷漆细节。",
          "observed": false
        },
        {
          "q": "生成结果可以用于商业项目吗？",
          "a": "可用于概念探索和数字素材；正式生产前应核对许可条款，并在印刷或公开活动前完成设计检查。",
          "observed": false
        },
        {
          "q": "AI 涂鸦生成器可以免费开始吗？",
          "a": "参照页说明可从有限免费积分开始，再按生成量与工作流需求升级；这不代表 Makeup AI 的额度或订阅。",
          "observed": false
        },
        {
          "q": "AI 涂鸦生成的提示词公式怎么写更稳？",
          "a": "可采用“主体文字＋风格＋配色＋表面＋光线＋氛围”。例如：“LANTA，醒目 3D 涂鸦，青色与洋红配色，砖墙，夜间霓虹光，粗粝城市氛围”。",
          "observed": false
        }
      ]
    }
  }
};
