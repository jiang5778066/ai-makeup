type NavigationRequest = { sequence: number; owner: symbol | null };
type DispatchScope = { owner: symbol; request: NavigationRequest | null };

let sequence = 0;
let currentRequest: NavigationRequest | null = null;
let dispatchScope: DispatchScope | null = null;
const listeners = new Set<(request: NavigationRequest) => void>();

// 由 Next 的公开 instrumentation-client hook 同步通知；不存储目标 URL。
export function observePlatformNavigationStart() {
  const request = { sequence: ++sequence, owner: dispatchScope?.owner ?? null };
  currentRequest = request;
  if (dispatchScope) dispatchScope.request = request;
  for (const listener of listeners) listener(request);
}

export function dispatchPlatformNavigation(owner: symbol, dispatch: () => void) {
  const previousScope = dispatchScope;
  const scope: DispatchScope = { owner, request: null };
  dispatchScope = scope;
  try { dispatch(); } finally { dispatchScope = previousScope; }
  return scope.request;
}

export function isCurrentPlatformNavigation(request: NavigationRequest) {
  return currentRequest === request;
}

export function subscribePlatformNavigation(listener: (request: NavigationRequest) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export type { NavigationRequest };
