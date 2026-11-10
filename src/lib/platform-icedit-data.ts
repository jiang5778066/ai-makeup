import type { GeneratorState } from './platform-generator-parameters';
import type { Locale } from './i18n';

export const iceditPath = '/tools/icedit-ai-image-editor';
export const iceditSource = 'https://www.lantaai.com/tools/icedit-ai-image-editor';
export const iceditModels = ['icedit'] as const;
// 共享会话的路径联合尚未集成本页；只做类型适配，运行时保留本页完整身份。
const sessionPath = iceditPath as GeneratorState['path'];
export function initializeIcedit(query = ''): GeneratorState {
  const q = new URLSearchParams(query);
  return { path: sessionPath, model: q.get('model') ?? 'icedit', mode: (q.get('mode') ?? q.get('tab') ?? 'image') as GeneratorState['mode'], prompt: '', parameters: {}, issues: [] };
}
export function restoreIcedit(state: GeneratorState): GeneratorState {
  return { ...state, path: sessionPath, parameters: {}, issues: [] };
}
export const icedItConfig = (state: Pick<GeneratorState, 'model' | 'mode'>) => state.model === 'icedit' && state.mode === 'image' ? { max: 1, accept: 'image/*', maxBytes: 10 * 1024 * 1024, localByteLimit: true } : undefined;
export const selectIcedit = (state: GeneratorState): GeneratorState => ({ ...restoreIcedit(state), model: 'icedit', mode: 'image' });
export const iceditPrompts = [
  ['🌅 Change the background to a stunning sunset', '🌅 将背景换成绚丽的日落'],
  ["✍️ Add text 'Hello World' in bold golden letters", '✍️ 添加金色粗体文字“Hello World”'],
  ['🎨 Make the colors more vibrant and alive', '🎨 让色彩更鲜活明亮'],
  ['🗑️ Remove the background completely', '🗑️ 完全移除背景'],
  ['📸 Add a vintage film filter effect', '📸 添加复古胶片滤镜效果'],
  ['⚫ Convert to dramatic black and white', '⚫ 转为富有戏剧感的黑白照片'],
  ['💡 Add cinematic dramatic lighting', '💡 添加电影般的戏剧光效'],
  ['🖼️ Transform into an oil painting style', '🖼️ 转换为油画风格'],
];
export const iceditFeatures = [
  ['Smart Text Editor', 'Add, edit, or remove text with natural language commands. Create stunning typography instantly.', '智能文字编辑', '用自然语言添加、编辑或移除文字，快速完成文字排版。'],
  ['Color Transformation', 'Change colors, moods, and atmospheres with simple prompts. AI understands your creative vision.', '色彩转换', '用简单提示词改变色彩、情绪和氛围，表达你的创意构想。'],
  ['Advanced Compositing', 'Seamlessly blend images, remove backgrounds, and create complex compositions effortlessly.', '进阶合成', '融合图像、移除背景，尝试更丰富的画面组合。'],
  ['Lightning Speed', 'Get professional results in seconds. Our optimized AI processes images faster than ever.', '快速处理', '原站介绍：优化的 AI 可在数秒内处理图像并呈现专业效果。'],
  ['Universal Compatibility', 'Works flawlessly on any device or platform. No downloads, no installations required.', '跨设备使用', '通过浏览器使用，无需下载或安装。'],
  ['Instant Sharing', 'Export in any format and share directly to social platforms. Professional quality guaranteed.', '便捷分享', '原站介绍：导出图像并分享到社交平台。'],
];
export const iceditCreators = [
  ['📱', 'Social Media Magic', 'Create viral content that stops the scroll. Perfect posts, stories, and ads in seconds.', '社交媒体创作', '制作吸引目光的帖子、动态和广告内容。'],
  ['🛍️', 'E-commerce Excellence', 'Professional product photos that sell. Remove backgrounds, enhance colors, add text.', '电商商品展示', '移除商品背景、增强色彩、添加文字，完善商品图片。'],
  ['📊', 'Marketing Mastery', 'Eye-catching campaigns that convert. Banners, ads, and promotional content made easy.', '营销创意', '制作醒目的横幅、广告和推广内容。'],
  ['🎨', 'Personal Projects', 'Bring your memories to life. Family photos, artistic creations, and personal masterpieces.', '个人项目', '为家庭照片、艺术创作和私人纪念注入新意。'],
];
export const iceditFaq = ['🆓 Is ICEdit really free to use?', '🤖 How does the AI image editor with prompt work?', '📁 What image formats does ICEdit support?', '🍎 Does ICEdit work on Mac computers?', '💼 Can I use ICEdit for commercial projects?', '🎯 How accurate is the AI image editing?', '🔒 Is my data safe when using ICEdit?', '⚡ Can I edit multiple images at once?'];
export const iceditRelated = [
  ['/tools/image-to-image-ai', 'Image To Image AI', '图生图 AI'],
  ['/ai-image-generator', 'AI Image Generator', 'AI 图片生成器'],
  ['/image-style-converter', 'Image to Ghibli Style', '图片转吉卜力风格'],
  ['/tools/ai-graffiti-generator', 'AI Graffiti Generator', 'AI 涂鸦生成器'],
  ['/tools/ai-animal-generator', 'AI Animal Generator', 'AI 动物生成器'],
  ['/tools/ai-image-to-video', 'AI Image to Video', 'AI 图片转视频'],
];
export const iceditText = (locale: Locale, en: string, zh: string) => locale === 'zh-CN' ? zh : en;
