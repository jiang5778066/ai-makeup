type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var __rateLimitBuckets: Map<string, Bucket> | undefined;
}

function buckets() {
  global.__rateLimitBuckets ??= new Map<string, Bucket>();
  return global.__rateLimitBuckets;
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const store = buckets();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { ok: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
