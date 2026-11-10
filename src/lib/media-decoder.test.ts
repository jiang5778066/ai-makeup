// @vitest-environment node
import {it,expect,beforeAll,afterAll,vi} from 'vitest';
import childProcess from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,copyFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {MediaDecoder} from './media-security';
import sharp from 'sharp';
import {createSharpMediaDecoder} from './media-decoder';
it('完整解码真实PNG/JPEG/WebP，拒截断、伪MIME与动画',async()=>{
 const decode=createSharpMediaDecoder();
 for(const format of ['png','jpeg','webp'] as const){const bytes=await sharp({create:{width:24,height:36,channels:3,background:'#f0eeee'}})[format]().toBuffer();expect(await decode(bytes,`image/${format}`)).toEqual({mime:`image/${format}`,width:24,height:36,frames:1});const partial=bytes.subarray(0,Math.floor(bytes.length/2));if(format==='png')expect((await sharp(partial).metadata()).width).toBe(24);await expect(decode(partial,`image/${format}`)).rejects.toThrow();await expect(decode(bytes,'image/fake')).rejects.toThrow()}
 const frames=Buffer.concat([Buffer.alloc(2*2*3,0),Buffer.alloc(2*2*3,255)]);const animated=await sharp(frames,{raw:{width:2,height:4,channels:3,pageHeight:2}}).webp({loop:0,delay:[100,100]}).toBuffer();await expect(decode(animated,'image/webp')).rejects.toThrow();
});
it('大边/像素拒绝，墙钟超时结束子进程且并发有上限',async()=>{
 const bytes=await sharp({create:{width:8193,height:1,channels:3,background:'white'}}).png().toBuffer();await expect(createSharpMediaDecoder()(bytes,'image/png')).rejects.toThrow();
 const png=await sharp({create:{width:10,height:10,channels:3,background:'white'}}).png().toBuffer();const limited=createSharpMediaDecoder({timeoutMs:1,maxConcurrent:1});const first=limited(png,'image/png');const firstRejected=expect(first).rejects.toThrow('media_decode_timeout');await expect(limited(png,'image/png')).rejects.toThrow('media_decoder_busy');await firstRejected;await expect(limited(png,'image/png')).rejects.toThrow('media_decode_timeout');
});

const nodeRequire=createRequire(import.meta.url);
type Factory=(options?:{timeoutMs?:number;maxConcurrent?:number})=>MediaDecoder;
type ChildEvent={argv:readonly string[];pid?:number;killAt?:number;closeAt?:number;code?:number|null;signal?:string|null};
const events:ChildEvent[]=[];
let directory:string,compiled:Factory;
beforeAll(async()=>{
 directory=mkdtempSync(join(tmpdir(),'e2-decoder-webpack-'));
 // 模拟产物依赖位于同级node_modules；坏包sandbox保留自己的独立包。
 symlinkSync(fileURLToPath(new URL('../../node_modules',import.meta.url)),join(directory,'node_modules'),'dir');
 const loader=join(directory,'typescript-loader.cjs');
 writeFileSync(loader,`const ts=require(${JSON.stringify(nodeRequire.resolve('typescript'))});module.exports=function(source){return ts.transpileModule(source,{fileName:this.resourcePath,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText};`);
 const {webpack}=nodeRequire('next/dist/compiled/webpack/webpack');
 // 使用Next实际携带的Webpack解析真实decoder；不是检查源码resolve返回值。
 await new Promise<void>((resolve,reject)=>{
  const compiler=webpack({mode:'production',target:'node20',entry:fileURLToPath(new URL('./media-decoder.ts',import.meta.url)),cache:false,devtool:false,
   externalsPresets:{node:true},externals:{sharp:'commonjs sharp','sharp/package.json':'commonjs sharp/package.json'},
   resolve:{extensions:['.ts','.js']},module:{rules:[{test:/\.ts$/,use:loader}]},optimization:{minimize:false},
   output:{path:directory,filename:'decoder.cjs',library:{type:'commonjs2'}}});
  compiler.run((error:Error|null,stats:{hasErrors():boolean;toString():string})=>compiler.close((closeError:Error|null)=>{
   if(error||closeError||stats.hasErrors())reject(error??closeError??new Error(stats.toString()));else resolve();
  }));
 });
 const spawn=childProcess.spawn;
 vi.spyOn(childProcess,'spawn').mockImplementation(((...args:Parameters<typeof childProcess.spawn>)=>{
  const child=spawn(...args),event:ChildEvent={argv:[...(args[1]??[])],pid:child.pid};events.push(event);
  const kill=child.kill.bind(child);vi.spyOn(child,'kill').mockImplementation(signal=>{event.killAt=Date.now();return kill(signal)});
  child.once('close',(code,signal)=>{event.closeAt=Date.now();event.code=code;event.signal=signal});return child;
 }) as typeof childProcess.spawn);
 compiled=nodeRequire(join(directory,'decoder.cjs')).createSharpMediaDecoder;
},10000);
afterAll(()=>{
 console.log('真实编译child证据',JSON.stringify(events.map(e=>({...e,argv:[...e.argv.slice(0,2),'固定解码脚本',e.argv[3]],sharpPathType:typeof e.argv[3]}))));
 vi.restoreAllMocks();if(directory)rmSync(directory,{recursive:true,force:true});
});

it('真实Webpack产物三格式传绝对sharp文件路径，异cwd仍成功；截断拒绝且全部close',async()=>{
 const previous=process.cwd();mkdirSync(join(directory,'empty-cwd'));process.chdir(join(directory,'empty-cwd'));
 try{
  for(const format of ['png','jpeg','webp'] as const){
   const bytes=await sharp({create:{width:30,height:45,channels:3,background:'red'}})[format]().toBuffer();
   expect(await compiled()(bytes,'image/'+format)).toEqual({mime:'image/'+format,width:30,height:45,frames:1});
   const event=events.at(-1)!;expect(typeof event.argv[3]).toBe('string');expect(isAbsolute(event.argv[3])).toBe(true);
   expect(event.argv[3]).toBe(nodeRequire.resolve('sharp'));expect(event.code).toBe(0);expect(event.closeAt).toBeDefined();
   await expect(compiled()(bytes.subarray(0,Math.floor(bytes.length/2)),'image/'+format)).rejects.toThrow('media_decode_rejected');
  }
 }finally{process.chdir(previous)}
 expect(events.every(e=>e.closeAt!==undefined)).toBe(true);
});

it('真实编译产物超时SIGKILL等close才释放槽，忙后恢复可正常解码',async()=>{
 const bytes=await sharp({create:{width:24,height:36,channels:3,background:'white'}}).png().toBuffer();
 const decode=compiled({timeoutMs:1,maxConcurrent:1}),first=decode(bytes,'image/png');
 const firstRejected=expect(first).rejects.toThrow('media_decode_timeout');
 await expect(decode(bytes,'image/png')).rejects.toThrow('media_decoder_busy');
 await firstRejected;
 const timed=events.at(-1)!;expect(timed.signal).toBe('SIGKILL');expect(timed.closeAt).toBeGreaterThanOrEqual(timed.killAt!);
 // 复用同一槽：第二次实际启动并超时，不能残留busy或后台child。
 await expect(decode(bytes,'image/png')).rejects.toThrow('media_decode_timeout');expect(events.at(-1)?.closeAt).toBeDefined();
 const normal=compiled({maxConcurrent:1}),accepted=normal(bytes,'image/png');
 await expect(normal(bytes,'image/png')).rejects.toThrow('media_decoder_busy');await accepted;
 expect(await normal(bytes,'image/png')).toHaveProperty('width',24);
});

it('产物缺包、版本缺失/错误和版本文件不可读均503去密，零child',async()=>{
 const bytes=await sharp({create:{width:2,height:3,channels:3,background:'white'}}).png().toBuffer();
 for(const kind of ['missing-main','missing-version','wrong-version','blocked-version']){
  const sandbox=join(directory,kind),pkg=join(sandbox,'node_modules/sharp');mkdirSync(pkg,{recursive:true});
  copyFileSync(join(directory,'decoder.cjs'),join(sandbox,'decoder.cjs'));
  const config={name:'sharp',version:kind==='wrong-version'?'0.34.4':kind==='missing-version'?undefined:'0.34.5',exports:{'.':kind==='missing-main'?'./absent.js':'./index.js','./package.json':kind==='blocked-version'?null:'./package.json'}};
  writeFileSync(join(pkg,'package.json'),JSON.stringify(config));writeFileSync(join(pkg,'index.js'),'throw Error("本地替身不得加载");');
  const count=events.length,decode:Factory=nodeRequire(join(sandbox,'decoder.cjs')).createSharpMediaDecoder;
  await expect(decode()(bytes,'image/png')).rejects.toMatchObject({code:'media_decoder_unconfigured',status:503,message:'media_decoder_unconfigured'});
  expect(events).toHaveLength(count);
 }
 expect(readFileSync(join(directory,'decoder.cjs'),'utf8')).toContain('nativeRequire.resolve');
});
