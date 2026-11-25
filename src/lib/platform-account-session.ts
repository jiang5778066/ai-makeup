"use client";
import { useSyncExternalStore } from "react";
import { getSupabaseBrowserClient } from "./supabase/client";
import { clearAccountMediaRecovery, verifyMediaRecoveryOwner } from "./media-recovery-storage";
export type PlatformAccount = { status: "loading" | "signed_in" | "signed_out" | "error"; user: { id: string; email: string | null } | null; epoch: number; identityEpoch?: number };
const initial: PlatformAccount = { status: "loading", user: null, epoch: 0 };
let state = initial;
let controller: AbortController | undefined;
let verifiedIdentity: { userId: string; epoch: number } | undefined;
type LogoutOperation = { controller: AbortController; userId?: string; needsRefresh: boolean };
let activeLogout: LogoutOperation | undefined;
const listeners = new Set<() => void>();
let stop: (() => void) | undefined;
const publish = (next: PlatformAccount) => { state = next; listeners.forEach(listener => listener()); };
const commitSignedOut = (epoch: number) => {
  controller?.abort();
  verifiedIdentity = undefined;
  clearAccountMediaRecovery();
  publish({ status: "signed_out", user: null, epoch });
};
export const getPlatformAccountEpoch = () => state.epoch;
const startAccountVerification = () => {
  controller?.abort();
  publish({ status: "loading", user: null, epoch: state.epoch + 1 });
};
export const expirePlatformAccount = (expectedEpoch = state.epoch) => {
  if (state.epoch !== expectedEpoch) return;
  if (activeLogout) {
    activeLogout.needsRefresh = true;
    return;
  }
  commitSignedOut(expectedEpoch + 1);
};
export const refreshPlatformAccount = async () => {
  const logout = activeLogout;
  if (logout) {
    logout.needsRefresh = true;
    controller?.abort();
  } else {
    startAccountVerification();
  }
  const epoch = state.epoch;
  const request = new AbortController(); controller = request;
  const timer = setTimeout(() => request.abort(), 15000);
  try {
    const response = await fetch("/api/account/session", { cache: "no-store", signal: request.signal });
    const body = response.ok ? await response.json() : null;
    if (state.epoch !== epoch || request.signal.aborted) return;
    const userId: unknown = body?.user?.id;
    if (logout) {
      // 仅已核验的身份更替能让进行中的主动退出失去归属。
      if (activeLogout !== logout || typeof userId !== "string" || userId === logout.userId) return;
      activeLogout = undefined;
      logout.controller.abort();
    }
    if (response.status === 401) commitSignedOut(epoch);
    else if (typeof userId === "string") {
      const signedInEpoch = logout ? epoch + 1 : epoch;
      // 普通核验保留同一身份的起始 epoch，确认换号或退出后重新分配。
      if (verifiedIdentity?.userId !== userId) verifiedIdentity = { userId, epoch: signedInEpoch };
      verifyMediaRecoveryOwner(userId);
      publish({ status: "signed_in", user: { id: userId, email: typeof body.user.email === "string" ? body.user.email : null }, epoch: signedInEpoch, identityEpoch: verifiedIdentity.epoch });
    } else publish({ status: "error", user: null, epoch });
  } catch { if (!logout && state.epoch === epoch) publish({ status: "error", user: null, epoch }); }
  finally { clearTimeout(timer); }
};
const refreshInBackground = () => {
  if (activeLogout) {
    activeLogout.needsRefresh = true;
    return;
  }
  void refreshPlatformAccount();
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    const timer = setTimeout(refreshInBackground, 0);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("platform-account") : null;
    // 跨标签通知可能晚到。接收端以自己的服务端核验结果确认会话状态。
    if (channel) channel.onmessage = refreshInBackground;
    const visible = () => { if (document.visibilityState === "visible") refreshInBackground(); };
    document.addEventListener("visibilitychange", visible);
    let unsubscribe: (() => void) | undefined;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { data } = getSupabaseBrowserClient().auth.onAuthStateChange((event, session) => {
          if (event === "INITIAL_SESSION") return;
          if (activeLogout) {
            activeLogout.needsRefresh = true;
            const logout = activeLogout;
            if (session?.user?.id && session.user.id !== logout.userId) {
              setTimeout(() => { if (activeLogout === logout) void refreshPlatformAccount(); }, 0);
            }
            return;
          }
          startAccountVerification();
          const epoch = state.epoch;
          // SDK 回调结束后再请求会话，较新的核验或退出可以取代该请求。
          setTimeout(() => { if (state.epoch === epoch) refreshInBackground(); }, 0);
        });
        unsubscribe = () => data.subscription.unsubscribe();
      } catch { /* 服务端接口验证当前身份。 */ }
    }
    stop = () => {
      clearTimeout(timer);
      controller?.abort();
      activeLogout?.controller.abort();
      activeLogout = undefined;
      verifiedIdentity = undefined;
      unsubscribe?.();
      channel?.close();
      document.removeEventListener("visibilitychange", visible);
      state = { ...initial, epoch: state.epoch + 1 };
    };
  }
  return () => { listeners.delete(listener); if (!listeners.size) { stop?.(); stop = undefined; } };
};
export const usePlatformAccount = () => useSyncExternalStore(subscribe, () => state, () => initial);
export type PlatformLogoutResult = { status: "signed_out"; epoch: number } | { status: "stale" | "cancelled" };
export const logoutPlatformAccount = async (callerSignal?: AbortSignal, expectedAccount?: PlatformAccount): Promise<PlatformLogoutResult> => {
  if (callerSignal?.aborted) return { status: "cancelled" };
  if (expectedAccount && (state !== expectedAccount || state.status !== "signed_in" || !state.user)) return { status: "stale" };
  const userId = verifiedIdentity?.userId;
  if (activeLogout || !userId) return { status: "stale" };
  const operation: LogoutOperation = { controller: new AbortController(), userId, needsRefresh: false };
  activeLogout = operation;
  const signal = operation.controller.signal;
  const cancel = () => operation.controller.abort();
  callerSignal?.addEventListener("abort", cancel, { once: true });
  startAccountVerification();
  const epoch = state.epoch;
  let abort: (() => void) | undefined;
  try {
    signal.throwIfAborted();
    // 取消必须结束调用，即使隔离替身或传输仍可能晚到；服务端结果仍待真实会话核验。
    const cancelled = new Promise<never>((_resolve, reject) => {
      abort = () => reject(new Error("logout_cancelled"));
      signal.addEventListener("abort", abort, { once: true });
    });
    const response = await Promise.race([fetch("/api/account/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "X-Expected-Account": userId },
      signal,
    }), cancelled]);
    if (activeLogout !== operation) return { status: "stale" };
    signal.throwIfAborted();
    if (response.status === 409) {
      // 退出请求的会话已更替。由下一次核验处理媒体记录归属并更新界面。
      verifiedIdentity = undefined;
      operation.needsRefresh = true;
      return { status: "stale" };
    }
    if (!response.ok && response.status !== 401) throw new Error("logout_failed");
    const committedEpoch = epoch + 1;
    operation.needsRefresh = false;
    commitSignedOut(committedEpoch);
    if (state.epoch !== committedEpoch) return { status: "stale" };
    if (response.ok && typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("platform-account");
      // 旧版监听器也会把对象消息送入通用的会话核验分支。
      channel.postMessage({ type: "signed_out" });
      channel.close();
    }
    return { status: "signed_out", epoch: committedEpoch };
  } catch (error) {
    if (activeLogout !== operation) return { status: "stale" };
    if (expectedAccount) operation.needsRefresh = true;
    publish({ status: "error", user: null, epoch });
    if (signal.aborted) return { status: "cancelled" };
    throw error;
  } finally {
    callerSignal?.removeEventListener("abort", cancel);
    if (abort) signal.removeEventListener("abort", abort);
    if (activeLogout === operation) {
      activeLogout = undefined;
      if (operation.needsRefresh && listeners.size) {
        setTimeout(() => { if (state.epoch === epoch) refreshInBackground(); }, 0);
      }
    }
  }
};
