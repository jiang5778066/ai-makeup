import type { GeneratorState, GeneratorParameters } from "./platform-generator-parameters";
import type { GeneratorMode, GeneratorPath, VideoModelPath, CoreVideoModelPath, GeneratorConfig } from "./platform-generator-data";
import { generatorConfig, generatorModel, normalizeParameters } from "./platform-generator-parameters";
import { generatorPages, generatorModels } from "./platform-generator-data";
import { additionalVideoModelPages, additionalVideoModelPaths, isAdditionalVideoModelPath, additionalDefaultModel, additionalSelectableModels } from "./platform-video-model-additional-data";
import { generatorSelectionKey } from "./platform-generator-session";

export type VideoModelText = Readonly<{ en: string; "zh-CN": string }>;
export type VideoModelFaq = Readonly<{ question: VideoModelText; answer: VideoModelText }>;
export type VideoModelBodyBlock = Readonly<{ kind: "heading" | "paragraph" | "list-item" | "table-row"; text: VideoModelText }>;
export type VideoModelBodySection = Readonly<{ index: number; heading: VideoModelText; blocks: readonly VideoModelBodyBlock[] }>;
export type VideoModelPage = Readonly<{
  catalogId: string;
  path: VideoModelPath;
  defaultModel: string;
  title: VideoModelText;
  canonical: string;
  faqBehavior: "multiple" | "single";
  hero: VideoModelText;
  bodySections: readonly VideoModelBodySection[];
  faq: readonly VideoModelFaq[];
}>;

const pathDetails = {
  "/ai-video-models/kling-ai": { catalogId: "kling-ai", defaultModel: "kling-2-6", faqBehavior: "multiple" },
  "/ai-video-models/kling-3-0": { catalogId: "kling-3-0", defaultModel: "kling-3-0", faqBehavior: "single" },
  "/ai-video-models/seedance-2-0": { catalogId: "seedance", defaultModel: "seedance-2-0", faqBehavior: "single" },
  "/ai-video-models/happy-horse-1-0": { catalogId: "happy-horse", defaultModel: "happy-horse-1-0", faqBehavior: "single" },
} as const satisfies Record<CoreVideoModelPath, { catalogId: string; defaultModel: string; faqBehavior: "multiple" | "single" }>;

export const coreVideoModelPaths = Object.keys(pathDetails) as CoreVideoModelPath[];
export const videoModelPaths: VideoModelPath[] = [...coreVideoModelPaths, ...additionalVideoModelPaths];
export function isVideoModelPath(path: string): path is VideoModelPath {
  return Object.hasOwn(pathDetails, path) || isAdditionalVideoModelPath(path);
}

const t = (en: string, zh: string): VideoModelText => ({ en, "zh-CN": zh });
const faq = (en: string, enAnswer: string, zh: string, zhAnswer: string) => ({
  question: t(en, zh), answer: t(enAnswer, zhAnswer),
});



const referenceBodySections: Record<CoreVideoModelPath, readonly VideoModelBodySection[]> = {
  "/ai-video-models/kling-ai": [
    { index: 1, heading: t("How to use Kling AI video generator on Lanta AI", "如何在 Lanta AI 上使用 Kling AI 视频生成器"), blocks: [
        { kind: "paragraph", text: t("Follow three steps to go from idea to finished clip.", "三步从灵感到成片。") },
        { kind: "heading", text: t("Start with Kling 2.6", "从 Kling 2.6 开始") },
        { kind: "paragraph", text: t("The generator on this page loads Kling 2.6 for both text-to-video and image-to-video.", "本页生成器的文生视频和图生视频均加载 Kling 2.6。") },
        { kind: "heading", text: t("Add your prompt or image", "添加提示词或图片") },
        { kind: "paragraph", text: t("Describe the scene or upload a key frame to guide motion and style.", "描述场景或上传关键帧来引导运动与风格。") },
        { kind: "heading", text: t("Generate and refine", "生成并优化") },
        { kind: "paragraph", text: t("Choose a 5- or 10-second clip, decide whether to generate audio, and review the credit cost before submitting.", "选择 5 秒或 10 秒视频片段，决定是否生成音频，并在提交前查看积分消耗。") },
      ] },
    { index: 2, heading: t("What is Kling AI", "Kling AI 是什么"), blocks: [
        { kind: "paragraph", text: t("Kling AI turns natural language and images into cinematic scenes.", "Kling AI 将自然语言与图像转化为电影级场景。") },
        { kind: "paragraph", text: t("On this Lanta AI page, Kling 2.6 is available for text-to-video and image-to-video generation.", "在这个 Lanta AI 页面上，Kling 2.6 可用于文生视频和图生视频。") },
        { kind: "paragraph", text: t("Results depend on the source material, prompt, aspect ratio, clip length, and audio setting you choose.", "生成结果取决于源素材、提示词、画面比例、片段时长和你选择的音频设置。") },
        { kind: "paragraph", text: t("The video generator inside Lanta AI keeps your prompts, camera notes, and outputs together so you can iterate quickly.", "Lanta AI 内置生成器将提示词、镜头备注与输出集中管理，便于快速迭代。") },
      ] },
    { index: 3, heading: t("Kling AI Features", "Kling AI 核心功能"), blocks: [
        { kind: "paragraph", text: t("Use the available Kling 2.6 controls to shape short clips from a prompt or source image.", "使用当前可用的 Kling 2.6 设置，通过提示词或源图片制作短视频片段。") },
      ] },
    { index: 4, heading: t("Kling AI Motion Control", "Kling AI 运动控制"), blocks: [
        { kind: "paragraph", text: t("Kling AI motion control turns plain prompts into dynamic shots.", "Kling AI 运动控制 让普通提示词变成动态镜头。") },
        { kind: "paragraph", text: t("Describe camera direction and subject movement, and the model translates it into smooth motion.", "描述镜头方向与主体运动，模型即可生成顺滑运动。") },
        { kind: "heading", text: t("Camera direction", "镜头方向") },
        { kind: "paragraph", text: t("Guide the scene with phrases such as “slow pan left,” “orbital camera move,” or “handheld follow.” Results can vary between generations.", "使用“慢速向左摇摄”“环绕镜头”或“手持跟随”等描述来引导场景。每次生成的结果可能不同。") },
        { kind: "heading", text: t("Subject behavior", "主体行为") },
        { kind: "paragraph", text: t("Describe your subject’s movement with precision. The model can animate walking, jumping, product rotation, or environmental motion to create a grounded scene.", "精确描述主体运动，如行走、跳跃、产品旋转或环境变化，形成更真实的场景。") },
      ] },
    { index: 5, heading: t("Kling AI Prompt Guide", "Kling AI 提示词指南"), blocks: [
        { kind: "paragraph", text: t("Use a simple prompt structure for consistent results: subject, action, environment, camera, and motion control cues.", "使用简洁的提示词结构获得稳定效果：主体、动作、环境、镜头与运动控制。") },
        { kind: "paragraph", text: t("Start with a clear subject and action.", "先明确主体与动作。") },
        { kind: "paragraph", text: t("Add environment and lighting details that match your brand.", "补充环境与光线细节，匹配品牌风格。") },
        { kind: "paragraph", text: t("Specify camera perspective and motion if you want dynamic energy.", "需要动感时，说明镜头视角与运动方式。") },
        { kind: "heading", text: t("Subject + action", "主体 + 动作") },
        { kind: "paragraph", text: t("Identify the hero and the main movement.", "确定主角与主要动作。") },
        { kind: "heading", text: t("Environment + lighting", "环境 + 光线") },
        { kind: "paragraph", text: t("Set the mood with location and light cues.", "用场景与光线线索营造氛围。") },
        { kind: "heading", text: t("Camera language", "镜头语言") },
        { kind: "paragraph", text: t("Call out lens, shot size, or perspective.", "标注镜头、景别或视角。") },
        { kind: "heading", text: t("Motion control", "运动控制") },
        { kind: "paragraph", text: t("Describe pans, pushes, or tracking moves.", "描述摇移、推进或跟随等运动。") },
        { kind: "heading", text: t("Style notes", "风格备注") },
        { kind: "paragraph", text: t("Define texture, color palette, or genre.", "定义材质、色彩或题材风格。") },
        { kind: "heading", text: t("Format + duration", "格式 + 时长") },
        { kind: "paragraph", text: t("Lock in aspect ratio and clip length.", "锁定画幅比例与片段时长。") },
      ] },
    { index: 6, heading: t("Kling AI 2.6 on Lanta AI", "Lanta AI 上的 Kling AI 2.6"), blocks: [
        { kind: "paragraph", text: t("This page is configured for Kling 2.6. Other Kling versions are separate options elsewhere on Lanta AI.", "本页配置为 Kling 2.6。其他 Kling 版本会作为 Lanta AI 中的独立模型选项提供。") },
        { kind: "paragraph", text: t("Generate 5- or 10-second clips from text or an image. The current generator uses 720p output and offers optional generated audio.", "通过文本或图片生成 5 秒或 10 秒片段。当前生成器输出 720p，并可选择生成音频。") },
        { kind: "paragraph", text: t("The generator shows the current credit cost before you submit. Cost changes with clip length and whether generated audio is enabled.", "生成器会在提交前显示当前积分消耗。费用会随片段时长以及是否开启生成音频而变化。") },
      ] },
    { index: 7, heading: t("Kling AI Use Cases", "Kling AI 应用场景"), blocks: [
        { kind: "paragraph", text: t("The Kling AI video generator adapts to many workflows.", "Kling AI 视频生成器适配多种工作流。") },
        { kind: "heading", text: t("Social and short-form", "社媒短视频") },
        { kind: "paragraph", text: t("Create scroll-stopping clips for TikTok, Reels, and Shorts. The model keeps motion smooth and supports vertical framing.", "为 TikTok、Reels 与 Shorts 生成吸睛短片，运动更顺滑并支持竖屏。") },
        { kind: "heading", text: t("Product demos", "产品演示") },
        { kind: "paragraph", text: t("Use the generator to show features, rotate products, and highlight materials. It is ideal for ecommerce and tech launches.", "展示功能、旋转产品、突出材质细节，适合电商与科技发布。") },
        { kind: "heading", text: t("Brand campaigns", "品牌广告") },
        { kind: "paragraph", text: t("Develop mood-driven sequences with consistent style. The model helps marketing teams maintain brand cohesion.", "用统一风格构建情绪化序列，帮助营销团队保持品牌一致性。") },
        { kind: "heading", text: t("Creative exploration", "创意探索") },
        { kind: "paragraph", text: t("Experiment with genre, lighting, and camera language. The tool gives you a low-risk space to test ideas.", "尝试不同题材、光影与镜头语言，在低风险环境中验证创意。") },
      ] },
    { index: 8, heading: t("Kling AI Production Workflow", "Kling AI 制作流程"), blocks: [
        { kind: "paragraph", text: t("Use Kling 2.6 in the same browser workflow as your prompts, source images, settings, and generated clips.", "在同一浏览器流程中使用 Kling 2.6，集中管理提示词、源图片、设置和生成的视频片段。") },
        { kind: "heading", text: t("Browser-based generation", "浏览器内生成") },
        { kind: "paragraph", text: t("Open the Kling AI generator in your browser without installing video editing software.", "无需安装视频编辑软件，即可在浏览器中打开 Kling AI 生成器。") },
        { kind: "heading", text: t("Fast iteration loops", "快速迭代") },
        { kind: "paragraph", text: t("Review generated clips in the history panel and reuse a previous setup when you want another variation.", "在历史记录面板中查看生成的视频，需要新版本时可复用之前的设置。") },
      ] },
    { index: 9, heading: t("Explore Kling models", "探索 Kling 模型"), blocks: [
        { kind: "paragraph", text: t("Compare the Kling workflows available on Lanta AI.", "比较 Lanta AI 提供的 Kling 视频创作流程。") },
        { kind: "list-item", text: t("Kling 3.0Compare Kling workflows with audio and multi-shot controls.", "Kling 3.0比较提供音频与多镜头控制的 Kling 创作流程。") },
        { kind: "heading", text: t("Kling 3.0", "Kling 3.0") },
        { kind: "paragraph", text: t("Compare Kling workflows with audio and multi-shot controls.", "比较提供音频与多镜头控制的 Kling 创作流程。") },
      ] },
    { index: 10, heading: t("Compare other video models", "比较其他视频模型"), blocks: [
        { kind: "paragraph", text: t("Explore related workflows and choose a model that fits your next video.", "了解相关创作流程，为下一个视频选择合适的模型。") },
        { kind: "list-item", text: t("Wan 2.5Compare short text-to-video and image-to-video workflows with audio options.", "Wan 2.5通过文字或图片创作短视频，并比较音频选项。英文页面") },
        { kind: "heading", text: t("Wan 2.5", "Wan 2.5") },
        { kind: "paragraph", text: t("Compare short text-to-video and image-to-video workflows with audio options.", "通过文字或图片创作短视频，并比较音频选项。") },
        { kind: "list-item", text: t("Veo 3.1 FastExplore Veo 3.1 Fast for short videos with native audio.", "Veo 3.1 Fast了解 Veo 3.1 Fast，创作带有原生音频的短视频。英文页面") },
        { kind: "heading", text: t("Veo 3.1 Fast", "Veo 3.1 Fast") },
        { kind: "paragraph", text: t("Explore Veo 3.1 Fast for short videos with native audio.", "了解 Veo 3.1 Fast，创作带有原生音频的短视频。") },
      ] },
  ],
  "/ai-video-models/kling-3-0": [
    { index: 3, heading: t("What Can You Create with Kling 3.0?", "Kling 3.0 可以生成什么？"), blocks: [
        { kind: "paragraph", text: t("From short drama scenes to product ads, Kling 3.0 keeps visuals, audio, lip sync, and shot control inside one workflow.", "从短剧片段到产品广告，Kling 3.0 都能把画面、音频、口型同步和镜头控制整合进同一套工作流里。") },
        { kind: "heading", text: t("Short Drama Scenes", "短剧场景") },
        { kind: "paragraph", text: t("Create multi-shot character scenes with dialogue, motion, and cinematic pacing.", "生成包含对白、动作和电影节奏的多镜头角色场景。") },
        { kind: "heading", text: t("Product Ad", "产品广告") },
        { kind: "paragraph", text: t("Turn product ideas into polished demos, launch teasers, and ecommerce clips.", "把产品创意快速做成精致演示、上线预热片和电商短视频。") },
        { kind: "heading", text: t("Brand Campaigns", "品牌活动") },
        { kind: "paragraph", text: t("Generate cinematic visuals for ads, seasonal campaigns, and social promotions.", "生成适用于广告、节日活动和社交推广的电影感视觉内容。") },
        { kind: "heading", text: t("Social Media Content", "社交媒体内容") },
        { kind: "paragraph", text: t("Make short, eye-catching videos for TikTok, Reels, Shorts, and X.", "制作适合 TikTok、Reels、Shorts 和 X 的短小吸睛视频。") },
        { kind: "heading", text: t("CGI-Style Visuals", "CGI 风格视觉") },
        { kind: "paragraph", text: t("Generate VFX-like shots, sci-fi scenes, fantasy worlds, or impossible camera moves.", "生成类似 VFX 的镜头、科幻场景、奇幻世界或现实中难以实现的运镜。") },
        { kind: "heading", text: t("Film & Storyboard Previews", "影视分镜预演") },
        { kind: "paragraph", text: t("Turn a script or scene idea into quick visual shots before production.", "把剧本或场景想法快速转成可视化镜头，用于前期预演。") },
      ] },
    { index: 4, heading: t("Why Kling 3.0 Stands Out? 6 Core Highlights", "为什么 Kling 3.0 更出色？6 大核心亮点"), blocks: [
        { kind: "heading", text: t("All-in-One Creation", "一体化创作流程") },
        { kind: "paragraph", text: t("No more complex stitching. Generate multimodal videos in one workflow, with source images and on-screen text kept stable.", "不用再把多个工具硬拼在一起。Kling 3.0 可在同一工作流里完成多模态视频生成，同时更稳定地保留源图和画面中的文字信息。") },
        { kind: "heading", text: t("Native Audio-Video Generation", "原生音视频生成") },
        { kind: "paragraph", text: t("Generate visuals and audio together. Support multiple speakers in one scene, multiple languages and dialects, with accurate lip sync for group shots.", "画面和音频一起生成。支持单场景多说话人、多语言与多种方言，并能在群像镜头中实现更准确的口型同步。") },
        { kind: "heading", text: t("Stronger Subject Consistency", "更强的主体一致性") },
        { kind: "paragraph", text: t("Create a dedicated character from video or multiple images, and keep both appearance and personality consistent.", "可通过视频或多张图片创建专属角色，并在外观和人物气质上保持更高一致性。") },
        { kind: "heading", text: t("15-Second Cinematic Storyboards", "15 秒电影感分镜") },
        { kind: "paragraph", text: t("Set custom durations from 3 to 15 seconds, control up to 6 shots, and create cinematic sequences with ease.", "支持 3 到 15 秒自定义时长，可控制最多 6 个镜头，轻松做出电影感镜头序列。") },
        { kind: "heading", text: t("Custom Shot Control", "自定义镜头控制") },
        { kind: "paragraph", text: t("Precisely direct each shot's composition, camera movement, and framing with a prompt, from wide establishing shots and close-ups to soft-focus cinematic moments.", "你可以用提示词精确指定每个镜头的构图、运镜和景别，从大全景到特写，再到柔焦电影感镜头都能更细致地控制。") },
        { kind: "heading", text: t("4K Visual Quality", "4K 画质输出") },
        { kind: "paragraph", text: t("Native 4K output is more than higher resolution. It makes once-difficult visual details easier to control.", "原生 4K 不只是分辨率更高，更重要的是它让很多过去难以控制的画面细节更容易稳定下来。") },
      ] },
    { index: 5, heading: t("Kling 3.0 Upgrades AI Video Creation with a Unified Architecture", "Kling 3.0 以统一架构升级 AI 视频创作"), blocks: [
        { kind: "paragraph", text: t("Technical architecture upgrade. Kling 3.0 unifies multimodal video generation into one system instead of relying on fragmented stitching.", "这是一次技术架构层面的升级。Kling 3.0 将多模态视频生成统一进同一系统，而不是继续依赖零散拼接式方案。") },
        { kind: "paragraph", text: t("Visual generation, native audio, lip sync, subject consistency, and multi-shot control now work together inside one creative workflow.", "画面生成、原生音频、口型同步、主体一致性和多镜头控制现在可以在同一个创作流程里协同完成。") },
        { kind: "paragraph", text: t("That means faster iteration, fewer handoffs between tools, and a cleaner path from prompt to production-ready video.", "这意味着更快的迭代速度、更少的工具切换，以及从提示词到成片更顺滑的产出路径。") },
        { kind: "heading", text: t("Intelligent Storyboarding System", "智能分镜系统") },
        { kind: "paragraph", text: t("Kling 3.0 automatically analyzes prompts and generates multi-angle coverage such as side views, front views, and close-ups.", "Kling 3.0 会自动解析提示词，并生成侧面、正面、特写等多角度镜头覆盖。") },
        { kind: "paragraph", text: t("It supports custom 6-shot storyboard scripts, making it easier to plan story beats inside one generation.", "它支持自定义 6 镜头分镜脚本，让你在一次生成里就能规划清楚叙事节奏。") },
        { kind: "paragraph", text: t("You can move through cinematic camera language from close-up to medium shot to wide shot without building each cut by hand.", "你可以在同一段视频里完成从特写到中景再到远景的电影化镜头切换，而不必手动逐段拼接。") },
        { kind: "heading", text: t("Enhanced Subject Consistency", "增强的主体一致性") },
        { kind: "paragraph", text: t("Multi-image subject binding technology supports up to 6 subjects inside the same workflow.", "多图主体绑定技术最多支持 6 个主体同时进入同一工作流。") },
        { kind: "paragraph", text: t("Facial features stay more stable when angles change, which helps scenes feel coherent across multiple shots.", "在切换不同机位和视角时，人物五官与身份特征能保持更稳定的一致性。") },
        { kind: "paragraph", text: t("Kling 3.0 also preserves text information more accurately in ecommerce and product-led scenarios.", "在电商和产品展示场景中，Kling 3.0 对文字信息的保留也更准确。") },
        { kind: "heading", text: t("Multilingual Audio-Visual Synchronization", "多语言音画同步") },
        { kind: "paragraph", text: t("Kling 3.0 supports Chinese, English, Japanese, and Korean for audio-visual generation.", "Kling 3.0 支持中文、英文、日文和韩文的音画同步生成。") },
        { kind: "paragraph", text: t("It delivers more accurate lip sync for dialects including Sichuanese, Cantonese, and Northeastern Chinese.", "对于四川话、粤语、东北话等方言，它也能提供更准确的口型对应。") },
        { kind: "paragraph", text: t("Dialogue, sound effects, and background music are treated as separate layers so scenes feel more production-ready.", "对白、音效和背景音乐会被区分成独立层级处理，让成片更接近真正可用的制作素材。") },
        { kind: "heading", text: t("Cinematic Expressiveness", "电影化表现力") },
        { kind: "paragraph", text: t("Kling 3.0 can reproduce complex motion such as dynamic street-dance movement with far more stability than older stitched workflows.", "Kling 3.0 对复杂运动的还原能力更强，例如高动态街舞动作，也能比旧式拼接流程更稳定地呈现。") },
        { kind: "paragraph", text: t("Even in aggressive camera tests, it keeps subjects more recognizable when parts of the face are briefly occluded.", "即使在极限运镜测试里，人物面部部分被遮挡时，主体识别度依然更容易维持。") },
        { kind: "paragraph", text: t("Facial clarity holds up better during push-ins, pull-outs, pans, and tracking moves.", "在推近、拉远、摇摄和跟拍等镜头运动中，人物面部清晰度也能保持得更稳。") },
        { kind: "heading", text: t("Workflow Innovation", "工作流创新") },
        { kind: "paragraph", text: t("Kling 3.0 unifies multimodal editing and general video generation inside the same system.", "Kling 3.0 把多模态编辑和通用视频生成统一进同一套系统里。") },
        { kind: "paragraph", text: t("It can complete multi-shot storytelling in a single generation rather than forcing creators to stitch clips externally.", "它可以在一次生成中完成多镜头叙事，而不是把不同片段丢到外部再二次拼接。") },
        { kind: "paragraph", text: t("The workflow scales from 15-second short videos to more cinematic long-form production planning.", "这套流程既适合 15 秒短视频，也适合更长篇的电影化内容预演和制作规划。") },
      ] },
    { index: 6, heading: t("Explore Kling models", "探索 Kling 模型"), blocks: [
        { kind: "paragraph", text: t("Compare the Kling workflows available on Lanta AI.", "比较 Lanta AI 提供的 Kling 视频创作流程。") },
        { kind: "list-item", text: t("Kling AIExplore Kling 2.6 for text or image videos with optional audio.", "Kling AI了解 Kling 2.6 的文生视频与图生视频流程，可选生成音频。") },
        { kind: "heading", text: t("Kling AI", "Kling AI") },
        { kind: "paragraph", text: t("Explore Kling 2.6 for text or image videos with optional audio.", "了解 Kling 2.6 的文生视频与图生视频流程，可选生成音频。") },
      ] },
    { index: 7, heading: t("Compare other video models", "比较其他视频模型"), blocks: [
        { kind: "paragraph", text: t("Explore related workflows and choose a model that fits your next video.", "了解相关创作流程，为下一个视频选择合适的模型。") },
        { kind: "list-item", text: t("Seedance 2.0Explore video creation guided by text, images, video and audio references.", "Seedance 2.0探索以文字、图片、视频和音频为参考的视频创作。") },
        { kind: "heading", text: t("Seedance 2.0", "Seedance 2.0") },
        { kind: "paragraph", text: t("Explore video creation guided by text, images, video and audio references.", "探索以文字、图片、视频和音频为参考的视频创作。") },
        { kind: "list-item", text: t("Wan 2.6Create text or image videos and explore multi-shot image-to-video storytelling.", "Wan 2.6从文字或图片生成视频，并探索图生视频中的多镜头叙事。英文页面") },
        { kind: "heading", text: t("Wan 2.6", "Wan 2.6") },
        { kind: "paragraph", text: t("Create text or image videos and explore multi-shot image-to-video storytelling.", "从文字或图片生成视频，并探索图生视频中的多镜头叙事。") },
        { kind: "list-item", text: t("MVMindVideo AITurn a written scene or source image into a short video.", "MVMindVideo AI将文字描述的场景或原始图片转化为短视频。英文页面") },
        { kind: "heading", text: t("MindVideo AI", "MindVideo AI") },
        { kind: "paragraph", text: t("Turn a written scene or source image into a short video.", "将文字描述的场景或原始图片转化为短视频。") },
      ] },
  ],
  "/ai-video-models/seedance-2-0": [
    { index: 2, heading: t("Core Advantages of Seedance 2.0", "Seedance 2.0 的核心优势"), blocks: [
        { kind: "paragraph", text: t("Seedance 2.0 is built for AI video creation that needs precise control over visuals, action, camera movement, sound, and story rhythm. It helps creators produce clips that feel closer to production-ready content.", "Seedance 2.0 面向需要精细控制画面、动作、镜头运动、声音和叙事节奏的 AI 视频创作而设计。它可以帮助创作者生成更接近可直接投入制作的内容。") },
        { kind: "paragraph", text: t("Seedance 2.0 handles body weight, jumps, spins, landings, and multi-person interactions with greater stability. Motion feels closer to real-world physics, with less limb distortion, motion drift, and unnatural body deformation.", "Seedance 2.0 在身体重量感、跳跃、旋转、落地以及多人互动上表现更稳定。动作更接近真实世界物理规律，肢体扭曲、运动漂移和不自然变形更少。") },
        { kind: "paragraph", text: t("Instead of relying on one text prompt, you can guide the video with text, images, video clips, and audio references. This gives you more control over characters, products, scenes, actions, camera direction, and sound.", "你不必只依赖单一文本提示词，还可以通过文本、图片、视频片段和音频参考来引导生成。这样你就能更好地控制角色、产品、场景、动作、镜头方向和声音。") },
        { kind: "paragraph", text: t("One generation can include wide shots, medium shots, close shots, close-ups, montage-style cuts, and long-take sequences. Video duration ranges from 3 to 15 seconds.", "一次生成就可以包含远景、中景、近景、特写、蒙太奇式剪辑以及长镜头序列。视频时长可覆盖 3 到 15 秒。") },
        { kind: "paragraph", text: t("No manual dubbing is needed. Seedance 2.0 can generate synchronized audio and video, including lip-synced speech, background music, ambient sound, and sound effects.", "无需再手动配音。Seedance 2.0 可以同步生成音频和视频，包括口型同步的对白、背景音乐、环境音以及音效。") },
        { kind: "paragraph", text: t("Seedance 2.0 understands camera language and motion instructions. You can describe push-ins, tracking shots, orbit shots, wide shots, close-ups, and action rhythm to create more director-style camera staging.", "Seedance 2.0 能理解镜头语言和运动指令。你可以描述推镜、跟拍、环绕镜头、远景、特写以及动作节奏，从而做出更具导演感的镜头调度。") },
      ] },
    { index: 4, heading: t("Physically Believable Motion in Complex Scenes", "复杂场景中的物理真实运动"), blocks: [
        { kind: "paragraph", text: t("Complex motion is where AI video usually starts to fall apart. As subjects move, turn, jump, spin, or interact, Seedance 2.0 model helps reduce warped limbs, drifting products, unstable details, jittering frames, and broken movement logic.", "复杂运动往往是 AI 视频最容易开始失真的地方。当主体移动、转身、跳跃、旋转或发生互动时，Seedance 2.0 模型可以帮助减少肢体扭曲、产品漂移、细节不稳、画面抖动以及动作逻辑断裂。") },
        { kind: "paragraph", text: t("Seedance 2.0 is designed to hold those difficult moments together. It gives actions a clearer sense of preparation, acceleration, weight, impact, and follow-through, making dance shots, sports scenes, product handling, and character interactions feel more grounded and physically believable.", "Seedance 2.0 的设计目标就是把这些高难度时刻尽量稳住。它让动作拥有更清晰的准备、加速、重量、冲击和收尾感，使舞蹈镜头、运动场景、产品操作和角色互动看起来更贴地、更符合真实物理规律。") },
        { kind: "heading", text: t("Shot Scale Control", "镜头景别控制") },
        { kind: "paragraph", text: t("Seedance 2.0 can follow shot instructions such as wide shots, medium shots, close-ups, hero shots, and montage-style cuts, giving creators more control over what the viewer sees in each moment.", "Seedance 2.0 可以遵循远景、中景、近景、英雄镜头以及蒙太奇式剪辑等镜头指令，让创作者更好地控制观众在每个时刻看到什么。") },
        { kind: "heading", text: t("Prompt-Driven Camera Movement", "提示词驱动的镜头运动") },
        { kind: "paragraph", text: t("Creators can guide camera behavior with prompts for slow push-ins, tracking shots, orbit moves, handheld motion, overhead shots, or low-angle framing, shaping not only the scene but how the viewer moves through it.", "创作者可以通过提示词引导镜头行为，例如慢速推近、跟拍、环绕运动、手持感镜头、俯拍或低机位构图，不仅塑造场景本身，也塑造观众穿越场景的方式。") },
        { kind: "heading", text: t("More Complete Visual Flow", "更完整的视觉流程") },
        { kind: "paragraph", text: t("For multi-shot videos, Seedance 2.0 can organize camera direction into a clearer sequence: opening shot, main action, detail close-up, and final hero moment, making it useful for ads, b-roll, story scenes, and music-video-style clips.", "对于多镜头视频，Seedance 2.0 可以把镜头方向组织成更清晰的顺序：开场镜头、主体动作、细节特写和最终 hero 时刻，因此很适合广告、B-roll、剧情片段和音乐视频风格内容。") },
        { kind: "paragraph", text: t("Turn text, images, video clips, and audio into cinematic HD videos with stronger control and more accurate prompt following. Seedance 2.0 uses multimodal inputs to help creators shape motion, camera direction, scene rhythm, and sound with greater precision, making the final video feel closer to the idea you actually wanted to create.", "把文本、图片、视频片段和音频转化为电影感 HD 视频，同时获得更强的控制力和更准确的提示词执行。Seedance 2.0 利用多模态输入帮助创作者更精确地塑造运动、镜头方向、场景节奏和声音，让最终视频更接近你真正想表达的创意。") },
      ] },
    { index: 5, heading: t("How to write prompts for Seedance 2.0? Most Practical Seedance 2.0 Prompt Templates", "如何为 Seedance 2.0 编写提示词？最实用的 Seedance 2.0 提示词模板"), blocks: [
        { kind: "heading", text: t("Template 1: General High-Quality Video", "模板 1：通用高质量视频") },
        { kind: "paragraph", text: t("Template", "模板") },
        { kind: "paragraph", text: t("Example", "示例") },
        { kind: "paragraph", text: t("Create an 8-second cute cinematic pet video of a fluffy orange cat cooking in a cozy home kitchen. The cat stands on a small stool in front of the counter, wearing a tiny chef hat and gently stirring a bowl of pancake batter with both paws. Use a medium close-up shot with a slow push-in camera movement, keeping the cat centered while showing the warm kitchen background. The motion should include the cat blinking, moving its paws naturally, tilting its head with curiosity, and carefully stirring the bowl without changing its position. The visual style should be warm, realistic, soft, and charming, with morning sunlight, creamy kitchen colors, detailed fur texture, and a playful family-friendly mood. Add light kitchen ambience, soft cheerful background music, gentle bowl-stirring sounds, and a cute little meow near the end. Keep the cat’s appearance, chef hat, bowl, kitchen setting, and cozy visual style consistent throughout the video.", "创建一支 8 秒钟、可爱且具有电影感的宠物视频：一只毛茸茸的橘猫在温馨的家庭厨房里做饭。猫咪站在料理台前的小凳子上，戴着迷你厨师帽，用两只前爪轻轻搅拌一碗煎饼面糊。使用中近景镜头和缓慢推近的机位运动，让猫咪保持在画面中央，同时展示温暖的厨房背景。动作应包括猫咪眨眼、自然移动爪子、好奇地歪头，并在不改变站位的前提下小心搅拌面糊。视觉风格应温暖、写实、柔和且讨喜，包含晨光、奶油色厨房配色、细致的毛发纹理以及适合家庭观看的 playful 氛围。加入轻微厨房环境音、柔和欢快的背景音乐、轻轻搅拌碗的声音，并在结尾加入一声可爱的猫叫。请在整个视频中保持猫咪外观、厨师帽、搅拌碗、厨房场景和温馨视觉风格的一致性。") },
        { kind: "heading", text: t("Template 2: Image-to-Video", "模板 2：图生视频") },
        { kind: "paragraph", text: t("Template", "模板") },
        { kind: "paragraph", text: t("Example", "示例") },
        { kind: "paragraph", text: t("Use the two people in the reference image as the same characters. Create an 8-second office conversation video, keeping their faces, clothing, and office setting consistent. The woman speaks first with a playful expression and says: \"You always arrive just on time — do you enjoy that feeling of cutting it close?\" The man smiles, laughs lightly, and responds: \"I have my own rhythm.\" Use natural lip sync, casual body language, soft office lighting, a medium two-shot with subtle camera movement, clear dialogue audio, light office ambience, and subtitles at the bottom matching each line.", "将参考图中的两个人物作为同一组角色。创建一支 8 秒钟的办公室对话视频，并保持他们的面部、服装和办公室环境一致。女性先带着俏皮的表情说：“你总是刚刚好赶到，是不是很享受这种踩点的感觉？” 男性微笑、轻轻笑出声，然后回答：“我有我自己的节奏。” 使用自然的口型同步、随性的肢体语言、柔和的办公室光线、中景双人镜头和轻微的镜头移动，保留清晰的对白音频与轻度办公室环境音，并在画面底部添加与每句台词对应的字幕。") },
        { kind: "heading", text: t("Template 3: Video Reference", "模板 3：视频参考") },
        { kind: "paragraph", text: t("Template", "模板") },
        { kind: "paragraph", text: t("Example", "示例") },
        { kind: "paragraph", text: t("Use Video 1 only as a reference for the camera movement and pacing. Do not copy the original person, background, kitchen layout, objects, or actions from the reference video. Use Image 1 as the reference for the cat’s appearance, fur color, face, and overall pet identity. Generate a new 8-second adorable pet cooking video where the cat stands in a cozy home kitchen, wearing a tiny chef hat, and slowly stirs pancake batter in a ceramic bowl with both front paws. Follow the slow push-in and gentle framing rhythm from Video 1, but make the action completely new: the cat blinks, tilts its head, moves its paws naturally, and stirs the batter carefully. Use warm morning light, soft cream-and-wood kitchen colors, realistic fur texture, shallow depth of field, light kitchen ambience, subtle bowl-stirring sounds, and cheerful background music. Keep the cat, chef hat, bowl, kitchen counter, and cozy visual style consistent throughout the video.", "仅把 Video 1 用作镜头运动和节奏的参考。不要复制参考视频中的原始人物、背景、厨房布局、物体或动作。将 Image 1 作为猫咪外观、毛色、面部特征和整体身份的参考。生成一支全新的 8 秒可爱宠物烹饪视频：猫咪站在温馨的家庭厨房里，戴着小厨师帽，用两只前爪慢慢搅拌陶瓷碗中的煎饼面糊。延续 Video 1 中缓慢推近和柔和构图的节奏，但动作内容必须全新：猫咪会眨眼、歪头、自然移动爪子，并小心地搅拌面糊。使用温暖晨光、柔和的奶油色与木质厨房配色、写实毛发纹理、浅景深、轻度厨房环境音、细微的搅拌碗声和愉快的背景音乐。在整个视频中保持猫咪、厨师帽、碗、厨房台面和温馨视觉风格的一致性。") },
        { kind: "heading", text: t("Template 4: 15-Second Multi-Shot Video", "模板 4：15 秒多镜头视频") },
        { kind: "paragraph", text: t("Template", "模板") },
        { kind: "paragraph", text: t("Example", "示例") },
        { kind: "paragraph", text: t("Create a 15-second product ad with four connected shots.\n\nShot 1, 0–3s: Wide shot of the product on a dark reflective surface.\nShot 2, 3–7s: Slow orbit shot revealing the product shape and material.\nShot 3, 7–11s: Close-up of the logo with light moving across the surface.\nShot 4, 11–15s: Final hero shot with soft background music and a clean sound effect.\n\nKeep the product shape, logo, color, and material consistent throughout the video.", "创建一支由四个连贯镜头组成的 15 秒产品广告。\n\n镜头 1，0–3 秒：产品置于深色反光台面上的远景镜头。\n镜头 2，3–7 秒：缓慢环绕镜头，展示产品外形与材质。\n镜头 3，7–11 秒：品牌 logo 特写，光线从表面缓缓扫过。\n镜头 4，11–15 秒：最终 hero 镜头，搭配柔和背景音乐和干净的音效。\n\n在整个视频中保持产品形状、logo、颜色和材质的一致性。") },
        { kind: "heading", text: t("Template 5: Audio Reference & Lip Sync", "模板 5：音频参考与口型同步") },
        { kind: "paragraph", text: t("Template", "模板") },
        { kind: "paragraph", text: t("Example", "示例") },
        { kind: "paragraph", text: t("Use Image 1 as the reference for the male character’s face, hairstyle, outfit, and identity. Use Image 2 as the reference for the female character’s face, hairstyle, outfit, and identity. Use Audio 1 as a reference for dialogue rhythm, emotional pacing, accent style, and conversational tone. Create a 10-second cinematic dialogue scene between the two characters in a warm candlelit room. The man says: \"I have guarded every word, yet none of them have protected me from you.\" The woman replies: \"Then perhaps the fault was never in the words, but in the silence between them.\" Use natural English, restrained emotion, elegant pacing, and accurate lip sync. Keep both faces clearly visible in a medium two-shot, then slowly move into alternating close-ups as each character speaks. Add soft string music and gentle room ambience, but keep both voices clean and easy to hear. Add subtitles at the bottom of the screen matching each line of dialogue. Keep both characters’ faces, clothing, lighting, and period-drama atmosphere consistent throughout the video.", "将 Image 1 作为男性角色的面部、发型、服装和身份参考。将 Image 2 作为女性角色的面部、发型、服装和身份参考。将 Audio 1 作为对白节奏、情绪推进、口音风格和对话语气的参考。创建一个 10 秒的电影感对话场景，两位角色位于温暖烛光照亮的房间中。男性说：“我守住了每一个词，却没有一个词能让我躲开你。” 女性回应：“也许错从来不在那些词里，而在它们之间的沉默里。” 使用自然的英文、克制的情绪、优雅的节奏和准确的口型同步。先用中景双人镜头清晰展示两张脸，再在两人各自开口时缓慢切入交替特写。加入柔和的弦乐和轻微室内环境音，但保持两人的声音干净且易于听清。在画面底部添加与每句对白对应的字幕，并在整个视频中保持两位角色的面部、服装、光线和年代剧氛围一致。") },
      ] },
    { index: 6, heading: t("Seedance 2.0 vs Kling 2.1, Wan 2.2, and Veo 3", "Seedance 2.0 对比 Kling 2.1、Wan 2.2 和 Veo 3"), blocks: [
        { kind: "paragraph", text: t("Direct comparison against the current generation of leading AI video models across five critical quality dimensions.", "围绕五个关键质量维度，对当前主流 AI 视频模型进行直接对比。") },
        { kind: "heading", text: t("Multi-Metric Radar: 4-Model Comparison", "多指标雷达图：四模型对比") },
        { kind: "paragraph", text: t("Each axis: 0-100 composite score from 50+ test generations", "每个维度为 0-100 复合得分，来源于 50+ 次测试生成") },
        { kind: "list-item", text: t("Kling 2.1", "Kling 2.1") },
        { kind: "list-item", text: t("Seedance 2.0", "Seedance 2.0") },
        { kind: "list-item", text: t("Veo 3", "Veo 3") },
        { kind: "list-item", text: t("Wan 2.2", "Wan 2.2") },
        { kind: "heading", text: t("Overall Cinematic Quality Score", "综合电影化质量得分") },
        { kind: "paragraph", text: t("Composite score across all 6 evaluation dimensions (0-100)", "基于 6 个评估维度汇总的复合分（0-100）") },
        { kind: "heading", text: t("Quality Score Breakdown", "质量评分拆解") },
        { kind: "paragraph", text: t("50+ identical prompts per model, scale 1-10", "每个模型使用 50+ 组相同提示词，评分范围 1-10") },
        { kind: "table-row", text: t("Dimension | Kling | Wan | Veo | Seedance", "维度 | Kling | Wan | Veo | Seedance") },
        { kind: "table-row", text: t("Edge Stability | 5 | 6 | 7 | 8", "边缘稳定性 | 5 | 6 | 7 | 8") },
        { kind: "table-row", text: t("Motion Flow | 5 | 6 | 7 | 9", "运动流畅度 | 5 | 6 | 7 | 9") },
        { kind: "table-row", text: t("Style Drift | 4 | 6 | 7 | 8", "风格漂移 | 4 | 6 | 7 | 8") },
        { kind: "table-row", text: t("Face Consistency | 4 | 5 | 7 | 7", "人脸一致性 | 4 | 5 | 7 | 7") },
        { kind: "table-row", text: t("Camera Control | 4 | 5 | 7 | 9", "镜头控制 | 4 | 5 | 7 | 9") },
        { kind: "table-row", text: t("Average | 4.4 | 5.6 | 7.0 | 8.2", "平均 | 4.4 | 5.6 | 7.0 | 8.2") },
      ] },
    { index: 7, heading: t("Compare other video models", "比较其他视频模型"), blocks: [
        { kind: "paragraph", text: t("Explore related workflows and choose a model that fits your next video.", "了解相关创作流程，为下一个视频选择合适的模型。") },
        { kind: "list-item", text: t("HappyHorse 1.0Explore multi-image references for short visual stories.", "HappyHorse 1.0探索使用多张参考图片创作简短的视觉故事。") },
        { kind: "heading", text: t("HappyHorse 1.0", "HappyHorse 1.0") },
        { kind: "paragraph", text: t("Explore multi-image references for short visual stories.", "探索使用多张参考图片创作简短的视觉故事。") },
        { kind: "list-item", text: t("Kling 3.0Compare Kling workflows with audio and multi-shot controls.", "Kling 3.0比较提供音频与多镜头控制的 Kling 创作流程。") },
        { kind: "heading", text: t("Kling 3.0", "Kling 3.0") },
        { kind: "paragraph", text: t("Compare Kling workflows with audio and multi-shot controls.", "比较提供音频与多镜头控制的 Kling 创作流程。") },
        { kind: "list-item", text: t("Wan 3.0Explore text, image and multimodal reference workflows.", "Wan 3.0探索文字、图片和多模态参考素材驱动的视频创作流程。") },
        { kind: "heading", text: t("Wan 3.0", "Wan 3.0") },
        { kind: "paragraph", text: t("Explore text, image and multimodal reference workflows.", "探索文字、图片和多模态参考素材驱动的视频创作流程。") },
        { kind: "list-item", text: t("MVMindVideo AITurn a written scene or source image into a short video.", "MVMindVideo AI将文字描述的场景或原始图片转化为短视频。英文页面") },
        { kind: "heading", text: t("MindVideo AI", "MindVideo AI") },
        { kind: "paragraph", text: t("Turn a written scene or source image into a short video.", "将文字描述的场景或原始图片转化为短视频。") },
      ] },
  ],
  "/ai-video-models/happy-horse-1-0": [
    { index: 3, heading: t("Explore HappyHorse 1.0 Use Cases", "探索 HappyHorse 1.0 的使用场景"), blocks: [
        { kind: "paragraph", text: t("HappyHorse 1.0 is built for creators who need short-form storytelling, product motion, and platform-ready video formats from one workflow.", "HappyHorse 1.0 面向需要短视频叙事、产品动态展示和平台适配格式的一线创作者，让这些需求都能在同一套工作流中完成。") },
        { kind: "heading", text: t("Social Media", "社交媒体") },
        { kind: "paragraph", text: t("Create short-form videos for TikTok, Reels, Shorts, and other social platforms.", "为 TikTok、Reels、Shorts 等社交平台制作短视频内容。") },
        { kind: "heading", text: t("E-commerce Product", "电商产品") },
        { kind: "paragraph", text: t("Turn product images into showcase videos, usage scenes, and ad-ready product visuals.", "把产品图片转成展示视频、使用场景视频和可直接投放的广告素材。") },
        { kind: "heading", text: t("Brand Campaign", "品牌 Campaign") },
        { kind: "paragraph", text: t("Create product ads, campaign visuals, holiday marketing clips, and new product teasers.", "制作产品广告、Campaign 视觉、节日营销短片和新品预热视频。") },
        { kind: "heading", text: t("Character and IP", "角色与 IP") },
        { kind: "paragraph", text: t("Bring virtual humans, anime characters, game characters, and original IP concepts to life.", "让虚拟人、动漫角色、游戏角色和原创 IP 概念真正动起来。") },
        { kind: "heading", text: t("Cinematic Clips", "电影感短片") },
        { kind: "paragraph", text: t("Generate cinematic shots, short drama previews, MV concepts, and storyboard tests.", "生成电影镜头、短剧预告、MV 概念片和分镜测试视频。") },
      ] },
    { index: 4, heading: t("Key Features of HappyHorse 1.0", "HappyHorse 1.0 核心功能"), blocks: [
        { kind: "heading", text: t("Strong Prompt-Following Ability", "强大的提示词跟随能力") },
        { kind: "paragraph", text: t("HappyHorse 1.0 can understand complex prompts and follow detailed requirements for frame composition, camera movement, visual style, and atmosphere.", "HappyHorse 1.0 能理解复杂提示词，并准确执行关于构图、镜头运动、视觉风格和氛围的细节要求。") },
        { kind: "heading", text: t("Multi-Image Reference Video Generation", "多图参考视频生成") },
        { kind: "paragraph", text: t("Upload multiple reference images and let HappyHorse generate videos based on the people, scenes, and props shown in those images.", "你可以上传多张参考图，让 HappyHorse 根据图中的人物、场景和道具来生成视频。") },
        { kind: "heading", text: t("15-Second Multi-Shot Storytelling", "15 秒多镜头叙事") },
        { kind: "paragraph", text: t("HappyHorse 1.0 can follow camera directions such as slow push-ins and shot-to-shot transitions to create visual storytelling inside a 15-second clip.", "HappyHorse 1.0 能跟随慢推、镜头切换等拍摄指令，在 15 秒内做出具有叙事感的多镜头视频。") },
        { kind: "heading", text: t("Fast Generation Speed", "生成速度快") },
        { kind: "paragraph", text: t("From the moment you submit a prompt or image, HappyHorse 1.0 can generate a 15-second video in about 2 to 5 minutes.", "从提交提示词或图片开始，HappyHorse 1.0 通常可在 2 到 5 分钟内生成一支 15 秒视频。") },
        { kind: "heading", text: t("1080P Ultra-Clear Output", "1080P 超清输出") },
        { kind: "paragraph", text: t("HappyHorse 1.0 supports 720P and 1080P video output, so faces, product details, lighting, and textures look clearer and more defined.", "HappyHorse 1.0 支持 720P 和 1080P 输出，让人物、产品细节、光影和材质表现更清晰。") },
        { kind: "heading", text: t("Multiple Aspect Ratio Support", "支持多种画幅比例") },
        { kind: "paragraph", text: t("Generate videos in formats such as 16:9, 9:16, 1:1, 4:3, and 3:4 for YouTube, TikTok, Reels, Shorts, and more without extra cropping.", "可生成 16:9、9:16、1:1、4:3、3:4 等多种比例视频，适配 YouTube、TikTok、Reels、Shorts 等平台，无需额外裁切。") },
      ] },
    { index: 5, heading: t("Introducing HappyHorse-1.0 AI Video Generator", "认识 HappyHorse-1.0 AI 视频生成器"), blocks: [
        { kind: "paragraph", text: t("HappyHorse-1.0 is a new AI video generator built for text-to-video, image-to-video, multi-image reference generation, and AI video editing.", "HappyHorse-1.0 是一款全新的 AI 视频模型，覆盖文生视频、图生视频、多图参考生成以及 AI 视频编辑。") },
        { kind: "paragraph", text: t("Create short videos with cinematic visuals, smooth camera movement, realistic details, and more consistent characters, scenes, and styles.", "它可以生成具有电影感画面、顺滑镜头运动、真实细节，并在角色、场景和风格上更一致的短视频。") },
        { kind: "paragraph", text: t("Use it to explore ideas from scratch, bring still assets to life, build story-driven scenes, or rework original clips for social media, product showcases, brand campaigns, storyboards, and more.", "你可以用它从零探索创意、让静态素材动起来、搭建带剧情的场景，或把现有视频重做成适用于社交媒体、产品展示、品牌 Campaign、分镜测试等用途的新版本。") },
        { kind: "heading", text: t("Turn Text Prompts into Cinematic Video Concepts", "把文字提示变成电影感视频概念") },
        { kind: "paragraph", text: t("Creation often starts with a scene in your head. With HappyHorse 1.0 Text-to-Video, you can describe the visual content, style, motion, lighting, and mood you want, then generate a short video that brings your idea into view.", "很多创作都始于脑海中的一个画面。通过 HappyHorse 1.0 的文生视频能力，你可以描述想要的内容、风格、运动、光线和情绪，再生成一支把想法具体呈现出来的短视频。") },
        { kind: "paragraph", text: t("Test out cinematic scenes, character interactions, product moments, surreal camera movement, and social video concepts without filming from scratch.", "你可以快速测试电影场景、角色互动、产品瞬间、超现实镜头运动和社交视频创意，而不需要真的开拍。") },
        { kind: "paragraph", text: t("It is a fast way to brainstorm, validate creative directions, and turn early ideas into video clips you can build on.", "这是一种高效的创意验证方式，适合头脑风暴、方向筛选，以及把初步概念先落成可继续打磨的视频片段。") },
        { kind: "heading", text: t("Animate Images While Preserving Their Original Look", "让静态图片动起来，同时保留原有风格") },
        { kind: "paragraph", text: t("Give your static visuals a new sense of movement. Upload a single image, such as a product photo, portrait, design mockup, illustration, or storyboard frame, and HappyHorse 1.0 can generate a dynamic video that follows the image's original content and style.", "给静态画面加入真实的运动感。上传单张图片，无论是产品照片、人像、设计稿、插画还是分镜画面，HappyHorse 1.0 都能基于原图内容和风格生成动态视频。") },
        { kind: "paragraph", text: t("Use it to bring photography, concept art, campaign visuals, and social media graphics to life with motion, atmosphere, and camera movement that feel connected to the source image.", "它非常适合让摄影作品、概念艺术、Campaign 视觉和社交媒体图片素材拥有与原图一致的氛围、运动和镜头感。") },
        { kind: "heading", text: t("Use Multiple Reference Images to Control the Story", "用多张参考图更精确地控制故事") },
        { kind: "paragraph", text: t("Some video ideas need more than one visual reference. With HappyHorse 1.0 Multi-Image Reference to Video, you can upload several images to guide the people, scenes, props, and style of the final result.", "有些视频创意只靠一张图还不够。通过 HappyHorse 1.0 的多图参考能力，你可以上传多张图片来约束人物、场景、道具和整体风格。") },
        { kind: "paragraph", text: t("Use subject references to borrow character features or keyframe references to guide specific shots.", "你可以用人物参考图借用角色特征，也可以用关键帧参考图去指定某些具体镜头。") },
        { kind: "paragraph", text: t("This gives creators a more precise way to build narrative videos, maintain character consistency, connect scenes, and keep the overall visual style unified.", "这让创作者更容易搭建叙事视频，保持角色一致性，衔接多个场景，并让整体视觉语言保持统一。") },
        { kind: "heading", text: t("Edit Existing Footage into New Creative Versions", "把现有视频改造成新的创意版本") },
        { kind: "paragraph", text: t("Not every project needs a completely new video. With HappyHorse 1.0 Video Editing, you can start from existing footage and reshape it with AI.", "并不是每个项目都需要从零生成。通过 HappyHorse 1.0 的视频编辑能力，你可以在现有素材基础上用 AI 重做视频。") },
        { kind: "paragraph", text: t("Replace a desert background with a bright coastal scene, turn a green screen shot into a fashion runway, or adjust lighting and atmosphere while keeping the original subject and motion intact.", "例如把沙漠背景替换成明亮海岸，把绿幕镜头改造成时装秀舞台，或在保留主体和动作的前提下调整光线与氛围。") },
        { kind: "paragraph", text: t("It is ideal for refreshing old assets, creating campaign variations, and exploring new visual directions from footage you already have.", "它很适合翻新旧素材、制作多版本 Campaign 创意，或从已有视频中探索新的视觉方向。") },
      ] },
    { index: 6, heading: t("Compare other video models", "比较其他视频模型"), blocks: [
        { kind: "paragraph", text: t("Explore related workflows and choose a model that fits your next video.", "了解相关创作流程，为下一个视频选择合适的模型。") },
        { kind: "list-item", text: t("Seedance 2.0Explore video creation guided by text, images, video and audio references.", "Seedance 2.0探索以文字、图片、视频和音频为参考的视频创作。") },
        { kind: "heading", text: t("Seedance 2.0", "Seedance 2.0") },
        { kind: "paragraph", text: t("Explore video creation guided by text, images, video and audio references.", "探索以文字、图片、视频和音频为参考的视频创作。") },
        { kind: "list-item", text: t("Kling 3.0Compare Kling workflows with audio and multi-shot controls.", "Kling 3.0比较提供音频与多镜头控制的 Kling 创作流程。") },
        { kind: "heading", text: t("Kling 3.0", "Kling 3.0") },
        { kind: "paragraph", text: t("Compare Kling workflows with audio and multi-shot controls.", "比较提供音频与多镜头控制的 Kling 创作流程。") },
        { kind: "list-item", text: t("Wan 2.6Create text or image videos and explore multi-shot image-to-video storytelling.", "Wan 2.6从文字或图片生成视频，并探索图生视频中的多镜头叙事。英文页面") },
        { kind: "heading", text: t("Wan 2.6", "Wan 2.6") },
        { kind: "paragraph", text: t("Create text or image videos and explore multi-shot image-to-video storytelling.", "从文字或图片生成视频，并探索图生视频中的多镜头叙事。") },
      ] },
  ],
};

// 文案按固定参照逐页整理；公开能力和商业主张始终归因于采集时的外部页面。
const pageCopy: Record<CoreVideoModelPath, { hero: VideoModelText; faq: VideoModelFaq[] }> = {
  "/ai-video-models/kling-ai": {
    hero: t("Create with Kling AI through Lanta AI's browser-based video generator. This reference page uses Kling 2.6 for 5- or 10-second clips from text or an image, with optional generated audio.", "通过 Lanta AI 浏览器视频生成器使用 Kling AI。该参照页使用 Kling 2.6，可由文字或图片生成 5 秒或 10 秒视频，并可选择生成音频。"),
    faq: [
      faq("What is Kling AI on Lanta AI?", "The Lanta AI reference page stated at capture time: “This page provides Kling 2.6 through Lanta AI's browser-based generator. You can create from a text prompt or upload an image as the starting frame. Lanta AI is not an official Kling product or service.” This project has not independently verified the service claims; generation is not connected here.", "Lanta AI 上的 Kling AI 是什么？", "Lanta AI 参照页面在采集时称：“本页通过 Lanta AI 的浏览器生成器提供 Kling 2.6。你可以输入文本提示词，或上传图片作为起始帧。Lanta AI 并非 Kling 官方产品或服务。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Which Kling AI version is available on this page?", "The Lanta AI reference page stated at capture time: “The generator on this page is fixed to Kling 2.6 for text-to-video and image-to-video. Other Kling versions may be available as separate model options elsewhere on Lanta AI.” This project has not independently verified the service claims; generation is not connected here.", "本页提供哪个 Kling AI 版本？", "Lanta AI 参照页面在采集时称：“本页生成器的文生视频和图生视频均固定使用 Kling 2.6。其他 Kling 版本可能会作为 Lanta AI 中的独立模型选项提供。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("How does Kling AI motion control work?", "The Lanta AI reference page stated at capture time: “Describe camera direction and subject movement in your prompt with cues such as a pan, dolly push, orbit, or follow shot. The model interprets those instructions, but results can vary.” This project has not independently verified the service claims; generation is not connected here.", "Kling AI 运动控制如何工作？", "Lanta AI 参照页面在采集时称：“在提示词中用摇摄、推镜、环绕或跟拍等指令描述镜头方向和主体运动。模型会解释这些指令，但生成结果可能不同。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Do I need advanced skills to use the Kling AI video generator?", "The Lanta AI reference page stated at capture time: “No. Add a prompt, optionally upload a starting image, choose the available settings, review the displayed credit cost, and generate.” This project has not independently verified the service claims; generation is not connected here.", "使用 Kling AI 视频生成器需要专业技能吗？", "Lanta AI 参照页面在采集时称：“不需要。添加提示词，可选择上传起始图片，再选择可用设置、查看显示的积分消耗并开始生成。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Does Kling AI support automatic audio addition?", "The Lanta AI reference page stated at capture time: “Yes. The Kling 2.6 generator includes an optional audio setting. Enabling it increases the credit cost shown before generation.” This project has not independently verified the service claims; generation is not connected here.", "Kling AI 支持自动添加音频吗？", "Lanta AI 参照页面在采集时称：“支持。Kling 2.6 生成器提供可选的音频设置。开启后，生成前显示的积分消耗会增加。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("How are Kling 2.6 credits calculated?", "The Lanta AI reference page stated at capture time: “Credit cost depends on the selected clip length and whether generated audio is enabled. The generator displays the applicable total before you submit.” This project has not independently verified the service claims; generation is not connected here.", "Kling 2.6 的积分如何计算？", "Lanta AI 参照页面在采集时称：“积分消耗取决于所选片段时长以及是否开启生成音频。生成器会在提交前显示适用的总积分。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("What clip settings does this Kling 2.6 page provide?", "The Lanta AI reference page stated at capture time: “The current product configuration provides 5- and 10-second clips, common landscape and portrait aspect ratios, 720p output, and optional generated audio.” This project has not independently verified the service claims; generation is not connected here.", "这个 Kling 2.6 页面提供哪些视频设置？", "Lanta AI 参照页面在采集时称：“当前产品配置提供 5 秒和 10 秒片段、常用横屏与竖屏比例、720p 输出以及可选的生成音频。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("What is the best Kling AI alternative?", "The Lanta AI reference page stated at capture time: “Lanta AI also provides other video models, including Wan 2.2 and newer Kling options. Compare the model controls and displayed credit cost for your project.” This project has not independently verified the service claims; generation is not connected here.", "最好的 Kling AI 替代方案是什么？", "Lanta AI 参照页面在采集时称：“Lanta AI 还提供其他视频模型，包括 Wan 2.2 和较新的 Kling 选项。请根据项目需要比较模型设置和页面显示的积分消耗。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
    ],
  },
  "/ai-video-models/kling-3-0": {
    hero: t("Kling 3.0 is presented as an all-in-one workflow for visuals, audio, lip sync, and multi-shot video creation. The reference page describes image-to-video and text-to-video; its observed text mode falls back to the Kling 2.6 form model.", "Kling 3.0 被介绍为集成视觉、音频、口型同步和多镜头视频创作的一体化工作流。参照页介绍图生与文生视频；采集到的文生模式表单会回退到 Kling 2.6。"),
    faq: [
      faq("How is Kling 3.0 different from Kling 2.6?", "The Lanta AI reference page stated at capture time: “Kling 3.0 is a workflow upgrade, not just a visual upgrade. Compared with 2.6, it adds Multi-Shot, Element Reference, multi-character coreference, stronger native audio, multilingual dialogue, and up to 15-second generation.” This project has not independently verified the service claims; generation is not connected here.", "Kling 3.0 和 Kling 2.6 有什么区别？", "Lanta AI 参照页面在采集时称：“Kling 3.0 不是单纯的画质升级，而是一次工作流升级。相比 2.6，它新增了 Multi-Shot、Element Reference、多角色指代、更强的原生音频、多语言对白，以及最长 15 秒生成能力。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Kling 3.0 or Seedance 2.0 — which one is better for video quality?", "The Lanta AI reference page stated at capture time: “Use Kling 3.0 when you need controlled short scenes, reference consistency, and practical storyboard output. Test Seedance 2.0 when you need stronger multimodal references, performance control, lighting, shadow, and camera movement control.” This project has not independently verified the service claims; generation is not connected here.", "Kling 3.0 和 Seedance 2.0，哪个视频质量更好？", "Lanta AI 参照页面在采集时称：“如果你需要可控的短场景、参考一致性和实用分镜输出，优先用 Kling 3.0。如果你更看重多模态参考、表演控制、光影层次以及镜头运动控制，可以测试 Seedance 2.0。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Can Kling 3.0 create realistic AI videos without looking overly animated?", "The Lanta AI reference page stated at capture time: “Yes, but the prompt matters. Use restrained camera language, natural lighting, realistic body movement, and one clear action per shot. Avoid over-stylized words like \"epic,\" \"hyper-dramatic,\" or \"ultra cinematic\" unless that look is intentional.” This project has not independently verified the service claims; generation is not connected here.", "Kling 3.0 能做出不那么“动画感”的写实 AI 视频吗？", "Lanta AI 参照页面在采集时称：“可以，但提示词写法很关键。尽量使用克制的镜头语言、自然光、真实的人体动作，并让每个镜头只承载一个清晰动作。除非你就是想要那种风格，否则应避免使用“epic”“hyper-dramatic”“ultra cinematic”这类过度风格化词汇。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Does Kling 3.0 still struggle with hands, arms, and fast action?", "The Lanta AI reference page stated at capture time: “Sometimes. Hands, arms, fast movement, and object contact are still high-risk areas in AI video. For cleaner results, use shorter shots, clearer references, slower motion, and avoid packing too many physical actions into one clip.” This project has not independently verified the service claims; generation is not connected here.", "Kling 3.0 在手部、肢体和高速动作上还会出问题吗？", "Lanta AI 参照页面在采集时称：“会有这种情况。手部、手臂、高速运动和物体接触依然是 AI 视频里的高风险区域。想要更干净的结果，建议缩短镜头时长、提供更清晰的参考、放慢动作速度，并避免在一个片段里塞入太多复杂物理动作。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Single shot vs. multi-shot: when should I use each one in Kling 3.0?", "The Lanta AI reference page stated at capture time: “Use single-shot when the scene needs one clear visual beat, such as a product reveal, portrait, emotional close-up, or simple camera move. Use multi-shot when the idea needs coverage, such as dialogue, reaction cuts, story beats, ad sequences, or multiple angles in one scene.” This project has not independently verified the service claims; generation is not connected here.", "单镜头和多镜头，在 Kling 3.0 里分别适合什么场景？", "Lanta AI 参照页面在采集时称：“当场景只需要一个明确视觉重点时，比如产品揭示、人物肖像、情绪特写或简单运镜，适合用单镜头；当创意需要对白、反应切换、剧情节点、广告节奏或一场景多个机位时，更适合用多镜头。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("What is the best workflow for creating long videos with Kling 3.0?", "The Lanta AI reference page stated at capture time: “Do not prompt a full long video at once. Break the script into 5–15 second beats, keep the same character references, repeat the same visual rules, then edit the approved clips externally.” This project has not independently verified the service claims; generation is not connected here.", "用 Kling 3.0 生成长视频，最佳工作流是什么？", "Lanta AI 参照页面在采集时称：“不要一次性直接生成整支长视频。更稳妥的方法是把脚本拆成 5 到 15 秒的节拍段，保持相同角色参考，重复同样的视觉规则，再在外部把确认后的片段剪辑起来。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("How do I keep characters consistent across multiple Kling 3.0 clips?", "The Lanta AI reference page stated at capture time: “Use Element Reference, reuse the same source images, keep wardrobe and hairstyle unchanged, and keep camera distance, lighting, and style consistent. Kling 3.0 can lock key subjects more reliably through Element Reference.” This project has not independently verified the service claims; generation is not connected here.", "如何在多个 Kling 3.0 片段之间保持角色一致？", "Lanta AI 参照页面在采集时称：“使用 Element Reference，重复使用同一批源图，确保服装和发型不变，并让镜头距离、光线和风格保持一致。借助 Element Reference，Kling 3.0 对关键主体的锁定会更可靠。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Are reference images enough for character consistency in Kling 3.0?", "The Lanta AI reference page stated at capture time: “No. References help identity, but they do not solve everything. You still need consistent prompts, wardrobe, lighting, lens style, shot distance, and scene design.” This project has not independently verified the service claims; generation is not connected here.", "只靠参考图就足够保证 Kling 3.0 的角色一致性吗？", "Lanta AI 参照页面在采集时称：“不够。参考图只能帮助保留身份特征，但无法解决全部问题。你仍然需要在提示词、服装、光线、镜头风格、拍摄距离和场景设计上保持一致。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Can Kling 3.0 keep the same voice across multiple scenes?", "The Lanta AI reference page stated at capture time: “It can help through voice tone and character referencing, but for professional production, do not rely on one generation to remember voice identity across many clips. Lock the voice with a dedicated voice workflow when consistency matters.” This project has not independently verified the service claims; generation is not connected here.", "Kling 3.0 能在多个场景中保持同一个声音吗？", "Lanta AI 参照页面在采集时称：“它可以通过声线和角色参考提供一定帮助，但如果是专业制作，不建议指望一次生成在很多片段里持续记住同一个声音身份。只要声音一致性很重要，就应使用独立的声音工作流来锁定。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
    ],
  },
  "/ai-video-models/seedance-2-0": {
    hero: t("Seedance 2.0 is described for controllable video creation from text, images, video, and audio references, with a local page selector for Seedance 2.0 and Seedance 2.0 Fast.", "Seedance 2.0 被介绍为可通过文字、图片、视频和音频参考进行可控视频创作；本地页面选择器提供 Seedance 2.0 与 Seedance 2.0 Fast。"),
    faq: [
      faq("What is Seedance 2.0 best used for?", "The Lanta AI reference page stated at capture time: “Seedance 2.0 is best used for controllable AI video creation, including multi-shot story scenes, product ads, short-form videos, cinematic b-roll, audio-led clips, and reference-based video generation.” This project has not independently verified the service claims; generation is not connected here.", "Seedance 2.0 最适合用来做什么？", "Lanta AI 参照页面在采集时称：“Seedance 2.0 最适合用于可控型 AI 视频创作，包括多镜头剧情片段、产品广告、短视频、电影感 B-roll、以音频驱动的片段，以及基于参考素材的视频生成。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Seedance 2.0 Fast vs Pro: which one should I use?", "The Lanta AI reference page stated at capture time: “Use Fast for quick prompt testing and creative drafts. Use Pro when you need higher-quality final outputs, stronger motion, better reference control, or more polished audio-video results.” Pro is an external FAQ label; this page's selector lists Seedance 2.0 and Seedance 2.0 Fast, not a Pro option. This project has not independently verified the service claims; generation is not connected here.", "Seedance 2.0 Fast 和 Pro 应该怎么选？", "Lanta AI 参照页面在采集时称：“如果你只是想快速测试提示词、迭代创意草稿，可以用 Fast；如果你需要更高质量的最终成片、更强的动作表现、更好的参考控制或更完整的音视频效果，就应该用 Pro。”Pro 是外部 FAQ 中的称呼；本页选择器列出 Seedance 2.0 和 Seedance 2.0 Fast，没有 Pro 选项。本项目未独立验证上述服务主张，且未接入生成服务。"),
      faq("Kling 3.0 or Seedance 2.0 — which one is better for video quality?", "The Lanta AI reference page stated at capture time: “Kling 3.0 is often better for polished short-form visuals, while Seedance 2.0 is better when video quality depends on reference control, audio timing, camera direction, and structured scene planning.” This project has not independently verified the service claims; generation is not connected here.", "Kling 3.0 和 Seedance 2.0，哪个视频质量更好？", "Lanta AI 参照页面在采集时称：“Kling 3.0 往往更适合做打磨完成度很高的短视频视觉，而当视频质量更依赖参考控制、音频节奏、镜头方向和结构化场景规划时，Seedance 2.0 通常更有优势。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Seedance 2.0 vs Sora 2: which one is better for realistic videos?", "The Lanta AI reference page stated at capture time: “Sora 2 is usually stronger for pure realism. Seedance 2.0 is stronger when you need realism plus reference control, audio, and structured creative direction.” This project has not independently verified the service claims; generation is not connected here.", "Seedance 2.0 和 Sora 2，哪个更适合做真实感视频？", "Lanta AI 参照页面在采集时称：“Sora 2 通常在纯粹写实感上更强；而当你既需要真实感，又需要参考控制、音频能力和结构化创作指令时，Seedance 2.0 会更强。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Is Seedance 2.0 good for cinematic b-roll and short-form videos?", "The Lanta AI reference page stated at capture time: “Yes. Seedance 2.0 is well suited for cinematic b-roll, product close-ups, social hooks, music-driven clips, and short-form videos, especially when the scene has clear motion, camera direction, and sound mood.” This project has not independently verified the service claims; generation is not connected here.", "Seedance 2.0 适合做电影感 B-roll 和短视频吗？", "Lanta AI 参照页面在采集时称：“适合。Seedance 2.0 很适合生成电影感 B-roll、产品近景、社媒开场钩子、以音乐驱动的片段和短视频，尤其是在场景动作、镜头方向和声音氛围都比较明确的情况下。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Can Seedance 2.0 create consistent characters across multiple clips?", "The Lanta AI reference page stated at capture time: “Seedance 2.0 can improve character consistency across clips, but it works best with repeated high-quality reference images, stable character descriptions, and consistent lighting, clothing, framing, and style.” This project has not independently verified the service claims; generation is not connected here.", "Seedance 2.0 能在多个片段之间保持角色一致吗？", "Lanta AI 参照页面在采集时称：“Seedance 2.0 可以提升跨片段的人物一致性，但效果最好的前提是持续使用高质量参考图，并保持稳定的角色描述、光线、服装、构图和风格。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Are reference images enough for character consistency in Seedance 2.0?", "The Lanta AI reference page stated at capture time: “Reference images are usually enough for single clips, but multi-clip character consistency often needs a stronger workflow with repeated references, consistent prompts, similar framing, and sometimes video references.” This project has not independently verified the service claims; generation is not connected here.", "只靠参考图片就足够保证 Seedance 2.0 的角色一致性吗？", "Lanta AI 参照页面在采集时称：“对于单个片段，参考图片通常已经够用；但如果要实现多片段角色一致，往往还需要更严格的工作流，例如重复使用参考图、保持提示词一致、使用相近构图，有时还要加入视频参考。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("How do video references work in Seedance 2.0?", "The Lanta AI reference page stated at capture time: “Video references work best as guides for motion, pacing, camera movement, shot structure, or performance style, not as frame-by-frame editable source videos.” This project has not independently verified the service claims; generation is not connected here.", "Seedance 2.0 中的视频参考是怎么起作用的？", "Lanta AI 参照页面在采集时称：“视频参考最适合用来提供动作、节奏、镜头运动、镜头结构或表演风格的引导，而不是当作可以逐帧编辑的源视频。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Can Seedance 2.0 copy camera movement from a reference video?", "The Lanta AI reference page stated at capture time: “Seedance 2.0 can follow the camera language of a reference video, but it should be used to guide similar movement and pacing rather than copy the camera path frame by frame.” This project has not independently verified the service claims; generation is not connected here.", "Seedance 2.0 能复制参考视频里的镜头运动吗？", "Lanta AI 参照页面在采集时称：“Seedance 2.0 可以跟随参考视频里的镜头语言，但更适合作为“相似运动与节奏”的引导，而不是逐帧照搬原视频的摄影机路径。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Does Seedance 2.0 work better with static or moving camera shots?", "The Lanta AI reference page stated at capture time: “Static shots are safer, but controlled moving shots such as slow push-ins, tracking shots, and orbit shots show more of Seedance 2.0’s creative value. Fast or complex camera movement needs clearer direction and stronger references.” This project has not independently verified the service claims; generation is not connected here.", "Seedance 2.0 更适合静态镜头还是运动镜头？", "Lanta AI 参照页面在采集时称：“静态镜头通常更稳，但像慢速推近、跟拍和环绕这样的可控运动镜头，能更好地体现 Seedance 2.0 的创作价值。越快、越复杂的镜头运动，就越需要清晰的指令和更强的参考素材。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Can Seedance 2.0 generate lip sync and native audio?", "The Lanta AI reference page stated at capture time: “Yes. Seedance 2.0 can generate native audio with video, including lip-synced speech, background music, ambient sound, and sound effects, making it useful for talking characters, product ads, music videos, and audio-led short clips.” This project has not independently verified the service claims; generation is not connected here.", "Seedance 2.0 能生成口型同步和原生音频吗？", "Lanta AI 参照页面在采集时称：“可以。Seedance 2.0 能同时生成视频和原生音频，包括口型同步对白、背景音乐、环境音和音效，因此很适合对话角色、产品广告、音乐视频和以声音驱动的短片内容。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
    ],
  },
  "/ai-video-models/happy-horse-1-0": {
    hero: t("HappyHorse 1.0 is introduced as a multimodal video generation and editing model. This local page offers the observed 1.0 and 1.1 form selections; generation remains unavailable.", "HappyHorse 1.0 被介绍为多模态视频生成与编辑模型。本地页面提供采集到的 1.0 和 1.1 表单选项；生成仍不可用。"),
    faq: [
      faq("What is HappyHorse 1.0?", "The Lanta AI reference page stated at capture time: “HappyHorse 1.0 is Alibaba's multimodal AI video generation and editing model. It helps creators generate videos from text prompts, turn images into dynamic videos, create videos with multiple reference images, and edit existing video clips with AI. Its core features include Text-to-Video, Image-to-Video, Multi-Image Reference to Video, and Video Editing.” This project has not independently verified the service claims; generation is not connected here.", "什么是 HappyHorse 1.0？", "Lanta AI 参照页面在采集时称：“HappyHorse 1.0 是阿里巴巴推出的多模态 AI 视频生成与编辑模型。它可以根据文字生成视频、把图片做成动态视频、利用多张参考图生成视频，也能对现有视频进行 AI 编辑。它的核心能力包括文生视频、图生视频、多图参考视频生成和视频编辑。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Where can I safely use HappyHorse 1.0?", "The Lanta AI reference page stated at capture time: “You can try HappyHorse 1.0 on its official website, get API access from Alibaba Cloud Model Studio, or use it on supported partner platforms like Lanta AI.” This project has not independently verified the service claims; generation is not connected here.", "在哪里可以安全地使用 HappyHorse 1.0？", "Lanta AI 参照页面在采集时称：“你可以在其官网体验 HappyHorse 1.0，也可以通过阿里云 Model Studio 获取 API，或者在 Lanta AI 这类支持它的合作平台上使用。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("What video sizes does HappyHorse 1.0 support?", "The Lanta AI reference page stated at capture time: “HappyHorse 1.0 lets you create videos in popular aspect ratios such as 16:9, 9:16, 1:1, 4:3, and 3:4. Choose a horizontal format for YouTube, a vertical format for TikTok, Reels, and Shorts, or a square format for social feeds.” This project has not independently verified the service claims; generation is not connected here.", "HappyHorse 1.0 支持哪些视频尺寸？", "Lanta AI 参照页面在采集时称：“HappyHorse 1.0 支持 16:9、9:16、1:1、4:3、3:4 等常见画幅。你可以为 YouTube 选择横版，为 TikTok、Reels、Shorts 选择竖版，为社交信息流选择方形格式。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Is HappyHorse 1.0 actually better than Seedance, Kling, Veo, or Sora?", "The Lanta AI reference page stated at capture time: “HappyHorse 1.0 is one of the strongest AI video models for short-form video creation, especially if you care about cinematic visual quality, image-to-video generation, smooth camera movement, and reference-guided control. It is especially strong for creators who want polished short videos without a long post-production workflow.” This project has not independently verified the service claims; generation is not connected here.", "HappyHorse 1.0 真的比 Seedance、Kling、Veo 或 Sora 更好吗？", "Lanta AI 参照页面在采集时称：“HappyHorse 1.0 是当前短视频创作中非常强的一类 AI 视频模型，尤其适合重视电影感画质、图生视频、顺滑镜头运动和参考图控制能力的创作者。对于希望少做后期、直接生成更完整短片的人来说，它尤其有竞争力。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("How long can HappyHorse 1.0 videos be?", "The Lanta AI reference page stated at capture time: “HappyHorse 1.0 supports video durations from 3 to 15 seconds, making it best for short cinematic clips, social posts, and quick creative previews.” This project has not independently verified the service claims; generation is not connected here.", "HappyHorse 1.0 可以生成多长的视频？", "Lanta AI 参照页面在采集时称：“HappyHorse 1.0 支持 3 到 15 秒的视频时长，非常适合电影感短片、社交媒体内容和快速创意预览。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Does HappyHorse 1.0 support synced audio and lip sync?", "The Lanta AI reference page stated at capture time: “Yes, but it may not be perfect in every scene. HappyHorse 1.0 supports synced native audio and multilingual lip sync, but close-up dialogue or precise speaking scenes may still need post-editing, timing adjustments, or subtitles.” This project has not independently verified the service claims; generation is not connected here.", "HappyHorse 1.0 支持同步音频和口型吗？", "Lanta AI 参照页面在采集时称：“支持，但并非每个场景都能完美呈现。HappyHorse 1.0 支持原生同步音频和多语言口型，但在近景对白或要求精确说话节奏的场景里，仍可能需要后期微调、节奏校正或字幕辅助。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Does HappyHorse 1.0 generate real 1080P videos?", "The Lanta AI reference page stated at capture time: “Yes. HappyHorse 1.0 supports selectable 720P and 1080P video output. In 1080P, faces, product textures, lighting, shadows, smoke, mist, dust, and reflections can look clearer and more defined, giving the final video a sharper, more production-ready feel.” This project has not independently verified the service claims; generation is not connected here.", "HappyHorse 1.0 生成的是真正的 1080P 视频吗？", "Lanta AI 参照页面在采集时称：“是的。HappyHorse 1.0 支持 720P 和 1080P 可选输出。在 1080P 下，人脸、产品纹理、光线、阴影、烟雾、薄雾、灰尘和反射等细节会更清晰，整体成片也更接近可直接使用的制作质量。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("How natural is the motion in HappyHorse 1.0 videos?", "The Lanta AI reference page stated at capture time: “HappyHorse 1.0 can create smooth camera movement, natural transitions, and cinematic motion that feels more like a real short video. It is especially strong at following camera directions such as zooming in, pushing forward, shifting depth of field, or moving from a wide shot to a closer view. For best results, use clear prompts that describe action, camera movement, mood, and lighting.” This project has not independently verified the service claims; generation is not connected here.", "HappyHorse 1.0 的运动表现自然吗？", "Lanta AI 参照页面在采集时称：“HappyHorse 1.0 可以生成顺滑的镜头运动、自然的转场和更接近真实短片的电影化动态。它尤其擅长执行推近、前移、景深变化、从远景推进到近景等镜头指令。想得到更好的结果，建议在提示词中明确写出动作、镜头、情绪和光线。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Can I use HappyHorse 1.0 videos commercially?", "The Lanta AI reference page stated at capture time: “Yes, but make sure any images, logos, characters, products, or reference materials you upload are cleared for commercial use before using the video in ads, client work, product pages, or paid social content.” This project has not independently verified the service claims; generation is not connected here.", "我可以将 HappyHorse 1.0 生成的视频用于商业用途吗？", "Lanta AI 参照页面在采集时称：“可以，但请确保你上传的图片、Logo、角色、产品素材或参考资料本身已经具备商业使用授权，再将生成视频用于广告、客户项目、产品页或付费社媒投放。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
      faq("Can HappyHorse 1.0 keep people, products, and props consistent from reference images?", "The Lanta AI reference page stated at capture time: “Yes. HappyHorse 1.0 can use reference images to guide the people, products, props, scenes, and visual style in your video. With clear prompts, it can faithfully preserve those reference elements in the final video.” This project has not independently verified the service claims; generation is not connected here.", "HappyHorse 1.0 能否保持参考图中的人物、产品和道具一致？", "Lanta AI 参照页面在采集时称：“可以。HappyHorse 1.0 能利用参考图片来约束视频中的人物、产品、道具、场景和整体风格。只要提示词足够清晰，它通常可以较好地保留这些参考元素。”上述服务主张未经本项目独立验证，本项目未接入生成服务。"),
    ],
  },
};

const coreVideoModelPages = Object.fromEntries(coreVideoModelPaths.map((path) => {
  const metadata = generatorPages[path];
  return [path, {
    ...pathDetails[path],
    path,
    title: metadata.title,
    canonical: path,
    ...pageCopy[path],
    hero: pageCopy[path].hero,
    bodySections: referenceBodySections[path],
  } satisfies VideoModelPage];
})) as unknown as Record<CoreVideoModelPath, VideoModelPage>;
export const videoModelPages: Record<VideoModelPath, VideoModelPage> = {...coreVideoModelPages, ...additionalVideoModelPages};

const queryKeys = ["model", "mode", "tab", "duration", "resolution", "ratio", "sound", "multishot"] as const;
const modeFromQuery = (query: URLSearchParams): GeneratorMode => {
  const mode = query.get("mode");
  if (mode === "image-to-video") return "image";
  if (mode === "text-to-video") return "text";
  return query.get("tab") === "text" ? "text" : "image";
};
function identity(id: string | null) {
  if (!id) return null;
  return generatorModels.find((model) => model.id === id || model.referenceId === id) ?? null;
}
function defaultForMode(path: VideoModelPath, mode: GeneratorMode) {
  if (isAdditionalVideoModelPath(path)) return additionalDefaultModel(path, mode);
  if (path === "/ai-video-models/kling-3-0" && mode === "text") return "kling-2-6";
  return pathDetails[path].defaultModel;
}
function gated(path: VideoModelPath, model: string, mode: GeneratorMode, duration: number) {
  if (isAdditionalVideoModelPath(path)) return path === "/ai-video-models/sora-2" && model === "" && duration === 15 || path === "/ai-video-models/veo-3" && model === "veo-3-1-fast" && duration === 8 || path === "/ai-video-models/vheer" && mode === "image" && model === "lanta-2-1" && duration === 8;
  if ((path === "/ai-video-models/kling-ai" || path === "/ai-video-models/kling-3-0") && model === "kling-2-6" && [5, 10].includes(duration)) return true;
  return path === "/ai-video-models/kling-3-0" && model === "kling-3-0" && mode === "image" && [5, 10, 15].includes(duration);
}
function normalized(path: VideoModelPath, modelId: string, mode: GeneratorMode, parameters: GeneratorParameters) {
  if (path === "/ai-video-models/sora-2" && modelId === "") return normalizeUnselectedParameters(mode, parameters);
  const model = generatorModel(modelId);
  if (!model?.modes[mode]) return {};
  const next = normalizeParameters(model, mode, parameters);
  if (!isAdditionalVideoModelPath(path) && gated(path, model.id, mode, next.duration ?? 0)) next.duration = model.modes[mode]?.durations?.[0];
  return next;
}

export function initializeVideoModel(path: VideoModelPath, rawQuery: string): GeneratorState {
  const query = new URLSearchParams(rawQuery.split("#")[0]);
  const mode = modeFromQuery(query);
  const requested = identity(query.get("model"));
  const issues: string[] = [];
  if (query.get("mode") && !["image-to-video", "text-to-video"].includes(query.get("mode")!)) issues.push("unknown-mode");
  if (query.get("mode") && query.get("tab") && (mode === "image") !== (query.get("tab") === "image")) issues.push("mode-tab-conflict");
  if (query.has("model") && !requested) issues.push("unknown-model");
  let modelId: string = defaultForMode(path, mode);
  if (requested?.kind === "video" && requested.modes[mode] && selectableVideoModels(path, mode).includes(requested.id)) modelId = requested.id;
  else if (requested) {
    issues.push("unsupported-model-mode");
    if (requested.id !== modelId) issues.push("path-model-conflict");
  }
  if (requested && requested.id !== modelId && requested.modes[mode]) issues.push("path-model-conflict");

  const config = videoModelConfig({path, model:modelId, mode});
  // Mind图SSR与核定text首次合同仅用于初始化，后续用户合法编辑不回放。
  const parameters: GeneratorParameters = path === "/ai-video-models/mindvideo-ai" && modelId === "wan-3-0" ? {duration:5, ratio:"1:1", resolution:"480P", sound:true} : {};
  for (const key of ["duration", "resolution", "ratio", "sound", "multishot"] as const) {
    const raw = query.get(key);
    if (raw === null) continue;
    if (key === "duration") {
      if (!/^(0|[1-9]\d*)$/.test(raw) || !Number.isSafeInteger(Number(raw))) { issues.push("invalid-parameter:duration"); continue; }
      const value = Number(raw);
      if (!config?.durations?.includes(value) && !(config?.durationRange && value >= config.durationRange[0] && value <= config.durationRange[1])) { issues.push("unsupported-parameter:duration"); continue; }
      if (gated(path, modelId, mode, value)) { issues.push("gated-parameter:duration"); continue; }
      parameters.duration = value;
    } else if (key === "sound" || key === "multishot") {
      if (raw !== "true" && raw !== "false") { issues.push(`invalid-parameter:${key}`); continue; }
      if (!config?.[key]) { issues.push(`unsupported-parameter:${key}`); continue; }
      parameters[key] = raw === "true";
    } else {
      const allowed = key === "ratio" ? config?.ratios : config?.resolutions;
      if (!allowed?.includes(raw)) { issues.push(`unsupported-parameter:${key}`); continue; }
      parameters[key] = raw;
    }
  }
  const defaults = normalized(path, modelId, mode, parameters);
  return {
    path: path as GeneratorPath,
    mode,
    model: modelId,
    prompt: "",
    parameters: defaults,
    issues: [...new Set(issues)],
  };
}

export function normalizeVideoModelState(state: GeneratorState): GeneratorState {
  if (!isVideoModelPath(state.path)) return state;
  const current = generatorModel(state.model);
  const empty = state.path === "/ai-video-models/sora-2" && state.model === "";
  const modelId = empty ? "" : selectableVideoModels(state.path, state.mode).includes(state.model) && current?.modes[state.mode] ? state.model : defaultForMode(state.path, state.mode);
  return { ...state, model: modelId, parameters: normalized(state.path, modelId, state.mode, state.parameters) };
}

export function changeVideoModelMode(state: GeneratorState, mode: GeneratorMode): GeneratorState {
  if (!isVideoModelPath(state.path) || mode === state.mode) return state;
  const model = generatorModel(state.model);
  const modelId = model?.modes[mode] ? model.id : defaultForMode(state.path, mode);
  const next = normalizeVideoModelState({ ...state, mode, model: modelId });
  return { ...next, issues: state.issues.filter((issue) => !["unsupported-mode", "unsupported-model-mode", "path-model-conflict", "unknown-mode", "mode-tab-conflict", "model-fallback"].includes(issue)).concat(next.model !== state.model ? ["model-fallback"] : []) };
}

export function changeVideoModelSelection(state: GeneratorState, modelId: string): GeneratorState {
  if (!isVideoModelPath(state.path)) return state;
  if (state.path === "/ai-video-models/sora-2" && modelId === "") return normalizeVideoModelState({...state, model:"", issues:state.issues.filter(issue => !["unsupported-model-mode","unsupported-mode","unknown-model","path-model-conflict","model-fallback"].includes(issue))});
  const model = generatorModel(modelId);
  if (!model?.modes[state.mode] || !selectableVideoModels(state.path, state.mode).includes(modelId)) return { ...state, issues: [...new Set([...state.issues, "unsupported-model-mode"])] };
  return normalizeVideoModelState({ ...state, model: model.id, issues: state.issues.filter((issue) => !["unsupported-model-mode", "unsupported-mode", "unknown-model", "path-model-conflict", "model-fallback"].includes(issue)) });
}

export function videoModelDurationGated(state: Pick<GeneratorState, "path" | "model" | "mode">, duration: number) {
  return isVideoModelPath(state.path) && gated(state.path, state.model, state.mode, duration);
}

export function selectableVideoModels(path: VideoModelPath, mode: GeneratorMode): string[] {
  if (isAdditionalVideoModelPath(path)) return additionalSelectableModels[mode].filter(id => Boolean(generatorModel(id)?.modes[mode]));
  const ids: Record<CoreVideoModelPath, string[]> = {
    "/ai-video-models/kling-ai": mode === "image" ? ["kling-2-6", "lanta-2-1", "wan-3-0", "wan-2-2-spicy", "kling-4-0", "grok-imagine-video-1-5", "seedance-2-0", "minimax-h3"] : ["kling-2-6"],
    "/ai-video-models/kling-3-0": mode === "image" ? ["kling-3-0", "kling-2-6", "lanta-2-1", "wan-3-0", "wan-2-2-spicy", "kling-4-0"] : ["kling-2-6"],
    "/ai-video-models/seedance-2-0": mode === "image" ? ["seedance-2-0", "seedance-2-0-fast", "lanta-2-1", "wan-3-0", "wan-2-2-spicy", "kling-4-0", "grok-imagine-video-1-5", "minimax-h3"] : ["seedance-2-0", "seedance-2-0-fast"],
    "/ai-video-models/happy-horse-1-0": ["happy-horse-1-0", "happy-horse-1-1"],
  };
  return ids[path].filter((id) => Boolean(generatorModel(id)?.modes[mode]));
}

export function restoreVideoModel(path: VideoModelPath, mode: GeneratorMode): string {
  return defaultForMode(path, mode);
}

// 显式恢复是用户操作；仅Mind核定默认同时恢复四个相关字段，不重放URL。
export function restoreVideoModelState(state: GeneratorState): GeneratorState {
  if (!isVideoModelPath(state.path)) return state;
  const restored=changeVideoModelSelection(state,restoreVideoModel(state.path,state.mode));
  if(state.path !== "/ai-video-models/mindvideo-ai") return restored;
  return {...restored,parameters:{duration:5,ratio:"1:1",resolution:"480P",sound:true},issues:restored.issues.filter(issue=>!["duration","ratio","resolution","sound"].some(field=>issue.endsWith(`:${field}`)))};
}

export function videoModelSelectionKey(path: VideoModelPath, rawQuery: string) {
  const query = new URLSearchParams(rawQuery.split("#")[0]);
  return JSON.stringify([generatorSelectionKey(path, rawQuery), ...queryKeys.map((key) => query.get(key))]);
}


const videoParameterFields = ["duration", "resolution", "ratio", "sound", "multishot"] as const;
type VideoParameterField = typeof videoParameterFields[number];
export type VideoModelIssueDescription = {
  code: string;
  field?: VideoParameterField;
  availability?: "unavailable" | "gated" | "available";
};

// 只投影原URL拒绝事实与当前能力；不重新初始化、应用URL值或写入会话。
export function describeVideoModelIssues(state: GeneratorState, rawQuery: string): VideoModelIssueDescription[] {
  const query = new URLSearchParams(rawQuery.split("#")[0]);
  const config = videoModelConfig(state);
  const result: VideoModelIssueDescription[] = [];
  for (const code of new Set(state.issues)) {
    if (code === "path-model-conflict" && state.issues.includes("unsupported-model-mode")) continue;
    const field = videoParameterFields.find((key) => code.endsWith(`:${key}`));
    if (!field) { result.push({ code }); continue; }
    const raw = query.get(field);
    let available = false;
    let gatedNow = false;
    if (raw !== null && config) {
      if (field === "duration") {
        const duration = Number(raw);
        available = /^(0|[1-9]\d*)$/.test(raw) && Number.isSafeInteger(duration) && (!!config.durations?.includes(duration) || !!config.durationRange && duration >= config.durationRange[0] && duration <= config.durationRange[1]);
        gatedNow = available && videoModelDurationGated(state, duration);
      } else if (field === "sound" || field === "multishot") available = !!config[field] && (raw === "true" || raw === "false");
      else available = (field === "ratio" ? config.ratios : config.resolutions).includes(raw);
    }
    result.push({ code, field, availability: gatedNow ? "gated" : available ? "available" : "unavailable" });
  }
  return result;
}

// 空选只在Sora本批边界表达；共享registry和session仍保原形状。
export function videoModelConfig(state: Pick<GeneratorState, "path" | "model" | "mode">): GeneratorConfig | undefined {
  if (state.path === "/ai-video-models/sora-2" && state.model === "") return {promptLimit:1000, ratios:state.mode === "text" ? ["9:16", "16:9"] : [], resolutions:[], durations:[10,15], ...(state.mode === "image" ? {reference:{max:1, accept:"image/*", maxBytes:10*1024*1024, localByteLimit:true}} : {})};
  return generatorConfig(state);
}
function normalizeUnselectedParameters(mode: GeneratorMode, old: GeneratorParameters): GeneratorParameters {
  return {duration:10, ...(mode === "text" ? {ratio:["9:16","16:9"].includes(old.ratio ?? "") ? old.ratio : "9:16"} : {})};
}
