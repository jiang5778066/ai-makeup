import { safeReturnPath } from "./auth-return";
import type { ToolKind } from "./makeup-draft";
import type { Locale } from "./i18n";
export type GenerationSession = {
  version: 1; generationId: string; tool: ToolKind; path: string; createdAt: number;
  style: { id: string; name: string; description: string };
};
export type GenerationResult = {
  id: string; status: "queued" | "moderating" | "running" | "done" | "failed" | "refunded";
  resultUrl: string | null; beforeUrl: string | null; fitNotes: string[]; styleName: string; error: string | null;
};
export type QueryPhase = "loading" | "idle" | "querying" | "paused" | "auth" | "not_found" | "done" | "failed" | "refunded";
function key(tool: ToolKind, path: string) { return `makeup-generation:v1:${tool}:${safeReturnPath(path)}`; }
function valid(value: unknown): value is GenerationSession {
  if (!value || typeof value !== "object") return false;
  const item = value as GenerationSession;
  return item.version === 1 && (item.tool === "full_face" || item.tool === "virtual_try_on") && typeof item.path === "string" && safeReturnPath(item.path) === item.path &&
    typeof item.generationId === "string" && /^[\w-]{1,128}$/.test(item.generationId) && Number.isFinite(item.createdAt) && item.createdAt <= Date.now() &&
    !!item.style && [item.style.id, item.style.name, item.style.description].every((part) => typeof part === "string" && part.length <= 1000);
}
export function saveGenerationSession(session: GenerationSession): void {
  if (!valid(session)) throw new Error("invalid_generation_session");
  const { version, generationId, tool, path, createdAt, style } = session;
  localStorage.setItem(key(tool, path), JSON.stringify({ version, generationId, tool, path, createdAt, style: { id: style.id, name: style.name, description: style.description } }));
}
export function readGenerationSession(tool: ToolKind, path: string): GenerationSession | null {
  const storageKey = key(tool, path);
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { /* 损坏记录不能用于查询。 */ }
  if (!valid(parsed) || parsed.tool !== tool || parsed.path !== path || Date.now() - parsed.createdAt > 24 * 60 * 60 * 1000) {
    localStorage.removeItem(storageKey); return null;
  }
  return parsed;
}
export function clearGenerationSession(session: GenerationSession): void {
  const storageKey = key(session.tool, session.path);
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  try { if (JSON.parse(raw).generationId !== session.generationId) return; } catch { return; }
  localStorage.removeItem(storageKey);
}
export function generationMessage(locale: Locale, phase: QueryPhase, reason?: string | null): string | null {
  const zh = locale === "zh-CN";
  if (reason === "storage") return zh ? "任务编号未能保存，请保持此页打开并重试保存后查询；刷新可能无法恢复。" : "Could not save the task ID. Keep this page open and retry saving before checking; refresh may lose recovery.";
  if (phase === "paused") return zh ? "状态查询已暂停，服务端任务可能仍在继续。可继续查询原任务，不会重复生成或扣费。" : "Status checks paused. The server task may still be running. Continue checking the original task without another generation or charge.";
  if (phase === "auth") return zh ? "登录已过期，请登录后继续查询原任务。" : "Your session expired. Sign in to continue checking the original task.";
  if (phase === "not_found") return zh ? "任务不存在或当前账户无权访问，已清理恢复记录。" : "Task not found or unavailable to this account. The recovery record was cleared.";
  if (phase === "failed") return zh ? "服务端报告生成失败；是否退回额度请以历史记录和实际余额为准。" : "The server reports generation failed. Check history and your actual balance for any credit return.";
  if (phase === "refunded") return zh ? "服务端报告此任务已退款；可在历史记录和余额中核对。" : "The server reports this task was refunded. Verify it in history and your balance.";
  return null;
}
