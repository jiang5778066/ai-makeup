import { generatorModels, generatorPages, type GeneratorConfig, type GeneratorMode, type GeneratorModel, type GeneratorPath } from './platform-generator-data';
import { isVideoModeToolPath, videoModeTools } from './platform-video-mode-tools';
import { MEDIA_PROMPT_LIMIT, mediaCapabilities } from './media-catalog';

const imageToVideoInput = mediaCapabilities().find(capability => capability.mode === 'image_to_video')!.input;
const siteVideoReference = {
 max: imageToVideoInput.count,
 accept: imageToVideoInput.mimeTypes.join(','),
 maxBytes: imageToVideoInput.maxBytes,
 localByteLimit: true
};
export type GeneratorParameters = {resolution?:string;ratio?:string;duration?:number;sound?:boolean;multishot?:boolean;enhance?:boolean;submode?:'reference'|'keyframes';flavor?:string};
export type GeneratorState = {path:GeneratorPath;mode:GeneratorMode;model:string;prompt:string;parameters:GeneratorParameters;issues:string[]};
export function generatorModel(id:string) { return generatorModels.find(m=>m.id===id||m.referenceId===id); }
export function generatorConfig(state:Pick<GeneratorState,'model'|'mode'> & Partial<Pick<GeneratorState,'path'>>) {
 const model = generatorModel(state.model);
 const config = model?.modes[state.mode];
 if (!state.path || !isVideoModeToolPath(state.path)) return config;
 if (model?.kind !== 'video' || !config || model.id !== videoModeTools[state.path].defaultModel) {
  return model?.kind === 'video' ? config : undefined;
 }
 return { ...config, promptLimit: MEDIA_PROMPT_LIMIT, reference: state.mode === 'image' ? siteVideoReference : undefined };
}
export function normalizeParameters(model:GeneratorModel,mode:GeneratorMode,old:GeneratorParameters={}):GeneratorParameters {
 const config=model.modes[mode];if(!config)return {};
 const pick=(list:string[],value?:string)=>list.includes(value??'')?value:list[0];
 let duration=config.durationRange?Math.max(config.durationRange[0],Math.min(config.durationRange[1],old.duration??config.durationRange[0])):config.durations?.includes(old.duration??NaN)?old.duration:config.durations?.[0];
 // 已观察的具体会员门槛不可由URL、内存或模型切换绕过。
 if(model.id==='wan-2-5'&&duration===10)duration=5;
 return {resolution:pick(config.resolutions,old.resolution),ratio:pick(config.ratios,old.ratio),duration,sound:config.sound?old.sound??false:undefined,multishot:config.multishot?old.multishot??false:undefined,enhance:config.enhance?old.enhance??true:undefined,submode:config.keyframes?old.submode??'reference':undefined,flavor:config.flavors?pick(config.flavors,old.flavor):undefined};
}
export function stateIssues(state:GeneratorState):string[] {
 const model=generatorModel(state.model),page=generatorPages[state.path];const config=model?.kind===page.kind?generatorConfig(state):undefined;
 return [...(!model||model.kind!==page.kind?['unknown-model']:!config?['unsupported-mode']:[]),...(config&&state.prompt.length>config.promptLimit?['prompt-too-long']:[])];
}
export function initializeGenerator(path:GeneratorPath,query:string):GeneratorState {
 const q=new URLSearchParams(query),page=generatorPages[path];const rawMode=q.get('mode'),tab=q.get('tab');
 const modes:Record<string,GeneratorMode>=page.kind==='image'?{'text-to-image':'text','image-to-image':'image'}:{'text-to-video':'text','image-to-video':'image'};
 const defaultText=path==='/ai-image-generator'||path==='/ai-video-generator';
 // 工具路径固定生成模式，查询仍由导航保留以兼容历史链接。
 const tool = isVideoModeToolPath(path) ? videoModeTools[path] : undefined;
 const mode=tool?.mode??modes[rawMode??'']??(tab==='text'?'text':tab==='image'?'image':defaultText?'text':'image');const requested=q.get('model');const match=requested?generatorModel(requested):null;
 const dedicated=page.family==='gpt'||page.family==='nano'||page.family==='wan';const variant=page.defaultModel==='wan-3-0'&&['wan-3-0','wan-3-0-pro','wan-3-0-prime','wan-3-0-prime-pro'].includes(match?.id??'');const model=dedicated?(variant?match!.id:page.defaultModel):match?.id??requested??page.defaultModel;
 const issues=[...(!tool&&rawMode&&!modes[rawMode]?['unknown-mode']:[]),...(!tool&&modes[rawMode??'']&&tab&&modes[rawMode!]!==tab?['mode-tab-conflict']:[]),...(dedicated&&requested&&!variant&&match?.id!==page.defaultModel?['path-model-conflict']:[]),...(requested&&(!match||match.kind!==page.kind)?['unknown-model']:[])];
 const selected=generatorModel(model);const state:GeneratorState={path,model,mode,prompt:'',parameters:selected?normalizePageParameters(path,selected,mode):{},issues:[]};state.issues=[...issues,...stateIssues(state)];return state;
}
export function changeGeneratorModel(state:GeneratorState,id:string):GeneratorState {
 const model=generatorModel(id);const next={...state,model:model?.id??id,parameters:model?normalizePageParameters(state.path,model,state.mode,state.parameters):{},issues:[]};return {...next,issues:stateIssues(next)};
}
export function changeGeneratorMode(state:GeneratorState,mode:GeneratorMode):GeneratorState {
 const model=generatorModel(state.model);const next={...state,mode,parameters:model?normalizePageParameters(state.path,model,mode,state.parameters):{},issues:[]};return {...next,issues:stateIssues(next)};
}
export function selectDuration(state:GeneratorState,duration:number):{state:GeneratorState;gated:boolean} {
 if(wanDurationGated(state,duration)||(state.model==='wan-2-5'&&duration===10))return {state,gated:true};
 const model=generatorModel(state.model);return {state:model?{...state,parameters:normalizePageParameters(state.path,model,state.mode,{...state.parameters,duration})}:state,gated:false};
}
export function promptLimit(config:GeneratorConfig|undefined) { return config?.promptLimit??20000; }

// 门槛只属于本批专页当前模型/模式，不改变通用生成器已闭合合同。
export function wanDurationGated(state:Pick<GeneratorState,'path'|'model'|'mode'>,duration:number){return generatorPages[state.path].family==='wan'&&!!generatorModel(state.model)?.modes[state.mode]&&((state.model==='wan-2-5'&&[5,10].includes(duration))||(state.model==='wan-2-6'&&[5,10,15].includes(duration)));}
export function normalizePageParameters(path:GeneratorPath,model:GeneratorModel,mode:GeneratorMode,old:GeneratorParameters={}):GeneratorParameters{const next=normalizeParameters(model,mode,old);if(generatorPages[path].family==='wan'&&(model.id==='wan-2-5'||model.id==='wan-2-6'))next.duration=5;return next;}
