// @vitest-environment node
import {afterEach,expect,it,vi} from 'vitest';
const fixture=vi.hoisted(()=>({supabaseSign:vi.fn(async()=> 'https://supabase.fixture/signed'),r2Sign:vi.fn(async()=> 'https://r2.fixture/signed'),supabase:vi.fn(),r2:vi.fn()}));
vi.mock('./media-storage-supabase',()=>({createSupabaseMediaObjectStorage:(c:unknown)=>{fixture.supabase(c);return {signGet:fixture.supabaseSign}}}));
vi.mock('./media-storage',async original=>({...await original<typeof import('./media-storage')>(),createR2MediaObjectStorage:()=>{fixture.r2();return {signGet:fixture.r2Sign}}}));
vi.mock('./storage',async original=>({...await original<typeof import('./storage')>(),isStorageConfigured:()=>true}));
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();vi.resetModules()});
it('默认装配按显式supabase选择作品签名；缺执行和密钥不能因存储可用开放模式',async()=>{
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://svlhstoiirtsutmmanrn.supabase.co');vi.stubEnv('MEDIA_SUPABASE_SERVICE_KEY','synthetic-service-only');
 vi.stubEnv('MEDIA_RUNTIME_CONFIG',JSON.stringify({storageBackend:'supabase',executionBackend:'database-step',storageApprovalRef:'offline-only',supabaseStorage:{projectRef:'svlhstoiirtsutmmanrn',privateBucketsApproved:true,buckets:{staging:'media-staging',inputs:'media-inputs',results:'media-results'}}}));
 const {getMediaRuntime}=await import('./media-runtime'),r=getMediaRuntime();expect(r.catalog.enabled).toBe(false);await expect(r.storage.sign('media/results/original','image/png')).resolves.toHaveProperty('url','https://supabase.fixture/signed');expect(fixture.supabase).toHaveBeenCalledTimes(1);expect(fixture.r2).not.toHaveBeenCalled();expect(fixture.supabaseSign).toHaveBeenCalledWith('media/results/original',900);
});
it('原R2仍可独立签名；不配置backend不得自动猜选R2',async()=>{
 vi.stubEnv('MEDIA_RUNTIME_CONFIG',JSON.stringify({storageBackend:'r2',storageApprovalRef:'offline-only'}));
 let runtimeModule=await import('./media-runtime');await expect(runtimeModule.getMediaRuntime().storage.sign('media/results/original','image/png')).resolves.toHaveProperty('url','https://r2.fixture/signed');expect(fixture.supabase).not.toHaveBeenCalled();
 vi.resetModules();vi.stubEnv('MEDIA_RUNTIME_CONFIG',JSON.stringify({storageApprovalRef:'offline-only'}));runtimeModule=await import('./media-runtime');await expect(runtimeModule.getMediaRuntime().storage.sign('media/results/original','image/png')).rejects.toThrow('media_storage_unconfigured');expect(fixture.r2).toHaveBeenCalledTimes(1);
});
