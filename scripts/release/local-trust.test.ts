// @vitest-environment node
import { afterEach, expect, it } from "vitest";
import { mkdtemp, writeFile, readFile, rm, mkdir, chmod, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { command, type CommandRunner } from "./command";
import { TARGET } from "./preflight";
import { REPOSITORY_ROOT } from "./paths";
const roots:string[]=[];
afterEach(async()=>{for(const r of roots.splice(0))await rm(r,{recursive:true,force:true});});
const fixture=async()=>{
 const root=await mkdtemp(join(tmpdir(),"native-trust-")); roots.push(root);
 const git=(...args:string[])=>command("git",args,process.env,root);
 await git("init","-b","main");await git("config","user.name","fixture");await git("config","user.email","fixture@invalid.test");
 await writeFile(join(root,"product.ts"),"export const value=1;\n");
 await writeFile(join(root,"tsconfig.json"),JSON.stringify({files:["product.ts"],compilerOptions:{incremental:true,tsBuildInfoFile:"tsconfig.tsbuildinfo",noEmit:true,types:[],target:"ES2022",skipLibCheck:true}}));
 await writeFile(join(root,"tsconfig.tsbuildinfo"),await readFile(join(REPOSITORY_ROOT,"tsconfig.tsbuildinfo")));
 await writeFile(join(root,"package.json"),"{}");await writeFile(join(root,"package-lock.json"),"{}");await mkdir(join(root,"src"));await writeFile(join(root,"src/product.ts"),"export const source=1;\n");await git("add",".");await git("commit","-m","测试：初始提交");
 const sha=await git("rev-parse","HEAD"),tree=await git("rev-parse","HEAD^{tree}");await git("update-ref","refs/remotes/origin/main",sha);await git("remote","add","origin",`https://github.com/${TARGET.repository}.git`);
 const dir=await mkdtemp(join(tmpdir(),"native-approval-"));roots.push(dir);
 const records={review:{...TARGET,sha,sourceTree:tree,reviewer:"独立审查员",sourceReviewPassed:true},acceptance:{...TARGET,sha,sourceTree:tree,reviewer:"独立验收员",acceptancePassed:true}};
 const approvals={} as Record<"review"|"acceptance",{path:string;sha256:string}>;
 for(const kind of ["review","acceptance"] as const){const path=join(dir,kind+".json"),body=JSON.stringify(records[kind]);await writeFile(path,body);approvals[kind]={path,sha256:createHash("sha256").update(body).digest("hex")};}
 const state={remote:sha,ci:"success",branch:"main",inflight:0,repository:TARGET.repository as string,policy:true};
 const run:CommandRunner=async(binary,args,env,cwd,limits)=>{
  if(binary==="git"&&args[0]==="ls-remote")return `${state.remote}\trefs/heads/main`;
  if(binary!=="gh")return command(binary,args,env,cwd,limits);
  const path=args[1];
  if(path.endsWith("/commits/main"))return JSON.stringify({sha:state.remote});
  if(path.endsWith("/environments/Production"))return JSON.stringify({name:"Production",deployment_branch_policy:{custom_branch_policies:state.policy,protected_branches:false}});
  if(path.endsWith("/deployment-branch-policies"))return JSON.stringify({total_count:1,branch_policies:[{name:state.branch,type:"branch"}]});
  if(path.endsWith("/workflows/ci.yml"))return JSON.stringify({id:42,path:".github/workflows/ci.yml",state:"active"});
  if(path.includes("/workflows/ci.yml/runs?"))return JSON.stringify({total_count:1,workflow_runs:[{id:100,workflow_id:42,head_sha:sha,head_branch:"main",head_repository:{full_name:state.repository},status:"completed",conclusion:state.ci}]});
  if(path.includes("/workflows/release.yml/runs?"))return JSON.stringify({total_count:state.inflight,workflow_runs:state.inflight?[{id:8}]:[]});
  throw Error("未批准的测试接口");
 };
 return {root,git,sha,tree,approvals,state,run,records};
};
it("真实干净Git、远端main、最新CI和独立双记录共同绑定提交",async()=>{
 const f=await fixture(); const {trustLocal}=await import("./local-trust");const guard=await trustLocal(f.sha,f.approvals,f.run,f.root);await expect(guard()).resolves.toBeUndefined();
 await writeFile(join(f.root,"product.ts"),"uncommitted");await expect(guard()).rejects.toThrow();
});
it.each(["remote","ci","branch","inflight","repository","policy"] as const)("本地来源%s不匹配停止",async key=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");
 Object.assign(f.state,{[key]:key==="inflight"?1:key==="policy"?false:key==="remote"?"b".repeat(40):"other"});await expect(trustLocal(f.sha,f.approvals,f.run,f.root)).rejects.toThrow();
});
it("错误remote、未提交源码及审验记录漂移拒绝",async()=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");
 await f.git("remote","set-url","origin","https://github.com/other/repo.git");await expect(trustLocal(f.sha,f.approvals,f.run,f.root)).rejects.toThrow();
 await f.git("remote","set-url","origin",`https://github.com/${TARGET.repository}.git`);
 const guard=await trustLocal(f.sha,f.approvals,f.run,f.root);await writeFile(f.approvals.review.path,JSON.stringify({...f.records.review,sha:"b".repeat(40)}));await expect(guard()).rejects.toThrow();
});
it("独立记录不能由同一人签署，SHA和tree必须准确",async()=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");
 for(const patch of [{reviewer:f.records.review.reviewer},{sha:"b".repeat(40)},{sourceTree:"b".repeat(40)},{acceptancePassed:false}]){
  const body=JSON.stringify({...f.records.acceptance,...patch});await writeFile(f.approvals.acceptance.path,body);f.approvals.acceptance.sha256=createHash("sha256").update(body).digest("hex");await expect(trustLocal(f.sha,f.approvals,f.run,f.root)).rejects.toThrow();
 }
});
it("生产锁拒绝并发且异常释放；不删除未知或被替换所有者",async()=>{
 const root=await mkdtemp(join(tmpdir(),"native-lock-"));roots.push(root);const path=join(root,"production.lock");const {withProductionLock}=await import("./local-lock");
 await withProductionLock(async()=>{await expect(withProductionLock(async()=>{},path)).rejects.toThrow();},path);
 await expect(withProductionLock(async()=>{throw Error("fixture");},path)).rejects.toThrow("fixture");
 await withProductionLock(async()=>{},path);
 await mkdir(path);await writeFile(join(path,"owner.json"),"unknown");await expect(withProductionLock(async()=>{},path)).rejects.toThrow();expect(await readFile(join(path,"owner.json"),"utf8")).toBe("unknown");await rm(path,{recursive:true});
 await expect(withProductionLock(async()=>{await writeFile(join(path,"owner.json"),'{}');},path)).rejects.toThrow("所有权");expect(await readFile(join(path,"owner.json"),"utf8")).toBe("{}");
});

it("初始缓存脏仍拒绝；已核后真实TSC增量缓存仅在构建后guard准入",async()=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");
 const guard=await trustLocal(f.sha,f.approvals,f.run,f.root);
 const before=await readFile(join(f.root,"tsconfig.tsbuildinfo"));
 await command(process.execPath,[join(REPOSITORY_ROOT,"node_modules/typescript/bin/tsc"),"--noEmit","--project",join(f.root,"tsconfig.json")],process.env,f.root);
 expect((await readFile(join(f.root,"tsconfig.tsbuildinfo"))).equals(before)).toBe(false);
 await expect(trustLocal(f.sha,f.approvals,f.run,f.root)).rejects.toThrow();
 await expect(guard()).rejects.toThrow();
 await expect(guard("after-build")).resolves.toBeUndefined();
 await expect(guard("after-build")).resolves.toBeUndefined();
});
it.each(["product.ts","src/product.ts","package.json","tsconfig.json","package-lock.json","nested/tsconfig.tsbuildinfo","tsconfig.tsbuildinfo.bak"])("构建后cache加%s仍拒绝",async name=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");const guard=await trustLocal(f.sha,f.approvals,f.run,f.root);
 await writeFile(join(f.root,"tsconfig.tsbuildinfo"),"generated");
 if(name.startsWith("nested/"))await mkdir(join(f.root,"nested"));
 await writeFile(join(f.root,name),"unreviewed");await expect(guard("after-build")).rejects.toThrow();
});
it.each(["staged","index-format","assume-unchanged","skip-worktree","symlink","mode"])("构建后缓存%s变化仍拒绝",async kind=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");const guard=await trustLocal(f.sha,f.approvals,f.run,f.root);
 const cache=join(f.root,"tsconfig.tsbuildinfo");await writeFile(cache,"generated");
 if(kind==="staged")await f.git("add","tsconfig.tsbuildinfo");
 if(kind==="index-format")await f.git("update-index","--index-version","4");
 if(kind==="assume-unchanged"||kind==="skip-worktree")await f.git("update-index","--"+kind,"tsconfig.tsbuildinfo");
 if(kind==="symlink"){await rm(cache);await symlink("product.ts",cache);}
 if(kind==="mode")await chmod(cache,0o744);
 await expect(guard("after-build")).rejects.toThrow();
});
it("开发树未跟踪报告仍阻塞，不能给docs泛放行",async()=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");await mkdir(join(f.root,"docs"));await writeFile(join(f.root,"docs/report.md"),"report");
 await expect(trustLocal(f.sha,f.approvals,f.run,f.root)).rejects.toThrow();
});

it.each(["remote","ci","branch","inflight","repository","policy"] as const)("构建后只改缓存仍重核%s，不因缓存例外跳过门禁",async key=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");const guard=await trustLocal(f.sha,f.approvals,f.run,f.root);
 await writeFile(join(f.root,"tsconfig.tsbuildinfo"),"generated");
 Object.assign(f.state,{[key]:key==="inflight"?1:key==="policy"?false:key==="remote"?"b".repeat(40):"other"});await expect(guard("after-build")).rejects.toThrow();
});
it.each(["success","validate-failure","build-failure","source-drift"])("同一pipeline的缓存生命周期：%s",async mode=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");const {release}=await import("./pipeline");
 let guard:Awaited<ReturnType<typeof trustLocal>>|undefined;const calls:string[]=[];let built=false;
 const config={...TARGET,sha:f.sha,ref:"refs/heads/main",workflowRef:"",source:"local" as const,authMode:"native-cli" as const,token:"",migrationSource:"vercel-production-session" as const,migrationUrl:""};
 const result=await release(config,{
  trust:async()=>{guard=await trustLocal(f.sha,f.approvals,f.run,f.root);},audit:async()=>{},inspect:async()=>({id:"dpl_old",url:"old.vercel.app",sha:f.sha}),
  validate:async()=>{if(mode==="validate-failure")throw Error("validate");},
  build:async()=>{if(mode==="build-failure")throw Error("build");await command(process.execPath,[join(REPOSITORY_ROOT,"node_modules/typescript/bin/tsc"),"--noEmit","--project",join(f.root,"tsconfig.json")],process.env,f.root);built=true;if(mode==="source-drift")await writeFile(join(f.root,"product.ts"),"changed");},
  candidate:async()=>{expect(built).toBe(true);await guard!("after-build");calls.push("candidate");return {id:"dpl_test",url:"candidate.vercel.app"};},
  migrate:async()=>[],health:async()=>{},promote:async()=>{await guard!("after-build");calls.push("promote");}
 });
 expect(result.ok).toBe(mode==="success");expect(calls).toEqual(mode==="success"?["candidate","promote"]:[]);
});

it("独立绑定记录必须是执行树外的绝对文件引用",async()=>{
 const f=await fixture();const {trustLocal}=await import("./local-trust");
 await mkdir(join(f.root,"release-result"));const inside=join(f.root,"release-result/review.json");await writeFile(inside,await readFile(f.approvals.review.path));
 const original=f.approvals.review.path;
 for(const path of ["relative-review.json",inside]){f.approvals.review.path=path;await expect(trustLocal(f.sha,f.approvals,f.run,f.root)).rejects.toThrow();}
 f.approvals.review.path=original;await expect(trustLocal(f.sha,f.approvals,f.run,f.root)).resolves.toBeTypeOf("function");
});
