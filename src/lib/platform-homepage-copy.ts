import type { Locale } from "./i18n";
export const homepageFaqs: Record<Locale, { question: string; answer: string }[]> = {
  en: [
    { question: "What can I do on PictoWink?", answer: "Browse image and video tools, read about their settings, and preview local files where supported. Generation is not open yet. The examples are reference media, not results made by PictoWink users." },
    { question: "Where should I start?", answer: "Choose an image tool for a still picture or a video tool for a moving shot. Start with a short description of the subject and what you want to happen. Each tool shows its current availability." },
    { question: "Can I turn a photo into a video?", answer: "You can explore image-to-video settings in the video generator. Video generation is not open yet, so this does not create or submit a video task." },
    { question: "What should I put in a video prompt?", answer: "Say what is in the frame, what moves, and how the camera moves. For example: a person standing still while the camera slowly moves closer. This is a writing example, not a tested PictoWink result." },
    { question: "Is PictoWink free to use?", answer: "You can browse the site and preview supported local files without buying credits. Generation and checkout are not open yet. Existing account credits do not mean every listed tool is available." },
    { question: "How long does generation take?", answer: "There is no reliable timing estimate while generation is closed. We will show the actual service limits when a tool becomes available." },
    { question: "Can I use the examples commercially?", answer: "Viewing or downloading an example does not give you commercial rights. Check the rights for the original media, including any people, brands, music, or characters shown." },
    { question: "Does selecting a file upload it?", answer: "A local preview does not submit a generation task. Check the tool's upload notice before confirming any operation. The privacy policy explains how uploads and account data are handled." }
  ],
  "zh-CN": [
    { question: "PictoWink 可以做什么？", answer: "浏览图片与视频工具，了解参数，并在支持的页面预览本地文件。生成尚未开放。展示素材是参考资料，不是本站用户的生成作品。" },
    { question: "从哪里开始？", answer: "想做静态画面就选图片工具，想表现动作就选视频工具。先用一句话描述主体和动作，再查看工具的实际开放状态。" },
    { question: "可以把照片变成视频吗？", answer: "可以在视频生成器里了解图生视频设置。视频生成尚未开放，目前不会创建或提交视频任务。" },
    { question: "视频提示词怎么写？", answer: "写清画面里有什么、什么在动、镜头怎么动。例如：人物站在原地，镜头缓慢拉近。这是写作示例，不是经过本站生成验证的效果。" },
    { question: "PictoWink 可以免费使用吗？", answer: "浏览网站和预览支持的本地文件不需要购买额度。生成和购买尚未开放；账户已有额度不代表所有工具都已可用。" },
    { question: "生成需要多久？", answer: "生成关闭期间没有可靠的耗时估计。工具开放后会说明实际服务限制。" },
    { question: "展示素材可以商用吗？", answer: "浏览或下载素材不等于获得商用许可。请核对原素材的权利，尤其是人物、品牌、音乐和角色。" },
    { question: "选择文件会上传吗？", answer: "本地预览不会提交生成任务。确认操作前请查看工具的上传说明；上传内容和账户数据的处理方式见隐私政策。" }
  ]
};
