"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CreationDTO, CreationFilter, CreationPage } from "@/lib/platform-creations-types";
import { isCreationActive } from "@/lib/platform-creations-types";
import { expirePlatformAccount, getPlatformAccountEpoch } from "@/lib/platform-account-session";
import { downloadCreation } from "@/lib/platform-creations-download";
const owns = (owner: { active: boolean; epoch: number }) => owner.active && owner.epoch === getPlatformAccountEpoch();
export const usePlatformCreations = (filter: CreationFilter) => {
  const [items, setItems] = useState<CreationDTO[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pollAttempt, setPollAttempt] = useState(0);
  const scope = useRef({ active: true, epoch: getPlatformAccountEpoch(), controllers: new Set<AbortController>(), loading: false, busy: false });
  useEffect(() => { const owner = scope.current; owner.active = true; return () => { owner.active = false; owner.controllers.forEach(c => c.abort()); owner.controllers.clear(); }; }, []);
  const request = useCallback(async (url: string, method = "GET", outer?: AbortSignal) => {
    const owner = scope.current;
    const controller = new AbortController(); owner.controllers.add(controller);
    const current = () => scope.current === owner && owner.active && !controller.signal.aborted && getPlatformAccountEpoch() === owner.epoch;
    const abort = () => controller.abort(); outer?.addEventListener("abort", abort, { once: true });
    if (outer?.aborted || !current()) controller.abort();
    let timer: ReturnType<typeof setTimeout>;
    try {
      return await Promise.race([
        (async () => {
          if (!current()) throw new Error("stale_request");
          const response = await fetch(url, { method, signal: controller.signal, cache: "no-store", credentials: "same-origin" });
          if (!current()) throw new Error("stale_request");
          if (response.status === 401) { owner.active = false; owner.controllers.forEach(c => c.abort()); expirePlatformAccount(owner.epoch); throw new Error("unauthorized"); }
          if (!response.ok) throw new Error(response.status === 404 ? "not_found" : "request_failed");
          const body = await response.json();
          if (!current()) throw new Error("stale_request");
          return body;
        })(),
        new Promise<never>((_resolve, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error("timeout")); }, 15000); })
      ]);
    } finally { clearTimeout(timer!); outer?.removeEventListener("abort", abort); owner.controllers.delete(controller); }
  }, []);
  const read = useCallback(async (id: string, signal?: AbortSignal): Promise<CreationDTO> => {
    const value = await request(`/api/creations/${encodeURIComponent(id)}`, "GET", signal);
    if (!value || value.version !== 1 || value.id !== id || !["queued", "moderating", "running", "done", "failed", "refunded", "reconciling"].includes(value.status)) throw new Error("invalid_status");
    return value;
  }, [request]);
  const load = useCallback(async (next: string | null = null) => {
    const owner = scope.current; if (owner.loading || !owns(owner)) return;
    owner.loading = true; setLoading(true); setError(null); setNotice(null);
    try {
      const query = new URLSearchParams({ filter, limit: "12" }); if (next) query.set("cursor", next);
      const page: CreationPage = await request(`/api/creations?${query}`);
      if (!Array.isArray(page.items) || page.items.some(item => item.version !== 1)) throw new Error("invalid_page");
      if (owns(owner)) { setItems(current => next ? [...current, ...page.items.filter(item => !current.some(existing => existing.id === item.id))] : page.items); setCursor(page.nextCursor); }
    } catch { if (owns(owner)) setError("load"); }
    finally { owner.loading = false; if (owns(owner)) setLoading(false); }
  }, [filter, request]);
  useEffect(() => { const timer = setTimeout(() => { void load(); }, 0); return () => clearTimeout(timer); }, [load]);
  const ids = items.filter(item => isCreationActive(item.status)).map(item => item.id).join("|");
  useEffect(() => {
    if (!ids) return;
    let stopped = false; let rounds = 0; let failures = 0; const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    const query = async () => {
      let active = false;
      try {
        for (const id of ids.split("|")) {
          const item = await read(id, controller.signal);
          if (stopped || !owns(scope.current)) return;
          active ||= isCreationActive(item.status);
          setItems(current => current.map(existing => existing.id === id ? item : existing));
        }
        failures = 0;
      } catch (err) {
        if (stopped || !owns(scope.current)) return;
        if (err instanceof Error && err.message === "not_found") { setNotice("not_found"); return; }
        failures++; active = true;
      }
      if (!active || stopped) return;
      if (failures >= 3 || Date.now() - started >= 600000 || ++rounds >= 24) { setNotice("paused"); return; }
      timer = setTimeout(() => { void query(); }, Math.min(30000, 2000 * 2 ** Math.min(rounds, 4)));
    };
    timer = setTimeout(() => { void query(); }, 2000);
    return () => { stopped = true; controller.abort(); clearTimeout(timer); };
  }, [ids, read, pollAttempt]);
  const refresh = async (id: string) => {
    if (!owns(scope.current)) return;
    setError(null);
    try { const item = await read(id); if (owns(scope.current)) setItems(current => current.map(existing => existing.id === id ? item : existing)); }
    catch { if (owns(scope.current)) setError("refresh"); }
  };
  const remove = async (id: string) => {
    const owner = scope.current; if (!owns(owner) || owner.busy) return;
    owner.busy = true; setBusy(id); setError(null);
    try { await request(`/api/creations/${encodeURIComponent(id)}`, "DELETE"); if (owns(owner)) { setItems(current => current.filter(item => item.id !== id)); setNotice("removed"); } }
    catch { if (owns(owner)) setError("remove"); }
    finally { owner.busy = false; if (owns(owner)) setBusy(null); }
  };
  const download = async (id: string) => {
    const owner = scope.current; if (!owns(owner) || owner.busy) return;
    owner.busy = true; const controller = new AbortController(); owner.controllers.add(controller); setBusy(id); setError(null);
    const timeout = setTimeout(() => controller.abort(), 60000);
    try { await downloadCreation(id, read, controller.signal); if (owns(owner)) setNotice("downloaded"); }
    catch { if (owns(owner)) setError("download"); }
    finally { clearTimeout(timeout); owner.controllers.delete(controller); owner.busy = false; if (owns(owner)) setBusy(null); }
  };
  return { items, cursor, loading, error, notice, busy, load, refresh, remove, download, resume: () => { setNotice(null); setPollAttempt(n => n + 1); } };
};
