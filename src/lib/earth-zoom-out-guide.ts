export const earthZoomOutGuide = {
  en: {
    title: "Earth Zoom Out Prompt and Storyboard",
    description: "Plan an Earth zoom out from a lighthouse to orbit. Copy a short pullback prompt and learn how to fix sudden jumps, drifting landmarks, and shifting light.",
    intro: "An Earth zoom out starts with a recognizable place and widens from ground level toward a view of the planet. Use a clear first frame, move the camera up and back, and give each change in scale enough time to read. This lighthouse storyboard gives you a short pullback to start with and a way to plan the larger reveal.",
    storyboardTitle: "Three shots from the coast to orbit",
    shots: [
      {
        shot: "Lighthouse to headland",
        motion: "Start with the lighthouse centered and the curved bay on its left. Rise and pull back until the headland and the whole bay are visible.",
        match: "Keep the bay on the same side of the lighthouse and preserve the direction of the light.",
        promptTitle: "Copy a short lighthouse pullback prompt",
        prep: "Choose a sharp landscape photo that shows the tower and enough of the bay to establish their positions. Use this prompt for shot 1. For a very short clip, end as the path and nearest part of the bay come into view.",
        prompt: "Start from the reference photo with the white lighthouse centered on the headland and the curved bay on its left. The camera rises gently and pulls straight back in one continuous move, revealing the path around the tower and more of the bay. Keep the lighthouse on the same headland, the bay on its left, and the afternoon light coming from the same direction. Keep the horizon level. End on a wider coastal view without a cut or text."
      },
      {
        shot: "Headland to coastline",
        motion: "Start from the last frame of shot 1. Continue rising until the coastline fills the wide view and the lighthouse is too small to see.",
        match: "Keep the bay in view as the anchor. Match the coastline angle to the previous frame.",
        promptTitle: "Copy a prompt for the headland-to-coastline shot",
        prep: "Use the last frame of shot 1 as the next reference. Match the curve of the bay before looking at smaller details.",
        prompt: "Begin from the reference frame with the headland and the curved bay in view. Continue rising and pulling back without turning the camera. Reveal more coastline beyond the bay. Keep the bay on the left and let the lighthouse become too small to see as the camera gains height. End on a wide view of the coast under the same afternoon light."
      },
      {
        shot: "Coastline to orbit",
        motion: "Start from a wide view of that coastline. Pull farther back until Earth's curve comes into view.",
        match: "Match the direction of travel and the lit side of the coast. Use a wider matching reference frame if the scale jump is too large.",
        promptTitle: "Copy a prompt for the coastline-to-orbit shot",
        prep: "Use a wide coastline image as the first frame. Try this final shot once the earlier shots have established the bay and the direction of travel.",
        prompt: "Begin with a wide aerial view of the coastline from the reference frame, with the curved bay on the left. Continue rising and pulling back along the same path. Let the coastline shrink gradually until Earth's curve appears above it. Keep the coast in the same orientation and the sunlight on the same side. End with the lit edge of Earth in view, with no camera roll, cuts, or text."
      }
    ],
    fixesTitle: "Fix common Earth zoom out problems",
    fixes: [
      {
        problem: "The lighthouse jumps straight to a globe.",
        fix: "Give the shot one destination. For a short shot, replace “zoom out to Earth” with “pull back until the path and the bay come into view.” Start the next shot from that wider frame."
      },
      {
        problem: "The bay switches sides or the lighthouse slides along the coast.",
        fix: "Name the landmarks you can still see at this scale. Add “the curved bay stays left of the lighthouse, and the coastline keeps its orientation.”"
      },
      {
        problem: "The horizon rolls or afternoon turns to night.",
        fix: "Remove competing camera moves. Use “rise and pull straight back, keep the horizon level, and preserve the afternoon light direction.”"
      }
    ],
    previewTitle: "Preview the timing and vertical crop",
    preview: "If you have a clip, set start and end times to see whether the wider view has time to register. For a 9:16 crop, watch the whole selection and check whether the lighthouse stays in frame before the bay takes over. The tools preview clips locally in your browser.",
    motionLabel: "Start and finish",
    matchLabel: "What to match",
    promptsTitle: "Example prompts",
    exampleNotice: "These prompts are for planning and have yet to be tested with a generation service.",
    clipLink: "Video clip preview",
    cropLink: "Landscape to portrait preview",
    imageLink: "View image-to-video settings",
    status: "Generation is currently unavailable. You can explore the image-to-video settings separately.",
    directoryLink: "Browse video effects"
  },
  "zh-CN": {
    title: "地球拉远提示词与三段分镜",
    description: "从海岬灯塔拉远到地球轨道。查看三段分镜，复制图生视频提示词，并解决镜头跳切、地标漂移和光线突变。",
    intro: "地球拉远从一个容易辨认的地点开始，镜头逐渐升高、后退，最终揭示地球。先确定首帧的地标和方位，再规划每段镜头要露出什么。可以从灯塔到海湾的一小段开始，等观众看清地点后，再拉远到海岸和地球轨道。",
    storyboardTitle: "从海岸到地球轨道的三段分镜",
    shots: [
      {
        shot: "灯塔到海岬",
        motion: "灯塔居中，弧形海湾位于画面左侧。镜头升高并后退，直到露出整个海岬和海湾。",
        match: "保持海湾在灯塔左侧，阳光方向保持一致。",
        promptTitle: "复制灯塔拉远提示词",
        prep: "选一张清晰的横图，让灯塔和海湾的位置一眼可辨。第一段可以用下方提示词。片段很短时，拉到能看到灯塔周围的小路和海湾近端即可。",
        prompt: "从参考照片开始，白色灯塔位于海岬中央，弧形海湾在灯塔左侧。镜头缓缓升高并沿直线后退，连续露出灯塔周围的小路和更多海湾。保持灯塔在同一处海岬，海湾留在灯塔左侧，午后的阳光方向保持一致。地平线保持水平。以较宽的海岸景别结束，全程不切镜，不加文字。"
      },
      {
        shot: "海岬到海岸线",
        motion: "从第一段的末帧继续升高，直到看到更长的海岸线，灯塔逐渐变小。",
        match: "用仍可辨认的弧形海湾定位，衔接前后两帧的海岸线朝向。",
        promptTitle: "复制海岬到海岸线的提示词",
        prep: "用第一段的末帧作为参考图。先看海湾的弧线能否接上，再检查小细节。",
        prompt: "从能看到海岬和弧形海湾的参考帧开始。镜头继续升高并后退，保持朝向，露出海湾以外更长的海岸线。海湾留在画面左侧，灯塔随着镜头升高逐渐小到看不见。以同样午后光线下的海岸广角画面结束。"
      },
      {
        shot: "海岸线到地球轨道",
        motion: "从能看清海岸线的广角画面继续拉远，直到露出地球弧线。",
        match: "对齐镜头移动方向和海岸受光的一侧。如果尺度跨度过大，先准备一张地貌相符、视野更广的参考帧。",
        promptTitle: "复制海岸线到轨道的提示词",
        prep: "用能看清海岸线的广角图作为首帧。等前面的镜头交代了海湾位置和移动方向，再尝试这一段。",
        prompt: "从参考帧的海岸广角俯视图开始，弧形海湾在左侧。镜头沿同一条路径继续升高、后退。海岸线逐渐变小，地球弧线随后进入画面。海岸线朝向保持一致，阳光照亮同一侧。以可见的地球受光边缘收尾，镜头不翻滚，不切镜，不加文字。"
      }
    ],
    fixesTitle: "三种常见问题怎么修",
    fixes: [
      {
        problem: "灯塔一下跳成了地球。",
        fix: "给当前镜头设定一个终点。短片可以把「拉远到地球」换成「后退到露出小路和海湾」，再用较宽的末帧开启下一段。"
      },
      {
        problem: "海湾换了边，或者灯塔沿海岸滑动。",
        fix: "写明当前景别还能看见的地标。加上「弧形海湾保持在灯塔左侧，海岸线朝向保持一致」。"
      },
      {
        problem: "地平线开始倾斜，或者午后突然变成夜景。",
        fix: "删掉互相冲突的镜头动作。用「镜头升高并直线后退，地平线保持水平，午后的光线方向保持一致」。"
      }
    ],
    previewTitle: "回放检查节奏和竖屏构图",
    preview: "手头有片段时，可以设置起止时间，检查拉远后是否留了足够时间让观众看清海湾。做 9:16 竖屏预览时，回放整个选段，看灯塔在海湾成为主体前是否一直留在画框里。两个工具都在浏览器里本地预览。[视频选段预览](https://www.framekoi.com/zh-CN/ai-video-editor) ·",
    motionLabel: "起点和终点",
    matchLabel: "衔接时保留什么",
    promptsTitle: "创作示例提示词",
    exampleNotice: "这些提示词用于分镜和创作规划，尚未经过实际生成验证。",
    clipLink: "视频选段预览",
    cropLink: "横屏转竖屏预览",
    imageLink: "查看图生视频参数",
    status: "生成服务暂未开放。你可以单独查看图生视频参数。",
    directoryLink: "浏览视频特效"
  }
};
