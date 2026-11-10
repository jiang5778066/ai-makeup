"use client";
import { useEffect, useRef, useState } from "react";
import { PlatformNavigationLink as Link } from "./platform-navigation-link";
import { loginHref } from "@/lib/auth-return";
import { localizePath, type Locale } from "@/lib/i18n";
import { getPlatformAccountEpoch, logoutPlatformAccount, usePlatformAccount } from "@/lib/platform-account-session";
export function PlatformAccountEntry({ locale, returnPath }: { locale: Locale; returnPath: string }) {
  const account = usePlatformAccount();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const operation = useRef<{ controller: AbortController; epoch: number } | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; operation.current?.controller.abort(); }; }, []);
  useEffect(() => {
    const owner = operation.current;
    if (owner && account.epoch !== owner.epoch && !(account.status === "signed_out" && account.epoch === owner.epoch + 1)) {
      owner.controller.abort(); operation.current = null; setBusy(false); setError(false);
    }
  }, [account.epoch, account.status]);
  const logout = async () => {
    if (operation.current) return;
    setBusy(true); setError(false);
    const controller = new AbortController();
    const pending = logoutPlatformAccount(controller.signal);
    const owner = { controller, epoch: getPlatformAccountEpoch() }; operation.current = owner;
    const current = () => mounted.current && operation.current === owner;
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const result = await pending;
      if (!current()) return;
      if (result.status === "signed_out" && !controller.signal.aborted && getPlatformAccountEpoch() === result.epoch) window.location.assign(localizePath("/home", locale));
      else if (result.status === "cancelled" && getPlatformAccountEpoch() === owner.epoch) setError(true);
    }
    catch { if (current() && getPlatformAccountEpoch() === owner.epoch) setError(true); }
    finally { clearTimeout(timer); if (current()) { operation.current = null; setBusy(false); } }
  };
  const zh = locale === "zh-CN";
  if (busy) return <span role="status">{zh ? "正在退出…" : "Signing out…"}</span>;
  return <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
    {account.status === "signed_in" ? <><Link className="platform-login" href={localizePath("/my-creations", locale)}>{zh ? "我的作品" : "My Creations"}</Link><button type="button" className="platform-language-trigger" onClick={() => { void logout(); }}>{zh ? "退出" : "Sign out"}</button></> : <Link className="platform-login" href={loginHref(returnPath)}>{zh ? "登录即可获得3积分" : "Login to get 3 credits"}</Link>}
    {error && <span role="alert">{zh ? "退出失败，请重试。" : "Sign out failed. Please retry."}<button type="button" onClick={() => { void logout(); }}>{zh ? "重试退出" : "Retry sign out"}</button></span>}
  </div>;
}
