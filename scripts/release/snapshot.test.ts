// @vitest-environment node
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { snapshotRuntime, buildEnvironment, assertSameSnapshot } from "./snapshot";
import { TARGET, runtimeRequired } from "./preflight";
import { TOOL_DIRECTORY } from "./paths";
const sha = "a".repeat(40);
const cloud = () => ({ ...Object.fromEntries(runtimeRequired.map(k => [k, "fixture"])), DATABASE_URL: `postgres://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full`, NEXT_PUBLIC_SITE_URL: `https://${TARGET.domain}`, NEXT_PUBLIC_SUPABASE_URL: `https://${TARGET.supabaseRef}.supabase.co`, SPECIAL: 'quote"slash\\\nnewline\n$dollar', RELEASE_SHA: "old" });
it("锁内CLI的JSON env对象与实际dotenv加载保留完整快照并覆盖父env", () => {
  const runtime = snapshotRuntime(cloud(), sha);
  const parsed = JSON.parse(JSON.stringify({ env: runtime }));
  const chunk = readFileSync(resolve(TOOL_DIRECTORY, "node_modules/vercel/dist/chunks/chunk-TPJV5UNE.js"), "utf8");
  const from = chunk.indexOf("var parseEnv=env=>"); const to = chunk.indexOf(";export", from);
  const cliParser = vm.runInNewContext(chunk.slice(from, to) + ";parseEnv");
  expect(cliParser(parsed.env)).toEqual(runtime);
  const inherited = buildEnvironment(runtime, { PATH: "/fixture/bin", SPECIAL: "wrong", DATABASE_URL: "other", PGHOST: "evil", EXTRA_SECRET: "unverified" });
  const dotenv = readFileSync(resolve(TOOL_DIRECTORY, "node_modules/vercel/dist/chunks/chunk-4VP57TOJ.js"), "utf8");
  const begin = dotenv.indexOf("function parse(src)"); const end = dotenv.indexOf("module.exports.config", begin);
  const parser = vm.runInNewContext(dotenv.slice(begin, end) + ";({config})", { fs: { readFileSync: () => "" }, process: { env: inherited } });
  parser.config({ path: "fixture" });
  expect(inherited.SPECIAL).toBe(cloud().SPECIAL); expect(inherited.DATABASE_URL).toBe(cloud().DATABASE_URL);
  expect(inherited).toMatchObject({ RELEASE_SHA: sha, RELEASE_PROJECT_ID: TARGET.project, VERCEL_GIT_COMMIT_SHA: sha });
  expect(inherited.PGHOST).toBeUndefined(); expect(inherited.EXTRA_SECRET).toBeUndefined();
});
it("部署前重核云端配置，值变化与新增键均阻断", () => {
  const first = snapshotRuntime(cloud(), sha);
  expect(() => assertSameSnapshot(first, snapshotRuntime(cloud(), sha))).not.toThrow();
  expect(() => assertSameSnapshot(first, snapshotRuntime({ ...cloud(), SPECIAL: "changed" }, sha))).toThrow();
  expect(() => assertSameSnapshot(first, snapshotRuntime({ ...cloud(), ADDED: "value" }, sha))).toThrow();
});
it("拒绝非字符串或不可取得的秘密快照", () => { expect(() => snapshotRuntime({ ...cloud(), SPECIAL: null }, sha)).toThrow(); });

it("仅网站和数据库模式允许第三方服务留空，核心配置仍必需", () => {
  const env = { RELEASE_PROFILE: "website-db", DISABLE_CHECKOUT: "1", DISABLE_GENERATION: "1", DATABASE_URL: cloud().DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL: cloud().NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SITE_URL: cloud().NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture" };
  expect(() => snapshotRuntime(env, sha)).not.toThrow();
  expect(() => snapshotRuntime({ ...env, DATABASE_URL: "" }, sha)).toThrow();
  expect(() => snapshotRuntime({ ...env, RELEASE_PROFILE: "unknown" }, sha)).toThrow();
});
it("平台临时OIDC令牌和部署地址不进入应用配置快照", () => {
  const first = snapshotRuntime({ ...cloud(), VERCEL_OIDC_TOKEN: "临时令牌一", VERCEL_URL: "" }, sha);
  const second = snapshotRuntime({ ...cloud(), VERCEL_OIDC_TOKEN: "临时令牌二", VERCEL_URL: "" }, sha);
  expect(first.VERCEL_OIDC_TOKEN).toBeUndefined(); expect(first.VERCEL_URL).toBeUndefined();
  expect(() => assertSameSnapshot(first, second)).not.toThrow();
});

it.each([{MEDIA_CREATE_ENABLED:"1"},{ENABLE_CHECKOUT:"1"},{DISABLE_CHECKOUT:"0"},{DISABLE_GENERATION:"0"}])("网站数据库范围不能意外开启真实生成或收费：%j", patch => {
  const env = {...cloud(), RELEASE_PROFILE:"website-db", DISABLE_CHECKOUT:"1", DISABLE_GENERATION:"1", ...patch};
  expect(() => snapshotRuntime(env, sha)).toThrow("保持生成与收费关闭");
});
