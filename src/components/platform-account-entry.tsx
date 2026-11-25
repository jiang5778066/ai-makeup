"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { PlatformNavigationLink as Link } from "./platform-navigation-link";
import { loginHref } from "@/lib/auth-return";
import { localizePath, type Locale } from "@/lib/i18n";
import { getPlatformAccountEpoch, logoutPlatformAccount, usePlatformAccount } from "@/lib/platform-account-session";
export function PlatformAccountEntry({ locale, returnPath }: { locale: Locale; returnPath: string }) {
  const account = usePlatformAccount();
  const [busy, setBusy] = useState(false);
  const [failedIdentityEpoch, setFailedIdentityEpoch] = useState<number>();
  const operation = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; operation.current?.abort(); };
  }, []);
  const logout = async () => {
    if (!mounted.current || operation.current || account.status !== "signed_in" || account.identityEpoch === undefined) return;
    const { identityEpoch } = account;
    setBusy(true);
    const controller = new AbortController();
    operation.current = controller;
    const current = () => mounted.current && operation.current === controller;
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const result = await logoutPlatformAccount(controller.signal, account);
      if (!current()) return;
      if (result.status === "signed_out" && !controller.signal.aborted && getPlatformAccountEpoch() === result.epoch) {
        window.location.assign(localizePath("/home", locale));
      } else if (result.status === "cancelled") {
        setFailedIdentityEpoch(identityEpoch);
      }
    }
    catch { if (current()) setFailedIdentityEpoch(identityEpoch); }
    finally { clearTimeout(timer); if (current()) { operation.current = null; setBusy(false); } }
  };
  const zh = locale === "zh-CN";
  const canRetry = account.status === "signed_in" && failedIdentityEpoch !== undefined && account.identityEpoch === failedIdentityEpoch;
  if (busy) return <span role="status">{zh ? "正在退出…" : "Signing out…"}</span>;
  return <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
    {account.status === "signed_in" ? <><Link className="platform-login" href={localizePath("/my-creations", locale)}>{zh ? "我的作品" : "My Creations"}</Link><button type="button" className="platform-language-trigger" onClick={() => { void logout(); }}>{zh ? "退出" : "Sign out"}</button></> : <Link className="platform-login" href={loginHref(returnPath)}>{zh ? "登录" : "Sign in"}</Link>}
    {canRetry && <span role="alert">{zh ? "退出失败，请重试。" : "Sign out failed. Please retry."}<button type="button" onClick={() => { void logout(); }}>{zh ? "重试退出" : "Retry sign out"}</button></span>}
  </div>;
}
