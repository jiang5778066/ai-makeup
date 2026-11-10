// @vitest-environment node
import { expect, it } from "vitest";
import { Vercel } from "./vercel";
import { snapshotRuntime } from "./snapshot";
import { release } from "./pipeline";
import { preflight, TARGET, type ReleaseConfig } from "./preflight";
const sha="a".repeat(40);
const url=`postgres://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full`;
const config=(patch={}):ReleaseConfig=>({...TARGET,sha,ref:"refs/heads/main",workflowRef:"",source:"local",authMode:"native-cli",token:"",migrationSource:"vercel-production",migrationUrl:"",...patch});
class Adapter extends Vercel {
 value=url; key="DATABASE_URL"; target=["production"]; count=1; id=TARGET.project as string;
 async api<T>(path:string):Promise<T>{
  if(path.startsWith("/v9/"))return {id:this.id,accountId:TARGET.team,nodeVersion:"24.x"} as T;
  if(path.startsWith("/v10/"))return {envs:Array.from({length:this.count},()=>({id:"env_db",key:"DATABASE_URL",target:["production"]}))} as T;
  return {id:"env_db",key:this.key,target:this.target,value:this.value} as T;
 }
}
it("原生迁移必须显式选择来源，选择云来源时不混入本机URL",()=>{
 expect(()=>preflight(config())).not.toThrow();expect(()=>preflight(config({migrationSource:undefined}))).toThrow();expect(()=>preflight(config({migrationUrl:url}))).toThrow();
 expect(()=>preflight(config({migrationSource:"environment",migrationUrl:url}))).not.toThrow();
});
it("准确production唯一DATABASE_URL只在内存返回并按migration目的验证",async()=>{
 const c=config();const v=new Adapter(c);expect(await v.migrationConfiguration()).toBe(url);expect(c.migrationUrl).toBe("");
});
it.each(["port","tls","project","identity","target","duplicate","missing"])("原生迁移来源%s错误拒绝",async failure=>{
 const v=new Adapter(config());if(failure==="port")v.value=`postgres://postgres.${TARGET.supabaseRef}:fixture@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=verify-full`;
 if(failure==="tls")v.value=url.replace("verify-full","require");if(failure==="project")v.id="other";if(failure==="identity")v.key="OTHER";if(failure==="target")v.target=["preview"];if(failure==="duplicate")v.count=2;if(failure==="missing")v.count=0;
 await expect(v.migrationConfiguration()).rejects.toThrow();
});

const pooled=`postgresql://postgres.${TARGET.supabaseRef}:p%40ss%3Aword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=verify-full`;
it("显式session来源只替换官方共享池端口，原模式仍拒绝6543",async()=>{
 const c=config({migrationSource:"vercel-production-session"});expect(()=>preflight(c)).not.toThrow();
 const v=new Adapter(c);v.value=pooled;const session=await v.migrationConfiguration();
 expect(session).toBe(pooled.replace(":6543/",":5432/"));expect(c.migrationUrl).toBe("");
 const old=new Adapter(config());old.value=pooled;await expect(old.migrationConfiguration()).rejects.toThrow("6543");
});
it.each([
 pooled.replace("aws-0-us-east-1.pooler.supabase.com","db."+TARGET.supabaseRef+".supabase.co"),
 pooled.replace("aws-0-us-east-1","other"),pooled.replace(TARGET.supabaseRef,"wrong"),
 pooled.replace("postgres.","other."),pooled.replace("/postgres?","/other?"),
 pooled.replace(":6543/",":5432/"),pooled.replace("verify-full","require"),
 pooled+"&sslmode=verify-full",pooled.replace("postgresql:","https:"),
 pooled+"#fragment",pooled.replace("p%40ss%3Aword","")
])("显式session错误元数据拒绝且不输出输入",async value=>{
 const v=new Adapter(config({migrationSource:"vercel-production-session"}));v.value=value;
 await expect(v.migrationConfiguration()).rejects.toThrow();
 try{await v.migrationConfiguration();}catch(e){expect(String(e)).not.toContain("p%40ss");expect(String(e)).not.toContain("aws-0");}
});

it("session派生保留编码query与密码的原始字节",async()=>{
 const v=new Adapter(config({migrationSource:"vercel-production-session"}));v.value=pooled.replace("sslmode=verify-full","%73slmode=verify%2Dfull");
 expect(await v.migrationConfiguration()).toBe(v.value.replace(":6543/",":5432/"));
});
class SnapshotAdapter extends Adapter {
 calls:string[]=[];
 cloud:Record<string,string>={DATABASE_URL:pooled,RELEASE_PROFILE:"website-db",DISABLE_GENERATION:"1",DISABLE_CHECKOUT:"1",NEXT_PUBLIC_SUPABASE_URL:`https://${TARGET.supabaseRef}.supabase.co`,NEXT_PUBLIC_SITE_URL:`https://${TARGET.domain}`,NEXT_PUBLIC_SUPABASE_ANON_KEY:"fixture"};
 capture(){this.runtime=snapshotRuntime(this.cloud,sha);}
 protected async readRuntime(){return snapshotRuntime(this.cloud,sha);}
 async databaseReady(){this.calls.push("readonly-status-boundary");}
 async cli(args:string[]){this.calls.push(args[0]);return "https://candidate.vercel.app";}
 async api<T>(path:string):Promise<T>{
  if(path.startsWith("/v13/"))return {id:"dpl_candidate",url:"candidate.vercel.app",projectId:TARGET.project,ownerId:TARGET.team,target:"production",readyState:"READY",meta:{releaseSha:sha}} as T;
  if(path.startsWith("/v4/"))return {deploymentId:"dpl_candidate"} as T;
  return super.api(path);
 }
}
it("session原配置与首次runtime/派生值必须一致，不能把5432直接与6543比较",async()=>{
 const c=config({migrationSource:"vercel-production-session"});const v=new SnapshotAdapter(c);v.value=pooled;
 c.migrationUrl=await v.migrationConfiguration();v.capture();await expect(v.assertMigrationSnapshot(c.migrationUrl)).resolves.toBeUndefined();
 await expect(v.assertMigrationSnapshot(pooled)).rejects.toThrow();
 v.cloud.DATABASE_URL=pooled.replace("p%40ss%3Aword","changed");v.capture();await expect(v.assertMigrationSnapshot(c.migrationUrl)).rejects.toThrow();
});
it.each(["DATABASE_URL","NEXT_PUBLIC_SUPABASE_URL","ADDED"])("candidate/promote前完整runtime的%s漂移阻塞写边界",async key=>{
 for(const stage of ["candidate","promote"] as const){
  const c=config({migrationSource:"vercel-production-session"});const v=new SnapshotAdapter(c);v.value=pooled;c.migrationUrl=await v.migrationConfiguration();v.capture();
  v.cloud[key]=key==="DATABASE_URL"?pooled.replace("p%40ss%3Aword","changed"):"changed";
  await expect(stage==="candidate"?v.candidate():v.promote({id:"dpl_candidate",url:"candidate.vercel.app"})).rejects.toThrow();
  expect(v.calls).not.toContain("deploy");expect(v.calls).not.toContain("promote");
 }
});
it("同一pipeline贯穿显式session解析、快照、候选、迁移边界及promote并保持脱敏检查点",async()=>{
 const c=config({migrationSource:"vercel-production-session"});const v=new SnapshotAdapter(c);v.value=pooled;const phases:string[]=[];
 const result=await release(c,{
  trust:async()=>{phases.push("trust");},audit:async()=>{phases.push("audit");},
  inspect:async()=>{phases.push("inspect/status");c.migrationUrl=await v.migrationConfiguration();await v.databaseReady();v.capture();await v.assertMigrationSnapshot(c.migrationUrl);return {id:"dpl_old",url:"old.vercel.app",sha};},
  validate:async()=>{phases.push("validate");},build:async()=>{phases.push("build");await v.build();},
  candidate:async()=>{phases.push("candidate");return v.candidate();},migrate:async()=>{phases.push("controlled-migration-boundary");return ["fixture"];},
  health:async(_d,production)=>{phases.push(production?"production-health":"candidate-health");},promote:async d=>{phases.push("promote");await v.promote(d);}
 },async r=>{expect(JSON.stringify(r)).not.toContain("p%40ss");expect(JSON.stringify(r)).not.toContain("pooler.supabase.com");});
 expect(result.ok).toBe(true);expect(phases).toEqual(["trust","audit","inspect/status","validate","build","candidate","controlled-migration-boundary","candidate-health","promote","production-health"]);
 expect(v.calls).toContain("deploy");expect(v.calls).toContain("promote");
});
it("session初次runtime快照与解析原值漂移时，同一pipeline在inspect停止",async()=>{
 const c=config({migrationSource:"vercel-production-session"});const v=new SnapshotAdapter(c);v.value=pooled;
 const result=await release(c,{trust:async()=>{},audit:async()=>{},inspect:async()=>{c.migrationUrl=await v.migrationConfiguration();v.cloud.DATABASE_URL=pooled.replace("p%40ss%3Aword","changed");v.capture();await v.assertMigrationSnapshot(c.migrationUrl);return null;},validate:async()=>{},build:()=>v.build(),candidate:()=>v.candidate(),migrate:async()=>[],health:async()=>{},promote:d=>v.promote(d)});
 expect(result).toMatchObject({ok:false,stage:"inspect",promoted:false});expect(v.calls).not.toContain("deploy");expect(v.calls).not.toContain("promote");
});
