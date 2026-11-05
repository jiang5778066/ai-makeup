import type { AuditReport } from "./audit";
import { preflight, type ReleaseConfig } from "./preflight";
import type { Previous } from "./previous";
export type Deployment = { id: string; url: string };
export type Operations = {
  trust(): Promise<void>; audit(): Promise<AuditReport | void>; inspect(): Promise<Previous | null>; validate(): Promise<void>; build(): Promise<void>;
  candidate(): Promise<Deployment>; migrate(): Promise<string[]>;
  health(deployment: Deployment, production: boolean): Promise<void>; promote(deployment: Deployment): Promise<void>;
};
export type ReleaseResult = { ok: boolean; sha: string; stage: string; completed: string[]; candidate?: Deployment; previous?: Previous | null; rollbackUnavailable?: boolean; migrations?: string[]; promotionAttempted: boolean; promoted: boolean; error?: string; reportErrors?: string[]; audit?: AuditReport };
export const release = async (config: ReleaseConfig, ops: Operations, checkpoint: (result: ReleaseResult) => Promise<void> = async () => {}): Promise<ReleaseResult> => {
  const result: ReleaseResult = { ok: false, sha: /^[a-f0-9]{40}$/.test(config.sha) ? config.sha : "invalid", stage: "preflight", completed: [], promotionAttempted: false, promoted: false };
  const save = async () => {
    try { await checkpoint(structuredClone(result)); }
    catch { if (!result.reportErrors?.includes("checkpoint")) (result.reportErrors ??= []).push("checkpoint"); throw new Error("安全检查点写入失败"); }
  };
  const step = async (name: string, fn: () => Promise<void>) => { result.stage = name; await save(); await fn(); result.completed.push(name); await save(); };
  try {
    preflight(config); result.completed.push("preflight");
    await step("trust", ops.trust);
    await step("audit", async () => { result.audit = await ops.audit() || undefined; });
    await step("inspect", async () => {
      result.previous = await ops.inspect();
      if (result.previous === null && !config.bootstrap) throw new Error("无上一版本但未显式首次模式");
      result.rollbackUnavailable = result.previous === null;
    });
    await step("validate", ops.validate); await step("build", ops.build);
    await step("candidate", async () => { result.candidate = await ops.candidate(); });
    await step("migrate", async () => { result.migrations = await ops.migrate(); });
    await step("candidate-health", () => ops.health(result.candidate!, false));
    await step("promote", async () => {
      result.promotionAttempted = true; await save();
      await ops.promote(result.candidate!); result.promoted = true;
    });
    await step("production-health", () => ops.health(result.candidate!, true)); result.ok = true;
  } catch { result.error = `阶段 ${result.stage} 失败；详见受控排查流程，原始异常不写入发布证据。`; }
  return result;
};
