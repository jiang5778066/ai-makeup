const FALLBACK = "/dashboard";

export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string" || value.length > 4096 || !value.startsWith("/") || value.startsWith("//")) return FALLBACK;
  try {
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u0020\u007f]/.test(value) || /[\\\u0000-\u001f\u007f]/.test(decoded) || decoded.startsWith("//")) return FALLBACK;
    const url = new URL(value, "https://return.invalid");
    if (url.origin !== "https://return.invalid") return FALLBACK;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return FALLBACK;
  }
}

export function loginHref(next: string): string {
  return `/login?${new URLSearchParams({ next: safeReturnPath(next) })}`;
}

export function currentToolPath(): string {
  return safeReturnPath(`${window.location.pathname}${window.location.search}${window.location.hash || "#try"}`);
}

export function navigateToLogin(next: string): void {
  window.location.assign(loginHref(next));
}

export function subscribeToLocation(change: () => void): () => void {
  window.addEventListener("popstate", change);
  window.addEventListener("hashchange", change);
  return () => { window.removeEventListener("popstate", change); window.removeEventListener("hashchange", change); };
}
