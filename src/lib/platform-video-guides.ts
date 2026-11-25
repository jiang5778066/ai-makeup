import type { Metadata } from "next";
import { alternateLanguagesForPath, localizePath, type Locale } from "./i18n";

type Translation = readonly [english: string, chinese: string];
type VideoGuide = {
  title: Translation;
  summary: Translation;
  preparation: Translation;
  check: Translation;
  prompt: Translation;
  next: "image" | "text" | "editor";
};

export const videoGuides = {
  "/video-to-video": {
    title: ["Video to video", "视频转视频"],
    summary: ["Plan a style change around the motion already present in your footage.", "围绕原视频已有的动作安排风格转换。"],
    preparation: ["Choose a source clip with readable motion. Use the local editor to isolate the section you want to keep.", "选择一段动作清楚的源视频，用本地编辑器预览要保留的片段。"],
    check: ["Identify the opening pose, the main action, and the final pose before choosing a new look.", "确定初始姿态、主要动作和最终姿态，再选定新的视觉风格。"],
    prompt: ["Keep the subject’s stride and the original camera position. Use a muted charcoal palette and soft side lighting.", "保留主体的步伐和原镜头位置，使用低饱和的炭笔色调与柔和侧光。"],
    next: "editor"
  },
  "/tools/ai-animate-image-generator": {
    title: ["Animate a still image", "静态图片动画"],
    summary: ["Choose one small motion that can begin naturally from your image.", "从静态图片出发，为主体安排一个自然、清楚的动作。"],
    preparation: ["Choose a sharp first frame with enough room around the subject for the movement.", "选择清晰的首帧，在主体周围为动作预留空间。"],
    check: ["Start with a modest movement and a fixed camera so the subject stays recognizable.", "先尝试小幅动作和固定镜头，便于辨认主体是否保持一致。"],
    prompt: ["A paper pinwheel turns gently in a breeze. Keep the hand, background, and camera still.", "纸风车在微风里缓缓转动，手、背景和镜头保持稳定。"],
    next: "image"
  },
  "/tools/ai-celebrity-video": {
    title: ["Create a fictional presenter", "设计虚构主持人短片"],
    summary: ["Develop an original on-camera character with a distinctive outfit, setting, and gesture.", "用服装、布景和动作设计有辨识度的原创出镜人物。"],
    preparation: ["Define an original adult character and use imagery you created or are authorized to use.", "先设定原创成年角色，使用自制或获得授权的图像。"],
    check: ["Keep the identity fictional and make the camera movement simple enough for a short shot.", "保持角色身份虚构，并为短镜头安排简单的运镜。"],
    prompt: ["An original science-show host in a teal jacket gestures toward a tabletop model, in a softly lit studio. Steady medium shot.", "一位穿青绿色夹克的原创科普主持人在柔光演播室里指向桌面的模型，中景固定镜头。"],
    next: "text"
  },
  "/tools/ai-hug-video-generator": {
    title: ["Hug scene", "拥抱场景"],
    summary: ["Stage a hug so the viewer can follow how two people meet and move.", "安排两个人相遇并拥抱的动作，让观众看清过程。"],
    preparation: ["Use a first frame with two consenting adults, visible shoulders, and space between them.", "用两位已同意的成年人作为首帧，露出双方肩部并留出间距。"],
    check: ["Describe the approach and the embrace from one angle. Check that arms and hands stay readable.", "从同一角度描述靠近和拥抱，检查手臂与手的位置是否清楚。"],
    prompt: ["Two adults take one step toward each other and share a brief friendly hug. Fixed waist-up shot, soft afternoon light.", "两位成年人各向前一步，轻轻拥抱。固定半身镜头，柔和午后光。"],
    next: "image"
  },
  "/tools/ai-kissing-video-generator": {
    title: ["Kiss scene", "亲吻场景"],
    summary: ["Prepare a restrained romantic shot around one brief, clearly framed action.", "为一个短促、构图明确的动作安排克制的浪漫镜头。"],
    preparation: ["Use two consenting adult subjects and choose a medium shot that shows the angle of both faces.", "使用两位已同意的成年主体，选择能看清双方脸部角度的中景。"],
    check: ["Let the subjects move once, keep the camera fixed, and review facial continuity.", "让人物只做一次动作，固定镜头，并核对五官是否保持一致。"],
    prompt: ["Two adult partners exchange a brief kiss on the cheek. One steady medium shot in warm window light.", "两位成年伴侣轻吻脸颊。窗内暖光，单个稳定的中景镜头。"],
    next: "image"
  },
  "/tools/ai-lip-sync-video-generator": {
    title: ["Lip sync", "口型同步"],
    summary: ["Prepare a portrait and a clean speech track for an audio-driven edit.", "为音频驱动的口型编辑准备正面人像和清晰人声。"],
    preparation: ["Choose footage with an unobstructed mouth and record a clean speech track you have permission to use.", "选择嘴部无遮挡的画面，并准备有使用许可的清晰人声。"],
    check: ["Compare the first word, pauses, and final syllable against the frame before rendering your edit.", "输出前对照画面检查首词、停顿和末尾音节是否同步。"],
    prompt: ["An original presenter looks at the camera, with the mouth in clear view and a stable, frontal camera.", "原创主持人正对镜头，嘴部清晰可见，画面保持稳定。"],
    next: "editor"
  },
  "/tools/ai-music-video-generator": {
    title: ["Music video", "音乐短片"],
    summary: ["Plan short shots around the rhythm and structure of a track.", "按音乐的节拍和结构安排一组短镜头。"],
    preparation: ["Mark the opening beat, transitions, and chorus in a track you are allowed to use.", "在有使用许可的曲目中标记起拍、过渡点和副歌。"],
    check: ["Write a separate prompt for each shot. Assemble the shots to the beat in your video editor.", "为每个镜头单独写提示词，再用视频编辑工具按节拍组接。"],
    prompt: ["A dancer takes a sharp side step under one bright blue spotlight. Hold the same stage framing throughout the shot.", "舞者在蓝色聚光灯下利落地向侧面迈一步，保持相同的舞台构图。"],
    next: "text"
  },
  "/tools/character-animation": {
    title: ["Character animation", "角色动画"],
    summary: ["Animate a designed character while preserving the details that make it recognizable.", "让原创角色动起来，同时保留造型中有辨识度的细节。"],
    preparation: ["Use a clear character image with the limbs needed for the action visible in the first frame.", "选一张动作所需肢体完整可见的角色首帧。"],
    check: ["Choose one gesture and check the silhouette, clothing, and face before planning the next shot.", "先安排一个动作，核对剪影、服装和脸部特征后再规划下一个镜头。"],
    prompt: ["A small clay astronaut raises one hand to wave. Keep the suit patches, proportions, lighting, and camera fixed.", "黏土宇航员抬起一只手挥手，保留宇航服徽章、身体比例、光线与镜头位置。"],
    next: "image"
  },
  "/tools/framepack-video-generator": {
    title: ["FramePack", "FramePack 视频工作流"],
    summary: ["Prepare a source frame and motion description for a FramePack workflow.", "为 FramePack 图生视频工作流准备首帧和动作描述。"],
    preparation: ["Choose a clean first frame and decide which objects need to remain stable over the shot.", "选一张清晰首帧，确定哪些物体在整段镜头中需要保持稳定。"],
    check: ["Review continuity at the beginning and end. Dedicated FramePack rendering depends on your chosen runtime.", "分别检查镜头开头和结尾的连续性。FramePack 专用渲染取决于你使用的运行环境。"],
    prompt: ["A train glides slowly from left to right across a wide landscape. Keep landmarks still, one continuous shot.", "火车从左向右缓慢穿过开阔的风景，地标保持不动，一镜到底。"],
    next: "image"
  },
  "/tools/hunyuanvideo-avatar": {
    title: ["HunyuanVideo Avatar", "混元数字人工作流"],
    summary: ["Prepare a visible talking portrait and a separate speech track.", "为数字人口播准备一张五官清晰的人像和独立音轨。"],
    preparation: ["Use a centered portrait of a consenting adult or an original character. Record short, clean speech.", "使用居中的授权成年人肖像或原创角色，录制简短清晰的人声。"],
    check: ["Keep the chin and mouth visible. Check your chosen avatar service for its audio and portrait limits.", "保持下巴和嘴部可见，并核对所用数字人服务的音频及人像规格。"],
    prompt: ["An original studio presenter faces the camera, framed from the shoulders up in even light.", "原创演播室主持人正对镜头，肩部以上构图，光线均匀。"],
    next: "editor"
  },
  "/tools/video-to-animation-converter": {
    title: ["Video to animation", "视频转动画"],
    summary: ["Break existing footage into shots before adapting its outlines, colors, or timing.", "先把现有视频拆成镜头，再调整轮廓、色彩和动作节奏。"],
    preparation: ["Pick a short clip with one clearly visible action and use the editor to choose a range.", "挑选只包含一个清晰动作的短视频，用本地编辑器确定片段范围。"],
    check: ["Decide which movement to preserve and which background details to simplify.", "判断哪些动作必须保留，哪些背景细节可以简化。"],
    prompt: ["Keep the cyclist’s motion and camera framing. Use clean drawn outlines, simplified trees, and two-tone shading.", "保留骑行者动作和镜头构图，使用清晰手绘轮廓、简化树木与双色阴影。"],
    next: "editor"
  },
  "/tools/video-to-ghibli-style": {
    title: ["Hand-painted animation", "手绘动画风格"],
    summary: ["Plan a hand-painted look for an existing shot using texture, light, and color.", "通过纹理、光线和色彩，为已有镜头设计手绘动画风格。"],
    preparation: ["Select a source clip with readable lighting, an uncluttered background, and an easy-to-follow action.", "挑选光线明确、背景简洁、动作容易辨认的源视频。"],
    check: ["Describe the paint texture and atmosphere directly. Keep the source camera and timing where they help the story.", "直接描述笔触和氛围，只保留有助于叙事的原始运镜和节奏。"],
    prompt: ["A hillside village with soft watercolor shadows and gently moving grass. Keep the camera steady and the same warm color palette.", "山坡村庄带有柔和水彩阴影，草叶轻摆，镜头稳定并保持温暖的色板。"],
    next: "editor"
  },
  "/video-effects/ai-french-kiss-video-generator": {
    title: ["French kiss scene", "法式接吻场景"],
    summary: ["Plan a romantic close scene with a single action and stable framing.", "以一个明确的动作和稳定的构图安排浪漫近景。"],
    preparation: ["Choose two consenting adult subjects and leave room for a small movement toward each other.", "选择两位已同意的成年主体，给人物靠近留出空间。"],
    check: ["Keep the lighting and camera consistent, and review the cut for facial continuity.", "保持光线和镜头一致，再检查成片中的人物五官是否连续。"],
    prompt: ["Two adult partners lean in for a brief kiss. Soft evening light, steady profile framing, no cut.", "两位成年伴侣靠近并短暂接吻，柔和夜间光线，稳定侧面构图，不切镜。"],
    next: "image"
  },
  "/video-effects/ai-mermaid-video": {
    title: ["Mermaid effect", "美人鱼特效"],
    summary: ["Frame a mermaid reveal so the water, silhouette, and tail read clearly.", "通过水面、人物剪影与鱼尾安排清晰的美人鱼亮相镜头。"],
    preparation: ["Choose a wide first frame with visible water and empty space below the subject.", "选择能看见水面且人物下方留白的宽景首帧。"],
    check: ["Ask for one slow movement. Preserve the face, waterline, and direction of the light.", "只描述一个缓慢动作，保持五官、水线和光线方向一致。"],
    prompt: ["A fictional mermaid rolls gently near the surface, revealing a sea-green tail. Keep the horizon steady and the light soft.", "虚构的美人鱼在近水面轻轻转身，露出海绿鱼尾。地平线稳定，光线柔和。"],
    next: "image"
  },
  "/video-effects/ai-muscle-video": {
    title: ["Muscle effect", "肌肉特效"],
    summary: ["Design a stylized strength pose around clear posture and consistent lighting.", "以清楚的姿态和稳定的光线安排风格化力量动作。"],
    preparation: ["Use an authorized adult portrait with visible shoulders and an uncluttered background.", "使用有授权的成年人肖像，露出肩部并保持背景简洁。"],
    check: ["Choose one pose and review the shape of the arms, clothing, and shoulders throughout the shot.", "选择一个姿势，并检查镜头内手臂、服装和肩膀的轮廓。"],
    prompt: ["A fictional athlete slowly raises both forearms into a strength pose. Keep the outfit and camera fixed with soft side light.", "虚构运动员缓缓抬起两只前臂摆出力量姿势，保持服装和镜头不变，使用柔和侧光。"],
    next: "image"
  }
} satisfies Record<string, VideoGuide>;

export type VideoGuidePath = keyof typeof videoGuides;

export function isVideoGuidePath(path: string): path is VideoGuidePath {
  return Object.hasOwn(videoGuides, path);
}

export function guideTranslation(copy: Translation, locale: Locale) {
  return copy[locale === "zh-CN" ? 1 : 0];
}

export function videoGuideMetadata(path: VideoGuidePath, locale: Locale): Metadata {
  const guide = videoGuides[path];
  return {
    title: guideTranslation(guide.title, locale),
    description: guideTranslation(guide.summary, locale),
    alternates: {
      canonical: localizePath(path, locale),
      languages: { ...alternateLanguagesForPath(path), "x-default": path }
    }
  };
}
