import { describe, expect, it } from 'vitest';
import { normalizeMediaRequest, mediaCapabilities } from './media-catalog';
const base = { clientIntentId:'11111111-1111-4111-8111-111111111111', mediaType:'image', model:'gpt-image-2', mode:'text_to_image', prompt:'陶瓷杯', parameters:{quality:'1k',size:'2:3',n:1}, inputIds:[], locale:'zh-CN',consent:true,consentVersion:'v1' };
describe('媒体服务端能力边界',()=>{
 it('无真实价目/adapter的默认模式全部关闭',()=>{expect(mediaCapabilities().every(x=>!x.enabled)).toBe(true)});
 it('保留明确模型与参数，不以来源编号替代',()=>{expect(normalizeMediaRequest(base).model).toBe('gpt-image-2');expect(()=>normalizeMediaRequest({...base,model:'2100'})).toThrow('unsupported_model')});
 it.each([{foo:1},{quality:'2k',size:'2:3',n:1},{quality:'1k',size:'2:3',n:2}])('拒绝未知或未批准图片参数 %j',parameters=>expect(()=>normalizeMediaRequest({...base,parameters})).toThrow());
 it('图生必须单个输入，文生不得夹带输入',()=>{expect(()=>normalizeMediaRequest({...base,mode:'image_to_image'})).toThrow();expect(()=>normalizeMediaRequest({...base,inputIds:[base.clientIntentId]})).toThrow()});
 it('视频不静默降时长/丢比例或音频',()=>{const video={...base,mediaType:'video',model:'grok-imagine-video-1.5',mode:'text_to_video',parameters:{durationSeconds:5,resolution:'480p'}};expect(normalizeMediaRequest(video).parameters).toEqual(video.parameters);expect(()=>normalizeMediaRequest({...video,parameters:{...video.parameters,ratio:'9:16'}})).toThrow();expect(()=>normalizeMediaRequest({...video,parameters:{durationSeconds:30,resolution:'480p'}})).toThrow()});
 it('不接收用户金额、provider或URL',()=>{expect(()=>normalizeMediaRequest({...base,credits:1})).toThrow();expect(()=>normalizeMediaRequest({...base,provider:'anything'})).toThrow()});
});
