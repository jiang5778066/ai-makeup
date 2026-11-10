import type { Locale } from "./i18n";
export const homepageFaqs: Record<Locale, { question: string; answer: string }[]> = {
  "zh-CN": [
    { question: "什么是 Makeup AI 创作平台？", answer: "这是图片、视频与美妆创作工具的展示入口。美妆和本地实时试妆已提供；通用图片、视频及模型入口尚未开放生成。展示媒体来自公开参照，并非本项目用户作品。" },
    { question: "如何开始创作？", answer: "选择图片、视频或美妆入口。已开放的美妆工具支持上传自拍、选择风格并登录生成；其他入口会说明对应工具及当前不可用状态。" },
    { question: "如何从图片创建 AI 视频？", answer: "图生视频入口已可浏览，但通用视频生成尚未接通。当前不会提交视频任务，也不会消耗额度。" },
    { question: "如何写出更好的 AI 视频文本提示词？", answer: "可按镜头类型、主体、动作、场景、风格、镜头运动和节奏描述你的想法。首页公开示例用于展示创作方向，不代表本项目当前已支持相关能力。" },
    { question: "Makeup AI 可以免费使用吗？", answer: "本地实时试妆免费。新账户获得 3 次免费高清或全脸美妆结果，之后可按现有价格购买额度；通用图片与视频尚未开放生成。" },
    { question: "生成一个 AI 视频需要多长时间？", answer: "本项目尚未接通视频生成，因此没有可承诺的生成时间。请以工具页面公布的实际可用状态为准。" },
    { question: "我可以商用展示的视频吗？", answer: "首页媒体是公开参照展示，不授予素材的商用许可。使用任何人物、图片、音频、品牌或角色前，请确认你拥有所需权利。" },
    { question: "上传内容和生成结果如何处理？", answer: "实时试妆预览在设备本地运行。美妆高清及全脸生成仅在你确认后上传；登录草稿和原任务续查不会自动重新生成或扣费。详情见隐私政策。" }
  ],
  en: [
    { question: "What is the Makeup AI creative platform?", answer: "Explore image, video and makeup creation tools. Makeup and local live try-on are available; general image, video and model generation are not connected yet. Media shown here are public reference examples, not our users' creations." },
    { question: "How do I start creating?", answer: "Choose an image, video or makeup tool. Available makeup tools let you upload a selfie, choose a style and sign in to generate. Other destinations show their identity and unavailable status." },
    { question: "How can I create a video from an image?", answer: "The image-to-video destination is available to browse, but video generation is not connected. It does not submit tasks or spend credits." },
    { question: "How do I write a better video prompt?", answer: "Describe framing, subject, action, setting, style, camera motion and pacing. Public examples illustrate creative ideas; they do not imply these capabilities are available here." },
    { question: "Is Makeup AI free to use?", answer: "Local live try-on is free. New accounts receive 3 free HD or full-face makeup results, followed by the existing credit packs. General image and video generation are not available yet." },
    { question: "How long does video generation take?", answer: "Video generation is not connected here, so there is no promised generation time. Check the tool's actual availability." },
    { question: "Can I use the showcase videos commercially?", answer: "These are public reference examples and do not grant commercial rights. Ensure you have permission for any people, images, audio, brands and characters you use." },
    { question: "How are uploads and results handled?", answer: "Live try-on previews run locally on your device. HD and full-face makeup upload only after confirmation. Restoring drafts and checking an existing task do not automatically generate again or spend credits. See the privacy policy." }
  ]
};
