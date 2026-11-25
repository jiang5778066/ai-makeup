import {MEDIA_VIDEO_MAX_BYTES} from '../../src/lib/media-video-contract';
import {validMediaStepSecret} from '../../src/lib/media-step';
import {strictObject,type MediaEconomics} from '../../src/lib/media-contracts';
import {validateEconomics} from '../../src/lib/media-quotes';
type Target={project:string;supabaseRef:string};
const keys=['databaseStep','storageBackend','executionBackend','executionApprovalRef','executionValidUntil','supabaseStorage','creationEnabled','schemaApproved','approvalRef','environmentRef','storageApprovalRef','decoderApprovalRef','transportApprovalRef','providerAccountRef','inputHosts','resultHosts','consentVersion','modes','videoDecoder','videoDeploymentApprovalRef'];
const reject=():never=>{throw new Error('媒体发布配置未满足精确身份、批准、期限与预算合同')};
const text=(v:unknown)=>typeof v==='string'&&v===v.trim()&&v.length>0&&v.length<=160&&!/^(unknown|pending|unverified|placeholder)$/i.test(v);
const hosts=(v:unknown)=>Array.isArray(v)&&v.length>0&&v.every(h=>typeof h==='string'&&/^(?=.{1,253}$)[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,63}$/.test(h));
const future=(v:unknown,now:number)=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&Date.parse(v)>now;
/** 只验证受审配置合同；批准引用必须来自独立验收，不能用本校验代替真实服务证明。 */
export function validateMediaGenerationProfile(env:Record<string,string|undefined>,target:Target,now=Date.now()){
 if(env.DISABLE_CHECKOUT!=='1'||![undefined,'0'].includes(env.ENABLE_CHECKOUT)||env.DISABLE_GENERATION!=='1'||env.CREATIONS_VISIBILITY_V1!=='1'||![undefined,'0','1'].includes(env.MEDIA_CREATE_ENABLED)||![undefined,'0','1'].includes(env.MEDIA_STEP_ENABLED))reject();
 if(![undefined,'0'].includes(env.ENABLE_GENERATION))reject();
 for(const name of ['MEDIA_ROUTER_API_KEY','MEDIA_SUPABASE_SERVICE_KEY','MEDIA_PROVIDER_ACCOUNT_REF'])if(!env[name]?.trim())reject();
 if(!/^key:[0-9]+\/group:[0-9]+$/.test(env.MEDIA_PROVIDER_ACCOUNT_REF??''))reject();
 if(!/^(?:[a-f0-9]{2}){32,64}$/i.test(env.MEDIA_QUOTE_HMAC_HEX??''))reject();
 let c:Record<string,unknown>;try{c=strictObject(JSON.parse(env.MEDIA_RUNTIME_CONFIG??''),keys)}catch{return reject()}
 if(typeof c.creationEnabled!=='boolean'||c.schemaApproved!==true||c.environmentRef!==target.project||c.storageBackend!=='supabase'||c.executionBackend!=='database-step'||c.providerAccountRef!==env.MEDIA_PROVIDER_ACCOUNT_REF||c.consentVersion!=='media-v1'||!hosts(c.inputHosts)||!(c.inputHosts as string[]).includes(`${target.supabaseRef}.supabase.co`)||!hosts(c.resultHosts)||!future(c.executionValidUntil,now))reject();
 for(const name of ['approvalRef','executionApprovalRef','storageApprovalRef','decoderApprovalRef','transportApprovalRef','providerAccountRef'])if(!text(c[name]))reject();
 try{
  const storage=strictObject(c.supabaseStorage,['projectRef','privateBucketsApproved','resultMaxBytes','buckets']),buckets=strictObject(storage.buckets,['staging','inputs','results']);
  if(!Number.isSafeInteger(storage.resultMaxBytes)||Number(storage.resultMaxBytes)<16777216||Number(storage.resultMaxBytes)>MEDIA_VIDEO_MAX_BYTES||storage.projectRef!==target.supabaseRef||storage.privateBucketsApproved!==true||Object.keys(buckets).length!==3||Object.values(buckets).some(b=>typeof b!=='string'||!/^[a-z0-9][a-z0-9-]{1,62}$/.test(b))||new Set(Object.values(buckets)).size!==3)reject();
  const modes=strictObject(c.modes,['text_to_image','image_to_image','text_to_video','image_to_video']);if(Object.keys(modes).length===0)reject();
  for(const [mode,raw]of Object.entries(modes)){
   const m=strictObject(raw,['approvalRef','validUntil','economics']);if(!text(m.approvalRef)||!future(m.validUntil,now))reject();
   const economics=strictObject(m.economics,['tariffVersion','credits','providerUpperCents','budgetApprovalRef','dailyCapCents','providerAccountRef']) as MediaEconomics;validateEconomics(economics);if(economics.providerAccountRef!==c.providerAccountRef)reject();
   if(mode.endsWith('_video')){
    if(storage.resultMaxBytes!==MEDIA_VIDEO_MAX_BYTES)reject();
    if(!text(c.videoDeploymentApprovalRef))reject();const v=strictObject(c.videoDecoder,['approvalRef','version','ffmpeg','ffprobe']);if(!text(v.approvalRef)||!text(v.version))reject();
    for(const name of ['ffmpeg','ffprobe']){const binary=strictObject(v[name],['path','sha256']);if(typeof binary.path!=='string'||!binary.path.startsWith('/')||!/^([a-f0-9]{64})$/.test(String(binary.sha256)))reject()}
   }
  }
 }catch{return reject()}
 // 准备态可保持关闭；执行就绪需真实独立验收引用，源码存在本身不产生批准。
 if(env.MEDIA_STEP_SECRET!==undefined&&!validMediaStepSecret(env.MEDIA_STEP_SECRET))reject();
 if(env.MEDIA_STEP_ENABLED==='1'||env.MEDIA_CREATE_ENABLED==='1'&&c.creationEnabled===true){
  if(env.MEDIA_STEP_ENABLED!=='1'||!validMediaStepSecret(env.MEDIA_STEP_SECRET))reject();
  try{const step=strictObject(c.databaseStep,['scheduleApprovalRef','resourceApprovalRef','validUntil']);if(!text(step.scheduleApprovalRef)||!text(step.resourceApprovalRef)||!future(step.validUntil,now))reject()}catch{return reject()}
 }
}
