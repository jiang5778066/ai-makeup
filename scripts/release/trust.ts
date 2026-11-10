import { command } from "./command";
import { buildEnvironment } from "./snapshot";
import { REPOSITORY_ROOT } from "./paths";
import { lstat, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const generated = (path: string) => /^(node_modules\/|scripts\/release\/tools\/node_modules\/|\.next\/|coverage\/|\.vercel\/|release-result\/)/.test(path) || path === "tsconfig.tsbuildinfo";
const gitAt = (root: string) => (...args: string[]) => command("git", args, { ...buildEnvironment(), GIT_OPTIONAL_LOCKS: "0" }, root, { timeoutMs: 20_000, maxOutputBytes: 2_000_000 });
const cacheMode = async (root: string) => {
  try {
    const file = await lstat(resolve(root, "tsconfig.tsbuildinfo"));
    if (!file.isFile() || file.isSymbolicLink()) throw new Error("根构建缓存必须是普通文件");
    return file.mode & 0o7777;
  } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined; throw error; }
};
const checkSource = async (sha: string, root: string, afterBuild = false) => {
  const git = gitAt(root);
  if (!/^[a-f0-9]{40}$/.test(sha) || await git("rev-parse", "HEAD") !== sha) throw new Error("工作树不匹配完整提交");
  const flags = (await git("ls-files", "-v", "-z")).split("\0").filter(Boolean);
  if (flags.some(entry => !entry.startsWith("H "))) throw new Error("发布索引包含隐藏工作树变化的标志");
  await git("merge-base", "--is-ancestor", sha, "refs/remotes/origin/main");
  // 状态前缀保住原始路径前导空白，避免通用command的trim把近似路径误当根缓存。
  const changed = (await git("diff", "--name-status", "--no-renames", "-z", "HEAD")).split("\0").filter(Boolean);
  if (await git("diff", "--cached", "--name-only", "-z") || changed.length % 2 !== 0 || changed.some((status, i) => i % 2 === 0 && (!afterBuild || status !== "M" || changed[i + 1] !== "tsconfig.tsbuildinfo"))) throw new Error("发布工作树存在已跟踪改动");
  await cacheMode(root);
  // 同时检查被ignore隐藏的源码/环境文件，仅放行明确生成目录；docs报告仍阻塞。
  const others = (await git("ls-files", "--others", "-t", "-z")).split("\0").filter(Boolean);
  if (others.some(entry => !entry.startsWith("? ") || !generated(entry.slice(2)))) throw new Error("发布工作树含未跟踪源码或配置");
};
export const trustSource = async (sha: string, root = REPOSITORY_ROOT) => checkSource(sha, root);
// 工厂必须先通过严格入场；只有返回的本轮能力可容许根缓存内容变化，不能给trustSource传宽松标志。
export const trustBuiltSource = async (sha: string, root = REPOSITORY_ROOT) => {
  await trustSource(sha, root);
  const git = gitAt(root);
  const index = resolve(root, await git("rev-parse", "--git-path", "index"));
  const indexHash = async () => createHash("sha256").update(await readFile(index)).digest("hex");
  const initialIndex = await indexHash(), mode = await cacheMode(root);
  return async () => {
    const unchanged = async () => {
      if (await indexHash() !== initialIndex || await cacheMode(root) !== mode) throw new Error("发布索引或根构建缓存类型/模式发生变化");
    };
    await unchanged(); await checkSource(sha, root, true); await unchanged();
  };
};
