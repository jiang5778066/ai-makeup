// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, writeFile, readFile, rm, stat, utimes, chmod, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { command } from "./command";
import { trustSource, trustBuiltSource } from "./trust";
import { REPOSITORY_ROOT } from "./paths";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
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


const builtFixture = async () => {
  const f = await fixture();
  await writeFile(join(f.root, "tsconfig.tsbuildinfo"), "original cache");
  await writeFile(join(f.root, "empty.txt"), "");
  await writeFile(join(f.root, " 空白\t索引\n路径 "), "special path");
  await f.git("add", "."); await f.git("commit", "-m", "测试：构建来源夹具");
  const sha = await f.git("rev-parse", "HEAD"); await f.git("update-ref", "refs/remotes/origin/main", sha);
  return { ...f, sha };
};
const rawIndexHash = async (root: string) => createHash("sha256").update(await readFile(join(root, ".git/index"))).digest("hex");
it("合法stat刷新只改索引字节而条目标志及全部diff不变时允许构建后复核", async () => {
  const f = await builtFixture(); const guard = await trustBuiltSource(f.sha, f.root);
  const raw = await rawIndexHash(f.root), stage = await f.git("ls-files", "--stage", "-z"), flags = await f.git("ls-files", "-v", "-z");
  const path = join(f.root, "package.json"), info = await stat(path);
  await utimes(path, info.atime, new Date(info.mtimeMs + 5_000)); await f.git("update-index", "--refresh");
  expect(await rawIndexHash(f.root)).not.toBe(raw);
  expect(await f.git("ls-files", "--stage", "-z")).toBe(stage); expect(await f.git("ls-files", "-v", "-z")).toBe(flags);
  for (const args of [["diff", "--name-status", "HEAD"], ["diff", "--name-status"], ["diff", "--cached", "--name-status"]]) expect(await f.git(...args)).toBe("");
  await expect(guard()).resolves.toBeUndefined();
});
it("合法根缓存内容变化仍允许且不放宽严格入场", async () => {
  const f = await builtFixture(); const guard = await trustBuiltSource(f.sha, f.root);
  await writeFile(join(f.root, "tsconfig.tsbuildinfo"), "new generated content");
  await expect(guard()).resolves.toBeUndefined(); await expect(trustSource(f.sha, f.root)).rejects.toThrow("发布工作树存在已跟踪改动");
});
it.each(["content", "path", "mode", "conflict", "index-format", "--skip-worktree", "--assume-unchanged", "intent-to-add"])("构建后索引语义变化%s仍拒绝", async change => {
  const f = await builtFixture(); const guard = await trustBuiltSource(f.sha, f.root);
  if (change === "content") { await writeFile(join(f.root, "package.json"), '{"staged":true}'); await f.git("add", "package.json"); }
  else if (change === "path") await f.git("mv", "package.json", "renamed.json");
  else if (change === "mode") await f.git("update-index", "--chmod=+x", "package.json");
  else if (change === "index-format") await f.git("update-index", "--index-version", "4");
  else if (change === "conflict") {
    const oid = await f.git("rev-parse", "HEAD:package.json");
    const input = `0 ${"0".repeat(40)}\tpackage.json\n` + [1, 2, 3].map(stage => `100644 ${oid} ${stage}\tpackage.json\n`).join("");
    const result = spawnSync("git", ["update-index", "--index-info"], { cwd: f.root, env: process.env, input, encoding: "utf8" }); expect(result.status).toBe(0);
  } else if (change === "intent-to-add") { await writeFile(join(f.root, "intent.txt"), "pending"); await f.git("add", "-N", "intent.txt"); }
  else await f.git("update-index", change, "package.json");
  await expect(guard()).rejects.toThrow(change === "index-format" ? "发布索引格式发生变化" : "发布索引语义发生变化");
});
it("已有空文件转为intent-to-add即使stage条目及标志相同仍由暂存保护拒绝", async () => {
  const f = await builtFixture(); await f.git("update-index", "--index-version", "4");
  const guard = await trustBuiltSource(f.sha, f.root);
  const stage = await f.git("ls-files", "--stage", "-z"), flags = await f.git("ls-files", "-v", "-z");
  await f.git("rm", "--cached", "empty.txt"); await f.git("add", "-N", "empty.txt");
  expect(await f.git("ls-files", "--stage", "-z")).toBe(stage); expect(await f.git("ls-files", "-v", "-z")).toBe(flags);
  expect(await f.git("diff", "--cached", "--name-only", "-z")).toBe("empty.txt\0");
  await expect(guard()).rejects.toThrow("发布索引语义发生变化");
});
it.each(["symlink", "mode"])("构建后根缓存%s变化给出独立固定错误", async change => {
  const f = await builtFixture(); const guard = await trustBuiltSource(f.sha, f.root); const cache = join(f.root, "tsconfig.tsbuildinfo");
  if (change === "symlink") { await rm(cache); await symlink(join(f.root, "package.json"), cache); } else await chmod(cache, 0o600);
  await expect(guard()).rejects.toThrow("发布根构建缓存类型/模式发生变化");
});
it("构建后补建原先不存在的根缓存仍拒绝模式漂移", async () => {
  const f = await fixture(); const guard = await trustBuiltSource(f.sha, f.root); await writeFile(join(f.root, "tsconfig.tsbuildinfo"), "new");
  await expect(guard()).rejects.toThrow("发布根构建缓存类型/模式发生变化");
});
it("复核期间后半段索引变化仍由第二次语义检查拒绝", async () => {
  const f = await builtFixture(); const guard = await trustBuiltSource(f.sha, f.root);
  const realGit = await command("which", ["git"]); const bin = await mkdtemp(join(tmpdir(), "release-index-race-")); roots.push(bin);
  const quote = (value: string) => "'" + value.replaceAll("'", "'\\''") + "'";
  await writeFile(join(bin, "git"), `#!/bin/sh\n${quote(realGit)} "$@"\nresult=$?\nif [ "$#" -eq 4 ] && [ "$1" = ls-files ] && [ "$2" = --others ] && [ "$3" = -t ] && [ "$4" = -z ]; then\n ${quote(realGit)} update-index --chmod=+x package.json || exit 1\nfi\nexit "$result"\n`, { mode: 0o755 });
  vi.stubEnv("PATH", bin + ":" + process.env.PATH);
  await expect(guard()).rejects.toThrow("发布索引语义发生变化");
});

it.each(["same-oid-ita", "--skip-worktree", "--assume-unchanged", "staged-content"])("末尾复核的%s组合变化仍拒绝", async change => {
  const f = await builtFixture(); await f.git("update-index", "--index-version", "4");
  const guard = await trustBuiltSource(f.sha, f.root);
  const stage = await f.git("ls-files", "--stage", "-z"), flags = await f.git("ls-files", "-v", "-z");
  const format = (await readFile(join(f.root, ".git/index"))).subarray(0, 8).toString("hex");
  const realGit = await command("which", ["git"]); const bin = await mkdtemp(join(tmpdir(), "release-late-ita-")); roots.push(bin);
  const quote = (value: string) => "'" + value.replaceAll("'", "'\\''") + "'";
  const mutation = change === "same-oid-ita"
    ? `${quote(realGit)} rm --cached --quiet empty.txt || exit 1\n ${quote(realGit)} add -N empty.txt || exit 1`
    : change === "staged-content"
      ? `printf '%s' late > package.json\n ${quote(realGit)} add package.json || exit 1`
      : `${quote(realGit)} update-index ${quote(change)} package.json || exit 1`;
  // 与Reviewer反例相同：完整枚举透传后、中段源码检查结束与末尾二检之间注入。
  await writeFile(join(bin, "git"), `#!/bin/sh\n${quote(realGit)} "$@"\nresult=$?\nif [ "$#" -eq 4 ] && [ "$1" = ls-files ] && [ "$2" = --others ] && [ "$3" = -t ] && [ "$4" = -z ]; then\n ${mutation}\nfi\nexit "$result"\n`, { mode: 0o755 });
  vi.stubEnv("PATH", bin + ":" + process.env.PATH);
  await expect(guard()).rejects.toThrow("发布索引语义发生变化");
  if (change === "same-oid-ita") {
    expect(await f.git("ls-files", "--stage", "-z")).toBe(stage); expect(await f.git("ls-files", "-v", "-z")).toBe(flags);
    expect((await readFile(join(f.root, ".git/index"))).subarray(0, 8).toString("hex")).toBe(format);
    expect(await f.git("diff", "--cached", "--name-only", "-z")).toBe("empty.txt\0");
  }
});
