import { expect, it, vi } from "vitest";
import { onRouterTransitionStart } from "../instrumentation-client";
import { dispatchPlatformNavigation, isCurrentPlatformNavigation, subscribePlatformNavigation } from "./platform-navigation-lifecycle";
import type { NavigationRequest } from "./platform-navigation-lifecycle";

it("公开instrumentation入口与共享调用使用同一归属状态，后发原生开始使旧请求失效", () => {
  const owner = Symbol();
  const events: NavigationRequest[] = [];
  const unsubscribe = subscribePlatformNavigation(request => events.push(request));
  const request = dispatchPlatformNavigation(owner, () => {
    onRouterTransitionStart();
    expect(events.at(-1)?.owner).toBe(owner);
  });
  expect(request).toBe(events[0]);
  expect(isCurrentPlatformNavigation(request!)).toBe(true);
  onRouterTransitionStart();
  expect(events[1].owner).toBe(null);
  expect(events[1].sequence).toBeGreaterThan(events[0].sequence);
  expect(isCurrentPlatformNavigation(request!)).toBe(false);
  unsubscribe();
});

it("嵌套作用域和异常均恢复归属，未观察到同步开始时不授予请求", () => {
  const outer = Symbol(), inner = Symbol();
  const events: NavigationRequest[] = [];
  const unsubscribe = subscribePlatformNavigation(request => events.push(request));
  expect(dispatchPlatformNavigation(outer, () => undefined)).toBe(null);
  dispatchPlatformNavigation(outer, () => {
    expect(() => dispatchPlatformNavigation(inner, () => { onRouterTransitionStart(); throw Error("中止"); })).toThrow("中止");
    onRouterTransitionStart();
  });
  onRouterTransitionStart();
  expect(events.map(event => event.owner)).toEqual([inner, outer, null]);
  unsubscribe();
});

it("解除订阅后不通知已卸载调用方", () => {
  const listener = vi.fn();
  const unsubscribe = subscribePlatformNavigation(listener);
  unsubscribe();
  onRouterTransitionStart();
  expect(listener).not.toHaveBeenCalled();
});
