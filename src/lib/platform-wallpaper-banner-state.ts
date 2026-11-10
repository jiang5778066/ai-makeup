import { generatorModels, type GeneratorMode } from './platform-generator-data';
import { generatorModel, normalizeParameters, type GeneratorState } from './platform-generator-parameters';
import { GeneratorSessions } from './platform-generator-session';

export type WallpaperBannerKind = 'wallpaper' | 'banner';
export const wallpaperBannerPaths = { wallpaper: '/tools/ai-wallpaper-generator', banner: '/tools/ai-youtube-banner-maker' } as const;
export const wallpaperBannerModels = ['2403','2400','1401','2100','2110','2111','1000','1400','1402','1403','1300','1301'].flatMap(id => generatorModels.find(m => m.referenceId === id) ?? []);
export const wallpaperBannerSessions = new GeneratorSessions(8);
export const wallpaperBannerKey = (kind: WallpaperBannerKind, query: string) => {
  const q = new URLSearchParams(query);
  return JSON.stringify(['c3d',kind,...['model','mode','tab','resolution','ratio'].map(k => q.get(k))]);
};

// 初始值是公开页面当前观察值，不声称是提供方出厂默认；跨页恢复的旧提示词不植入新会话。
export const initializeWallpaperBanner = (kind: WallpaperBannerKind, query: string): GeneratorState => {
  const q = new URLSearchParams(query), requested = q.get('model'), rawMode = q.get('mode'), tab = q.get('tab');
  const modes: Record<string, GeneratorMode> = {'text-to-image':'text','image-to-image':'image'};
  const mode = modes[rawMode ?? ''] ?? (tab === 'image' ? 'image' : 'text');
  const selected = requested ? wallpaperBannerModels.find(m => m.id === requested || m.referenceId === requested) : generatorModel('1000');
  const model = selected?.id ?? requested ?? 'nano-banana-pro', issues: string[] = [];
  if (!selected) issues.push('unknown-model');
  if (rawMode && !modes[rawMode]) issues.push('unknown-mode');
  if (modes[rawMode ?? ''] && tab && mode !== tab) issues.push('mode-tab-conflict');
  if (selected && !selected.modes[mode]) issues.push('unsupported-mode');
  const parameters = selected ? normalizeParameters(selected,mode,kind === 'banner' ? {resolution:'2K',ratio:'16:9'} : {}) : {};
  const config = selected?.modes[mode];
  for (const [key, options] of [['resolution',config?.resolutions],['ratio',config?.ratios]] as const) {
    const value = q.get(key); if (!value) continue;
    if (options?.includes(value)) parameters[key] = value; else issues.push(`unsupported-${key}`);
  }
  return {path:'/ai-image-generator',mode,model,prompt:'',parameters,issues};
};
