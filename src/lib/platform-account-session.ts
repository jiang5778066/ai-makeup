"use client";
import { useSyncExternalStore } from "react";
import { getSupabaseBrowserClient } from "./supabase/client";
export type PlatformAccount = { status: "loading" | "signed_in" | "signed_out" | "error"; user: { id: string; email: string | null } | null; epoch: number };
const initial: PlatformAccount = { status: "loading", user: null, epoch: 0 };
let state = initial;
let controller: AbortController | undefined;
const listeners = new Set<() => void>();
let stop: (() => void) | undefined;
const publish = (next: PlatformAccount) => { state = next; listeners.forEach(listener => listener()); };
export const getPlatformAccountEpoch = () => state.epoch;
export const invalidatePlatformAccount = () => {
  controller?.abort();
  publish({ status: "loading", user: null, epoch: state.epoch + 1 });
};
export const expirePlatformAccount = (expectedEpoch = state.epoch) => {
  if (state.epoch !== expectedEpoch) return;
  invalidatePlatformAccount(); publish({ status: "signed_out", user: null, epoch: state.epoch });
};
export const refreshPlatformAccount = async () => {
  invalidatePlatformAccount();
  const epoch = state.epoch;
  const request = new AbortController(); controller = request;
  const timer = setTimeout(() => request.abort(), 15000);
  try {
    const response = await fetch("/api/account/session", { cache: "no-store", signal: request.signal });
    const body = response.ok ? await response.json() : null;
    if (state.epoch !== epoch || request.signal.aborted) return;
    if (response.status === 401) publish({ status: "signed_out", user: null, epoch });
    else if (response.ok && typeof body?.user?.id === "string") publish({ status: "signed_in", user: { id: body.user.id, email: typeof body.user.email === "string" ? body.user.email : null }, epoch });
    else publish({ status: "error", user: null, epoch });
  } catch { if (state.epoch === epoch) publish({ status: "error", user: null, epoch }); }
  finally { clearTimeout(timer); }
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    const timer = setTimeout(() => { void refreshPlatformAccount(); }, 0);
    const change = () => { void refreshPlatformAccount(); };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("platform-account") : null;
    if (channel) channel.onmessage = change;
    const visible = () => { if (document.visibilityState === "visible") change(); };
    document.addEventListener("visibilitychange", visible);
    let unsubscribe: (() => void) | undefined;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try { const { data } = getSupabaseBrowserClient().auth.onAuthStateChange(event => { if (event !== "INITIAL_SESSION") { invalidatePlatformAccount(); setTimeout(change, 0); } }); unsubscribe = () => data.subscription.unsubscribe(); } catch { /* API验证仍是身份唯一依据。 */ }
    }
    stop = () => { clearTimeout(timer); controller?.abort(); unsubscribe?.(); channel?.close(); document.removeEventListener("visibilitychange", visible); state = { ...initial, epoch: state.epoch + 1 }; };
  }
  return () => { listeners.delete(listener); if (!listeners.size) { stop?.(); stop = undefined; } };
};
export const usePlatformAccount = () => useSyncExternalStore(subscribe, () => state, () => initial);
export type PlatformLogoutResult = { status: "signed_out"; epoch: number } | { status: "stale" | "cancelled" };
export const logoutPlatformAccount = async (signal?: AbortSignal): Promise<PlatformLogoutResult> => {
  if (signal?.aborted) return { status: "cancelled" };
  invalidatePlatformAccount();
  const epoch = state.epoch;
  let abort: (() => void) | undefined;
  try {
    // 取消必须结束调用，即使隔离替身或传输仍可能晚到；服务端结果仍待真实会话核验。
    const cancelled = new Promise<never>((_resolve, reject) => {
      abort = () => reject(new Error("logout_cancelled"));
      signal?.addEventListener("abort", abort, { once: true });
    });
    const response = await Promise.race([fetch("/api/account/logout", { method: "POST", credentials: "same-origin", cache: "no-store", signal }), cancelled]);
    if (state.epoch !== epoch) return { status: "stale" };
    if (signal?.aborted) { publish({ status: "error", user: null, epoch }); return { status: "cancelled" }; }
    if (!response.ok) throw new Error("logout_failed");
    const committedEpoch = epoch + 1;
    publish({ status: "signed_out", user: null, epoch: committedEpoch });
    if (state.epoch !== committedEpoch) return { status: "stale" };
    if (typeof BroadcastChannel !== "undefined") { const channel = new BroadcastChannel("platform-account"); channel.postMessage("signed_out"); channel.close(); }
    return { status: "signed_out", epoch: committedEpoch };
  } catch (error) {
    if (state.epoch !== epoch) return { status: "stale" };
    publish({ status: "error", user: null, epoch });
    if (signal?.aborted) return { status: "cancelled" };
    throw error;
  } finally { if (abort) signal?.removeEventListener("abort", abort); }
};
