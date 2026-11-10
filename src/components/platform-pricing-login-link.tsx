"use client";
import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { loginHref, subscribeToLocation } from "@/lib/auth-return";
const currentPath = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

export function PlatformPricingLoginLink({ nextPath, children, className, style }: {
  nextPath: string; children: ReactNode; className?: string; style?: CSSProperties;
}) {
  const next = useSyncExternalStore(subscribeToLocation, currentPath, () => nextPath);
  return <a href={loginHref(next)} className={className} style={style}>{children}</a>;
}
