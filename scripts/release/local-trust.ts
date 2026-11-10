import { readFile, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import { isAbsolute, relative, sep } from "node:path";
import { command, type CommandRunner } from "./command";
import { trustSource, trustBuiltSource } from "./trust";
import { buildEnvironment } from "./snapshot";
import { REPOSITORY_ROOT } from "./paths";
import { TARGET } from "./preflight";
import { API_LIMITS } from "./native-auth";
export type LocalGuard = (phase?: "after-build") => Promise<void>;
export type ApprovalFiles = Record<"review" | "acceptance", { path: string; sha256: string }>;
type Approval = { sha: string; sourceTree: string; repository: string; project: string; team: string; reviewer: string; sourceReviewPassed?: boolean; acceptancePassed?: boolean };
type Run = { id: number; workflow_id: number; head_sha: string; head_branch: string; head_repository: { full_name: string }; status: string; conclusion: string };
export const trustLocal = async (sha: string, approvals: ApprovalFiles, run: CommandRunner = command, root = REPOSITORY_ROOT): Promise<LocalGuard> => {
  const env = buildEnvironment();
  const git = (...args: string[]) => run("git", args, env, root, API_LIMITS);
  const api = async <T>(path: string): Promise<T> => {
    try { return JSON.parse(await run("gh", ["api", `repos/${TARGET.repository}/${path}`, "--hostname", "github.com"], env, root, API_LIMITS)) as T; }
    catch { throw new Error("GitHub真实来源核对失败，原始响应已隐藏"); }
  };
  const check = async (builtSource?: () => Promise<void>) => {
    if (builtSource) await builtSource(); else await trustSource(sha, root);
    const remote = await git("remote", "get-url", "--all", "origin");
    if (![ `https://github.com/${TARGET.repository}.git`, `https://github.com/${TARGET.repository}`, `git@github.com:${TARGET.repository}.git` ].includes(remote)) throw new Error("origin不是固定GitHub仓库");
    const remoteMain = await git("ls-remote", "--exit-code", "origin", "refs/heads/main");
    if (remoteMain !== `${sha}\trefs/heads/main`) throw new Error("远端main与完整提交不匹配");
    const commit = await api<{ sha: string }>("commits/main"); if (commit.sha !== sha) throw new Error("GitHub main与提交不匹配");
    const tree = await git("rev-parse", "HEAD^{tree}");
    const records: Approval[] = [];
    for (const kind of ["review", "acceptance"] as const) {
      const input = approvals[kind];
      if (!input?.path || !isAbsolute(input.path) || !/^[a-f0-9]{64}$/.test(input.sha256)) throw new Error("缺少外部绝对路径独立审验记录与准确摘要");
      const location = relative(await realpath(root), await realpath(input.path));
      if (location !== ".." && !location.startsWith(".." + sep) && !isAbsolute(location)) throw new Error("独立审验记录必须位于执行树外");
      const raw = await readFile(input.path);
      if (raw.length > 1_000_000 || createHash("sha256").update(raw).digest("hex") !== input.sha256) throw new Error("独立审验记录变化");
      const value = JSON.parse(raw.toString("utf8")) as Approval;
      if (value.sha !== sha || value.sourceTree !== tree || value.repository !== TARGET.repository || value.project !== TARGET.project || value.team !== TARGET.team || !value.reviewer?.trim() || (kind === "review" ? value.sourceReviewPassed !== true : value.acceptancePassed !== true)) throw new Error("独立审验版本未绑定实际提交");
      records.push(value);
    }
    if (records[0].reviewer === records[1].reviewer) throw new Error("审查与验收必须独立");
    const production = await api<{ name: string; deployment_branch_policy: { custom_branch_policies: boolean; protected_branches: boolean } }>("environments/Production");
    const branches = await api<{ total_count: number; branch_policies: { name: string; type: string }[] }>("environments/Production/deployment-branch-policies");
    if (production.name !== "Production" || production.deployment_branch_policy?.custom_branch_policies !== true || production.deployment_branch_policy.protected_branches !== false || branches.total_count !== 1 || branches.branch_policies?.length !== 1 || branches.branch_policies[0].name !== "main" || branches.branch_policies[0].type !== "branch") throw new Error("Production环境必须准确限制main");
    const workflow = await api<{ id: number; path: string; state: string }>("actions/workflows/ci.yml");
    if (!Number.isSafeInteger(workflow.id) || workflow.path !== ".github/workflows/ci.yml" || workflow.state !== "active") throw new Error("CI工作流身份未知");
    const ci = await api<{ total_count: number; workflow_runs: Run[] }>(`actions/workflows/ci.yml/runs?branch=main&head_sha=${sha}&per_page=1`);
    const latest = ci.workflow_runs?.[0];
    if (!(ci.total_count >= 1) || ci.workflow_runs.length !== 1 || !Number.isSafeInteger(latest?.id) || latest.workflow_id !== workflow.id || latest.head_sha !== sha || latest.head_branch !== "main" || latest.head_repository?.full_name !== TARGET.repository || latest.status !== "completed" || latest.conclusion !== "success") throw new Error("准确提交最新CI未成功");
    for (const status of ["queued", "in_progress", "waiting", "pending", "requested"]) {
      const releases = await api<{ total_count: number; workflow_runs: unknown[] }>(`actions/workflows/release.yml/runs?status=${status}&per_page=1`);
      if (releases.total_count !== 0 || !Array.isArray(releases.workflow_runs) || releases.workflow_runs.length !== 0) throw new Error("存在或无法排除在途GitHub发布");
    }
    // 绑定环境全部保护规则、准确CI版本和审批内容，后续写操作前再核，不接受漂移。
    return JSON.stringify({ tree, production, branches, workflow, latest, records });
  };
  const initial = await check();
  const builtSource = await trustBuiltSource(sha, root);
  return async phase => {
    if (phase !== undefined && phase !== "after-build") throw new Error("来源重核阶段无效");
    if (await check(phase === "after-build" ? builtSource : undefined) !== initial) throw new Error("本地发布来源或Production配置发生变化");
  };
};
