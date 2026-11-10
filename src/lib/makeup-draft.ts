import { safeReturnPath } from "./auth-return";
import { MAKEUP_PARTS, MAKEUP_PRESETS, type MakeupConfig } from "./makeup";

export type ToolKind = "full_face" | "virtual_try_on";
type DraftBase = { version: 1; id: string; tool: ToolKind; path: string; at: number; source: Blob; legacy?: boolean };
export type MakeupDraft = DraftBase & ({ tool: "full_face"; styleId: string; intensity: number } | { tool: "virtual_try_on"; config: MakeupConfig });
export type DraftRead = { kind: "none" | "expired" | "invalid" } | { kind: "ready"; draft: MakeupDraft };
const MAX_AGE = 30 * 60 * 1000;
const MAX_BYTES = 12 * 1024 * 1024;

export function validDraftPhoto(source: unknown): source is Blob {
  return source instanceof Blob && source.size > 0 && source.size <= MAX_BYTES && ["image/jpeg", "image/png", "image/webp"].includes(source.type);
}
function validConfig(value: unknown): value is MakeupConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length > 0 && entries.every(([part, layer]) => MAKEUP_PARTS.includes(part as typeof MAKEUP_PARTS[number]) &&
    layer && typeof layer === "object" && typeof layer.enabled === "boolean" &&
    typeof layer.color === "string" && /^#[\da-f]{6}$/i.test(layer.color) &&
    typeof layer.intensity === "number" && Number.isFinite(layer.intensity) && layer.intensity >= 0 && layer.intensity <= 100 &&
    MAKEUP_PRESETS[part as typeof MAKEUP_PARTS[number]].some((preset) => preset.id === layer.presetId));
}
function validDraft(value: unknown): value is MakeupDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as MakeupDraft;
  return draft.version === 1 && typeof draft.id === "string" && draft.id.length > 0 && typeof draft.path === "string" && safeReturnPath(draft.path) === draft.path &&
    typeof draft.at === "number" && Number.isFinite(draft.at) && draft.at <= Date.now() && validDraftPhoto(draft.source) &&
    (draft.tool === "full_face" ? typeof draft.styleId === "string" && /^[\w-]{1,80}$/.test(draft.styleId) && Number.isFinite(draft.intensity) && draft.intensity >= 20 && draft.intensity <= 100 : draft.tool === "virtual_try_on" && validConfig(draft.config));
}
function key(tool: ToolKind, path: string) { return `${tool}:${safeReturnPath(path)}`; }

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined" || !indexedDB) return Promise.reject(new Error("draft_storage_unavailable"));
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => { settled = true; reject(new Error("draft_storage_timeout")); }, 5000);
    const fail = () => { clearTimeout(timeout); settled = true; reject(new Error("draft_storage_unavailable")); };
    try {
      const request = indexedDB.open("makeup-ai", 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains("drafts")) request.result.createObjectStore("drafts"); };
      request.onblocked = fail;
      request.onerror = fail;
      request.onsuccess = () => {
        clearTimeout(timeout);
        if (settled) request.result.close();
        else { settled = true; resolve(request.result); }
      };
    } catch { fail(); }
  });
}

async function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, set: (value: T) => void) => void): Promise<T> {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = database.transaction("drafts", mode);
      let result: T;
      const timeout = setTimeout(() => { try { tx.abort(); } catch { /* 超时后仍明确报告存储不可用。 */ } reject(new Error("draft_storage_timeout")); }, 5000);
      tx.oncomplete = () => { clearTimeout(timeout); resolve(result); };
      tx.onerror = tx.onabort = () => { clearTimeout(timeout); reject(tx.error ?? new Error("draft_storage_failed")); };
      try { run(tx.objectStore("drafts"), (value) => { result = value; }); }
      catch (error) { clearTimeout(timeout); reject(error); }
    });
  } finally { database.close(); }
}

export async function saveMakeupDraft(draft: MakeupDraft): Promise<void> {
  if (!validDraft(draft)) throw new Error("invalid_draft");
  await transaction<void>("readwrite", (store) => { store.put(draft, key(draft.tool, draft.path)); });
}

export async function readMakeupDraft(tool: ToolKind, path: string): Promise<DraftRead> {
  const value = await transaction<unknown>("readonly", (store, set) => {
    const request = store.get(key(tool, path));
    request.onsuccess = () => {
      if (request.result !== undefined || tool !== "virtual_try_on") { set(request.result); return; }
      const old = store.get("pending");
      old.onsuccess = () => {
        const legacy = old.result;
        set(legacy ? { ...legacy, version: 1, id: `legacy-${legacy.at}`, tool, path: safeReturnPath(path), legacy: true } : undefined);
      };
    };
  });
  if (value === undefined) return { kind: "none" };
  if (!validDraft(value)) return { kind: "invalid" };
  if (Date.now() - value.at > MAX_AGE) return { kind: "expired" };
  return { kind: "ready", draft: value };
}

export async function consumeMakeupDraft(draft: MakeupDraft): Promise<void> {
  await transaction<void>("readwrite", (store) => {
    const storageKey = draft.legacy ? "pending" : key(draft.tool, draft.path);
    const request = store.get(storageKey);
    request.onsuccess = () => {
      const current = request.result;
      if (current && (draft.legacy ? current.at === draft.at : current.id === draft.id)) store.delete(storageKey);
    };
  });
}
