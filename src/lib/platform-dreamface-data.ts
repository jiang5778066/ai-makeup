import type { GeneratorMode } from './platform-generator-data';
import { changeGeneratorModel, initializeGenerator, generatorModel, normalizeParameters, stateIssues, type GeneratorState } from './platform-generator-parameters';
export const dreamfacePath = '/ai-video-models/dreamface-ai' as const;
export type DreamfaceState = GeneratorState & { selectionSource: 'automatic' | 'explicit-url' | 'explicit-user' };
// 来源：C32准确公开英文正文；中文为拟译。第三方能力与本地不可生成身份逐段区分。
export const dreamfaceContent = {
  "en": {
    "sections": [
      {
        "text": [
          "DreamFace AI Video Generator",
          "DreamFace AI brings still photos to life with talking avatars, singing pets and animated performances, making video creation easy without filming. Explore more ways to create with Lanta AI, from talking portraits to original scenes, with dedicated tools and a choice of video models.",
          "Explore local video settings",
          "Explore DreamFace ideas"
        ]
      },
      {
        "text": [
          "Image to Video",
          "Text to Video",
          "Model",
          "Lanta 2.1",
          "High quality, faster and cheaper",
          "Image",
          "Add Image",
          "Prompt",
          "0",
          "/",
          "1000",
          "Duration",
          "3s",
          "4s",
          "5s",
          "8s",
          "Quality",
          "540P",
          "720P",
          "Expect about",
          "2",
          "minutes for AI magic to work!",
          "Generate",
          "9",
          "Unlimited Generate",
          "Upgrade to",
          "Premium",
          "or",
          "Mega",
          "for unlimited generate",
          "Generation History",
          "2026-11-07 18:58:21",
          "5s",
          "Image to Video",
          "Wan 2.2",
          "2026-11-07 18:58:21",
          "4s",
          "Image to Video",
          "Wan 2.2",
          "2026-11-07 18:58:21",
          "4s",
          "Image to Video",
          "Lanta 2.1",
          "2026-11-07 18:58:21",
          "5s",
          "Image to Video",
          "Lanta 2.1"
        ]
      },
      {
        "text": [
          "Meet DreamFace",
          "What can you create with DreamFace AI?",
          "Turn a portrait into a presenter, give a pet a voice or put a character in motion. Each DreamFace tool uses a different starting point to shape the performance.",
          "Dream Avatar 3.0",
          "Talking photos that deliver your message",
          "From a birthday greeting to a character introduction, DreamFace animates a portrait around a script or audio track. Dream Avatar 3.0 also supports full-body avatar performances, so the delivery can include more than a moving face.",
          "Starting point:",
          "A portrait + text or audio",
          "Pet animation",
          "Pets with something to say",
          "Turn a cat, dog or another pet photo into a speaking or singing character. Pair the image with a voice or song to make a playful reply, a personalized greeting or a short social video.",
          "Starting point:",
          "A pet photo + a voice or song",
          "Dream Act",
          "Dance moves from a reference video",
          "Give a character the gestures and body movement of a reference performance. Dream Act transfers motion to a still image, making it useful for dance loops, reaction clips and character-based meme videos.",
          "Starting point:",
          "A character image + a motion reference",
          "AI video creation",
          "New scenes from words or images",
          "Describe a setting and action, or use an image to establish the subject and composition. DreamFace's text-to-video and image-to-video tools expand the idea from a face performance to a complete shot with movement and atmosphere.",
          "Starting point:",
          "A scene description or an image"
        ]
      },
      {
        "text": [
          "DreamFace video ideas",
          "Bring your next idea to life with DreamFace AI",
          "Make a personal greeting, turn a pet into a social character or give an illustrated host a performance. DreamFace brings photos, voices and motion together for stories built around a familiar face.",
          "Personal greetings",
          "Send a message with a familiar face",
          "Animate a portrait around a birthday wish, invitation or thank-you message. A short script or a voice recording lets DreamFace turn a single photo into a personal video you can share.",
          "Pet memes & social posts",
          "Make your pet the star of the story",
          "Give a pet photo a punchline, a playful reply or a song. DreamFace's talking and singing photo tools let you build a short clip around your pet's personality without filming a performance.",
          "Character-led stories",
          "Give your character a recurring role",
          "Introduce an illustrated host, act out a reaction or add a dance to a story. Use DreamFace's avatar tools for dialogue and Dream Act when your character needs to follow a reference performance."
        ]
      },
      {
        "text": [
          "How to create a video with DreamFace AI",
          "For a talking or singing photo, follow the avatar workflow on DreamFace's website or app.",
          "01",
          "Choose your photo or avatar",
          "Open DreamFace's avatar tool and select a character or upload your own photo. Use a clear portrait, pet photo or illustration with an unobstructed face.",
          "02",
          "Add text or audio",
          "Write the words you want the character to say, or upload a speech or song recording. Choose a voice for text, or use your audio to guide the delivery.",
          "03",
          "Generate, preview and download",
          "Generate the animation in DreamFace, then review the mouth movement and expression. Download the result, or adjust your image or audio and create another version."
        ]
      },
      {
        "text": [
          "Compare other video models",
          "Explore related workflows and choose a model that fits your next video.",
          "Wan 2.6",
          "Create text or image videos and explore multi-shot image-to-video storytelling.",
          "Kling 3.0",
          "Compare Kling workflows with audio and multi-shot controls.",
          "Seedance 2.0",
          "Explore video creation guided by text, images, video and audio references."
        ]
      },
      {
        "text": [
          "DreamFace AI FAQ",
          "What is DreamFace AI?",
          "DreamFace is an AI creation platform known for animating photos into talking or singing characters. It also offers avatar animation, motion transfer and text-to-video and image-to-video tools. It is a collection of creative tools, so each feature can have different inputs and output options.",
          "Can DreamFace make a photo talk or sing?",
          "Yes. DreamFace's avatar tools combine a photo with text or audio to animate the character's delivery. The image supplies the appearance, while the speech or song guides the performance. A clear face and an unobstructed mouth give you a useful starting point.",
          "Can I animate a pet photo with DreamFace?",
          "DreamFace includes pet animation for talking and singing clips. Start with a clear image of one animal and a short voice or song segment. Review the mouth movement and expression before sharing, since the result can vary with the face shape and source image.",
          "How is Dream Act different from lip sync?",
          "Lip sync uses speech or singing to guide mouth movement. Dream Act uses a reference video to guide a character's expressions, gestures and poses. Choose audio when the delivery of a line matters most, and a performance reference when you want a particular movement.",
          "Which AI video generator can I use on this page?",
          "The generator above is Lanta AI's video generator. Choose from its available models to create a clip from text or an image. The selected model determines the inputs, duration, resolution, audio options and credit cost shown in the form.",
          "Is DreamFace AI free, and how does Lanta pricing work?",
          "DreamFace advertises a free trial for some avatar features; check its current plan for the limits. For the Lanta generator on this page, sign in and review the credits shown for your selected model and settings. Some Lanta options require a subscription.",
          "Do I need to download an app?",
          "DreamFace offers web, iOS and Android access. You can use the Lanta AI generator on this page in your browser, without installing a mobile app.",
          "What video length and resolution can I choose on Lanta AI?",
          "The options change with the selected model and mode. Choose a model first, then use the duration, resolution and aspect-ratio controls shown in the form. Check any audio or reference requirements before generating; a setting available for one model may not be available for another.",
          "How can I improve a photo animation?",
          "Start with a well-lit image and one clearly visible subject. For a close-up, keep the face and mouth unobstructed; for body motion, leave the arms and legs in frame. Ask for one main action, reduce large camera moves if the face changes, and inspect the result before creating more variations."
        ]
      },
      {
        "text": [
          "Your next video starts with an idea",
          "Bring a photo or imagine a new scene. Explore the models and creative tools on Lanta AI, and give your story a way to move.",
          "Explore local video settings"
        ]
      }
    ],
    "faq": [
      {
        "question": "What is DreamFace AI?",
        "answer": "DreamFace is an AI creation platform known for animating photos into talking or singing characters. It also offers avatar animation, motion transfer and text-to-video and image-to-video tools. It is a collection of creative tools, so each feature can have different inputs and output options."
      },
      {
        "question": "Can DreamFace make a photo talk or sing?",
        "answer": "Yes. DreamFace's avatar tools combine a photo with text or audio to animate the character's delivery. The image supplies the appearance, while the speech or song guides the performance. A clear face and an unobstructed mouth give you a useful starting point."
      },
      {
        "question": "Can I animate a pet photo with DreamFace?",
        "answer": "DreamFace includes pet animation for talking and singing clips. Start with a clear image of one animal and a short voice or song segment. Review the mouth movement and expression before sharing, since the result can vary with the face shape and source image."
      },
      {
        "question": "How is Dream Act different from lip sync?",
        "answer": "Lip sync uses speech or singing to guide mouth movement. Dream Act uses a reference video to guide a character's expressions, gestures and poses. Choose audio when the delivery of a line matters most, and a performance reference when you want a particular movement."
      },
      {
        "question": "Which AI video generator can I use on this page?",
        "answer": "The public reference embeds Lanta AI's video generator; its selected model determines inputs and settings. Here you can preview local parameters and files using the displayed model. DreamFace is not a registered provider in this project. Generation is not available."
      },
      {
        "question": "Is DreamFace AI free, and how does Lanta pricing work?",
        "answer": "DreamFace advertises a free trial for some avatar features; check its current plan for the limits. For the Lanta generator on this page, sign in and review the credits shown for your selected model and settings. Some Lanta options require a subscription. These are the respective providers' terms, not this project's free-trial, pricing or availability promises."
      },
      {
        "question": "Do I need to download an app?",
        "answer": "DreamFace offers web, iOS and Android access. The reference site's Lanta AI generator works in a browser without a mobile app. This project provides local browser previews only."
      },
      {
        "question": "What video length and resolution can I choose on Lanta AI?",
        "answer": "The options change with the selected model and mode. Choose a model first, then use the duration, resolution and aspect-ratio controls shown in the form. Check any audio or reference requirements before generating; a setting available for one model may not be available for another. This project previews parameters only; generation is not available."
      },
      {
        "question": "How can I improve a photo animation?",
        "answer": "Start with a well-lit image and one clearly visible subject. For a close-up, keep the face and mouth unobstructed; for body motion, leave the arms and legs in frame. Ask for one main action, reduce large camera moves if the face changes, and inspect the result before creating more variations."
      }
    ]
  },
  "zh-CN": {
    "sections": [
      {
        "text": [
          "DreamFace AI 视频生成器",
          "DreamFace AI 通过会说话的虚拟角色、会唱歌的宠物和动画表演，让静态照片动起来，无需拍摄也能创作视频。也可了解 Lanta AI 的其它创作方式，从说话人像到原创场景，按需要选择专用工具与视频模型。",
          "探索本地视频参数",
          "探索 DreamFace 创意"
        ]
      },
      {
        "text": [
          "表单：图生视频／文生视频；模型；图片；添加图片；提示词；时长；画质；公开视频示例。公开参照当前显示 Lanta 2.1，并非 DreamFace 型号。本项目仅本地参数与文件预览，生成暂不可用。",
          "参照所写“约需2分钟”、9积分、会员及无限生成属于 Lanta 当时页面条件，不改写为 Makeup AI 的服务承诺。"
        ]
      },
      {
        "text": [
          "了解 DreamFace",
          "DreamFace AI 可以创作什么？",
          "将人像变成讲解者，让宠物发声，或让角色动起来。DreamFace 的不同工具使用不同输入来塑造表演。",
          "Dream Avatar 3.0",
          "让照片传达你的话语",
          "从生日祝福到角色介绍，DreamFace 根据脚本或音轨为人像制作动画。Dream Avatar 3.0 也支持全身虚拟角色表演，表现不只限于面部运动。",
          "起点：",
          "一张人像＋文字或音频",
          "宠物动画",
          "有话要说的宠物",
          "将猫、狗或其它宠物照片变成会说话或唱歌的角色。配上人声或歌曲，制作趣味回复、专属问候或社交短片。",
          "起点：",
          "宠物照片＋人声或歌曲",
          "Dream Act",
          "跟随参考视频的舞蹈动作",
          "让角色呈现参考表演中的手势与身体动作。Dream Act 将动作迁移到静态图片，适合舞蹈循环、反应片段和角色表情包视频。",
          "起点：",
          "角色图片＋动作参考",
          "AI 视频创作",
          "从文字或图片构建新场景",
          "描述环境与动作，或用图片确定主体和构图。DreamFace 的文生视频与图生视频工具将创意从面部表演扩展到有运动与氛围的完整镜头。",
          "起点：",
          "场景描述或图片"
        ]
      },
      {
        "text": [
          "DreamFace 视频创意",
          "用 DreamFace AI 让下一个创意动起来",
          "制作专属问候，让宠物成为社交角色，或让插画主持人表演。DreamFace 将照片、声音与动作结合，围绕熟悉的面孔讲故事。",
          "专属问候",
          "用熟悉的面孔传递心意",
          "围绕生日祝福、邀请或感谢词为人像制作动画。简短脚本或录音可让 DreamFace 将一张照片变成可分享的专属视频。",
          "宠物表情包与社交帖子",
          "让宠物成为故事主角",
          "为宠物照片配上笑点、趣味回复或歌曲。DreamFace 的照片说话与唱歌工具可围绕宠物个性制作短片，无需拍摄表演。",
          "角色故事",
          "给角色一个持续登场的身份",
          "介绍插画主持人、演出反应，或为故事加入舞蹈。对话可使用 DreamFace 虚拟角色工具；需要跟随参考表演时使用 Dream Act。"
        ]
      },
      {
        "text": [
          "如何用 DreamFace AI 制作视频",
          "照片说话或唱歌需在 DreamFace 网站或 app 中使用虚拟角色流程。",
          "01",
          "选择照片或虚拟角色",
          "打开 DreamFace 的虚拟角色工具，选择角色或上传自己的照片。使用面部无遮挡的清晰人像、宠物照片或插画。",
          "02",
          "添加文字或音频",
          "写下想让角色说的话，或上传讲话或歌曲录音。文字可选择配音，也可用自己的音频引导表演。",
          "03",
          "生成、预览并下载",
          "在 DreamFace 中生成动画，检查嘴部动作与表情。下载结果，或调整图片、音频后制作另一版本。"
        ]
      },
      {
        "text": [
          "比较其它视频模型",
          "了解相关工作流，按下一段视频的需要选择模型。",
          "Wan 2.6",
          "探索文字或图片生成视频，以及多镜头图生视频叙事。",
          "Kling 3.0",
          "比较带音频及多镜头控制的 Kling 工作流。",
          "Seedance 2.0",
          "探索以文字、图片、视频与音频参考引导的视频创作。"
        ]
      },
      {
        "text": [
          "DreamFace AI 常见问题"
        ]
      },
      {
        "text": [
          "下一个视频，从一个想法开始",
          "带上一张照片，或想象一个新场景。了解 Lanta AI 的模型与创意工具，让故事动起来。",
          "探索本地视频参数"
        ]
      }
    ],
    "faq": [
      {
        "question": "DreamFace AI 是什么？",
        "answer": "DreamFace 是以照片说话和唱歌角色动画见长的 AI 创作平台，也提供虚拟角色动画、动作迁移、文生视频与图生视频工具。它包含多种创意工具，各功能的输入与输出选项可能不同。"
      },
      {
        "question": "DreamFace 能让照片说话或唱歌吗？",
        "answer": "可以。DreamFace 的虚拟角色工具将照片与文字或音频结合，为角色的表达制作动画。照片决定外观，讲话或歌曲引导表演。清晰面部与无遮挡嘴部是较好的起点。"
      },
      {
        "question": "可以用 DreamFace 为宠物照片制作动画吗？",
        "answer": "DreamFace 提供宠物说话与唱歌动画。可从一张清晰的单只动物照片和一段简短人声或歌曲开始。分享前检查嘴部动作与表情，结果会随脸型和原图变化。"
      },
      {
        "question": "Dream Act 与口型同步有什么不同？",
        "answer": "口型同步通过讲话或唱歌引导嘴部运动；Dream Act 通过参考视频引导角色表情、手势与姿势。重点是台词表达时选择音频，需要特定动作时选择表演参考。"
      },
      {
        "question": "这个页面可以使用哪个 AI 视频生成器？",
        "answer": "公开参照上方嵌入的是 Lanta AI 视频生成器，可从其可选模型中选择文生或图生视频。所选模型决定表单中的输入、时长、分辨率、音频与积分费用。本项目的对应区域仅供参数和本地文件预览，生成暂不可用；不会将 Lanta 2.1 冒称为 DreamFace。"
      },
      {
        "question": "DreamFace AI 免费吗？Lanta 如何计费？",
        "answer": "DreamFace 宣传部分虚拟角色功能提供免费试用，具体限制需查看其当前套餐。公开参照页面的 Lanta 生成器要求登录后查看所选型号与设置对应的积分，部分选项需要订阅。这些是各自服务的说明，不是本项目的免费、价格或可用性承诺。"
      },
      {
        "question": "需要下载 app 吗？",
        "answer": "DreamFace 提供网页、iOS 和 Android 访问方式。参照页面的 Lanta AI 生成器可在浏览器中使用，无需安装手机 app。本项目仅提供浏览器本地预览。"
      },
      {
        "question": "Lanta AI 可以选择哪些时长与分辨率？",
        "answer": "选项随模型和模式改变。先选模型，再使用表单显示的时长、分辨率和画幅控件。生成前检查音频或参考素材要求；某个模型支持的设置不一定适用于另一个。本项目只展示已证实的合法参数，不提供真实生成。"
      },
      {
        "question": "怎样改善照片动画？",
        "answer": "使用光线充足、单一主体清晰可见的图片。近景保持脸与嘴无遮挡；身体动作保留手臂和腿在画面内。一次描述一个主要动作；若面部变化过大可减少大幅运镜。制作更多变体前先检查结果。"
      }
    ]
  }
} as const;
export function initializeDreamface(query: string): DreamfaceState {
 const source = new URLSearchParams(query.split('#')[0]).has('model') ? 'explicit-url' : 'automatic';
 const initial = initializeGenerator(dreamfacePath, query);
 const model = source === 'automatic' ? (initial.mode === 'text' ? 'wan-3-0' : 'lanta-2-1') : initial.model;
 const selected = generatorModel(model);
 const state = {...initial, model, parameters: selected?.kind === 'video' ? normalizeParameters(selected, initial.mode) : {}, selectionSource: source} as DreamfaceState;
 return {...state, issues: [...new Set([...initial.issues.filter(x => x !== 'unsupported-mode'), ...stateIssues(state)])]};
}
export function restoreDreamfaceState(state: GeneratorState): DreamfaceState {
 const source = 'selectionSource' in state ? state.selectionSource : undefined;
 return {...state, selectionSource: source === 'automatic' || source === 'explicit-url' || source === 'explicit-user' ? source : 'explicit-user'};
}
export function chooseDreamfaceModel(state: DreamfaceState, id: string): DreamfaceState {
 const next=changeGeneratorModel(state,id);
 const changed=(Object.keys(state.parameters) as (keyof typeof state.parameters)[]).some(key=>state.parameters[key]!==undefined&&state.parameters[key]!==next.parameters[key]);
 return {...next, issues:[...next.issues,...(changed?['parameters-normalized']:[])], selectionSource: 'explicit-user'};
}
export function changeDreamfaceMode(state: DreamfaceState, mode: GeneratorMode): DreamfaceState {
 const model = state.selectionSource === 'automatic' ? (mode === 'text' ? 'wan-3-0' : 'lanta-2-1') : state.model;
 const selected = generatorModel(model);
 const parameters = selected?.kind === 'video' ? normalizeParameters(selected, mode, state.parameters) : {};
 const next = {...state, mode, model, parameters};
 const changed = (Object.keys(state.parameters) as (keyof typeof parameters)[]).some(key => state.parameters[key] !== undefined && state.parameters[key] !== parameters[key]);
 return {...next, issues: [...stateIssues(next), ...(changed ? ['parameters-normalized'] : [])]};
}
export function selectDreamfaceDuration(state: DreamfaceState, duration: number): {state: DreamfaceState; gated: boolean} {
 if (state.model === 'lanta-2-1' && state.mode === 'image' && duration === 5) return {state, gated: true};
 const selected = generatorModel(state.model), config = selected?.modes[state.mode];
 const valid = config?.durations?.includes(duration) || (config?.durationRange && duration >= config.durationRange[0] && duration <= config.durationRange[1]);
 return {state: valid && selected ? {...state, parameters: normalizeParameters(selected, state.mode, {...state.parameters, duration})} : state, gated: false};
}
