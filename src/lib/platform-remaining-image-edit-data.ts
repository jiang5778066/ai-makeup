import type { Locale } from "./i18n";

export const baldFilterPath = "/image-effects/bald-filter";
export const beardFilterPath = "/image-effects/beard-filter";
export const buzzCutFilterPath = "/image-effects/buzz-cut-filter";
export const eyeColorPath = "/image-effects/change-eye-color";
export const christmasPhotoPath = "/image-effects/christmas-ai-photo-generator";

export const remainingImageEditPaths = [baldFilterPath, beardFilterPath, buzzCutFilterPath, eyeColorPath, christmasPhotoPath] as const;
export type RemainingImageEditPath = typeof remainingImageEditPaths[number];

type Copy = Record<Locale, string>;
type Option = { id: string; label: Copy; instruction: Copy; swatch?: string };

const copy = (en: string, zh: string): Copy => ({ en, "zh-CN": zh });
const option = (id: string, label: Copy, instruction: Copy, swatch?: string): Option => ({ id, label, instruction, swatch });

export const remainingImageEditSettings = {
  [baldFilterPath]: { parameter: "finish", label: copy("Scalp finish", "头皮效果") },
  [beardFilterPath]: { parameter: "style", label: copy("Beard style", "胡须款式") },
  [buzzCutFilterPath]: { parameter: "length", label: copy("Clipper length", "推剪长度") },
  [eyeColorPath]: { parameter: "color", label: copy("Iris color", "虹膜颜色") },
  [christmasPhotoPath]: { parameter: "scene", label: copy("Christmas scene", "圣诞场景") },
} satisfies Record<RemainingImageEditPath, { parameter: string; label: Copy }>;

const hairOnly = copy(
  "Preserve the person's face, expression, eyebrows, facial hair, clothing, background and original lighting.",
  "保留人物的五官、表情、眉毛、胡须、服装、背景和原有光线。",
);

export const remainingImageEditContent = {
  [baldFilterPath]: {
    title: copy("Bald Filter", "光头滤镜"),
    description: copy("Try a shaved head on one portrait. Choose a clean shave or a faint clipper shadow while keeping your facial features.", "用一张人像尝试光头造型。可选光滑剃面或浅发茬，并保留原有五官。"),
    illustration: "/platform/directories/framekoi-bald-filter-illustration.webp",
    illustrationAnchor: "examples",
    options: [
      option("clean-shave", copy("Clean shave", "光滑剃面"), copy("Remove scalp hair completely. Keep a natural scalp tone and head shape.", "去除头发，保留自然头皮肤色和头部轮廓。")),
      option("clipper-shadow", copy("Faint clipper shadow", "浅发茬"), copy("Leave only a faint, finely textured clipper shadow on the scalp.", "仅在头皮上保留一层细微的短发茬。")),
    ],
    preserve: hairOnly,
  },
  [beardFilterPath]: {
    title: copy("Beard Filter", "胡须滤镜"),
    description: copy("Try a beard on one portrait. Compare light stubble, a short boxed beard and a tapered full beard.", "用一张人像试戴胡须。可选浅胡茬、短方形胡须或渐收全须。"),
    illustration: "/platform/directories/framekoi-beard-filter-illustration.webp",
    options: [
      option("stubble", copy("Light stubble", "浅胡茬"), copy("Add subtle short stubble along the jaw, chin and upper lip.", "在下颌、下巴和上唇增加自然的浅胡茬。")),
      option("boxed-beard", copy("Short boxed beard", "短方形胡须"), copy("Shape a short boxed beard with tidy cheek lines and an even lower edge.", "塑造短方形胡须，修整脸颊线，保留下缘齐整。")),
      option("tapered-beard", copy("Tapered full beard", "渐收全须"), copy("Add a dense full beard, tapering from the chin toward the sideburns.", "增加浓密全须，从下巴向鬓角逐渐收短。")),
    ],
    preserve: copy("Edit only facial hair. Preserve recognizable facial features, expression, scalp hair, clothing, background and original lighting.", "仅编辑胡须，保留可辨认的五官、表情、原有发型、服装、背景和光线。"),
  },
  [buzzCutFilterPath]: {
    title: copy("Buzz Cut Filter", "寸头滤镜"),
    description: copy("Try a buzz cut on one portrait. Choose an approximate clipper length and keep the original hair color and hairline.", "用一张人像尝试寸头。选择大致的推剪长度，保留发色和原有发际线。"),
    illustration: "/platform/directories/framekoi-buzz-cut-filter-illustration.webp",
    options: [
      option("grade-1", copy("Grade 1 · about 3 mm", "1 号 · 约 3 毫米"), copy("Cut scalp hair evenly to about 3 mm with the original hairline visible.", "将头发均匀剪至约 3 毫米，保留原有发际线。")),
      option("grade-2", copy("Grade 2 · about 6 mm", "2 号 · 约 6 毫米"), copy("Cut scalp hair evenly to about 6 mm with soft, natural edges.", "将头发均匀剪至约 6 毫米，边缘保持自然。")),
      option("grade-3", copy("Grade 3 · about 10 mm", "3 号 · 约 10 毫米"), copy("Cut scalp hair evenly to about 10 mm, preserving its growth direction.", "将头发均匀剪至约 10 毫米，保留原有生长方向。")),
    ],
    preserve: copy(`Keep the original hairline and hair color. ${hairOnly.en}`, `保留原有发际线和发色。${hairOnly["zh-CN"]}`),
  },
  [eyeColorPath]: {
    title: copy("Eye Color Changer", "瞳色更换"),
    description: copy("Choose a new iris shade for one portrait. The edit focuses on the visible irises and keeps their original texture and highlights.", "为一张人像选择新瞳色。编辑范围为可见虹膜，保留原有纹理和高光。"),
    illustration: "/platform/directories/framekoi-eye-color-illustration.webp",
    options: [
      option("warm-brown", copy("Warm brown", "暖棕"), copy("Use a softly lit warm brown with subtle amber undertones.", "使用带微弱琥珀底调的柔和暖棕色。"), "#794b36"),
      option("hazel", copy("Hazel", "榛色"), copy("Blend muted olive and amber within the visible irises.", "在可见虹膜内融合低饱和的橄榄绿和琥珀色。"), "#8b744f"),
      option("forest-green", copy("Forest green", "森林绿"), copy("Use a natural deep green with a softly defined edge.", "使用自然的深绿色，并保持柔和的边缘。"), "#476650"),
      option("slate-blue", copy("Slate blue", "灰蓝"), copy("Use a muted, cool slate blue with natural contrast.", "使用低饱和的冷灰蓝，并保持自然反差。"), "#5d778a"),
    ],
    preserve: copy("Edit only the color of the visible irises. Preserve iris texture, pupils, sclera, eye shape, catchlights, facial features and lighting.", "仅更改可见虹膜的颜色，保留虹膜纹理、瞳孔、眼白、眼形、眼部高光、五官和原有光线。"),
  },
  [christmasPhotoPath]: {
    title: copy("Christmas AI Photo Generator", "AI 圣诞照片生成器"),
    description: copy("Set one portrait in a Christmas scene with candlelight, a snowy window or an evergreen backdrop. Bring a photo as your starting point.", "用一张原图制作圣诞人像。可选暖烛光、飘雪窗景或常青枝叶布景。"),
    illustration: "/platform/directories/framekoi-christmas-photo-illustration.webp",
    options: [
      option("candlelight", copy("Candlelit table", "暖烛光餐桌"), copy("Place the portrait beside an understated festive table with warm candlelight and a few plain red ribbons.", "在人物身旁布置简洁的节日餐桌，搭配暖色烛光和少量纯色红缎带。")),
      option("winter-window", copy("Snowy window", "飘雪窗景"), copy("Use a snowy window, soft blue daylight and a small arrangement of evergreen branches.", "采用飘雪窗景、柔和蓝色日光和一小束常青枝叶。")),
      option("evergreen-studio", copy("Evergreen studio", "常青枝叶布景"), copy("Use a muted studio backdrop with evergreen sprigs, cream paper stars and soft side lighting.", "使用低饱和影棚背景，加入常青枝叶、米色纸星和柔和侧光。")),
    ],
    preserve: copy("Change the surroundings and lighting. Preserve the person's recognizable facial features, expression, pose and clothing.", "调整环境及光线，保留可辨认的五官、表情、姿势和服装。"),
  },
} satisfies Record<RemainingImageEditPath, {
  title: Copy; description: Copy; illustration: string; illustrationAnchor?: string; options: Option[]; preserve: Copy;
}>;

export function isRemainingImageEditPath(path: string): path is RemainingImageEditPath {
  return Object.hasOwn(remainingImageEditContent, path);
}

export function remainingImageEditPrompt(path: RemainingImageEditPath, selected: Option, locale: Locale) {
  const preserve = remainingImageEditContent[path].preserve[locale];
  return locale === "zh-CN"
    ? `编辑参考人像，选择「${selected.label[locale]}」。${selected.instruction[locale]}${preserve}采用 2:3 竖幅，保留人像关键细节。`
    : `Edit the reference portrait using ${selected.label[locale]}. ${selected.instruction[locale]} ${preserve} Use a 2:3 portrait frame that keeps important details in view.`;
}
