import { describe, expect, it } from 'vitest';
import { GeneratorSessions } from './platform-generator-session';
import { initializeWallpaperBanner, wallpaperBannerKey, wallpaperBannerModels } from './platform-wallpaper-banner-state';

describe('壁纸与横幅的准确模型及有界状态',()=>{
 it('两个专页保留各自观察到的参数，提示词不混入旧账户恢复值',()=>{
  expect(initializeWallpaperBanner('wallpaper','')).toMatchObject({model:'nano-banana-pro',mode:'text',prompt:'',parameters:{resolution:'1K',ratio:'Auto'}});
  expect(initializeWallpaperBanner('banner','')).toMatchObject({model:'nano-banana-pro',mode:'text',prompt:'',parameters:{resolution:'2K',ratio:'16:9'}});
  expect(wallpaperBannerModels.map(m=>m.referenceId)).toEqual(['2403','2400','1401','2100','2110','2111','1000','1400','1402','1403','1300','1301']);
 });
 it('未知模型保留身份且没有参数，不静默换模型；重复参数取首值',()=>{
  expect(initializeWallpaperBanner('banner','model=unknown&model=1000')).toMatchObject({model:'unknown',parameters:{},issues:['unknown-model']});
  expect(initializeWallpaperBanner('wallpaper','model=2100&mode=text-to-image&ratio=16%3A9&ratio=9%3A16')).toMatchObject({model:'gpt-image-2',parameters:{ratio:'16:9'}});
  expect(initializeWallpaperBanner('banner','mode=bad&resolution=bad').issues).toEqual(['unknown-mode','unsupported-resolution']);
 });
 it('语言与追踪参数不分裂会话，工具与真实参数隔离，过期所有者不能回写',()=>{
  const a=wallpaperBannerKey('wallpaper','ratio=16%3A9&track=a');
  expect(a).toBe(wallpaperBannerKey('wallpaper','ratio=16%3A9&track=b'));
  expect(a).not.toBe(wallpaperBannerKey('banner','ratio=16%3A9'));
  const store=new GeneratorSessions(8),initial=initializeWallpaperBanner('wallpaper','');const owner=store.acquire(a,initial);
  store.write(a,owner,{...initial,prompt:'保留文本'});store.markFiles(a,owner);store.release(a,owner);
  const next=store.acquire(a,initial);expect(store.read(a)).toMatchObject({state:{prompt:'保留文本'},filesReleased:true});expect(store.write(a,owner,{...initial,prompt:'旧回调'})).toBe(false);
  store.release(a,next);for(let i=0;i<8;i++)store.acquire('another'+i,initial);expect(store.read(a)).toBeUndefined();
 });
});
