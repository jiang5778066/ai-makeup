// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { preflight, TARGET, type ReleaseConfig } from "./preflight";
import { Vercel } from "./vercel";
import { command } from "./command";
const sha = "a".repeat(40);
const migrationUrl = `postgresql://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full`;
const config = (patch = {}): ReleaseConfig => ({ sha, ref: "refs/heads/main", workflowRef: `${TARGET.repository}/.github/workflows/release.yml@refs/heads/main`, ...TARGET, token: "fixture-secret", migrationUrl, ...patch });
afterEach(() => vi.unstubAllGlobals());
it("CI默认token和显式native各自准入，混合及缺身份拒绝", () => {
  expect(() => preflight(config())).not.toThrow();
  expect(() => preflight(config({ authMode: "native-cli", source: "local", workflowRef: "", token: "", migrationSource: "vercel-production", migrationUrl: "" }))).not.toThrow();
  for (const patch of [{ token: "" }, { authMode: "other" }, { authMode: "native-cli" }, { authMode: "native-cli", token: "", source: "ci" }, { authMode: "native-cli", token: "", source: "local", workflowRef: "" }, { authMode: "native-cli", token: "", source: "local", workflowRef: "", migrationSource: "vercel-production", bootstrap: true }]) expect(() => preflight(config(patch))).toThrow();
});
it.each(["token", "native-cli"] as const)("%s的CLI只传受控环境，token不入argv，native使用默认登录", async authMode => {
  const calls: {args:string[];env:NodeJS.ProcessEnv}[] = [];
  const v = new Vercel(config({ authMode, token: authMode === "token" ? "fixture-secret" : "" }), async (_b,args,env) => { calls.push({args,env}); return "{}"; });
  process.env.EXTRA_PARENT_SECRET = "parent-secret";
  try { await v.cli(["whoami", "--json"]); } finally { delete process.env.EXTRA_PARENT_SECRET; }
  expect(calls[0].args.join(" ")).not.toContain("fixture-secret"); expect(calls[0].args).not.toContain("--token");
  expect(calls[0].args[0]).toMatch(/vercel\/dist\/index.js$/);
  expect(calls[0].env.EXTRA_PARENT_SECRET).toBeUndefined();
  expect(calls[0].env.VERCEL_TOKEN).toBe(authMode === "token" ? "fixture-secret" : undefined);
  expect(calls[0].args.includes("--global-config")).toBe(authMode === "token");
});
const response = (status=200, body='{"id":"ok"}', type="application/json") => `HTTP ${status} Status\ncontent-type: ${type}\n\n${body}`;
it("原生成功JSON有准确HTTP状态，固定team与GET", async () => {
  let args:string[]=[];
  const v=new Vercel(config({authMode:"native-cli",token:""}),async (_b,a) => {args=a;return response();});
  expect(await v.api(`/v9/projects/${TARGET.project}`)).toEqual({id:"ok"});
  expect(args).toContain("--include"); expect(args).toContain("GET"); expect(args.join(" ")).toContain(`teamId=${TARGET.team}`);
});
it.each([401,403,404,429,500,503,302])("原生HTTP%s拒绝，不从文案推断404", async status => {
  const v=new Vercel(config({authMode:"native-cli",token:""}),async()=>response(status));
  await expect(v.api(`/v9/projects/${TARGET.project}`)).rejects.toThrow();
});
it.each(["not found", "{}", response(200,"garbage"), response(200,"{}","text/html"), response(200,'{"error":{"message":"failed"}}')])("原生未知、乱码或错误JSON拒绝 %s",async value=>{
  const v=new Vercel(config({authMode:"native-cli",token:""}),async()=>value);
  await expect(v.api(`/v9/projects/${TARGET.project}`)).rejects.toThrow();
});
it.each(["https://evil.test/v9/projects/x", "/v9/projects/other", `/v9/projects/${TARGET.project}?teamId=other`, `/v9/projects/${TARGET.project}?x=1`,"/v2/user"])("不允许API路径在子进程前拒绝 %s",async path=>{
  let called=false; const v=new Vercel(config({authMode:"native-cli",token:""}),async()=>{called=true;return response();});
  await expect(v.api(path)).rejects.toThrow();expect(called).toBe(false);
});
it("原生登录失效不回退fetch或token",async()=>{
  const fetcher=vi.fn();vi.stubGlobal("fetch",fetcher);
  const v=new Vercel(config({authMode:"native-cli",token:""}),async()=>{throw Error("login expired secret");});
  await expect(v.api(`/v9/projects/${TARGET.project}`)).rejects.toThrow();expect(fetcher).not.toHaveBeenCalled();
});
it.each([401,403,404,429,500])("token HTTP%s停止",async status=>{
  vi.stubGlobal("fetch",async()=>new Response("{}",{status,headers:{"content-type":"application/json"}}));
  await expect(new Vercel(config()).api(`/v9/projects/${TARGET.project}`)).rejects.toThrow();
});
it.each(["bad-json","oversize","timeout"])("token %s停止且不泄露响应",async failure=>{
  vi.stubGlobal("fetch",async()=>{if(failure==="timeout")throw Error("timeout secret");return new Response(failure==="bad-json"?"secret-not-json":"x".repeat(2_100_000),{headers:{"content-type":"application/json"}});});
  await expect(new Vercel(config()).api(`/v9/projects/${TARGET.project}`)).rejects.toThrow();
});
it("子进程超时及超量输出即使退出0也拒绝，stderr不泄漏",async()=>{
  await expect(command(process.execPath,["-e","setTimeout(()=>{},10000)"],{NODE_ENV:"test"},process.cwd(),{timeoutMs:30})).rejects.toThrow("超时");
  await expect(command(process.execPath,["-e","process.stdout.write('secret'.repeat(1000))"],{NODE_ENV:"test"},process.cwd(),{maxOutputBytes:100})).rejects.toThrow("上限");
  await expect(command(process.execPath,["-e","process.stderr.write('private');process.exit(1)"],{NODE_ENV:"test"},process.cwd())).rejects.not.toThrow("private");
});
it("子进程非法UTF8拒绝，不把替换字符当成功JSON",async()=>{
 await expect(command(process.execPath,["-e","process.stdout.write(Buffer.from([0xff]))"],{NODE_ENV:"test"},process.cwd())).rejects.toThrow("UTF-8");
});
it("原生API输出超限及token非JSON类型全部停止",async()=>{
 const v=new Vercel(config({authMode:"native-cli",token:""}),async()=>response(200,JSON.stringify({value:"x".repeat(2_000_000)})));
 await expect(v.api(`/v9/projects/${TARGET.project}`)).rejects.toThrow("上限");
 vi.stubGlobal("fetch",async()=>new Response("{}",{headers:{"content-type":"text/html"}}));await expect(new Vercel(config()).api(`/v9/projects/${TARGET.project}`)).rejects.toThrow();
});
