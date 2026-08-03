export type MakeupMode = "full_face" | "virtual_try_on";
export type SourceMode = "upload" | "camera";

export const MAKEUP_PARTS = [
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

export type MakeupPart = (typeof MAKEUP_PARTS)[number];

export const MAKEUP_LAYER_ORDER: readonly MakeupPart[] = [
  "foundation",
  "contour",
  "blush",
  "highlight",
  "eyeshadow",
  "eyeliner",
  "mascara",
  "brows",
  "lipstick"
];

export type MakeupPreset = {
  id: string;
  name: { en: string; "zh-CN": string };
  color: string;
};

export const MAKEUP_PRESETS: Record<MakeupPart, readonly MakeupPreset[]> = {
  lipstick: [
    { id: "classic-red", name: { en: "Classic red", "zh-CN": "经典红" }, color: "#c93445" },
    { id: "rosewood", name: { en: "Rosewood", "zh-CN": "玫瑰木" }, color: "#9d4b55" },
    { id: "berry", name: { en: "Berry", "zh-CN": "浆果色" }, color: "#8f3153" },
    { id: "warm-coral", name: { en: "Warm coral", "zh-CN": "暖珊瑚" }, color: "#d8675b" }
  ],
  foundation: [
    { id: "natural", name: { en: "Natural", "zh-CN": "自然" }, color: "#d8a47f" },
    { id: "radiant", name: { en: "Radiant", "zh-CN": "水光" }, color: "#e4b995" },
    { id: "satin", name: { en: "Satin", "zh-CN": "缎光" }, color: "#c98d68" },
    { id: "soft-matte", name: { en: "Soft matte", "zh-CN": "柔雾" }, color: "#b97856" }
  ],
  blush: [
    { id: "soft-rose", name: { en: "Soft rose", "zh-CN": "柔玫瑰" }, color: "#d77b83" },
    { id: "peach", name: { en: "Peach", "zh-CN": "蜜桃" }, color: "#e89173" },
    { id: "plum", name: { en: "Plum", "zh-CN": "梅子" }, color: "#a85b72" },
    { id: "sun-kissed", name: { en: "Sun kissed", "zh-CN": "日晒感" }, color: "#b96d52" }
  ],
  eyeshadow: [
    { id: "taupe", name: { en: "Taupe", "zh-CN": "灰棕" }, color: "#8e7469" },
    { id: "rose-shimmer", name: { en: "Rose shimmer", "zh-CN": "玫瑰微闪" }, color: "#b96d86" },
    { id: "bronze", name: { en: "Bronze", "zh-CN": "古铜" }, color: "#9b633d" },
    { id: "smoky", name: { en: "Smoky", "zh-CN": "烟熏" }, color: "#4d4547" }
  ],
  eyeliner: [
    { id: "classic", name: { en: "Classic", "zh-CN": "经典" }, color: "#211d1b" },
    { id: "winged", name: { en: "Winged", "zh-CN": "上扬" }, color: "#171412" },
    { id: "puppy", name: { en: "Puppy", "zh-CN": "下垂眼线" }, color: "#3a2b26" },
    { id: "soft-brown", name: { en: "Soft brown", "zh-CN": "柔棕" }, color: "#5a3b30" }
  ],
  mascara: [
    { id: "natural", name: { en: "Natural", "zh-CN": "自然" }, color: "#211d1b" },
    { id: "lengthening", name: { en: "Lengthening", "zh-CN": "纤长" }, color: "#181513" },
    { id: "volumizing", name: { en: "Volumizing", "zh-CN": "浓密" }, color: "#11100e" },
    { id: "defined", name: { en: "Defined", "zh-CN": "根根分明" }, color: "#2c2420" }
  ],
  brows: [
    { id: "soft", name: { en: "Soft", "zh-CN": "柔雾眉" }, color: "#6b5145" },
    { id: "straight", name: { en: "Straight", "zh-CN": "平直眉" }, color: "#594238" },
    { id: "arched", name: { en: "Arched", "zh-CN": "挑眉" }, color: "#49362f" },
    { id: "feathered", name: { en: "Feathered", "zh-CN": "野生眉" }, color: "#72584a" }
  ],
  contour: [
    { id: "natural", name: { en: "Natural", "zh-CN": "自然" }, color: "#94654f" },
    { id: "soft-sculpt", name: { en: "Soft sculpt", "zh-CN": "柔和立体" }, color: "#81533f" },
    { id: "defined", name: { en: "Defined", "zh-CN": "清晰轮廓" }, color: "#704331" },
    { id: "editorial", name: { en: "Editorial", "zh-CN": "杂志感" }, color: "#5e392c" }
  ],
  highlight: [
    { id: "subtle", name: { en: "Subtle", "zh-CN": "自然" }, color: "#f2cfad" },
    { id: "champagne", name: { en: "Champagne", "zh-CN": "香槟" }, color: "#e9bd83" },
    { id: "dewy", name: { en: "Dewy", "zh-CN": "水光" }, color: "#f5d8c5" },
    { id: "glass-skin", name: { en: "Glass skin", "zh-CN": "玻璃肌" }, color: "#f7e1d2" }
  ]
};

export type MakeupLayer = {
  enabled: boolean;
  presetId: string;
  color: string;
  intensity: number;
};

export type MakeupConfig = Partial<Record<MakeupPart, MakeupLayer>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizedColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
    ? value.toLowerCase()
    : fallback;
}

export function normalizeMakeupConfig(value: unknown): MakeupConfig {
  if (!isRecord(value)) return {};
  const config: MakeupConfig = {};

  for (const part of MAKEUP_PARTS) {
    const raw = value[part];
    if (!isRecord(raw)) continue;
    const presets = MAKEUP_PRESETS[part];
    const preset =
      presets.find((item) => item.id === raw.presetId) ?? presets[0];
    const numericIntensity = typeof raw.intensity === "number" ? raw.intensity : 60;
    config[part] = {
      enabled: raw.enabled === true,
      presetId: preset.id,
      color: normalizedColor(raw.color, preset.color),
      intensity: Math.max(0, Math.min(100, Math.round(numericIntensity)))
    };
  }

  return config;
}
