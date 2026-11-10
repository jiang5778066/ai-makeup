"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { PlatformPricingLoginLink } from "./platform-pricing-login-link";

type BillingState = { userId: string; status: string; balance: number; credits: number | null };
export function PlatformPricingFeedback(props: { locale: Locale; userId: string | null; orderId: string | null }) {
  return <FeedbackSession key={`${props.userId}:${props.orderId}`} {...props}/>;
}
function FeedbackSession({ locale, userId, orderId }: { locale: Locale; userId: string | null; orderId: string | null }) {
  const zh = locale === "zh-CN";
  const [data, setData] = useState<BillingState | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const alive = useRef(false), lock = useRef(false);
  const pending = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    if (!userId || lock.current) return;
    lock.current = true; setBusy(true); setError(false);
    const controller = new AbortController(); pending.current = controller;
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`/api/billing/status${orderId ? `?order_id=${encodeURIComponent(orderId)}` : ""}`, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("billing_unavailable");
      const next: BillingState = await response.json();
      if (!alive.current || controller.signal.aborted) return;
      if (next.userId !== userId || !Number.isSafeInteger(next.balance) || next.balance < 0) { setData(null); throw new Error("identity_changed"); }
      setData(next);
    } catch { if (alive.current) { setData(null); setError(true); } }
    finally { clearTimeout(timer); lock.current = false; if (alive.current) setBusy(false); }
  }, [orderId, userId]);
  useEffect(() => {
    alive.current = true;
    const first = setTimeout(() => void refresh(), 0);
    // 每次返回会话至多三次自动只读刷新。
    const second = setTimeout(() => void refresh(), 3000);
    const third = setTimeout(() => void refresh(), 8000);
    return () => { alive.current = false; clearTimeout(first); clearTimeout(second); clearTimeout(third); pending.current?.abort(); };
  }, [refresh]);
  let message = zh ? "等待付款确认" : "Waiting for payment confirmation";
  if (orderId && data?.status === "completed") message = zh ? `本笔订单已确认，${data.credits} 积分已到账。` : `This order is confirmed. ${data.credits} credits have been added.`;
  if (data?.status === "refunded") message = zh ? "本笔订单额度已回收。" : "Credits for this order have been reversed.";
  if (data?.status === "refund_review") message = zh ? "本笔订单退款或争议待人工核对。" : "This order's refund or dispute needs review.";
  return <section aria-label={zh ? "付款状态" : "Payment status"}>
    <h2>{zh ? "付款与积分" : "Payment & credits"}</h2>
    <p role="status">{message}</p>
    <p>{zh ? "返回此页不表示付款成功。仅以服务端核验的本人订单为准；付款结果未知时请先核对已有尝试，不要另开付款。" : "Returning here does not confirm payment. Only your verified order can confirm it. If the result is unknown, check your existing attempt before making another payment."}</p>
    {data && <p>{zh ? `当前余额：${data.balance} 积分` : `Current balance: ${data.balance} credits`}</p>}
    {error && <p role="alert">{zh ? "暂时无法核对，请刷新或重新登录后重试。" : "Could not check payment. Refresh or sign in again to retry."}</p>}
    {userId ? <button type="button" onClick={() => void refresh()} disabled={busy}>{busy ? (zh ? "正在刷新…" : "Refreshing…") : (zh ? "刷新余额与订单" : "Refresh balance & order")}</button> :
      <PlatformPricingLoginLink nextPath={`${locale === "zh-CN" ? "/zh-CN" : ""}/billing/return${orderId ? `?order_id=${encodeURIComponent(orderId)}` : ""}`} >{zh ? "登录后核对余额" : "Sign in to check your balance"}</PlatformPricingLoginLink>}
  </section>;
}
