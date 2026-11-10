import {describe,expect,it,vi} from 'vitest';
import {GeneratorUploadStore, validatePreviewFile} from './platform-generator-upload';
const config={max:2,accept:'image/*',maxBytes:10,localByteLimit:false};
const file=(name:string)=>new File(['abc'],name,{type:'image/png'});
function setup(){const pending=new Map<string,{ok:()=>void;fail:()=>void}>();const revoke=vi.fn();let i=0;const store=new GeneratorUploadStore(config,{create:()=>`blob:${++i}`,revoke,decode:(_f,url)=>new Promise<void>((resolve,reject)=>pending.set(url,{ok:resolve,fail:()=>reject(new Error('decode'))}))});return{store,pending,revoke};}
async function settle(){await Promise.resolve();await Promise.resolve();}
describe('本地上传slot所有权',()=>{
 it('普通A与B都可完成预览，取消选图不删除已有A',async()=>{const{store,pending}=setup();store.add([file('A')]);pending.get('blob:1')!.ok();await settle();expect(store.snapshot()[0].status).toBe('ready');store.add([]);store.add([file('B')]);pending.get('blob:2')!.ok();await settle();expect(store.snapshot().map(x=>x.status)).toEqual(['ready','ready']);});
 it('慢A替换B后不能覆盖或撤销B',async()=>{const{store,pending,revoke}=setup();store.add([file('A')]);const id=store.snapshot()[0].id;store.replace(id,file('B'));pending.get('blob:1')!.ok();await settle();expect(store.snapshot()[0].file.name).toBe('B');expect(revoke).not.toHaveBeenCalledWith('blob:2');pending.get('blob:2')!.ok();await settle();expect(store.snapshot()[0]).toMatchObject({url:'blob:2',status:'ready'});});
 it('删除、换限制或销毁使旧回调失效；每个URL只释放一次',async()=>{const{store,pending,revoke}=setup();store.add([file('A')]);store.remove(store.snapshot()[0].id);pending.get('blob:1')!.ok();await settle();expect(store.snapshot()).toEqual([]);store.add([file('B')]);store.reset(config);pending.get('blob:2')!.ok();await settle();expect(store.snapshot()).toEqual([]);store.add([file('C')]);store.dispose();pending.get('blob:3')!.ok();await settle();expect(store.snapshot()).toEqual([]);expect(revoke.mock.calls.map(x=>x[0])).toEqual(['blob:1','blob:2','blob:3']);});
 it('拒绝格式时也通知UI快照，正常已有文件保持不变',async()=>{const{store,pending}=setup();store.add([file('A')]);pending.get('blob:1')!.ok();await settle();const before=store.snapshot();store.add([new File(['x'],'wrong.txt',{type:'text/plain'})]);expect(store.error).toBe('type');expect(store.snapshot()).not.toBe(before);expect(store.snapshot()[0].file.name).toBe('A');});
 it('校验type/bytes/数量和真实解码错误，失败不占有效slot',async()=>{expect(validatePreviewFile(new File(['x'],'x.txt',{type:'text/plain'}),config)).toBe('type');expect(validatePreviewFile(new File(['x'.repeat(11)],'x.png',{type:'image/png'}),config)).toBe('size');const{store,pending}=setup();store.add([file('A'),file('B'),file('C')]);expect(store.snapshot()).toHaveLength(2);expect(store.error).toBe('count');pending.get('blob:1')!.fail();await settle();expect(store.snapshot()).toHaveLength(1);expect(store.error).toBe('decode');});
});

describe('Kling参照视频准确接入',()=>{
 it('真实配置让视频进入解码流程，音频/超字节不进入；Keyframes仍拒绝视频',async()=>{
  const {generatorModels}=await import('./platform-generator-data');const reference=generatorModels.find(m=>m.id==='kling-4-0')!.modes.image!.reference!;
  const decode=vi.fn().mockResolvedValue(undefined),revoke=vi.fn();let n=0;const store=new GeneratorUploadStore(reference,{create:()=>`blob:k${++n}`,revoke,decode});
  const video=new File(['local-video'],'local.webm',{type:'video/webm'});store.add([video]);await settle();
  expect(decode).toHaveBeenCalledWith(video,'blob:k1');expect(store.snapshot()[0]).toMatchObject({file:video,status:'ready'});
  expect(validatePreviewFile(new File(['x'],'sound.mp3',{type:'audio/mpeg'}),reference)).toBe('type');expect(validatePreviewFile(new File([new Uint8Array(10485761)],'large.webm',{type:'video/webm'}),reference)).toBe('size');
  expect(validatePreviewFile(video,{...reference,accept:'image/*'})).toBe('type');expect(reference.max).toBe(15);
  store.replace(store.snapshot()[0].id,file('image.png'));await settle();expect(store.snapshot()[0].file.name).toBe('image.png');expect(revoke).toHaveBeenCalledWith('blob:k1');store.dispose();expect(revoke).toHaveBeenCalledWith('blob:k2');
 });
});
