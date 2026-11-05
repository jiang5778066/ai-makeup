import { TARGET } from "./preflight";
import { trustedHost } from "./health";
export class ApiFailure extends Error { constructor(readonly status: number) { super("Vercel只读API失败"); } }
export type Previous = { id: string; url: string; sha: string };
type Detail = { id: string; url: string; projectId: string; ownerId: string; target: string; readyState: string; meta?: Record<string, string> };
export type ReadApi = <T>(path: string) => Promise<T>;
const owned = (d: Detail) => {
  if (!d || !/^dpl_[a-zA-Z0-9]+$/.test(d.id) || d.projectId !== TARGET.project || d.ownerId !== TARGET.team || d.target !== "production") throw new Error("上一部署归属未知");
  trustedHost(d.url);
};
export const previousProduction = async (api: ReadApi, bootstrap = false): Promise<Previous | null> => {
  let alias: { alias: string; projectId: string; deploymentId: string } | null;
  try { alias = await api(`/v4/aliases/${TARGET.domain}`); }
  catch (error) { if (error instanceof ApiFailure && error.status === 404) alias = null; else throw error; }
  let deployment: Detail | undefined;
  if (alias !== null) {
    if (!alias || alias.alias !== TARGET.domain || alias.projectId !== TARGET.project || !/^dpl_[a-zA-Z0-9]+$/.test(alias.deploymentId)) throw new Error("正式alias归属未知");
    // 详情404不代表alias不存在，直接失败。
    deployment = await api<Detail>(`/v13/deployments/${alias.deploymentId}`); owned(deployment);
    if (deployment.id !== alias.deploymentId) throw new Error("alias部署身份不匹配");
  }
  if (deployment?.readyState === "READY") {
    const sha = deployment.meta?.releaseSha ?? deployment.meta?.githubCommitSha;
    if (!sha || !/^[a-f0-9]{40}$/.test(sha)) throw new Error("上一READY部署缺少可核对提交身份");
    return { id: deployment.id, url: deployment.url, sha };
  }
  if (!bootstrap || (alias !== null && deployment?.readyState !== "ERROR")) throw new Error("无可用READY生产服务，需显式bootstrap且状态已核");
  // 不以最新ERROR猜测历史；完整枚举并逐项核实，任何READY或非终态均阻塞首次模式。
  const seen = new Set<number>();
  let until: number | null = null;
  for (let page = 0; page < 1000; page++) {
    const list: { deployments: { uid: string }[]; pagination: { next: number | null } } = await api(`/v6/deployments?projectId=${TARGET.project}&target=production&limit=100${until === null ? "" : `&until=${until}`}`);
    if (!Array.isArray(list.deployments) || !list.pagination || !(list.pagination.next === null || Number.isSafeInteger(list.pagination.next))) throw new Error("生产历史分页未知");
    for (const item of list.deployments) {
      if (!/^dpl_[a-zA-Z0-9]+$/.test(item.uid)) throw new Error("生产历史身份未知");
      const detail = await api<Detail>(`/v13/deployments/${item.uid}`); owned(detail);
      if (detail.id !== item.uid || !["ERROR", "CANCELED"].includes(detail.readyState)) throw new Error("存在READY或未完成生产部署，不能声明首次无回退");
    }
    if (list.pagination.next === null) return null;
    if (seen.has(list.pagination.next)) throw new Error("生产历史分页重复");
    seen.add(list.pagination.next); until = list.pagination.next;
  }
  throw new Error("生产历史过长，需人工核实");
};
