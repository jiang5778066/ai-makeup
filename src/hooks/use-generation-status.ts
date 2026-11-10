"use client";
import { useCallback, useEffect, useState } from "react";
import { clearGenerationSession, readGenerationSession, saveGenerationSession, type GenerationResult, type GenerationSession, type QueryPhase } from "@/lib/generation-session";
import type { ToolKind } from "@/lib/makeup-draft";

type QueryState = { phase: QueryPhase; session: GenerationSession | null; result: GenerationResult | null; reason: string | null; storageWarning: boolean };
const initial: QueryState = { phase: "loading", session: null, result: null, reason: null, storageWarning: false };
const REQUEST_TIMEOUT = 15000;
const WAIT_LIMIT = 10 * 60 * 1000;
export function useGenerationStatus(tool: ToolKind, path: string) {
  const [state, setState] = useState<QueryState>(initial);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const session = readGenerationSession(tool, path);
        setState({ ...initial, phase: session ? "querying" : "idle", session });
      } catch { setState({ ...initial, phase: "idle", storageWarning: true }); }
    });
    return () => { cancelled = true; };
  }, [tool, path]);

  const session = state.session;
  const active = state.phase === "querying";
  useEffect(() => {
    if (!session || !active) return;
    let stopped = false;
    let errors = 0;
    let limited = 0;
    let timer: ReturnType<typeof setTimeout>;
    let requestTimer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    const finish = (phase: QueryPhase, result: GenerationResult | null = null, reason: string | null = null) => {
      if (stopped) return;
      stopped = true;
      clearTimeout(timer); clearTimeout(deadline); clearTimeout(requestTimer); controller?.abort();
      let storageWarning = false;
      if (phase === "not_found" || phase === "failed" || phase === "refunded") {
        try { clearGenerationSession(session); } catch { storageWarning = true; }
      }
      setState((current) => ({ ...current, phase, result, reason, storageWarning: current.storageWarning || storageWarning }));
    };
    const deadline = setTimeout(() => finish("paused", null, "wait_limit"), WAIT_LIMIT);
    const query = async () => {
      if (stopped) return;
      controller = new AbortController();
      const requestController = controller;
      let delay = 2000;
      try {
        const response = await Promise.race([
          (async () => {
            const http = await fetch(`/api/generations/${encodeURIComponent(session.generationId)}`, { method: "GET", signal: requestController.signal, cache: "no-store" });
            const payload: unknown = http.ok ? await http.json() : null;
            return { http, payload };
          })(),
          new Promise<never>((_resolve, reject) => { requestTimer = setTimeout(() => { requestController.abort(); reject(new Error("query_timeout")); }, REQUEST_TIMEOUT); })
        ]);
        if (stopped) return;
        const { http, payload } = response;
        if (http.status === 401) { finish("auth"); return; }
        if (http.status === 404) { finish("not_found"); return; }
        if (http.status === 429) {
          limited++;
          const raw = http.headers?.get("Retry-After");
          const retryMs = raw && /^\d+(\.\d+)?$/.test(raw) ? Number(raw) * 1000 : raw ? Date.parse(raw) - Date.now() : NaN;
          delay = Number.isFinite(retryMs) && retryMs > 0 ? Math.max(1000, retryMs) : Math.min(60000, 5000 * 2 ** Math.min(limited - 1, 4));
        } else {
          if (!http.ok) throw new Error("query_failed");
          const result = payload as GenerationResult;
          if (!result || result.id !== session.generationId || !["queued", "moderating", "running", "done", "failed", "refunded"].includes(result.status)) throw new Error("invalid_status");
          errors = 0; limited = 0;
          if (result.status === "done" || result.status === "failed" || result.status === "refunded") { finish(result.status, { ...result, fitNotes: Array.isArray(result.fitNotes) ? result.fitNotes : [] }); return; }
        }
      } catch {
        if (stopped) return;
        errors++;
        if (errors >= 3) { finish("paused", null, "query_errors"); return; }
      } finally { clearTimeout(requestTimer); }
      if (!stopped) timer = setTimeout(() => { void query(); }, delay);
    };
    // 首次也逐次调度，使 StrictMode 的探测挂载能在请求开始前取消。
    timer = setTimeout(() => { void query(); }, 2000);
    return () => { stopped = true; clearTimeout(timer); clearTimeout(deadline); clearTimeout(requestTimer); controller?.abort(); };
  }, [session, active, attempt]);

  const start = useCallback((next: GenerationSession) => {
    try { saveGenerationSession(next); setState({ ...initial, phase: "querying", session: next }); }
    catch { setState({ ...initial, phase: "paused", session: next, reason: "storage", storageWarning: true }); }
    setAttempt((value) => value + 1);
  }, []);
  const resume = useCallback(() => {
    if (!state.session) return;
    try {
      saveGenerationSession(state.session);
      setState((current) => ({ ...current, phase: "querying", result: null, reason: null, storageWarning: false }));
      setAttempt((value) => value + 1);
    } catch { setState((current) => ({ ...current, phase: "paused", reason: "storage", storageWarning: true })); }
  }, [state.session]);
  const reset = useCallback(() => {
    if (state.session) {
      try { clearGenerationSession(state.session); }
      catch { setState((current) => ({ ...current, storageWarning: true })); return false; }
    }
    setState({ ...initial, phase: "idle" }); return true;
  }, [state.session]);
  return { ...state, start, resume, reset };
}
