export function isSameOriginRequest(request: Request): boolean {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
