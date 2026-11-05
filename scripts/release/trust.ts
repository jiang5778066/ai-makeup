import { command } from "./command";
import { REPOSITORY_ROOT } from "./paths";
const generated = (path: string) => /^(node_modules\/|scripts\/release\/tools\/node_modules\/|\.next\/|coverage\/|\.vercel\/|release-result\/)/.test(path) || path === "tsconfig.tsbuildinfo";
export const trustSource = async (sha: string, root = REPOSITORY_ROOT) => {
  const git = (...args: string[]) => command("git", args, process.env, root);
  if (!/^[a-f0-9]{40}$/.test(sha) || await git("rev-parse", "HEAD") !== sha) throw new Error("工作树不匹配完整提交");
  await git("merge-base", "--is-ancestor", sha, "refs/remotes/origin/main");
  if (await git("diff", "--name-only", "HEAD") || await git("diff", "--cached", "--name-only")) throw new Error("发布工作树存在已跟踪改动");
  // 同时检查被ignore隐藏的源码/环境文件，仅放行明确生成目录。
  const others = (await git("ls-files", "--others", "-z")).split("\0").filter(Boolean);
  if (others.some(path => !generated(path))) throw new Error("发布工作树含未跟踪源码或配置");
};
