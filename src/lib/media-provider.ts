import type {MediaMode,TaskRecord} from './media-contracts';
export type ProviderOutcome =
 | {kind:'accepted';taskId:string}
 | {kind:'complete';taskId:string;locator:string}
 | {kind:'definitive_failure';code:'provider_rejected'|'provider_failed';taskId?:string}
 | {kind:'unknown'};
// 适配器必须把网络错误/响应丢失映射unknown；只有已核协议能证明失败才允许definitive_failure。
export interface MediaProvider {
 readonly modes:readonly MediaMode[];
 submit(task:TaskRecord,inputUrl:string|null):Promise<ProviderOutcome>;
 query(taskId:string,task:TaskRecord):Promise<ProviderOutcome>;
}
export interface MediaProviders {get(model:string):MediaProvider|undefined}
// E2/E3协议与费用尚未获准，不从环境变量推断注册。
export const mediaProviders:MediaProviders=Object.freeze({get:()=>undefined});
