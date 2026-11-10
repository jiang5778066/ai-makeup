"use client";

import { CreditCard, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { billingLoginUrl, trustedCheckoutUrl } from "@/lib/platform-billing-security";

export function CheckoutButtons({ planId, cta, locale = "en", available, navigate }: Readonly<{
  planId: string | null; cta: string; locale?: string; available?: boolean; navigate?: (url: string) => void;
}>) {
  const [discovered, setDiscovered] = useState(false);
  const [active, setActive] = useState<AbortController | null>(null);
  const [recover, setRecover] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const mounted = useRef(false), locked = useRef(false);
  const pending = useRef<AbortController | null>(null);
  const enabled = available ?? discovered;
  const busy = active !== null && !active.signal.aborted;
  const zh = locale === "zh-CN";
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    if (available === undefined) void fetch("/api/billing/status", { cache: "no-store", signal: controller.signal })
      .then(r => r.json()).then(data => { if (!controller.signal.aborted) setDiscovered(data.available === true); }).catch(() => {});
    return () => {
      mounted.current = false; controller.abort(); pending.current?.abort(); pending.current = null; locked.current = false;
    };
  }, [available, planId, locale]);
  if (!planId) return null;
  const go = navigate ?? ((url: string) => window.location.assign(url));
  const unknownMessage = zh ? "本次付款结果待核对。刷新只查询已有尝试，不会另开付款；长期未决需要人工核对。" : "This payment attempt needs checking. Refresh only checks the existing attempt. An unresolved attempt requires manual review.";
  async function start() {
    if (locked.current || !enabled) return;
    locked.current = true;
    const controller = new AbortController(); pending.current = controller; setActive(controller); setMessage(null);
    const current = () => mounted.current && pending.current === controller && !controller.signal.aborted;
    const timer = setTimeout(() => controller.abort(), 15000);
    let leaving = false;
    try {
      const response = await fetch(recover ? "/api/billing/status?attempt_id=current" : "/api/billing/checkout", recover ?
        { cache: "no-store", signal: controller.signal } : { method: "POST", signal: controller.signal,
          headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, provider: "creem", ...(zh ? { locale } : {}) }) });
      if (!current()) return;
      if (response.status === 401) {
        go(billingLoginUrl(`${window.location.pathname}${window.location.search}${window.location.hash}`, locale)); leaving = true; return;
      }
      const payload = await response.json();
      if (!current()) return;
      if (!response.ok) {
        if (["checkout_disabled", "checkout_unconfigured", "billing_migration_required"].includes(payload?.code)) {
          setMessage(zh ? "购买配置尚未就绪，请稍后再试。" : "Purchases are not configured yet. Please try later."); return;
        }
        throw new Error("checkout_uncertain");
      }
      const attempt = payload?.attempt;
      if (attempt?.status === "completed") {
        setRecover(false); setMessage(zh ? "本次付款已由服务端确认。需要更多积分时可主动再次购买。" : "The server confirmed this payment. You can choose to make a new purchase."); return;
      }
      if (attempt?.status === "unknown" || attempt?.status === "submitting") {
        setRecover(true); setMessage(unknownMessage); return;
      }
      if (recover && attempt === null) {
        setRecover(false); setMessage(zh ? "未找到付款尝试，可重新发起购买。" : "No payment attempt was found. You can start a purchase."); return;
      }
      const url = attempt?.checkoutUrl ?? payload?.checkoutUrl;
      if (!trustedCheckoutUrl(url)) throw new Error("checkout_uncertain");
      go(url); leaving = true;
    } catch {
      if (mounted.current && pending.current === controller) { setRecover(true); setMessage(unknownMessage); }
    } finally {
      clearTimeout(timer);
      if (!leaving && pending.current === controller) { locked.current = false; pending.current = null; if (mounted.current) setActive(null); }
    }
  }
  return <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
    <button className="button" type="button" onClick={() => void start()} disabled={busy || !enabled}>
      {busy ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <CreditCard size={16} aria-hidden="true" />}
      {!enabled ? (zh ? "购买暂不可用" : "Purchases unavailable") : busy ? (zh ? "正在核对…" : "Checking…") : recover ? (zh ? "刷新付款状态" : "Check payment status") : cta}
    </button>
    {!enabled && <p>{zh ? "支付配置或收费开关尚未就绪。" : "Payment configuration or checkout is not ready."}</p>}
    {message && <p className="tool-error" role="alert">{message}</p>}
  </div>;
}
