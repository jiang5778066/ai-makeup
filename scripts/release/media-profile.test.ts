// @vitest-environment node
import {expect,it} from 'vitest';
import {validateRuntime,TARGET} from './preflight';
const proof='fixture-reviewed',expiry='2099-01-01T00:00:00Z';
const economics={tariffVersion:proof,credits:2,providerUpperCents:5,dailyCapCents:10,budgetApprovalRef:proof,providerAccountRef:'key:6789/group:56'};
const runtime=()=>({creationEnabled:false,schemaApproved:true,approvalRef:proof,environmentRef:TARGET.project,providerAccountRef:economics.providerAccountRef,storageBackend:'supabase',executionBackend:'database-step',executionApprovalRef:proof,executionValidUntil:expiry,storageApprovalRef:proof,decoderApprovalRef:proof,transportApprovalRef:proof,consentVersion:'media-v1',inputHosts:[`${TARGET.supabaseRef}.supabase.co`],resultHosts:['results.provider.com'],supabaseStorage:{resultMaxBytes:47185920,projectRef:TARGET.supabaseRef,privateBucketsApproved:true,buckets:{staging:'media-staging',inputs:'media-inputs',results:'media-results'}},modes:{text_to_image:{approvalRef:proof,validUntil:expiry,economics}}});
const env=()=>({RELEASE_PROFILE:'media-generation',DISABLE_CHECKOUT:'1',DISABLE_GENERATION:'1',CREATIONS_VISIBILITY_V1:'1',DATABASE_URL:`postgres://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full`,NEXT_PUBLIC_SUPABASE_URL:`https://${TARGET.supabaseRef}.supabase.co`,NEXT_PUBLIC_SITE_URL:`https://${TARGET.domain}`,NEXT_PUBLIC_SUPABASE_ANON_KEY:'fixture-anon',MEDIA_SUPABASE_SERVICE_KEY:'fixture-private',MEDIA_ROUTER_API_KEY:'fixture-provider',MEDIA_PROVIDER_ACCOUNT_REF:economics.providerAccountRef,MEDIA_QUOTE_HMAC_HEX:'ab'.repeat(32),MEDIA_RUNTIME_CONFIG:JSON.stringify(runtime())});
it('完整已证图片准备合同独立成功，无R2/Inngest/AWS/CREEM；缺专用调度批准保持关闭',()=>{expect(()=>validateRuntime(env())).not.toThrow();expect(()=>validateRuntime({...env(),MEDIA_CREATE_ENABLED:'1',MEDIA_RUNTIME_CONFIG:JSON.stringify({...runtime(),creationEnabled:true})})).toThrow()});
it.each([{ENABLE_CHECKOUT:'1'},{ENABLE_CHECKOUT:'true'},{DISABLE_CHECKOUT:'0'},{DISABLE_GENERATION:'0'},{MEDIA_QUOTE_HMAC_HEX:'bad'},{MEDIA_SUPABASE_SERVICE_KEY:''},{NEXT_PUBLIC_SUPABASE_URL:'https://other.supabase.co'},{DATABASE_URL:'postgres://postgres:fixture@db.other.supabase.co:5432/postgres?sslmode=verify-full'}])('错误环境合同拒绝：%j',patch=>{expect(()=>validateRuntime({...env(),...patch})).toThrow()});
it.each([{executionApprovalRef:''},{executionValidUntil:'2000-01-01'},{storageBackend:'unknown'},{providerAccountRef:'unknown'},{environmentRef:'wrong'},{unexpected:'unknown'}, {modes:{text_to_image:{approvalRef:proof,validUntil:'2000-01-01',economics}}},{modes:{text_to_video:{approvalRef:proof,validUntil:expiry,economics}}}])('未知/过期/错身份/未证视频拒绝：%j',patch=>{expect(()=>validateRuntime({...env(),MEDIA_RUNTIME_CONFIG:JSON.stringify({...runtime(),...patch})})).toThrow()});

import {snapshotRuntime,assertSameSnapshot} from './snapshot';
it('媒体profile继续使用完整快照，秘密改变或新增变量均阻断候选提升',()=>{
 const sha='a'.repeat(40),first=snapshotRuntime(env(),sha);expect(()=>assertSameSnapshot(first,snapshotRuntime(env(),sha))).not.toThrow();
 expect(()=>assertSameSnapshot(first,snapshotRuntime({...env(),MEDIA_SUPABASE_SERVICE_KEY:'changed-fixture'},sha))).toThrow('配置在构建后变化');expect(()=>assertSameSnapshot(first,snapshotRuntime({...env(),ADDED:'value'},sha))).toThrow();
});
it('预算未知、错账号或小于单次费用均拒绝',()=>{
 for(const patch of [{providerUpperCents:null},{providerUpperCents:'unknown'},{dailyCapCents:1},{providerAccountRef:'other'}])expect(()=>validateRuntime({...env(),MEDIA_RUNTIME_CONFIG:JSON.stringify({...runtime(),modes:{text_to_image:{approvalRef:proof,validUntil:expiry,economics:{...economics,...patch}}}})})).toThrow();
});

it('源码实现不等于调度就绪，激活必须有专用secret/资源调度批准及期限',()=>{
 const c={...runtime(),creationEnabled:true,databaseStep:{scheduleApprovalRef:'fixture-only-schedule',resourceApprovalRef:'fixture-only-resources',validUntil:expiry}},active={...env(),MEDIA_CREATE_ENABLED:'1',MEDIA_STEP_ENABLED:'1',MEDIA_STEP_SECRET:'ab'.repeat(32),MEDIA_RUNTIME_CONFIG:JSON.stringify(c)};
 expect(()=>validateRuntime(active)).not.toThrow();
 for(const patch of [{MEDIA_STEP_SECRET:''},{MEDIA_STEP_SECRET:'short'},{MEDIA_STEP_ENABLED:'0'},{MEDIA_STEP_ENABLED:'true'},{MEDIA_RUNTIME_CONFIG:JSON.stringify({...c,databaseStep:undefined})},{MEDIA_RUNTIME_CONFIG:JSON.stringify({...c,databaseStep:{...c.databaseStep,validUntil:'2000-01-01'}})}])expect(()=>validateRuntime({...active,...patch})).toThrow();
});

it('发布存储上限显式绑定45MiB，64MiB或缺上限不可通过',()=>{
 for(const resultMaxBytes of [67108864,0,undefined,'47185920'])expect(()=>validateRuntime({...env(),MEDIA_RUNTIME_CONFIG:JSON.stringify({...runtime(),supabaseStorage:{...runtime().supabaseStorage,resultMaxBytes}})})).toThrow();
 expect(()=>validateRuntime(env())).not.toThrow();
});
