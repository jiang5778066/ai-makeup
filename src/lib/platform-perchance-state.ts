import { generatorModel, type GeneratorState } from './platform-generator-parameters';
import type { GeneratorPath } from './platform-generator-data';

export const perchancePath = '/tools/perchance-image-generator';
export const perchanceRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'] as const;
export type PerchanceState = GeneratorState;
// 共享会话只保存对象；本地路径标识不进入共享页面解析器或模型配置。
const sessionPath = perchancePath as GeneratorPath;
const localConfig = { ratios: [...perchanceRatios] };
export function perchanceConfig(state: PerchanceState) {
  return state.path === sessionPath && state.model === 'perchance' && state.mode === 'text'
    && !state.issues.includes('unsupported-mode') ? localConfig : undefined;
}
export function restorePerchance(state: PerchanceState): PerchanceState {
  const issues = state.issues.filter(issue => !['unknown-model', 'unsupported-page-model', 'unsupported-mode'].includes(issue));
  if (state.model !== 'perchance') issues.push(generatorModel(state.model) ? 'unsupported-page-model' : 'unknown-model');
  if (state.mode !== 'text' || state.issues.includes('unsupported-mode')) issues.push('unsupported-mode');
  const valid = state.model === 'perchance' && !issues.includes('unsupported-mode');
  return { ...state, path: sessionPath, issues, parameters: valid ? { ratio: perchanceRatios.includes(state.parameters.ratio as typeof perchanceRatios[number]) ? state.parameters.ratio : '1:1' } : {} };
}
export function initializePerchance(query: string): PerchanceState {
  const q = new URLSearchParams(query), mode = q.get('mode'), tab = q.get('tab');
  const invalidMode = !!mode && !['text', 'text-to-image'].includes(mode) || !!tab && tab !== 'text';
  return restorePerchance({ path: sessionPath, model: q.get('model') ?? 'perchance', mode: mode === 'image-to-image' || tab === 'image' ? 'image' : 'text', prompt: '', parameters: { ratio: '1:1' }, issues: invalidMode ? ['unsupported-mode'] : [] });
}
export function selectPerchance(state: PerchanceState): PerchanceState {
  return restorePerchance({ ...state, model: 'perchance', mode: 'text', parameters: { ratio: '1:1' }, issues: [] });
}
