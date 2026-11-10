import type{WanGeneratorPath}from'./platform-generator-data';
import{generatorPages}from'./platform-generator-data';
import{initializeGenerator,generatorConfig,normalizePageParameters,generatorModel,wanDurationGated,type GeneratorState}from'./platform-generator-parameters';
import{generatorSelectionKey}from'./platform-generator-session';
export type WanPath=WanGeneratorPath|'/ai-video-models/wan-fusionX';
export const wanPaths:readonly WanPath[]=['/ai-video-models/wan-2-2','/ai-video-models/wan-2-5','/ai-video-models/wan-2-6','/ai-video-models/wan-3-0','/ai-video-models/wan-fusionX'];
export function isWanPath(path:string):path is WanPath{return wanPaths.includes(path as WanPath)}
export const wanPages={
 '/ai-video-models/wan-2-2':{form:true,name:'Wan 2.2',family:'split'},
 '/ai-video-models/wan-2-5':{form:true,name:'Wan 2.5',family:'audio'},
 '/ai-video-models/wan-2-6':{form:true,name:'Wan 2.6',family:'story'},
 '/ai-video-models/wan-3-0':{form:true,name:'Wan 3.0',family:'omni'},
 '/ai-video-models/wan-fusionX':{form:false,name:'Wan FusionX',family:'fusion'},
}as const;
const queryParameters=['duration','resolution','ratio','sound','multishot']as const;
export function wanSelectionKey(path:WanPath,query:string){const q=new URLSearchParams(query.split('#')[0]);return JSON.stringify([generatorSelectionKey(path,query),...queryParameters.map(k=>q.get(k))]);}
export function initializeWan(path:WanGeneratorPath,query:string):GeneratorState{
 const state=initializeGenerator(path,query),config=generatorConfig(state),q=new URLSearchParams(query.split('#')[0]);const parameters={...state.parameters},issues=[...state.issues];
 if(state.model.startsWith('wan-3-0')){if(!q.has('sound'))parameters.sound=true;if(!q.has('resolution')&&state.model==='wan-3-0')parameters.resolution='720P';}
 for(const key of queryParameters){const raw=q.get(key);if(raw===null)continue;const invalid=()=>issues.push(`wan-query-invalid:${key}`),unsupported=()=>issues.push(`wan-query-unsupported:${key}`);
  if(key==='duration'){if(!/^(0|[1-9]\d*)$/.test(raw)||!Number.isSafeInteger(Number(raw))){invalid();continue}const n=Number(raw);if(!config||!(config.durationRange?n>=config.durationRange[0]&&n<=config.durationRange[1]:config.durations?.includes(n))){unsupported();continue}if(n!==5&&wanDurationGated(state,n)){issues.push('wan-query-gated:duration');continue}parameters.duration=n;}
  else if(key==='sound'||key==='multishot'){if(raw!=='true'&&raw!=='false'){invalid();continue}if(!config?.[key]){unsupported();continue}parameters[key]=raw==='true';}
  else{const allowed=key==='ratio'?config?.ratios:config?.resolutions;if(!allowed?.includes(raw)){unsupported();continue}parameters[key]=raw;}
 }
 const model=generatorModel(state.model);return{...state,parameters:model?normalizePageParameters(path,model,state.mode,parameters):{},issues};
}
export function normalizeWanState(state:GeneratorState):GeneratorState{const model=generatorModel(state.model);return model?{...state,parameters:normalizePageParameters(state.path,model,state.mode,state.parameters)}:state;}
export function wanTitle(path:WanPath,locale:'en'|'zh-CN'){return path==='/ai-video-models/wan-fusionX'?(locale==='zh-CN'?'FusionX AI 视频生成器：公开模型介绍':'FusionX AI Video Generator: Public Model Guide'):generatorPages[path].title[locale];}
export type WanText={en:string;'zh-CN':string};
export type WanGallery='landscape-badge'|'portrait-title';
export type WanBlock={gallery?:WanGallery;heading:WanText;intro?:WanText;items?:{title?:WanText;time?:WanText;text:WanText;media?:string;list?:WanText[]}[];kind:'cards'|'features'|'steps'|'capabilities'|'table'|'related'|'cta'|'text';rows?:WanText[][]};
export type WanContent={hero:WanText;description:WanText;heroMedia?:string;blocks:WanBlock[];faq:{question:WanText;answer:WanText}[]};
export const wanContent:Record<WanPath,WanContent>={
  "/ai-video-models/wan-2-2": {
    "hero": {
      "en": "Wan 2.2 AI Video Generator — Public Guide",
      "zh-CN": "Wan 2.2 AI 视频生成器：公开模型介绍"
    },
    "description": {
      "en": "Lanta AI describes Wan 2.2 as an advanced, fast online tool for creators, developers, and innovators. This project provides a local parameter preview; generation is not available.",
      "zh-CN": "Lanta AI 公开介绍 Wan 2.2 兼顾速度、细节与易用性，适合创作者、开发者与创意团队。本项目仅提供本地参数预览，生成暂不可用。"
    },
    "heroMedia": "https://cdn.lantaai.com/resources/005959e2-d86f-46a8-bd41-4de89e520bd0.mp4",
    "blocks": [
      {
        "heading": {
          "en": "Examples of Wan 2.2 Videos",
          "zh-CN": "Wan 2.2 视频案例"
        },
        "intro": {
          "en": "Explore sample clips generated with Wan 2.2 to see cinematic lighting, portrait animation, and motion-rich scenes in action.",
          "zh-CN": "查看由 Wan 2.2 生成的示例片段，直观感受它在电影感布光、人物动画与复杂动态场景中的表现。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Lighting & Motion Focus",
              "zh-CN": "光影与运动表现"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/c73916e8-d2c5-409b-87e3-bcae824447c8.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Portrait Animation",
              "zh-CN": "人像动态演绎"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/6a78e105-bc6c-4375-af75-b7f3ec8e9349.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Dynamic Motion",
              "zh-CN": "高动态场景"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/bb56e50f-ea21-481e-9f0a-0cbc599dd8ca.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Realistic Animation",
              "zh-CN": "写实动画效果"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/bb9f6901-2fca-4992-804e-455a62b6457e.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Nature Scene Animation",
              "zh-CN": "自然场景动画"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/005959e2-d86f-46a8-bd41-4de89e520bd0.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Underwater Light Play",
              "zh-CN": "水下光影氛围"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/f7967310-c419-46d3-8d5a-cbf714ef70e4.mp4",
            "list": []
          }
        ],
        "gallery": "landscape-badge"
      },
      {
        "heading": {
          "en": "How to Use the Wan 2.2 AI Video Generator",
          "zh-CN": "如何使用 Wan 2.2 AI 视频生成器"
        },
        "intro": {
          "en": "At capture time, the Lanta AI page described the following three-step Wan 2.2 workflow without technical setup. Generation is not available in this project.",
          "zh-CN": "Lanta AI 参照页面在采集时介绍了以下无需专业技术背景的三步 Wan 2.2 流程。本项目生成尚未开放。"
        },
        "kind": "steps",
        "items": [
          {
            "title": {
              "en": "Step 1: Upload",
              "zh-CN": "步骤 1：上传"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Start by adding an image or a prompt. The Wan 2.2 AI Video Generator supports multiple formats and automatically optimizes them for the best result. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：你可以上传参考图片，也可以直接输入文字描述。Wan 2.2 支持多种输入方式，并会自动优化生成条件。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Step 2: AI Processing",
              "zh-CN": "步骤 2：AI 处理"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: The service’s AI analyzes your input, understands the scene, and generates smooth motion with realistic lighting and expression details. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：系统会分析你的场景意图，生成更自然的动作、光影与表情细节，帮助画面更接近最终成片。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Step 3: Download Video",
              "zh-CN": "步骤 3：下载视频"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: When the video is ready, preview it instantly and download the final clip in high quality. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：生成完成后可立即预览，并下载高质量成片用于继续编辑、发布或分享。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Wan 2.2 Features",
          "zh-CN": "Wan 2.2 功能亮点"
        },
        "intro": {
          "en": "The Lanta AI reference page described Wan 2.2 generation quality and an online workflow at capture time; the service capabilities below are not verified or connected here.",
          "zh-CN": "以下是 Lanta AI 参照页面在采集时介绍的 Wan 2.2 生成质量与在线工作流，非本项目已验证或接入的服务能力。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Advanced Deep Learning Technology",
              "zh-CN": "先进的深度学习能力"
            },
            "text": {
              "en": "Wan 2.2 uses advanced neural networks to create motion-rich animations that mimic human behavior and emotional nuance. It understands context, scene depth, and lighting for hyper-realistic results.",
              "zh-CN": "Wan 2.2 基于先进神经网络生成富有动感的画面，能更好理解人物动作、情绪细节、场景层次与光照关系，输出更具真实感的视频。"
            },
            "media": "",
            "list": [
              {
                "en": "✓Real-time facial tracking",
                "zh-CN": "✓实时面部细节追踪"
              },
              {
                "en": "✓Natural body movement synthesis",
                "zh-CN": "✓自然的人体动作合成"
              },
              {
                "en": "✓High-resolution rendering",
                "zh-CN": "✓高分辨率画面渲染"
              }
            ]
          },
          {
            "title": {
              "en": "Simple & Intuitive Interface",
              "zh-CN": "界面直观，上手轻松"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: The Wan 2.2 online workspace is built for ease of use. Upload your material, adjust your prompt, and let the AI handle the heavy lifting. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：Wan 2.2 的在线工作区注重易用性。上传素材、调整提示词后即可开始生成，把复杂过程交给 AI 处理。"
            },
            "media": "",
            "list": [
              {
                "en": "✓Drag-and-drop uploads",
                "zh-CN": "✓支持拖拽上传"
              },
              {
                "en": "✓Smart video preview",
                "zh-CN": "✓智能视频预览"
              },
              {
                "en": "✓Instant download or sharing",
                "zh-CN": "✓可立即下载或分享"
              }
            ]
          },
          {
            "title": {
              "en": "Fast Generation",
              "zh-CN": "生成速度快"
            },
            "text": {
              "en": "At capture time, the Lanta AI page claimed Wan 2.2 could deliver videos in as little as 30 seconds, with cloud processing, instant preview and download. These speed claims are not verified here; this project does not provide Wan generation.",
              "zh-CN": "Lanta AI 参照页面在采集时宣称 Wan 2.2 最快约 30 秒产出成片，并列出云端处理、即时预览和下载。本项目未验证这些速度说法，尚未提供 Wan 生成。"
            },
            "media": "",
            "list": [
              {
                "en": "✓30-second video creation",
                "zh-CN": "✓约 30 秒即可生成视频"
              },
              {
                "en": "✓High-speed cloud AI processing",
                "zh-CN": "✓高速云端 AI 处理"
              },
              {
                "en": "✓Instant preview and download",
                "zh-CN": "✓支持即时预览与下载"
              }
            ]
          },
          {
            "title": {
              "en": "Advanced Privacy & Data Security",
              "zh-CN": "隐私与数据安全"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Wan 2.2 is built with privacy in mind. Uploaded files are encrypted, processed in the cloud, and removed automatically after generation. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称，其上传文件经过加密、在云端处理，并在生成后自动删除，下列条目也是其隐私说明。本项目未验证该外部加密、删除或合规机制，不能将这些说法当作本项目安全保证。"
            },
            "media": "",
            "list": [
              {
                "en": "Lanta AI claim at capture: End-to-end encrypted file transfer",
                "zh-CN": "Lanta AI 采集时说法：端到端加密传输"
              },
              {
                "en": "Lanta AI claim at capture: Automatic deletion after processing",
                "zh-CN": "Lanta AI 采集时说法：处理完成后自动删除"
              },
              {
                "en": "Lanta AI claim at capture: GDPR-aligned system design",
                "zh-CN": "Lanta AI 采集时说法：系统设计符合 GDPR 理念"
              }
            ]
          },
          {
            "title": {
              "en": "Superior Video Quality",
              "zh-CN": "更高的视频画质"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Even the free experience delivers clear high-definition results. Premium plans unlock sharper output, richer effects, and more cinematic rendering. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：即使是免费体验，也能获得清晰的高清输出。升级后可解锁更锐利的细节、更丰富的效果以及更强的电影感渲染。"
            },
            "media": "",
            "list": [
              {
                "en": "✓Full HD output for lifelike detail",
                "zh-CN": "✓Full HD 输出，细节更逼真"
              },
              {
                "en": "✓Smooth motion at 30 fps",
                "zh-CN": "✓30 fps 流畅运动"
              },
              {
                "en": "✓Professional-grade color enhancement",
                "zh-CN": "✓专业级色彩增强"
              }
            ]
          },
          {
            "title": {
              "en": "Effortless Sharing Options",
              "zh-CN": "分享更省事"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Share your AI-generated videos in one click. Publish to social platforms, send them in chat, or use a generated link for quick distribution. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：AI 生成视频完成后，你可以一键分享至常见平台，也可以直接下载文件或生成链接快速分发。"
            },
            "media": "",
            "list": [
              {
                "en": "✓One-click publishing to popular platforms",
                "zh-CN": "✓一键发布到主流平台"
              },
              {
                "en": "✓Instant file download for personal use",
                "zh-CN": "✓支持即时下载保存"
              },
              {
                "en": "✓Shareable links for quick distribution",
                "zh-CN": "✓可生成分享链接快速传播"
              }
            ]
          }
        ]
      },
      {
        "heading": {
          "en": "Why Choose Wan 2.2?",
          "zh-CN": "为什么选择 Wan 2.2？"
        },
        "intro": {
          "en": "At capture time, the Lanta AI page presented these Wan 2.2 benefits for prototyping and content creation. These are external service claims, not project performance or privacy guarantees.",
          "zh-CN": "Lanta AI 参照页面在采集时列出以下面向创意验证与内容制作的 Wan 2.2 优势；这些是外部服务说法，非本项目性能或隐私保证。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Fast Online Processing",
              "zh-CN": "在线处理效率高"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Generate results in minutes. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：几分钟内即可看到结果。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Ultra-Realistic Visuals",
              "zh-CN": "视觉表现更逼真"
            },
            "text": {
              "en": "AI trained on human motion and expression.",
              "zh-CN": "模型更擅长还原人物动作与表情。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Privacy-Focused",
              "zh-CN": "以隐私保护为前提"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: All data is encrypted and auto-deleted. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时宣称数据加密及处理后自动删除；本项目未验证这些外部隐私措施。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Explore Wan models",
          "zh-CN": "探索 Wan 模型"
        },
        "intro": {
          "en": "Compare Wan video workflows and explore Wan FusionX as a related option.",
          "zh-CN": "比较 Wan 视频创作流程，并了解 Wan FusionX 这一相关选择。"
        },
        "kind": "related",
        "items": [
          {
            "title": {
              "en": "Wan 2.6",
              "zh-CN": "Wan 2.6"
            },
            "text": {
              "en": "Create text or image videos and explore multi-shot image-to-video storytelling.",
              "zh-CN": "了解文生/图生视频与图生多镜头叙事。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 3.0",
              "zh-CN": "Wan 3.0"
            },
            "text": {
              "en": "Explore text, image and multimodal reference workflows.",
              "zh-CN": "探索文字、图片及多模态参考工作流。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 2.5",
              "zh-CN": "Wan 2.5"
            },
            "text": {
              "en": "Compare short text-to-video and image-to-video workflows with audio options.",
              "zh-CN": "比较短片文生/图生与音频选项。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan FusionX",
              "zh-CN": "Wan FusionX"
            },
            "text": {
              "en": "Explore the Wan FusionX page alongside other Wan video workflows.",
              "zh-CN": "了解Wan FusionX和相关Wan视频资料。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "What is Wan 2.2 and what can it do?",
          "zh-CN": "Wan 2.2 是什么？可以做什么？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Wan 2.2 is an advanced AI video generation model that can transform text prompts and images into high-quality videos in seconds. It works well for both personal creativity and professional production. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：Wan 2.2 是一款先进的 AI 视频生成模型，可以将文字提示词和图片快速转换为高质量视频，适合个人创作，也适合专业制作流程。"
        }
      },
      {
        "question": {
          "en": "Is Wan 2.2 free to use?",
          "zh-CN": "Wan 2.2 可以免费使用吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Yes. You can try Wan 2.2 for free with core features. Paid plans offer higher resolution, faster processing, and expanded generation options. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：可以。你可以免费体验 Wan 2.2 的核心功能。付费方案则提供更高分辨率、更快处理速度和更丰富的生成选项。"
        }
      },
      {
        "question": {
          "en": "Can I use Wan 2.2 without technical skills?",
          "zh-CN": "没有技术背景也能使用 Wan 2.2 吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Yes. Upload your source material or enter a prompt, choose your direction, and let Wan 2.2 handle the generation workflow. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：可以。你只需上传素材或输入提示词，选择创作方向，剩下的生成流程交给 Wan 2.2 即可。"
        }
      },
      {
        "question": {
          "en": "How is Wan 2.2 different from other AI video generators?",
          "zh-CN": "Wan 2.2 和其他 AI 视频生成器有什么不同？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Wan 2.2 stands out through strong motion synthesis, more natural facial expression rendering, and efficient cloud infrastructure that helps it produce realistic-looking results quickly. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：Wan 2.2 的优势在于更强的动作合成、更自然的人脸表情呈现，以及高效的云端基础设施，因此能更快输出真实感更强的视频结果。"
        }
      },
      {
        "question": {
          "en": "Can I use Wan 2.2 online without downloading anything?",
          "zh-CN": "我可以直接在线使用 Wan 2.2，而不下载任何软件吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Yes. Wan 2.2 runs fully in your browser. Upload files or enter a prompt, and the processing happens in the cloud. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：可以。Wan 2.2 完全在浏览器中运行。你只需上传文件或输入提示词，实际处理过程都会在云端完成。"
        }
      },
      {
        "question": {
          "en": "Is this the same as Alibaba Wan 2.2?",
          "zh-CN": "这里的 Wan 2.2 和阿里巴巴的 Wan 2.2 是同一个吗？"
        },
        "answer": {
          "en": "Wan 2.2 draws on the wider model ecosystem associated with Alibaba's open-source work, while this page refers to the standalone online creation experience available on Lanta AI.",
          "zh-CN": "Wan 2.2 与阿里巴巴开源模型生态相关，但本页介绍的是 Lanta AI 提供的在线创作体验，而不是原始模型仓库本身。"
        }
      },
      {
        "question": {
          "en": "How long does Wan 2.2 take to generate a video?",
          "zh-CN": "Wan 2.2 生成一个视频通常要多久？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: With cloud acceleration, many videos are ready in about 3 to 5 minutes, depending on resolution, prompt complexity, and queue load. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：在云端加速下，很多视频大约 3 到 5 分钟即可完成。具体时长会受到分辨率、提示词复杂度和队列负载影响。"
        }
      },
      {
        "question": {
          "en": "Is it safe to use?",
          "zh-CN": "使用 Wan 2.2 安全吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time that uploads were encrypted and stored securely during processing, with privacy protections built into its workflow. These external safeguards are not verified by this project; they are not a security guarantee from Makeup AI. Wan generation is not connected here.",
          "zh-CN": "Lanta AI 参照页面在采集时称，其上传内容会在处理期间加密存储，并内置隐私保护机制。本项目未验证这些外部措施，这不是 Makeup AI 对加密、存储或安全性的保证；Wan 生成尚未接入。"
        }
      }
    ]
  },
  "/ai-video-models/wan-2-5": {
    "hero": {
      "en": "Wan 2.5 AI Video Generator",
      "zh-CN": "Wan 2.5 AI 视频生成器"
    },
    "description": {
      "en": "Wan 2.5, an Alibaba Wan video model, is now available on Lanta AI. Turn text, images, and audio into cinematic videos with synchronized sound, natural motion, and precise lip sync. Effortlessly bring characters and scenes to life for talking videos, music performances, product promotion, or social media content.",
      "zh-CN": "Wan 2.5 是阿里巴巴 Wan 系列视频模型。公开资料介绍了文字、图片与音频结合的音画同步、自然动作和口型控制，可用于对话、音乐表演、产品展示与社交内容。本项目提供参数及本地预览，生成尚未开放。"
    },
    "blocks": [
      {
        "heading": {
          "en": "Get Inspired by Wan 2.5 on Lanta AI",
          "zh-CN": "探索 Lanta AI 上的 Wan 2.5 创作灵感"
        },
        "intro": {
          "en": "",
          "zh-CN": "从公开示例了解不同题材的画面与动作。这些不是本项目生成或账户作品。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "",
              "zh-CN": ""
            },
            "text": {
              "en": "Amusement Park Popcorn Selfie",
              "zh-CN": "游乐园爆米花自拍"
            },
            "media": "https://cdn.lantaai.com/resources/d0daa17d-f5e1-46cf-96a3-b4679d023906/v1/19ae5ea7-abc7-4268-9779-582f5a6f33cc%20(1)/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "",
              "zh-CN": ""
            },
            "text": {
              "en": "Puppy Weightlifting",
              "zh-CN": "小狗举重"
            },
            "media": "https://cdn.lantaai.com/resources/58bbb5d1-d201-45fa-88cf-3da744d0fac5/v1/lantaai%20(6)/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "",
              "zh-CN": ""
            },
            "text": {
              "en": "Poppy Garden Portrait",
              "zh-CN": "罂粟花园人像"
            },
            "media": "https://cdn.lantaai.com/resources/be9c7cbc-9a64-476d-b3fd-b7713320cb25/v1/939ae914-e2e9-4fb8-9234-99cbc2516dfe/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "",
              "zh-CN": ""
            },
            "text": {
              "en": "Underwater Dolphin Selfie",
              "zh-CN": "水下与海豚自拍"
            },
            "media": "https://cdn.lantaai.com/resources/45645c29-5eff-45f6-85f5-f382d0fa2966/v1/7dbab478-d8bc-4941-abe1-fdee773c5b0a/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "",
              "zh-CN": ""
            },
            "text": {
              "en": "Streetwear on a Giant Soda Can",
              "zh-CN": "巨型汽水罐上的街头穿搭"
            },
            "media": "https://cdn.lantaai.com/resources/_source/70a84dee-5409-4275-9a67-c6f77e225cbb/6f6b342d-272f-4643-a4af-253b2c5674b1.mp4",
            "list": []
          },
          {
            "title": {
              "en": "",
              "zh-CN": ""
            },
            "text": {
              "en": "Woman Riding a Giant Mushroom",
              "zh-CN": "骑着巨型蘑菇的女子"
            },
            "media": "https://cdn.lantaai.com/resources/_source/b391b30e-a990-488a-ae1d-4369d0184d91/lantaai%20(5).mp4",
            "list": []
          },
          {
            "title": {
              "en": "",
              "zh-CN": ""
            },
            "text": {
              "en": "Floating Pastry Hot Air Balloon",
              "zh-CN": "漂浮的糕点热气球"
            },
            "media": "https://cdn.lantaai.com/resources/_source/5260682d-5942-4a9a-8f54-cbc292327686/f79c59fe-c771-49ae-9a05-c2c965e234dd.mp4",
            "list": []
          },
          {
            "title": {
              "en": "",
              "zh-CN": ""
            },
            "text": {
              "en": "Arctic Fox in Snow",
              "zh-CN": "雪地北极狐"
            },
            "media": "https://cdn.lantaai.com/resources/_source/dac2c9e2-f929-4465-9991-d2ae0e75b193/eac22e38-61fe-4d1d-8c05-7ced10a69903.mp4",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "What Makes Wan 2.5 Different",
          "zh-CN": "Wan 2.5 有何不同"
        },
        "intro": {
          "en": "Wan 2.5 goes beyond basic video generation with native audio, audio-driven performance, automatic sound, precise lip sync, and better visual consistency, giving you more control from prompt to final video.",
          "zh-CN": "Wan 2.5 的公开资料强调原生音频、音频驱动表演、自动声音、精确口型与视觉一致性，便于从提示词控制画面与声音。"
        },
        "kind": "capabilities",
        "items": [
          {
            "title": {
              "en": "1. Native Audio-Video Generation",
              "zh-CN": "1. 原生音画生成"
            },
            "text": {
              "en": "Wan 2.5 generates video and synchronized audio together, combining visuals, dialogue, music, ambience, and sound effects in one process to reduce separate audio generation and post-production work.",
              "zh-CN": "公开资料介绍Wan 2.5可同时生成画面、对话、音乐、环境声与音效，减少单独生成音频及后期配音的工作。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "2. Audio-Driven Video",
              "zh-CN": "2. 音频驱动视频"
            },
            "text": {
              "en": "Wan 2.5 can use uploaded voice, dialogue, music, or other audio to drive character performance, helping movements and lip sync follow the sound for more natural talking, singing, and music videos.",
              "zh-CN": "上传的声音、对话或音乐可用于引导角色表演，让动作与口型跟随音频，适用于讲话、演唱和音乐视频。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "3. Native Lip Sync",
              "zh-CN": "3. 原生口型同步"
            },
            "text": {
              "en": "Wan 2.5 synchronizes character lip movements with speech and singing, making dialogue and performances feel more natural without requiring a separate lip-sync tool or additional editing.",
              "zh-CN": "角色嘴唇动作可与说话和歌唱同步，不必另用口型工具或在后期手动匹配。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "4. Automatic Sound Generation",
              "zh-CN": "4. 自动声音生成"
            },
            "text": {
              "en": "Wan 2.5 can automatically create voices, ambient sound, music, and sound effects that match the scene, helping creators produce more complete videos without manually finding and layering audio tracks.",
              "zh-CN": "可按场景生成声音、环境音、音乐与音效，减少人工寻找音轨和分层混音。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "5. Prompt-Controlled Dialogue & Sound",
              "zh-CN": "5. 提示词控制对话与声音"
            },
            "text": {
              "en": "Wan 2.5 lets you describe dialogue, speaking style, music, ambience, and sound effects directly in the prompt, giving you more control over both how a scene looks and how it sounds.",
              "zh-CN": "可在提示词里描述台词、说话方式、音乐、氛围及音效，同时控制画面与声音。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "6. Stronger Instruction Following",
              "zh-CN": "6. 更强的指令遵循"
            },
            "text": {
              "en": "Wan 2.5 follows detailed instructions for actions, camera movement, dialogue, sound, and composition more accurately, helping creators get closer to the intended result with fewer generations and prompt revisions.",
              "zh-CN": "更细致地遵循动作、镜头、对话、声音和构图要求，减少反复生成与修改提示词。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "7. Stronger Image-to-Video Consistency",
              "zh-CN": "7. 更稳定的图生视频"
            },
            "text": {
              "en": "Wan 2.5 animates images while better preserving character appearance, composition, lighting, and visual identity, making it easier to add natural motion without losing important details from the original image.",
              "zh-CN": "添加自然动作时尽量保留人物外观、构图、光线与视觉身份，避免丢失原图的重要细节。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "8. 1080P + 10s + 30fps Synchronized Video",
              "zh-CN": "8. 1080P、10秒、30fps同步视频"
            },
            "text": {
              "en": "Wan 2.5 generates synchronized videos up to 1080P, 10 seconds, and 30fps, providing smoother, longer, higher-quality clips that are more practical for ads, social media, and character content.",
              "zh-CN": "公开规格包含最高1080P、10秒和30fps的同步音画，面向广告、社交和角色内容；本项目不提供生成。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Comparison: Wan 2.2 vs. Wan 2.5 vs. Wan 2.7 vs. Wan 3.0",
          "zh-CN": "对比：Wan 2.2、Wan 2.5、Wan 2.7 与 Wan 3.0"
        },
        "intro": {
          "en": "",
          "zh-CN": ""
        },
        "kind": "table",
        "items": [],
        "rows": [
          [
            {
              "en": "Capability",
              "zh-CN": "能力"
            },
            {
              "en": "Wan 2.2",
              "zh-CN": "Wan 2.2"
            },
            {
              "en": "Wan 2.5",
              "zh-CN": "Wan 2.5"
            },
            {
              "en": "Wan 2.7",
              "zh-CN": "Wan 2.7"
            },
            {
              "en": "Wan 3.0",
              "zh-CN": "Wan 3.0"
            }
          ],
          [
            {
              "en": "Model Positioning",
              "zh-CN": "模型定位"
            },
            {
              "en": "Open video foundation",
              "zh-CN": "开放视频基础模型"
            },
            {
              "en": "Audio-visual generation",
              "zh-CN": "音画生成"
            },
            {
              "en": "Controlled cinematic generation",
              "zh-CN": "可控电影感生成"
            },
            {
              "en": "All-in-One multimodal creation",
              "zh-CN": "一体化多模态创作"
            }
          ],
          [
            {
              "en": "Text → Video",
              "zh-CN": "文生视频"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "Image → Video",
              "zh-CN": "图生视频"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "First Frame",
              "zh-CN": "首帧"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "First + Last Frame",
              "zh-CN": "首尾帧"
            },
            {
              "en": "✅ Separate model",
              "zh-CN": "✅ 独立模型"
            },
            {
              "en": "—",
              "zh-CN": "—"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "Reference → Video",
              "zh-CN": "参考转视频"
            },
            {
              "en": "Dedicated model / later capability",
              "zh-CN": "专用模型/后续能力"
            },
            {
              "en": "—",
              "zh-CN": "—"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅ Unified",
              "zh-CN": "✅ 统一"
            }
          ],
          [
            {
              "en": "Document → Video",
              "zh-CN": "文档转视频"
            },
            {
              "en": "❌",
              "zh-CN": "❌"
            },
            {
              "en": "❌",
              "zh-CN": "❌"
            },
            {
              "en": "❌",
              "zh-CN": "❌"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "Video Editing",
              "zh-CN": "视频编辑"
            },
            {
              "en": "Basic generation control",
              "zh-CN": "基础生成控制"
            },
            {
              "en": "Improved prompt control",
              "zh-CN": "改进提示词控制"
            },
            {
              "en": "Strong reference & video control",
              "zh-CN": "参考与视频控制"
            },
            {
              "en": "Unified multimodal control",
              "zh-CN": "统一多模态控制"
            }
          ],
          [
            {
              "en": "Native Audio",
              "zh-CN": "原生音频"
            },
            {
              "en": "❌ Core T2V / I2V are silent",
              "zh-CN": "❌ 基础文生/图生无声"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅ Enabled by default",
              "zh-CN": "✅ 默认启用"
            }
          ],
          [
            {
              "en": "Video Duration",
              "zh-CN": "视频时长"
            },
            {
              "en": "5s",
              "zh-CN": "5s"
            },
            {
              "en": "10s",
              "zh-CN": "10s"
            },
            {
              "en": "15s",
              "zh-CN": "15s"
            },
            {
              "en": "30s",
              "zh-CN": "30s"
            }
          ],
          [
            {
              "en": "Resolution",
              "zh-CN": "分辨率"
            },
            {
              "en": "1080P",
              "zh-CN": "1080P"
            },
            {
              "en": "1080P",
              "zh-CN": "1080P"
            },
            {
              "en": "1080P",
              "zh-CN": "1080P"
            },
            {
              "en": "1080P",
              "zh-CN": "1080P"
            }
          ],
          [
            {
              "en": "Frame Rate",
              "zh-CN": "帧率"
            },
            {
              "en": "30fps",
              "zh-CN": "30fps"
            },
            {
              "en": "30fps",
              "zh-CN": "30fps"
            },
            {
              "en": "30fps",
              "zh-CN": "30fps"
            },
            {
              "en": "30fps",
              "zh-CN": "30fps"
            }
          ],
          [
            {
              "en": "Key Innovation",
              "zh-CN": "主要特点"
            },
            {
              "en": "MoE + cinematic quality",
              "zh-CN": "MoE与电影感画质"
            },
            {
              "en": "Native Audio",
              "zh-CN": "原生音频"
            },
            {
              "en": "Multishot + R2V + control",
              "zh-CN": "多镜头、参考视频与控制"
            },
            {
              "en": "All-in-One + Omni-Reference + 30s + Documents",
              "zh-CN": "一体化、全模态参考、30秒与文档"
            }
          ]
        ]
      },
      {
        "heading": {
          "en": "Key Features of Wan 2.5",
          "zh-CN": "Wan 2.5 的核心功能"
        },
        "intro": {
          "en": "",
          "zh-CN": ""
        },
        "kind": "features",
        "items": [
          {
            "title": {
              "en": "Turn Photos into Talking or Singing Videos with Precise Lip Sync",
              "zh-CN": "把照片变成口型同步的说话或唱歌视频"
            },
            "text": {
              "en": "With Wan 2.5 image-to-video generation, users can turn a single character image into a speaking or singing video with mouth movements synchronized to the audio. This makes it easier to create AI presenters, singing characters, virtual avatars, and dialogue scenes without using a separate lip-sync tool or manually matching speech in post-production.",
              "zh-CN": "Wan 2.5图生视频公开示例展示从单张角色图片生成说话或唱歌表演，嘴部动作与音频同步。它面向AI讲解者、歌唱角色、虚拟形象与对话场景，可减少另用口型工具和后期匹配语音的步骤。"
            },
            "media": "https://cdn.lantaai.com/resources/d3756ffc-90c6-45d7-b48e-19be11608f62/v1/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%8819%E6%97%A5%2006_20_16%20(8)/w1440.webp",
            "list": []
          },
          {
            "title": {
              "en": "Create More Stable Motion in Focused Single-Shot Scenes",
              "zh-CN": "在明确的单镜头场景中保持稳定动作"
            },
            "text": {
              "en": "Wan 2.5 performs particularly well when a scene has one clear subject, a defined composition, and one or two primary movements, helping faces, poses, and scene structure remain more stable from frame to frame. This makes it well suited for product shots, character close-ups, conversations, portrait animation, and short cinematic moments where consistency matters more than complex multi-scene action.",
              "zh-CN": "画面中只有一个清晰主体、明确构图和一两个主要动作时，面部、姿态和场景更容易保持稳定。产品镜头、角色特写、对话、人像动画与短暂电影场景更适合这种方式；复杂多场景动作仍需谨慎。"
            },
            "media": "https://cdn.lantaai.com/resources/54ce0129-335f-4df5-ae7f-1b299c9d0497/v1/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%8819%E6%97%A5%2006_20_16%20(7)/w1440.webp",
            "list": []
          },
          {
            "title": {
              "en": "Keep Character Details Stable When Animating Images",
              "zh-CN": "动画化图片时保留角色细节"
            },
            "text": {
              "en": "Wan 2.5 image-to-video generation is designed to preserve the subject’s appearance, framing, lighting, perspective, and overall composition while adding movement. This helps creators animate portraits, anime characters, mascots, products, or artwork without unnecessarily changing the visual identity of the original image, making the result more usable for branded and character-focused videos.",
              "zh-CN": "公开资料说明该模型旨在保留主体外观、取景、光照、透视和整体构图，同时加入动作。适合肖像、动漫人物、吉祥物、产品与插画，尽量保持原图的品牌和角色身份。"
            },
            "media": "https://cdn.lantaai.com/resources/afb837c4-5011-4ae9-bcc9-d457cbcbeb5c/v1/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%8819%E6%97%A5%2006_20_15%20(4)/w1440.webp",
            "list": []
          },
          {
            "title": {
              "en": "Generate Dialogue, Music, Ambience, and Sound Effects Together",
              "zh-CN": "一起生成对话、音乐、环境声与音效"
            },
            "text": {
              "en": "Wan 2.5 can automatically generate voices, background music, environmental ambience, and sound effects based on what happens in the scene. A talking character can receive matching speech, while streets, weather, or other environments can receive contextual sound, reducing the need to search for separate audio assets and manually build a soundtrack after the video is generated.",
              "zh-CN": "可按场景生成声音、背景音乐、环境氛围和音效。说话人物可匹配语音，街道与天气可匹配环境声，从而减少单独寻找音频素材和手工制作配乐的步骤。"
            },
            "media": "https://cdn.lantaai.com/resources/638a2dde-8819-45f9-860e-2d51e85f9104/v1/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%8819%E6%97%A5%2006_20_14%20(2)/w1440.webp",
            "list": []
          },
          {
            "title": {
              "en": "Create 10-Second 1080P Videos with Synchronized Sound",
              "zh-CN": "创建带同步声音的10秒1080P视频"
            },
            "text": {
              "en": "Wan 2.5 supports video generation up to 10 seconds, 1080P, and 30fps, with synchronized audio available for both text-to-video and image-to-video workflows. The longer duration and high-resolution output give creators more room for complete actions, dialogue, product moments, and social media scenes without having to assemble several very short generations.",
              "zh-CN": "公开规格为最高10秒、1080P、30fps，文字与图片流程均可包含同步音频。更长时长为完整动作、对话、产品片段和社交场景提供空间；此处展示资料，生成仍不可用。"
            },
            "media": "https://cdn.lantaai.com/resources/8e55bcae-a676-432f-b0e7-d21e458dd93e/v1/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%8819%E6%97%A5%2006_20_14%20(1)/w1440.webp",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Pros of Wan 2.5 Video",
          "zh-CN": "Wan 2.5 视频的优势"
        },
        "intro": {
          "en": "Wan 2.5 combines flexible text and image generation with synchronized audio, stronger motion control, and high-resolution output for complete short-form video creation.",
          "zh-CN": "公开资料将文生视频、图片动画、同步音频、动作控制和高分辨率组合为短视频创作流程。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Text & Image to Video",
              "zh-CN": "文字与图片生成视频"
            },
            "text": {
              "en": "Create videos from a written prompt or animate a still image while controlling the subject, action, visual style, and camera movement you want.",
              "zh-CN": "从文字描述或静态图片开始，说明主体、动作、视觉风格和镜头运动。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Synchronized Audio",
              "zh-CN": "同步音频"
            },
            "text": {
              "en": "Generate dialogue, ambient sound, music, and sound effects together with the visuals so key sounds follow what happens on screen more naturally.",
              "zh-CN": "对话、环境声、音乐和音效可随画面一起生成，让关键声音更贴合场景。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Audio-Driven Performance",
              "zh-CN": "音频驱动表演"
            },
            "text": {
              "en": "Use voice, dialogue, songs, or music to guide lip movement and character performance, making talking, singing, and music-driven videos easier to create.",
              "zh-CN": "用声音、对话、歌曲或音乐引导口型和人物表演，适合讲话与歌唱内容。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "5- and 10-Second Clips",
              "zh-CN": "5秒与10秒片段"
            },
            "text": {
              "en": "Choose a 5- or 10-second duration for quick concepts, character performances, product moments, ads, and social media content without stitching multiple clips together.",
              "zh-CN": "公开表单列出5秒和10秒，可用于概念、角色、产品、广告与社交内容；当前参照会话点击时长有会员提示。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Output up to 1080P",
              "zh-CN": "最高1080P输出"
            },
            "text": {
              "en": "Generate videos in 480P, 720P, or up to 1080P depending on whether you are testing an idea or preparing a sharper final video for publishing.",
              "zh-CN": "公开画质选项为480P、720P和1080P，可按测试想法或最终发布的清晰度需求选择。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Multiple Aspect Ratios",
              "zh-CN": "多种画幅比例"
            },
            "text": {
              "en": "Create square 1:1, vertical 9:16, widescreen 16:9, and other supported formats for TikTok, Reels, Shorts, ads, presentations, and social platforms.",
              "zh-CN": "文生模式支持1:1方形、9:16竖屏和16:9宽屏，面向短视频、广告、演示与社交平台。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "How to Use Wan 2.5 Video on Lanta AI",
          "zh-CN": "如何在 Lanta AI 使用 Wan 2.5"
        },
        "intro": {
          "en": "The Lanta AI reference page stated at capture time: Create a Wan 2.5 AI video on Lanta AI in three simple steps. Add your prompt or image, choose your video settings, then generate a synchronized short video ready to preview and use. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "参照流程分为添加文字或图片、选择参数、生成并下载三步。本项目只能预览前两步的参数，生成未接入。"
        },
        "kind": "steps",
        "items": [
          {
            "title": {
              "en": "Step 1: Add Your Image or Prompt",
              "zh-CN": "第1步：添加图片或提示词"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Write a prompt describing the subject, action, camera movement, mood, dialogue, or sound you want, or upload a source image to turn it into a video. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：描述主体、动作、镜头、情绪、台词或声音，或添加一张源图作为动画起点。本项目文件仅在本机预览。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Step 2: Select Wan 2.5",
              "zh-CN": "第2步：选择Wan 2.5"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Choose Wan 2.5, then set your preferred 5- or 10-second duration, aspect ratio, resolution, and other available generation settings. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "查看时长、画幅、画质与其他已公开参数。当前参照会员门槛会保留原选项，不在本项目购买或解锁。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Step 3: Generate and Download",
              "zh-CN": "第3步：生成与下载"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Click Generate and let Wan 2.5 create your video. Preview the completed result, then download it for social media, advertising, character content, or your next project. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "参照流程在生成后预览并下载，用于社交、广告或角色内容。本项目生成未开放；可预览和下载标明来源的公开示例。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Explore Wan models",
          "zh-CN": "探索 Wan 模型"
        },
        "intro": {
          "en": "Compare Wan video workflows and explore Wan FusionX as a related option.",
          "zh-CN": "比较Wan系列视频工作流，了解相关的Wan FusionX资料。"
        },
        "kind": "related",
        "items": [
          {
            "title": {
              "en": "Wan 2.6",
              "zh-CN": "Wan 2.6"
            },
            "text": {
              "en": "Create text or image videos and explore multi-shot image-to-video storytelling.",
              "zh-CN": "了解文生/图生视频与图生多镜头叙事。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 3.0",
              "zh-CN": "Wan 3.0"
            },
            "text": {
              "en": "Explore text, image and multimodal reference workflows.",
              "zh-CN": "探索文字、图片及多模态参考工作流。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 2.2",
              "zh-CN": "Wan 2.2"
            },
            "text": {
              "en": "Animate a single image for motion studies and scene previews.",
              "zh-CN": "了解单图动画、动作研究和场景预览。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan FusionX",
              "zh-CN": "Wan FusionX"
            },
            "text": {
              "en": "Explore the Wan FusionX page alongside other Wan video workflows.",
              "zh-CN": "了解Wan FusionX和相关Wan视频资料。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Is Wan 2.5 AI video generator free to use?",
          "zh-CN": "Wan 2.5 AI 视频生成器可以免费使用吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Yes. You can try Wan 2.5 on Lanta AI with free credits before paying for more generations. New Lanta AI users receive 40 credits to get started, so you can test prompts, image-to-video results, motion, and audio before upgrading. Wan 2.5 is not an unlimited free model, so longer videos and higher-resolution generations require more credits. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "参照Lanta AI采用积分试用和付费套餐，公开答案提到新用户40积分；这不是本项目额度。本项目保留现有美妆真实3次试用，Wan 2.5生成尚未开放，不扣积分。"
        }
      },
      {
        "question": {
          "en": "Is Wan 2.5 open source?",
          "zh-CN": "Wan 2.5 是开源模型吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: No. Wan 2.5 has not been officially released with downloadable open-source model weights. Unlike Wan 2.2, which has an open-source version available for local deployment, Wan 2.5 is currently provided mainly through cloud-based services. On Lanta AI, you can use Wan 2.5 AI video directly online without downloading models. This records that page’s position at capture time, not a current official release or a capability verified by this project. Generation is not connected here.",
          "zh-CN": "Lanta AI 参照页面在采集时称，Wan 2.5 尚未正式公开可下载的开源权重，主要通过云端服务提供；与已有可本地部署开源版本的 Wan 2.2 不同。其页面介绍可通过浏览器在线使用，无需下载模型。这是当时的外部说法，不代表最新官方发布状态；本项目不提供权重或推理服务。"
        }
      },
      {
        "question": {
          "en": "Can I run Wan 2.5 locally?",
          "zh-CN": "我能在本地运行 Wan 2.5 吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Not as a fully local model. Wan 2.5's official model weights are not publicly available, so it cannot currently be downloaded and run completely offline like Wan 2.2. Some tools expose Wan 2.5 through API-based nodes, but the generation still happens in the cloud. Lanta AI removes this setup work by letting you access Wan 2.5 directly from your browser. This records that page’s position at capture time, not a current official release or a capability verified by this project. Generation is not connected here.",
          "zh-CN": "Lanta AI 参照页面在采集时称，Wan 2.5 官方权重尚未公开，因而不能像 Wan 2.2 一样下载后完全离线运行。有些工具通过 API 节点调用 Wan 2.5，但生成仍在云端执行；Lanta AI 则提供浏览器访问流程。这是外部服务说明，本项目没有部署该推理后端。"
        }
      },
      {
        "question": {
          "en": "How do I use Wan 2.5 AI Video Generator?",
          "zh-CN": "如何使用 Wan 2.5 AI 视频生成器？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Choose Wan 2.5 in Lanta AI, then start with either a text prompt or an image. For text-to-video, describe the subject, scene, action, camera movement, visual style, and sound you want. For image-to-video, upload your starting image and focus mainly on what should move and how the camera should move. Then choose your video settings and generate your clip. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "公开流程是添加文字或图片、选Wan 2.5并设置时长、比例和画质，再生成、预览和下载。本项目只提供本地参数与文件预览，不提交生成。"
        }
      },
      {
        "question": {
          "en": "Does Wan 2.5 support image-to-video generation?",
          "zh-CN": "Wan 2.5 支持图生视频吗？"
        },
        "answer": {
          "en": "Yes. Wan 2.5 supports both text-to-video and image-to-video generation. Upload an image to Lanta AI and describe the motion you want, such as a character turning toward the camera, hair moving in the wind, fabric reacting naturally, or the camera slowly pushing forward. Because the image already defines the subject, composition, and style, shorter motion-focused prompts usually work better than describing the entire image again.",
          "zh-CN": "公开表单支持从一张图片开始，配合提示词描述动作、镜头与声音，尽量保留角色外观、构图和光照。本项目可以本地预览参考图片。"
        }
      },
      {
        "question": {
          "en": "Does Wan 2.5 generate audio and lip sync?",
          "zh-CN": "Wan 2.5 可以生成声音并同步口型吗？"
        },
        "answer": {
          "en": "Yes. Wan 2.5 can generate synchronized video and audio, including dialogue, ambient sound, sound effects, and background audio. It can also work with audio input for audio-driven video generation. Lip sync is useful for simple speaking scenes, but exact word-level synchronization is not always perfect, especially when several characters speak in the same clip. For more reliable results, keep dialogue short and clearly specify who is speaking and who remains silent.",
          "zh-CN": "Lanta AI 参照页面在采集时称，Wan 2.5 可同步生成视频和声音，包括对白、环境声、音效及背景音，也支持音频输入驱动视频。口型同步适合简单说话场景，但逐词同步不总是完全准确，尤其是同一片段有多个角色说话时。建议保持短对白，并明确谁在说话、谁保持静默。这些是外部服务的说明，本项目未验证，也未接入该生成功能。"
        }
      },
      {
        "question": {
          "en": "How long can Wan 2.5 AI videos be?",
          "zh-CN": "Wan 2.5 视频可以有多长？"
        },
        "answer": {
          "en": "Wan 2.5 officially supports 5-second and 10-second video generation. For a 10-second clip, focus on one clear action or continuous scene instead of packing several complicated shots and scene changes into one prompt. If you need stronger multi-shot storytelling or longer sequences, newer Wan models are generally better suited to that workflow.",
          "zh-CN": "公开表单列出5秒与10秒。本轮公开会话点击这两个选项均出现会员提示并保持5秒；本项目保留该可观察门槛，不提供付费解锁或实际生成。"
        }
      },
      {
        "question": {
          "en": "Does Wan 2.5 support 1080p video?",
          "zh-CN": "Wan 2.5 支持1080P吗？"
        },
        "answer": {
          "en": "Yes. Wan 2.5 supports up to 1080p video output, along with lower-resolution options for faster testing. A practical workflow is to test your prompt and motion at a lower resolution first, then generate the final version in higher quality once the movement, framing, and timing look right. Lanta AI supports high-quality video output without requiring a local GPU.",
          "zh-CN": "公开参数包含480P、720P与1080P。这里可以选择画质参数，但这不代表本项目已提供相应分辨率的视频生成。"
        }
      },
      {
        "question": {
          "en": "How do I write a good Wan 2.5 prompt?",
          "zh-CN": "怎样写好 Wan 2.5 提示词？"
        },
        "answer": {
          "en": "For text-to-video, use a clear structure: Subject + Scene + Motion + Camera + Style + Audio. Instead of writing “a cinematic woman walking,” describe exactly what happens: “A woman in a red coat slowly walks toward the camera while rain falls around her. The camera tracks backward at eye level with soft neon reflections and distant traffic sounds.” For image-to-video, simplify the prompt and focus on Motion + Camera Movement, since the uploaded image already provides the visual details.",
          "zh-CN": "明确描述主体、动作、场景、镜头和声音，短片尽量聚焦一个主要动作。若要对话，给出简短台词和语气；图生时说明哪些外观和构图需要保留。"
        }
      },
      {
        "question": {
          "en": "Wan 2.5 vs Veo 3: which is better for AI video?",
          "zh-CN": "Wan 2.5 和 Veo 3 哪个更好？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: It depends on what you are creating. Veo 3 is especially strong for realistic audiovisual scenes, dialogue, and multi-speaker interactions, while Wan 2.5 is a strong option for 10-second clips, image-to-video generation, expressive camera movement, and audio-video creation. If dialogue accuracy is the priority, Veo 3 may be the better choice. If you want to animate an existing image or create longer single-scene shots, Wan 2.5 is often a better fit. Lanta AI lets you access multiple AI video models, so you can choose the model that best matches each project. This records that page’s position at capture time, not a current official release or a capability verified by this project. Generation is not connected here.",
          "zh-CN": "Lanta AI 参照页面在采集时建议按任务选择：Veo 3 擅长写实音画、对白和多人对话，优先追求对白准确性时可考虑它；Wan 2.5 适合10秒片段、图生视频、有表现力的镜头运动及音画创作，已有图片动画化或较长单场景镜头可考虑它。该比较是外部页面的选择依据，并非本项目性能实测；两者均未接入生成。"
        }
      }
    ]
  },
  "/ai-video-models/wan-2-6": {
    "hero": {
      "en": "Wan 2.6 AI Video Generator",
      "zh-CN": "Wan 2.6 AI 视频生成器"
    },
    "description": {
      "en": "Wan 2.6 on Lanta AI turns a prompt or one starting image into a 5, 10, or 15-second clip. Choose 720P or 1080P, keep the camera move continuous, or use Multi-shot in image mode when the scene needs a cut.",
      "zh-CN": "公开Wan 2.6表单从文字或一张起始图探索5、10或15秒视频，提供720P/1080P及图生多镜头选项。此处为模型资料与本地参数预览，视频生成尚未开放。"
    },
    "blocks": [
      {
        "heading": {
          "en": "What You Can Do with Wan 2.6 on Lanta AI",
          "zh-CN": "Wan 2.6 可以用于哪些场景"
        },
        "intro": {
          "en": "Choose the input that matches the job. Text mode builds a new scene from a description. Image mode starts from one frame and adds a Multi-shot control for planned cuts.",
          "zh-CN": "根据任务选择输入。文生模式按描述创建新场景；图生模式从一张图片开始，并可用Multi-shot安排切镜。"
        },
        "kind": "features",
        "items": [
          {
            "title": {
              "en": "Build a Short Sequence from One Image",
              "zh-CN": "从一张图片构建短序列"
            },
            "text": {
              "en": "Turn on Multi-shot when one frame needs to become a short sequence. Describe each shot in order—a wide view, a close-up, then a reaction—and repeat the subject and setting details that must carry across the cut. Leave it off for a push-in, orbit, or other continuous move.",
              "zh-CN": "需要把一帧扩展为短序列时开启Multi-shot，按顺序描述广角、特写和反应，并重复需要跨镜头保持的人物与环境细节。若只需推进、环绕或连续运镜则关闭。"
            },
            "media": "https://static.aiimagetovideos.com/resources/579dfd9c-d50e-4a0f-95cb-92092fcf511c/v1/wan2-6-video-1/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Start from Text or One Image",
              "zh-CN": "从文字或一张图片开始"
            },
            "text": {
              "en": "Use Wan 2.6 Text to Video when the composition can be invented from scratch. Use Image to Video when a face, product, outfit, or framing already matters. In image mode, upload one clean frame and describe what should move: the subject, the camera, and the background.",
              "zh-CN": "构图可以自由创造时用文生；面孔、产品、服装或取景已确定时用图生。选择干净清晰的一帧，说明主体、镜头与背景分别如何运动。"
            },
            "media": "https://static.aiimagetovideos.com/resources/591565b0-1799-4051-b284-c3921ce1f308/v1/wan2-6-video-2/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Write Dialogue and Sound into the Scene",
              "zh-CN": "把台词与声音写进场景"
            },
            "text": {
              "en": "Put one short spoken line, a background sound, or a clear sound effect in the prompt. A 5-second clip has room for one simple sound beat; use 10 or 15 seconds when the dialogue also needs a pause or reaction.\n\nThe Wan 2.6 form on Lanta AI does not include an audio upload or a separate sound switch.",
              "zh-CN": "在提示词中加入一句简短台词、背景声音或清晰音效。5秒适合一个简单声音节拍；需要停顿或反应时，公开资料建议10或15秒。该表单没有音频上传或独立声音开关。"
            },
            "media": "https://static.aiimagetovideos.com/resources/a88c94f5-b0d6-4f7a-9ffd-1f85cda8f446/v1/wan2-6-video-3/w1280.mp4",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Wan 2.6 Settings Available on Lanta AI",
          "zh-CN": "Lanta AI 上的 Wan 2.6 参数"
        },
        "intro": {
          "en": "At capture time, the Lanta AI page described the controls and credit estimates below. This project previews parameters only; generation and credit spending are not connected.",
          "zh-CN": "以下为 Lanta AI 参照页面在采集时介绍的控件与积分预估。本项目仅预览参数，尚未接入生成或积分扣费。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Input modes",
              "zh-CN": "输入模式"
            },
            "text": {
              "en": "Text prompt or one image\n\nBuild a scene from text, or animate a single starting frame.",
              "zh-CN": "文字提示或一张图片\n\n根据文字构建新场景，或让一张起始图产生动作。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Clip length",
              "zh-CN": "片段长度"
            },
            "text": {
              "en": "5, 10, or 15 seconds\n\nUse 5 seconds for one action and 10–15 seconds when the scene needs a setup and payoff.",
              "zh-CN": "5、10或15秒\n\n5秒适合单个动作；10—15秒可容纳铺垫与结果。当前参照会话存在会员门槛。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Resolution",
              "zh-CN": "分辨率"
            },
            "text": {
              "en": "720P or 1080P\n\nAt capture time, the Lanta AI form displayed a credit estimate for the selected length and resolution. No Wan generation or credit charge is available here.",
              "zh-CN": "720P 或 1080P\n\nLanta AI 参照表单在采集时按所选时长和分辨率显示积分预估；本项目没有 Wan 生成或扣费。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Framing",
              "zh-CN": "画幅"
            },
            "text": {
              "en": "16:9, 9:16, or 1:1 in text mode\n\nImage to Video follows the composition of the uploaded frame, so crop the source first.",
              "zh-CN": "文生模式16:9、9:16或1:1\n\n图生沿用源图构图，应先裁好起始图片。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Shot structure",
              "zh-CN": "镜头结构"
            },
            "text": {
              "en": "Continuous or Multi-shot\n\nThe Multi-shot switch is available in Image to Video and is off by default.",
              "zh-CN": "连续镜头或Multi-shot\n\nMulti-shot仅在图生模式出现，所见默认关闭。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Sound",
              "zh-CN": "声音"
            },
            "text": {
              "en": "Dialogue, ambience, and effects\n\nDescribe sound in the prompt. This form does not include a separate audio upload.",
              "zh-CN": "台词、环境声与音效\n\n在提示词描述声音，表单没有单独音频上传。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Text to Video or Image to Video: Which One Should You Use?",
          "zh-CN": "文生视频还是图生视频：如何选择？"
        },
        "intro": {
          "en": "The choice depends on whether the starting composition already matters. Pick the mode first, then write the prompt around what that input gives Wan 2.6.",
          "zh-CN": "选择取决于起始构图是否需要保留。先确定模式，再按输入提供的信息组织提示词。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Wan 2.6 Text to Video",
              "zh-CN": "Wan 2.6 文生视频"
            },
            "text": {
              "en": "Best for: A new scene where you do not need to preserve an existing face, product, or composition.\n\nStart with: A description of the subject, action, setting, camera move, and sound.\n\nControls on this page: Choose 16:9, 9:16, or 1:1, plus 5, 10, or 15 seconds at 720P or 1080P.\n\nWatch for: Too many characters, location changes, or camera instructions can turn one short clip into competing ideas.",
              "zh-CN": "适合：不需要保留既有面孔、产品或构图的新场景。\n\n起点：描述主体、动作、环境、运镜和声音。\n\n控件：16:9、9:16或1:1；5、10、15秒；720P或1080P。\n\n注意：短片里堆积人物、地点变化和镜头要求会让多个想法互相竞争。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Wan 2.6 Image to Video",
              "zh-CN": "Wan 2.6 图生视频"
            },
            "text": {
              "en": "Best for: Animating a product shot, portrait, character design, or scene whose look is already established.\n\nStart with: One sharp, well-framed image with room around the subject for the planned movement.\n\nControls on this page: Choose 5, 10, or 15 seconds, 720P or 1080P, and turn Multi-shot on only when the clip needs a cut.\n\nWatch for: Cropped hands, tiny text, crowded edges, and aggressive camera moves make shape and identity harder to preserve.",
              "zh-CN": "适合：已有视觉身份的产品、人像、角色或场景。\n\n起点：一张清晰、构图完整且给动作留有空间的图片。\n\n控件：时长、720P/1080P；需要切镜时才开启Multi-shot。\n\n注意：被裁掉的手、小字、拥挤边缘和激烈运镜会让形状与身份更难保持。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "How to Make a Wan 2.6 Video on Lanta AI",
          "zh-CN": "如何在 Lanta AI 制作 Wan 2.6 视频"
        },
        "intro": {
          "en": "",
          "zh-CN": ""
        },
        "kind": "steps",
        "items": [
          {
            "title": {
              "en": "Choose text or image",
              "zh-CN": "选择文字或图片"
            },
            "text": {
              "en": "Use Text to Video for a scene built from scratch. Use Image to Video when you already have the face, product, setting, or framing you want. The image workflow accepts one starting image.",
              "zh-CN": "从头创建场景时用文生；已有面孔、产品、环境或取景时用图生，图生入口只接受一张起始图片。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Describe action before style",
              "zh-CN": "先描述动作，再描述风格"
            },
            "text": {
              "en": "Name the subject, the action, the camera move, and any sound. For Multi-shot, write Shot 1, Shot 2, and Shot 3 in order; for a continuous clip, describe one camera move and one main action.",
              "zh-CN": "说明主体、动作、镜头和声音。多镜头依次写Shot 1/2/3；连续片段只描述一个镜头运动和一个主要动作。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Pick the length and check the result",
              "zh-CN": "选择长度并检查结果"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Choose 5, 10, or 15 seconds and 720P or 1080P. Review the credit cost shown in the form, then generate. Check subject continuity, cut timing, object shape, and audio before rewriting the prompt. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "公开表单列出5、10、15秒和720P/1080P。参照生成后应检查身份连续性、切镜时机、形状和音频；本项目生成未开放。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "How to Structure a 15-Second Wan 2.6 Multi-Shot Prompt",
          "zh-CN": "如何组织15秒 Wan 2.6 多镜头提示词"
        },
        "intro": {
          "en": "A useful multi-shot sequence is one scene with a beginning, an action, and an ending—not three unrelated images. This example keeps the same person and location across every cut.\n\nImage to Video · 15 seconds · Multi-shot on\n\nStarting image: one person in a yellow raincoat standing beside a harbor in daylight.",
          "zh-CN": "有用的多镜头应是同一场景的开头、动作与结尾，而不是三张无关图片。此公开示例保持同一人物和地点。\n\n图生视频 · 15秒 · Multi-shot开启\n\n起始图片：白天，一名穿黄色雨衣的人站在港口旁。"
        },
        "kind": "text",
        "items": [
          {
            "title": {
              "en": "Establish the place",
              "zh-CN": "交代地点"
            },
            "text": {
              "en": "Wide shot. The person in the yellow raincoat stands beside the harbor and watches a small boat approach. Keep the camera steady.",
              "zh-CN": "广角。穿黄色雨衣的人站在港口旁，看着一艘小船驶近。镜头保持稳定。"
            },
            "media": "",
            "list": [],
            "time": {
              "en": "0–4 seconds",
              "zh-CN": "0—4秒"
            }
          },
          {
            "title": {
              "en": "Give the scene one action",
              "zh-CN": "一个明确动作"
            },
            "text": {
              "en": "Cut to a medium shot. The same person raises one hand to wave as the boat moves closer. Keep the raincoat, daylight, and harbor unchanged.",
              "zh-CN": "切到中景。同一个人抬手挥动，小船继续靠近。雨衣、白天光线与港口保持不变。"
            },
            "media": "",
            "list": [],
            "time": {
              "en": "4–10 seconds",
              "zh-CN": "4—10秒"
            }
          },
          {
            "title": {
              "en": "End on the reaction",
              "zh-CN": "以反应结束"
            },
            "text": {
              "en": "Cut closer and hold as the person smiles. Add quiet water and distant boat sounds. Do not introduce a new location or another character.",
              "zh-CN": "切近并停留，人物露出微笑。加入轻微水声和远处船声，不换地点，不加入新人物。"
            },
            "media": "",
            "list": [],
            "time": {
              "en": "10–15 seconds",
              "zh-CN": "10—15秒"
            }
          },
          {
            "title": {
              "en": "Keep the three shots connected",
              "zh-CN": "让三个镜头彼此连接"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "",
            "list": [
              {
                "en": "Repeat the yellow raincoat, harbor, and daylight wherever continuity matters.",
                "zh-CN": "在连续性重要的地方重复黄色雨衣、港口和白天光线。"
              },
              {
                "en": "Give each shot one action instead of stacking several movements together.",
                "zh-CN": "每个镜头只安排一个动作，不要堆叠多种运动。"
              },
              {
                "en": "Use the last shot for the payoff and hold it long enough to read.",
                "zh-CN": "用最后一个镜头呈现结果，并停留足够时间让观众看清。"
              },
              {
                "en": "If the character changes across cuts, reduce the sequence to two shots before changing resolution.",
                "zh-CN": "如果切镜后人物变化，先减为两个镜头，再考虑调整分辨率。"
              }
            ]
          }
        ]
      },
      {
        "heading": {
          "en": "If the First Wan 2.6 Result Misses the Brief",
          "zh-CN": "如果第一次 Wan 2.6 结果偏离要求"
        },
        "intro": {
          "en": "Change one variable at a time. Keep the source image and most of the prompt fixed so you can tell which edit improved the next version.",
          "zh-CN": "一次只改一个变量，保持源图和大部分提示词不变，才能判断哪次修改改善了结果。"
        },
        "kind": "text",
        "items": [
          {
            "title": {
              "en": "A cut appears in the middle of an action",
              "zh-CN": "动作中间突然切镜"
            },
            "text": {
              "en": "Turn Multi-shot off and ask for one continuous shot. Remove any second location, new angle, or later event that could be read as a cut.",
              "zh-CN": "关闭Multi-shot并要求连续镜头。移除第二地点、新角度或后续事件等可能被理解为切镜的描述。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "The person changes after the cut",
              "zh-CN": "切镜后人物发生变化"
            },
            "text": {
              "en": "Repeat the same clothing, hair, lighting, and location in each shot. Use two shots instead of three and keep the camera distance change modest.",
              "zh-CN": "每镜头重复服装、头发、光线与地点；改用两镜头并减小景别变化。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "The product loses its shape",
              "zh-CN": "产品失去原有形状"
            },
            "text": {
              "en": "Replace an orbit or fast turn with a slow push-in or moving light. Higher resolution preserves more detail, but it does not fix a prompt that asks the object to rotate too aggressively.",
              "zh-CN": "用慢推进或移动光线替代环绕和快速转动。更高分辨率能保留细节，却不能修复过于激烈的转动要求。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "The dialogue ends too late",
              "zh-CN": "台词结束太晚"
            },
            "text": {
              "en": "Move the line earlier, shorten it, and remove competing actions. Leave the final beat for the speaker's reaction or a steady closing frame.",
              "zh-CN": "把台词提前、缩短，并减少同时发生的动作；最后留给说话者反应或稳定收尾画面。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Explore Wan models",
          "zh-CN": "探索 Wan 模型"
        },
        "intro": {
          "en": "Compare Wan video workflows and explore Wan FusionX as a related option.",
          "zh-CN": "比较Wan系列视频工作流，了解相关的Wan FusionX资料。"
        },
        "kind": "related",
        "items": [
          {
            "title": {
              "en": "Wan 3.0",
              "zh-CN": "Wan 3.0"
            },
            "text": {
              "en": "Explore text, image and multimodal reference workflows.",
              "zh-CN": "探索文字、图片及多模态参考工作流。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 2.5",
              "zh-CN": "Wan 2.5"
            },
            "text": {
              "en": "Compare short text-to-video and image-to-video workflows with audio options.",
              "zh-CN": "比较短片文生/图生与音频选项。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 2.2",
              "zh-CN": "Wan 2.2"
            },
            "text": {
              "en": "Animate a single image for motion studies and scene previews.",
              "zh-CN": "了解单图动画、动作研究和场景预览。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan FusionX",
              "zh-CN": "Wan FusionX"
            },
            "text": {
              "en": "Explore the Wan FusionX page alongside other Wan video workflows.",
              "zh-CN": "了解Wan FusionX和相关Wan视频资料。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Can I use Wan 2.6 for free on Lanta AI?",
          "zh-CN": "可以免费使用 Lanta AI 上的 Wan 2.6 吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Wan 2.6 generation uses credits. The form shows the credit cost for the duration and resolution you select before you generate. Account access can vary, so use the displayed total as the current price rather than assuming unlimited free generations. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "参照Wan 2.6使用积分，费用按时长和画质显示，账号权限可能不同，不应假设无限免费。本项目Wan生成未开放，不购买、不扣费。"
        }
      },
      {
        "question": {
          "en": "Should I use Text to Video or Image to Video?",
          "zh-CN": "应该选择文生还是图生？"
        },
        "answer": {
          "en": "Choose Text to Video when you want Wan 2.6 to invent the whole frame from a description. Choose Image to Video when the starting composition already matters—for example, a product shot, a character design, or a portrait. Image mode also provides the Multi-shot switch on this page.",
          "zh-CN": "从头创造构图时选文生；需要保留人物、产品、服装或取景时选图生。图生从一张清晰起始图开始。"
        }
      },
      {
        "question": {
          "en": "Which durations, resolutions, and aspect ratios are available?",
          "zh-CN": "有哪些时长、画质与比例？"
        },
        "answer": {
          "en": "Wan 2.6 on Lanta AI offers 5, 10, or 15 seconds at 720P or 1080P. Text to Video offers 16:9, 9:16, and 1:1. In Image to Video, the uploaded image guides the composition, so crop it to the framing you want before generating.",
          "zh-CN": "公开表单列出5、10、15秒和720P/1080P；文生有1:1、9:16、16:9，图生采用源图构图。本轮公开会话点击时长会提示会员并保持5秒。"
        }
      },
      {
        "question": {
          "en": "What kind of image works best for Wan 2.6 Image to Video?",
          "zh-CN": "什么图片更适合 Wan 2.6 图生视频？"
        },
        "answer": {
          "en": "Use a sharp image with one clear subject, readable edges, and enough space for the planned movement. Avoid tiny text, crowded backgrounds, cropped hands, or a subject already touching the frame edge. If product shape matters, begin with a front or three-quarter view rather than an extreme angle.",
          "zh-CN": "使用清晰、光线明确、主体完整的起始图，给动作留出空间。避免小字、裁掉的手、拥挤边缘和相互遮挡的主体。"
        }
      },
      {
        "question": {
          "en": "How should I prompt a Wan 2.6 multi-shot sequence?",
          "zh-CN": "怎样组织 Wan 2.6 多镜头序列？"
        },
        "answer": {
          "en": "Write the shots in order and give each one a single job. For example: Shot 1 establishes the room; Shot 2 moves closer as the person opens a box; Shot 3 holds on the reaction. Repeat the same subject, clothing, light, and location where continuity matters.",
          "zh-CN": "按Shot 1/2/3依次给出地点、动作和反应。重复人物服装、光线和环境，每镜头只安排一个主要动作，保持同一场景连续。"
        }
      },
      {
        "question": {
          "en": "Can I upload multiple images or a reference video here?",
          "zh-CN": "这里能上传多张图片或参考视频吗？"
        },
        "answer": {
          "en": "No. This Wan 2.6 page accepts one starting image in Image to Video, or a text prompt in Text to Video. Multi-shot changes the structure of the generated clip; it does not add more upload slots.",
          "zh-CN": "本轮Wan 2.6图生表单只提供一张起始图片，不是多参考视频入口。不要把其它模型支持的数量和媒体类型套到Wan 2.6。"
        }
      },
      {
        "question": {
          "en": "Can Wan 2.6 create dialogue and sound?",
          "zh-CN": "Wan 2.6 可以产生对话和声音吗？"
        },
        "answer": {
          "en": "Wan 2.6 can generate speech, ambience, and sound effects with the video. Put the sound in the prompt and keep spoken lines short enough for the selected duration. This Lanta AI form does not accept an audio file, so describe the sound you want instead.",
          "zh-CN": "公开资料建议在提示词写台词、环境音和音效。该表单没有独立音频上传或声音开关，本项目也未接入音画生成。"
        }
      },
      {
        "question": {
          "en": "How long does a Wan 2.6 generation take?",
          "zh-CN": "生成一个 Wan 2.6 视频需要多久？"
        },
        "answer": {
          "en": "The model selector marks Wan 2.6 jobs as taking 5 minutes or more. The actual wait can change with duration, resolution, and queue load. A 15-second 1080P clip is a heavier request than a 5-second 720P draft.",
          "zh-CN": "采集时，Lanta AI 的模型选择器将 Wan 2.6 任务标注为需要5分钟或更久。实际等待时间会随时长、分辨率和队列负载变化；15秒1080P请求通常比5秒720P草稿负担更重。这是外部服务的标注，本项目未验证，也未接入该生成后端，不提供固定耗时保证、倒计时或虚构进度。"
        }
      },
      {
        "question": {
          "en": "What should I include in a Wan 2.6 prompt?",
          "zh-CN": "提示词应该包含哪些内容？"
        },
        "answer": {
          "en": "Start with four things: the subject, what it does, how the camera moves, and where the action ends. Add lighting or style after the motion is clear. If sound matters, include one spoken line or one sound cue. Avoid stacking several actions and conflicting camera directions into the same shot.",
          "zh-CN": "写清主体、动作、环境、镜头与声音。图生时描述需要运动的部分及要保持的细节；短片应减少互相竞争的要求。"
        }
      },
      {
        "question": {
          "en": "Why does the subject change or distort between shots?",
          "zh-CN": "为什么跨镜头主体会变化或变形？"
        },
        "answer": {
          "en": "Too many simultaneous changes make continuity harder. Keep the subject description, clothing, setting, and light fixed; simplify each shot to one action; and reduce aggressive camera movement. If you only need a product turn or a push-in, switch Multi-shot off and generate one continuous shot.",
          "zh-CN": "过多地点、角色、动作或大幅景别变化会增加连续性难度。重复关键外观和光线，先减少镜头与动作，再单独调整其它参数。"
        }
      }
    ]
  },
  "/ai-video-models/wan-3-0": {
    "hero": {
      "en": "Wan 3.0 AI Video Generator",
      "zh-CN": "Wan 3.0 AI 视频生成器"
    },
    "description": {
      "en": "Easily create AI videos online with Lanta AI’s Wan 3.0 video generator. Quickly turn text, images, videos, audio, documents, and webpages into videos up to 30 seconds long with native audio and multimodal reference control.",
      "zh-CN": "使用 Lanta AI 的 Wan 3.0 视频生成器，轻松在线创作 AI 视频。快速将文本、图片、视频、音频、文档和网页转换为最长 30 秒的视频，并支持原生音频和多模态参考控制。"
    },
    "blocks": [
      {
        "heading": {
          "en": "Get Inspired by Wan 3.0 on Lanta AI",
          "zh-CN": "探索 Lanta AI 上的 Wan 3.0 创作灵感"
        },
        "intro": {
          "en": "",
          "zh-CN": ""
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Viking Gets a Haircut at a Modern Barbershop",
              "zh-CN": "维京人在现代理发店剪发"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/48db8e01-6ff8-4f14-b62e-a80a7550f227/v1/5ffd1ac7-787b-45a1-b477-5e8725242ab2/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Caveman Celebrates Cereal in a Supermarket",
              "zh-CN": "穴居人在超市庆祝找到麦片"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/7639a6bc-65ef-48bb-87bc-394eaada4c7c/v1/lantaai%20(3)/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Perfume Bottle Transforms into a Crystal City",
              "zh-CN": "香水瓶变形成水晶城市"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/5ac1607f-12eb-4a3a-8b28-f292526e029d/v1/d802c3d8-ba1d-4fb3-bd22-963997134ac1/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Moon Morphs into an Eye, Coffee, Black Hole, and Vinyl",
              "zh-CN": "月亮变形成眼睛、咖啡、黑洞与唱片"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/47503067-28fd-4685-8ef3-f5fa05a9fbd2/v1/9b79808f-1826-4c12-8fee-ca7282b768a5/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Woman Steps Through a Painting into a Meadow",
              "zh-CN": "女子穿过画框进入草地"
            },
            "text": {
              "en": "",
              "zh-CN": ""
            },
            "media": "https://cdn.lantaai.com/resources/593d2089-d2cc-4fdd-8a9c-2d9863a7df4f/v1/7121af5f-55bf-4ecd-adc4-4e2fd90b6552/w1280.mp4",
            "list": []
          }
        ],
        "gallery": "portrait-title"
      },
      {
        "heading": {
          "en": "Explore the Core Capabilities of Wan 3.0",
          "zh-CN": "探索 Wan 3.0 的核心能力"
        },
        "intro": {
          "en": "At capture time, the Lanta AI page described the following Wan 3.0 capabilities: Create more complete AI videos with Wan 3.0. Use text, images, videos, audio, documents, and webpages as references, generate up to 30 seconds with native audio, and keep characters, products, scenes, and motion under greater control from start to finish. These external capabilities are not verified or connected here.",
          "zh-CN": "Lanta AI 参照页面在采集时介绍以下 Wan 3.0 能力：使用 Wan 3.0 创作更完整的 AI 视频。以文本、图片、视频、音频、文档和网页作为参考，生成最长 30 秒且带有原生音频的视频，并从头到尾更好地控制角色、产品、场景和动作。这些外部能力未经本项目验证或接入。"
        },
        "kind": "capabilities",
        "items": [
          {
            "title": {
              "en": "1. All-in-One Generation",
              "zh-CN": "1. 一体化生成"
            },
            "text": {
              "en": "Wan 3.0 uses one model for text-to-video, image-to-video, first-and-last-frame, and reference-to-video generation, reducing model switching and making the entire video creation workflow faster and simpler.",
              "zh-CN": "Wan 3.0 使用同一个模型完成文本生成视频、图片生成视频、首尾帧生成和参考生成视频，减少模型切换，让整个视频创作流程更快速、更简单。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "2. Omni-Reference",
              "zh-CN": "2. 全模态参考"
            },
            "text": {
              "en": "Wan 3.0 can use text, images, videos, audio, files, and webpages as creative references, giving the model more complete context to generate videos that better match your characters, products, style, and ideas.",
              "zh-CN": "Wan 3.0 可将文本、图片、视频、音频、文件和网页用作创作参考，为模型提供更完整的上下文，从而生成更符合角色、产品、风格和创意的视频。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "3. Document-to-Video",
              "zh-CN": "3. 文档转视频"
            },
            "text": {
              "en": "Wan 3.0 can understand presentations, documents, and business materials and turn their content directly into videos, reducing the work of manually extracting information, writing scripts, and rebuilding prompts.",
              "zh-CN": "Wan 3.0 能理解演示文稿、文档和商业资料，并将其中的内容直接转换为视频，减少手动提取信息、撰写脚本和重新构建提示词的工作。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "4. Native 30s Generation",
              "zh-CN": "4. 原生30秒生成"
            },
            "text": {
              "en": "Wan 3.0 can generate videos up to 30 seconds long in a single run, making it easier to create complete ads, stories, and multi-stage scenes without stitching together multiple short clips.",
              "zh-CN": "Wan 3.0 单次即可生成最长 30 秒的视频，无需拼接多个短片段，也能更轻松地制作完整广告、故事和多阶段场景。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "5. Native Audio",
              "zh-CN": "5. 原生音频"
            },
            "text": {
              "en": "Wan 3.0 generates visuals and audio together, helping dialogue, ambience, music, and sound effects better match the scene while reducing separate audio generation and post-production work.",
              "zh-CN": "Wan 3.0 同时生成画面和音频，让对白、环境声、音乐和音效更贴合场景，并减少单独生成音频和后期制作的工作。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "6. Multi-Reference Control",
              "zh-CN": "6. 多参考控制"
            },
            "text": {
              "en": "Wan 3.0 lets you assign different references to characters, products, motion, audio, and other elements, giving you more precise control over what appears, how it moves, and how the final video should look.",
              "zh-CN": "Wan 3.0 可为角色、产品、动作、音频及其他元素分别指定参考素材，让你更精确地控制画面中出现的内容、运动方式和最终视觉效果。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "7. 20K Creative Brief",
              "zh-CN": "7. 20K创作简报"
            },
            "text": {
              "en": "Wan 3.0 supports highly detailed prompts and creative briefs, allowing you to define scenes, actions, camera movements, audio, transitions, and storytelling more precisely for complex video projects.",
              "zh-CN": "Wan 3.0 支持高度详细的提示词和创意简报，可为复杂视频项目更精确地定义场景、动作、镜头运动、音频、转场和叙事。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "8. Adaptive Creation",
              "zh-CN": "8. 自适应创作"
            },
            "text": {
              "en": "Wan 3.0 can automatically choose a suitable video duration and aspect ratio based on your content and references, reducing setup decisions and making video generation easier for different formats and platforms.",
              "zh-CN": "Wan 3.0 可根据内容和参考素材自动选择合适的视频时长与宽高比，减少设置决策，让不同格式和平台的视频生成更加轻松。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Comparison: Wan 2.2 vs. Wan 2.5 vs. Wan 2.7 vs. Wan 3.0",
          "zh-CN": "对比：Wan 2.2、Wan 2.5、Wan 2.7 与 Wan 3.0"
        },
        "intro": {
          "en": "",
          "zh-CN": ""
        },
        "kind": "table",
        "items": [],
        "rows": [
          [
            {
              "en": "Capability",
              "zh-CN": "能力"
            },
            {
              "en": "Wan 2.2",
              "zh-CN": "Wan 2.2"
            },
            {
              "en": "Wan 2.5",
              "zh-CN": "Wan 2.5"
            },
            {
              "en": "Wan 2.7",
              "zh-CN": "Wan 2.7"
            },
            {
              "en": "Wan 3.0",
              "zh-CN": "Wan 3.0"
            }
          ],
          [
            {
              "en": "Model Positioning",
              "zh-CN": "模型定位"
            },
            {
              "en": "Open video foundation",
              "zh-CN": "开放视频基础模型"
            },
            {
              "en": "Audio-visual generation",
              "zh-CN": "音画生成"
            },
            {
              "en": "Controlled cinematic generation",
              "zh-CN": "可控电影感生成"
            },
            {
              "en": "All-in-One multimodal creation",
              "zh-CN": "一体化多模态创作"
            }
          ],
          [
            {
              "en": "Text → Video",
              "zh-CN": "文生视频"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "Image → Video",
              "zh-CN": "图生视频"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "First Frame",
              "zh-CN": "首帧"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "First + Last Frame",
              "zh-CN": "首尾帧"
            },
            {
              "en": "✅ Separate model",
              "zh-CN": "✅ 独立模型"
            },
            {
              "en": "—",
              "zh-CN": "—"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "Reference → Video",
              "zh-CN": "参考转视频"
            },
            {
              "en": "Dedicated model / later capability",
              "zh-CN": "专用模型/后续能力"
            },
            {
              "en": "—",
              "zh-CN": "—"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅ Unified",
              "zh-CN": "✅ 统一"
            }
          ],
          [
            {
              "en": "Document → Video",
              "zh-CN": "文档转视频"
            },
            {
              "en": "❌",
              "zh-CN": "❌"
            },
            {
              "en": "❌",
              "zh-CN": "❌"
            },
            {
              "en": "❌",
              "zh-CN": "❌"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            }
          ],
          [
            {
              "en": "Video Editing",
              "zh-CN": "视频编辑"
            },
            {
              "en": "Basic generation control",
              "zh-CN": "基础生成控制"
            },
            {
              "en": "Improved prompt control",
              "zh-CN": "改进提示词控制"
            },
            {
              "en": "Strong reference & video control",
              "zh-CN": "参考与视频控制"
            },
            {
              "en": "Unified multimodal control",
              "zh-CN": "统一多模态控制"
            }
          ],
          [
            {
              "en": "Native Audio",
              "zh-CN": "原生音频"
            },
            {
              "en": "❌ Core T2V / I2V are silent",
              "zh-CN": "❌ 基础文生/图生无声"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅",
              "zh-CN": "✅"
            },
            {
              "en": "✅ Enabled by default",
              "zh-CN": "✅ 默认启用"
            }
          ],
          [
            {
              "en": "Video Duration",
              "zh-CN": "视频时长"
            },
            {
              "en": "5s",
              "zh-CN": "5s"
            },
            {
              "en": "10s",
              "zh-CN": "10s"
            },
            {
              "en": "15s",
              "zh-CN": "15s"
            },
            {
              "en": "30s",
              "zh-CN": "30s"
            }
          ],
          [
            {
              "en": "Resolution",
              "zh-CN": "分辨率"
            },
            {
              "en": "1080P",
              "zh-CN": "1080P"
            },
            {
              "en": "1080P",
              "zh-CN": "1080P"
            },
            {
              "en": "1080P",
              "zh-CN": "1080P"
            },
            {
              "en": "1080P",
              "zh-CN": "1080P"
            }
          ],
          [
            {
              "en": "Frame Rate",
              "zh-CN": "帧率"
            },
            {
              "en": "30fps",
              "zh-CN": "30fps"
            },
            {
              "en": "30fps",
              "zh-CN": "30fps"
            },
            {
              "en": "30fps",
              "zh-CN": "30fps"
            },
            {
              "en": "30fps",
              "zh-CN": "30fps"
            }
          ],
          [
            {
              "en": "Key Innovation",
              "zh-CN": "主要特点"
            },
            {
              "en": "MoE + cinematic quality",
              "zh-CN": "MoE与电影感画质"
            },
            {
              "en": "Native Audio",
              "zh-CN": "原生音频"
            },
            {
              "en": "Multishot + R2V + control",
              "zh-CN": "多镜头、参考视频与控制"
            },
            {
              "en": "All-in-One + Omni-Reference + 30s + Documents",
              "zh-CN": "一体化、全模态参考、30秒与文档"
            }
          ]
        ]
      },
      {
        "heading": {
          "en": "Key Features of Wan 3.0",
          "zh-CN": "Wan 3.0 的核心功能"
        },
        "intro": {
          "en": "",
          "zh-CN": ""
        },
        "kind": "features",
        "items": [
          {
            "title": {
              "en": "Precise Video Creation with First and Last Frame Control",
              "zh-CN": "通过首尾帧控制精准创作视频"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Experience more accurate scene direction with the Wan 3.0 AI video generator described there, which supports precise first and last frame control. Simply upload one image as the opening frame and another as the ending frame, and Wan 3.0 will generate the motion, transition, and visual development between them. This makes it easier to create intro and outro sequences, product reveals, transformation videos, and short story moments with clearer creative control. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：该服务介绍的 Wan 3.0 AI 视频生成器支持精确控制首帧和尾帧，让场景导演更加准确。只需上传一张图片作为开场帧，再上传一张作为结束帧，Wan 3.0 即可生成两者之间的动作、转场和视觉发展过程。你可以更轻松地制作片头片尾、产品揭晓、变形视频和具有清晰创作控制的短故事片段。"
            },
            "media": "https://cdn.lantaai.com/resources/6bb5d114-35a4-4db3-8aef-81a7e9e91add/v1/d82514d8-4b94-428e-bed9-fb1f9087c54f/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Control Characters, Products, and Motion with Multiple References",
              "zh-CN": "使用多项参考控制角色、产品和动作"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: More than generating from a single prompt or image, the Wan 3.0 AI video generator described there lets you use multiple references to guide different parts of the video. You can provide separate images, videos, or audio references for characters, products, actions, scenes, and sounds, then describe how they should work together. This helps you build more controlled videos where the right subject, object, motion, and atmosphere appear in the right place. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：该服务介绍的 Wan 3.0 AI 视频生成器不局限于单个提示词或图片，你可以使用多项参考素材来指导视频的不同部分。为角色、产品、动作、场景和声音分别提供图片、视频或音频参考，再描述它们应如何协同呈现。这样便能更好地控制视频，让正确的主体、物体、动作和氛围出现在正确的位置。"
            },
            "media": "https://cdn.lantaai.com/resources/40c86f4d-23d1-4e39-b9d3-5e8d2ace4273/v1/c7532215-0f24-4dca-b972-da958d0995af/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Create More Natural Facial Expressions and Human Performance",
              "zh-CN": "生成更自然的面部表情和人物表演"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: The Wan 3.0 AI video generator described there can produce more lifelike facial expressions and more natural human performance in motion. Instead of relying on only basic mouth or head movement, it better captures subtle expressions, emotion changes, and the coordination between facial movement and body language. This helps character scenes feel more expressive, realistic, and engaging, especially in close-ups, dialogue scenes, and performance-driven videos. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：该服务介绍的 Wan 3.0 AI 视频生成器能够生成更逼真的面部表情和更自然的人物动作。它不只依赖基础的嘴部或头部运动，还能更好地捕捉细微表情、情绪变化以及面部动作与肢体语言之间的协调。这让特写、对话和表演驱动型视频中的角色更加生动、真实且富有感染力。"
            },
            "media": "https://cdn.lantaai.com/resources/0e6da793-e347-4f07-aa81-62107266cf78/v1/c8fa097a-0f3f-4225-b17d-9f3e0dd00372/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Generate 30-Second Videos Without Stitching Short Clips",
              "zh-CN": "生成 30 秒视频，无需拼接短片段"
            },
            "text": {
              "en": "With Wan 3.0, you can create videos up to 30 seconds long in a single generation. This gives you more room for product storytelling, scene progression, character interaction, and longer camera movement without building the result from multiple short clips. By reducing the need for extension, stitching, and transition repair, it becomes much easier to produce cleaner and more complete short-form videos.",
              "zh-CN": "使用 Wan 3.0，单次即可生成最长 30 秒的视频。无需用多个短片段拼接，也能为产品叙事、场景推进、角色互动和更长的镜头运动提供充足空间。减少续写、拼接和转场修复后，制作干净、完整的短视频变得更加轻松。"
            },
            "media": "https://cdn.lantaai.com/resources/dab4879f-44c0-4ea7-a3ac-6e440bce896e/v1/52a45d32-5521-4595-b24d-d1d8c34a9815/w1280.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Edit Videos Without Starting from Scratch",
              "zh-CN": "无需从头开始即可编辑视频"
            },
            "text": {
              "en": "Wan 3.0 makes revisions easier by supporting more flexible video editing after generation. Instead of remaking the whole clip every time, you can refine visual details, story direction, or dialogue more efficiently based on what needs to change. This is especially useful when improving a draft, adjusting a client-facing video, or testing different creative directions without losing the overall structure of the original result.",
              "zh-CN": "Wan 3.0 支持更灵活的生成后视频编辑，让修改变得更容易。你无需每次都重做整个片段，而是可以根据需要更高效地调整视觉细节、故事走向或对白。无论是优化初稿、修改面向客户的视频，还是在保留原有整体结构的同时测试不同创意方向，都非常实用。"
            },
            "media": "https://cdn.lantaai.com/resources/943c7e6f-c7fd-44a1-b7b9-253e8ff00b65/v1/4b17268a-9ac2-4cbd-8255-52d5d92a1620%20(online-video-cutter.com)/w1280.mp4",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Advantages of Wan 3.0 Video",
          "zh-CN": "Wan 3.0 视频的优势"
        },
        "intro": {
          "en": "At capture time, the Lanta AI page described the following Wan 3.0 capabilities: Wan 3.0 combines flexible starting points, multimodal references, native audio, and adjustable output settings in one creation workflow. These external capabilities are not verified or connected here.",
          "zh-CN": "Lanta AI 参照页面在采集时介绍以下 Wan 3.0 能力：Wan 3.0 将灵活的起始方式、多模态参考、原生音频和可调输出设置整合到同一个创作流程中。这些外部能力未经本项目验证或接入。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Extensive Multimodal Inputs",
              "zh-CN": "丰富的多模态输入"
            },
            "text": {
              "en": "Use text, images, videos, audio, documents, slides, spreadsheets, and webpages as references to give Wan 3.0 more context for video creation.",
              "zh-CN": "使用文本、图片、视频、音频、文档、幻灯片、电子表格和网页作为参考，为 Wan 3.0 提供更丰富的视频创作上下文。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Longer 30-Second Videos",
              "zh-CN": "更长的 30 秒视频"
            },
            "text": {
              "en": "Generate videos up to 30 seconds long in one run, reducing the need to create, extend, and stitch multiple short clips together.",
              "zh-CN": "单次生成最长 30 秒的视频，减少创建、续写和拼接多个短片段的需要。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Strong Video Generation Quality",
              "zh-CN": "强大的视频生成质量"
            },
            "text": {
              "en": "Built on the proven Wan video generation series, Wan 3.0 delivers high-quality visuals, natural motion, and reliable results for more demanding video projects.",
              "zh-CN": "基于久经验证的 Wan 视频生成系列，Wan 3.0 可为更高要求的视频项目带来高质量画面、自然动作和稳定可靠的结果。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Competitive Quality at Lower Cost",
              "zh-CN": "更低成本的有竞争力画质"
            },
            "text": {
              "en": "Create high-quality AI videos at a competitive generation cost, making Wan 3.0 practical for frequent content creation, advertising, and production workflows.",
              "zh-CN": "以具有竞争力的生成成本创作高质量 AI 视频，适合高频内容创作、广告和制作工作流。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Made for Real Video Production",
              "zh-CN": "面向真实视频制作"
            },
            "text": {
              "en": "Combine creative briefs, product images, brand materials, reference videos, audio, and documents to create videos for ads, e-commerce, marketing, education, and business content.",
              "zh-CN": "结合创意简报、产品图片、品牌素材、参考视频、音频和文档，为广告、电商、营销、教育和商业内容创作视频。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "More Precise Reference Control",
              "zh-CN": "更精准的参考控制"
            },
            "text": {
              "en": "Use multiple references to guide characters, products, motion, scenes, and audio, giving you greater control over how each element appears in the final video.",
              "zh-CN": "使用多项参考素材指导角色、产品、动作、场景和音频，更好地控制每个元素在最终视频中的呈现方式。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "How to Use Wan 3.0 AI Video Generator?",
          "zh-CN": "如何使用 Wan 3.0 AI 视频生成器？"
        },
        "intro": {
          "en": "The Lanta AI reference page stated at capture time: Choose your starting mode, add a prompt and optional references, then select the output settings and generate your Wan 3.0 video. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：选择起始模式，添加提示词和可选参考素材，再选择输出设置并生成 Wan 3.0 视频。"
        },
        "kind": "steps",
        "items": [
          {
            "title": {
              "en": "Step 1. Input Prompts or References",
              "zh-CN": "第 1 步：输入提示词或参考素材"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Type a simple text prompt to describe your video, or upload reference images to guide Wan 3.0 for generation. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：输入简洁的文本提示词来描述视频，或上传参考图片，引导 Wan 3.0 完成生成。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Step 2. Customize Your Settings",
              "zh-CN": "第 2 步：自定义设置"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Select Wan 3.0 as your AI video model, then adjust the video duration, aspect ratio, and quality for your desired output. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：选择 Wan 3.0 作为 AI 视频模型，然后根据所需结果调整视频时长、宽高比和质量。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Step 3. Generate and Export",
              "zh-CN": "第 3 步：生成并导出"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Click \"Generate\" to create your AI video. Preview the result in your generation history, then download it or try again with different prompts and settings. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Lanta AI 参照页面在采集时称：点击“生成”创建 AI 视频。在生成历史中预览结果，然后下载视频，或更换提示词和设置再次尝试。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Explore Wan models",
          "zh-CN": "探索 Wan 模型"
        },
        "intro": {
          "en": "Compare Wan video workflows and explore Wan FusionX as a related option.",
          "zh-CN": "比较 Wan 视频创作流程，并了解 Wan FusionX 这一相关选择。"
        },
        "kind": "related",
        "items": [
          {
            "title": {
              "en": "Wan 2.6",
              "zh-CN": "Wan 2.6"
            },
            "text": {
              "en": "Create text or image videos and explore multi-shot image-to-video storytelling.",
              "zh-CN": "了解文生/图生视频与图生多镜头叙事。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 2.5",
              "zh-CN": "Wan 2.5"
            },
            "text": {
              "en": "Compare short text-to-video and image-to-video workflows with audio options.",
              "zh-CN": "比较短片文生/图生与音频选项。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 2.2",
              "zh-CN": "Wan 2.2"
            },
            "text": {
              "en": "Animate a single image for motion studies and scene previews.",
              "zh-CN": "了解单图动画、动作研究和场景预览。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan FusionX",
              "zh-CN": "Wan FusionX"
            },
            "text": {
              "en": "Explore the Wan FusionX page alongside other Wan video workflows.",
              "zh-CN": "了解Wan FusionX和相关Wan视频资料。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Compare other video models",
          "zh-CN": "比较其他视频模型"
        },
        "intro": {
          "en": "Explore related workflows and choose a model that fits your next video.",
          "zh-CN": "了解相关创作流程，为下一个视频选择合适的模型。"
        },
        "kind": "related",
        "items": [
          {
            "title": {
              "en": "MindVideo AI",
              "zh-CN": "MindVideo AI"
            },
            "text": {
              "en": "Turn a written scene or source image into a short video.",
              "zh-CN": "Turn a written scene or source image into a short video."
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Seedance 2.0",
              "zh-CN": "Seedance 2.0"
            },
            "text": {
              "en": "Explore video creation guided by text, images, video and audio references.",
              "zh-CN": "Explore video creation guided by text, images, video and audio references."
            },
            "media": "https://cdn.lantaai.com/resources/aeaf14e8-5cdc-4dad-877d-8d731cbb1333.svg",
            "list": []
          },
          {
            "title": {
              "en": "Kling 3.0",
              "zh-CN": "Kling 3.0"
            },
            "text": {
              "en": "Compare Kling workflows with audio and multi-shot controls.",
              "zh-CN": "Compare Kling workflows with audio and multi-shot controls."
            },
            "media": "https://cdn.lantaai.com/resources/95daf4be-14da-4a44-85fd-94662230238b.svg",
            "list": []
          },
          {
            "title": {
              "en": "Grok Imagine",
              "zh-CN": "Grok Imagine"
            },
            "text": {
              "en": "Compare text and image video creation with native audio.",
              "zh-CN": "Compare text and image video creation with native audio."
            },
            "media": "https://cdn.lantaai.com/resources/ad3ef36b-b8fa-4f8a-9587-8c0774cda18f.png",
            "list": []
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "1. How do I create a video with Wan 3.0?",
          "zh-CN": "1. 如何使用 Wan 3.0 创建视频？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Enter a text prompt or upload an image or reference, then select Wan 3.0 AI video generator on Lanta AI. Set the duration, resolution, and aspect ratio, then click Generate. Once your video is ready, preview and download it, or adjust your prompt and settings to create another version. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时介绍的流程是：输入文本提示词，或上传图片或参考素材，然后在 Lanta AI 上选择 Wan 3.0 AI 视频生成器。设置时长、分辨率和宽高比，再点击生成。视频完成后，可以预览和下载，或调整提示词与设置创建另一个版本。本项目未验证该服务流程，尚未接入视频生成。"
        }
      },
      {
        "question": {
          "en": "2. Can I use Wan 3.0 AI Video for free?",
          "zh-CN": "2. 可以免费使用 Wan 3.0 AI 视频吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Yes. New users on Lanta AI receive 40 free credits to try the Wan 3.0 AI video model. Each generation uses credits based on settings such as video length and quality, so the free credits are designed for testing the model rather than unlimited generation. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：其新用户可获得 40 个免费积分，用于试用 Wan 3.0 AI 视频模型，每次生成按时长和质量等设置消耗积分；这不代表无限生成。本项目未验证该外部积分政策，也不提供该生成服务；Makeup AI 原有的 3 次美妆体验与之无关。"
        }
      },
      {
        "question": {
          "en": "3. What can I use as references in Wan 3.0?",
          "zh-CN": "3. Wan 3.0 支持哪些参考素材？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: The Wan 3.0 AI video generator supports up to 10 reference images, 5 reference videos, and 5 audio files. You can also use documents and public webpages, including PDF, Word, PowerPoint, Excel, TXT, Markdown, Keynote, Pages, and Numbers files, giving the model more context for characters, products, motion, sound, and content. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：其 Wan 3.0 AI 视频生成器最多支持 10 张参考图片、5 个参考视频和 5 个音频文件，还可使用文档和公开网页，包括 PDF、Word、PowerPoint、Excel、TXT、Markdown、Keynote、Pages 和 Numbers，为角色、产品、动作、声音和内容提供上下文。本项目未验证这些外部服务能力，尚未接入视频生成或文档、网页上传。"
        }
      },
      {
        "question": {
          "en": "4. Can Wan 3.0 create videos from images?",
          "zh-CN": "4. Wan 3.0 能根据图片创建视频吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Yes. The Wan 3.0 AI video generator supports image-to-video, first-frame, and first-and-last-frame generation. Use a first frame to control how your video starts, add a last frame to define how it ends, or use reference images to guide characters, products, objects, and other visual details. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：可以。Wan 3.0 AI 视频生成器支持图片生成视频、首帧生成以及首尾帧生成。使用首帧控制视频的开场，添加尾帧定义视频的结束方式，或通过参考图片引导角色、产品、物体及其他视觉细节。"
        }
      },
      {
        "question": {
          "en": "5. How long can a Wan 3.0 AI video be?",
          "zh-CN": "5. Wan 3.0 AI 视频最长可以生成多少秒？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: A Wan 3.0 AI video can be generated from 2 to 30 seconds in a single run when no reference video is used. You can choose any integer duration within that range or use Smart Duration to let the model select a suitable length automatically. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：未使用参考视频时，单次可生成 2 到 30 秒的 Wan 3.0 AI 视频。你可以选择范围内任意整数时长，也可以使用智能时长，让模型自动选择合适的长度。"
        }
      },
      {
        "question": {
          "en": "6. Does Wan 3.0 AI Video generate audio?",
          "zh-CN": "6. Wan 3.0 AI 视频会生成音频吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Yes. Native audio is enabled by default in the Wan 3.0 AI video generator, allowing visuals and sound to be created together. You can describe dialogue, environmental sounds, sound effects, and music in your prompt, or provide reference audio for additional guidance. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：会。Wan 3.0 AI 视频生成器默认启用原生音频，可同时创建画面和声音。你可以在提示词中描述对白、环境声、音效和音乐，也可以提供参考音频进行进一步引导。"
        }
      },
      {
        "question": {
          "en": "7. What quality and aspect ratios does Wan 3.0 support?",
          "zh-CN": "7. Wan 3.0 支持哪些画质和宽高比？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: The Wan 3.0 AI video generator supports 480P, 720P, and 1080P output, with aspect ratios including 16:9, 9:16, 1:1, 4:3, and 3:4. Adaptive mode can also choose a suitable ratio based on your input and creative intent. Native 4K output is not currently listed in the official specifications. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：Wan 3.0 AI 视频生成器支持 480P、720P 和 1080P 输出，宽高比包括 16:9、9:16、1:1、4:3 和 3:4。自适应模式还可根据输入内容和创作意图选择合适的比例。目前官方规格中尚未列出原生 4K 输出。"
        }
      },
      {
        "question": {
          "en": "8. How do I get better results from Wan 3.0?",
          "zh-CN": "8. 如何让 Wan 3.0 生成更好的效果？"
        },
        "answer": {
          "en": "For a better Wan 3.0 AI video, clearly describe the subject, action, setting, camera movement, timing, and sound instead of relying on broad style words. For longer videos, organize your prompt into timed shots, and when using multiple references, specify which image or video controls each character, product, action, or scene.",
          "zh-CN": "为了获得更好的 Wan 3.0 AI 视频，请清楚描述主体、动作、环境、镜头运动、时间安排和声音，而不是只使用宽泛的风格词。对于较长的视频，可将提示词按时间拆分为不同镜头；使用多项参考时，请明确指定每张图片或每段视频要控制的角色、产品、动作或场景。"
        }
      },
      {
        "question": {
          "en": "9. Can I use Wan 3.0 videos commercially?",
          "zh-CN": "9. Wan 3.0 视频可以商用吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Yes, but commercial usage depends on your Lanta AI plan and the source materials you use with the Wan 3.0 AI video generator. Lanta AI paid plans that include a Commercial License can be used for commercial projects, while you remain responsible for the rights to uploaded images, music, logos, characters, products, and identifiable people. This project has not verified these service claims and does not provide this generation service. This project does not grant a commercial license; check the relevant provider terms and source-material rights.",
          "zh-CN": "可以，但商业使用取决于你的 Lanta AI 套餐以及与 Wan 3.0 AI 视频生成器配合使用的源素材。包含商业许可的 Lanta AI 付费套餐可用于商业项目，但你仍需对上传的图片、音乐、徽标、角色、产品和可识别人物的相关权利负责。这是 Lanta AI 页面采集时的许可说明，本项目未验证或授予商业许可，仍应核相关服务条款和源素材权利。"
        }
      },
      {
        "question": {
          "en": "10. How fast does the Wan 3.0 AI video generator create a video?",
          "zh-CN": "10. Wan 3.0 AI 视频生成器的生成速度有多快？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: The Wan 3.0 AI video generator typically needs several minutes to complete a generation. Alibaba’s official documentation states that a task usually takes around 1–5 minutes, although actual processing time can vary with video duration, resolution, reference materials, and current server demand. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称：Wan 3.0 AI 视频生成器通常需要几分钟完成一次生成。阿里巴巴官方文档指出，一项任务通常约需 1–5 分钟，实际处理时间会随视频时长、分辨率、参考素材和当前服务器负载而变化。"
        }
      }
    ]
  },
  "/ai-video-models/wan-fusionX": {
    "hero": {
      "en": "FusionX AI Video Generator — Public Guide",
      "zh-CN": "FusionX AI 视频生成器：公开模型介绍"
    },
    "description": {
      "en": "Explore public information about Wan FusionX / Wan2.1 FusionX video fusion and compositing, with feature guides and public showcase videos. FusionX is not connected here; the general video settings will not select it.",
      "zh-CN": "了解公开页面中的Wan FusionX / Wan2.1 FusionX视频融合与合成资料，浏览功能说明和公开视频示例。FusionX尚未接入本项目，通用视频参数页不会自动选中它。"
    },
    "heroMedia": "https://cdn.lantaai.com/resources/6475aeac-235a-49bb-97cb-7ecb34c34bc3.mp4",
    "blocks": [
      {
        "heading": {
          "en": "FusionX Features",
          "zh-CN": "FusionX 功能"
        },
        "intro": {
          "en": "At capture time, the Lanta AI page attributed these video fusion and compositing capabilities to Wan FusionX and Wan2.1 FusionX engines. This project has not verified or connected those capabilities.",
          "zh-CN": "Lanta AI 参照页面在采集时将以下视频融合与专业合成能力归于 Wan FusionX 和 Wan2.1 FusionX 引擎。本项目未验证或接入这些能力。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "AI-Powered Processing",
              "zh-CN": "AI处理"
            },
            "text": {
              "en": "Wan FusionX engine utilizes advanced machine learning algorithms for intelligent video analysis, automatic object detection, and seamless fusion processing with minimal user input.",
              "zh-CN": "Wan FusionX公开资料介绍机器学习视频分析、自动物体检测与融合处理，旨在减少手动输入。"
            },
            "media": "https://cdn.lantaai.com/resources/1d8bc1f7-0277-4ff8-bb86-43e5217cce83.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Real-Time Preview",
              "zh-CN": "实时预览"
            },
            "text": {
              "en": "At capture time, the Lanta AI page claimed FusionX offered instant previews while adjusting parameters through Wan2.1 FusionX rendering. This project has not verified or connected that real-time processing.",
              "zh-CN": "Lanta AI 参照页面在采集时称，FusionX 可通过 Wan2.1 FusionX 渲染，在调整参数时即时预览。本项目未验证或接入该实时处理。"
            },
            "media": "https://cdn.lantaai.com/resources/511b4202-c819-484b-9518-3130ac84ef34.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Multi-Layer Compositing",
              "zh-CN": "多层合成"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Advanced layering system supports unlimited video tracks, effects, and overlays. FusionX handles complex compositions with professional-grade precision and control. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "公开描述多视频轨道、效果和叠加，处理复杂合成；“无限轨道”等运营说法不是本项目能力。"
            },
            "media": "https://cdn.lantaai.com/resources/79c37e2d-ff05-4629-b377-67635b9fb099.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Cloud-Based Processing",
              "zh-CN": "云端处理"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: No downloads required. FusionX runs entirely in the cloud with Wan FusionX infrastructure, providing consistent performance across all devices and operating systems. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "公开页面称无需下载、使用云端基础设施，面向不同设备和系统；本项目未接该服务。"
            },
            "media": "https://cdn.lantaai.com/resources/f13baf63-6178-4811-9e31-b81a18fcf22a.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Smart Background Removal",
              "zh-CN": "智能抠像"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Wan2.1 FusionX features advanced AI keying technology that automatically detects and removes backgrounds with pixel-perfect precision, even with complex scenes and moving objects. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "Wan2.1 FusionX公开资料描述像素级背景检测与移除，包含复杂场景与运动对象，效果未经本项目验证。"
            },
            "media": "https://cdn.lantaai.com/resources/f7f9c4f4-e506-49d3-9e6b-64ec37195b09.mp4",
            "list": []
          },
          {
            "title": {
              "en": "High-Performance Rendering",
              "zh-CN": "高性能渲染"
            },
            "text": {
              "en": "At capture time, the Lanta AI page claimed distributed GPU acceleration through Wan FusionX rendered 3× faster than traditional software and supported 4K/8K processing. This project has not verified that comparison or connected this rendering service.",
              "zh-CN": "Lanta AI 参照页面在采集时宣称 Wan FusionX 通过分布式 GPU 加速，渲染比传统软件快 3 倍，并支持 4K/8K 处理。本项目未验证该比较或接入该渲染服务。"
            },
            "media": "https://cdn.lantaai.com/resources/d74bb5ff-7a1f-4428-9780-b3cb8149dc93.mp4",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Advanced Wan2.1 FusionX Features",
          "zh-CN": "Wan2.1 FusionX 高级功能"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Motion Tracking & Stabilization",
              "zh-CN": "运动追踪与稳定"
            },
            "text": {
              "en": "Wan2.1 FusionX automatically tracks object movement and applies stabilization algorithms for smooth, professional-looking video fusion results.",
              "zh-CN": "公开资料描述自动追踪物体动作、稳定镜头，实现平滑的融合效果。"
            }
          },
          {
            "title": {
              "en": "Color Matching & Grading",
              "zh-CN": "色彩匹配与调色"
            },
            "text": {
              "en": "Intelligent color analysis ensures seamless blending between video sources with automatic color correction and professional-grade color grading tools.",
              "zh-CN": "智能分析色彩、自动校色与调色，以衔接不同来源的视频。"
            }
          },
          {
            "title": {
              "en": "Advanced Parameter Control",
              "zh-CN": "高级参数控制"
            },
            "text": {
              "en": "Fine-tune every aspect of your fusion with precision controls for opacity, blending modes, edge feathering, and custom effect parameters.",
              "zh-CN": "公开资料列出透明度、混合模式、边缘羽化及自定义效果参数。"
            }
          }
        ]
      },
      {
        "heading": {
          "en": "Professional FusionX Tools",
          "zh-CN": "FusionX 专业工具"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Batch Processing",
              "zh-CN": "批量处理"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Process multiple videos simultaneously with FusionX batch capabilities. Queue unlimited projects and let the service’s AI engines handle the processing automatically. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "公开资料描述同时处理多个视频和排队项目，不是本项目已开放的任务队列。"
            }
          },
          {
            "title": {
              "en": "Multiple Export Formats",
              "zh-CN": "多种导出格式"
            },
            "text": {
              "en": "The Lanta AI reference page stated at capture time: Export your FusionX creations in any format: MP4, MOV, AVI, WebM, and more. Choose from various quality presets or customize your own export settings. This project has not verified these service claims and does not provide this generation service.",
              "zh-CN": "公开页面列出MP4、MOV、AVI、WebM及画质预设；本项目不提供FusionX导出。"
            }
          },
          {
            "title": {
              "en": "Team Collaboration",
              "zh-CN": "团队协作"
            },
            "text": {
              "en": "At capture time, the Lanta AI page described team sharing, permissions, real-time collaboration and version control in its FusionX cloud workspace. This project has not verified or connected that workspace.",
              "zh-CN": "Lanta AI 参照页面在采集时介绍了其 FusionX 云端工作区的团队共享、权限、实时协作与版本管理。本项目未验证或接入该工作区。"
            }
          }
        ]
      },
      {
        "heading": {
          "en": "FusionX AI Video Examples",
          "zh-CN": "FusionX AI 视频示例"
        },
        "intro": {
          "en": "The Lanta AI reference page stated at capture time: Check out these examples of AI video fusion created with the service’s FusionX technology powered by Wan FusionX and Wan2.1 FusionX engines. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "公开页面提供的视频融合示例，注明来源展示，不是本项目生成。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Lighting details",
              "zh-CN": "光照细节"
            },
            "text": {
              "en": "Cinematic smoothness and lighting",
              "zh-CN": "电影感的流畅运动与光照"
            },
            "media": "https://cdn.lantaai.com/resources/1d8bc1f7-0277-4ff8-bb86-43e5217cce83.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Object Tracking",
              "zh-CN": "物体追踪"
            },
            "text": {
              "en": "Advanced motion tracking",
              "zh-CN": "高级运动追踪"
            },
            "media": "https://cdn.lantaai.com/resources/511b4202-c819-484b-9518-3130ac84ef34.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Multi-image fusion",
              "zh-CN": "多图融合"
            },
            "text": {
              "en": "Multi-image fusion",
              "zh-CN": "多张图片融合"
            },
            "media": "https://cdn.lantaai.com/resources/79c37e2d-ff05-4629-b377-67635b9fb099.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Multi-Layer",
              "zh-CN": "多层叠加"
            },
            "text": {
              "en": "Tuning motion dynamics and details",
              "zh-CN": "调整动作动态与细节"
            },
            "media": "https://cdn.lantaai.com/resources/f13baf63-6178-4811-9e31-b81a18fcf22a.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Video action reference",
              "zh-CN": "视频动作参考"
            },
            "text": {
              "en": "Action transfer",
              "zh-CN": "动作迁移"
            },
            "media": "https://cdn.lantaai.com/resources/f7f9c4f4-e506-49d3-9e6b-64ec37195b09.mp4",
            "list": []
          },
          {
            "title": {
              "en": "Scene Reconstruction",
              "zh-CN": "场景重建"
            },
            "text": {
              "en": "3D scene building",
              "zh-CN": "三维场景构建"
            },
            "media": "https://cdn.lantaai.com/resources/d74bb5ff-7a1f-4428-9780-b3cb8149dc93.mp4",
            "list": []
          }
        ],
        "gallery": "landscape-badge"
      },
      {
        "heading": {
          "en": "Why Choose FusionX?",
          "zh-CN": "为什么选择 FusionX？"
        },
        "intro": {
          "en": "At capture time, the Lanta AI page presented these Wan FusionX and Wan2.1 FusionX performance claims. They are not verified by this project, and FusionX is not connected here.",
          "zh-CN": "Lanta AI 参照页面在采集时列出以下 Wan FusionX 与 Wan2.1 FusionX 性能说法。本项目未验证这些说法，FusionX 尚未接入。"
        },
        "kind": "cards",
        "items": [
          {
            "title": {
              "en": "Lightning Fast",
              "zh-CN": "快速处理"
            },
            "text": {
              "en": "Wan FusionX reduces rendering time by 70% for all video formats",
              "zh-CN": "公开页面宣称Wan FusionX可减少70%渲染时间，未经本项目验证。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "Smart Recognition",
              "zh-CN": "智能识别"
            },
            "text": {
              "en": "Wan2.1 FusionX automatically identifies objects for precise fusion",
              "zh-CN": "公开资料描述Wan2.1 FusionX自动识别对象，以控制融合位置与效果。"
            },
            "media": "",
            "list": []
          },
          {
            "title": {
              "en": "One-Click Fusion",
              "zh-CN": "一键融合"
            },
            "text": {
              "en": "FusionX makes complex video compositing simple and automated",
              "zh-CN": "公开资料将复杂视频合成描述为自动化流程；本项目没有对应生成后端。"
            },
            "media": "",
            "list": []
          }
        ]
      },
      {
        "heading": {
          "en": "Explore Wan models",
          "zh-CN": "探索 Wan 模型"
        },
        "intro": {
          "en": "Compare Wan video workflows and explore Wan FusionX as a related option.",
          "zh-CN": "比较Wan系列视频工作流，了解相关的Wan FusionX资料。"
        },
        "kind": "related",
        "items": [
          {
            "title": {
              "en": "Wan 2.6",
              "zh-CN": "Wan 2.6"
            },
            "text": {
              "en": "Create text or image videos and explore multi-shot image-to-video storytelling.",
              "zh-CN": "了解文生/图生视频与图生多镜头叙事。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 3.0",
              "zh-CN": "Wan 3.0"
            },
            "text": {
              "en": "Explore text, image and multimodal reference workflows.",
              "zh-CN": "探索文字、图片及多模态参考工作流。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 2.5",
              "zh-CN": "Wan 2.5"
            },
            "text": {
              "en": "Compare short text-to-video and image-to-video workflows with audio options.",
              "zh-CN": "比较短片文生/图生与音频选项。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          },
          {
            "title": {
              "en": "Wan 2.2",
              "zh-CN": "Wan 2.2"
            },
            "text": {
              "en": "Animate a single image for motion studies and scene previews.",
              "zh-CN": "了解单图动画、动作研究和场景预览。"
            },
            "media": "https://cdn.lantaai.com/resources/059b07d3-538d-4248-ac3e-e69dd299292c.svg",
            "list": []
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "What is FusionX and how does it work?",
          "zh-CN": "FusionX 是什么，如何工作？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: FusionX is an advanced AI-powered video fusion platform that combines the power of Wan FusionX and Wan2.1 FusionX engines. FusionX uses deep learning algorithms to automatically analyze, process, and merge video content with intelligent scene recognition, background removal, and multi-layer effects overlay. The Wan FusionX engine handles general video processing, while Wan2.1 FusionX provides enhanced precision for complex professional projects. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "公开页面将FusionX描述为结合Wan FusionX与Wan2.1 FusionX的AI视频融合平台，通过场景识别、物体追踪、颜色匹配和图层合成整合视频内容。本项目只展示这些资料和公开示例，没有对应模型或处理表单。"
        }
      },
      {
        "question": {
          "en": "What's the difference between Wan FusionX and Wan2.1 FusionX engines?",
          "zh-CN": "Wan FusionX 与 Wan2.1 FusionX 引擎有什么区别？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Wan FusionX is the original engine powering FusionX, designed for general video fusion tasks with excellent performance and reliability. Wan2.1 FusionX is the upgraded engine with enhanced scene segmentation, improved motion tracking, and higher precision algorithms. While Wan FusionX handles most standard video fusion needs, Wan2.1 FusionX is optimized for professional-grade projects requiring maximum accuracy and detail in video compositing. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称，Wan FusionX 是用于常规视频融合的原始引擎；Wan2.1 FusionX 是升级引擎，增强了场景分割和运动追踪，并采用更高精度的算法，面向对合成准确度与细节要求更高的专业项目。这些是外部服务的介绍，本项目未验证，也未接入上述引擎；当前选择器没有同名模型，不会用 Wan 2.2 或其它版本代替。"
        }
      },
      {
        "question": {
          "en": "Is FusionX really free to use?",
          "zh-CN": "FusionX 真的免费吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Yes! FusionX offers a free tier that allows you to experience the power of both Wan FusionX and Wan2.1 FusionX engines. You can create AI video fusions, apply effects, and export videos without any upfront cost. The service’s free plan includes access to basic FusionX features, while premium plans unlock advanced Wan2.1 FusionX capabilities, higher resolution exports, and priority processing. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时介绍了免费基础层，可体验两种引擎、基础视频融合、效果和导出；其付费方案则宣称解锁 Wan2.1 FusionX 的高级功能、更高分辨率导出和优先处理。这些是外部服务的套餐说明，本项目未验证当前免费或付费条件，也未接入 FusionX，不提供生成、购买、扣费或无限额度。"
        }
      },
      {
        "question": {
          "en": "What video formats does FusionX support?",
          "zh-CN": "FusionX 支持哪些视频格式？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: FusionX supports all major video formats including MP4, MOV, AVI, MKV, WMV, and more. Both Wan FusionX and Wan2.1 FusionX engines automatically detect and optimize for different codecs, frame rates, and resolutions. FusionX can process videos from 720p to 8K resolution, with the Wan2.1 FusionX engine providing enhanced performance for ultra-high-definition content. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时列出 MP4、MOV、AVI、MKV、WMV 等主要格式，并称 Wan FusionX 与 Wan2.1 FusionX 引擎会识别和适配编解码器、帧率及分辨率，可处理720p—8K视频，后者针对超高清内容优化。这些是外部规格，本项目未验证，也未提供 FusionX 上传或处理服务。"
        }
      },
      {
        "question": {
          "en": "How long does it take to process videos with FusionX?",
          "zh-CN": "FusionX 处理视频需要多久？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: Processing time with FusionX depends on video length, resolution, and complexity. The Wan FusionX engine typically processes 1-minute 1080p videos in 2-3 minutes, while the advanced Wan2.1 FusionX engine can handle the same content in 1-2 minutes thanks to optimized algorithms. For 4K content, FusionX with Wan2.1 FusionX delivers results 3x faster than traditional video editing software. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "Lanta AI 参照页面在采集时称，处理一段1分钟的1080p视频，Wan FusionX 通常需要2—3分钟，Wan2.1 FusionX 通常需要1—2分钟；对于4K内容，页面还宣称后者比传统视频编辑软件快约3倍。这些是外部页面的性能说法，本项目未独立验证；实际耗时会随视频长度、分辨率、复杂度及服务情况变化。本项目尚未接入 FusionX，不提供耗时保证或虚构进度。"
        }
      },
      {
        "question": {
          "en": "Do I need special hardware to run FusionX?",
          "zh-CN": "运行 FusionX 需要特别硬件吗？"
        },
        "answer": {
          "en": "The Lanta AI reference page stated at capture time: No special hardware required! FusionX runs entirely in the cloud, powered by the service’s Wan FusionX and Wan2.1 FusionX engines. You can access FusionX from any device with an internet connection. The service’s cloud infrastructure handles all the heavy processing, so whether you're using a basic laptop or high-end workstation, FusionX delivers consistent performance through the power of Wan FusionX technology. This project has not verified these service claims and does not provide this generation service.",
          "zh-CN": "参照页面将服务描述为云端运行，可通过浏览器使用，不要求用户自备专业渲染硬件。本项目仅展示公开资料，不提供本地模型安装或远程推理。"
        }
      },
      {
        "question": {
          "en": "Can I use FusionX for commercial projects?",
          "zh-CN": "FusionX 可以用于商业项目吗？"
        },
        "answer": {
          "en": "At capture time, the Lanta AI reference page described FusionX as suitable for personal and commercial projects and claimed its commercial licenses cover client work, social campaigns and advertisements. This project has not verified those external licensing claims and does not grant any commercial license for FusionX output. Check the provider’s terms, model licenses and rights to source materials. FusionX is not connected here.",
          "zh-CN": "Lanta AI 参照页面在采集时介绍 FusionX 的个人和商业用途，并称其商业许可覆盖客户项目、社交活动与广告。本项目未验证这些外部许可说法，也未授予 FusionX 输出的商业许可；应核服务条款、模型许可和源素材权利。FusionX 尚未接入。"
        }
      },
      {
        "question": {
          "en": "How do I get started with FusionX?",
          "zh-CN": "如何开始使用 FusionX？"
        },
        "answer": {
          "en": "At capture time, the Lanta AI reference page instructed users to click “Create Free AI Video Fusion” and claimed immediate browser access to Wan FusionX, with optional Wan2.1 FusionX upgrades and cloud processing by its engines. The observed CTA led to its general video generator without a FusionX model parameter. FusionX is not connected here: this page first explains that limitation, then lets you cancel or explicitly continue to local general video settings, which will not select FusionX.",
          "zh-CN": "Lanta AI 参照页面在采集时引导点击“Create Free AI Video Fusion”，宣称可立即通过浏览器使用 Wan FusionX，并可升级 Wan2.1 FusionX、由其云端引擎处理。实际观察按钮进入通用视频生成器，未附 FusionX 模型参数。本项目 FusionX 尚未接入：会先提示这一限制，可取消或明确继续浏览本地通用参数，但不会选中或冒充 FusionX。"
        }
      }
    ]
  }
};
