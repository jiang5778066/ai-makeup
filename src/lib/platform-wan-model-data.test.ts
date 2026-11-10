import{describe,it,expect}from'vitest';
import{initializeWan,wanSelectionKey,wanPages,isWanPath}from'./platform-wan-model-data';
import{changeGeneratorModel,changeGeneratorMode,selectDuration}from'./platform-generator-parameters';
import{initializeGenerator}from'./platform-generator-parameters';
import{GeneratorSessions}from'./platform-generator-session';
import{wanContent}from'./platform-wan-model-data';
const p25='/ai-video-models/wan-2-5',p26='/ai-video-models/wan-2-6',p30='/ai-video-models/wan-3-0';
describe('Wan专页准确身份与有界参数',()=>{
 it('25中文开源/离线/模型选择各保留独立核心命题，不能用泛化提示替换',()=>{const faq=wanContent[p25].faq;const open=faq[1].answer['zh-CN'],local=faq[2].answer['zh-CN'],choice=faq[9].answer['zh-CN'];for(const word of ['采集时','可下载','开源权重','Wan 2.2','云端'])expect(open).toContain(word);for(const word of ['完全离线','API','节点','云端'])expect(local).toContain(word);for(const word of ['Veo 3','写实音画','对白','多人','Wan 2.5','10秒','图生','单场景'])expect(choice).toContain(word);});
 it('Fusion格式题使用本题五格式和720p—8K，不能串用导出段WebM',()=>{const q=wanContent['/ai-video-models/wan-fusionX'].faq[3];for(const locale of ['en','zh-CN']as const){for(const format of ['MP4','MOV','AVI','MKV','WMV','720p','8K'])expect(q.answer[locale]).toContain(format);expect(q.answer[locale]).not.toContain('WebM');}expect(q.answer['zh-CN']).toContain('采集时');});
 it('安全与商业许可和立即可用均有局部外部主体，不能靠页首声明抵消保证',()=>{const safe=wanContent['/ai-video-models/wan-2-2'].faq[7].answer;expect(safe.en).toContain('Lanta AI');expect(safe.en).toContain('not verified');expect(safe['zh-CN']).toContain('未验证');expect(safe['zh-CN']).not.toMatch(/^安全/);const fusion=wanContent['/ai-video-models/wan-fusionX'];expect(fusion.faq[6].answer.en).toContain('does not grant');expect(fusion.faq[7].answer.en).toContain('not connected');expect(fusion.faq[7].answer.en).not.toContain("You'll immediately have access");for(const b of [wanContent['/ai-video-models/wan-3-0'].blocks[3],fusion.blocks[2]])for(const item of b.items??[]){expect(item.text.en).not.toMatch(/\bour\b/i);expect(item.text['zh-CN']).not.toContain('我们的');}});
 it('四路径精确初选，Fusion无provider；冲突不替换路径身份',()=>{for(const [path,model]of [['/ai-video-models/wan-2-2','wan-2-2'],[p25,'wan-2-5'],[p26,'wan-2-6'],[p30,'wan-3-0']]as const)expect(initializeWan(path,'').model).toBe(model);expect(isWanPath('/ai-video-models/wan-fusionX')).toBe(true);expect(wanPages['/ai-video-models/wan-fusionX'].form).toBe(false);const s=initializeWan(p25,'model=805');expect(s.model).toBe('wan-2-5');expect(s.issues).toContain('path-model-conflict')});
 it('四30版本支持图文准确画质，22的1080与30的30秒合法',()=>{for(const [id,resolution]of [['805','480P'],['806','4K'],['807','720P'],['808','2K']])for(const mode of ['image-to-video','text-to-video']){const s=initializeWan(p30,`model=${id}&mode=${mode}&resolution=${resolution}&duration=30`);expect(s.parameters).toMatchObject({resolution,duration:30});expect(s.issues).toEqual([])}expect(initializeWan('/ai-video-models/wan-2-2','resolution=1080P').parameters.resolution).toBe('1080P')});
 it('25/26两模式各门槛，主动换30合法；通用26的10秒不受影响',()=>{for(const path of [p25,p26]as const)for(const mode of ['image-to-video','text-to-video']){const s=initializeWan(path,`mode=${mode}&duration=10`);expect(s.parameters.duration).toBe(5);expect(s.issues).toContain('wan-query-gated:duration');expect(selectDuration(s,5).gated).toBe(true);expect(selectDuration(s,10).gated).toBe(true);const normal=changeGeneratorModel(s,'wan-3-0');expect(selectDuration(normal,30).state.parameters.duration).toBe(30);expect(selectDuration(normal,30).gated).toBe(false);expect(changeGeneratorMode(changeGeneratorModel(normal,'wan-2-6'),'text').parameters.duration).toBe(5)}expect(selectDuration(changeGeneratorModel(initializeGenerator('/ai-video-generator',''),'wan-2-6'),10).state.parameters.duration).toBe(10)});
 it('严格整数/boolean/白名单与重复首值，未知不静默成为支持',()=>{for(const value of ['10x','Infinity','5.5',''])expect(initializeWan(p30,`duration=${value}`).issues).toContain('wan-query-invalid:duration');expect(initializeWan(p30,'sound=false').parameters.sound).toBe(false);expect(initializeWan(p30,'sound=FALSE').issues).toContain('wan-query-invalid:sound');expect(initializeWan(p25,'ratio=Auto').issues).toContain('wan-query-unsupported:ratio');expect(initializeWan(p25,'sound=true').issues).toContain('wan-query-unsupported:sound');expect(initializeWan(p30,'duration=bad&duration=30').issues).toContain('wan-query-invalid:duration');expect(initializeWan(p30,'duration=30&duration=5').parameters.duration).toBe(30)});
 it('参数A/B隔离，tracking/hash/次值不清编辑，同key恢复且旧owner无权覆盖',()=>{const a=wanSelectionKey(p30,'duration=10'),b=wanSelectionKey(p30,'duration=30');expect(a).not.toBe(b);expect(a).toBe(wanSelectionKey(p30,'duration=10&duration=30&utm_source=x#generator'));expect(a).not.toBe(wanSelectionKey(p26,'duration=10'));const sessions=new GeneratorSessions(),s=initializeWan(p30,'duration=10'),owner=sessions.acquire(a,s);sessions.write(a,owner,{...s,prompt:'保留编辑'});sessions.release(a,owner);const newer=sessions.acquire(a,s);expect(sessions.read(a)?.state.prompt).toBe('保留编辑');expect(sessions.write(a,owner,{...s,prompt:'旧结果'})).toBe(false);expect(newer).not.toBe(owner);sessions.acquire(b,initializeWan(p30,'duration=30'));expect(sessions.read(b)?.state.parameters.duration).toBe(30);expect(sessions.read(a)?.state.prompt).toBe('保留编辑')});

it('Fusion引擎区别保留升级能力和专业用途，并限定外部主张', () => {
  const answer = wanContent['/ai-video-models/wan-fusionX'].faq[1].answer['zh-CN'];
  for (const word of ['Lanta AI', '采集时', '原始引擎', '升级引擎', '场景分割', '运动追踪', '更高精度', '专业项目', '未验证', '未接入']) {
    expect(answer).toContain(word);
  }
});

it('Fusion耗时题保留完整比较，不以不可用说明替换答案', () => {
  const answer = wanContent['/ai-video-models/wan-fusionX'].faq[4].answer['zh-CN'];
  for (const word of ['Lanta AI', '采集时', '1分钟', '1080p', '2—3分钟', '1—2分钟', '4K', '传统视频编辑软件', '3倍', '未独立验证', '尚未接入']) {
    expect(answer).toContain(word);
  }
});

it('Wan26耗时题保留外部5分钟或更久及不同请求的负担区别', () => {
  const answer = wanContent['/ai-video-models/wan-2-6'].faq[7].answer['zh-CN'];
  for (const word of ['Lanta AI', '采集时', '5分钟或更久', '15秒1080P', '5秒720P', '队列', '未验证', '未接入']) {
    expect(answer).toContain(word);
  }
});

it('Wan25口型题保留逐词与多人限制以及简短明确对白建议', () => {
  const answer = wanContent['/ai-video-models/wan-2-5'].faq[5].answer['zh-CN'];
  for (const word of ['Lanta AI', '采集时', '音频输入', '逐词', '不总是完全准确', '多个角色', '短对白', '谁在说话', '谁保持静默', '未验证', '未接入']) {
    expect(answer).toContain(word);
  }
});

it('Fusion免费题保留基础层与高级付费条件，不冒充本站套餐', () => {
  const answer = wanContent['/ai-video-models/wan-fusionX'].faq[2].answer['zh-CN'];
  for (const word of ['Lanta AI', '采集时', '免费基础层', '两种引擎', '效果', '导出', '付费方案', 'Wan2.1 FusionX', '高级功能', '更高分辨率', '优先处理', '未验证', '未接入']) {
    expect(answer).toContain(word);
  }
});

});
