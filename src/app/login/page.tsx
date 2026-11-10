"use client";

import { WandSparkles } from "lucide-react";
import Link from "next/link";
import { PlatformBrand } from "@/components/platform-brand";
import styles from "@/components/platform-account-login.module.css";
import { useState, useSyncExternalStore } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { safeReturnPath, subscribeToLocation } from "@/lib/auth-return";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const next = useSyncExternalStore(subscribeToLocation, () => safeReturnPath(new URLSearchParams(window.location.search).get("next")), () => "/dashboard");
  const zh = next === "/zh-CN" || next.startsWith("/zh-CN/");
  const copy = (en: string, cn: string) => zh ? cn : en;
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !configured || status === "sending") return;

    setStatus("sending");
    setErrorMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const redirect = new URL("/auth/callback", siteUrl);
      redirect.searchParams.set("next", safeReturnPath(new URLSearchParams(window.location.search).get("next")));
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect.toString() } });
      if (error) throw error;
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMessage(copy("Could not send the sign-in link. Sign-in may be unavailable. Please try again.", "登录服务暂不可用或链接发送失败，请稍后重试。"));
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <PlatformBrand locale={zh ? "zh-CN" : "en"}/>
        <h1 style={{ fontSize: "2.4rem", lineHeight: 1.05, marginTop: 18 }}>{copy("Log in to AI Makeup Studio", "登录 AI 妆容工作室")}</h1>
        <p className="lead" style={{ fontSize: "1rem" }}>
          {copy("Sign in to generate with your account credits. Local live preview is free. Photo drafts last 30 minutes in this browser on this site only.", "登录后可使用账户额度生成；本地实时预览免费。照片草稿仅在同一浏览器、同一站点保留 30 分钟，跨设备需重新选图。")}
        </p>

        {!configured && <p role="alert">{copy("Email sign-in is not configured. Please try again later.", "邮箱登录服务尚未配置，暂时无法使用。")}</p>}
        {status === "sent" ? (
          <div className="result-card" role="status">
            <h3>{copy("Check your inbox", "请查看邮箱")}</h3>
            <p>
              {copy("We sent a sign-in link to", "登录链接已发送至")} <strong>{email}</strong>。{copy("Open it in this browser to return to your tool. You will review consent and start generation yourself.", "请在此浏览器打开链接返回工具；恢复后需重新确认同意并手动生成。")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              {copy("Email", "邮箱")}
              <input
                className="input"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                disabled={status === "sending" || !configured}
              />
            </label>
            <button className="button" type="submit" style={{ width: "100%" }} disabled={status === "sending" || !configured}>
              <WandSparkles size={17} aria-hidden="true" />
              {status === "sending" ? copy("Sending magic link...", "正在发送登录链接...") : copy("Continue with email", "使用邮箱继续")}
            </button>
            {status === "error" && errorMessage ? (
              <p role="alert" style={{ color: "var(--cherry)", marginTop: 12, fontSize: "0.95rem" }}>{errorMessage}</p>
            ) : null}
          </form>
        )}

        <Link className="ghost-button" href={next === "/dashboard" ? "/" : next} style={{ width: "100%", marginTop: 12 }}>
          {copy("Back to studio", "返回工作室")}
        </Link>
      </section>
    </main>
  );
}
