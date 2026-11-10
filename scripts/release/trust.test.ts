// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { command } from "./command";
import { trustSource } from "./trust";
import { REPOSITORY_ROOT } from "./paths";
const roots: string[] = [];
afterEach(async () => { vi.unstubAllEnvs(); for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }); }, 60_000);
const fixture = async () => {
  const root = await mkdtemp(join(tmpdir(), "release-sha-")); roots.push(root);
  const git = (...args: string[]) => command("git", args, process.env, root);
  await git("init", "-b", "main"); await git("config", "user.email", "fixture@invalid.test"); await git("config", "user.name", "fixture");
  await writeFile(join(root, "package.json"), "{}"); await writeFile(join(root, ".gitignore"), "node_modules\n.next\n.env*\n");
  await git("add", "."); await git("commit", "-m", "fixture"); const sha = await git("rev-parse", "HEAD"); await git("update-ref", "refs/remotes/origin/main", sha);
  return { root, sha, git };
};
it("从指定仓库根接受干净完整SHA", async () => { const f = await fixture(); await expect(trustSource(f.sha, f.root)).resolves.toBeUndefined(); });
it.each(["page.tsx", "vercel.json", ".env.local"])("合法生成输出旁的未跟踪%s仍阻塞", async name => {
  const f = await fixture(); await mkdir(join(f.root, ".next")); await writeFile(join(f.root, ".next/cache"), "generated"); await writeFile(join(f.root, name), "unreviewed");
  expect(await command("git", ["status", "--porcelain", "--untracked-files=no"], process.env, f.root)).toBe("");
  await expect(trustSource(f.sha, f.root)).rejects.toThrow();
});
it("只允许明确生成目录", async () => { const f = await fixture(); await mkdir(join(f.root, "release-result")); await writeFile(join(f.root, "release-result/result.json"), "{}"); await expect(trustSource(f.sha, f.root)).resolves.toBeUndefined(); });
it("SHA必须等于HEAD且属于受信main", async () => { const f = await fixture(); await expect(trustSource("b".repeat(40), f.root)).rejects.toThrow(); await f.git("update-ref", "-d", "refs/remotes/origin/main"); await expect(trustSource(f.sha, f.root)).rejects.toThrow(); });

it("仓库外调用默认迁移预检仍读取固定历史，不在调用cwd找SQL", async () => {
  const f = await fixture();
  const code = `const { migrationOnClient } = require(${JSON.stringify(join(REPOSITORY_ROOT, "scripts/db/migration.ts"))});
    const sql = async parts => { const query = parts.join("?");
      if (query.includes("to_regclass('auth.users')")) return [{name:"auth.users"}];
      if (query.includes("to_regclass('drizzle.__drizzle_migrations')")) return [{name:null}];
      return []; };
    sql.begin = async (mode, fn) => { if(mode !== "read only") throw Error("write"); return fn(sql); };
    migrationOnClient(sql, "status").then(value => console.log(JSON.stringify(value))).catch(() => process.exitCode=1);`;
  const out = await command(process.execPath, ["--import", join(REPOSITORY_ROOT, "node_modules/tsx/dist/loader.mjs"), "-e", code], process.env, f.root);
  expect(JSON.parse(out)).toEqual({ applied: [], pending: ["0001_production_readiness", "0002_d1_creation_visibility", "0002_d2_checkout_attempts", "0003_e1_media_tasks"] });
});

it.each(["--assume-unchanged", "--skip-worktree"])("不能用%s隐藏未提交源码", async flag => {
 const f=await fixture();await f.git("update-index",flag,"package.json");await writeFile(join(f.root,"package.json"),'{"changed":true}');await expect(trustSource(f.sha,f.root)).rejects.toThrow();
});

it("近似生成路径不能被命令输出trim误识别为根缓存或生成目录", async () => {
  const f = await fixture();
  await writeFile(join(f.root, "\ntsconfig.tsbuildinfo"), "tracked");
  await f.git("add", "."); await f.git("commit", "-m", "测试：近似路径");
  const sha = await f.git("rev-parse", "HEAD"); await f.git("update-ref", "refs/remotes/origin/main", sha);
  const { trustBuiltSource } = await import("./trust"); const guard = await trustBuiltSource(sha, f.root);
  await writeFile(join(f.root, "\ntsconfig.tsbuildinfo"), "changed");
  await expect(guard()).rejects.toThrow();
});
it("前导空白未跟踪路径不能冒充已批准生成目录", async () => {
  const f = await fixture(); await mkdir(join(f.root, "\n.next")); await writeFile(join(f.root, "\n.next/cache"), "unreviewed");
  await expect(trustSource(f.sha, f.root)).rejects.toThrow();
});

const generatedListing = async (root: string, count: number) => {
  const directory = join(root, "node_modules"); await mkdir(directory);
  for (let start = 0; start < count; start += 100) {
    await Promise.all(Array.from({ length: Math.min(100, count - start) }, (_, offset) =>
      writeFile(join(directory, "x".repeat(220) + "-" + String(start + offset).padStart(6, "0")), "")));
  }
  return command("git", ["ls-files", "--others", "-t", "-z"], process.env, root, { maxOutputBytes: 20_000_000 });
};
it("超过2MB的完整合法生成清单仍可通过来源门禁", async () => {
  const f = await fixture(); const output = await generatedListing(f.root, 9_000);
  expect(Buffer.byteLength(output)).toBeGreaterThan(2_000_000);
  await expect(trustSource(f.sha, f.root)).resolves.toBeUndefined();
}, 60_000);
it("超过2MB清单尾部的未授权源码仍逐项拒绝", async () => {
  const f = await fixture(); await generatedListing(f.root, 9_000);
  await writeFile(join(f.root, "zz-unreviewed.ts"), "unreviewed");
  const output = await command("git", ["ls-files", "--others", "-t", "-z"], process.env, f.root, { maxOutputBytes: 20_000_000 });
  expect(Buffer.byteLength(output)).toBeGreaterThan(2_000_000);
  expect(output.endsWith("? zz-unreviewed.ts\0")).toBe(true);
  await expect(trustSource(f.sha, f.root)).rejects.toThrow("发布工作树含未跟踪源码或配置");
}, 60_000);
it("超过16MB仍有界拒绝并确认枚举子进程已回收", async () => {
  const f = await fixture(); const output = await generatedListing(f.root, 70_000);
  expect(Buffer.byteLength(output)).toBeGreaterThan(16_000_000);
  const realGit = await command("which", ["git"]);
  const bin = await mkdtemp(join(tmpdir(), "release-git-pid-")); roots.push(bin);
  const pidFile = join(bin, "pid");
  const quote = (value: string) => "'" + value.replaceAll("'", "'\\''") + "'";
  // 仅记录本夹具真实Git进程身份，参数及完整输出原样透传。
  await writeFile(join(bin, "git"), `#!/bin/sh\nprintf '%s' "$$" > ${quote(pidFile)}\nexec ${quote(realGit)} "$@"\n`, { mode: 0o755 });
  vi.stubEnv("PATH", bin + ":" + process.env.PATH);
  await expect(trustSource(f.sha, f.root)).rejects.toThrow("子命令输出超过上限");
  const pid = Number(await readFile(pidFile, "utf8")); expect(pid).toBeGreaterThan(0);
  expect(() => process.kill(pid, 0)).toThrowError(expect.objectContaining({ code: "ESRCH" }));
}, 90_000);
