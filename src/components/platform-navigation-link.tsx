"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useEffect, useLayoutEffect, useRef, useTransition } from "react";
import type { ComponentProps, ReactNode } from "react";
import { dispatchPlatformNavigation, isCurrentPlatformNavigation, subscribePlatformNavigation } from "./platform-navigation-lifecycle";
import type { NavigationRequest } from "./platform-navigation-lifecycle";

export const platformNavigationEvent = "platform:navigation";
type Destination = { path: string; route: string; fragment: string; scroll: boolean };
type PendingDestination = Destination & { owner: symbol; request: NavigationRequest | null };
type Navigate = (href: string, replace: boolean, scroll: boolean) => boolean;
const NavigationContext = createContext<Navigate | null>(null);

function focusFragment(fragment: string) {
  let id = fragment.slice(1);
  try { id = decodeURIComponent(id); } catch { /* 非法百分号保留原片段，不改写地址。 */ }
  if (!id || id === "top") { window.scrollTo(0, 0); return; }
  const target = document.getElementById(id) ?? document.getElementsByName(id)[0];
  if (!(target instanceof HTMLElement)) return;
  target.scrollIntoView();
  const temporaryFocus = !target.hasAttribute("tabindex") && target.tabIndex < 0;
  if (temporaryFocus) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  // 保留 -1 让当前锚点继续持有焦点，不加入 Tab 顺序。
}

function RouteCommit({ commit }: { commit: () => void }) {
  // 仅在 Next 完成路由提交后消费目标，不观察或改写框架内部缓存。
  const pathname = usePathname(); useSearchParams();
  useLayoutEffect(() => {
    // 只同步已提交且仍为当前URL的文档语言；不在请求开始或旧页面清理时回写。
    if (!pathname || pathname !== window.location.pathname) return;
    const locale = pathname === "/zh/ai-makeup" || pathname === "/zh-CN" || pathname.startsWith("/zh-CN/") ? "zh-CN" : "en";
    if (document.documentElement.lang !== locale) document.documentElement.lang = locale;
  });
  useLayoutEffect(() => { commit(); });
  return null;
}

export function PlatformNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pending = useRef<PendingDestination | null>(null);
  const complete = useCallback((destination: Destination, replace: boolean) => {
    // 使用 Next 支持的原生 history API，同步其公开 URL 状态；不复制内部标志。
    // 路由历史记录已存在时仅 replace，纯锚点导航才 push。
    window.history[replace ? "replaceState" : "pushState"](null, "", destination.path);
    window.dispatchEvent(new Event(platformNavigationEvent));
    if (destination.scroll) focusFragment(destination.fragment);
  }, []);
  const commit = useCallback(() => {
    const destination = pending.current;
    if (!destination) return;
    if (!destination.request || !isCurrentPlatformNavigation(destination.request)) {
      pending.current = null;
      return;
    }
    // transition 只等待渲染结束；请求归属由公开开始事件的身份决定。
    if (isPending) return;
    pending.current = null;
    const route = `${window.location.pathname}${window.location.search}`;
    if (route !== destination.route) return;
    // 共享请求只交给 Next 无 hash URL；现有片段属于更新的原生导航。
    if (window.location.hash) return;
    complete(destination, true);
  }, [complete, isPending]);
  useLayoutEffect(() => subscribePlatformNavigation(request => {
    if (pending.current && pending.current.owner !== request.owner) pending.current = null;
  }), []);
  useEffect(() => {
    const cancel = () => { pending.current = null; };
    window.addEventListener("popstate", cancel);
    window.addEventListener("hashchange", cancel);
    return () => { cancel(); window.removeEventListener("popstate", cancel); window.removeEventListener("hashchange", cancel); };
  }, []);
  const navigate = useCallback<Navigate>((href, replace, scroll) => {
    pending.current = null;
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    const hashIndex = url.href.indexOf("#");
    if (hashIndex < 0) return false;
    const route = `${url.pathname}${url.search}`;
    const fragment = url.href.slice(hashIndex);
    const destination = { route, fragment, path: `${route}${fragment}`, scroll };
    if (`${window.location.pathname}${window.location.search}` === route) {
      complete(destination, replace || window.location.href === url.href);
    } else {
      const owner = Symbol("platform-navigation");
      const nextDestination: PendingDestination = { ...destination, owner, request: null };
      pending.current = nextDestination;
      // Next 16.2 的路由缓存可能保存请求 URL 的 hash；请求不含 hash 可避免污染。
      nextDestination.request = dispatchPlatformNavigation(owner, () => {
        startTransition(() => router[replace ? "replace" : "push"](route, { scroll: false }));
      });
      // 未观察到本次同步开始事件时，不凭 route 相等授予补 fragment 的权限。
      if (!nextDestination.request) pending.current = null;
    }
    return true;
  }, [complete, router]);
  return <NavigationContext.Provider value={navigate}>{children}<Suspense fallback={null}><RouteCommit commit={commit}/></Suspense></NavigationContext.Provider>;
}

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };
export function PlatformNavigationLink({ href, replace = false, scroll = true, onNavigate, ...props }: Props) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} href={href} replace={replace} scroll={scroll} onNavigate={(event) => {
    let prevented = false;
    onNavigate?.({ preventDefault: () => { prevented = true; event.preventDefault(); } });
    if (!prevented && navigate?.(href, replace, scroll)) event.preventDefault();
  }}/>;
}
