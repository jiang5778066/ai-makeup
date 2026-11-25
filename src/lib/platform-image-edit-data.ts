import type { Locale } from "./i18n";
import {
  isRemainingImageEditPath, remainingImageEditContent, remainingImageEditPaths, remainingImageEditPrompt, remainingImageEditSettings,
  type RemainingImageEditPath,
} from "./platform-remaining-image-edit-data";

export const imageStylePath = "/image-style-converter";
export const photoRestorationPath = "/image-effects/old-photo-restoration";
export const ageProgressionPath = "/image-effects/ai-age-progression";
export const hairColorPath = "/image-effects/ai-hair-color-changer";
export const hairStylePath = "/image-effects/ai-hair-style-changer";
export const portraitImageEditPaths = [ageProgressionPath, hairColorPath, hairStylePath] as const;
export type PortraitImageEditPath = typeof portraitImageEditPaths[number] | RemainingImageEditPath;

export const imageEditPaths = [imageStylePath, photoRestorationPath, ...portraitImageEditPaths, ...remainingImageEditPaths] as const;
export type ImageEditPath = typeof imageEditPaths[number];
export function imageEditPath(pathname: string): pathname is ImageEditPath {
  return (imageEditPaths as readonly string[]).includes(pathname);
}

type Copy = Record<Locale, string>;
type EditOption = { id: string; label: Copy; instruction: Copy; swatch?: string };

function option(id: string, en: string, zh: string, instruction: string, instructionZh: string, swatch?: string): EditOption {
  return { id, label: { en, "zh-CN": zh }, instruction: { en: instruction, "zh-CN": instructionZh }, swatch };
}

export const portraitImageEditSettings = {
  [ageProgressionPath]: { parameter: "age", label: { en: "Target age group", "zh-CN": "目标年龄组" } },
  [hairColorPath]: { parameter: "color", label: { en: "Hair color", "zh-CN": "目标发色" } },
  [hairStylePath]: { parameter: "style", label: { en: "Hairstyle", "zh-CN": "目标发型" } },
  ...remainingImageEditSettings,
} satisfies Record<PortraitImageEditPath, { parameter: string; label: Copy }>;

export function isPortraitImageEditPath(path: ImageEditPath): path is PortraitImageEditPath {
  return Object.hasOwn(portraitImageEditSettings, path);
}

export const imageEditContent = {
  ...remainingImageEditContent,
  [imageStylePath]: {
    title: { en: "Image Style Converter", "zh-CN": "图片风格转换" },
    description: {
      en: "Choose a visual style for one image, from pixel art to watercolor. Preview your original and review the edit instructions before requesting a quote.",
      "zh-CN": "为一张图片选择像素画、水彩等视觉风格，在本地预览原图，并在获取报价前核对编辑说明。",
    },
    options: [
      option("christmas", "Holiday illustration", "节日插画", "Use warm window light, evergreen accents and a soft illustrated finish.", "使用暖色窗光、常青植物点缀和柔和的插画笔触。"),
      option("storybook", "Watercolor storybook", "水彩绘本", "Use layered watercolor washes, textured paper and soft, hand-painted edges.", "使用层叠的水彩晕染、纸张纹理和柔和的手绘边缘。"),
      option("pixel", "Pixel art", "像素画", "Use crisp pixel clusters, stepped edges and a limited color palette.", "使用清晰的像素色块、阶梯状边缘和有限色板。"),
      option("retro-anime", "Retro animation", "复古动画", "Use hand-inked contours, cel shading and subtle film grain.", "使用手绘墨线、赛璐珞式分层阴影和细微胶片颗粒。"),
      option("clay", "Clay model", "黏土模型", "Use sculpted clay forms, subtle fingerprints and soft studio light.", "使用手塑黏土造型、细微指纹和柔和棚拍光线。"),
      option("crayon", "Crayon drawing", "蜡笔画", "Use waxy strokes, uneven fill and visible paper grain.", "使用蜡质笔触、不均匀填色和可见的纸张纹理。"),
      option("flat-illustration", "Flat illustration", "扁平插画", "Use simplified silhouettes, solid color fields and graphic shapes.", "使用简化轮廓、纯色色块和几何图形。"),
      option("line-art", "Ink line art", "墨线画", "Use varied ink line weights, sparse hatching and open negative space.", "使用粗细变化的墨线、稀疏排线和留白。"),
      option("star", "Starlit illustration", "星光插画", "Use a deep twilight palette, small star-like highlights and soft rim light.", "使用深暮色、小颗星状高光和柔和的轮廓光。"),
      option("3d", "3D render", "三维渲染", "Use dimensional surfaces, realistic shadows and soft directional light.", "使用立体表面、自然阴影和柔和的定向光。"),
      option("colorful-anime", "Vivid animation", "明艳动画", "Use saturated colors, expressive outlines and bold cel shading.", "使用高饱和度色彩、鲜明轮廓和醒目的分层阴影。"),
      option("fresh-anime", "Soft animation", "清新动画", "Use airy pastels, fine outlines and soft daylight.", "使用轻盈的粉彩、细轮廓和柔和日光。"),
      option("y2k", "Y2K editorial", "千禧年杂志风", "Use chrome accents, glossy finishes and the color palette of early digital editorials.", "使用金属光泽、亮面质感和早期数码杂志的配色。"),
      option("cartoon", "Comic cartoon", "漫画卡通", "Use bold contours, simplified details and lively comic-book colors.", "使用粗轮廓、简化细节和鲜活的漫画配色。"),
      option("pencil", "Pencil sketch", "铅笔素描", "Use layered graphite shading, a fine pencil outline and textured paper.", "使用层叠的石墨阴影、纤细铅笔轮廓和有纹理的纸张。"),
      option("3d-cartoon", "3D cartoon", "三维卡通", "Use rounded character forms, soft directional light and smooth colorful materials.", "使用圆润的角色造型、柔和定向光和光滑的彩色材质。"),
      option("3d-photo-frame", "Framed diorama", "相框微缩景观", "Render the scene as a miniature framed diorama with visible depth and layered elements.", "将场景表现为带相框的微缩景观，呈现明显纵深和层叠元素。"),
      option("action-figure", "Collectible figure", "收藏公仔", "Render the subject as a stylized collectible figure with molded surfaces and display lighting.", "将主体表现为收藏公仔，使用模塑材质和展示照明。"),
      option("display-box", "Boxed collectible", "盒装收藏公仔", "Render the subject as a collectible figure in an unbranded display box with a clear window.", "将主体表现为装在无品牌透明视窗盒中的收藏公仔。"),
    ],
  },
  [photoRestorationPath]: {
    title: { en: "AI Old Photo Restoration", "zh-CN": "AI 老照片修复" },
    description: {
      en: "Choose which repairs to make to one scanned photo. Reduce scratches and stains, rebalance faded tones, or request colorization.",
      "zh-CN": "为一张扫描老照片选择修复操作。可以减轻划痕和污渍、调整褪色影调，或为黑白照片上色。",
    },
    options: [
      option("repair", "Repair scratches and stains", "修补划痕与污渍", "Reduce visible scratches, dust, and small stains. Keep the photo’s original tones.", "减轻可见的划痕、尘点和小块污渍，保留照片的原有影调。"),
      option("tones", "Recover faded tones", "恢复褪色影调", "Rebalance faded contrast and uneven exposure. Keep black-and-white photos monochrome.", "调整褪色导致的反差减弱和曝光不均，让黑白照片保持黑白。"),
      option("colorize", "Colorize a black-and-white photo", "黑白照片上色", "Apply plausible, restrained colors while preserving fine detail and original lighting.", "在保留细节与原始光照的基础上，使用合理、克制的色彩上色。"),
    ],
  },
  [ageProgressionPath]: {
    illustration: "/platform/directories/framekoi-age-progression-illustration.webp",
    title: { en: "AI Age Progression", "zh-CN": "AI 年龄变化" },
    description: {
      en: "Choose a target age group for one portrait, from infancy to 100 years old. Preview the original and review the requested age changes before getting a quote.",
      "zh-CN": "为一张人像选择目标年龄组，从婴儿到百岁。获取报价前，可以在本机查看原图并核对年龄变化说明。",
    },
    options: [
      option("infant", "Infant (under 2)", "婴儿（未满 2 岁）", "Use the rounded cheeks and facial proportions of infancy.", "呈现婴儿期圆润的脸颊和面部比例。"),
      option("child", "Child (around 10)", "儿童（约 10 岁）", "Use age-appropriate cheek volume and a softly defined jaw.", "呈现约十岁儿童的脸颊饱满度和柔和的下颌轮廓。"),
      option("young-adult", "Young adult (around 20)", "青年（约 20 岁）", "Use young adult facial proportions and natural skin texture.", "呈现青年期的面部比例和自然肤质。"),
      option("adult", "Adult (around 30)", "成人（约 30 岁）", "Use mature facial contours and subtle expression lines.", "呈现成熟的面部轮廓和轻微表情纹。"),
      option("middle-aged", "Middle age (around 40)", "中年（约 40 岁）", "Add subtle changes to skin texture and fine lines around the eyes.", "细微调整肤质并增加眼周细纹。"),
      option("older-adult", "Older adult (around 60)", "初老（约 60 岁）", "Use moderately defined age lines and believable changes in facial volume.", "呈现适度清晰的年龄纹理和自然的面部饱满度变化。"),
      option("elderly", "Advanced age (around 80)", "高龄（约 80 岁）", "Use pronounced age lines and softer facial contours.", "呈现较明显的年龄纹理和柔和的面部轮廓。"),
      option("centenarian", "Centenarian (around 100)", "百岁（约 100 岁）", "Use very advanced yet natural age lines and changes in skin texture.", "呈现百岁老人自然可见的年龄纹理和肤质变化。"),
    ],
  },
  [hairColorPath]: {
    illustration: "/platform/directories/framekoi-hair-color-illustration.webp",
    title: { en: "AI Hair Color Changer", "zh-CN": "AI 发色更换" },
    description: {
      en: "Choose a named shade for one portrait. The edit instructions preserve the haircut, facial features and lighting in the original.",
      "zh-CN": "为一张人像选择具名发色。编辑说明会要求保留原有发型、五官和光线。",
    },
    options: [
      option("pink", "Rose pink", "玫瑰粉", "Use a muted rose pink.", "使用柔和的玫瑰粉。", "#c77d8f"),
      option("soft-black", "Soft black", "柔黑", "Use a natural, softly reflective black.", "使用自然、带柔和光泽的黑色。", "#302c2b"),
      option("chestnut", "Chestnut brown", "栗棕", "Use a warm brown with subtle chestnut undertones.", "使用带淡淡栗色底调的暖棕色。", "#754832"),
      option("copper", "Copper red", "铜红", "Use a warm copper red.", "使用偏暖的铜红色。", "#ae5738"),
      option("honey-blonde", "Honey blonde", "蜜糖金", "Use a warm golden blonde.", "使用偏暖的金色。", "#c39b53"),
      option("ash-blonde", "Ash blonde", "冷灰金", "Use a cool, muted blonde with ash undertones.", "使用带冷灰底调的低饱和金色。", "#b2a088"),
      option("silver", "Silver gray", "银灰", "Use a soft silver gray.", "使用柔和的银灰色。", "#8e929a"),
      option("burgundy", "Burgundy", "酒红", "Use a deep, cool wine red.", "使用深而偏冷的酒红色。", "#743347"),
    ],
  },
  [hairStylePath]: {
    illustration: "/platform/directories/framekoi-hair-style-illustration.webp",
    title: { en: "AI Hairstyle Changer", "zh-CN": "AI 发型更换" },
    description: {
      en: "Choose a haircut or hairstyle for one portrait. Review the requested shape, length or texture while keeping the original hair color.",
      "zh-CN": "为一张人像选择剪裁或造型。编辑说明会调整长度、轮廓或纹理，并保留原发色。",
    },
    options: [
      option("short-bob", "Chin-length bob", "齐下巴短波波头", "Cut the hair to chin length with a blunt, even edge.", "将头发剪至下巴处，保留齐整的发尾。"),
      option("pixie", "Pixie cut", "精灵短发", "Use closely cropped sides and a softly textured top.", "缩短两侧头发，头顶保留柔和层次。"),
      option("shoulder-layers", "Shoulder-length layers", "齐肩层次发", "Use shoulder-length hair with light, face-framing layers.", "保留齐肩长度和贴合脸侧的轻盈层次。"),
      option("curtain-bangs", "Curtain bangs", "八字刘海", "Part the bangs at the center and sweep them softly to each side.", "将刘海从中间分开，向脸侧自然弯曲。"),
      option("long-waves", "Long waves", "长发波浪卷", "Use long hair with loose, flowing waves.", "使用带松散波浪卷的长发。"),
      option("box-braids", "Box braids", "分区细辫", "Use neatly sectioned individual braids with a natural hairline.", "将头发均匀分区编成细辫，保留自然发际线。"),
      option("slick-back", "Slicked back", "后梳发型", "Comb the hair back from the forehead with a neat silhouette.", "将头发从额前向后梳理，保持利落轮廓。"),
      option("low-bun", "Low bun", "低盘发", "Gather the hair into a tidy bun at the nape.", "将头发收拢，在后颈盘成发髻。"),
    ],
  },
} satisfies Record<ImageEditPath, { title: Copy; description: Copy; options: EditOption[]; illustration?: string }>;

const legacyStyles: ReadonlyMap<string, string> = new Map([
  ["ghibli-style", "storybook"], ["ghibli-style-v2", "storybook"], ["ghibli-style-v3", "storybook"],
  ["pixar", "3d-cartoon"], ["line-anime-v1", "line-art"], ["line-anime-v2", "line-art"],
  ["line-anime-v3", "line-art"], ["anime-v1", "retro-anime"], ["hand-drawn-v1", "pencil"],
  ["action-figure-v2", "action-figure"], ["action-figure-v3", "action-figure"],
  ["action-figure-v4", "action-figure"], ["barbie-box", "display-box"],
]);

export function resolveImageEditOption(path: ImageEditPath, query: URLSearchParams) {
  const modes = query.getAll("mode");
  const tabs = query.getAll("tab");
  if (modes.some(mode => mode !== "image-to-image") || tabs.some(tab => tab !== "image")) return null;
  const options = imageEditContent[path].options;
  const models = query.getAll("model");
  if (path === imageStylePath) {
    const styles = [...models, ...query.getAll("style")];
    if (new Set(styles).size > 1) return null;
    const id = styles[0] ?? options[0].id;
    return options.find(item => item.id === (legacyStyles.get(id) ?? id)) ?? null;
  }
  if (isPortraitImageEditPath(path)) {
    const values = query.getAll(portraitImageEditSettings[path].parameter);
    if (models.length || modes.length > 1 || tabs.length > 1 || values.length > 1) return null;
    const value = values[0];
    if (value === undefined) return options[0];
    if (path === ageProgressionPath) return /^[0-7]$/.test(value) ? options[Number(value)] : null;
    return options.find(item => item.id === value) ?? null;
  }
  const operations = query.getAll("operation");
  if (models.length > 1 || modes.length > 1 || tabs.length > 1 || new Set(operations).size > 1
    || models.some(model => model !== "old-photo-restoration")) return null;
  return options.find(item => item.id === (operations[0] ?? options[0].id)) ?? null;
}

export function imageEditPrompt(path: ImageEditPath, selected: EditOption, locale: Locale) {
  if (isRemainingImageEditPath(path)) return remainingImageEditPrompt(path, selected, locale);
  if (path === imageStylePath) {
    return locale === "zh-CN"
      ? `将参考图片转换为「${selected.label[locale]}」。${selected.instruction[locale]}保留主要主体、身份和场景布局。采用竖幅构图并保留关键细节。`
      : `Restyle the reference image as ${selected.label[locale]}. ${selected.instruction[locale]} Preserve the main subjects, identities and scene layout. Use a portrait composition that keeps important details in frame.`;
  }
  if (isPortraitImageEditPath(path)) {
    const target = selected.label[locale];
    const instruction = selected.instruction[locale];
    const en = path === ageProgressionPath
      ? `Adjust only the subject's age-related appearance to the ${target} age group. ${instruction} Keep hair color and hairstyle.`
      : path === hairColorPath
        ? `Change only the hair color to ${target}. ${instruction} Keep the current hairstyle, length and texture. Reflect the original highlights and shadows in the new shade.`
        : `Change only the hairstyle to ${target}. ${instruction} Preserve the original hair color.`;
    const zh = path === ageProgressionPath
      ? `仅调整人物的年龄特征，使其呈现为「${target}」。${instruction}保留原发色与发型。`
      : path === hairColorPath
        ? `仅调整发色为「${target}」。${instruction}保留原发型、长度和纹理，让新发色呈现原光线下的明暗。`
        : `仅调整发型为「${target}」。${instruction}保留原发色。`;
    return locale === "zh-CN"
      ? `${zh}保留人物身份、五官辨识特征、表情、姿势、服装、背景和原有光线。采用 2:3 竖幅，保留人像关键细节。`
      : `${en} Preserve facial identity and recognizable features, expression, pose, clothing, background and original lighting. Use a 2:3 portrait frame that keeps important details in view.`;
  }
  return locale === "zh-CN"
    ? `修复参考照片，操作为「${selected.label[locale]}」。${selected.instruction[locale]}保留人物身份、表情与历史细节，避免补画缺失的面部特征。采用竖幅构图并保留关键细节。`
    : `Restore the reference photo using this operation: ${selected.label[locale]}. ${selected.instruction[locale]} Preserve identities, expressions and historical details. Avoid inventing missing facial features. Use a portrait composition that keeps important details in frame.`;
}
