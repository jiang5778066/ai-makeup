import { MediaFault, mediaUuid, strictObject, type MediaEconomics, type MediaMode, type MediaRequest } from './media-contracts';
export const mediaModes:MediaMode[]=['text_to_image','image_to_image','text_to_video','image_to_video'];
export function normalizeMediaRequest(value:unknown):MediaRequest {
 const b=strictObject(value,['clientIntentId','mediaType','model','mode','prompt','parameters','inputIds','locale','consent','consentVersion']);
 if(typeof b.clientIntentId!=='string'||!mediaUuid.test(b.clientIntentId)||b.consent!==true||typeof b.consentVersion!=='string'||!b.consentVersion||b.consentVersion.length>100)throw new MediaFault('consent_or_intent_invalid');
 if(!['image','video'].includes(String(b.mediaType))||!mediaModes.includes(b.mode as MediaMode))throw new MediaFault('unsupported_mode');
 const image=b.mediaType==='image';
 if(b.model!==(image?'gpt-image-2':'grok-imagine-video-1.5'))throw new MediaFault('unsupported_model');
 if(!String(b.mode).endsWith(image?'_image':'_video'))throw new MediaFault('unsupported_mode');
 const p=strictObject(b.parameters,image?['quality','size','n']:['durationSeconds','resolution']);
 if(image?(p.quality!=='1k'||p.size!=='2:3'||p.n!==1):(p.durationSeconds!==5||p.resolution!=='480p'))throw new MediaFault('unsupported_parameters');
 if(typeof b.prompt!=='string')throw new MediaFault('invalid_prompt');
 const prompt=b.prompt.normalize('NFC').replace(/\r\n?/g,'\n').trim();
 if(!prompt||prompt.length>3800)throw new MediaFault('invalid_prompt');
 if(!Array.isArray(b.inputIds)||b.inputIds.some(x=>typeof x!=='string'||!mediaUuid.test(x))||b.inputIds.length!==(String(b.mode).startsWith('image_to_')?1:0))throw new MediaFault('invalid_inputs');
 if(b.locale!=='en'&&b.locale!=='zh-CN')throw new MediaFault('invalid_locale');
 return {clientIntentId:b.clientIntentId,mediaType:b.mediaType as MediaRequest['mediaType'],model:b.model as string,mode:b.mode as MediaMode,prompt,parameters:p as MediaRequest['parameters'],inputIds:b.inputIds,locale:b.locale,consent:true,consentVersion:b.consentVersion};
}
export type MediaCatalog = { consentVersion:string; enabled:boolean; tariffs:Partial<Record<MediaMode,MediaEconomics>>; adapterModes:readonly MediaMode[] };
// 未获准的真实价目、预算和适配器不注册；测试只经构造函数显式注入。
export const closedMediaCatalog:MediaCatalog=Object.freeze({consentVersion:'media-v1',enabled:false,tariffs:{},adapterModes:[]});
export const mediaCapabilities=(catalog:MediaCatalog=closedMediaCatalog)=>mediaModes.map(mode=>({id:mode,mode,mediaType:mode.endsWith('_image')?'image':'video',model:mode.endsWith('_image')?'gpt-image-2':'grok-imagine-video-1.5',parameters:mode.endsWith('_image')?{quality:['1k'],size:['2:3'],n:[1]}:{durationSeconds:[5],resolution:['480p']},input:{count:mode.startsWith('image_to_')?1:0,mimeTypes:['image/png','image/jpeg','image/webp'],maxBytes:8388608},enabled:Boolean(catalog.enabled&&catalog.tariffs[mode]&&catalog.adapterModes.includes(mode)),unavailableReason:catalog.enabled?'media_unconfigured':'media_disabled'}));
export function economicsFor(catalog:MediaCatalog,request:MediaRequest) {
 const e=catalog.tariffs[request.mode];
 if(!catalog.enabled||!catalog.adapterModes.includes(request.mode)||!e)throw new MediaFault('media_pricing_unavailable',503);
 if(request.consentVersion!==catalog.consentVersion)throw new MediaFault('consent_version_invalid');
 return e;
}
