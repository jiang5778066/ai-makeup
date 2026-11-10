import {it,expect} from 'vitest';
import {createMediaResultStorage,unavailableMediaStorage} from './media-storage';
it('默认存储拒绝，类型伪装不写对象，原结果签名不改状态',async()=>{
 await expect(unavailableMediaStorage.sign('key','image/png')).rejects.toThrow('media_storage_unconfigured');let writes=0;
 const storage=createMediaResultStorage({async read(){throw Error('不可读')},async putImmutable(){writes++},async signPut(){throw Error('不可签PUT')},async signGet(){return 'https://synthetic.invalid/get'}},async()=>({bytes:Buffer.from('<svg/>'),mime:'image/png'}),async()=>({mime:'image/png',width:1,height:1,frames:1}));
 await expect(storage.store({result_locator:'https://synthetic.invalid/result',media_type:'image'} as never)).rejects.toThrow('media_mime_mismatch');expect(writes).toBe(0);
 expect((await storage.sign('original','image/png')).mimeType).toBe('image/png');
});
import {createR2MediaObjectStorage} from './media-storage';
it('R2对象边界未配置安全拒绝且不允许给sealed/result签PUT',async()=>{
 const r2=createR2MediaObjectStorage();await expect(r2.signPut('media/inputs/u/i/key.png','image/png',300)).rejects.toThrow('media_staging_required');
 await expect(r2.read('media/staging/u/i')).rejects.toThrow('media_storage_unconfigured');
});
