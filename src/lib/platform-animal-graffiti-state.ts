import { generatorModels, type GeneratorMode } from './platform-generator-data';
import { generatorModel, normalizeParameters, type GeneratorState } from './platform-generator-parameters';
import type { AnimalGraffitiTool } from './platform-animal-graffiti-content';
export const animalGraffitiPath = (tool:AnimalGraffitiTool)=>`/tools/ai-${tool}-generator`;
export function animalGraffitiKey(tool:AnimalGraffitiTool,query:string){const q=new URLSearchParams(query);return JSON.stringify([animalGraffitiPath(tool),q.get('model'),q.get('mode'),q.get('tab')]);}
const textNames=['Seedream 5.0 Pro','Seedream 5.0 Lite','Z Image Spicy','GPT Image 2','GPT Image 2.5 Flare','GPT Image 2.5 Sunburst','Nano Banana Pro','Z Image','Wan 2.7 Image Pro','Qwen Image 2.0 Pro','Flux 2 Pro','Flux 2 Flex'];
const imageNames=['Seedream 5.0 Pro','Seedream 5.0 Lite','GPT Image 2','GPT Image 2.5 Flare','GPT Image 2.5 Sunburst','Nano Banana Pro','Wan 2.7 Image Pro','Flux 2 Pro','Flux 2 Flex','Qwen Image Edit Spicy','Qwen Image Edit Max','Wan 2.5'];
export function animalGraffitiModels(mode:GeneratorMode){return (mode==='text'?textNames:imageNames).flatMap(name=>{const model=generatorModels.find(m=>m.kind==='image'&&m.modes[mode]&&m.name===name);return model?[model]:[]});}
// 每次读取配置都核对当前页、当前模式，覆盖切换与会话恢复。
export function animalGraffitiConfig(state:Pick<GeneratorState,'model'|'mode'>){return animalGraffitiModels(state.mode).find(m=>m.id===state.model)?.modes[state.mode];}
export function initializeAnimalGraffiti(query:string):GeneratorState{
 const q=new URLSearchParams(query),raw=q.get('mode'),tab=q.get('tab'),modes:Record<string,GeneratorMode>={'text-to-image':'text','image-to-image':'image'};
 const mode=modes[raw??'']??(tab==='image'?'image':'text'),requested=q.get('model'),match=requested?generatorModel(requested):undefined;
 const valid=match&&animalGraffitiModels(mode).some(m=>m.id===match.id);const model=requested?(valid?match!.id:requested):'nano-banana-pro';
 // 参数采用本批本地初选；公开会话当前值不等同于工厂默认。
 return {path:'/ai-image-models/nano-banana-pro',mode,model,prompt:'',parameters:valid||!requested?normalizeParameters(generatorModel(model)!,mode):{},issues:[...(requested&&!valid?['unknown-model']:[]),...(raw&&!modes[raw]?['unknown-mode']:[]),...(modes[raw??'']&&tab&&modes[raw!]!==tab?['mode-tab-conflict']:[])]};
}
