"use client";

import { useCallback, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { platformNavigationEvent } from "./platform-navigation-link";

// Next 负责 pathname/query 导航，原生事件负责锚点与历史；保留 URL 的重复参数。
export function usePlatformUrl(serverPath: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const subscribe = useCallback((listener: () => void) => {
    // 保留 Next 查询对象的身份变化：仅改锚点也会产生一次导航提交。
    void pathname; void searchParams;
    window.addEventListener("hashchange", listener);
    window.addEventListener(platformNavigationEvent, listener);
    window.addEventListener("popstate", listener);
    // 订阅发生在提交之后，此时 Next 才可能完成 history 更新。
    listener();
    return () => {
      window.removeEventListener("hashchange", listener);
      window.removeEventListener(platformNavigationEvent, listener);
      window.removeEventListener("popstate", listener);
    };
  }, [pathname, searchParams]);
  const read = useCallback(() => `${window.location.pathname}${window.location.search}${window.location.hash}`, []);
  return useSyncExternalStore(subscribe, read, () => serverPath);
}
