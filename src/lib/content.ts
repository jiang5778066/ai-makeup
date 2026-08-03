import type { Locale } from "./i18n";

export type LandingSlug =
  | "home"
  | "ai-makeup"
  | "ai-makeup/generator"
  | "ai-makeup/filter"
  | "virtual-makeup-try-on"
  | "what-makeup-suits-my-face-ai"
  | "ai-foundation-makeup"
  | "ai-lipstick-try-on"
  | "ai-eye-makeup"
  | "ai-blush-makeup"
  | "ai-eyeshadow"
  | "ai-eyeliner"
  | "ai-mascara"
  | "ai-eyebrow"
  | "ai-contour-makeup"
  | "ai-highlighter-makeup"
  | "ai-bridal-makeup"
  | "pricing";

export type MakeupStyle = {
  id: string;
  name: string;
  description: string;
  mood: string;
};

export type LandingPage = {
  slug: LandingSlug;
  title: string;
  eyebrow: string;
  h1: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  sections: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const landingSlugs: LandingSlug[] = [
  "home",
  "ai-makeup",
  "ai-makeup/generator",
  "ai-makeup/filter",
  "virtual-makeup-try-on",
  "what-makeup-suits-my-face-ai",
  "ai-foundation-makeup",
  "ai-lipstick-try-on",
  "ai-eye-makeup",
  "ai-blush-makeup",
  "ai-eyeshadow",
  "ai-eyeliner",
  "ai-mascara",
  "ai-eyebrow",
  "ai-contour-makeup",
  "ai-highlighter-makeup",
  "ai-bridal-makeup",
  "pricing"
];

const sharedEnglishFaqs = [
  {
    question: "Can I use the AI makeup generator for free?",
    answer:
      "Yes. Live virtual try-on is free in the browser. Sign in to receive 3 credits for HD results; after that, 100 credits cost $8."
  },
  {
    question: "What photos work best?",
    answer:
      "Use a clear front-facing selfie with natural light, visible eyes, and minimal blur for the most accurate virtual try-on."
  },
  {
    question: "Is my uploaded photo private?",
    answer:
      "Uploads are used to generate your selected makeup result and can be configured to expire automatically after processing."
  }
];

const sharedChineseFaqs = [
  {
    question: "AI 妆容生成器可以免费使用吗？",
    answer: "可以。浏览器内实时试妆免费；登录后可获得 3 credits 用于高清结果，之后 $8 可购买 100 credits。"
  },
  {
    question: "什么样的照片效果最好？",
    answer: "建议上传清晰正脸自拍，光线自然、眼睛可见、画面不模糊，这样虚拟试妆结果更稳定。"
  },
  {
    question: "上传的照片安全吗？",
    answer: "照片仅用于生成你选择的妆容结果，并可配置为处理完成后自动过期删除。"
  }
];

const englishPages: Record<LandingSlug, LandingPage> = {
  home: {
    slug: "home",
    title: "AI Makeup Studio",
    eyebrow: "AI beauty tools for creators and shoppers",
    h1: "Try makeup ideas before they touch your face",
    description:
      "Generate 12 full-face AI makeup styles, preview nine live makeup effects, and compare finished looks in one workspace.",
    primaryCta: "Try AI makeup free",
    secondaryCta: "View pricing",
    seoTitle: "AI Makeup Studio | Generator and Virtual Makeup Try-On",
    seoDescription:
      "Try AI makeup online with 12 full-face styles and nine live virtual effects. Sign up for 3 free HD results, then pay once for more credits.",
    keywords: ["ai makeup", "virtual makeup try on", "ai beauty tools"],
    sections: ["12 full-face AI styles", "Nine-part virtual try-on", "Creation history and downloads"],
    faqs: sharedEnglishFaqs
  },
  "ai-makeup": {
    slug: "ai-makeup",
    title: "AI Makeup Generator",
    eyebrow: "AI makeup online free",
    h1: "AI Makeup Generator Online",
    description:
      "Upload a selfie, choose a style, and preview realistic makeup in seconds with before-and-after comparison and face-fit notes.",
    primaryCta: "Upload selfie",
    secondaryCta: "See styles",
    seoTitle: "AI Makeup Generator Online Free | Virtual Makeup Try-On",
    seoDescription:
      "Use an AI makeup generator online to try natural, glam, bridal, Douyin, K-beauty, lipstick, foundation, and eye makeup styles.",
    keywords: ["ai makeup", "ai makeup online free", "makeup ai", "ai makeup generator"],
    sections: ["Upload and generate", "Before and after preview", "Face-fit makeup advice"],
    faqs: [
      {
        question: "What is an AI makeup generator?",
        answer:
          "It is an online tool that applies makeup styles to your selfie with AI so you can preview looks before trying them in real life."
      },
      ...sharedEnglishFaqs
    ]
  },
  "ai-makeup/generator": {
    slug: "ai-makeup/generator",
    title: "AI Makeup Generator",
    eyebrow: "Full-face style generation",
    h1: "Generate complete makeup looks from one selfie",
    description:
      "Create natural, soft glam, wedding, editorial, and creator-ready looks with adjustable intensity and downloadable results.",
    primaryCta: "Generate a look",
    secondaryCta: "Compare plans",
    seoTitle: "AI Makeup Generator | Create Full-Face Makeup Looks",
    seoDescription:
      "Generate full-face AI makeup looks from a selfie with adjustable style intensity, before-and-after previews, and downloadable results.",
    keywords: ["ai makeup generator", "makeup ai generator", "full face makeup ai"],
    sections: ["Style presets", "Intensity control", "HD downloads"],
    faqs: sharedEnglishFaqs
  },
  "ai-makeup/filter": {
    slug: "ai-makeup/filter",
    title: "AI Makeup Filter",
    eyebrow: "Fast beauty filters",
    h1: "Apply an AI makeup filter in seconds",
    description:
      "Use lightweight makeup filters for quick previews, social posts, profile photos, and creative edits.",
    primaryCta: "Try a filter",
    secondaryCta: "Open studio",
    seoTitle: "AI Makeup Filter Online | Try Beauty Filters Free",
    seoDescription:
      "Apply AI makeup filters online for quick beauty previews, social edits, and before-and-after makeup comparisons.",
    keywords: ["ai makeup filter", "makeup filter", "beauty filter ai"],
    sections: ["Quick filters", "Social-ready exports", "One-click variations"],
    faqs: sharedEnglishFaqs
  },
  "virtual-makeup-try-on": {
    slug: "virtual-makeup-try-on",
    title: "Virtual Makeup Try-On",
    eyebrow: "Lipstick, foundation, eyes, blush",
    h1: "Virtual makeup try-on for every detail",
    description:
      "Preview lipstick, foundation, blush, eye makeup, brows, contour, and highlight from a single clean interface.",
    primaryCta: "Start try-on",
    secondaryCta: "Explore parts",
    seoTitle: "Virtual Makeup Try-On | AI Lipstick, Foundation and Eye Makeup",
    seoDescription:
      "Try lipstick, foundation, blush, eye makeup, brows, contour, and highlight online with AI virtual makeup try-on.",
    keywords: ["virtual makeup try on", "ai lipstick try on", "foundation try on"],
    sections: ["Part-by-part controls", "Shade comparison", "Beauty ecommerce ready"],
    faqs: sharedEnglishFaqs
  },
  "what-makeup-suits-my-face-ai": {
    slug: "what-makeup-suits-my-face-ai",
    title: "What Makeup Suits My Face AI",
    eyebrow: "Compare makeup styles on your face",
    h1: "Find what makeup suits your face with AI",
    description:
      "Apply and compare multiple looks on your own selfie to judge which colors, intensity, and occasion fit you best.",
    primaryCta: "Compare looks on my face",
    secondaryCta: "Read examples",
    seoTitle: "What Makeup Suits My Face AI | Compare Makeup Looks",
    seoDescription:
      "Compare AI makeup styles on your own selfie to see which colors, intensity, and occasion fit your features best.",
    keywords: ["what makeup suits my face ai", "makeup advisor ai", "face makeup analysis"],
    sections: ["Side-by-side style comparison", "Occasion ideas", "Feature balance tips"],
    faqs: sharedEnglishFaqs
  },
  "ai-foundation-makeup": {
    slug: "ai-foundation-makeup",
    title: "AI Foundation Makeup",
    eyebrow: "Base and complexion preview",
    h1: "Preview foundation finishes with AI",
    description:
      "Compare matte, satin, radiant, and soft-focus foundation finishes before choosing your base look.",
    primaryCta: "Try foundation",
    secondaryCta: "Open full studio",
    seoTitle: "AI Foundation Makeup | Preview Foundation Looks Online",
    seoDescription:
      "Use AI foundation makeup preview to compare base finishes and complexion styles online before trying a new look.",
    keywords: ["ai foundation makeup", "foundation makeup ai", "foundation try on"],
    sections: ["Finish previews", "Tone-aware notes", "Natural base options"],
    faqs: sharedEnglishFaqs
  },
  "ai-lipstick-try-on": {
    slug: "ai-lipstick-try-on",
    title: "AI Lipstick Try-On",
    eyebrow: "Shade previews",
    h1: "Try lipstick shades online with AI",
    description:
      "Preview nude, berry, red, coral, glossy, and matte lipstick looks on your own selfie.",
    primaryCta: "Try lipstick",
    secondaryCta: "Compare shades",
    seoTitle: "AI Lipstick Try-On | Try Lipstick Shades Online",
    seoDescription:
      "Try lipstick shades online with AI and compare nude, berry, red, coral, gloss, and matte looks on your selfie.",
    keywords: ["ai lipstick try on", "lipstick try on", "virtual lipstick"],
    sections: ["Shade comparison", "Finish control", "Downloadable previews"],
    faqs: sharedEnglishFaqs
  },
  "ai-eye-makeup": {
    slug: "ai-eye-makeup",
    title: "AI Eye Makeup",
    eyebrow: "Eyeshadow, liner, lashes",
    h1: "Try eye makeup styles with AI",
    description:
      "Generate soft shadow, winged liner, smoky eyes, lashes, brows, and editorial eye looks.",
    primaryCta: "Try eye makeup",
    secondaryCta: "See looks",
    seoTitle: "AI Eye Makeup | Try Eyeshadow, Eyeliner and Lashes",
    seoDescription:
      "Use AI eye makeup to preview eyeshadow, eyeliner, lashes, brows, smoky eyes, and editorial eye looks.",
    keywords: ["ai eye makeup", "eyeshadow ai", "eyeliner try on"],
    sections: ["Eye presets", "Feature emphasis", "Creator-ready looks"],
    faqs: sharedEnglishFaqs
  },
  "ai-blush-makeup": {
    slug: "ai-blush-makeup",
    title: "AI Blush Try-On",
    eyebrow: "Live cheek color preview",
    h1: "Try blush colors and placement online",
    description: "Place rose, peach, plum, or sun-kissed blush on your own face, adjust the strength live, and combine it with the rest of your look.",
    primaryCta: "Try blush live",
    secondaryCta: "View pricing",
    seoTitle: "AI Blush Try-On | Preview Blush Colors Online",
    seoDescription: "Try blush online with live face tracking. Compare rose, peach, plum, and sun-kissed cheek color before saving an HD result.",
    keywords: ["ai blush try on", "virtual blush", "blush filter online"],
    sections: ["Choose a cheek color", "Adjust placement strength", "Combine a complete look"],
    faqs: [
      { question: "Where should blush sit on my face?", answer: "The live preview follows your cheek area. Use a lower intensity first, then increase it until the color still looks balanced with your features." },
      { question: "Can I combine blush with lipstick and contour?", answer: "Yes. Keep multiple parts enabled in the same live counter and create one combined HD result." },
      ...sharedEnglishFaqs
    ]
  },
  "ai-eyeshadow": {
    slug: "ai-eyeshadow",
    title: "AI Eyeshadow Try-On",
    eyebrow: "Live eyelid color preview",
    h1: "Try eyeshadow looks on your own eyes",
    description: "Compare taupe, rose shimmer, bronze, and smoky eyeshadow with face-locked eyelid placement and adjustable intensity.",
    primaryCta: "Try eyeshadow live",
    secondaryCta: "View pricing",
    seoTitle: "AI Eyeshadow Try-On | Preview Eye Shadow Online",
    seoDescription: "Preview eyeshadow online with AI face tracking. Try taupe, rose shimmer, bronze, and smoky eye looks on your photo or camera.",
    keywords: ["ai eyeshadow", "eyeshadow try on", "virtual eye shadow"],
    sections: ["Pick an eyeshadow finish", "Tune the intensity", "Add liner and mascara"],
    faqs: [
      { question: "Does the eyeshadow move with my face?", answer: "In camera mode the preview follows detected eye landmarks. Keep your face near the center and use even light for the cleanest edges." },
      { question: "Can I add eyeliner after eyeshadow?", answer: "Yes. Eyeshadow renders before eyeliner and mascara so the layers stay visually ordered." },
      ...sharedEnglishFaqs
    ]
  },
  "ai-eyeliner": {
    slug: "ai-eyeliner",
    title: "Virtual Eyeliner Try-On",
    eyebrow: "Live liner shape preview",
    h1: "Try eyeliner shapes before drawing them",
    description: "Preview classic, winged, puppy, and soft brown liner with live eye tracking, then balance the line with shadow and lashes.",
    primaryCta: "Try eyeliner live",
    secondaryCta: "View pricing",
    seoTitle: "Virtual Eyeliner Try-On | Test Eyeliner Shapes Online",
    seoDescription: "Try eyeliner online on a photo or live camera. Compare classic, winged, puppy, and soft brown liner shapes before applying makeup.",
    keywords: ["virtual eyeliner try on", "eyeliner filter", "ai eyeliner"],
    sections: ["Compare liner shapes", "Control line strength", "Balance the full eye look"],
    faqs: [
      { question: "Which eyeliner photos work best?", answer: "Use a front-facing photo with both eyes open, limited hair covering the eyelids, and soft even light." },
      { question: "Is the winged liner an exact application guide?", answer: "It is a visual preview rather than a cosmetic stencil. Use it to compare direction and intensity, not as a millimeter-accurate template." },
      ...sharedEnglishFaqs
    ]
  },
  "ai-mascara": {
    slug: "ai-mascara",
    title: "Virtual Mascara Try-On",
    eyebrow: "Live lash definition",
    h1: "Preview mascara intensity online",
    description: "Compare natural, lengthening, volumizing, and defined lash effects without changing the rest of your face.",
    primaryCta: "Try mascara live",
    secondaryCta: "View pricing",
    seoTitle: "Virtual Mascara Try-On | Preview Lash Effects Online",
    seoDescription: "Preview mascara online with live face tracking. Compare natural, lengthening, volumizing, and defined lash effects.",
    keywords: ["virtual mascara try on", "mascara filter", "ai lashes"],
    sections: ["Choose a lash finish", "Adjust definition", "Pair with liner"],
    faqs: [
      { question: "Can mascara be previewed with glasses?", answer: "For the paid Beta, remove glasses and keep the upper eyelids visible for more stable lash placement." },
      { question: "Does this add false lashes?", answer: "The presets simulate mascara definition and length. They do not promise an exact false-lash product match." },
      ...sharedEnglishFaqs
    ]
  },
  "ai-eyebrow": {
    slug: "ai-eyebrow",
    title: "AI Eyebrow Try-On",
    eyebrow: "Live brow shape preview",
    h1: "Try eyebrow shapes on your face",
    description: "Compare soft, straight, arched, and feathered brows while preserving your facial proportions and the rest of your makeup.",
    primaryCta: "Try brows live",
    secondaryCta: "View pricing",
    seoTitle: "AI Eyebrow Try-On | Preview Brow Shapes Online",
    seoDescription: "Try eyebrow shapes online on your own face. Preview soft, straight, arched, and feathered brow effects with adjustable strength.",
    keywords: ["ai eyebrow try on", "virtual eyebrows", "eyebrow shape filter"],
    sections: ["Compare brow directions", "Tune color strength", "Check facial balance"],
    faqs: [
      { question: "Will the tool remove my natural brows?", answer: "No. The Beta overlays color and definition on the detected brow area so your natural structure remains visible." },
      { question: "Can it tell me my ideal brow shape?", answer: "Use the four previews to compare balance, but treat them as inspiration rather than professional brow-mapping advice." },
      ...sharedEnglishFaqs
    ]
  },
  "ai-contour-makeup": {
    slug: "ai-contour-makeup",
    title: "AI Contour Try-On",
    eyebrow: "Live face sculpt preview",
    h1: "Preview contour strength before applying it",
    description: "Compare natural, soft sculpt, defined, and editorial contour placements with a live, adjustable face preview.",
    primaryCta: "Try contour live",
    secondaryCta: "View pricing",
    seoTitle: "AI Contour Try-On | Preview Face Contour Online",
    seoDescription: "Try face contour online with live landmark tracking. Compare natural, soft sculpt, defined, and editorial contour intensity.",
    keywords: ["ai contour try on", "virtual contour makeup", "contour filter"],
    sections: ["Choose sculpt strength", "Check both cheeks", "Add blush and highlight"],
    faqs: [
      { question: "Does contour change my face shape?", answer: "It previews shadow placement while preserving your identity and face outline. It does not reshape facial geometry." },
      { question: "Can contour and highlight be combined?", answer: "Yes. Contour renders below blush and highlight so you can build a balanced layered result." },
      ...sharedEnglishFaqs
    ]
  },
  "ai-highlighter-makeup": {
    slug: "ai-highlighter-makeup",
    title: "AI Highlighter Try-On",
    eyebrow: "Live glow placement",
    h1: "Try highlighter finishes online",
    description: "Preview subtle, champagne, dewy, and glass-skin highlight along the cheekbones and center of the face.",
    primaryCta: "Try highlight live",
    secondaryCta: "View pricing",
    seoTitle: "AI Highlighter Try-On | Preview Face Glow Online",
    seoDescription: "Try makeup highlighter online with a live face preview. Compare subtle, champagne, dewy, and glass-skin glow effects.",
    keywords: ["ai highlighter try on", "makeup highlight filter", "face glow preview"],
    sections: ["Choose a glow finish", "Control reflection strength", "Balance blush and contour"],
    faqs: [
      { question: "Where does the highlighter preview appear?", answer: "The Beta follows the center of the face and upper cheek areas detected from a clear front-facing image." },
      { question: "Will the result match a specific highlighter product?", answer: "No. The preview compares finish direction and intensity; it is not calibrated to a physical product formula." },
      ...sharedEnglishFaqs
    ]
  },
  "ai-bridal-makeup": {
    slug: "ai-bridal-makeup",
    title: "AI Bridal Makeup",
    eyebrow: "Wedding-ready previews",
    h1: "Preview bridal makeup before the trial",
    description:
      "Explore soft glam, classic, romantic, and editorial bridal makeup looks before your appointment.",
    primaryCta: "Try bridal makeup",
    secondaryCta: "Save ideas",
    seoTitle: "AI Bridal Makeup | Preview Wedding Makeup Looks",
    seoDescription:
      "Preview bridal makeup looks online with AI, including soft glam, romantic, classic, and editorial wedding styles.",
    keywords: ["ai bridal makeup", "wedding makeup ai", "bridal makeup try on"],
    sections: ["Wedding presets", "Shareable references", "Consultation prep"],
    faqs: sharedEnglishFaqs
  },
  pricing: {
    slug: "pricing",
    title: "Pricing",
    eyebrow: "Simple pay-as-you-go credits",
    h1: "Three free looks, then $8 for 100",
    description:
      "Preview live makeup for free. New accounts receive three HD results, then one $8 pack adds 100 more generations.",
    primaryCta: "Start free",
    secondaryCta: "See plans",
    seoTitle: "AI Makeup Pricing | $8 for 100 HD Generations",
    seoDescription:
      "Start with three free AI makeup results, then buy 100 HD generations for $8 with secure Creem checkout.",
    keywords: ["ai makeup pricing", "ai makeup credits", "virtual makeup price"],
    sections: ["Three free results", "One-time credit pack", "No subscription"],
    faqs: sharedEnglishFaqs
  }
};

const chinesePages: Record<LandingSlug, LandingPage> = {
  home: {
    ...englishPages.home,
    title: "AI 妆容工作室",
    eyebrow: "面向创作者与美妆用户的 AI 工具",
    h1: "先在线试妆，再决定真实妆容",
    description: "生成 12 种完整 AI 妆容，预览九种实时妆效，并在同一个工作台比较和保存结果。",
    primaryCta: "免费试妆",
    secondaryCta: "查看价格",
    seoTitle: "AI 妆容工作室 | AI 生成器与在线虚拟试妆",
    seoDescription: "在线生成 12 种完整 AI 妆容并预览九种实时妆效。注册赠送 3 次高清结果，之后可一次性购买 credits。",
    keywords: ["AI 妆容", "虚拟试妆", "AI 美妆工具"],
    sections: ["12 种完整 AI 妆容", "九部位实时试妆", "作品历史与下载"],
    faqs: sharedChineseFaqs
  },
  "ai-makeup": {
    ...englishPages["ai-makeup"],
    title: "AI 妆容生成器",
    eyebrow: "在线免费 AI 试妆",
    h1: "AI 妆容生成器",
    description: "上传自拍、选择妆容风格，即可生成真实感试妆效果，并查看前后对比和适配建议。",
    primaryCta: "上传自拍",
    secondaryCta: "查看风格",
    seoTitle: "AI 妆容生成器 | 在线虚拟试妆工具",
    seoDescription: "使用 AI 妆容生成器在线试妆，支持自然妆、甜美妆、婚礼妆、Douyin 妆、韩系妆等风格。",
    keywords: ["AI 妆容生成器", "AI 试妆", "虚拟试妆", "什么妆容适合我 AI"],
    sections: ["上传并生成", "前后对比预览", "脸型适配建议"],
    faqs: [
      {
        question: "什么是 AI 妆容生成器？",
        answer: "它是一种在线工具，可以把不同妆容风格应用到自拍上，让你在真实上妆前先预览效果。"
      },
      ...sharedChineseFaqs
    ]
  },
  "ai-makeup/generator": {
    ...englishPages["ai-makeup/generator"],
    title: "AI 妆容生成器",
    eyebrow: "完整妆容生成",
    h1: "用一张自拍生成完整妆容",
    description: "生成自然妆、软糯欧美妆、婚礼妆、创作者妆容，并支持强度调节和结果下载。",
    primaryCta: "生成妆容",
    secondaryCta: "比较套餐",
    seoTitle: "AI 妆容生成器 | 在线生成完整妆容",
    seoDescription: "用自拍在线生成完整 AI 妆容，支持风格强度、前后对比和高清下载。",
    keywords: ["AI 妆容生成器", "AI 美妆生成", "完整妆容 AI"],
    sections: ["风格预设", "强度控制", "高清下载"],
    faqs: sharedChineseFaqs
  },
  "ai-makeup/filter": {
    ...englishPages["ai-makeup/filter"],
    title: "AI 妆容滤镜",
    eyebrow: "快速美妆滤镜",
    h1: "几秒钟应用 AI 妆容滤镜",
    description: "适合快速预览、社交头像、内容创作和轻量图片编辑。",
    primaryCta: "试用滤镜",
    secondaryCta: "打开工作台",
    seoTitle: "AI 妆容滤镜 | 在线美妆滤镜工具",
    seoDescription: "在线应用 AI 妆容滤镜，快速生成美妆预览、社交图片和前后对比效果。",
    keywords: ["AI 妆容滤镜", "美妆滤镜", "AI 美颜滤镜"],
    sections: ["快速滤镜", "适合社交分享", "一键变体"],
    faqs: sharedChineseFaqs
  },
  "virtual-makeup-try-on": {
    ...englishPages["virtual-makeup-try-on"],
    title: "虚拟试妆",
    eyebrow: "口红、粉底、眼妆、腮红",
    h1: "每个妆容细节都能在线试",
    description: "用一个清爽工作台预览口红、粉底、腮红、眼妆、眉毛、修容和高光。",
    primaryCta: "开始试妆",
    secondaryCta: "探索部位",
    seoTitle: "虚拟试妆 | AI 口红、粉底和眼妆试妆",
    seoDescription: "在线试口红、粉底、腮红、眼妆、眉毛、修容和高光，快速预览 AI 虚拟试妆效果。",
    keywords: ["虚拟试妆", "AI 口红试色", "粉底试妆"],
    sections: ["分部位控制", "色号比较", "适合美妆电商"],
    faqs: sharedChineseFaqs
  },
  "what-makeup-suits-my-face-ai": {
    ...englishPages["what-makeup-suits-my-face-ai"],
    title: "什么妆容适合我 AI",
    eyebrow: "在自己的脸上比较妆容",
    h1: "用 AI 找到适合你的妆容",
    description: "在自己的自拍上应用并比较多种妆容，判断哪些颜色、强度和场景更适合你。",
    primaryCta: "在我的脸上比较妆容",
    secondaryCta: "查看示例",
    seoTitle: "什么妆容适合我 AI | 在线比较多种妆容",
    seoDescription: "在自己的自拍上比较多种 AI 妆容，判断哪些颜色、强度和使用场景更适合你的五官。",
    keywords: ["什么妆容适合我 AI", "AI 妆容顾问", "脸型妆容分析"],
    sections: ["妆容前后对比", "场景灵感", "五官平衡建议"],
    faqs: sharedChineseFaqs
  },
  "ai-foundation-makeup": {
    ...englishPages["ai-foundation-makeup"],
    title: "AI 粉底妆容",
    eyebrow: "底妆效果预览",
    h1: "用 AI 预览粉底妆效",
    description: "比较哑光、缎光、水光和柔焦底妆效果，找到更适合你的底妆风格。",
    primaryCta: "试粉底妆",
    secondaryCta: "打开完整工作台",
    seoTitle: "AI 粉底妆容 | 在线预览底妆效果",
    seoDescription: "用 AI 粉底妆容工具在线比较不同底妆妆效，预览自然、柔焦和水光底妆。",
    keywords: ["AI 粉底妆容", "粉底试妆", "底妆 AI"],
    sections: ["妆效预览", "肤色适配说明", "自然底妆选择"],
    faqs: sharedChineseFaqs
  },
  "ai-lipstick-try-on": {
    ...englishPages["ai-lipstick-try-on"],
    title: "AI 口红试色",
    eyebrow: "口红色号预览",
    h1: "在线试不同口红色号",
    description: "在自拍上预览裸色、浆果色、正红、珊瑚、镜面和哑光口红效果。",
    primaryCta: "试口红",
    secondaryCta: "比较色号",
    seoTitle: "AI 口红试色 | 在线试口红色号",
    seoDescription: "用 AI 在线试口红色号，比较裸色、浆果色、红色、珊瑚色、镜面和哑光效果。",
    keywords: ["AI 口红试色", "口红试色", "虚拟口红"],
    sections: ["色号比较", "质地控制", "可下载预览"],
    faqs: sharedChineseFaqs
  },
  "ai-eye-makeup": {
    ...englishPages["ai-eye-makeup"],
    title: "AI 眼妆",
    eyebrow: "眼影、眼线、睫毛",
    h1: "用 AI 试不同眼妆风格",
    description: "生成柔和眼影、上扬眼线、烟熏妆、睫毛、眉毛和创意眼妆。",
    primaryCta: "试眼妆",
    secondaryCta: "查看妆容",
    seoTitle: "AI 眼妆 | 在线试眼影、眼线和睫毛",
    seoDescription: "用 AI 眼妆工具预览眼影、眼线、睫毛、眉毛、烟熏妆和创意眼妆。",
    keywords: ["AI 眼妆", "AI 眼影", "眼线试妆"],
    sections: ["眼妆预设", "五官重点", "创作者妆容"],
    faqs: sharedChineseFaqs
  },
  "ai-blush-makeup": {
    ...englishPages["ai-blush-makeup"],
    title: "AI 腮红试妆",
    eyebrow: "实时脸颊色彩预览",
    h1: "在线试腮红颜色和强度",
    description: "在自己的照片或摄像头画面上比较柔玫瑰、蜜桃、梅子和日晒感腮红，并与其他妆效组合。",
    primaryCta: "实时试腮红",
    secondaryCta: "查看价格",
    seoTitle: "AI 腮红试妆 | 在线预览腮红颜色",
    seoDescription: "使用实时人脸识别在线试腮红，比较玫瑰、蜜桃、梅子和日晒感脸颊颜色。",
    keywords: ["AI 腮红试妆", "虚拟腮红", "腮红滤镜"],
    sections: ["选择脸颊颜色", "调节妆效强度", "组合完整妆容"],
    faqs: [
      { question: "腮红会显示在什么位置？", answer: "实时预览会跟随识别到的脸颊区域。建议先用较低强度，再逐步增加到与五官协调。" },
      { question: "腮红可以和口红、修容一起用吗？", answer: "可以。在同一个试妆台开启多个部位，最终只需生成一次组合结果。" },
      ...sharedChineseFaqs
    ]
  },
  "ai-eyeshadow": {
    ...englishPages["ai-eyeshadow"],
    title: "AI 眼影试妆",
    eyebrow: "实时眼皮色彩预览",
    h1: "在自己的眼睛上试不同眼影",
    description: "比较灰棕、玫瑰微闪、古铜和烟熏眼影，妆效跟随眼部关键点并可实时调节。",
    primaryCta: "实时试眼影",
    secondaryCta: "查看价格",
    seoTitle: "AI 眼影试妆 | 在线预览眼影效果",
    seoDescription: "通过照片或摄像头在线试眼影，比较灰棕、玫瑰微闪、古铜和烟熏眼妆。",
    keywords: ["AI 眼影", "眼影试妆", "虚拟眼影"],
    sections: ["选择眼影质感", "调节眼影强度", "叠加眼线与睫毛"],
    faqs: [
      { question: "摄像头模式下眼影会跟着移动吗？", answer: "会。预览跟随识别到的眼部关键点，请保持脸部居中和光线均匀。" },
      { question: "可以在眼影上继续加眼线吗？", answer: "可以。眼影会先渲染，眼线和睫毛位于上层。" },
      ...sharedChineseFaqs
    ]
  },
  "ai-eyeliner": {
    ...englishPages["ai-eyeliner"],
    title: "虚拟眼线试妆",
    eyebrow: "实时眼线形状预览",
    h1: "画眼线前先在线比较形状",
    description: "比较经典、上扬、下垂和柔棕眼线，再配合眼影与睫毛调整整体眼妆。",
    primaryCta: "实时试眼线",
    secondaryCta: "查看价格",
    seoTitle: "虚拟眼线试妆 | 在线比较眼线形状",
    seoDescription: "在照片或摄像头上在线试眼线，比较经典、上扬、下垂和柔棕眼线。",
    keywords: ["虚拟眼线试妆", "眼线滤镜", "AI 眼线"],
    sections: ["比较眼线形状", "控制线条强度", "搭配完整眼妆"],
    faqs: [
      { question: "什么照片更适合试眼线？", answer: "使用双眼睁开、刘海不过度遮挡、光线均匀的正脸照片。" },
      { question: "上扬眼线能当作精确画线模板吗？", answer: "不能。它用于比较方向和强度，不是毫米级化妆模板。" },
      ...sharedChineseFaqs
    ]
  },
  "ai-mascara": {
    ...englishPages["ai-mascara"],
    title: "虚拟睫毛膏试妆",
    eyebrow: "实时睫毛清晰度预览",
    h1: "在线预览不同睫毛膏效果",
    description: "比较自然、纤长、浓密和根根分明的睫毛效果，不改变其他五官。",
    primaryCta: "实时试睫毛",
    secondaryCta: "查看价格",
    seoTitle: "虚拟睫毛膏试妆 | 在线预览睫毛效果",
    seoDescription: "实时预览自然、纤长、浓密和根根分明的睫毛膏效果。",
    keywords: ["虚拟睫毛膏", "睫毛滤镜", "AI 睫毛"],
    sections: ["选择睫毛质感", "调节清晰度", "搭配眼线"],
    faqs: [
      { question: "戴眼镜可以试睫毛膏吗？", answer: "付费 Beta 建议摘下眼镜并露出上眼皮，以获得更稳定的位置。" },
      { question: "这会添加假睫毛吗？", answer: "预设模拟睫毛膏的纤长和浓密感，不对应具体假睫毛产品。" },
      ...sharedChineseFaqs
    ]
  },
  "ai-eyebrow": {
    ...englishPages["ai-eyebrow"],
    title: "AI 眉形试妆",
    eyebrow: "实时眉形预览",
    h1: "在自己的脸上比较眉形",
    description: "比较柔雾眉、平直眉、挑眉和野生眉，同时保留自然眉毛结构。",
    primaryCta: "实时试眉形",
    secondaryCta: "查看价格",
    seoTitle: "AI 眉形试妆 | 在线预览不同眉形",
    seoDescription: "在自己的脸上在线比较柔雾眉、平直眉、挑眉和野生眉，并调节颜色强度。",
    keywords: ["AI 眉形试妆", "虚拟眉毛", "眉形滤镜"],
    sections: ["比较眉毛走向", "调节颜色强度", "检查五官平衡"],
    faqs: [
      { question: "工具会去掉我的自然眉毛吗？", answer: "不会。Beta 在检测到的眉毛区域叠加颜色和清晰度，自然眉毛仍会保留。" },
      { question: "它能告诉我最适合的眉形吗？", answer: "可以用四种预览比较平衡感，但不能替代专业眉形设计。" },
      ...sharedChineseFaqs
    ]
  },
  "ai-contour-makeup": {
    ...englishPages["ai-contour-makeup"],
    title: "AI 修容试妆",
    eyebrow: "实时面部立体感预览",
    h1: "上妆前先预览修容强度",
    description: "比较自然、柔和立体、清晰轮廓和杂志感修容，并实时调整深浅。",
    primaryCta: "实时试修容",
    secondaryCta: "查看价格",
    seoTitle: "AI 修容试妆 | 在线预览面部修容",
    seoDescription: "通过实时面部关键点在线试修容，比较自然、柔和、清晰和杂志感修容。",
    keywords: ["AI 修容试妆", "虚拟修容", "修容滤镜"],
    sections: ["选择立体强度", "检查两侧脸颊", "搭配腮红与高光"],
    faqs: [
      { question: "修容会改变我的脸型吗？", answer: "它只预览阴影位置，不会改变身份、脸部轮廓或几何结构。" },
      { question: "修容和高光可以组合吗？", answer: "可以。修容位于腮红和高光下层，便于建立更平衡的立体感。" },
      ...sharedChineseFaqs
    ]
  },
  "ai-highlighter-makeup": {
    ...englishPages["ai-highlighter-makeup"],
    title: "AI 高光试妆",
    eyebrow: "实时光泽位置预览",
    h1: "在线试不同高光质感",
    description: "在颧骨和面部中央预览自然、香槟、水光和玻璃肌高光。",
    primaryCta: "实时试高光",
    secondaryCta: "查看价格",
    seoTitle: "AI 高光试妆 | 在线预览面部光泽",
    seoDescription: "在线试高光妆效，比较自然、香槟、水光和玻璃肌光泽。",
    keywords: ["AI 高光试妆", "高光滤镜", "面部光泽预览"],
    sections: ["选择光泽质感", "控制反光强度", "平衡腮红与修容"],
    faqs: [
      { question: "高光会显示在哪里？", answer: "Beta 跟随清晰正脸图中的面部中央和上颧骨区域。" },
      { question: "效果会对应某款高光产品吗？", answer: "不会。它用于比较质感方向和强度，不对应具体实体产品配方。" },
      ...sharedChineseFaqs
    ]
  },
  "ai-bridal-makeup": {
    ...englishPages["ai-bridal-makeup"],
    title: "AI 新娘妆",
    eyebrow: "婚礼妆容预览",
    h1: "试妆前先预览新娘妆",
    description: "探索温柔、经典、浪漫和杂志感新娘妆，为真实试妆提前准备参考。",
    primaryCta: "试新娘妆",
    secondaryCta: "保存灵感",
    seoTitle: "AI 新娘妆 | 在线预览婚礼妆容",
    seoDescription: "用 AI 在线预览新娘妆，包括温柔、浪漫、经典和杂志感婚礼妆容。",
    keywords: ["AI 新娘妆", "婚礼妆容 AI", "新娘妆试妆"],
    sections: ["婚礼妆预设", "可分享参考", "试妆沟通准备"],
    faqs: sharedChineseFaqs
  },
  pricing: {
    ...englishPages.pricing,
    title: "价格",
    eyebrow: "简单按次付费",
    h1: "先送 3 次，再以 $8 购买 100 次",
    description: "实时预览免费，新账户获得 3 次高清结果；用完后可一次性购买 100 次，无订阅。",
    primaryCta: "免费开始",
    secondaryCta: "查看套餐",
    seoTitle: "AI 妆容价格 | $8 购买 100 次高清生成",
    seoDescription: "注册获得 3 次免费 AI 妆容结果，之后可通过 Creem 以 $8 一次性购买 100 次。",
    keywords: ["AI 妆容价格", "AI 试妆 credits", "虚拟试妆价格"],
    sections: ["3 次免费结果", "一次性额度包", "无订阅"],
    faqs: sharedChineseFaqs
  }
};

const pagesByLocale: Record<Locale, Record<LandingSlug, LandingPage>> = {
  en: englishPages,
  "zh-CN": chinesePages
};

export function getLandingPage(slug: LandingSlug, locale: Locale): LandingPage {
  return pagesByLocale[locale][slug] ?? pagesByLocale.en[slug];
}

export function slugFromPath(path: string): LandingSlug | null {
  const normalized = path.replace(/^\/|\/$/g, "") || "home";
  return landingSlugs.includes(normalized as LandingSlug) ? (normalized as LandingSlug) : null;
}

const styleIds = [
  "natural",
  "soft-glam",
  "clean-girl",
  "date-night",
  "wedding",
  "gothic",
  "y2k",
  "k-beauty",
  "douyin",
  "latina",
  "editorial",
  "cosplay"
] as const;

const styleCopy: Record<Locale, Record<(typeof styleIds)[number], Omit<MakeupStyle, "id">>> = {
  en: {
    natural: { name: "Natural", description: "Soft skin, balanced lips, and barely-there definition.", mood: "Everyday" },
    "soft-glam": { name: "Soft Glam", description: "Diffused eyes, lifted lashes, and polished complexion.", mood: "Polished" },
    "clean-girl": { name: "Clean Girl", description: "Glowy base, brushed brows, and fresh lip tint.", mood: "Fresh" },
    "date-night": { name: "Date Night", description: "Warm eyes, satin skin, and a confident lip.", mood: "Romantic" },
    wedding: { name: "Wedding", description: "Camera-ready radiance with timeless definition.", mood: "Elegant" },
    gothic: { name: "Gothic", description: "Deep lips, sculpted eyes, and dramatic contrast.", mood: "Dramatic" },
    y2k: { name: "Y2K", description: "Gloss, shimmer, and playful nostalgic color.", mood: "Playful" },
    "k-beauty": { name: "K-Beauty", description: "Dewy skin, soft gradients, and youthful color.", mood: "Dewy" },
    douyin: { name: "Douyin", description: "Sparkle eyes, lifted blush, and defined lips.", mood: "Viral" },
    latina: { name: "Latina", description: "Sculpted base, defined liner, and glossy lips.", mood: "Bold" },
    editorial: { name: "Editorial", description: "Statement color and high-fashion face framing.", mood: "Creative" },
    cosplay: { name: "Cosplay", description: "Character-driven color, contour, and eye emphasis.", mood: "Expressive" }
  },
  "zh-CN": {
    natural: { name: "自然妆", description: "柔和底妆、自然唇色和轻量轮廓。", mood: "日常" },
    "soft-glam": { name: "Soft Glam", description: "晕染眼妆、卷翘睫毛和精致底妆。", mood: "精致" },
    "clean-girl": { name: "Clean Girl", description: "水光底妆、野生眉和清透唇色。", mood: "清爽" },
    "date-night": { name: "约会妆", description: "暖调眼妆、缎光底妆和有存在感的唇色。", mood: "浪漫" },
    wedding: { name: "婚礼妆", description: "适合镜头的光泽感和经典五官修饰。", mood: "优雅" },
    gothic: { name: "哥特妆", description: "深色唇妆、立体眼妆和强对比轮廓。", mood: "戏剧" },
    y2k: { name: "Y2K", description: "高光、亮片和复古玩味色彩。", mood: "玩味" },
    "k-beauty": { name: "韩系妆", description: "水润肌肤、柔和渐层和减龄色彩。", mood: "水润" },
    douyin: { name: "Douyin 妆", description: "亮片眼妆、上提腮红和精致唇形。", mood: "热门" },
    latina: { name: "Latina 妆", description: "立体底妆、清晰眼线和玻璃唇。", mood: "大胆" },
    editorial: { name: "杂志妆", description: "高时装感色彩和强视觉五官框架。", mood: "创意" },
    cosplay: { name: "Cosplay 妆", description: "角色化色彩、修容和眼妆重点。", mood: "表现力" }
  }
};

export function getStyleLibrary(locale: Locale): MakeupStyle[] {
  return styleIds.map((id) => ({
    id,
    ...styleCopy[locale][id]
  }));
}

export const featureParts = [
  "lipstick",
  "foundation",
  "blush",
  "eyeshadow",
  "eyeliner",
  "mascara",
  "brows",
  "contour",
  "highlight"
] as const;

export const pricingPlans = [
  {
    id: "free",
    monthly: "$0",
    credits: "3 free generations",
    highlight: false
  },
  {
    id: "credits_100",
    monthly: "$8 once",
    credits: "100 generations",
    highlight: true
  }
] as const;
