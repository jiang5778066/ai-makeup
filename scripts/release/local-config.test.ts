// @vitest-environment node
import { expect, it } from "vitest";
import { TARGET } from "./preflight";
it("本地入口明确来源且不伪填workflow变量，拒绝混合认证和伪CI",async()=>{
 const { readReleaseConfig }=await import("./cli");
 const env={RELEASE_SHA:"a".repeat(40),RELEASE_MIGRATION_SOURCE:"vercel-production"};
 expect(readReleaseConfig(env,true)).toMatchObject({...TARGET,source:"local",authMode:"native-cli",workflowRef:"",token:"",migrationUrl:"",migrationSource:"vercel-production"});
 for(const patch of [{VERCEL_TOKEN:"secret"},{GITHUB_REPOSITORY:TARGET.repository},{RELEASE_AUTH_MODE:"token"},{RELEASE_MIGRATION_SOURCE:""},{MIGRATION_DATABASE_URL:"secret"},{VERCEL_PROJECT_ID:"other"}])expect(()=>readReleaseConfig({...env,...patch},true)).toThrow();
 expect(readReleaseConfig({},false)).toMatchObject({authMode:"token",source:"ci",token:""});
});

it("session是独立显式来源，拒绝未知mode和混合URL；CI默认不接受",async()=>{
 const {readReleaseConfig}=await import("./cli");const {preflight}=await import("./preflight");
 const env={RELEASE_SHA:"a".repeat(40),RELEASE_MIGRATION_SOURCE:"vercel-production-session"};
 expect(()=>preflight(readReleaseConfig(env,true))).not.toThrow();
 expect(readReleaseConfig(env,true).migrationSource).toBe("vercel-production-session");
 for(const patch of [{MIGRATION_DATABASE_URL:"secret"},{RELEASE_MIGRATION_SOURCE:"unknown"}])expect(()=>readReleaseConfig({...env,...patch},true)).toThrow();
 expect(()=>readReleaseConfig(env,false)).toThrow();
});
