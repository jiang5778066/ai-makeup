import {describe,it,expect} from 'vitest';
import {albumInitialize,albumSelectModel,albumSelectMode,albumConfig,albumQueryKey,albumSessionKey,AlbumSessions} from './platform-album-cover-state';
import {albumModels} from './platform-album-cover-models';
import {generatorModels} from './platform-generator-data';
describe('专辑封面参数边界',()=>{
 it.each(generatorModels.flatMap(m=>(['image','text'] as const).map(mode=>({m,mode}))))('共享模型 $m.id 在 $mode 模式必须受本页白名单约束',({m,mode})=>{const allowed=albumModels.some(c=>c.mode===mode&&c.id===m.referenceId);const s=albumInitialize(`mode=${mode==='text'?'text-to-image':'image-to-image'}&model=${m.id}`,'en');expect(!!albumConfig(s)).toBe(allowed);if(!allowed)expect(s.model).toBe(m.id)});
 it('原件默认文生图、2403、1K、1:1和独有提示词',()=>{const s=albumInitialize('','zh-CN');expect(s).toMatchObject({mode:'text',model:'2403',resolution:'1K',ratio:'1'});expect(s.prompt).toContain('专辑封面');expect(s.issues).toEqual([])});
 it.each(albumModels)('$mode $id 在准确列表内并保留模式参数',c=>{const s=albumInitialize(`mode=${c.mode==='text'?'text-to-image':'image-to-image'}&model=${c.slug}`,'en');expect(s.issues).toEqual([]);expect(albumConfig(s)?.id).toBe(c.id);expect(albumConfig(s)?.resolutions).toEqual(c.resolutions)});
 it.each(['model=2403&model=bad','model=bad&model=2403','model=2403&model=2100','model=2403&model=','model=wan-3-0','model=2403&mode=bad','mode=text-to-image&mode=image-to-image','mode=text-to-image&mode=bad','tab=text&tab=image','mode=text-to-image&tab=image','mode=&tab=text','mode=text-to-image&tab=','tab=unknown&tab=text'])('检查重复后值、越界及别名冲突 %s',query=>{const s=albumInitialize(query,'en');expect(s.issues.length).toBeGreaterThan(0);expect(albumConfig(s)).toBeUndefined()});
 it('相同重复值和规范别名可归一',()=>{const s=albumInitialize('model=2403&model=seedream-5-0-pro&mode=text-to-image&mode=text-to-image&tab=text','en');expect(s.issues).toEqual([])});
 it('跨模式已知模型不回退，切tab不能清除模型错误',()=>{const s=albumInitialize('model=1401&mode=image-to-image','en');expect(albumConfig(s)).toBeUndefined();expect(albumConfig(albumSelectMode(s,'text'))).toBeUndefined();expect(albumSelectModel(albumSelectMode(s,'text'),'2403').issues).toEqual([])});
 it('模式错误只能通过合法tab恢复，模型选择不能掩盖',()=>{const s=albumInitialize('mode=bad','en');expect(albumSelectModel(s,'2403').issues).toContain('mode');expect(albumSelectMode(s,'image').issues).toEqual([])});
 it('模式切换保留提示词，清除无依据参数和增强',()=>{const s=albumInitialize('model=1400','en');const next=albumSelectMode({...s,prompt:'我自己的方向',enhance:true},'image');expect(next.prompt).toBe('我自己的方向');expect(albumConfig(next)).toBeUndefined();expect(next.enhance).toBe(false)});
 it('完整重复query和语言构成隔离边界，锚点不构成新会话',()=>{expect(albumQueryKey('model=2403&model=bad')).not.toBe(albumQueryKey('model=2403'));expect(albumSessionKey('en','a=1')).not.toBe(albumSessionKey('zh-CN','a=1'));expect(albumQueryKey('a=1#generator')).toBe(albumQueryKey('a=1'))});
 it('旧会话owner不能覆盖新会话，最多保留8个有界文字记录',()=>{const sessions=new AlbumSessions();const a=sessions.acquire('en:a',albumInitialize('','en'));const b=sessions.acquire('en:a',albumInitialize('','en'));sessions.write('en:a',a,{...albumInitialize('','en'),prompt:'旧'});expect(sessions.read('en:a')?.state.prompt).not.toBe('旧');sessions.write('en:a',b,{...albumInitialize('','en'),prompt:'新'});sessions.release('en:a',a);expect(sessions.read('en:a')?.state.prompt).toBe('新');for(let i=0;i<9;i++)sessions.acquire(String(i),albumInitialize('','en'));expect(sessions.read('en:a')).toBeUndefined()});
});

describe('返工01：模式白名单与文字容量',()=>{
 it.each(['toString','constructor','__proto__','hasOwnProperty'])('原型名称 %s 不能成为运行时模式',value=>{
  const state=albumInitialize(`mode=${value}`,'en');
  expect(state.mode).toBe('text');
  expect(state.issues).toContain('mode');
  expect(albumConfig(state)).toBeUndefined();
 });
 it.each(['mode=toString&mode=text-to-image','mode=text-to-image&mode=constructor','mode=__proto__&tab=text','tab=text&mode=hasOwnProperty','mode=image-to-image&mode=toString&tab=image'])('非法重复值不能被合法值掩盖：%s',query=>{
  const state=albumInitialize(query,'en');
  expect(['text','image']).toContain(state.mode);
  expect(state.issues).toContain('mode');
 });
 it.each(['mode=text-to-image&mode=text-to-image&tab=text&tab=text','mode=image-to-image&mode=image-to-image&tab=image&tab=image'])('同义合法重复值仍然可用：%s',query=>expect(albumInitialize(query,'en').issues).toEqual([]));
 it.each([128,129,100000])('非法模型长度 %i 的诊断最多128个UTF-16单元且始终阻断',length=>{
  const raw='x'.repeat(length),state=albumInitialize(`model=${raw}`,'en');
  expect(state.model.length).toBeLessThanOrEqual(128);
  expect(state.issues).toContain('model');
  expect(albumConfig(state)).toBeUndefined();
  if(length===128)expect(state.model).toBe(raw);
 });
 it('超长模式稳定退到合法渲染模式并保留错误',()=>{
  const state=albumInitialize(`mode=${'x'.repeat(100000)}`,'en');
  expect(state.mode).toBe('text');expect(state.issues).toEqual(['mode']);
 });
 it.each(['2403','seedream-5-0-pro'])('不将超长参数截成合法模型 %s',prefix=>{
  const state=albumInitialize(`model=${prefix}${'x'.repeat(100000)}`,'en');
  expect(state.issues).toContain('model');expect(albumConfig(state)).toBeUndefined();
  expect(albumSelectMode(state,'text').issues).toContain('model');
 });
 it('每一个重复后值均校验，包括超长非法参数之后的合法值',()=>{
  const raw='x'.repeat(100000);
  for(const query of [`model=2403&model=${raw}`,`model=${raw}&model=2403`,`model=2403&model=${raw}&model=2403`]){
   const state=albumInitialize(query,'en');expect(state.model.length).toBeLessThanOrEqual(128);expect(state.issues).toContain('model');
  }
 });
 it('直接写入也先限制模型、提示词、非法模式及无依据参数',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en'),owner=sessions.acquire('write-bounds',initial);
  sessions.write('write-bounds',owner,{...initial,model:'x'.repeat(100000),prompt:'p'.repeat(20001),resolution:'r'.repeat(100000),ratio:'a'.repeat(100000),enhance:true});
  const state=sessions.read('write-bounds')!.state;
  expect(state.model.length).toBeLessThanOrEqual(128);expect(state.prompt).toHaveLength(20000);
  expect(state).toMatchObject({resolution:'',ratio:'',enhance:false});expect(state.issues).toContain('model');
 });
 it('缓存key边界内完整保留，边界外不进入持久会话',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en');
  const inside='k'.repeat(4096),outside=inside+'x';
  sessions.acquire(inside,initial);sessions.acquire(outside,initial);
  expect(sessions.read(inside)?.state).toEqual(initial);expect(sessions.read(outside)).toBeUndefined();
 });
 it('相同超长前缀的不同query保持完整不同身份，均不缓存',()=>{
  const prefix='x='+ 'a'.repeat(100000),a=albumSessionKey('en',prefix+'A'),b=albumSessionKey('en',prefix+'B');
  expect(a).not.toBe(b);expect(a).toContain('A');expect(b).toContain('B');
  const sessions=new AlbumSessions();sessions.acquire(a,albumInitialize('','en'));sessions.acquire(b,albumInitialize('','en'));
  expect(sessions.read(a)).toBeUndefined();expect(sessions.read(b)).toBeUndefined();
 });
 it('八条以内累计容量也淘汰最早记录，保留最新记录',()=>{
  const sessions=new AlbumSessions(),large={...albumInitialize('','en'),prompt:'中'.repeat(20000)};
  for(let i=0;i<4;i++)sessions.acquire(`capacity-${i}`,large);
  expect(sessions.read('capacity-0')).toBeUndefined();
  expect(sessions.read('capacity-3')?.state.prompt).toBe(large.prompt);
 });
 it('写入增长也执行总容量淘汰',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en'),owners=[];
  for(let i=0;i<4;i++)owners.push(sessions.acquire(`grow-${i}`,initial));
  for(let i=0;i<4;i++)sessions.write(`grow-${i}`,owners[i],{...initial,prompt:'p'.repeat(20000)});
  expect(sessions.read('grow-0')).toBeUndefined();expect(sessions.read('grow-3')?.state.prompt).toHaveLength(20000);
 });
 it('正常恢复、语言隔离与失效owner的写入和release保持有效',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en'),en=albumSessionKey('en','r=owners'),zh=albumSessionKey('zh-CN','r=owners');
  const old=sessions.acquire(en,initial);sessions.write(en,old,{...initial,prompt:'已保存'});sessions.release(en,old);
  const current=sessions.acquire(en,initial);sessions.acquire(zh,albumInitialize('','zh-CN'));
  sessions.write(en,old,{...initial,prompt:'旧owner非法写入'});sessions.release(en,old);
  expect(sessions.read(en)?.state.prompt).toBe('已保存');expect(sessions.read(zh)?.state.prompt).not.toBe('已保存');
  sessions.release(en,current);sessions.write(en,current,{...initial,prompt:'释放后非法写入'});
  expect(sessions.read(en)?.state.prompt).toBe('已保存');
 });
});

describe('返工01：容量预算极值',()=>{
 it('20000单元的可编辑文字不因JSON转义膨胀而丢失当前记录',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en'),owner=sessions.acquire('escape',initial);
  const prompt='\u0001'.repeat(20000);
  sessions.write('escape',owner,{...initial,prompt});
  expect(sessions.read('escape')?.state.prompt).toBe(prompt);
 });
 it('边界模型诊断不是截断后的合法ID，后续合法写入可恢复',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en'),owner=sessions.acquire('recover',initial);
  sessions.write('recover',owner,{...initial,model:'2403'+'x'.repeat(100000)});
  const bad=sessions.read('recover')!.state;
  expect(bad.model).toHaveLength(128);expect(bad.issues).toContain('model');
  sessions.write('recover',owner,albumSelectModel(bad,'2403'));
  expect(sessions.read('recover')?.state.issues).toEqual([]);
 });
 it('淘汰并重新取得同key之后，旧owner仍不能污染新记录',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en'),old=sessions.acquire('evicted',initial);
  for(let i=0;i<8;i++)sessions.acquire(`next-${i}`,initial);
  expect(sessions.read('evicted')).toBeUndefined();
  const current=sessions.acquire('evicted',initial);
  sessions.write('evicted',old,{...initial,prompt:'过期'});sessions.release('evicted',old);
  sessions.write('evicted',current,{...initial,prompt:'有效'});
  expect(sessions.read('evicted')?.state.prompt).toBe('有效');
 });
});

describe('返工01：当前编辑优先保留',()=>{
 it('旧记录重新编辑导致超容量时淘汰其他最早记录，不丢当前输入',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en'),owner=sessions.acquire('editing-old',initial);
  for(let i=0;i<3;i++)sessions.acquire(`large-${i}`,{...initial,prompt:'大'.repeat(20000)});
  sessions.write('editing-old',owner,{...initial,prompt:'新'.repeat(20000)});
  expect(sessions.read('editing-old')?.state.prompt).toBe('新'.repeat(20000));
  expect(sessions.read('large-0')).toBeUndefined();
 });
});

describe('返工01：容量精确边界',()=>{
 it('8条小记录均能恢复，第9条才按数量淘汰',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en');
  for(let i=0;i<8;i++)sessions.acquire(`small-${i}`,initial);
  for(let i=0;i<8;i++)expect(sessions.read(`small-${i}`)).toBeDefined();
  sessions.acquire('small-8',initial);
  expect(sessions.read('small-0')).toBeUndefined();expect(sessions.read('small-1')).toBeDefined();
 });
 it('128KiB文字预算恰好容纳4条，增加一个UTF-16单元后才淘汰',()=>{
  const sessions=new AlbumSessions(),initial=albumInitialize('','en'),owners=[];
  // 每条固定文字13单元、固定预算128字节，加16307单元提示词，共32768字节。
  for(let i=0;i<4;i++)owners.push(sessions.acquire(`b${i}`,{...initial,prompt:'p'.repeat(16307)}));
  for(let i=0;i<4;i++)expect(sessions.read(`b${i}`)?.state.prompt).toHaveLength(16307);
  sessions.write('b3',owners[3],{...initial,prompt:'p'.repeat(16308)});
  expect(sessions.read('b0')).toBeUndefined();expect(sessions.read('b1')).toBeDefined();expect(sessions.read('b3')?.state.prompt).toHaveLength(16308);
 });
});
