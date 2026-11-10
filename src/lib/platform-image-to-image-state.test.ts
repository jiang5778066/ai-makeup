import {describe,it,expect} from 'vitest';
import {initializeImageToImage,selectImageToImageModel,selectImageToImageMode,imageToImageConfig,restoreImageToImage} from './platform-image-to-image-state';
describe('图生图专页隔离',()=>{
 it('拒绝共享已知但本页图生图不支持的模型及完全未知模型',()=>{for(const model of ['z-image','not-a-model']){const state=initializeImageToImage(`model=${model}`);expect(state.model).toBe(model);expect(imageToImageConfig(state)).toBeUndefined();expect(state.issues).toContain('unsupported-model');const restored=selectImageToImageModel(state,'nano-banana-pro');expect(imageToImageConfig(restored)?.reference?.max).toBe(8);expect(restored.issues).toEqual([]);}});
 it('模式切换与会话恢复重新经过本页允许集合',()=>{const text=initializeImageToImage('mode=text-to-image&model=z-image');expect(imageToImageConfig(text)).toBeDefined();const image=selectImageToImageMode(text,'image');expect(imageToImageConfig(image)).toBeUndefined();expect(imageToImageConfig(restoreImageToImage({...text,mode:'image'}))).toBeUndefined();});
 it('非法模式不激活参数及文件，主动选择正常模式恢复',()=>{const state=initializeImageToImage('mode=bad');expect(imageToImageConfig(state)).toBeUndefined();expect(state.issues).toContain('unknown-mode');expect(imageToImageConfig(selectImageToImageMode(state,'image'))).toBeDefined();});
});

import {ImageToImageSessions} from './platform-image-to-image-state';
it('旧语言owner不能覆盖新语言owner；释放文件后只恢复文本参数',()=>{const sessions=new ImageToImageSessions(),initial=initializeImageToImage('');const first=sessions.acquire('page',initial);sessions.write('page',first,{...initial,prompt:'保留面容'});sessions.files('page',first,true);sessions.release('page',first);const second=sessions.acquire('page',initial);sessions.write('page',first,{...initial,prompt:'旧owner'});sessions.release('page',first);expect(sessions.read('page')?.owner).toBe(second);expect(sessions.read('page')?.state.prompt).toBe('保留面容');expect(sessions.read('page')?.filesReleased).toBe(true);expect(sessions.read('page')?.hasFiles).toBe(false);});
