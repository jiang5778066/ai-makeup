export function safeNextPath(value: string | null, fallback = "/dashboard"): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

export function withTryFragment(path: string): string {
  const url = new URL(path, "https://makeup.invalid");
  url.hash = "try";
  return `${url.pathname}${url.search}${url.hash}`;
}

export function loginRedirectUrl(path: string): string {
  return `/login?next=${encodeURIComponent(withTryFragment(path))}`;
}
