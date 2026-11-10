import type { AdditionalVideoModelPath, GeneratorMode } from "./platform-generator-data";
import type { VideoModelPage } from "./platform-video-model-data";

// 只保存五页身份、固定参照与核定初值，不新增provider或会话。
export const additionalVideoModelPages = {
  "/ai-video-models/grok-imagine": {
    "path": "/ai-video-models/grok-imagine",
    "catalogId": "grok-imagine",
    "defaultModel": "grok-imagine",
    "title": {
      "en": "Grok Imagine AI Video Generator",
      "zh-CN": "Grok Imagine AI 视频生成器"
    },
    "canonical": "/ai-video-models/grok-imagine",
    "faqBehavior": "multiple",
    "hero": {
      "en": "Grok Imagine AI Video GeneratorCreate anything you imagine with Grok Imagine on Lanta AI. Turn your wild ideas into vivid AI videos with text & images. Generate short AI videos with native audio in minutes, then edit and restyle your video.",
      "zh-CN": "Grok Imagine AI 视频生成器在 Lanta AI 上用 Grok Imagine 创作你想象中的任何内容。将大胆创意、文字和图片变成生动的 AI 视频。几分钟内生成带原生音频的短 AI 视频，然后继续编辑和重塑风格。"
    },
    "bodySections": [
      {
        "index": 2,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Get Inspired by Grok Imagine on Lanta AIStrawberry Cake Layer BreakdownMountain Clouds TimelapseFisheye Fashion ModelDogs Beach Frisbee ChaseGoldfish Underwater SwimLuxury Perfume Pink Smoke AdDocumentary Bonfire FlamesCreate Your Grok AI Video",
              "zh-CN": "从 Lanta AI 上的 Grok Imagine 获取灵感草莓蛋糕分层拆解山间云海延时鱼眼时尚模特海滩狗狗追逐飞盘水下金鱼游动奢华香水粉色烟雾广告纪录片式篝火火焰创建你的 Grok AI 视频"
            }
          }
        ]
      },
      {
        "index": 3,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Grok Imagine Video Pricing and API CostGrok Imagine currently supports video output up to 720p, but it offers a clear pricing advantage compared with many mainstream AI video generation models.Model480p720p1080pGrok Imagine Video$0.05/s$0.07/s—Sora 2—$0.10/s—Veo 3 Standard—$0.40/s$0.40/sKling 3.0—≈ $0.13/s≈ $0.18/sSeedance 2.0≈ $0.06/s≈ $0.14/s—Pricing for Grok Imagine Video, Sora 2, and Veo 3 Standard is based on official API pricing from xAI, OpenAI, and Google Gemini API. For Kling 3.0 and Seedance 2.0, official pricing is based on credits or tokens rather than direct per-second rates, so the prices below are estimated per-second video generation costs.Generate Grok Video Now",
              "zh-CN": "Grok Imagine 视频价格和 API 成本Grok Imagine 目前支持最高 720p 的视频输出，但与许多主流 AI 视频生成模型相比，它具有明显的价格优势。模型480p720p1080pGrok Imagine Video$0.05/s$0.07/s—Sora 2—$0.10/s—Veo 3 Standard—$0.40/s$0.40/sKling 3.0—≈ $0.13/s≈ $0.18/sSeedance 2.0≈ $0.06/s≈ $0.14/s—Grok Imagine Video、Sora 2 和 Veo 3 Standard 的价格基于 xAI、OpenAI 和 Google Gemini API 的官方 API 定价。对于 Kling 3.0 和 Seedance 2.0，官方价格基于积分或 token，而不是直接按秒计费，因此下方价格为估算的每秒视频生成成本。立即生成 Grok 视频"
            }
          }
        ]
      },
      {
        "index": 4,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Create High-Quality Videos from PromptsText-to-Video — Turn text prompts into ultra-realistic videos with sharp details, natural lighting, smooth motion, and lifelike textures. Grok AI Video Generator makes each scene look clearer, more polished, and more realistic.Generate Grok AI VideoAnimate Any Still ImageImage-to-Video — Go beyond simply making an image move. Grok AI Video delivers faster rendering, lower latency, and smoother motion, helping your videos feel more fluid and expressive. From subject movement and action to dynamic camera motion and natural scene transitions, your still images can become vivid videos.Animate with Grok ImagineAnimate this imageModify Existing Videos with AIUse simple text prompts to quickly add, remove, or replace backgrounds, characters, or specific details in an existing video. Instead of editing frame by frame manually, Grok AI Video Generator automatically updates the visuals across the full clip to create a more complete and polished final video.Edit Grok AI VideoPrompt: Convert video into anime style.Guide Video Results with ReferencesUse reference images to guide the look of characters, time settings, and scenes. You can upload different types of subjects, including people, animals, products, or virtual characters. You can also use scene references such as natural landscapes, city streets, commercial studios, Sci-Fi & Fantasy worlds, to create a wider range of video content.Guide Grok Imagine Video",
              "zh-CN": "从提示词创建高质量视频Text-to-Video — 将文本提示词转化为超写实视频，拥有清晰细节、自然光照、流畅运动和逼真纹理。Grok AI Video Generator 让每个场景看起来更清楚、更精致、更真实。生成 Grok AI 视频让任意静态图片动起来Image-to-Video — 不只是让图片简单动一下。Grok AI Video 提供更快渲染、更低延迟和更平滑的运动，让你的视频更流畅、更有表现力。从主体动作到动态镜头运动，再到自然场景转场，静态图片也能变成生动视频。用 Grok Imagine 动画化让这张图片动起来用 AI 修改现有视频使用简单文本提示词，快速添加、移除或替换现有视频中的背景、角色或特定细节。无需逐帧手动编辑，Grok AI Video Generator 会自动更新整个片段中的视觉内容，生成更完整、更精致的最终视频。编辑 Grok AI 视频提示词：将视频转换为动漫风格。用参考图引导视频结果使用参考图来引导角色、时间设定和场景的视觉效果。你可以上传不同类型的主体，包括人物、动物、产品或虚拟角色。也可以使用自然风景、城市街道、商业影棚、科幻和奇幻世界等场景参考，创建更丰富的视频内容。引导 Grok Imagine 视频"
            }
          }
        ]
      },
      {
        "index": 5,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Pros of Grok Imagine VideoGrok Imagine Video helps you turn text prompts, images, and creative ideas into short AI videos with motion, sound, and flexible video styles.Text & Image to VideoGenerate videos from text prompts or bring a still image to life with realistic motion, camera movement, and scene animation.Native AudioCreate AI videos with character dialogue, voiceovers, monologues, sound effects, and ambient audio built directly into the scene.Fast GenerationCreate short AI video clips in minutes without a studio or camera, making your video creation workflow faster and easier.Multiple Aspect RatiosCreate videos in popular aspect ratios, 16:9, 9:16, 1:1, 4:3, and 3:4. Easily make vertical videos for social media, and horizontal videos for ads.High-Quality & RealisticGrok Imagine helps create vivid AI videos with sharp details, realistic textures, natural lighting, and smooth motion.Video Style TransferTransform the visual style of a video, from photorealistic to cyberpunk, anime, retro, mosaic, or watercolor.",
              "zh-CN": "Grok Imagine Video 的优点Grok Imagine Video 可以帮助你把文本提示词、图片和创意想法转化为带运动、声音和灵活视频风格的短 AI 视频。文本和图片生成视频从文本提示词生成视频，或用真实运动、镜头移动和场景动画让静态图片动起来。原生音频创建直接内置角色对白、旁白、独白、音效和环境音的 AI 视频。快速生成无需影棚或摄像机，几分钟内创建短 AI 视频片段，让视频创作流程更快更轻松。多种画幅比例支持常用画幅比例：16:9、9:16、1:1、4:3 和 3:4。轻松制作社交媒体竖屏视频和广告横屏视频。高质量且真实Grok Imagine 可帮助生成细节清晰、纹理真实、光照自然、运动流畅的生动 AI 视频。视频风格迁移将视频视觉风格从写实转换为赛博朋克、动漫、复古、马赛克或水彩。"
            }
          }
        ]
      },
      {
        "index": 6,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "How to Use Grok Imagine Video on Lanta AICreate a Grok Imagine AI video on Lanta AI in just a few simple steps. Upload an image or enter your text prompt, select the Grok Imagine Video model, then click Create to generate and download your video.01Step 1: Add Your Image or PromptUpload a reference image or enter a text prompt that describes the video you want to create.02Step 2: Select Grok Imagine VideoChoose the Grok Imagine Video model on Lanta AI, then set your video length and resolution.03Step 3: Create and DownloadClick Generate and wait 2–3 minutes for your video to output. Finally, preview the result and download the video.",
              "zh-CN": "如何在 Lanta AI 上使用 Grok Imagine Video只需几个简单步骤，就能在 Lanta AI 上创建 Grok Imagine AI 视频。上传图片或输入文本提示词，选择 Grok Imagine Video 模型，然后点击创建即可生成并下载视频。01步骤 1：添加图片或提示词上传参考图片，或输入描述你想创建的视频的文本提示词。02步骤 2：选择 Grok Imagine Video在 Lanta AI 上选择 Grok Imagine Video 模型，然后设置视频时长和分辨率。03步骤 3：创建并下载点击生成并等待 2–3 分钟输出视频。最后预览结果并下载视频。"
            }
          }
        ]
      },
      {
        "index": 7,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Compare other video modelsExplore related workflows and choose a model that fits your next video.MVMindVideo AITurn a written scene or source image into a short video.Wan 2.6Create text or image videos and explore multi-shot image-to-video storytelling.Sora 2Explore Sora text-to-video and image-to-video workflows.Veo 3.1 FastExplore Veo 3.1 Fast for short videos with native audio.",
              "zh-CN": "比较其他视频模型了解相关创作流程，为下一个视频选择合适的模型。MVMindVideo AI将文字描述的场景或原始图片转化为短视频。英文页面Wan 2.6从文字或图片生成视频，并探索图生视频中的多镜头叙事。英文页面Sora 2了解 Sora 的文生视频与图生视频流程。英文页面Veo 3.1 Fast了解 Veo 3.1 Fast，创作带有原生音频的短视频。英文页面"
            }
          }
        ]
      },
      {
        "index": 9,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Start Creating with Grok ImagineCreate anything you imagine with Grok Imagine on Lanta AI. Turn bold ideas, images, and prompts into dynamic AI videos with native audio.Generate Grok AI Video Now→",
              "zh-CN": "开始使用 Grok Imagine 创作在 Lanta AI 上用 Grok Imagine 创作你想象中的任何内容。将大胆想法、图片和提示词转化为带原生音频的动态 AI 视频。立即生成 Grok AI 视频→"
            }
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Is Grok Imagine on Lanta AI free?",
          "zh-CN": "Lanta AI 上的 Grok Imagine 免费吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes. New users on Lanta AI get 40 free credits to try Grok AI video generation. Since the xAI Imagine API is paid, Grok Imagine Video costs credits based on video length and resolution.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“是的。Lanta AI 新用户可获得 40 个免费积分，用于体验 Grok AI 视频生成。由于 xAI Imagine API 本身是付费的，Grok Imagine Video 会根据视频时长和分辨率消耗积分。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How long can Grok Imagine videos be?",
          "zh-CN": "Grok Imagine 视频最长可以多长？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Grok Imagine videos can be 1 to 15 seconds long through the API. On some third-party platforms or websites, the available video length may be shorter depending on the mode, plan, or usage limits.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“通过 API，Grok Imagine 视频可生成 1 到 15 秒。在某些第三方平台或网站上，可用视频时长可能会因模式、套餐或使用限制而更短。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How do I make longer videos with Grok Imagine?",
          "zh-CN": "如何用 Grok Imagine 制作更长的视频？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Do not try to make a full long video in one prompt. Break the idea into short shots. Generate one 5–10 second scene at a time, use the last frame or video extension to continue the story, then edit the clips together in a video editor.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“不要试图用一个提示词生成完整长视频。把想法拆成多个短镜头。每次生成一个 5–10 秒的场景，使用最后一帧或视频延展继续故事，然后在视频编辑器中把片段剪辑到一起。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Does Grok Imagine support image-to-video?",
          "zh-CN": "Grok Imagine 支持图片生成视频吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes. Grok Imagine can turn a still image into a video. You can upload a source image, such as a product shot, portrait, landscape, anime image, or concept art, and add a prompt describing how you want the scene to move.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“支持。Grok Imagine 可以把静态图片变成视频。你可以上传源图片，例如产品图、人像、风景、动漫图片或概念图，并添加提示词说明你希望场景如何运动。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Does Grok Imagine support reference images?",
          "zh-CN": "Grok Imagine 支持参考图吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes. Grok Imagine supports reference images for video generation. The API allows up to 7 reference images in one request. When using reference images, label each image clearly in your prompt, such as “Image 1 is the character,” “Image 2 is the outfit,” and “Image 3 is the background.”” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“支持。Grok Imagine 支持使用参考图进行视频生成。API 允许一次请求最多使用 7 张参考图。使用参考图时，请在提示词中清楚标注每张图，例如“Image 1 is the character”“Image 2 is the outfit”“Image 3 is the background”。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Why does Grok Imagine change my character?",
          "zh-CN": "为什么 Grok Imagine 会改变我的角色？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “This often happens when the prompt is too broad or the reference images are not clearly explained. Fast camera moves, complex actions, face turns, crowd scenes, and long shots can also make the character drift. Use a clear front-facing reference image, and keep the action simple.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“这通常是因为提示词过于宽泛，或参考图没有解释清楚。快速镜头移动、复杂动作、转脸、人群场景和远景也可能导致角色漂移。请使用清晰的正面参考图，并保持动作简单。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Is Grok Imagine good for professional videos?",
          "zh-CN": "Grok Imagine 适合专业视频吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Grok Imagine is a strong tool for short creative videos, social media clips, and early marketing ideas. But it is not a full replacement for a professional video production.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“Grok Imagine 是制作短创意视频、社交媒体片段和早期营销创意的强大工具。但它并不能完全替代专业视频制作。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Is Grok Imagine safe for real people’s photos?",
          "zh-CN": "Grok Imagine 处理真人照片安全吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes. Lanta AI keeps uploaded photos private and does not publicly share your images. Use real people’s photos only when you have permission. Avoid prompts that create misleading, sexual, harmful, or private depictions of a real person.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“是的。Lanta AI 会保护上传照片的隐私，不会公开分享你的图片。只有在获得许可时才使用真人照片。避免生成对真人具有误导性、性化、有害或涉及隐私的内容。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      }
    ]
  },
  "/ai-video-models/mindvideo-ai": {
    "path": "/ai-video-models/mindvideo-ai",
    "catalogId": "mindvideo-ai",
    "defaultModel": "wan-3-0",
    "title": {
      "en": "Create Videos with MindVideo AI",
      "zh-CN": "使用 MindVideo AI 创建视频"
    },
    "canonical": "/ai-video-models/mindvideo-ai",
    "faqBehavior": "multiple",
    "hero": {
      "en": "Create Videos with MindVideo AITurn a written idea or source image into a short video. Describe the subject and motion, choose the settings available for your project, and generate directly in Lanta AI.Text prompts into videoImages brought into motionFlexible generation controlsStart Creating",
      "zh-CN": "使用 MindVideo AI 创建视频把文字创意或源图片制作成短视频。描述主体和动作，选择适合项目的可用设置，然后在 Lanta AI 中生成。文字提示生成视频让图片动起来灵活的生成控制开始创作"
    },
    "bodySections": [
      {
        "index": 2,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Text and image workflowsCreate from Text or Images with MindVideo AIBegin with a written scene when you need to build an idea from scratch, or use an existing image when the subject and composition are already defined. The generator keeps both paths in one workspace.Turn a Written Scene Into a Moving ConceptStart with the subject, action, setting, and camera move you want to see. Use the generated clip as a story opening, social hook, or visual direction, and review the settings and credit estimate shown in the form before generating.Create From TextBring a Photo or Product Shot Into MotionUpload an image that already defines the subject and composition, then describe the motion that should happen next. Try a slow camera push, moving light, or subtle background movement for a portrait, illustration, or product reveal.Animate an Image",
              "zh-CN": "文字与图片工作流使用 MindVideo AI 从文字或图片创建视频从零构思时可以先写场景；主体与构图已经确定时，可以使用现有图片。生成器把两种方式放在同一工作区中。把文字场景变成动态构想先描述你希望看到的主体、动作、环境和镜头运动。生成片段可作为故事开场、社交内容引子或视觉方向；生成前请查看表单中的设置与积分预估。从文字创建让照片或产品图动起来上传已经确定主体与构图的图片，再描述接下来应发生的动作。人像、插画或产品展示可以尝试缓慢推进镜头、光线移动或轻微的背景运动。让图片动起来"
            }
          }
        ]
      },
      {
        "index": 3,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Prepare your image before adding motionFor a portrait, product photo, or illustration, decide what must stay recognizable and where movement can happen before you upload it.Leave room for the actionA person walking to the right needs space on that side of the frame. For a tightly cropped portrait or product, start with a small movement rather than a wide camera sweep.Choose one focal pointUse a frame where the main subject is easy to separate from the background. If several objects compete for attention, crop the image around the one the video should follow.Plan where text will goLeave clear space for a headline or price. Add exact lettering in your editor after generation, especially when a moving label or a changing camera angle could make it hard to read.",
              "zh-CN": "添加运动前先准备图片上传人像、产品照片或插画前，先确定哪些特征必须保持可辨认，以及哪里可以发生运动。为动作留出空间人物向右行走时，画面右侧需要留出空间。裁切紧凑的人像或产品图应先尝试小幅动作，而不是大范围扫动镜头。选择一个视觉焦点选择主体容易与背景区分的画面。如果多个物体争夺注意力，请围绕视频应跟随的主体裁切图片。规划文字位置为标题或价格留出清晰空间。生成后再用编辑器添加准确文字，尤其当标签运动或镜头变化可能影响可读性时。"
            }
          }
        ]
      },
      {
        "index": 4,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Creative use casesWhere MindVideo AI Fits Your Creative WorkflowUse short generated clips to test a social opening, add motion to product imagery, or preview a story beat before committing to a longer edit or production.Turn Text Prompts Into Social HooksStart with a short scene description, generate an opening shot for a Reel, Short, or TikTok post, then add captions, voice-over, and your final edit.Animate Product Photos Into Campaign ConceptsUse the image-to-video workflow to explore camera movement, lighting, or a seasonal campaign direction while keeping the product as the visual anchor.Preview Story Ideas Before ProductionTurn a written beat or illustration into a short scene preview, then use the result to discuss atmosphere, motion, and pacing before a larger production.",
              "zh-CN": "创作用途MindVideo AI 如何融入你的创作流程在投入更长的剪辑或制作前，用生成短片测试社交内容开场、为产品图片添加动态，或预览故事节点。把文字提示变成社交内容开场先写简短场景描述，为 Reel、Short 或 TikTok 内容生成开场镜头，再加入字幕、配音并完成剪辑。把产品照片变成动态营销构想使用图生视频工作流探索镜头运动、光线或季节营销方向，同时让产品始终作为视觉中心。正式制作前预览故事创意把文字情节或插画变成简短场景预览，再用结果讨论更大规模制作中的氛围、动作与节奏。"
            }
          }
        ]
      },
      {
        "index": 5,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "A simple workflowFrom First Idea to Finished MindVideo AI ClipChoose the right starting point, direct one clear action and camera move, then review the result and refine only what needs to change.01Choose Your Starting PointChoose Text to Video when your scene starts as a written idea. Choose Image to Video when a photo or illustration already defines the subject, composition, or visual direction.02Direct the MotionDescribe the main action and camera movement, then review the duration, ratio, resolution, audio, reference, access, and credit options shown in the form.03Review and RefineCheck motion, faces, hands, text, product edges, and sound in the result. If something drifts, simplify one action or camera move before changing several settings at once.",
              "zh-CN": "简单工作流从最初创意到完成 MindVideo AI 短片选择合适起点，明确一个动作和一种镜头运动，再检查结果，只调整需要改变的部分。01选择起点场景始于文字创意时选择文生视频；照片或插画已经确定主体、构图或视觉方向时选择图生视频。02指导运动描述主要动作与镜头运动，再查看表单中的时长、画幅、分辨率、音频、参考素材、访问条件与积分选项。03检查并优化检查结果中的动作、人脸、手部、文字、产品边缘和声音。如果出现偏移，先简化一个动作或镜头运动，不要同时改动多个设置。"
            }
          }
        ]
      },
      {
        "index": 6,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "MindVideo AI prompts for three everyday projectsUse these examples as starting briefs. Match the description to your own source material, then keep the first attempt focused on one visible action.01A calm product revealStarting pointImage to Video. Use a front-facing photo of a skincare bottle on a simple background.PromptKeep the bottle upright and still. A soft reflection travels slowly across the glass while the camera moves slightly closer. Keep the cap, label placement, and background consistent. End with the bottle centered and clear space above it.What to reviewCheck the silhouette and label placement before adding a headline. If the bottle warps, try a locked camera with only the lighting change.02A portrait with subtle movementStarting pointImage to Video. Choose a clear portrait with the eyes visible and some space around the head.PromptThe person blinks once, gives a small smile, and turns slightly toward the window. A few strands of hair move gently. Keep the camera still and preserve the original framing, clothing, and background.What to reviewCompare the face at the beginning and end. If a turn changes the identity, reduce it and keep only the blink and expression.03An opening scene from textStarting pointText to Video. Start with a setting and one event rather than a full plot.PromptA small bookshop on a rainy evening. From inside, the camera faces the entrance as a visitor closes a wet umbrella and steps through the door. Warm shelves in the background, reflections on the pavement outside, a slow forward camera move.What to reviewMake sure the entrance is readable before adding another event. This shot can introduce a story; the next action can be a separate clip in your edit.",
              "zh-CN": "三个日常项目的 MindVideo AI 提示词将这些示例作为起始创作说明。按自己的源素材调整描述，并让第一次尝试聚焦一个可见动作。01平静的产品展示起点图生视频。使用简单背景中护肤品瓶子的正面照片。提示词让瓶子保持直立静止。柔和反光缓慢掠过玻璃表面，镜头稍微靠近。保持瓶盖、标签位置和背景一致。结尾让瓶子居中，上方留出清晰空间。检查重点添加标题前先检查轮廓和标签位置。如果瓶子变形，尝试固定镜头，只改变光线。02带轻微动作的人像起点图生视频。选择眼睛清晰可见、头部周围留有空间的人像。提示词人物眨一次眼，微微一笑，轻轻转向窗户。几缕头发轻柔移动。保持镜头静止，并保留原始构图、衣着和背景。检查重点比较开头与结尾的人脸。如果转头改变了人物身份特征，请减小转动，只保留眨眼和表情变化。03从文字构建开场场景起点文生视频。从一个环境和一件事开始，而不是完整情节。提示词雨夜的一家小书店。镜头从店内朝向入口，一位访客收起湿雨伞，迈进门来。背景是暖色书架，门外路面有反光，镜头缓慢向前移动。检查重点添加其他事件前，先确认进门动作清晰可辨。这个镜头可作为故事开端；后续动作可以在剪辑中使用独立片段。"
            }
          }
        ]
      },
      {
        "index": 7,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Turn the first result into a better second versionKeep the input, selected model, and settings steady while you revise one part of the prompt. That makes it easier to see which change helped.The subject changes shapeRemove a large turn or camera orbit. Keep the subject still and ask for movement in the light, hair, fabric, or background instead.The clip barely movesReplace broad wording such as 'make it cinematic' with a visible event: a curtain lifts, steam rises, or the person looks toward the door. Choose one event first.The camera loses the subjectSpecify what should stay in frame. For a product shot, try 'the bottle remains centered' with a slow push-in instead of asking for dynamic camera movement.The framing does not fit your postFor image-to-video, prepare the source in the crop you intend to publish. Leave space for captions and review the available output settings before generating another version.Planning a connected sequence from one starting image? See the Wan 2.6 multi-shot workflow",
              "zh-CN": "把初次结果优化成更好的第二版修改提示词的一部分时，保持输入、所选模型和设置不变，这样更容易判断哪项调整有效。主体外形发生变化去掉大幅转身或环绕镜头。保持主体静止，改为让光线、头发、衣物或背景发生运动。短片几乎没有运动把“让它有电影感”之类宽泛描述换成可见事件：窗帘扬起、蒸汽上升或人物望向门口。先选择一个事件。镜头丢失主体明确哪些内容应留在画面中。产品镜头可尝试“瓶子保持居中”并缓慢推进，而不是泛泛要求动态镜头运动。构图不适合发布内容图生视频应先按计划发布的裁切方式准备源图片。为字幕留出空间，再生成下一版前查看可用输出设置。计划从一张起始图片制作连贯镜头序列？ 查看 Wan 2.6 多镜头工作流"
            }
          }
        ]
      },
      {
        "index": 8,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Compare other video modelsExplore related workflows and choose a model that fits your next video.VVheerExplore image animation for product clips, social videos and visual concepts.Wan 3.0Explore text, image and multimodal reference workflows.Grok ImagineCompare text and image video creation with native audio.Kling 3.0Compare Kling workflows with audio and multi-shot controls.Seedance 2.0Explore video creation guided by text, images, video and audio references.",
              "zh-CN": "比较其他视频模型探索相关工作流，为下一个视频选择合适模型。VVheer探索用于产品短片、社交视频和视觉构想的图片动画。Wan 3.0探索文字、图片与多模态参考工作流。Grok Imagine比较具备原生音频的文字与图片视频创作。Kling 3.0比较带音频与多镜头控制的 Kling 工作流。Seedance 2.0探索由文字、图片、视频与音频参考引导的视频创作。"
            }
          }
        ]
      },
      {
        "index": 10,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Create Your Next Video with MindVideo AIStart with a prompt or source image, focus the motion on one clear idea, and generate a clip you can review, refine, and use in a larger edit.Start Creating",
              "zh-CN": "使用 MindVideo AI 创建你的下一个视频从提示词或源图片开始，让运动聚焦一个清晰创意，生成可检查、优化并用于更完整剪辑的片段。开始创作"
            }
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "What can I create with MindVideo AI?",
          "zh-CN": "MindVideo AI可以创作什么？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “You can turn a written scene into a short video or animate an existing photo, illustration, or product image. These workflows work well for social hooks, visual concepts, product reveals, and story previews.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“可将文字场景变成短片，或让已有照片、插画、产品图动起来。这些工作流适合社媒开场钩子、视觉概念、产品揭晓和故事预览。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How do I start using MindVideo AI here?",
          "zh-CN": "如何在这里开始使用MindVideo AI？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Use the generator on this page, choose Text to Video or Image to Video, add your prompt or source image, review the available settings, and generate. Your completed video will appear in the generation workflow for review and download.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“使用本页生成器，选择文生或图生，添加提示词或源图，核对当前可用设置再生成。完成的视频会在生成工作流中显示，供复核与下载。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Can I try MindVideo AI with trial credits?",
          "zh-CN": "可以用试用额度体验MindVideo AI吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “New Lanta AI accounts receive trial credits, but video generation is not unlimited. The form shows the current access condition and credit estimate before you generate, so review those details for the input and settings you choose.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“新的Lanta AI账户获得试用额度，但视频生成不是无限的。表单在生成前显示当前准入条件及额度估算，应按所选输入和设置核对。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Can I create from both text and images?",
          "zh-CN": "可以同时从文字和图片创作吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes. Choose the Text to Video tab to start from a written scene or the Image to Video tab to animate an existing visual. Use the duration, resolution, ratio, audio, and reference options shown for the selected workflow.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“可以。选择文生标签从文字场景开始，选择图生标签让已有视觉素材动起来。使用所选工作流实际显示的时长、分辨率、画幅、音频和参考选项。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How can I keep faces and product details recognizable?",
          "zh-CN": "如何保持人脸与产品细节可辨认？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Start with a clear image and keep the main subject easy to see. Ask for one compatible action and a restrained camera move. Review faces, hands, logos, labels, and edges, then simplify the motion if those details change.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“从清晰图片开始，让主体容易识别。要求一个合适动作和克制的运镜。检查脸、手、logo、标签及边缘；细节改变时简化动作。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Can I use the generated video in ads or client work?",
          "zh-CN": "生成视频可用于广告或客户项目吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Commercial use depends on the service, model, plan, and source material involved. Check the current Lanta AI plan terms and confirm your rights to every uploaded image, person, logo, character, and audio asset before publishing or delivering the result.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“商业使用取决于涉及的服务、模型、套餐和源素材。发布或交付前，检查Lanta AI当前套餐条款，确认对所有上传图片、人物、logo、角色和音频资产拥有权利。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Should I start with text or an image?",
          "zh-CN": "应从文字还是图片开始？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Choose Text to Video when you need to create a scene from a written idea. Choose Image to Video when a photo, product image, portrait, or illustration should define the subject and composition of the generated video.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“需要按文字想法创建新场景时用文生；照片、产品图、人像或插画应决定生成片段的主体和构图时用图生。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Can I reuse a prompt from another project?",
          "zh-CN": "可复用其它项目的提示词吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “You can adapt the same natural-language scene idea, but the result may change because each model interprets prompts differently. Preserve the subject, main action, environment, and camera direction first, then adjust one instruction or setting at a time.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“可以改编同一自然语言场景想法，但模型对提示词的理解不同，结果可能改变。先保留主体、主要动作、环境和镜头方向，再一次调整一个指令或设置。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Where can I check duration and resolution options?",
          "zh-CN": "在哪里查看时长与分辨率选项？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “The available duration and resolution options are shown directly in the generator and can vary by input and other settings. Use the current form as the source of truth before submitting a generation.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“可用时长和分辨率直接显示在生成器中，并可能随输入及其它设置变化。提交生成前以当前表单为准。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      }
    ]
  },
  "/ai-video-models/sora-2": {
    "path": "/ai-video-models/sora-2",
    "catalogId": "sora-2",
    "defaultModel": "",
    "title": {
      "en": "Sora 2: The Future of AI Video Generation",
      "zh-CN": "Sora 2：AI 视频生成的未来"
    },
    "canonical": "/ai-video-models/sora-2",
    "faqBehavior": "multiple",
    "hero": {
      "en": "AI Video TechnologySora 2: The Future of AI Video GenerationExperience Sora 2, OpenAI's flagship video-audio generation model that understands and simulates the physical world. Create stunning, physics-accurate videos up to 60 seconds with unprecedented realism and controllability. Sora AI represents a breakthrough moment in video generation—where AI truly understands how the world works.Start Creating NowPhysics-accurate generationAudio & video syncAI Real-time Processing",
      "zh-CN": "AI 视频技术Sora 2：AI 视频生成的未来体验 Sora 2，OpenAI 的旗舰视听生成模型，旨在理解并模拟物理世界。参照称它可制作最长 60 秒、符合物理规律且具备更高真实感与可控性的视频。 Sora AI 代表视频生成的一次突破，让 AI 理解世界如何运作。立即开始创作符合物理规律的生成音视频同步AI 实时处理"
    },
    "bodySections": [
      {
        "index": 1,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Simple ProcessHow to Use the Sora 2 AI Video GeneratorCreate stunning Sora 2 AI videos in three simple steps — no editing experience required.Step 1Choose & UploadPick a mode: Text-to-Video or Image-to-Video. Upload your image (if using Image-to-Video) or skip this step for Text-to-Video. Supported formats are auto-optimized for best results.Step 2Describe Your IdeaAdd a Prompt to tell Sora 2 what to create (style, motion, subject, atmosphere).Optionally set duration and resolution. Our model analyzes your inputs and generates a natural, cinematic animation.Step 3Generate & DownloadClick Generate to start. Once the video finishes, preview it and download in high quality. You can iterate by refining the prompt or replacing the image.",
              "zh-CN": "简单流程如何使用 Sora 2 AI 视频生成器通过三个简单步骤创建 Sora 2 AI 视频，无需剪辑经验。步骤 1选择并上传选择模式：文生视频或图生视频。图生视频时上传图片；文生视频可跳过此步。参照称会自动优化支持的格式以改善效果。步骤 2描述创意添加提示词，告诉 Sora 2 要创建的风格、动作、主体和氛围。可按可用选项设置时长与分辨率。参照称模型会分析输入并生成自然、具有电影感的动画。步骤 3生成并下载点击生成开始。完成后可预览并下载高质量视频，也可通过细化提示词或替换图片继续迭代。"
            }
          }
        ]
      },
      {
        "index": 2,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "What is Sora 2?Discover OpenAI's revolutionary AI video generation technology through real examplesNext-Gen AI TechnologyRevolutionary Text-to-Video AI ModelSora 2 is the latest generation text-to-video AI model developed by OpenAI, representing a major breakthrough in artificial intelligence video generation technology. As the newest version in the sora openai series, Sora 2 can automatically generate high-resolution video content up to 60 seconds long based on user-provided text descriptions.This sora ai tool not only understands complex scene descriptions but also accurately simulates real-world physics, creating incredibly realistic video effects that were previously impossible without expensive production equipment.AI Processing\"a guy does a backflip\"1080p HD Quality\"a group people playing volleyball\"Professional QualityAI That Understands the Physical WorldSora 2 represents a breakthrough in video generation—it's not just creating pixels, it's simulating reality. Built on advanced world modeling capabilities, sora openai understands object permanence, physics laws, and how things actually move and interact in the real world.Whether you're creating cinematic scenes, product demonstrations, or educational content, Sora AI delivers professional-grade output that rivals traditional video production quality.Audio-Visual GenerationComplete Audio-Visual ExperienceAs a general-purpose audio-video generation system, Sora AI creates complex background soundscapes, human voices, and sound effects with high fidelity. The audio synchronizes perfectly with visual elements for immersive, realistic experiences.You can even inject real-world elements into sora openai generations. By observing a video of your teammate, the model can accurately recreate their appearance and voice, placing them into any Sora-generated environment. This capability works universally for humans, animals, and objects.Audio + Video Sync\"Two mountain explorers in bright technical shells, ice crusted faces, eyes narrowed with urgency shout in the snow, one at a time\"Multiple Styles\"In the style of a studio ghibli anime, a boy and his dog run up a grassy scenic mountain with gorgeous clouds, overlooking a village in the distant background\"Unlimited CreativityInfinite Creative PossibilitiesThe core advantage of Sora AI lies in the perfect combination of its powerful language understanding and visual generation capabilities. From realistic photography to animation styles, from natural landscapes to sci-fi scenes, the possibilities are endless.For content creators, marketers, video producers, and businesses, sora openai technology significantly lowers the barriers and costs of video production while opening up creative opportunities that were previously impossible or prohibitively expensive.Why Sora 2 is a Game-ChangerThrough advanced deep learning algorithms, Sora 2 can generate various styles of video content with unprecedented quality and realism. This makes sora ai the most innovative and practical AI video generation solution available today, democratizing professional video creation for everyone.60s Max Length1080p HD QualityMultiple StylesAudio Sync",
              "zh-CN": "什么是 Sora 2？通过真实示例了解 OpenAI 的 AI 视频生成技术新一代 AI 技术文生视频 AI 模型Sora 2 是 OpenAI 开发的新一代文生视频 AI 模型，参照将其描述为 AI 视频生成技术的一次重大突破。作为 sora openai 系列的新版本，参照称 Sora 2 可根据用户文字描述自动生成最长 60 秒的高分辨率视频。这款 sora ai 工具不仅理解复杂场景描述，参照还称它可以模拟真实物理规律，制作过去需要昂贵制作设备才能实现的逼真视频效果。AI 处理“一位男子做后空翻”1080p 高清画质“一群人在打排球”专业画质理解物理世界的 AISora 2 代表视频生成的一次突破：不仅创建像素，也模拟现实。基于先进的世界建模能力， sora openai 理解物体持久性、物理定律，以及事物在现实中的运动和交互方式。无论制作电影场景、产品演示还是教育内容， Sora AI 参照称其可提供媲美传统视频制作质量的专业输出。视听生成完整视听体验作为通用视听生成系统， Sora AI 可创建复杂的背景声景、人声和高保真音效。参照称声音与视觉元素同步，带来沉浸式体验。参照还称可以把现实元素加入 sora openai 生成内容：通过观察同伴的视频，模型可以重现其外貌和声音，将其放入 Sora 生成的环境中。参照称这种能力也适用于人、动物和物体。音频与视频同步“两名穿着鲜艳专业外套的登山探险者，脸上结霜，焦急地眯着眼睛，在雪中轮流呼喊”多种风格“吉卜力工作室动画风格，一个男孩和他的狗跑上绿草覆盖的山坡，天空云彩绚丽，远处背景俯瞰一座村庄”无限创意丰富的创作可能其核心优势在于 Sora AI 强大的语言理解与视觉生成能力相结合。从写实摄影到动画，从自然景观到科幻场景，具有广泛的创作可能。对于内容创作者、营销人员、视频制作人员和企业， sora openai 参照称该技术可降低视频制作门槛与成本，并拓展过去难以实现或成本过高的创作机会。Sora 2 为何带来改变通过先进的深度学习算法， Sora 2 参照称它能够生成多种风格、高质量且真实的视频，使 sora ai 成为具有创新性和实用性的 AI 视频生成方案，让更多人能够进行专业视频创作。最长 60 秒1080p 高清画质多种风格音频同步"
            }
          }
        ]
      },
      {
        "index": 3,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Sora 2 Core FeaturesExplore the powerful capabilities that make Sora AI a breakthrough in video generationWorld SimulationSora 2 doesn't just generate videos—it simulates the physical world. Understanding gravity, object permanence, and realistic physics to create videos that follow real-world logic.Audio-Video GenerationCreate complete audio-visual experiences with synchronized sound effects, background music, and human voices that match the visual content perfectly.Extended DurationGenerate continuous, coherent video content up to 60 seconds long while maintaining scene consistency, character identity, and world state throughout.Multiple Style SupportFrom realistic photography to cartoon animation, from vintage to futuristic sci-fi, Sora AI supports various visual styles to meet different creative needs.Intelligent Scene UnderstandingDeep understanding of physics and spatial relationships, generating video content that follows real-world logic for more natural AI creations.Real-time Preview & EditingProvides real-time preview functionality, allowing you to adjust parameters and descriptions anytime for quick iterations until perfect results.",
              "zh-CN": "Sora 2 核心功能了解 Sora AI 在视频生成方面的主要能力世界模拟参照称 Sora 2 不仅生成视频，还模拟物理世界，理解重力、物体持久性和物理规律，创建符合现实逻辑的视频。音视频生成通过与视觉内容匹配的同步音效、背景音乐和人声，创建完整视听体验。更长时长参照称可生成最长 60 秒的连续视频，并在整个过程中保持场景、角色身份和世界状态一致。多风格支持从写实摄影到卡通动画，从复古到未来科幻，Sora AI 支持多种视觉风格，满足不同创作需求。智能场景理解理解物理和空间关系，生成遵循现实逻辑的视频，使 AI 创作更自然。实时预览与编辑参照称提供实时预览，可随时调整参数和描述，快速迭代优化结果。"
            }
          }
        ]
      },
      {
        "index": 4,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Sora 2 Use CasesFrom marketing to education, Sora OpenAI provides innovative solutions for every industryMarketing & AdvertisingUse Sora 2 to quickly create product showcase videos, social media ads, and brand promotional content. Dramatically reduce production costs, improve marketing efficiency, and make your brand story more engaging.Education & TrainingCreate engaging educational videos and training materials. Sora AI can visualize abstract concepts and create animated demonstrations, making learning more vivid and effective.Content CreationCreate unique video content for platforms like YouTube and TikTok. Sora OpenAI helps creators break through technical limitations to focus on creative expression and storytelling.Film ProductionQuickly create proof-of-concept videos, storyboard visualizations, and trailers. Use Sora 2 to test creative ideas before formal shooting, saving time and budget.",
              "zh-CN": "Sora 2 应用场景从营销到教育，了解 Sora OpenAI 在不同行业的用途营销与广告使用 Sora 2 快速创建产品展示、社交广告和品牌宣传内容。参照称可以减少制作成本、提高营销效率，使品牌故事更具吸引力。教育与培训创建生动的教育视频和培训材料。 Sora AI 可将抽象概念可视化并制作动画演示，使学习更直观有效。内容创作为 YouTube、TikTok 等平台创建视频内容。 Sora OpenAI 帮助创作者突破技术限制，专注创意表达和叙事。影视制作快速制作概念验证视频、分镜预览和预告片。使用 Sora 2 在正式拍摄前测试创意，节省时间和预算。"
            }
          }
        ]
      },
      {
        "index": 5,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Why Choose Sora 2?Experience the revolutionary advantages of AI video generation technologyDramatically Reduce Production CostsTraditional video production requires cameras, venue rentals, actors, and post-production teams at high costs. Sora AI lets you create professional-grade videos with just a computer, saving up to 90% of production budget.Lightning-Fast Creation ProcessFrom concept to finished product, Sora 2 takes just minutes. Compared to traditional production workflows requiring days or weeks, AI technology brings your ideas to life instantly.Unlimited Creative PossibilitiesSora OpenAI is not limited by physical constraints and can create any imaginable scene. From outer space to deep sea, from ancient times to the future, your creativity is no longer bound by reality.Zero Technical BarriersNo need to learn complex editing software or photography techniques. Sora 2's intuitive interface makes it easy for anyone to get started, focusing on creativity rather than technical details.",
              "zh-CN": "为什么选择 Sora 2？了解 AI 视频生成技术的优势降低制作成本传统视频制作需要摄像机、场地租赁、演员和后期团队，成本较高。 Sora AI 参照称仅用一台电脑即可创建专业视频，最多节省 90% 的制作预算。快速创作流程从构想到成片， Sora 2 参照称只需几分钟。相较需要数天或数周的传统制作流程，AI 技术可更快呈现创意。丰富创作可能Sora OpenAI 参照称它不受物理场景限制，可创建想象中的场景，从太空到深海，从古代到未来，拓展创意表达。低技术门槛无需学习复杂的剪辑软件或摄影技巧。 Sora 2的直观界面便于上手，让人专注创意而不是技术细节。"
            }
          }
        ]
      },
      {
        "index": 6,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Compare other video modelsExplore related workflows and choose a model that fits your next video.Veo 3.1 FastExplore Veo 3.1 Fast for short videos with native audio.Grok ImagineCompare text and image video creation with native audio.Kling 3.0Compare Kling workflows with audio and multi-shot controls.",
              "zh-CN": "比较其他视频模型探索相关工作流，为下一个视频选择合适模型。Veo 3.1 Fast探索具备原生音频的 Veo 3.1 Fast 短视频。Grok Imagine比较具备原生音频的文字与图片视频创作。Kling 3.0比较带音频与多镜头控制的 Kling 工作流。"
            }
          }
        ]
      },
      {
        "index": 8,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Ready to Create Your AI Video with Sora 2?Join thousands of creators and experience the revolutionary video creation with Sora AI. Start now and let your creativity flow without limits.Get Started FreeNo credit card required • Free trial • Powered by the latest AI tech",
              "zh-CN": "准备好使用 Sora 2 创建 AI 视频了吗？参照邀请你与数千名创作者一起体验 Sora AI的视频创作。现在开始，发挥你的创意。免费开始无需信用卡 • 免费试用 • 采用 AI 技术"
            }
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "What is Sora 2 and how does it work?",
          "zh-CN": "Sora 2是什么，如何工作？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Sora 2 is OpenAI's latest text-to-video AI model that uses advanced deep learning algorithms to convert text descriptions into high-quality video content. The sora ai system analyzes your text prompt, understands the scene, characters, actions, and visual style you want, then generates a coherent video up to 60 seconds long. It combines natural language processing with computer vision to create realistic, physics-accurate videos that match your description.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“Sora 2被介绍为OpenAI最新的文生视频模型，使用先进深度学习把文字描述转换为高质量视频。系统分析提示词，理解所需场景、角色、动作与视觉风格，随后生成最长60秒的连贯片段；结合自然语言处理和计算机视觉，创建符合描述、写实且物理准确的视频。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How long does it take to generate a video with Sora 2?",
          "zh-CN": "Sora 2生成视频需要多久？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Video generation time with Sora 2 typically ranges from 2-5 minutes depending on video length and complexity. Short videos (10-20 seconds) usually take 2-3 minutes, while longer 60-second videos may take 4-5 minutes. This is significantly faster than traditional video production, which can take hours or days. The sora openai platform also provides real-time progress updates so you can monitor the generation process.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“生成时间通常为2–5分钟，取决于时长和复杂度。10–20秒短视频通常需2–3分钟，60秒较长视频可能需4–5分钟。相比耗时数小时或数天的传统制作更快。参照还称sora openai平台提供实时进度供监测。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "What video quality and resolution does Sora 2 support?",
          "zh-CN": "Sora 2支持何种画质与分辨率？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Sora AI supports multiple resolution options including 720p (HD) and 1080p (Full HD). Videos are generated at 24-30 frames per second for smooth, professional-quality output. The system automatically optimizes video quality based on your content type and intended use. All videos maintain consistent quality throughout with proper color grading, lighting, and visual coherence that meets professional production standards.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“参照称支持720p高清与1080p全高清，以24–30fps生成顺滑的专业质量视频。系统按内容类型及用途自动优化；整个视频保持一致质量，配有符合专业制作标准的调色、灯光与视觉连贯性。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Can I edit or modify videos after generation?",
          "zh-CN": "生成后可以编辑或修改吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes! Sora 2 provides several editing options. You can regenerate specific sections by modifying your text prompt, adjust visual parameters like style and lighting, or extend your video by adding new scenes. Generated videos can be downloaded in standard formats (MP4, MOV) and further edited in any professional video editing software. The platform also offers built-in tools for basic adjustments like trimming, color correction, and adding text overlays.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“参照称可以改提示词重新生成特定部分，调整风格/灯光等视觉参数，或添加新场景延长视频；可下载MP4、MOV等标准格式，用专业视频编辑器继续编辑。平台还被描述为内置裁剪、色彩校正、文字叠加等基本工具。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "What types of videos can I create with Sora AI?",
          "zh-CN": "Sora AI可创建哪些视频？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Sora OpenAI supports a wide range of video types including marketing videos, product demonstrations, educational content, social media clips, animated explainers, cinematic scenes, nature documentaries, and abstract art videos. You can create content in various styles from photorealistic to cartoon animation, vintage film to futuristic sci-fi. The system handles diverse subjects including people, animals, objects, landscapes, and complex multi-character scenes with accurate physics and realistic movements.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“包括营销、产品演示、教育、社媒短片、动画讲解、电影场景、自然纪录与抽象艺术；风格可从照片写实到卡通，从复古胶片到未来科幻。参照称能处理人物、动物、物体、风景及复杂多角色场景，并保持准确物理和真实动作。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Do I need technical skills or video editing experience?",
          "zh-CN": "需要技术或剪辑经验吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “No technical skills are required! Sora 2 is designed for everyone, from complete beginners to professional creators. The interface is intuitive - simply describe what you want in plain language, and the AI handles all the technical complexity. You don't need to know about cameras, lighting, editing software, or animation. However, understanding basic storytelling and visual composition can help you write better prompts and get more impressive results from sora ai.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“参照称不需要，初学者与专业创作者都可使用；以日常语言描述需求，AI处理技术复杂性，不要求摄影、灯光、剪辑软件或动画知识。了解基本叙事与视觉构图仍有助于写出更好的提示词、获得更好的结果。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Can I use Sora 2 videos for commercial purposes?",
          "zh-CN": "Sora 2视频可以商用吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes! Videos generated with Sora 2 on paid plans come with full commercial usage rights. You can use them for advertising, marketing campaigns, social media, websites, presentations, and any commercial projects. You own the rights to your generated content and can monetize it freely. Free trial videos may have usage restrictions, so check the specific terms. The sora ai platform ensures all generated content is original and doesn't infringe on existing copyrights.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“参照称付费套餐生成的视频具有完整商业使用权，可用于广告、营销、社媒、网站、演示与其它商业项目，用户拥有生成内容权利并可变现；免费试用视频可能受使用限制，应检查具体条款。参照还声称平台确保原创、不侵犯现有版权；这些是外部服务主张而非本项目法律或原创保证。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How does Sora 2 compare to traditional video production?",
          "zh-CN": "Sora 2与传统视频制作相比如何？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Sora AI offers significant advantages over traditional production: 90% cost reduction (no equipment, crew, or location costs), 95% faster turnaround (minutes vs. days/weeks), unlimited creative freedom (any scene imaginable), and easy iteration (regenerate instantly vs. reshooting). However, traditional production still excels for specific live-action needs, celebrity appearances, and certain artistic visions. Many creators use Sora 2 for rapid prototyping, concept testing, and content that would be impractical to film traditionally.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“参照列出：成本减少90%（无器材、团队、场地成本）、周转加快95%（分钟而非数天或数周）、不受想象场景限制、易于重新生成而非重拍。也明确传统制作仍适合特定真人拍摄、名人出演和某些艺术表达；许多创作者用Sora 2做快速原型、概念测试和传统拍摄不现实的内容。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Is my data and content secure with Sora OpenAI?",
          "zh-CN": "Sora OpenAI的数据与内容安全吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Absolutely. Sora OpenAI takes security and privacy seriously. All data is encrypted in transit and at rest. Your prompts and generated videos are private and not used to train the model without explicit permission. We comply with GDPR, CCPA, and other data protection regulations. Enterprise plans offer additional security features including SSO, dedicated instances, and custom data retention policies. You can delete your content anytime, and we provide transparent privacy controls in your account settings.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“参照称传输和静态数据均加密，提示词及生成视频私密，未经明确同意不用于训练；称遵守GDPR、CCPA及其它数据保护法规。企业套餐被描述为具有SSO、独立实例、自定义留存政策等额外安全功能；可随时删内容，账户设置提供透明隐私控制。上述均须保外部主体与未独立验证边界。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      }
    ]
  },
  "/ai-video-models/veo-3": {
    "path": "/ai-video-models/veo-3",
    "catalogId": "veo-3",
    "defaultModel": "veo-3-1-fast",
    "title": {
      "en": "Veo 3.1 Fast AI Video Generator",
      "zh-CN": "Veo 3.1 Fast AI 视频生成器"
    },
    "canonical": "/ai-video-models/veo-3",
    "faqBehavior": "multiple",
    "hero": {
      "en": "Veo 3.1 Fast on Lanta AICreate videos with Veo 3.1 FastTurn a written scene or a source image into an 8-second video with Veo 3.1 Fast. Describe the action, framing and sound cues you want, then review the available settings before generating.Lanta AI provides access to the model through its own creative workflow and is not an official Google service.Create a Veo videoSee how it worksText or image inputNative audio generation8-second output",
      "zh-CN": "Lanta AI 上的 Veo 3.1 Fast使用 Veo 3.1 Fast 创建视频使用 Veo 3.1 Fast 将文字场景或源图片制作成 8 秒视频。描述希望看到的动作、构图和声音提示，生成前查看可用设置。Lanta AI 通过自己的创作工作流提供该模型访问入口，并非 Google 官方服务。创建 Veo 视频查看使用方法文字或图片输入原生音频生成8 秒输出"
    },
    "bodySections": [
      {
        "index": 2,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Veo video workflowHow to create a video with Veo 3The page currently uses Veo 3.1 Fast for a focused text-to-video or image-to-video workflow.01Choose your inputStart with a text prompt, or upload a source image when you want to animate an existing visual.02Describe the sceneSpecify the subject, movement, camera direction and any dialogue or sound cues. Select a supported format.03Generate and reviewCheck the credit estimate shown in the generator, submit the request, then preview and download the completed result.",
              "zh-CN": "Veo 视频工作流如何使用 Veo 3 创建视频此页面目前使用 Veo 3.1 Fast，提供文生视频或图生视频工作流。01选择输入从文字提示开始；希望为现有视觉素材添加动态时，可以上传源图片。02描述场景明确主体、动作、镜头方向，以及需要的对白或声音提示。选择支持的格式。03生成并检查查看生成器中的积分预估，提交请求，再预览并下载完成的结果。"
            }
          }
        ]
      },
      {
        "index": 3,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Current model accessVeo 3 search intent, Veo 3.1 Fast generationVeo 3 is a family of video-generation models from Google. On this Lanta AI page, the available generator is configured for Veo 3.1 Fast, a later model option in that family.This distinction matters: references to Veo 3 explain the model family and search term, while the settings and output claims on this page describe the Veo 3.1 Fast option that is actually available here.Text to videoBuild a scene from a prompt that describes action, composition and camera movement.Image to videoUse an uploaded image as the visual starting point for an animated clip.Audio-aware promptingInclude dialogue, ambience or sound cues in your prompt when they matter to the scene.Visible cost estimateReview the current credit estimate in the generator before you submit a request.",
              "zh-CN": "当前模型入口Veo 3 搜索意图，Veo 3.1 Fast 生成Veo 3 是 Google 的视频生成模型系列。此 Lanta AI 页面中的生成器配置为 Veo 3.1 Fast，这是该系列较新的模型选项。需要区分：Veo 3 指模型系列和搜索词；本页的设置与输出主张描述的是实际提供的 Veo 3.1 Fast 选项。文生视频根据描述动作、构图和镜头运动的提示词构建场景。图生视频使用上传图片作为动态短片的视觉起点。包含声音的提示词当场景需要声音时，在提示词中写出对白、环境声或音效提示。可见费用预估提交请求前查看生成器中的当前积分预估。"
            }
          }
        ]
      },
      {
        "index": 4,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Compare other video modelsExplore related workflows and choose a model that fits your next video.Sora 2Explore Sora text-to-video and image-to-video workflows.Kling 3.0Compare Kling workflows with audio and multi-shot controls.Wan 2.6Create text or image videos and explore multi-shot image-to-video storytelling.",
              "zh-CN": "比较其他视频模型探索相关工作流，为下一个视频选择合适模型。Sora 2探索 Sora 文生视频和图生视频工作流。Kling 3.0比较带音频与多镜头控制的 Kling 工作流。Wan 2.6创建文字或图片视频，探索多镜头图生视频叙事。"
            }
          }
        ]
      },
      {
        "index": 6,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Create your next scene with Veo 3.1 FastStart with a prompt or source image, choose the available controls and check the credit estimate before generating.Open the Veo generator",
              "zh-CN": "使用 Veo 3.1 Fast 创建下一个场景从提示词或源图片开始，选择可用控制项，并在生成前查看积分预估。打开 Veo 生成器"
            }
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Which Veo version is available on this page?",
          "zh-CN": "本页实际提供哪个Veo版本？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “The generator on this page is configured for Veo 3.1 Fast. The page also uses the broader Veo 3 name because that is how many people refer to and search for this model family.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“本页生成器配置为Veo 3.1 Fast。页面也使用更广义的Veo 3名称，因为许多人以该名称称呼和搜索这个模型家族。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Can I create a video from text or an image?",
          "zh-CN": "可以从文字或图片创建视频吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes. You can begin with a text prompt or upload one source image. The available fields and format options are shown directly in the generator.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“可以从文字提示词开始，或上传一张源图。可用字段与格式选项直接显示在生成器中。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How long is a generated video?",
          "zh-CN": "生成视频有多长？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “The Veo 3.1 Fast option on this page is configured to create an 8-second video.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“本页的Veo 3.1 Fast选项配置为8秒视频。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How does audio work with Veo 3.1 Fast?",
          "zh-CN": "Veo 3.1 Fast的音频如何工作？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “This page does not expose an audio on/off switch for Veo 3.1 Fast. Add any desired dialogue, ambience or sound cues to your prompt; the model handles audio as part of generation.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“本页没有为Veo 3.1 Fast提供音频开关。在提示词中加入所需对白、环境或声音线索，模型将音频作为生成的一部分处理。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How many credits does a Veo video use?",
          "zh-CN": "一个Veo视频需要多少额度？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “The generator displays the current credit estimate for your selected settings before submission. Check that estimate because product costs can change.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“生成器在提交前按所选设置显示当前额度估算。产品成本可能变化，应核对该估算。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Is Lanta AI an official Google Veo service?",
          "zh-CN": "Lanta AI是Google官方Veo服务吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “No. Lanta AI is an independent creative platform that provides access to supported video models; it is not an official Google service or a statement of partnership with Google.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“不是。Lanta AI是提供受支持视频模型访问的独立创作平台，并非Google官方服务，也不表示与Google存在合作关系。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      }
    ]
  },
  "/ai-video-models/vheer": {
    "path": "/ai-video-models/vheer",
    "catalogId": "vheer",
    "defaultModel": "lanta-2-1",
    "title": {
      "en": "Vheer AI Video Generator",
      "zh-CN": "Vheer AI 视频生成器"
    },
    "canonical": "/ai-video-models/vheer",
    "faqBehavior": "multiple",
    "hero": {
      "en": "Vheer AI Video GeneratorCreate Vheer AI videos from text prompts or images with an easy online AI video generator. Upload a reference image, describe the motion you want, choose your settings, and turn your idea into a short, polished video in minutes.",
      "zh-CN": "Vheer AI 视频生成器使用简单的在线 AI 视频生成器，从文字提示词或图片创建 Vheer AI 视频。上传参考图，描述你想要的运动效果，选择设置，然后在几分钟内把想法变成精致短片。"
    },
    "bodySections": [
      {
        "index": 1,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Unlimited Free Vheer AI Image to Video - Create Videos from Images and PromptsHave a product photo, anime character, portrait, food image, or scene idea you want to animate? Vheer AI Image to Video helps you turn still visuals into short AI clips without using a complex editing timeline. Upload an image, describe the motion you want, and generate a video with camera movement, lighting changes, background atmosphere, and natural scene motion. You can create product showcases, social media clips, cinematic previews, character animations, and quick concept videos from a single image or prompt. Instead of only making a picture move, the goal is to create a clip that feels usable: clear subject, smooth camera direction, stable style, and a result that fits TikTok, Reels, YouTube Shorts, landing pages, ads, or creative projects.",
              "zh-CN": "免费无限制 Vheer AI 图生视频 - 用图片和提示词创建视频有产品照片、动漫角色、人像、美食图片，或者想要动起来的场景创意？Vheer AI 图生视频可以帮你把静态视觉变成短 AI 片段，不需要复杂的剪辑时间线。上传图片，描述想要的运动效果，即可生成带有镜头运动、光线变化、背景氛围和自然场景动态的视频。你可以从一张图片或一个提示词创建产品展示、社媒短片、电影感预览、角色动画和快速概念视频。它的目标不只是让图片动起来，而是生成真正可用的短片：主体清晰、镜头方向顺滑、风格稳定，并适合 TikTok、Reels、YouTube Shorts、落地页、广告或创意项目。"
            }
          }
        ]
      },
      {
        "index": 2,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Inside the Vheer AI Video Generator Built for Text-to-Video and Image-to-VideoA good Vheer AI video generator should do more than turn one frame into a moving image. It should help you control the scene, the motion, the camera, and the final format without forcing you to learn professional video software. You can start from either a prompt or an image. Use text-to-video when you want to create a scene from scratch. Use image-to-video when you already have a strong visual and want to bring it to life with motion. The process is simple: describe what should happen, choose the output style, and generate. You can create realistic product videos, anime clips, cinematic shots, lifestyle visuals, short ads, story previews, or quick social content from the same workspace.",
              "zh-CN": "专为文生视频和图生视频打造的 Vheer AI 视频生成器优秀的 Vheer AI 视频生成器不只是把一帧画面变成动态图片。它应该帮助你控制场景、运动、镜头和最终格式，而不需要学习专业视频软件。你可以从提示词或图片开始。想从零创建场景时使用文生视频；已有强视觉素材并想让它动起来时使用图生视频。流程很简单：描述要发生的内容，选择输出风格，然后生成。你可以在同一个工作区创建真实感产品视频、动漫片段、电影感镜头、生活方式视觉、短广告、故事预览或快速社媒内容。"
            }
          }
        ]
      },
      {
        "index": 3,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Create AI Video From Text With Synced MotionTurn a written idea into a short Vheer AI Video without building every frame by hand. Describe the subject, action, background, lighting, and camera movement, then generate a clip that follows your direction. You can create a rainy cyberpunk street, a luxury product commercial, a fantasy forest scene, a food close-up, or a cinematic character moment from text alone. This is useful when you want to test a concept before making a full video, ad, storyboard, or social post.Generate NowTurn Static Product Photos into Physics-Based Motion VideosProduct photos often look good, but motion makes them feel more premium and easier to use in marketing. With Vheer AI Video, you can turn a still product image into a short ad-like clip with camera movement, reflections, light sweeps, steam, mist, rotation, or background motion. This works especially well for ecommerce, product launches, paid ads, website hero sections, social media posts, and client previews. A perfume bottle can glow under studio lighting. A coffee cup can release warm steam. A sneaker can rotate with dramatic shadows. A skincare product can sit in soft natural light while the camera moves slowly toward it. The point is not just animation. The point is to make the product feel more alive, more polished, and more ready for real marketing use.Generate NowUse AI to Describe a Video Free and Pick Your FormatNot every user knows how to write a professional video prompt. Free Vheer AI image-to-video makes the process easier by letting you describe the result in simple, everyday language. Then choose the format based on where the video will be used. Use vertical video for TikTok, Reels, and Shorts. Use landscape for YouTube, websites, presentations, and ads. Use square or 4:5 for social feeds and product posts.Generate Now",
              "zh-CN": "用文字创建带同步运动的 AI 视频把文字想法变成一段短 Vheer AI 视频，不必手动制作每一帧。描述主体、动作、背景、光线和镜头运动，然后生成符合你设想的短片。你可以只用文字创建雨夜赛博朋克街道、奢华产品广告、奇幻森林场景、美食特写，或电影感角色瞬间。适合在制作完整视频、广告、分镜或社媒帖子前测试概念。立即生成把静态产品照片变成有物理感的动态视频产品照片通常已经很好看，但运动能让它更高级，也更适合营销。使用 Vheer AI，你可以把静态产品图变成短广告式片段，加入镜头运动、反射、光扫、蒸汽、薄雾、旋转或背景动态。它尤其适合电商、产品发布、付费广告、网站首屏、社媒帖子和客户预览。香水瓶可以在影棚灯光下发光，咖啡杯可以冒出热气，运动鞋可以带着戏剧化阴影旋转，护肤品可以在柔和自然光中被镜头慢慢推近。重点不只是动画，而是让产品更鲜活、更精致、更适合真实营销使用。立即生成免费用 AI 描述视频并选择格式不是每个用户都知道如何写专业视频提示词。免费的 Vheer AI 图生视频让流程更简单，你可以用日常语言描述想要的结果。然后根据视频用途选择格式。TikTok、Reels 和 Shorts 适合竖屏；YouTube、网站、演示和广告适合横屏；社媒信息流和产品帖子适合方形或 4:5。立即生成"
            }
          }
        ]
      },
      {
        "index": 4,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Text to Video in Three Simple StepsCreate a Vheer AI Video Generator clip from a prompt or image in just a few steps. Start simple, preview the result, and refine the motion until it matches your idea.01Enter Your Prompt or ImageStart with a short text prompt or upload a reference image. If you already have a strong visual, image-to-video is usually the best path. If you only have an idea, text-to-video lets you create a scene from scratch.02Adjust Your Video SettingsChoose the aspect ratio, duration, and output style based on your use case. A product ad may need smooth camera motion and clean lighting. A social clip may need stronger visual movement in the first second. A story scene may need atmosphere, pacing, and cinematic framing.03Generate and Download Your ClipGenerate the video, preview the result, and download it when you are happy with the output. You can adjust your prompt, try a different motion direction, change the format, or create another variation from the same image.",
              "zh-CN": "三步完成文生视频只需几个步骤，就能从提示词或图片创建 Vheer AI 短片。从简单想法开始，预览结果，并不断细化运动，直到它符合你的想法。01输入提示词或图片从简短文字提示词开始，或上传参考图。如果你已经有强视觉素材，图生视频通常是最佳路径。如果只有一个想法，文生视频可以帮你从零创建场景。02调整视频设置根据使用场景选择画幅、时长和输出风格。产品广告可能需要平滑镜头运动和干净灯光；社媒短片可能需要第一秒更强的视觉运动；故事场景可能需要氛围、节奏和电影感构图。03生成并下载短片生成视频，预览结果，满意后下载。你可以调整提示词，尝试不同运动方向，改变格式，或基于同一张图片创建另一个变体。"
            }
          }
        ]
      },
      {
        "index": 5,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Vheer AI Workflows for Social, Ads, Stories, and ClassroomsOne image can become more than one video. With the right prompt, the same visual can turn into a social post, product ad, story preview, educational clip, or creative test. That is why many users searching for Vheer AI Image to Video are really looking for a faster content workflow, not just a single video effect.SocialMarketingStoriesEducationSocial Posts From One ImageTurn portraits, lifestyle shots, food images, or trend concepts into short clips that fit TikTok, Reels, YouTube Shorts, and everyday social content.Product Ads and Website ClipsCreate product showcases, ad-like clips, landing page visuals, and client previews from a single product photo or prompt.Story Previews and Creative TestsUse Vheer AI Video Generator to test scene ideas, character moments, cinematic shots, and storyboard-style previews before making a full video.Classroom and Explainer ClipsTurn a simple image, character, diagram, or scene idea into a short educational clip that is easier to share and understand.",
              "zh-CN": "面向社媒、广告、故事和课堂的 Vheer AI 工作流一张图片可以变成不止一个视频。只要提示词合适，同一个视觉素材就能变成社媒帖子、产品广告、故事预览、教育短片或创意测试。这也是许多搜索 Vheer AI 图生视频的用户真正想要的：更快的内容工作流，而不只是单个视频效果。社媒营销故事教育从一张图片生成社媒帖子把人像、生活方式照片、美食图片或趋势概念变成适合 TikTok、Reels、YouTube Shorts 和日常社媒内容的短片。产品广告和网站短片从一张产品照片或提示词创建产品展示、广告式短片、落地页视觉和客户预览。故事预览和创意测试使用 Vheer AI 视频生成器，在制作完整视频前测试场景想法、角色瞬间、电影感镜头和分镜式预览。课堂和讲解短片把简单图片、角色、图解或场景想法变成更容易分享和理解的教育短片。"
            }
          }
        ]
      },
      {
        "index": 6,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Compare other video modelsExplore related workflows and choose a model that fits your next video.MVMindVideo AITurn a written scene or source image into a short video.Wan 2.2Animate a single image for motion studies and scene previews.Grok ImagineCompare text and image video creation with native audio.",
              "zh-CN": "比较其他视频模型了解相关创作流程，为下一个视频选择合适的模型。MVMindVideo AI将文字描述的场景或原始图片转化为短视频。英文页面Wan 2.2让单张图片动起来，用于动作测试和场景预览。Grok Imagine比较带有原生音频的文生视频与图生视频创作。"
            }
          }
        ]
      },
      {
        "index": 8,
        "heading": {
          "en": "",
          "zh-CN": ""
        },
        "blocks": [
          {
            "kind": "paragraph",
            "text": {
              "en": "Create Your Vheer AI Video in MinutesTurn images, prompts, product photos, or character ideas into dynamic AI videos with Vheer AI Video Generator. Upload your image, describe the motion, and generate a Vheer AI video online.Generate Your Video Now",
              "zh-CN": "几分钟内创建你的 Vheer AI 视频使用 Vheer AI 视频生成器，把图片、提示词、产品照片或角色创意变成动态 AI 视频。上传图片，描述运动效果，即可在线生成 Vheer AI 视频。立即生成你的视频"
            }
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "What can I create with Vheer AI Image to Video?",
          "zh-CN": "我可以用 Vheer AI 图生视频创建什么？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “You can create product showcases, social media clips, cinematic previews, character animations, short ads, story previews, classroom visuals, and quick concept videos from an image or prompt.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“你可以从图片或提示词创建产品展示、社媒短片、电影感预览、角色动画、短广告、故事预览、课堂视觉和快速概念视频。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Can I start from either an image or a text prompt?",
          "zh-CN": "可以从图片或文字提示词开始吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes. Use image-to-video when you already have a strong visual, or use text-to-video when you want to create a new scene from scratch.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“可以。已有强视觉素材时使用图生视频；想从零创建新场景时使用文生视频。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "What should I include in my prompt?",
          "zh-CN": "提示词里应该写什么？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Describe the subject, action, background, lighting, camera movement, atmosphere, and final format. Clear motion direction usually creates a more useful Vheer AI video.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“描述主体、动作、背景、光线、镜头运动、氛围和最终格式。清晰的运动方向通常能生成更实用的 Vheer AI 视频。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Which video format should I choose?",
          "zh-CN": "应该选择哪种视频格式？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Use vertical video for TikTok, Reels, and Shorts. Use landscape for YouTube, websites, presentations, and ads. Use square or 4:5 for social feeds and product posts.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“TikTok、Reels 和 Shorts 适合竖屏。YouTube、网站、演示和广告适合横屏。社媒信息流和产品帖子适合方形或 4:5。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "Is Vheer AI Video useful for product marketing?",
          "zh-CN": "Vheer AI 视频适合产品营销吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Yes. Product photos can become short ad-like clips with camera movement, reflections, light sweeps, steam, mist, rotation, or background motion for ecommerce, launches, ads, and website hero sections.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“适合。产品照片可以变成带镜头运动、反射、光扫、蒸汽、薄雾、旋转或背景动态的短广告式片段，用于电商、发布、广告和网站首屏。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      },
      {
        "question": {
          "en": "How do I get a polished result?",
          "zh-CN": "怎样获得更精致的结果？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: “Start with a clear image or focused idea, describe the motion you want, preview the result, then refine the prompt, motion direction, format, or variation until the clip matches your goal.” These service claims are not independently verified here; generation is unavailable.",
          "zh-CN": "Lanta AI 参照页面在采集时称：“从清晰图片或聚焦的想法开始，描述想要的运动效果，预览结果，然后细化提示词、运动方向、格式或变体，直到短片符合目标。”上述服务主张未经本项目独立验证，生成暂不可用。"
        }
      }
    ]
  }
} satisfies Record<AdditionalVideoModelPath, VideoModelPage>;
export const additionalVideoModelPaths = Object.keys(additionalVideoModelPages) as AdditionalVideoModelPath[];
export function isAdditionalVideoModelPath(path: string): path is AdditionalVideoModelPath { return Object.hasOwn(additionalVideoModelPages, path); }
export const additionalSelectableModels: Record<GeneratorMode, string[]> = {
  "image": [
    "lanta-2-1",
    "wan-2-2-spicy",
    "grok-imagine-video-1-5",
    "minimax-h3",
    "wan-3-0",
    "wan-3-0-pro",
    "wan-3-0-prime",
    "wan-3-0-prime-pro",
    "wan-2-7-spicy",
    "wan-2-7",
    "wan-2-6",
    "wan-2-5",
    "wan-2-2",
    "seedance-2-0-fast",
    "seedance-2-0",
    "happy-horse-1-1",
    "happy-horse-1-0",
    "grok-imagine",
    "kling-3-0",
    "kling-4-0",
    "kling-2-6",
    "kling-2-5-turbo",
    "veo-3-1-fast",
    "veo-3-1"
  ],
  "text": [
    "wan-3-0",
    "wan-3-0-pro",
    "wan-3-0-prime",
    "wan-3-0-prime-pro",
    "minimax-h3",
    "wan-2-7",
    "wan-2-6",
    "wan-2-5",
    "happy-horse-1-1",
    "happy-horse-1-0",
    "grok-imagine",
    "seedance-2-0-fast",
    "seedance-2-0",
    "kling-4-0",
    "kling-2-6",
    "kling-2-5-turbo",
    "veo-3-1-fast",
    "veo-3-1",
    "wan-2-2"
  ]
};
export function additionalDefaultModel(path: AdditionalVideoModelPath, mode: GeneratorMode): string {
  return path === "/ai-video-models/vheer" && mode === "text" ? "veo-3-1-fast" : additionalVideoModelPages[path].defaultModel;
}
